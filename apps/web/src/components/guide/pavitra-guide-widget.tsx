"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  detectGuideLanguage,
  fetchGuideBootstrap,
  formatGuidePrice,
  postGuideChat,
  type GuideBootstrap,
  type GuideLanguage,
  type GuideMessage,
  type GuideProductCard,
  type GuideSuggestion,
} from "@/lib/guide/api";
import { trackGuideEvent } from "@/lib/guide/analytics";

const INVITE_KEY = "ps_guide_invite_dismissed_v1";

type Props = {
  initialLocale?: "en" | "te";
};

export function PavitraGuideWidget({ initialLocale = "en" }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [language, setLanguage] = useState<GuideLanguage>(initialLocale);
  const [bootstrap, setBootstrap] = useState<GuideBootstrap | null>(null);
  const [messages, setMessages] = useState<GuideMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const conversationStarted = messages.length > 0;

  const hide = pathname?.startsWith("/admin") || pathname?.startsWith("/login");

  useEffect(() => {
    if (hide) return;
    try {
      const dismissed = window.localStorage.getItem(INVITE_KEY) === "1";
      if (!dismissed) {
        const t = window.setTimeout(() => setShowInvite(true), 1600);
        return () => window.clearTimeout(t);
      }
    } catch {
      setShowInvite(true);
    }
  }, [hide]);

  const ensureBootstrap = useCallback(async (lang: GuideLanguage) => {
    const data = await fetchGuideBootstrap(lang);
    setBootstrap(data);
    setLoaded(true);
    return data;
  }, []);

  const seedWelcome = useCallback((data: GuideBootstrap) => {
    setMessages([
      {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: `${data.welcomeTitle}\n\n${data.welcomeBody}`,
        suggestions: data.suggestions,
      },
    ]);
  }, []);

  const openChat = useCallback(async () => {
    setOpen(true);
    setMinimized(false);
    setShowInvite(false);
    trackGuideEvent("chat_opened");
    try {
      const data = bootstrap ?? (await ensureBootstrap(language));
      if (!conversationStarted) seedWelcome(data);
    } catch {
      setError(true);
      setLoaded(true);
    }
  }, [
    bootstrap,
    conversationStarted,
    ensureBootstrap,
    language,
    seedWelcome,
  ]);

  useEffect(() => {
    if (!open || !scrollerRef.current) return;
    scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
  }, [messages, open, busy]);

  async function changeLanguage(next: GuideLanguage) {
    setLanguage(next);
    trackGuideEvent("language_changed", { language: next });
    try {
      const data = await ensureBootstrap(next);
      if (!conversationStarted) seedWelcome(data);
    } catch {
      /* keep UI */
    }
  }

  function newConversation() {
    if (!bootstrap) return;
    setError(false);
    seedWelcome(bootstrap);
    trackGuideEvent("chat_opened", { reset: true });
  }

  async function ask(prompt: string, meta?: { suggestion?: boolean }) {
    const text = prompt.trim();
    if (!text || busy) return;

    const detected = detectGuideLanguage(text, language);
    if (detected !== language) {
      setLanguage(detected);
      try {
        await ensureBootstrap(detected);
      } catch {
        /* continue */
      }
    }

    const userMsg: GuideMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
    };
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setBusy(true);
    setError(false);

    trackGuideEvent(meta?.suggestion ? "suggestion_clicked" : "question_asked");
    if (/festival|chaturthi|navratri|diwali|ugadi|పండుగ|त्योहार/i.test(text)) {
      trackGuideEvent("festival_question");
    }
    if (/pooja|puja|పూజ|पूजा/i.test(text)) {
      trackGuideEvent("pooja_question");
    }

    try {
      const res = await postGuideChat({
        message: text,
        language: detected,
        history,
      });
      if (res.products?.length) {
        trackGuideEvent("kit_recommendation_shown", {
          count: res.products.length,
        });
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: res.reply,
          products: res.products,
          suggestions: res.suggestions,
        },
      ]);
    } catch {
      setError(true);
      setMessages((prev) => [
        ...prev,
        {
          id: `a-err-${Date.now()}`,
          role: "assistant",
          content:
            language === "te"
              ? "🙏 ప్రస్తుతం సమాధానం ఇవ్వడంలో ఇబ్బంది ఉంది. దయచేసి మళ్లీ ప్రయత్నించండి, లేదా పూజా / పండుగ విభాగాలు చూడండి."
              : language === "hi"
                ? "🙏 अभी उत्तर देने में समस्या हो रही है। कृपया फिर कोशिश करें, या पूजा / त्योहार अनुभाग देखें।"
                : "🙏 I’m having trouble responding right now.\n\nPlease try again, or explore our Pooja and Festival sections.",
          suggestions: [
            { id: "kits", label: "🛍️ Explore Pooja Kits", prompt: "__link__/kits" },
            {
              id: "festivals",
              label: "🪔 Explore Festivals",
              prompt: "__link__/festivals",
            },
          ],
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void ask(input);
  }

  function dismissInvite() {
    setShowInvite(false);
    trackGuideEvent("invite_dismissed");
    try {
      window.localStorage.setItem(INVITE_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  const whatsappUrl = useMemo(() => {
    if (bootstrap?.whatsappUrl) return bootstrap.whatsappUrl;
    const raw = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP ?? "";
    const digits = raw.replace(/\D/g, "");
    return digits ? `https://wa.me/${digits}` : null;
  }, [bootstrap]);

  if (hide) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[90] flex justify-end p-3 sm:p-5">
      <div className="pointer-events-auto flex max-w-full flex-col items-end gap-3">
        {showInvite && !open ? (
          <div className="w-[min(100vw-1.5rem,320px)] rounded-2xl border border-gold/50 bg-cream p-4 shadow-[0_12px_40px_rgba(79,20,20,0.18)]">
            <p className="text-sm leading-relaxed text-maroon-ink">
              {bootstrap?.inviteBubble ??
                "🙏 Need help understanding a Pooja or festival?"}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-orange !px-3 !py-2 text-sm"
                onClick={() => {
                  trackGuideEvent("invite_accepted");
                  void openChat();
                }}
              >
                Ask Pavitra Seva Guide
              </button>
              <button
                type="button"
                className="rounded-full border border-divider bg-paper px-3 py-2 text-sm font-semibold text-maroon"
                onClick={dismissInvite}
              >
                Maybe Later
              </button>
            </div>
          </div>
        ) : null}

        {open && !minimized ? (
          <section
            aria-label="Pavitra Seva Guide"
            className="flex h-[min(92dvh,650px)] w-[min(100vw-1.5rem,400px)] flex-col overflow-hidden rounded-2xl border border-gold/40 bg-cream shadow-[0_18px_50px_rgba(79,20,20,0.22)] max-sm:fixed max-sm:inset-3 max-sm:h-auto max-sm:w-auto"
          >
            <header className="bg-gradient-to-br from-maroon to-maroon-deep px-4 py-3 text-cream">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-display text-lg leading-tight">
                    🙏 Pavitra Seva Guide
                  </p>
                  <p className="text-xs text-gold-bright">Your Divine Companion</p>
                  <p className="mt-1 text-[11px] text-cream/80">
                    {bootstrap?.statusLine ??
                      "Ask me about Poojas, festivals, rituals & Samagri."}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <LangToggle value={language} onChange={changeLanguage} />
                  <IconButton
                    label="New conversation"
                    onClick={newConversation}
                  >
                    ✦
                  </IconButton>
                  <IconButton
                    label="Minimize"
                    onClick={() => {
                      setMinimized(true);
                      trackGuideEvent("chat_minimized");
                    }}
                  >
                    –
                  </IconButton>
                  <IconButton
                    label="Close"
                    onClick={() => {
                      setOpen(false);
                      trackGuideEvent("chat_closed");
                    }}
                  >
                    ×
                  </IconButton>
                </div>
              </div>
            </header>

            <div
              ref={scrollerRef}
              className="flex-1 space-y-3 overflow-y-auto px-3 py-4"
            >
              {!loaded && !error ? (
                <p className="text-sm text-muted">Opening your guide…</p>
              ) : null}
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  onSuggestion={(item) => {
                    if (item.prompt.startsWith("__link__")) {
                      window.location.href = item.prompt.replace("__link__", "");
                      return;
                    }
                    void ask(item.prompt, { suggestion: true });
                  }}
                  whatsappUrl={whatsappUrl}
                />
              ))}
              {busy ? <TypingIndicator /> : null}
            </div>

            <form
              onSubmit={onSubmit}
              className="border-t border-divider bg-paper px-3 py-3"
            >
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    language === "te"
                      ? "ఏదైనా అడగండి…"
                      : language === "hi"
                        ? "कुछ भी पूछें…"
                        : "Ask anything…"
                  }
                  className="input-ps flex-1 !rounded-full !py-2.5 text-sm"
                  disabled={busy}
                  aria-label="Message Pavitra Seva Guide"
                />
                <button
                  type="submit"
                  className="btn-maroon !rounded-full !px-4"
                  disabled={busy || !input.trim()}
                >
                  Send
                </button>
              </div>
            </form>
          </section>
        ) : null}

        <button
          type="button"
          onClick={() => {
            if (open && minimized) {
              setMinimized(false);
              return;
            }
            if (open) {
              setOpen(false);
              trackGuideEvent("chat_closed");
              return;
            }
            void openChat();
          }}
          className="inline-flex items-center gap-2 rounded-full border border-gold bg-maroon px-4 py-3 text-sm font-semibold text-cream shadow-[0_10px_28px_rgba(143,23,36,0.35)] transition hover:bg-maroon-deep"
          aria-expanded={open && !minimized}
        >
          <span aria-hidden>🙏</span>
          <span>Pavitra Seva Guide</span>
        </button>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  onSuggestion,
  whatsappUrl,
}: {
  message: GuideMessage;
  onSuggestion: (item: GuideSuggestion) => void;
  whatsappUrl: string | null;
}) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "rounded-br-md bg-orange text-cream"
            : "rounded-bl-md border border-divider bg-paper text-body"
        }`}
      >
        {!isUser ? (
          <p className="mb-1 text-[10px] font-semibold tracking-wide text-maroon uppercase">
            Pavitra Seva Guide
          </p>
        ) : null}
        {message.content}
        {message.products?.length ? (
          <div className="mt-3 space-y-2">
            {message.products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        ) : null}
        {message.suggestions?.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.suggestions.map((item) => (
              <button
                key={item.id}
                type="button"
                className="rounded-full border border-gold/60 bg-blush px-3 py-1.5 text-left text-xs font-semibold text-maroon"
                onClick={() => onSuggestion(item)}
              >
                {item.label}
              </button>
            ))}
          </div>
        ) : null}
        {!isUser && whatsappUrl && message.products?.length ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex text-xs font-semibold text-orange underline"
            onClick={() => trackGuideEvent("whatsapp_clicked")}
          >
            Need help placing your order? Continue on WhatsApp
          </a>
        ) : null}
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: GuideProductCard }) {
  return (
    <article className="overflow-hidden rounded-xl border border-divider bg-cream">
      <div className="flex gap-3 p-2">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#fff8ef]">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt=""
              fill
              sizes="64px"
              unoptimized={product.imageUrl.startsWith("http")}
              className="object-contain p-1"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-lg">🪔</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-maroon">{product.name}</p>
          <p className="price text-sm font-semibold">
            {formatGuidePrice(product.priceMinor, product.currency)}
          </p>
          {product.description ? (
            <p className="mt-0.5 line-clamp-2 text-[11px] text-muted">
              {product.description}
            </p>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-2">
            <Link
              href={product.productUrl}
              className="rounded-full bg-maroon px-2.5 py-1 text-[11px] font-semibold text-cream"
              onClick={() =>
                trackGuideEvent("product_clicked", { slug: product.slug })
              }
            >
              View Kit
            </Link>
            <Link
              href={`/kits/${product.slug}/extras?intent=buy`}
              className="rounded-full bg-orange px-2.5 py-1 text-[11px] font-semibold text-cream"
              onClick={() =>
                trackGuideEvent("order_clicked", { slug: product.slug })
              }
            >
              Order Now
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function LangToggle({
  value,
  onChange,
}: {
  value: GuideLanguage;
  onChange: (lang: GuideLanguage) => void;
}) {
  const options: Array<{ id: GuideLanguage; label: string }> = [
    { id: "en", label: "EN" },
    { id: "te", label: "తె" },
    { id: "hi", label: "हिं" },
  ];
  return (
    <div className="mr-1 flex overflow-hidden rounded-full border border-cream/40 bg-maroon-deep/40 text-[10px] font-semibold">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          className={`min-w-[1.75rem] px-2 py-1 ${
            value === opt.id ? "bg-gold text-maroon" : "text-cream/90 hover:bg-cream/10"
          }`}
          onClick={() => onChange(opt.id)}
          aria-pressed={value === opt.id}
          aria-label={`Language ${opt.label}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="grid h-7 w-7 place-items-center rounded-full border border-cream/25 text-sm text-cream hover:bg-cream/10"
    >
      {children}
    </button>
  );
}

function TypingIndicator() {
  return (
    <div className="inline-flex items-center gap-1 rounded-2xl border border-divider bg-paper px-3 py-2">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-maroon" />
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-maroon [animation-delay:120ms]" />
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-maroon [animation-delay:240ms]" />
    </div>
  );
}

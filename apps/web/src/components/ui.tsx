import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { CornerFlourish, LotusDivider } from "@/components/ornaments";
import { t } from "@/lib/copy";
import type { Locale } from "@/lib/types";

export function BrandMark({
  size = 40,
  className = "",
  priority = false,
}: {
  size?: number | "fill";
  className?: string;
  priority?: boolean;
}) {
  const fill = size === "fill";
  return (
    <span
      className={`brand-mark relative block overflow-hidden rounded-full ${className}`}
      style={fill ? undefined : { width: size, height: size }}
    >
      <Image
        src="/images/brand/pavitra_seva_seal.png"
        alt=""
        width={fill ? 800 : Number(size) * 2}
        height={fill ? 800 : Number(size) * 2}
        priority={priority}
        className="h-full w-full object-cover object-center"
      />
    </span>
  );
}

export function BrandWordmark({
  locale,
  onDark = false,
  stacked = false,
  className = "",
}: {
  locale: Locale;
  onDark?: boolean;
  stacked?: boolean;
  className?: string;
}) {
  const parts = t(locale, "brand").split(/\s+/);
  const last = parts.pop() ?? "";
  const first = parts.join(" ");
  const firstCls = onDark ? "text-cream" : "text-maroon";
  if (stacked) {
    return (
      <span className={`font-display tracking-wide ${className}`}>
        {first ? <span className={`block ${firstCls}`}>{first}</span> : null}
        <span className="block text-orange">{last}</span>
      </span>
    );
  }
  return (
    <span className={`font-display tracking-wide ${className}`}>
      {first ? <span className={firstCls}>{first} </span> : null}
      <span className="text-orange">{last}</span>
    </span>
  );
}

export function Garland({ className = "" }: { className?: string }) {
  return <LotusDivider className={className} />;
}

export function Kicker({
  children,
  light = false,
}: {
  children: ReactNode;
  light?: boolean;
}) {
  return (
    <p
      className={`text-[11px] font-semibold tracking-[0.22em] uppercase ${
        light ? "text-gold-bright" : "text-maroon"
      }`}
    >
      {children}
    </p>
  );
}

export function SectionTitle({
  kicker,
  title,
  action,
}: {
  kicker?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
      <div>
        {kicker ? <Kicker>{kicker}</Kicker> : null}
        <h2 className="font-display mt-1 text-[1.85rem] leading-tight text-maroon md:text-[2.15rem]">
          {title}
        </h2>
        <LotusDivider className="mt-3" />
      </div>
      {action}
    </div>
  );
}

export function PrimaryButton({
  href,
  children,
  variant = "orange",
}: {
  href: string;
  children: ReactNode;
  variant?: "gold" | "maroon" | "orange";
}) {
  const cls =
    variant === "maroon" ? "btn-maroon" : variant === "gold" ? "btn-gold" : "btn-orange";
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

export function GoldButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className="btn-outline-gold">
      {children}
    </Link>
  );
}

export function PageHero({
  kicker,
  title,
  subtitle,
  compact = false,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
  compact?: boolean;
}) {
  return (
    <section className="hero-wash relative overflow-hidden text-cream">
      <CornerFlourish
        className={`pointer-events-none absolute left-3 opacity-70 ${
          compact ? "top-3 h-10 w-10 md:left-6 md:h-12 md:w-12" : "top-6 h-16 w-16 md:left-8 md:h-20 md:w-20"
        }`}
      />
      <CornerFlourish
        flip
        className={`pointer-events-none absolute right-3 opacity-70 ${
          compact ? "top-3 h-10 w-10 md:right-6 md:h-12 md:w-12" : "top-6 h-16 w-16 md:right-8 md:h-20 md:w-20"
        }`}
      />
      <div
        className={`relative mx-auto max-w-6xl px-5 ${
          compact ? "py-6 md:py-8" : "py-14 md:py-20"
        }`}
      >
        <Kicker light>{kicker}</Kicker>
        <h1
          className={`font-display mt-2 max-w-3xl leading-[1.12] ${
            compact ? "text-3xl md:text-4xl" : "mt-4 text-4xl md:text-5xl"
          }`}
        >
          {title}
        </h1>
        {compact ? null : <LotusDivider light className="mt-5" />}
        {subtitle ? (
          <p
            className={`max-w-2xl text-cream/80 ${
              compact ? "mt-1.5 text-sm" : "mt-4 text-sm leading-relaxed md:text-base"
            }`}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
    </section>
  );
}

export function EmptyNote({ children }: { children: ReactNode }) {
  return (
    <div className="card-temple px-6 py-12 text-center">
      <LotusDivider className="mx-auto mb-4" />
      <p className="text-sm leading-relaxed text-muted">{children}</p>
    </div>
  );
}

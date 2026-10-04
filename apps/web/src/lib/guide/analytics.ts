export type GuideAnalyticsEvent =
  | "chat_opened"
  | "chat_closed"
  | "chat_minimized"
  | "suggestion_clicked"
  | "question_asked"
  | "festival_question"
  | "pooja_question"
  | "kit_recommendation_shown"
  | "product_clicked"
  | "order_clicked"
  | "whatsapp_clicked"
  | "language_changed"
  | "invite_accepted"
  | "invite_dismissed";

/** Lightweight analytics — pushes to dataLayer when present; never stores PII. */
export function trackGuideEvent(
  event: GuideAnalyticsEvent,
  props?: Record<string, string | number | boolean | undefined>,
) {
  if (typeof window === "undefined") return;
  const payload = {
    event: `ps_guide_${event}`,
    guide_event: event,
    ...props,
  };
  const w = window as Window & {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  };
  w.dataLayer?.push(payload);
  if (typeof w.gtag === "function") {
    w.gtag("event", event, props ?? {});
  }
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.debug("[guide]", event, props ?? {});
  }
}

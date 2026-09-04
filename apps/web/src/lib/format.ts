export function formatMoney(minor: number, currency = "INR") {
  const major = minor / 100;
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: major >= 100 ? 0 : 2,
    }).format(major);
  } catch {
    return `₹${major.toFixed(0)}`;
  }
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "PS";
  return parts
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export function daysUntil(target: Date) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const days = Math.round((day.getTime() - today.getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "In 1 day";
  return `In ${days} days`;
}

export function formatWhen(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatSlot(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function apiErrorMessage(payload: unknown, fallback = "Something went wrong") {
  if (!payload || typeof payload !== "object") return fallback;
  const rec = payload as Record<string, unknown>;
  if (typeof rec.message === "string") return rec.message;
  if (Array.isArray(rec.message)) return rec.message.join(", ");
  if (typeof rec.error === "string") return rec.error;
  return fallback;
}

export function formatMoney(minor: number, currency?: string | null) {
  const code = currency || "INR";
  const major = minor / 100;
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: code,
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

/** Google/Apple sign-in stores a synthetic +91 5xxxxxxxx number, not a real mobile. */
export function isPlaceholderMobile(phone?: string | null) {
  const digits = (phone ?? "").replace(/\D/g, "");
  return digits.length === 12 && digits.startsWith("915");
}

export function formatMobile(...candidates: Array<string | null | undefined>) {
  for (const phone of candidates) {
    if (!phone || isPlaceholderMobile(phone)) continue;
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 12 && digits.startsWith("91")) {
      const national = digits.slice(2);
      return `+91 ${national.slice(0, 5)} ${national.slice(5)}`;
    }
    if (digits.length === 11 && digits.startsWith("1")) {
      return `+1 ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
    }
    if (phone.startsWith("+")) return phone;
  }
  return "Not on file";
}

export function formatOrderStamp(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
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

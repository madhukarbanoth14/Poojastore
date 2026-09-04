import type { Order, TrackingStep } from "./types";

export const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING_PAYMENT: "Awaiting payment",
  PAID: "Paid",
  FULFILLING: "Preparing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
  FAILED: "Failed",
};

export function orderStatusLabel(status: string) {
  return ORDER_STATUS_LABEL[status] ?? status.replace(/_/g, " ");
}

export function itemName(item: { productName?: string; name?: string }) {
  return item.productName ?? item.name ?? "Pooja item";
}

export function summarizeOrder(order: Order) {
  const items = order.items ?? [];
  const count = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const kit = items.find((item) => /kit/i.test(itemName(item)));
  const title = kit
    ? itemName(kit)
    : items.length === 1
      ? itemName(items[0]!)
      : "Pooja samagri";
  const extra = kit && items.length > 1 ? items.length - 1 : 0;
  const subtitle =
    items.length <= 1
      ? `${count} item${count === 1 ? "" : "s"}`
      : extra
        ? `+ ${extra} more`
        : `${items.length} items`;
  return { title, subtitle, count, items };
}

export function currentTrackingStep(steps: TrackingStep[] | undefined) {
  if (!steps?.length) return null;
  const done = [...steps].reverse().find((step) => step.done);
  return done ?? steps[0] ?? null;
}

export function statusTone(status: string) {
  if (status === "DELIVERED") return "bg-blush text-maroon";
  if (status === "CANCELLED" || status === "REFUNDED" || status === "FAILED") {
    return "bg-divider text-muted";
  }
  if (status === "SHIPPED" || status === "FULFILLING" || status === "PAID") {
    return "bg-orange text-cream";
  }
  return "border border-gold bg-paper text-maroon";
}

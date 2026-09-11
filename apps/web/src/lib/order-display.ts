import type { Order, TrackingStep } from "./types";

export const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING_PAYMENT: "Awaiting payment",
  PAID: "Paid",
  FULFILLING: "Being Prepared",
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

export const CUSTOMER_TRACKING_CODES = [
  "PLACED",
  "PAID",
  "CONFIRMED",
  "VENDOR_ASSIGNED",
  "SHIPPED",
  "DELIVERED",
] as const;

const TRACKING_DISPLAY: Record<string, string> = {
  PLACED: "Order Placed",
  PAID: "Payment Confirmed",
  CONFIRMED: "Order Confirmed",
  VENDOR_ASSIGNED: "Being Prepared",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

export function trackingDisplayLabel(step: TrackingStep) {
  return TRACKING_DISPLAY[step.code] ?? step.label;
}

export function visibleTrackingSteps(order: Order): TrackingStep[] {
  const steps = order.tracking?.steps ?? [];
  const closed = ["CANCELLED", "REFUNDED"].includes(order.status);
  const allowed = closed
    ? new Set(["PLACED", "PAID", order.status])
    : new Set<string>(CUSTOMER_TRACKING_CODES);
  return steps.filter((step) => allowed.has(step.code));
}

export function summaryStatusLabel(order: Order) {
  if (order.status === "PENDING_PAYMENT") return orderStatusLabel(order.status);
  if (["CANCELLED", "REFUNDED", "FAILED"].includes(order.status)) {
    return orderStatusLabel(order.status);
  }
  const current = currentTrackingStep(visibleTrackingSteps(order));
  if (current?.code === "PAID" && !current.done) return "Awaiting payment";
  return current ? trackingDisplayLabel(current) : orderStatusLabel(order.status);
}

export function summaryStatusTone(order: Order) {
  const label = summaryStatusLabel(order);
  if (label === "Delivered") return "bg-blush text-maroon";
  if (["Cancelled", "Refunded", "Failed"].includes(label)) return "bg-divider text-muted";
  if (
    label === "Shipped" ||
    label === "Being Prepared" ||
    label === "Payment Confirmed" ||
    label === "Awaiting payment"
  ) {
    return "bg-orange text-cream";
  }
  return "border border-gold/70 bg-paper text-maroon";
}

export function itemVariant(item: NonNullable<Order["items"]>[number]) {
  const extras = item.metadata?.selectedItems?.filter(Boolean) ?? [];
  if (extras.length) {
    return extras.length <= 2 ? extras.join(", ") : `${extras.length} extras added`;
  }
  if (item.metadata?.fulfillment === "family") return "Family delivery";
  if (item.metadata?.fulfillment === "refer") return "Gifted kit";
  const name = itemName(item);
  if (/mini/i.test(name)) return "Mini kit";
  if (/mega/i.test(name)) return "Mega kit";
  if (/kit/i.test(name)) return "Pooja Kit";
  return "Samagri";
}

export function orderStatusMessage(order: Order) {
  const label = summaryStatusLabel(order);
  if (order.status === "PENDING_PAYMENT") {
    return "Complete payment to confirm this Pooja Kit order.";
  }
  if (order.status === "CANCELLED") {
    return "This order was cancelled. If you paid, a refund will follow.";
  }
  if (order.status === "REFUNDED") {
    return "This order was refunded. The amount is being returned to your original payment method.";
  }
  if (order.status === "FAILED") {
    return "This order could not be completed. Please place a new order if you still need the kit.";
  }
  if (order.status === "DELIVERED" || label === "Delivered") {
    return "Your Pooja Kit has been delivered. We hope it brings a blessed puja.";
  }
  if (order.status === "SHIPPED" || label === "Shipped") {
    return "Your Pooja Kit is on its way. Keep this page handy for delivery updates.";
  }
  if (label === "Being Prepared") {
    return "Your Pooja Kit is being carefully prepared and will be ready for dispatch soon.";
  }
  if (label === "Order Confirmed") {
    return "Your order is confirmed. We will start preparing your Pooja Kit shortly.";
  }
  if (label === "Paid" || label === "Payment Confirmed") {
    return "Payment is confirmed. We will confirm your order and begin preparation next.";
  }
  return "Track your Pavitra Seva order from confirmation to delivery.";
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

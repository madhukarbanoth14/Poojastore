import { Suspense } from "react";
import { CheckoutPageInner } from "./checkout-client";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ resume?: string; payu?: string }>;
}) {
  const params = await searchParams;
  return (
    <Suspense fallback={<p className="py-16 text-center text-muted">Loading checkout…</p>}>
      <CheckoutPageInner
        resumePay={params.resume === "1"}
        payuFailed={params.payu === "failed"}
      />
    </Suspense>
  );
}

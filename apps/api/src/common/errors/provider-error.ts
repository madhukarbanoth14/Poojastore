/** Reads messages from Nest, Razorpay, Stripe, and similar thrown payloads. */
export function providerErrorMessage(
  err: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (!err || typeof err !== 'object') {
    return typeof err === 'string' && err.trim() ? err : fallback;
  }
  const body = err as {
    message?: unknown;
    error?: { description?: string; reason?: string; message?: string };
    description?: string;
    statusCode?: number;
  };
  const nested =
    body.error?.description ||
    body.error?.reason ||
    body.error?.message ||
    body.description;
  if (typeof nested === 'string' && nested.trim()) return nested.trim();
  if (typeof body.message === 'string' && body.message.trim()) {
    return body.message.trim();
  }
  if (err instanceof Error && err.message.trim()) return err.message.trim();
  return fallback;
}

export function providerHttpStatus(err: unknown): number | undefined {
  if (!err || typeof err !== 'object') return undefined;
  const raw =
    (err as { statusCode?: number | string; status?: number | string })
      .statusCode ?? (err as { status?: number | string }).status;
  const status = typeof raw === 'string' ? Number(raw) : raw;
  return typeof status === 'number' && status >= 400 && status < 600
    ? status
    : undefined;
}

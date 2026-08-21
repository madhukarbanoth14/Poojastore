import * as Sentry from '@sentry/node';

export function initSentry() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return false;

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? 'development',
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),
    enabled: process.env.SENTRY_ENABLED !== 'false',
  });
  return true;
}

export function attachSentry(app: { getHttpAdapter: () => { getInstance: () => unknown } }) {
  if (!process.env.SENTRY_DSN) return;
  Sentry.setupExpressErrorHandler(app.getHttpAdapter().getInstance() as never);
}

export { Sentry };

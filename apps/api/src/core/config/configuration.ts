export default () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  apiPrefix: process.env.API_PREFIX ?? 'api',
  apiVersion: process.env.API_VERSION ?? '1',
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessTtlSeconds: parseInt(process.env.JWT_ACCESS_TTL_SECONDS ?? '900', 10),
    refreshTtlSeconds: parseInt(
      process.env.JWT_REFRESH_TTL_SECONDS ?? '2592000',
      10,
    ),
  },
  otp: {
    length: parseInt(process.env.OTP_LENGTH ?? '6', 10),
    ttlSeconds: parseInt(process.env.OTP_TTL_SECONDS ?? '300', 10),
    maxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS ?? '5', 10),
    maxRequestsPerHour: parseInt(
      process.env.OTP_MAX_REQUESTS_PER_HOUR ?? '5',
      10,
    ),
    returnInResponse: process.env.OTP_RETURN_IN_RESPONSE === 'true',
  },
  smsProvider: process.env.SMS_PROVIDER ?? 'console',
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID ?? '',
    authToken: process.env.TWILIO_AUTH_TOKEN ?? '',
    fromNumber: process.env.TWILIO_FROM_NUMBER ?? '',
    messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID ?? '',
  },
  corsOrigins: (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean),
  swaggerEnabled: process.env.SWAGGER_ENABLED !== 'false',
  sentry: {
    dsn: process.env.SENTRY_DSN ?? '',
    enabled: process.env.SENTRY_ENABLED !== 'false',
    tracesSampleRate: parseFloat(
      process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.1',
    ),
  },
  throttle: {
    ttlSeconds: parseInt(process.env.THROTTLE_TTL_SECONDS ?? '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT ?? '120', 10),
    otpTtlSeconds: parseInt(process.env.OTP_THROTTLE_TTL_SECONDS ?? '60', 10),
    otpLimit: parseInt(process.env.OTP_THROTTLE_LIMIT ?? '10', 10),
  },
  vedastro: {
    apiUrl:
      process.env.VEDASTRO_API_URL ??
      'https://api.vedastro.org/api/Calculate',
    apiKey: process.env.VEDASTRO_API_KEY ?? '',
  },
  meetings: {
    provider: process.env.MEETING_PROVIDER ?? 'jitsi',
    jitsiBaseUrl: process.env.JITSI_BASE_URL ?? 'https://meet.jit.si',
    zoom: {
      accountId: process.env.ZOOM_ACCOUNT_ID ?? '',
      clientId: process.env.ZOOM_CLIENT_ID ?? '',
      clientSecret: process.env.ZOOM_CLIENT_SECRET ?? '',
    },
  },
  payments: {
    mode: process.env.PAYMENT_MODE ?? 'mock', // mock (dev/test only) | live
    publicBaseUrl: process.env.PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:3000',
    razorpay: {
      keyId: process.env.RAZORPAY_KEY_ID ?? '',
      keySecret: process.env.RAZORPAY_KEY_SECRET ?? '',
      webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET ?? '',
    },
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY ?? '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
      successUrl:
        process.env.STRIPE_SUCCESS_URL ??
        'poojastore://payments/success?session_id={CHECKOUT_SESSION_ID}',
      cancelUrl:
        process.env.STRIPE_CANCEL_URL ?? 'poojastore://payments/cancel',
    },
    upi: {
      vpa: process.env.UPI_VPA ?? '',
      payeeName: process.env.UPI_PAYEE_NAME ?? 'Pavitra Seva',
      qrImageUrl: process.env.UPI_QR_IMAGE_URL ?? '',
    },
  },
  social: {
    requireIdToken: process.env.SOCIAL_AUTH_REQUIRE_ID_TOKEN === 'true',
    googleClientIds: process.env.GOOGLE_CLIENT_IDS ?? '',
    appleClientId: process.env.APPLE_CLIENT_ID ?? '',
  },
  ocr: {
    googleVisionApiKey: process.env.GOOGLE_VISION_API_KEY ?? '',
  },
  push: {
    provider: process.env.PUSH_PROVIDER ?? 'console',
    fcmServiceAccountJson: process.env.FCM_SERVICE_ACCOUNT_JSON ?? '',
  },
  email: {
    provider: process.env.EMAIL_PROVIDER ?? 'console',
    from: process.env.EMAIL_FROM ?? 'Pavitra Seva <noreply@pavitraseva.in>',
    webBaseUrl: process.env.PUBLIC_WEB_BASE_URL ?? 'https://pavitraseva.in',
    smtp: {
      host: process.env.SMTP_HOST ?? '',
      port: parseInt(process.env.SMTP_PORT ?? '587', 10),
      user: process.env.SMTP_USER ?? '',
      pass: process.env.SMTP_PASS ?? '',
      secure: process.env.SMTP_SECURE === 'true',
    },
  },
  orders: {
    autoAdvance: process.env.ORDER_AUTO_ADVANCE === 'true',
  },
  vendor: {
    name: process.env.VENDOR_NAME ?? 'Packing vendor',
    phoneE164: process.env.VENDOR_PHONE_E164 ?? '',
  },
});

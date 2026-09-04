# Pavitra Seva — Website

Customer website for the Hindu spiritual marketplace. Shares the NestJS API with the Flutter app.

## Run locally

```bash
cd apps/web
cp .env.example .env.local   # points at GCP staging by default
npm install
npm run dev
```

Open http://localhost:3001 — kits, priests, panchang, and packages load from staging.

To use a local API instead, set both `API_BASE_URL` and `NEXT_PUBLIC_API_BASE_URL` to `http://127.0.0.1:3000/api/v1` in `.env.local`, then start `apps/api`. `CORS_ORIGINS` on the API must include `http://localhost:3001`.

## What it covers

- Home, puja kits, samagri, festivals, priests, panchang, packages, vidhi
- OTP login, cart, checkout (mock / Razorpay / Stripe)
- Priest booking + pujari onboarding
- English / Telugu toggle (`ps_locale` cookie, `Accept-Language`)

Staging API:

```
NEXT_PUBLIC_API_BASE_URL=https://pooja-api-staging-tcjernzh5a-el.a.run.app/api/v1
API_BASE_URL=https://pooja-api-staging-tcjernzh5a-el.a.run.app/api/v1
```

## Production (pavitraseva.in)

Hosted on Cloud Run. See [`docs/runbooks/godaddy-web-domain.md`](../../docs/runbooks/godaddy-web-domain.md).

```bash
./infra/gcp/deploy-web.sh
```

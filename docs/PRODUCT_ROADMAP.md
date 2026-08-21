# Product Roadmap — Pooja Store (Production)

Source: `docs/puja-app-product-report.pdf`  
Architecture: `docs/ARCHITECTURE.md`  
Production bar: `docs/PRODUCTION_READINESS.md`

## Delivery principle

Build a **production Hindu Spiritual Super App** for India, USA, and Canada.

- End-to-end vertical slices: schema → API → Flutter → admin/ops → tests → docs  
- **No demo shortcuts on production paths** (mock pay, console OTP, debug OTP responses)  
- A feature is done only when it is operable, secure, and supportable (see Production DoD)

## Module map

| PDF section | Module | Status | Production notes |
|-------------|--------|--------|------------------|
| Auth / profile | Authentication | Built | Needs Twilio OTP; prod gates added |
| Birth profile | Spiritual profile | Built | |
| Daily Panchang & Calendar | `panchang` | Built | Civil approximation — upgrade ephemeris + disclaimer |
| Zodiac / Rashi guidance | `horoscope` | Built | Editorial CMS for guidance content |
| Puja Vidhi Library | `vidhi` | Built | Media CDN + admin CMS |
| Kids section | `kids` | Built | Illustrated media + moderation |
| Vrat Guide | `vrat` | Built | Push reminders worker |
| Prasad Guide + order | `prasad` | Built | Live fulfillment ops |
| Puja Kits + payments | `catalog`/`orders`/`payments` | Built | Live gateways required for prod |
| Priest booking + pay | `priests` | Built | Cancel/reschedule + settlements |
| Combined packages | `packages` | Built | Vendor add-ons are catalog SKUs |
| Catering / Band / Travel | vendor marketplaces | Next | Full vendor onboarding |
| Admin dashboard | `admin` | Partial | Users only — expand to ops console |
| Donations / live / offline / community | engagement | Pending | |

## Current focus

**P0 + P1 are implemented** (payments/SMS gates, staging runbook, mobile release, admin ops hub, cancel/reschedule, Sentry/metrics, commerce e2e, panchang disclaimer).

Next: **P2** — vendor onboarding, donations/gifting, community/live/offline, Hindi + more locales, dedicated admin web (`apps/admin`).

See `docs/PRODUCTION_READINESS.md`, `docs/features/09-ops-cancel-admin-observability.md`, and `docs/runbooks/staging-deploy.md`.

## Payment design (production)

- Amounts as **integer minor units**
- Market selects gateway: IN → Razorpay, US/CA → Stripe  
- `PAYMENT_MODE=live` required in production; mock confirm disabled  
- Webhooks are source of truth for `PAID` / `FAILED`  
- Idempotent confirmation by `providerPaymentId`

# Production Readiness — Pooja Store

**Bar:** Ship a production Hindu Spiritual Super App for IN / US / CA — not an MVP demo.  
Every feature must be operable, secure, observable, and supportable in production.

## Current state

| Area | Status |
|------|--------|
| Payments | Live mode required in prod; signed webhooks; idempotent events; admin refunds; mock confirm blocked |
| OTP / SMS | Twilio adapter; console only for non-prod; IP + phone Redis limits; OTP route throttle |
| Ops | GCP staging (`asia-south1`) + [gcp-staging.md](runbooks/gcp-staging.md) |
| Mobile release | `scripts/build-mobile-release.sh` + mobile CI with `ALLOW_MOCK_PAYMENTS=false` |
| Admin ops | Summary, orders list, priest bookings, users; content upsert for vidhi/kids/vrat/prasad/guidance |
| Cancel / reschedule | Priest cancel + reschedule; package cancel (cascades priest slot) |
| Observability | Pino logs, `/health/live|ready|metrics`, optional Sentry (`SENTRY_DSN`) |
| Tests | Auth e2e + commerce e2e (checkout, priest cancel) + unit coverage for payments/cancel/env |
| Panchang | Civil approximation + API/Flutter disclaimer |
| i18n | English + Telugu UI; kits/vidhi/kids follow locale — [10-i18n.md](features/10-i18n.md) |

## Delivery principle

1. **No demo shortcuts in production paths**
2. **Production gates in code**
3. **Feature complete means operable**
4. **Accuracy & trust** with disclosed methods
5. **Multi-market** first-class

## Workstreams

### P0 — Launch blockers — done
1. Production config hard-fail  
2. Live payment webhook verification + refund flows  
3. Twilio OTP adapter + rate-limit review  
4. Staging environment + migrate/seed/deploy runbook  
5. Flutter release pipeline with `ALLOW_MOCK_PAYMENTS=false`

### P1 — Trust & ops — done
6. Admin ops APIs + Flutter admin hub (orders, bookings, users, summary)  
7. Cancel/reschedule priest & cancel package bookings  
8. Observability: Sentry (optional), `/health/metrics`, pino  
9. Expanded automated tests (commerce e2e + cancel unit)  
10. Panchang disclaimer UX + accuracy flag in API  

### P2 — Platform growth
11. Vendor marketplace onboarding (catering/band/travel)  
12. Donations + gifting  
13. Offline downloads / live streaming / community  
14. Full i18n (en/te) — Flutter UI + language switcher + localized kits/vidhi/kids  
15. Dedicated `apps/admin` web console (beyond mobile ops hub)  

## Definition of Done (production feature)

- [ ] Schema + migrations reviewed for indexes/constraints
- [ ] API authZ correct; public vs private routes intentional
- [ ] Failure modes handled (payment fail, slot race, idempotency)
- [ ] Admin or ops path exists for support
- [ ] Tests cover critical paths
- [ ] Docs updated (`docs/features/*`, runbook notes)
- [ ] No reliance on mock/console in production config

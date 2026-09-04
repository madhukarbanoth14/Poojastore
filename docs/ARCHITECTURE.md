# Pooja Store — Architecture

**Status:** Living document  
**Last updated:** 2026-08-13  
**Phase:** P0 + P1 complete; P2 growth  
Product report roadmap: `docs/PRODUCT_ROADMAP.md`  
Production bar: `docs/PRODUCTION_READINESS.md`  
Ops feature: `docs/features/09-ops-cancel-admin-observability.md`

## 1. Vision

Pooja Store is a Hindu Spiritual Super App for India, USA, and Canada. The platform must scale to millions of users with clear bounded contexts, horizontal scalability, and strict security controls. **We build production systems — not MVP demos.**

## 2. Repository layout (monorepo)

```
apps/
  api/          NestJS backend (Clean Architecture + feature modules)
  mobile/       Flutter customer (and role-gated admin) app
  web/          Next.js customer website (catalog, panchang, priests, checkout)
  admin/        Reserved for dedicated admin web console
packages/       Shared contracts (OpenAPI types, lint configs) — future
docs/
  ARCHITECTURE.md
  PRODUCTION_READINESS.md
  features/     Per-feature specs (FR, schema, API, tests)
legacy/         Prior Expo prototype (non-production)
```

The previous Expo/React Native prototype remains at the repo root for reference and will be moved under `legacy/expo-prototype` once Flutter reaches production parity for core modules.

## 3. Tech stack

| Layer | Choice |
|-------|--------|
| Mobile | Flutter (stable), Material 3, dark mode |
| Web | Next.js 15, App Router, Tailwind |
| API | NestJS 11, TypeScript strict |
| DB | PostgreSQL 16 |
| ORM | Prisma 6 |
| Cache / OTP rate limits / token denylist | Redis 7 |
| Auth | JWT access + rotating refresh tokens, OTP login |
| Docs | OpenAPI / Swagger (`/docs`) |
| Deploy | Docker, GitHub Actions, GCP (`asia-south1`) |

## 4. Backend architecture

Each feature module follows Clean Architecture:

```
modules/<feature>/
  domain/           Entities, value objects, repository ports (no Nest/Prisma)
  application/      Use cases / application services
  infrastructure/   Prisma repos, Redis, SMS/email adapters
  presentation/     Controllers, DTOs, Swagger
```

**Dependency rule:** `presentation` → `application` → `domain` ← `infrastructure`

Cross-cutting concerns live in:

- `core/` — Config, Prisma, Redis, logging
- `common/` — Filters, guards, decorators, interceptors

### Cross-cutting capabilities

- URI API versioning: `/api/v1/...`
- DTO validation via `class-validator`
- RBAC guards (`@Roles(...)`)
- Global exception filter + structured logging (Pino)
- Rate limiting (`@nestjs/throttler` + Redis-backed OTP limits)
- Audit log persistence for security-sensitive actions
- Health: `/api/v1/health/live`, `/api/v1/health/ready`

## 5. Mobile architecture

Feature-first Clean Architecture in Flutter:

```
lib/
  core/           theme, network, DI, routing, storage
  features/<f>/
    domain/
    data/
    presentation/
```

State: Riverpod. HTTP: Dio. Tokens: `flutter_secure_storage`. Routing: `go_router`.

## 6. Identity & roles

Roles: `CUSTOMER`, `TEMPLE`, `POOJARI`, `STORE`, `DELIVERY_PARTNER`, `ADMIN`.

Primary login: E.164 phone + OTP. JWT access token (short-lived) + refresh token (rotating, hashed at rest).

## 7. Delivery model

Vertical slices ship continuously. After core domains (auth → marketplace → panchang → vidhi → kids → priests → prasad/vrat → packages), priority is **production readiness**:

- Live payments + SMS, no mock paths in prod
- Admin/ops console, cancel/reschedule, settlements
- Vendor onboarding, observability, staging/prod runbooks
- Ephemeris accuracy, content CMS, i18n

Each feature ships with: FR doc, schema, API, Flutter UI, admin/ops hooks, validation, tests, and docs. See `docs/PRODUCTION_READINESS.md`.

## 8. Environments

| Variable group | Purpose |
|----------------|---------|
| `DATABASE_URL` | PostgreSQL |
| `REDIS_URL` | Redis |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Token signing (min 32 chars; no `change-me` in prod) |
| `OTP_*` | OTP TTL, length, max attempts |
| `SMS_PROVIDER` | `console` (dev) \| `twilio` (required in prod) |
| `PAYMENT_MODE` | `mock` (dev) \| `live` (required in prod) |
| `OTP_RETURN_IN_RESPONSE` | Must be `false` in production |
| `SWAGGER_ENABLED` | Must be `false` in production |

See `apps/api/.env.example` and production gates in `env.validation.ts`.

## 9. ADRs

- [001 — Clean Architecture](adr/001-clean-architecture.md)
- [002 — OTP + JWT auth](adr/002-otp-jwt-auth.md)

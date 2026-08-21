# Feature 9 — Ops: cancel/reschedule, admin, observability

## Cancel / reschedule

| Method | Path | Who | Behavior |
|--------|------|-----|----------|
| POST | `/bookings/:id/cancel` | User/Admin | Cancel priest booking; free slot; suggest refund if CONFIRMED |
| POST | `/bookings/:id/reschedule` | User/Admin | Move to new open slot on same priest |
| POST | `/package-bookings/:id/cancel` | User/Admin | Cancel package + linked priest booking/slot |
| POST | `/admin/bookings/:id/cancel` | Admin | Admin cancel priest booking |
| POST | `/admin/package-bookings/:id/cancel` | Admin | Admin cancel package |

Customers cannot cancel after slot start (admins can). Package-linked priest bookings must be cancelled via the package.

## Admin ops

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/ops/summary` | Counters for orders/bookings/users |
| GET | `/admin/orders` | Paginated orders |
| GET | `/admin/bookings` | Priest bookings |
| GET | `/admin/package-bookings` | Package bookings |
| PUT | `/admin/vrats/:slug` | Upsert vrat guide |
| PUT | `/admin/prasad/:slug` | Upsert prasad recipe |

Flutter: `/admin` hub → users, orders, priest bookings.

## Observability

- `GET /health/live`, `/health/ready`, `/health/metrics`
- Optional Sentry via `SENTRY_DSN`
- Structured logs via nestjs-pino

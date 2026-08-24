# Feature 6 — Priest (Pandit) Booking

Source: `docs/puja-app-product-report.pdf` §3.B, MVP #4  
Reuses: Feature 2 payments (`PaymentOrchestrator` + mock/Razorpay/Stripe)

## Functional requirements

1. Browse active priests (city, language, specialization, rating, price).
2. View priest profile + upcoming open slots.
3. Book a slot with service name, notes, and service address.
4. Create order + payment session for the booking amount (market-aware gateway).
5. On successful payment, booking becomes `CONFIRMED`; slot stays reserved.
6. On failed payment, booking `FAILED` and slot released.
7. User can list own bookings; admin can list all.

## API (`/api/v1`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/priests` | Public | Directory |
| GET | `/priests/:slug` | Public | Profile + open slots |
| POST | `/priests/:slug/bookings` | User | Create booking + payment |
| GET | `/bookings` | User | My bookings |
| GET | `/bookings/:id` | User | Booking detail |
| POST | `/bookings/:id/join` | User / Pujari | Join online consultation (Agora or meeting URL) |
| GET | `/admin/bookings` | Admin | All bookings |

## Payment link

`PriestBooking.orderId` → existing `Order` / `Payment`. Confirm path updates booking status.

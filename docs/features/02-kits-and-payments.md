# Feature 2 — Puja Kits + Payments

## Functional requirements

1. List active puja kits (filter by market / type).
2. View kit detail with itemized checklist and price.
3. Authenticated cart: add / update qty / remove.
4. Checkout with shipping address.
5. Create order + payment session for the user’s market:
   - `IN` → Razorpay
   - `US` / `CA` → Stripe
   - missing keys / `PAYMENT_MODE=mock` → Mock provider
6. Confirm payment via webhook (and client confirm for mock/dev).
7. User can list own orders and view order detail.
8. Admin can list orders.

## API (`/api/v1`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/products` | Public | List kits |
| GET | `/products/:slug` | Public | Kit detail |
| GET/PUT/PATCH/DELETE | `/cart`… | User | Cart ops |
| GET/POST | `/addresses` | User | Addresses |
| POST | `/orders/checkout` | User | Create order + payment |
| GET | `/orders` | User | My orders |
| GET | `/orders/:id` | User | Order detail |
| POST | `/payments/razorpay/webhook` | Public+signature | Razorpay capture/fail/refund (required in live) |
| POST | `/payments/stripe/webhook` | Public+signature | Stripe session/refund events (required in live) |
| POST | `/payments/:id/mock-confirm` | User | Dev confirm only (blocked in prod/live) |
| POST | `/payments/:id/refund` | Admin | Full/partial refund via provider |

Production: `PAYMENT_MODE=live`, webhook secrets required, idempotent `payment_webhook_events`, amount cross-check on capture.

- Satyanarayan Puja Kit  
- Griha Pravesh Kit  
- Vehicle Puja Kit  
- **Pooja Samagri** (`GET /products?catalog=pooja-samagri`): general kit, Ganesh homam kit, Varalakshmi vratam kit, plus individual `SAMAGRI` items from `docs/pooja_samagri.xlsx`. Telugu names live in `metadata.i18n.te`. Placeholder INR prices until vendor catalog is live.

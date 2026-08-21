# Feature 8 — Combined Puja Packages

Source: `docs/puja-app-product-report.pdf` §3.F  
Reuses: kits catalog, priest slots, prasad products, payments

## Functional requirements

1. Browse published packages (e.g. kit-only, kit+priest, full home puja).
2. Configure components at booking: kit / priest / prasad toggles (within package rules).
3. Optionally add vendor-style add-ons (catering / band / travel placeholders with prices).
4. If priest included: pick an open slot + service name.
5. Single order + payment for the whole package.
6. On payment success: package booking `CONFIRMED` and linked priest booking confirmed.
7. User can list package bookings.

## API (`/api/v1`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/packages` | Public | List packages + available addons |
| GET | `/packages/:slug` | Public | Package detail |
| POST | `/packages/:slug/book` | User | Create package booking + payment |
| GET | `/package-bookings` | User | My package bookings |

## Pricing

`sum(selected component prices + addons) − packageDiscountMinor` (floor at 0).

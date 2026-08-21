# Feature 7 — Prasad Guide + Vrat Guide

Source: `docs/puja-app-product-report.pdf` §D, §F, MVP #5

## Vrat (fasting) guide

1. Browse published vrats with rules (allowed / avoid foods).
2. See how to break the fast and associated puja.
3. List upcoming occurrence dates.
4. Authenticated users can enable a reminder preference (days-before).

## Prasad guide

1. Browse festival-wise prasad recipes (ingredients + steps).
2. Optional audio/video URL fields (text-first MVP).
3. Order prasad-only via linked `Product` (`type=PRASAD`) using existing cart/checkout.

## API (`/api/v1`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/vrats` | Public | List vrats |
| GET | `/vrats/upcoming` | Public | Next occurrences |
| GET | `/vrats/:slug` | Public | Vrat detail |
| PUT | `/vrats/:slug/reminder` | User | Set reminder preference |
| GET | `/prasad` | Public | List recipes |
| GET | `/prasad/:slug` | Public | Recipe detail |
| PUT | `/admin/vrats/:slug` | Admin | Upsert vrat |
| PUT | `/admin/prasad/:slug` | Admin | Upsert recipe |

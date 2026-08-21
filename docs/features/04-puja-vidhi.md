# Feature 4 — Puja Vidhi (How-To) Library

Source: `docs/puja-app-product-report.pdf` §B, §4, MVP #2

## Functional requirements

1. Browse published vidhis by category (festival / occasion / daily / vrat) and search.
2. Open a vidhi detail: overview, best-time hint (panchang-linked text), duration, difficulty.
3. Follow step-by-step instructions with optional transliteration + meaning.
4. Read mantras/aartis with Sanskrit, transliteration, meaning (audio/video URLs optional).
5. Show katha (story) text when present; optional katha audio URL.
6. Deep-link to related puja kit when `relatedProductSlug` is set.
7. Admin can upsert a full vidhi (metadata + replace steps/mantras).

## MVP scope (this slice)

- **Text-first** content with nullable media URL fields (audio narration, video demo, mantra audio).
- Seed 3 popular vidhis aligned with kits: Satyanarayan, Griha Pravesh, Vehicle Puja.
- Flutter: list → detail → step pager + mantras tab.
- Full offline download / multilingual packs deferred.

## API (`/api/v1`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/vidhi` | Public | List published vidhis |
| GET | `/vidhi/:slug` | Public | Detail + steps + mantras |
| PUT | `/admin/vidhi/:slug` | Admin | Upsert vidhi with steps/mantras |

## Schema

- `PujaVidhi` — catalog entry
- `VidhiStep` — ordered procedure steps
- `VidhiMantra` — mantras / aartis for the vidhi

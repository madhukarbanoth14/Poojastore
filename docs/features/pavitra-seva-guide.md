# Pavitra Seva Guide

Floating conversational assistant for festivals, Poojas, Samagri, Vidhi, kits, and Poojari booking.

## Architecture

- **Web widget** (lazy-loaded): `apps/web/src/components/guide/`
- **Same-origin AI routes** (no secrets in browser): `apps/web/src/app/api/guide/`
- **Nest module** (API consumers / Cloud Run API): `apps/api/src/modules/guide/`
- **Knowledge catalog** (data-driven): add festivals/poojas in
  - `apps/api/src/modules/guide/knowledge/catalog.ts`
  - `apps/web/src/lib/guide/knowledge-catalog.ts` (keep in sync)

Product cards always load **live** kit data from `/products/:slug` (Nest) — never invent prices.

## Environment

```bash
# Optional — without this, guide answers from verified knowledge + live kits
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini

# Optional WhatsApp handoff (E.164 or digits)
SUPPORT_WHATSAPP_E164=+91XXXXXXXXXX
# or web fallback:
NEXT_PUBLIC_SUPPORT_WHATSAPP=91XXXXXXXXXX
```

Set `OPENAI_API_KEY` / `SUPPORT_WHATSAPP_E164` on the **API** for Nest `/api/v1/guide/*`, and/or on the **web** service for Next `/api/guide/*`.

## Adding a festival or Pooja

1. Append an entry to both knowledge catalogs (`id`, `aliases`, `name`, `description`, `samagri`, `kitSlugs`, `pagePaths`).
2. Ensure `kitSlugs` exist as active products in the catalog.
3. No chatbot UI changes required.

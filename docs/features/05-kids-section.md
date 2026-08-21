# Feature 5 — Kids & Next-Generation Section

Source: `docs/puja-app-product-report.pdf` §C, MVP #3

## Functional requirements

1. Browse age-banded festival stories (why celebrated, story, importance).
2. Read illustrated page-by-page story suitable for grandparents + children.
3. Optional audio/video URL fields on stories and pages (text-first MVP).
4. Take a short quiz after a story; server scores answers.
5. Authenticated users track story completion + quiz score.
6. Admin can upsert a story with pages + quiz questions.

## MVP scope

- Seed 3 festival stories: Ganesh Chaturthi, Diwali, Holi (Junior band).
- Flutter: list → story pager → quiz → progress snackbar.
- Full animation packs / offline media deferred.

## API (`/api/v1`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/kids/stories` | Public | List published stories |
| GET | `/kids/stories/:slug` | Public | Story + pages |
| GET | `/kids/stories/:slug/quiz` | Public | Quiz (no correct answers) |
| POST | `/kids/stories/:slug/complete` | User | Mark story read |
| POST | `/kids/stories/:slug/quiz/submit` | User | Submit answers + score |
| GET | `/kids/progress` | User | My kids progress |
| PUT | `/admin/kids/stories/:slug` | Admin | Upsert story + pages + quiz |

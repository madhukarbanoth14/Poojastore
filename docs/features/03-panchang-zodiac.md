# Feature 3 — Daily Panchang & Zodiac Guidance

Source: `docs/puja-app-product-report.pdf` §A, §E, §5.1

## Functional requirements

1. User saves birth profile once: DOB, optional birth time/place, rasi, nakshatra, gotram.
2. App computes daily panchang for user’s city/timezone (or query lat/lng/timezone).
3. Panchang includes: tithi, nakshatra, yoga, karana, sunrise/sunset, moonrise/moonset, rahu kalam, yamagandam, gulika, abhijit muhurtham, amrit kalam summary, special/festival note.
4. Month calendar endpoint returns day markers (festival/special flags).
5. Personalized “what’s good for you today” from rasi guidance content + panchang context.
6. Admin can upsert rasi guidance rows and festival notes.

## API (`/api/v1`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET/PUT | `/profile/birth` | User | Birth / spiritual profile |
| GET | `/panchang/cities` | Public | City presets |
| GET | `/panchang/today` | Public* | Today’s panchang |
| GET | `/panchang/me/today` | User | Today using saved city |
| GET | `/panchang/:date` | Public* | Date panchang (`YYYY-MM-DD`) |
| GET | `/panchang/calendar` | Public* | Month overview |
| GET | `/guidance/today` | User | Personalized daily guidance |
| PUT | `/admin/guidance/:rasi/:date` | Admin | Upsert guidance |

\* Uses optional auth to prefer saved city/timezone.

## Status

Shipped 2026-08-13: Prisma models + migration, Nest module, Flutter hub (Today / Guidance / Calendar + birth profile), engine unit test, seed festivals/guidance.

## Computation notes

- Sunrise/sunset/moon via `suncalc` (location + date).
- Tithi/nakshatra/yoga/karana from sun–moon elongation model (swappable for Swiss Ephemeris later).
- Rahu/Yamaganda/Gulika/Abhijit from classical weekday day-part formulas anchored to local sunrise–sunset.
- Results cached in `panchang_days` per `(date, lat, lng, timezone)`.

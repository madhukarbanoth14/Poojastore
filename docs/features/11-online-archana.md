# Online Archana

Live temple archana over video for devotees who cannot visit on special days.

## Flow

1. Customer opens **Online Archana** from Home → More Services.
2. Chooses a **deity** (or **Any deity** if flexible).
3. Browses **temple pujaris** filtered by deity and city.
4. Schedules a slot and pays (same priest booking + payment stack).
5. At the scheduled time, customer and pujari join the **Agora video call** while archana is performed at the temple.

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/archana/deities` | Deity catalog for the picker |
| GET | `/archana/priests?deity=ganesha` | Active temple pujaris offering online archana |
| POST | `/priests/:slug/bookings` | Book with `bookingKind: ARCHANA`, `serviceMode: ONLINE`, `deitySlug` |

### Booking fields

- `bookingKind`: `ARCHANA`
- `deitySlug`: `ganesha` | `lakshmi` | `shiva` | `vishnu` | `durga` | `hanuman` | `any`
- `serviceMode`: must be `ONLINE`
- `consultationMedia`: defaults to `VIDEO` for archana

## Priest profile fields

- `offersOnlineArchana`: temple pujaris eligible for this service
- `templeName`: displayed in the archana priest list
- `archanaDeities`: deities this pujari performs (empty = any deity)

## Mobile routes

- `/archana` — service intro
- `/archana/deity` — deity picker
- `/archana/priests?deity=` — temple pujari list
- `/priests/:slug/book?mode=online&kind=archana&deity=` — schedule slot
- `/consultation/:bookingId` — Agora video call (see `docs/features/10-agora-consultations.md`)

## Related

- Priest booking: `docs/features/06-priest-booking.md`
- Agora setup: `docs/features/10-agora-consultations.md`

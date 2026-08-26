# Agora consultations (online pujari bookings)

Online priest bookings can use [Agora](https://www.agora.io/) for in-app video and audio calls, following the same credential setup as the [Web Call Center Agora guide](https://grey-dev-0.github.io/web-call-center/third-parties/agora/).

## Setup

1. Create a free Agora project and copy **App ID** and **App Certificate**.
2. Configure the API:

```env
MEETING_PROVIDER=agora
AGORA_APP_ID=<your_app_id>
AGORA_APP_CERTIFICATE=<your_app_certificate>
```

3. Rebuild the Flutter app (`agora_rtc_engine` is bundled for mobile).

Without Agora credentials the API falls back to Jitsi URLs (external browser).

## Booking flow

- Customer chooses **Video call** or **Audio call** when booking an online consultation (`consultationMedia`: `VIDEO` | `AUDIO`).
- On payment confirmation the API provisions an Agora channel named from the booking number.
- Both customer and pujari join via `POST /api/v1/bookings/:id/join`, which returns RTC credentials:

```json
{
  "meetingProvider": "agora",
  "consultationMedia": "VIDEO",
  "peerName": "Pandit Ramesh Sharma",
  "agora": {
    "appId": "...",
    "channelName": "PoojaStorePB123",
    "token": "...",
    "uid": 2847593021,
    "expiresAt": 1750000000
  }
}
```

## API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/bookings/:id/join` | Customer / Pujari / Admin | Agora token or legacy meeting URL |
| POST | `/poojari/appointments/:id/join` | Pujari | Same join payload for the assigned priest |

## Mobile

- `VideoCallScreen` (`/consultation/:bookingId`) uses Agora RTC when `meetingProvider=agora`.
- Booking history and pujari appointment screens call the shared `openConsultation()` helper.
- Android/iOS camera and microphone permissions are declared for video consults.

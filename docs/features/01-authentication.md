# Feature 1 — Authentication

## 1. Functional requirements

1. User can request an OTP for a valid mobile number (India `+91`, USA/Canada `+1`).
2. OTP is 6 digits, expires in 5 minutes, max 5 verify attempts.
3. Max 5 OTP requests per phone per hour (Redis); additional IP bucket + Nest `@Throttle` on OTP routes.
4. Successful verify issues `accessToken` + `refreshToken` and creates the user if new.
5. Default role on self-signup: `CUSTOMER`. Admins/stores/priests are provisioned by Admin.
6. Refresh rotates the refresh token; reuse of an old refresh token revokes the family.
7. Logout revokes the current refresh token and denylists the access `jti` until expiry.
8. `GET /me` returns the authenticated principal.
9. Admin can list users (paginated) and suspend/activate users.
10. All auth events write audit logs.
11. Production uses Twilio SMS (`SMS_PROVIDER=twilio`); console sender is dev/test only.

## 2. Database schema

See `apps/api/prisma/schema.prisma` models: `User`, `OtpChallenge`, `RefreshToken`, `AuditLog`.

## 3. API design (`/api/v1`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/otp/request` | Public | Send OTP |
| POST | `/auth/otp/verify` | Public | Verify OTP, return tokens |
| POST | `/auth/refresh` | Public | Rotate tokens |
| POST | `/auth/logout` | Bearer | Revoke session |
| GET | `/auth/me` | Bearer | Current user |
| GET | `/admin/users` | Admin | List users |
| PATCH | `/admin/users/:id/status` | Admin | Suspend/activate |

## 4–10. Implementation checklist

- [x] Backend use cases + Prisma repos + Redis OTP limiter
- [x] Flutter auth UI (phone → OTP → home shell)
- [x] Admin user list / status (API + mobile admin gate)
- [x] Validation DTOs
- [x] Unit tests (OTP generation, phone normalization, use cases)
- [x] Integration/e2e tests (auth flow)
- [x] Swagger + feature doc + architecture update

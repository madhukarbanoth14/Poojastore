# ADR 002: Phone OTP + JWT (access + rotating refresh)

## Status

Accepted

## Context

Target markets include India where phone OTP is the dominant mobile auth pattern. Sessions must be revocable and safe across devices.

## Decision

- Request OTP by E.164 phone number
- Store only bcrypt/argon2 hashes of OTP and refresh tokens
- Issue short-lived JWT access tokens (15m) and rotating refresh tokens (30d)
- Redis for OTP send rate limits and refresh-token denylist on logout
- First successful OTP creates a `CUSTOMER` account (registration = login)

## Consequences

Requires SMS provider in production (`SMS_PROVIDER=twilio`). Dev/test uses `console` provider that logs OTP and can expose it only when `OTP_RETURN_IN_RESPONSE=true`.

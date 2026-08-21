# ADR 001: Clean Architecture + Feature Modules

## Status

Accepted

## Context

Pooja Store will grow to dozens of bounded contexts (marketplace, temples, panchangam, payments). A flat NestJS layout will not scale across teams.

## Decision

Use feature modules with internal Clean Architecture layers (domain → application → infrastructure/presentation). Enforce the dependency rule: domain has no framework imports.

## Consequences

Slightly more boilerplate per feature; much safer refactors and testability. Use cases are unit-tested without HTTP or DB.

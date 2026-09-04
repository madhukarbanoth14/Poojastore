FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_SITE_URL=https://pavitraseva.in
ARG NEXT_PUBLIC_API_BASE_URL=https://pooja-api-production-tcjernzh5a-el.a.run.app/api/v1
ARG API_BASE_URL=https://pooja-api-production-tcjernzh5a-el.a.run.app/api/v1
ARG NEXT_PUBLIC_ALLOW_MOCK_PAYMENTS=false
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV API_BASE_URL=$API_BASE_URL
ENV NEXT_PUBLIC_ALLOW_MOCK_PAYMENTS=$NEXT_PUBLIC_ALLOW_MOCK_PAYMENTS
RUN npm run build:standalone

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# GIS client ID is read at request time by /login and /signup (not baked into the JS bundle).
ENV GOOGLE_WEB_CLIENT_ID=""
ENV APPLE_WEB_CLIENT_ID=""
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]

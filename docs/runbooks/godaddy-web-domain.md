# Host pavitraseva.in (GoDaddy) on Cloud Run

The Next.js site (`apps/web`) is deployed as Cloud Run service `pavitra-seva-web` in GCP project `pooja-store-app` (Mumbai). It talks to the production API.

**Cloud Run URL:** https://pavitra-seva-web-tcjernzh5a-el.a.run.app

`asia-south1` does not support Cloud Run domain mapping, so the public domain is attached with a global HTTPS load balancer (`./infra/gcp/map-web-lb.sh`).

**Load balancer IP:** `34.54.233.124`

**Redeploy the site**

```bash
./infra/gcp/deploy-web.sh
```

## 1. GoDaddy DNS

Keep the existing `google-site-verification` TXT record.

In **DNS → DNS Records**, delete the parking A records (`13.248.243.5` and `76.223.105.230`). Then set:

| Host | Type | Value |
|------|------|--------|
| `@` | A | `34.54.233.124` |
| `www` | A | `34.54.233.124` |

If `www` is already a CNAME to `pavitraseva.in`, you can leave it — it will follow the apex A record.

Do **not** use Website Builder or domain forwarding.

Google’s managed certificate stays `PROVISIONING` until these records point at the load balancer (usually 15–60 minutes, sometimes longer).

## 2. Confirm

```bash
dig +short pavitraseva.in A
curl -fsSI https://pavitraseva.in
curl -fsSI https://www.pavitraseva.in
```

Both should show Google Frontend / Next.js, not GoDaddy DPS.

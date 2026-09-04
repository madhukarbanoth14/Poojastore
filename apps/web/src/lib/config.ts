/** Same default as the Flutter app so the site works without a local API. */
export const STAGING_API =
  "https://pooja-api-staging-tcjernzh5a-el.a.run.app/api/v1";

export function serverApiBase() {
  return (
    process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    STAGING_API
  );
}

export function publicApiBase() {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? STAGING_API;
}

/** Runtime social-login IDs. Cloud Run can set these without rebuilding the image. */
export function getPublicAuthConfig() {
  return {
    googleClientId:
      process.env.GOOGLE_WEB_CLIENT_ID ||
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      "",
    appleClientId:
      process.env.APPLE_WEB_CLIENT_ID ||
      process.env.NEXT_PUBLIC_APPLE_CLIENT_ID ||
      "",
  };
}

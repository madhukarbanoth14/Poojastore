"use client";

import { STAGING_API } from "./config";
import { apiErrorMessage } from "./format";
import type { Locale } from "./types";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? STAGING_API;

export const TOKEN_ACCESS = "ps_access";
export const TOKEN_REFRESH = "ps_refresh";
export const DEVICE_ID = "ps_device";

export function getApiBase() {
  return BASE;
}

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_ACCESS);
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_REFRESH);
}

export function deviceId() {
  if (typeof window === "undefined") return "web";
  let id = localStorage.getItem(DEVICE_ID);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID, id);
  }
  return id;
}

export function readLocale(): Locale {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(/(?:^|; )ps_locale=([^;]*)/);
  return match?.[1] === "te" ? "te" : "en";
}

export function writeLocale(locale: Locale) {
  document.cookie = `ps_locale=${locale}; path=/; max-age=31536000; SameSite=Lax`;
}

export function saveTokens(access: string, refresh: string) {
  localStorage.setItem(TOKEN_ACCESS, access);
  localStorage.setItem(TOKEN_REFRESH, refresh);
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_ACCESS);
  localStorage.removeItem(TOKEN_REFRESH);
}

async function parseJson(res: Response) {
  return (await res.json().catch(() => ({}))) as {
    success?: boolean;
    data?: unknown;
    message?: unknown;
    error?: string;
  };
}

export async function clientFetch<T>(
  path: string,
  init: RequestInit = {},
  retry = true,
): Promise<T> {
  const token = getAccessToken();
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Accept", "application/json");
  headers.set("Accept-Language", readLocale());
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers,
    signal: init.signal ?? AbortSignal.timeout(8000),
  });
  const json = await parseJson(res);

  if (res.status === 401 && retry && getRefreshToken() && path !== "/auth/refresh") {
    try {
      const rotated = await clientFetch<{
        tokens: { accessToken: string; refreshToken: string };
      }>(
        "/auth/refresh",
        {
          method: "POST",
          body: JSON.stringify({
            refreshToken: getRefreshToken(),
            deviceId: deviceId(),
          }),
        },
        false,
      );
      saveTokens(rotated.tokens.accessToken, rotated.tokens.refreshToken);
      return clientFetch<T>(path, init, false);
    } catch {
      clearTokens();
    }
  }

  if (!res.ok) {
    throw new Error(apiErrorMessage(json, `Request failed (${res.status})`));
  }
  return (json.data ?? json) as T;
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearTokens,
  clientFetch,
  deviceId,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from "@/lib/client";
import type { AuthUser, Cart } from "@/lib/types";

type SessionPayload = {
  tokens: { accessToken: string; refreshToken: string };
  user: AuthUser;
};

type AuthState = {
  user: AuthUser | null;
  cart: Cart | null;
  ready: boolean;
  login: (params: { email: string; password: string }) => Promise<AuthUser>;
  register: (params: {
    email: string;
    password: string;
    countryCode: string;
    phone: string;
    fullName?: string;
  }) => Promise<void>;
  socialLogin: (params: {
    provider: "GOOGLE" | "APPLE";
    idToken?: string;
    subject?: string;
    email?: string;
    fullName?: string;
  }) => Promise<void>;
  updateProfile: (patch: {
    fullName?: string;
    email?: string;
    phone?: string;
    preferredLanguage?: string;
    timezone?: string;
  }) => Promise<void>;
  changePassword: (params: {
    currentPassword?: string;
    newPassword: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshCart: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [ready, setReady] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!getAccessToken()) {
      setCart(null);
      return;
    }
    try {
      const data = await clientFetch<Cart>("/cart");
      setCart(data);
    } catch {
      setCart(null);
    }
  }, []);

  const bootstrap = useCallback(async () => {
    const access = getAccessToken();
    const refresh = getRefreshToken();
    if (!access && !refresh) {
      setReady(true);
      return;
    }
    try {
      if (!access && refresh) {
        const rotated = await clientFetch<{
          tokens: { accessToken: string; refreshToken: string };
        }>("/auth/refresh", {
          method: "POST",
          body: JSON.stringify({ refreshToken: refresh, deviceId: deviceId() }),
        });
        saveTokens(rotated.tokens.accessToken, rotated.tokens.refreshToken);
      }
      const me = await clientFetch<AuthUser>("/auth/me");
      setUser(me);
      await refreshCart();
    } catch {
      clearTokens();
      setUser(null);
      setCart(null);
    } finally {
      setReady(true);
    }
  }, [refreshCart]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const persist = useCallback(
    async (data: SessionPayload) => {
      saveTokens(data.tokens.accessToken, data.tokens.refreshToken);
      setUser(data.user);
      await refreshCart();
    },
    [refreshCart],
  );

  const login = useCallback(
    async (params: { email: string; password: string }) => {
      const data = await clientFetch<SessionPayload>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ ...params, deviceId: deviceId() }),
      });
      await persist(data);
      return data.user;
    },
    [persist],
  );

  const register = useCallback(
    async (params: {
      email: string;
      password: string;
      countryCode: string;
      phone: string;
      fullName?: string;
    }) => {
      const data = await clientFetch<SessionPayload>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ ...params, deviceId: deviceId() }),
      });
      await persist(data);
    },
    [persist],
  );

  const socialLogin = useCallback(
    async (params: {
      provider: "GOOGLE" | "APPLE";
      idToken?: string;
      subject?: string;
      email?: string;
      fullName?: string;
    }) => {
      const data = await clientFetch<SessionPayload>("/auth/social", {
        method: "POST",
        body: JSON.stringify({ ...params, deviceId: deviceId() }),
      });
      await persist(data);
    },
    [persist],
  );

  const logout = useCallback(async () => {
    try {
      await clientFetch("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken: getRefreshToken() }),
      });
    } catch {
      /* still clear locally */
    }
    clearTokens();
    setUser(null);
    setCart(null);
  }, []);

  const updateProfile = useCallback(
    async (patch: {
      fullName?: string;
      email?: string;
      phone?: string;
      preferredLanguage?: string;
      timezone?: string;
    }) => {
      const next = await clientFetch<AuthUser>("/auth/me", {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      setUser(next);
    },
    [],
  );

  const changePassword = useCallback(
    async (params: { currentPassword?: string; newPassword: string }) => {
      const data = await clientFetch<{ hasPassword: boolean }>(
        "/auth/change-password",
        {
          method: "POST",
          body: JSON.stringify(params),
        },
      );
      setUser((prev) => (prev ? { ...prev, hasPassword: data.hasPassword } : prev));
    },
    [],
  );

  const value = useMemo(
    () => ({
      user,
      cart,
      ready,
      login,
      register,
      socialLogin,
      updateProfile,
      changePassword,
      logout,
      refreshCart,
    }),
    [
      user,
      cart,
      ready,
      login,
      register,
      socialLogin,
      updateProfile,
      changePassword,
      logout,
      refreshCart,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

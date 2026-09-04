import { Suspense } from "react";
import { getPublicAuthConfig } from "@/lib/public-auth-config";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const { googleClientId, appleClientId } = getPublicAuthConfig();
  return (
    <Suspense fallback={<div className="py-16 text-center text-muted">Lighting the diya…</div>}>
      <LoginForm googleClientId={googleClientId} appleClientId={appleClientId} />
    </Suspense>
  );
}

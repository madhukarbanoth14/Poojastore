import { Suspense } from "react";
import { getPublicAuthConfig } from "@/lib/public-auth-config";
import { SignupForm } from "./signup-form";

export const dynamic = "force-dynamic";

export default function SignupPage() {
  const { googleClientId, appleClientId } = getPublicAuthConfig();
  return (
    <Suspense fallback={<div className="py-16 text-center text-muted">Lighting the diya…</div>}>
      <SignupForm googleClientId={googleClientId} appleClientId={appleClientId} />
    </Suspense>
  );
}

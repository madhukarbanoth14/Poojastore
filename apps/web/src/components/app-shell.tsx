"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function AppShell({
  header,
  footer,
  children,
}: {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  const path = usePathname();
  if (path.startsWith("/admin")) {
    return <>{children}</>;
  }
  return (
    <>
      {header}
      <main id="main">{children}</main>
      {footer}
    </>
  );
}

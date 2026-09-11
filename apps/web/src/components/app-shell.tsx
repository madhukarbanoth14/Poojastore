"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, type ReactNode } from "react";

function moveToPageStart() {
  if (typeof window === "undefined") return;

  const hash = window.location.hash;
  if (hash.length > 1) {
    const id = decodeURIComponent(hash.slice(1));
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ block: "start", behavior: "auto" });
      if (target instanceof HTMLElement) {
        target.focus({ preventScroll: true });
      }
      return;
    }
  }

  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  const main = document.getElementById("main");
  if (main instanceof HTMLElement) {
    main.focus({ preventScroll: true });
  }
}

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

  useLayoutEffect(() => {
    moveToPageStart();
    const frame = window.requestAnimationFrame(() => moveToPageStart());
    return () => window.cancelAnimationFrame(frame);
  }, [path]);

  useLayoutEffect(() => {
    function onClick(event: MouseEvent) {
      const link = (event.target as HTMLElement | null)?.closest("a");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }
      let url: URL;
      try {
        url = new URL(href, window.location.origin);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && !url.hash) {
        window.requestAnimationFrame(() => moveToPageStart());
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const page = (
    <main id="main" tabIndex={-1} className="outline-none">
      {children}
    </main>
  );

  if (path.startsWith("/admin")) {
    return page;
  }

  return (
    <>
      {header}
      {page}
      {footer}
    </>
  );
}

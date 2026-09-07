"use client";

import { useRef } from "react";
import { YantraRings } from "@/components/ornaments";
import type { Locale } from "@/lib/types";

export function HomeOmSeal({ locale }: { locale: Locale }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function playOm() {
    const node = audioRef.current;
    if (!node) return;
    node.currentTime = 0;
    void node.play().catch(() => {
      /* Browser may block until a click; hover still works after that. */
    });
  }

  function stopOm() {
    const node = audioRef.current;
    if (!node) return;
    node.pause();
    node.currentTime = 0;
  }

  const label =
    locale === "te" ? "ఓం ధ్వని వినండి" : "Play Om sound";

  return (
    <div
      className="hero-shrine hero-om-seal relative mx-auto hidden aspect-square w-full max-w-[20rem] lg:block lg:self-start lg:-mt-12"
      onMouseEnter={playOm}
      onMouseLeave={stopOm}
      onFocus={playOm}
      onBlur={stopOm}
    >
      <audio ref={audioRef} src="/audio/om-chant-5s.mp3" preload="auto" />
      <button
        type="button"
        className="absolute inset-0 z-[2] cursor-pointer rounded-full border-0 bg-transparent"
        aria-label={label}
        title={label}
        onClick={playOm}
      />
      <div className="absolute inset-[18%] rounded-full bg-orange/22 blur-3xl" />
      <YantraRings className="yantra-spin pointer-events-none absolute inset-0 opacity-50" />
      <div className="pointer-events-none absolute inset-[16%] z-[1] overflow-hidden rounded-full">
        <div className="hero-seal h-full w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/brand/pavitra_seva_seal.png"
            alt="Pavitra Seva lotus, Om, and diya"
          />
        </div>
      </div>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { LotusDivider, MandalaWatermark } from "@/components/ornaments";
import { BrandWordmark } from "@/components/ui";
import { t } from "@/lib/copy";
import type { Locale } from "@/lib/types";

export function SiteFooter({ locale }: { locale: Locale }) {
  return (
    <footer className="relative mt-20 overflow-hidden bg-maroon text-cream">
      <div className="h-px bg-gradient-to-r from-transparent via-gold-bright to-transparent" />
      <MandalaWatermark className="pointer-events-none absolute -bottom-16 -right-10 h-64 w-64 opacity-[0.08]" />
      <MandalaWatermark className="pointer-events-none absolute -left-12 top-8 h-48 w-48 opacity-[0.06]" />
      <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <Image
              src="/images/brand/pavitra_seva_icon.jpeg"
              alt=""
              width={44}
              height={44}
              className="h-11 w-11 rounded-full border border-gold-bright/50 object-cover"
            />
            <BrandWordmark locale={locale} onDark className="text-2xl" />
          </div>
          <LotusDivider light className="mt-5" />
          <p className="mt-4 max-w-md text-sm leading-relaxed text-cream/75">
            {t(locale, "footerNote")}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-gold-bright uppercase">
            Explore
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-cream/80">
            <li>
              <Link href="/kits" className="hover:text-gold-bright">
                Pooja kits
              </Link>
            </li>
            <li>
              <Link href="/panchang" className="hover:text-gold-bright">
                Panchangam
              </Link>
            </li>
            <li>
              <Link href="/rasi" className="hover:text-gold-bright">
                Rasi Phalalu
              </Link>
            </li>
            <li>
              <Link href="/guidance" className="hover:text-gold-bright">
                Daily guidance
              </Link>
            </li>
            <li>
              <Link href="/poojas" className="hover:text-gold-bright">
                Poojas
              </Link>
            </li>
            <li>
              <Link href="/festivals" className="hover:text-gold-bright">
                Festivals
              </Link>
            </li>
            <li>
              <Link href="/priests" className="hover:text-gold-bright">
                Book a poojari
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-gold-bright uppercase">
            Company
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-cream/80">
            <li>
              <Link href="/about" className="hover:text-gold-bright">
                About
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-gold-bright">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/priests/apply" className="hover:text-gold-bright">
                Pujari onboarding
              </Link>
            </li>
            <li>
              <Link href="/account" className="hover:text-gold-bright">
                Account
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-gold-bright">
                Sign in
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="relative border-t border-gold-bright/15 py-5 text-center text-xs tracking-wide text-cream/50">
        © {new Date().getFullYear()} Pavitra Seva · Crafted with devotion
      </div>
    </footer>
  );
}

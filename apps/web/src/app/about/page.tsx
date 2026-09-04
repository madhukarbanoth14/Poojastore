import Image from "next/image";
import { PageHero } from "@/components/ui";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <>
      <PageHero
        kicker="Our seva"
        title="About Pavitra Seva"
        subtitle="A Hindu spiritual super app for India, USA, and Canada — kits, priests, panchang, and vidhi in one place."
      />
      <div className="mx-auto grid max-w-5xl items-center gap-10 px-5 py-12 md:grid-cols-2">
        <div className="frame-gold">
          <Image
            src="/images/brand/pavitra_seva_logo.jpeg"
            alt="Pavitra Seva logo"
            width={640}
            height={640}
            className="w-full object-cover"
          />
        </div>
        <div className="space-y-4 text-body leading-relaxed">
          <p>
            Pavitra Seva began as a way to make festival Pooja simple: the right samagri, a trusted
            poojari, and the right muhurat — without last-minute shop runs.
          </p>
          <p>
            Families can order complete kits, book verified priests for home or online seva, follow
            daily panchang, and learn vidhi step by step. Pujaris can join the platform through a
            short onboarding form.
          </p>
          <p>
            The same catalog powers the Pavitra Seva mobile app. This website is the open door for
            the web: browse, book, and pay with the production API.
          </p>
        </div>
      </div>
    </>
  );
}

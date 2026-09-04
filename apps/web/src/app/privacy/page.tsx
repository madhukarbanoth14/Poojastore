import { PageHero } from "@/components/ui";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        kicker="Legal"
        title="Privacy Policy"
        subtitle="How Pavitra Seva collects, uses, and protects your information. Last updated 1 September 2026."
      />
      <article className="mx-auto max-w-3xl space-y-8 px-5 py-12 text-body leading-relaxed">
        <p>
          This policy applies to the Pavitra Seva mobile app and website operated by TechFy Labs
          (“we”, “us”). By using Pavitra Seva you agree to this policy.
        </p>

        <section>
          <h2 className="font-display text-2xl text-maroon">Information we collect</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong>Account:</strong> email, password (stored hashed), mobile number, optional name,
              and Google or Apple sign-in identifiers.
              Google or Apple sign-in identifiers.
            </li>
            <li>
              <strong>Orders and bookings:</strong> cart contents, delivery addresses, priest or
              package bookings, order history, and payment status.
            </li>
            <li>
              <strong>Payments:</strong> amount, currency, and payment reference. Card and UPI
              details are handled by Razorpay (India) or Stripe (USA/Canada). We do not store full
              card numbers.
            </li>
            <li>
              <strong>App features:</strong> camera or photos if you scan a samagri list; push
              notification tokens if you allow alerts; language preference.
            </li>
            <li>
              <strong>Technical:</strong> device type, app version, and basic logs needed to keep
              the service secure and working.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl text-maroon">How we use it</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Create and secure your account</li>
            <li>Fulfil kit orders, samagri lists, and priest bookings</li>
            <li>Process payments and send order or booking updates</li>
            <li>Show panchang, vidhi, and catalog content</li>
            <li>Improve the product and prevent fraud or abuse</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl text-maroon">Who we share it with</h2>
          <p className="mt-3">
            We share data only with providers who help us run Pavitra Seva: hosting (Google Cloud),
            SMS/OTP, payment gateways, and optional push or image-scan services. We do not sell your
            personal information.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-maroon">Retention and your choices</h2>
          <p className="mt-3">
            We keep account, order, and booking records as long as needed to provide the service,
            meet legal requirements, and resolve disputes. You can update profile details in the
            app. To request access, correction, or deletion, contact us using the details below.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-maroon">Children</h2>
          <p className="mt-3">
            Pavitra Seva is not directed at children under 13. Kids Corner content is meant to be
            used with a parent or guardian.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-maroon">Contact</h2>
          <p className="mt-3">
            TechFy Labs, Telangana, India
            <br />
            Email:{" "}
            <a className="text-maroon underline" href="mailto:privacy@pavitraseva.in">
              privacy@pavitraseva.in
            </a>
            <br />
            In the app: Account → Support
          </p>
        </section>
      </article>
    </>
  );
}

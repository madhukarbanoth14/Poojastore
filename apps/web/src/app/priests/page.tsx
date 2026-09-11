import { PriestComingSoon } from "@/components/priest-coming-soon";
import { PageHero } from "@/components/ui";
import { getLocale } from "@/lib/locale";

export const metadata = {
  title: "Book a poojari",
  description: "Poojari booking for home visits and online consultations is coming soon on Pavitra Seva.",
};

export default async function PriestsPage() {
  const locale = await getLocale();
  return (
    <>
      <PageHero
        kicker={locale === "te" ? "పూజారులు" : "Poojaris"}
        title={locale === "te" ? "పూజారిని బుక్ చేయండి" : "Book a poojari"}
        subtitle={
          locale === "te"
            ? "ఇంటి సేవ మరియు ఆన్‌లైన్ సంప్రదింపులు — బుకింగ్ త్వరలో."
            : "Home visits and online consultations — booking opens shortly."
        }
      />
      <div className="mx-auto max-w-2xl px-5 py-12">
        <PriestComingSoon locale={locale} showApply />
      </div>
    </>
  );
}

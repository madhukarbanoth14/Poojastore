import Link from "next/link";
import { EmptyNote, PageHero } from "@/components/ui";
import { listVidhi } from "@/lib/api";
import { getLocale } from "@/lib/locale";

export const metadata = { title: "Pooja vidhi" };

export default async function VidhiPage() {
  const locale = await getLocale();
  const items = await listVidhi(locale);
  return (
    <>
      <PageHero
        kicker="Ritual library"
        title="Pooja vidhi"
        subtitle="Step-by-step procedures, mantras, and katha for festivals, vrats, and daily worship."
      />
      <div className="mx-auto max-w-4xl space-y-3 px-5 py-10">
        {items.length ? (
          items.map((v) => (
            <Link key={v.id} href={`/vidhi/${v.slug}`} className="card-temple block p-5">
              <div className="flex items-center gap-2">
                <span className="chip-ps">
                  {v.category}
                </span>
                {v.durationMinutes ? (
                  <span className="text-xs text-muted">{v.durationMinutes} min</span>
                ) : null}
              </div>
              <h2 className="mt-2 font-display text-xl font-semibold">{v.title}</h2>
              <p className="mt-1 text-sm text-muted">{v.summary}</p>
            </Link>
          ))
        ) : (
          <EmptyNote>Vidhi library loads from `GET /vidhi`.</EmptyNote>
        )}
      </div>
    </>
  );
}

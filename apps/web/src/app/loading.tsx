import { LotusMark } from "@/components/ornaments";

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-sm text-muted">
      <LotusMark className="diya-pulse h-8 w-10" />
      <p className="tracking-[0.16em] uppercase">Lighting the diya…</p>
    </div>
  );
}

import Link from "next/link";
import { LotusDivider } from "@/components/ornaments";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-5 py-24 text-center">
      <p className="text-[11px] font-semibold tracking-[0.22em] text-maroon uppercase">404</p>
      <h1 className="font-display mt-3 text-4xl text-maroon">This path is not in the mandir</h1>
      <LotusDivider className="mx-auto mt-5" />
      <p className="mt-4 text-muted">The page you followed does not exist.</p>
      <Link href="/" className="mt-8 btn-orange">
        Back home
      </Link>
    </div>
  );
}

import { NextResponse } from "next/server";
import { guideBootstrap } from "@/lib/guide/server";
import type { GuideLanguage } from "@/lib/guide/api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lang = (searchParams.get("lang") ?? "en") as GuideLanguage;
  const safe: GuideLanguage = lang === "te" || lang === "hi" ? lang : "en";
  return NextResponse.json(guideBootstrap(safe));
}

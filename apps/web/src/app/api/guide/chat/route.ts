import { NextResponse } from "next/server";
import type { GuideLanguage } from "@/lib/guide/api";
import { guideChat } from "@/lib/guide/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      message?: string;
      language?: GuideLanguage;
      history?: Array<{ role: "user" | "assistant"; content: string }>;
    };
    const message = body.message?.trim();
    if (!message || message.length > 2000) {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }
    const language: GuideLanguage =
      body.language === "te" || body.language === "hi" ? body.language : "en";
    const result = await guideChat({
      message,
      language,
      history: Array.isArray(body.history) ? body.history.slice(-12) : [],
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Guide temporarily unavailable" },
      { status: 503 },
    );
  }
}

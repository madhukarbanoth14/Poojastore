import { GUIDE_KNOWLEDGE } from "./knowledge-catalog";
import type { GuideKnowledgeEntry, GuideLanguage } from "./knowledge-types";

export type RetrievedGuideContext = {
  entries: GuideKnowledgeEntry[];
  kitSlugs: string[];
  textBlock: string;
};

export function retrieveGuideKnowledge(
  query: string,
  language: GuideLanguage = "en",
): RetrievedGuideContext {
  const normalized = normalize(query);
  if (!normalized) return { entries: [], kitSlugs: [], textBlock: "" };

  const scored = GUIDE_KNOWLEDGE.map((entry) => ({
    entry,
    score: scoreEntry(entry, normalized),
  }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((row) => row.entry);

  const kitSlugs = [...new Set(scored.flatMap((entry) => entry.kitSlugs))].slice(0, 6);
  const textBlock = scored.map((entry) => formatEntry(entry, language)).join("\n\n---\n\n");
  return { entries: scored, kitSlugs, textBlock };
}

export function pickLocalized(
  value: { en: string; te?: string; hi?: string },
  language: GuideLanguage,
) {
  if (language === "te") return value.te || value.en;
  if (language === "hi") return value.hi || value.en;
  return value.en;
}

function normalize(value: string) {
  // Keep Mark (\p{M}) so Indic matras/vowel signs are not stripped from words.
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreEntry(entry: GuideKnowledgeEntry, query: string): number {
  let score = 0;
  const haystack = [
    entry.id,
    entry.name.en,
    entry.name.te,
    entry.name.hi,
    ...entry.aliases,
    entry.description.en,
  ]
    .join(" ")
    .toLowerCase();

  for (const alias of entry.aliases) {
    const a = alias.toLowerCase();
    if (query.includes(a) || a.includes(query)) score += 8;
  }
  for (const token of query.split(" ")) {
    if (token.length < 3) continue;
    if (haystack.includes(token)) score += 2;
  }
  return score;
}

function formatEntry(entry: GuideKnowledgeEntry, language: GuideLanguage) {
  const lines = [
    `ID: ${entry.id}`,
    `Type: ${entry.kind}`,
    `Name: ${pickLocalized(entry.name, language)}`,
    `Description: ${pickLocalized(entry.description, language)}`,
  ];
  if (entry.samagri?.length) lines.push(`Samagri: ${entry.samagri.join(", ")}`);
  if (entry.vidhiSteps?.length) {
    lines.push(
      `Vidhi (commonly followed; traditions vary): ${entry.vidhiSteps.join(" → ")}`,
    );
  }
  if (entry.kitSlugs.length) lines.push(`Kit slugs: ${entry.kitSlugs.join(", ")}`);
  if (entry.pagePaths.length) lines.push(`Paths: ${entry.pagePaths.join(", ")}`);
  return lines.join("\n");
}

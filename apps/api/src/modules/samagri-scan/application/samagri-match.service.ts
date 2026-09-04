import { Injectable } from '@nestjs/common';
import { ProductType } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';
import {
  ENGLISH_CANONICAL_ALIASES,
  SAMAGRI_ALIASES,
} from '../domain/samagri-aliases';
import {
  normalize,
  parseSegments,
  similarity,
} from '../domain/samagri-list-parser';

type LineItemMeta = {
  slug?: string;
  nameEn?: string;
  nameTe?: string;
};

type CatalogEntry = {
  productId: string;
  slug: string;
  nameEn: string;
  nameTe: string;
  priceMinor: number;
  terms: string[];
};

export type SamagriScanMatch = {
  productId: string;
  slug: string;
  nameEn: string;
  nameTe: string;
  priceMinor: number;
  confidence: number;
  matchedText: string;
  quantity: number;
};

export type SamagriScanSuggestion = {
  productId: string;
  slug: string;
  nameEn: string;
  nameTe: string;
  priceMinor: number;
  score: number;
};

export type SamagriUnmatchedSuggestion = {
  line: string;
  suggestions: SamagriScanSuggestion[];
};

export type SamagriScanResult = {
  rawText: string;
  lines: string[];
  matches: SamagriScanMatch[];
  unmatchedLines: string[];
  unmatchedSuggestions: SamagriUnmatchedSuggestion[];
};

const AUTO_MATCH_THRESHOLD = 0.72;
const SUGGESTION_THRESHOLD = 0.52;

@Injectable()
export class SamagriMatchService {
  private catalogCache: CatalogEntry[] | null = null;
  private catalogLoadedAt = 0;

  constructor(private readonly prisma: PrismaService) {}

  async matchText(rawText: string): Promise<SamagriScanResult> {
    const text = rawText.trim();
    const segments = parseSegments(text);
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (!text) {
      return {
        rawText: '',
        lines: [],
        matches: [],
        unmatchedLines: [],
        unmatchedSuggestions: [],
      };
    }

    const catalog = await this.loadCatalog();
    const matches = new Map<string, SamagriScanMatch>();
    const unmatchedSegments: string[] = [];

    for (const segment of segments) {
      const best = this.bestMatchForText(segment.text, catalog);
      if (best && best.score >= AUTO_MATCH_THRESHOLD) {
        upsertMatch(
          matches,
          best.entry,
          best.score,
          segment.raw,
          segment.quantity,
        );
      } else {
        unmatchedSegments.push(segment.raw);
      }
    }

    if (matches.size === 0) {
      for (const entry of catalog) {
        for (const term of entry.terms) {
          const termNorm = normalize(term);
          if (termNorm.length < 2) continue;
          if (!normalize(text).includes(termNorm)) continue;
          upsertMatch(
            matches,
            entry,
            0.88,
            findSnippet(text, term),
            parseSegments(findSnippet(text, term))[0]?.quantity ?? 1,
          );
        }
      }
    }

    const matchedRaw = new Set([...matches.values()].map((m) => m.matchedText));
    const unmatchedLines = [...new Set(unmatchedSegments)].filter(
      (line) => !matchedRaw.has(line),
    );

    const unmatchedSuggestions = unmatchedLines.map((line) => ({
      line,
      suggestions: this.suggestForLine(line, catalog),
    }));

    return {
      rawText: text,
      lines,
      matches: [...matches.values()].sort(
        (a, b) => b.confidence - a.confidence,
      ),
      unmatchedLines,
      unmatchedSuggestions,
    };
  }

  suggestForLine(line: string, catalog?: CatalogEntry[]): SamagriScanSuggestion[] {
    const entries = catalog ?? this.catalogCache ?? [];
    const parsed = parseSegments(line)[0];
    const query = parsed?.text ?? line;
    const scored = entries
      .map((entry) => {
        const scores = entry.terms.map((term) => similarity(query, term));
        return {
          entry,
          score: Math.max(...scores, 0),
        };
      })
      .filter((row) => row.score >= SUGGESTION_THRESHOLD)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((row) => ({
        productId: row.entry.productId,
        slug: row.entry.slug,
        nameEn: row.entry.nameEn,
        nameTe: row.entry.nameTe,
        priceMinor: row.entry.priceMinor,
        score: Math.round(row.score * 100) / 100,
      }));
    return scored;
  }

  private bestMatchForText(text: string, catalog: CatalogEntry[]) {
    let best: { entry: CatalogEntry; score: number } | null = null;
    for (const entry of catalog) {
      for (const term of entry.terms) {
        const score = similarity(text, term);
        if (!best || score > best.score) {
          best = { entry, score };
        }
      }
    }
    return best;
  }

  private async loadCatalog(): Promise<CatalogEntry[]> {
    const now = Date.now();
    if (this.catalogCache && now - this.catalogLoadedAt < 5 * 60 * 1000) {
      return this.catalogCache;
    }

    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
        type: ProductType.SAMAGRI,
        metadata: { path: ['catalog'], equals: 'pooja-samagri' },
      },
      select: {
        id: true,
        slug: true,
        name: true,
        priceMinor: true,
        metadata: true,
      },
      orderBy: { sortOrder: 'asc' },
    });

    this.catalogCache = products.map((product) => {
      const metadata = product.metadata as {
        lineItems?: LineItemMeta[];
        i18n?: { te?: { name?: string } };
      } | null;
      const line = metadata?.lineItems?.[0];
      const nameEn = line?.nameEn ?? product.name;
      const canonicalEn = ENGLISH_CANONICAL_ALIASES[nameEn] ?? nameEn;
      const nameTe = line?.nameTe ?? metadata?.i18n?.te?.name ?? '';
      const slug = line?.slug ?? product.slug;
      return {
        productId: product.id,
        slug,
        nameEn: canonicalEn,
        nameTe,
        priceMinor: product.priceMinor,
        terms: buildTerms(slug, canonicalEn, nameEn, nameTe),
      };
    });
    this.catalogLoadedAt = now;
    return this.catalogCache;
  }
}

function buildTerms(
  slug: string,
  canonicalEn: string,
  nameEn: string,
  nameTe: string,
): string[] {
  const terms = new Set<string>();
  const add = (value?: string | null) => {
    const trimmed = value?.trim();
    if (trimmed && trimmed.length >= 2) terms.add(trimmed);
  };

  add(canonicalEn);
  add(nameEn);
  add(nameTe);
  add(slug.replace(/^samagri-/, '').replace(/-/g, ' '));

  for (const part of canonicalEn.split(/[(/,]/)) {
    add(part.replace(/[)]/g, '').trim());
  }

  for (const alias of SAMAGRI_ALIASES[slug] ?? []) {
    add(alias);
  }

  return [...terms];
}

function findSnippet(text: string, term: string): string {
  const lines = text.split(/\r?\n/);
  const termNorm = normalize(term);
  for (const line of lines) {
    if (normalize(line).includes(termNorm)) return line.trim();
  }
  return term;
}

function upsertMatch(
  matches: Map<string, SamagriScanMatch>,
  entry: CatalogEntry,
  confidence: number,
  matchedText: string,
  quantity: number,
) {
  const existing = matches.get(entry.productId);
  if (existing && existing.confidence >= confidence) return;
  matches.set(entry.productId, {
    productId: entry.productId,
    slug: entry.slug,
    nameEn: entry.nameEn,
    nameTe: entry.nameTe,
    priceMinor: entry.priceMinor,
    confidence: Math.round(confidence * 100) / 100,
    matchedText,
    quantity,
  });
}

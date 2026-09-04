const HEADER_PATTERN =
  /^(items?|samagri|samaagri|list|pooja|puja|required|optional|qty|quantity|total|note|notes|పూజ|సామగ్ర|జాబిత|అంశ|వస్తువ)/i;

const TELUGU_DIGITS: Record<string, string> = {
  '\u0c67': '0',
  '\u0c68': '1',
  '\u0c69': '2',
  '\u0c6a': '3',
  '\u0c6b': '4',
  '\u0c6c': '5',
  '\u0c6d': '6',
  '\u0c6e': '7',
  '\u0c6f': '8',
  '\u0c66': '9',
};

const WORD_NUMBERS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  okati: 1,
  rendu: 2,
  renda: 2,
  moodu: 3,
  muudu: 3,
  naalugu: 4,
  nalugu: 4,
  aidu: 5,
  aaru: 6,
  edu: 7,
  enimidi: 8,
  tommidi: 9,
  padhi: 10,
  '\u0c07\u0c26\u0c3f': 1,
  '\u0c08\u0c26\u0c3f': 2,
  '\u0c09\u0c26\u0c3f': 3,
  '\u0c28\u0c3e\u0c32\u0c41\u0c17\u0c41': 4,
  '\u0c05\u0c2f\u0c3f\u0c26\u0c41': 5,
  '\u0c06\u0c30\u0c41': 6,
  '\u0c08\u0c26\u0c41 \u0c15\u0c3f\u0c32\u0c4b': 2,
  '\u0c08\u0c26\u0c41 \u0c15\u0c3f\u0c32\u0c3e': 2,
  '\u0c08\u0c26\u0c41 \u0c15\u0c3f\u0c32\u0c3e\u0c32\u0c41': 2,
  '\u0c08\u0c26\u0c41 \u0c15\u0c3f\u0c32\u0c4b\u0c32\u0c41': 2,
};

export type ParsedSegment = {
  raw: string;
  text: string;
  quantity: number;
};

export function normalize(value: string): string {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function splitListSegments(rawText: string): string[] {
  const lines = rawText
    .split(/\r?\n/)
    .flatMap((line) => line.split(/[,;|•·]/))
    .map((segment) =>
      segment
        .replace(/^[\s\-–*●○▪️]+/, '')
        .replace(/[\s\-–*]+$/, '')
        .trim(),
    )
    .filter((segment) => segment.length >= 2);

  return [...new Set(lines)];
}

export function isHeaderSegment(segment: string): boolean {
  const trimmed = segment.trim();
  if (trimmed.length <= 3) return true;
  return HEADER_PATTERN.test(trimmed);
}

export function convertTeluguDigits(value: string): string {
  return [...value]
    .map((char) => TELUGU_DIGITS[char] ?? char)
    .join('');
}

export function parseSegment(raw: string): ParsedSegment {
  let working = convertTeluguDigits(raw.trim());
  let quantity = 1;

  for (const [word, qty] of Object.entries(WORD_NUMBERS).sort(
    (a, b) => b[0].length - a[0].length,
  )) {
    const pattern = new RegExp(`^${escapeRegExp(word)}\\s+`, 'iu');
    if (pattern.test(working)) {
      quantity = qty;
      working = working.replace(pattern, '').trim();
      break;
    }
  }

  const prefixQty =
    working.match(/^(\d{1,2})\s*[x×*.\-]\s*/i) ??
    working.match(/^(\d{1,2})\s+(?:kg|g|gm|grams?|kgs?|pack|packet|packets?|pcs?|nos?|numbers?)\b\s*/i) ??
    working.match(/^(\d{1,2})\s+(?=\p{L})/iu);
  if (prefixQty) {
    quantity = clampQty(parseInt(prefixQty[1]!, 10));
    working = working.slice(prefixQty[0].length).trim();
  }

  const suffixQty = working.match(/\s*[x×]\s*(\d{1,2})\s*$/i);
  if (suffixQty) {
    quantity = clampQty(parseInt(suffixQty[1]!, 10));
    working = working.slice(0, -suffixQty[0].length).trim();
  }

  const trailingQty = working.match(/\s+(\d{1,2})\s*$/);
  if (trailingQty && working.length - trailingQty[0].length >= 3) {
    quantity = clampQty(parseInt(trailingQty[1]!, 10));
    working = working.slice(0, -trailingQty[0].length).trim();
  }

  return { raw, text: working, quantity };
}

export function parseSegments(rawText: string): ParsedSegment[] {
  return splitListSegments(rawText)
    .filter((segment) => !isHeaderSegment(segment))
    .map(parseSegment)
    .filter((segment) => segment.text.length >= 2);
}

export function similarity(a: string, b: string): number {
  const left = normalize(a);
  const right = normalize(b);
  if (!left || !right) return 0;
  if (left === right) return 1;
  if (left.includes(right) || right.includes(left)) {
    return (
      0.9 +
      (Math.min(left.length, right.length) / Math.max(left.length, right.length)) *
        0.08
    );
  }
  const distance = levenshtein(left, right);
  return 1 - distance / Math.max(left.length, right.length);
}

function clampQty(value: number): number {
  if (value < 1) return 1;
  if (value > 20) return 20;
  return value;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function levenshtein(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix = Array.from({ length: rows }, () => Array<number>(cols).fill(0));
  for (let i = 0; i < rows; i++) matrix[i]![0] = i;
  for (let j = 0; j < cols; j++) matrix[0]![j] = j;
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i]![j] = Math.min(
        matrix[i - 1]![j]! + 1,
        matrix[i]![j - 1]! + 1,
        matrix[i - 1]![j - 1]! + cost,
      );
    }
  }
  return matrix[a.length]![b.length]!;
}

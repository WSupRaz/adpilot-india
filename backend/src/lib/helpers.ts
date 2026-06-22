import { v4 as uuidv4 } from "uuid";

export function generateId(): string {
  return uuidv4();
}

export function paiseToRupees(paise: number): number {
  return paise / 100;
}

export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

export function paginate(page: number, limit: number) {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(100, Math.max(1, limit));
  return {
    skip: (safePage - 1) * safeLimit,
    take: safeLimit,
  };
}

export function detectLanguage(text: string): "hi" | "en" | "hinglish" {
  const devanagariPattern = /[ऀ-ॿ]/;
  const hasDevanagari = devanagariPattern.test(text);
  const hasEnglishWords = /[a-zA-Z]{3,}/.test(text);

  if (hasDevanagari && hasEnglishWords) return "hinglish";
  if (hasDevanagari) return "hi";
  return "en";
}

import { Language } from "./types";

export function detectLanguage(text: string): Language {
  const thaiCount = (text.match(/[\u0E00-\u0E7F]/g) ?? []).length;
  const englishCount = (text.match(/[A-Za-z]/g) ?? []).length;

  if (thaiCount === 0 && englishCount === 0) return "unknown";
  if (thaiCount > 0 && englishCount > 0 && thaiCount > englishCount * 0.25 && englishCount > thaiCount * 0.25) {
    return "mixed";
  }
  return thaiCount > englishCount ? "th" : "en";
}

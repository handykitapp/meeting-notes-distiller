import { NormalizedLine } from "./types";

export function normalizeText(text: string): NormalizedLine[] {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line, index) => ({ lineNumber: index + 1, text: line.trim() }))
    .filter((line) => line.text.length > 0);
}

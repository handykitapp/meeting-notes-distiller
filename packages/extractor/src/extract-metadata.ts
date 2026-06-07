import { NormalizedLine } from "./types";

export function extractTitle(lines: NormalizedLine[]): string | null {
  const first = lines[0]?.text;
  if (!first) return null;
  return first.replace(/^#+\s*/, "").replace(/^\[บันทึกการประชุม\]\s*/, "").trim();
}

export function extractDate(lines: NormalizedLine[]): string | null {
  for (const line of lines.slice(0, 8)) {
    const dateLine = line.text.match(/^(Date|วันที่)\s*:\s*(.+)$/i);
    if (dateLine) return dateLine[2].trim();

    const iso = line.text.match(/\b\d{4}-\d{2}-\d{2}\b/);
    if (iso) return iso[0];

    const slash = line.text.match(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/);
    if (slash) return slash[0];

    const thaiLong = line.text.match(/\d{1,2}\s*[ก-๙]+\s*\d{4}/);
    if (thaiLong) return thaiLong[0];
  }
  return null;
}

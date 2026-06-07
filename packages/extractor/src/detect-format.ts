import { NormalizedLine, TranscriptFormat } from "./types";

export function detectFormat(lines: NormalizedLine[]): TranscriptFormat {
  const structuredMarkers = lines.filter((line) => /^(#{1,3}\s*)?(Topic|หัวข้อ)|^(Date|Attendees|Facilitator|Parking lot|ผู้เข้าร่วม|วันที่)\s*:/i.test(line.text)).length;
  const speakerLines = lines.filter((line) => /^[^:\n]{1,40}:\s*\S/.test(line.text)).length;
  const bulletLines = lines.filter((line) => /^[-*•]/.test(line.text)).length;

  if (structuredMarkers >= 4) return "structured_sections";
  if (speakerLines >= 3) return "dialogue";
  if (bulletLines >= 3) return "rough_bullets";
  return "unknown";
}

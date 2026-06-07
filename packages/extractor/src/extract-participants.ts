import { NormalizedLine, Participant } from "./types";

function splitParticipantText(value: string): Participant[] {
  return value
    .split(/,|\+|และ/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const roleMatch = part.match(/^(.+?)\s*\((.+?)\)$/);
      return {
        name: (roleMatch?.[1] ?? part).trim(),
        role: roleMatch?.[2]?.trim() ?? null,
        confidence: 0.9
      };
    });
}

export function extractParticipants(lines: NormalizedLine[]): Participant[] {
  const explicit = lines.find((line) => /^(Attendees|Participants|ppl|ผู้เข้าร่วม|คนเข้าร่วม)\s*:/i.test(line.text));
  if (explicit) {
    const value = explicit.text.replace(/^(Attendees|Participants|ppl|ผู้เข้าร่วม|คนเข้าร่วม)\s*:/i, "").trim();
    return splitParticipantText(value);
  }

  const speakerNames = new Set<string>();
  for (const line of lines) {
    const match = line.text.match(/^([^:\n]{1,40}):\s*\S/);
    if (match) speakerNames.add(match[1].trim());
  }

  return [...speakerNames].map((name) => ({ name, role: null, confidence: 0.75 }));
}

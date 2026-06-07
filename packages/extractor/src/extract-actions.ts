import { ActionItem, NormalizedLine, Participant } from "./types";

const duePatterns = [
  /due\s+([^.,]+)(?:[.,]|$)/i,
  /by\s+([^.,]+)(?:[.,]|$)/i,
  /no deadline set/i,
  /ภายในวันที่\s*(\d+)/i,
  /วันที่\s*(\d+)/i,
  /ภายใน\s*([^.,]+)/i
];

function extractDueDate(text: string): string | null {
  for (const pattern of duePatterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim();
    if (match) return null;
  }
  return null;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findOwner(text: string, participants: Participant[]): string | null {
  for (const participant of participants) {
    const name = participant.name.replace(/^คุณ/, "");
    const pattern = new RegExp(`(?:^|\\b|\\s)${escapeRegExp(name)}[,:]?\\s+(?:owns|will|write|draft|research|to\\s+research|to\\s+write|to\\s+draft)`, "i");
    if (pattern.test(text)) return participant.name;
  }

  for (const participant of participants) {
    const name = participant.name.replace(/^คุณ/, "");
    const thaiPattern = new RegExp(`${escapeRegExp(name)}\\s*(?:จะ|ทำ|ออก|freeze)`, "i");
    if (thaiPattern.test(text)) return participant.name;
  }

  const englishOwner = text.match(/^([A-Z][A-Za-záéíóúñ]+)[,:]?\s+(owns|will|to|write|draft|research)/);
  if (englishOwner) return englishOwner[1];

  const inlineEnglishOwner = text.match(/\b([A-Z][A-Za-záéíóúñ]+)[,:]?\s+(owns|will|write|draft|research|to\s+research|to\s+write|to\s+draft)/);
  if (inlineEnglishOwner) return inlineEnglishOwner[1];

  const thaiSpeakerOwner = text.match(/^([ก-๙]+):\s*.*?(จะ|ทำ|ออก|freeze)/);
  if (thaiSpeakerOwner) return thaiSpeakerOwner[1];

  const thaiOwner = text.match(/(คุณ[ก-๙]+|[ก-๙]+)\s*(จะ|ทำ|ออก|freeze)/);
  if (thaiOwner) return thaiOwner[1];

  return null;
}

function cleanTask(text: string): string {
  return text
    .replace(/^[-*•]\s*/, "")
    .replace(/^[A-Z][A-Za-záéíóúñ]+[,:]?\s+(owns|will|to)\s+/i, "")
    .replace(/due\s+[^.,]+/i, "")
    .replace(/by\s+[^.,]+/i, "")
    .replace(/ภายในวันที่\s*\d+/i, "")
    .replace(/วันที่\s*\d+/i, "")
    .trim();
}

function isActionLike(text: string): boolean {
  return [
    /\b(owns|will|due|by|to research|write|draft|should pull)\b/i,
    /ต้อง|ควร|ภายใน|ทำให้เสร็จ|ออกประกาศ|freeze|ไม่มีใครรับ/
  ].some((pattern) => pattern.test(text));
}

export function extractActionItems(lines: NormalizedLine[], participants: Participant[]): ActionItem[] {
  const actions: ActionItem[] = [];

  for (const line of lines) {
    const text = line.text;
    if (!isActionLike(text)) continue;

    if (/DONE\.?$/i.test(text)) continue;

    const owner = findOwner(text, participants);
    const dueDate = extractDueDate(text);
    const isUseful = owner || dueDate || /should pull|ควรดึง|ไม่มีใครรับ|no deadline/i.test(text);
    if (!isUseful) continue;

    actions.push({
      id: `action-${actions.length + 1}`,
      owner,
      task: cleanTask(text),
      dueDate,
      rawDueDate: dueDate,
      status: "open",
      confidence: owner ? 0.75 : 0.55,
      sourceLine: line.lineNumber
    });
  }

  return actions;
}

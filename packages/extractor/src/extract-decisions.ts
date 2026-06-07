import { Decision, NormalizedLine } from "./types";

export function extractDecisions(lines: NormalizedLine[]): Decision[] {
  const decisions: Decision[] = [];
  const decisionPatterns = [
    /Decision\s*[—-]\s*(.+)$/i,
    /as decided\.?\s*(.+)?$/i,
    /(we move to .+)$/i,
    /(dropped .+ as decided)$/i,
    /(วันที่\s*30\s*ค่ะ)/i,
    /(คุณโก้ทำให้เสร็จภายในวันที่\s*25)/i,
    /(คุณวีจะออกประกาศแก้ไข)/i
  ];

  for (const line of lines) {
    for (const pattern of decisionPatterns) {
      const match = line.text.match(pattern);
      if (match) {
        decisions.push({
          id: `decision-${decisions.length + 1}`,
          text: (match[1] ?? line.text).trim(),
          confidence: 0.8,
          sourceLine: line.lineNumber
        });
        break;
      }
    }
  }

  return decisions;
}

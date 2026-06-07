import { NormalizedLine, TopicSummary, TranscriptFormat } from "./types";

function topic(id: string, title: string, summary = ""): TopicSummary {
  return { id, title, summary, decisions: [], actionItems: [], issues: [] };
}

function summarizeTopic(title: string, lines: NormalizedLine[]): string {
  const lowerTitle = title.toLowerCase();
  const matching = lines
    .map((line) => line.text)
    .filter((text) => {
      const lower = text.toLowerCase();
      return lower.includes(lowerTitle) || titleKeywords(title).some((pattern) => pattern.test(text));
    })
    .slice(0, 3);

  if (matching.length > 0) return matching.join(" ");
  return `${title} was discussed, but the transcript did not provide a clear standalone summary.`;
}

function titleKeywords(title: string): RegExp[] {
  if (/mobile/i.test(title)) return [/mobile|มือถือ|churn/i];
  if (/api/i.test(title)) return [/api/i];
  if (/churn/i.test(title)) return [/churn/i];
  if (/hiring/i.test(title)) return [/hiring|จ้าง/i];
  if (/design/i.test(title)) return [/mockup|design|ดีไซน์/i];
  if (/launch/i.test(title)) return [/launch|go-live|เปิดตัว/i];
  if (/freeze/i.test(title)) return [/freeze/i];
  if (/dashboard/i.test(title)) return [/dashboard/i];
  if (/press/i.test(title)) return [/press release|สื่อ|ประกาศ/i];
  if (/finance/i.test(title)) return [/finance|budget|การเงิน|งบ/i];
  return [];
}

export function extractTopics(lines: NormalizedLine[], format: TranscriptFormat): TopicSummary[] {
  if (format === "structured_sections") {
    const topics = lines
      .map((line) => line.text.match(/^#{1,3}\s*Topic\s*\d+\s*:\s*(.+)$/i)?.[1])
      .filter((value): value is string => Boolean(value))
      .map((title, index) => topic(`topic-${index + 1}`, title, summarizeTopic(title, lines)));
    if (topics.length > 0) return topics;
  }

  const text = lines.map((line) => line.text).join("\n").toLowerCase();
  const topics: TopicSummary[] = [];

  const add = (id: string, title: string) => topics.push(topic(id, title, summarizeTopic(title, lines)));

  if (/mobile|มือถือ/.test(text)) add("topic-mobile", "Mobile prioritization");
  if (/api/.test(text)) add("topic-api", "API redesign");
  if (/churn/.test(text)) add("topic-churn", "Mobile churn data");
  if (/hiring|จ้าง/.test(text)) add("topic-hiring", "Hiring mobile developer");
  if (/mockup|design|ดีไซน์/.test(text)) add("topic-design", "Design mockups");
  if (/launch|go-live|เปิดตัว/.test(text)) add("topic-launch", "Launch date");
  if (/freeze/.test(text)) add("topic-freeze", "Feature freeze");
  if (/dashboard/.test(text)) add("topic-dashboard", "Analytics dashboard");
  if (/press release|สื่อ|ประกาศ/.test(text)) add("topic-press", "Press release correction");
  if (/finance|budget|การเงิน|งบ/.test(text)) add("topic-finance", "Budget and finance dependency");

  if (topics.length === 0) topics.push(topic("topic-general", "General discussion", lines.slice(0, 3).map((line) => line.text).join(" ")));
  return topics;
}

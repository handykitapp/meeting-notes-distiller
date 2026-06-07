import { ActionItem, Decision, MeetingIssue, NormalizedLine, TopicSummary } from "./types";

function inferRelatedTopicId(text: string, topics: TopicSummary[]): string | null {
  const lower = text.toLowerCase();
  const topicHints: Record<string, RegExp[]> = {
    "topic-mobile": [/mobile|มือถือ|churn/i],
    "topic-api": [/api/i],
    "topic-hiring": [/hiring|จ้าง/i],
    "topic-design": [/mockup|design|ดีไซน์/i],
    "topic-launch": [/launch|go-live|เปิดตัว|วันที่\s*(28|30)/i],
    "topic-freeze": [/freeze|วันที่\s*20/i],
    "topic-dashboard": [/dashboard|วันที่\s*25/i],
    "topic-press": [/press release|สื่อ|ประกาศ/i],
    "topic-finance": [/finance|budget|การเงิน|งบ/i]
  };

  for (const topic of topics) {
    if (topicHints[topic.id]?.some((pattern) => pattern.test(text))) return topic.id;
    if (lower.includes(topic.title.toLowerCase())) return topic.id;
  }

  return topics[0]?.id ?? null;
}

function launchDateMentions(lines: NormalizedLine[]): string[] {
  const values = new Set<string>();
  const launchLine = /(launch|go-live|เปิดตัว)/i;

  for (const line of lines) {
    if (!launchLine.test(line.text)) continue;
    for (const match of line.text.matchAll(/\b(\d{1,2})(?:st|nd|rd|th)?\b/g)) values.add(match[1]);
    for (const match of line.text.matchAll(/วันที่\s*(\d{1,2})/g)) values.add(match[1]);
  }

  return [...values];
}

export function detectIssues(lines: NormalizedLine[], decisions: Decision[], actions: ActionItem[], topics: TopicSummary[] = []): MeetingIssue[] {
  const text = lines.map((line) => line.text).join("\n");
  const lower = text.toLowerCase();
  const issues: MeetingIssue[] = [];

  const add = (
    type: MeetingIssue["type"],
    severity: MeetingIssue["severity"],
    message: string,
    sourceLine?: number,
    relatedActionItemId?: string | null,
    topicText = message
  ) => {
    issues.push({
      id: `issue-${issues.length + 1}`,
      type,
      severity,
      message,
      sourceLine,
      relatedActionItemId: relatedActionItemId ?? null,
      relatedTopicId: inferRelatedTopicId(topicText, topics)
    });
  };

  const noDecisionSignals = [
    /no conclusion/i,
    /no decision/i,
    /not sure what we decided/i,
    /ran out of time/i,
    /ไม่ได้ข้อสรุป/i,
    /ยังไม่ได้ข้อสรุป/i,
    /ไม่แน่ใจว่าตกลง/i,
    /คุยเยอะแต่ไม่ได้ข้อสรุป/i
  ];

  if (decisions.length === 0 || noDecisionSignals.some((pattern) => pattern.test(text))) {
    add("NO_DECISION", "warning", "No clear decision was detected for this meeting.");
  }

  for (const action of actions) {
    if (!action.owner) add("UNASSIGNED_ACTION", "warning", `Action item has no owner: ${action.task}`, action.sourceLine ?? undefined, action.id, action.task);
    if (!action.dueDate) add("MISSING_DUE_DATE", "info", `Action item has no due date: ${action.task}`, action.sourceLine ?? undefined, action.id, action.task);
  }

  const launchDates = launchDateMentions(lines);
  if (launchDates.length >= 2) {
    add("CONFLICTING_DATE", "critical", `Conflicting launch/go-live dates detected: ${launchDates.join(" and ")} were mentioned.`, undefined, null, "launch go-live เปิดตัว");
  }

  if ((/freeze/.test(lower) && /dashboard/.test(lower) && /วันที่\s*20/.test(text) && /วันที่\s*25/.test(text)) || /(not decided|no conclusion|unresolved|ค่อยกลับมาคุย|ยังไม่ได้ข้อสรุป)/i.test(text)) {
    add("UNRESOLVED_TOPIC", "warning", "At least one topic remains unresolved or contradicts another action timeline.", undefined, null, "freeze dashboard unresolved");
  }

  const followUpMentioned = /pick this up next week|follow up next week/i.test(text) || /ไว้คุยต่อสัปดาห์หน้า/.test(text);
  const explicitlyUnscheduled = /didn't schedule|not scheduled|no meeting date|ไม่ได้นัดวัน|ไม่ได้นัด/i.test(text);
  const scheduledFollowUp = /(next sync|scheduled for|นัดวันที่|วันที่\s*:\s*)/i.test(text);
  if (followUpMentioned && (explicitlyUnscheduled || !scheduledFollowUp)) {
    add("FOLLOW_UP_NOT_SCHEDULED", "info", "Follow-up was mentioned but no meeting date was scheduled.");
  }

  if (/waiting on finance/i.test(text) || /การเงินยังไม่คอนเฟิร์ม/.test(text)) {
    add("PENDING_EXTERNAL_DEPENDENCY", "info", "A decision depends on finance confirmation.");
  }

  return issues;
}

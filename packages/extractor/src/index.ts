export * from "./types";

import { detectFormat } from "./detect-format";
import { detectLanguage } from "./detect-language";
import { extractActionItems } from "./extract-actions";
import { extractDecisions } from "./extract-decisions";
import { extractDate, extractTitle } from "./extract-metadata";
import { extractParticipants } from "./extract-participants";
import { extractTopics } from "./extract-topics";
import { groupActionsByOwner } from "./group-actions";
import { detectIssues } from "./detect-issues";
import { normalizeText } from "./normalize";
import { ActionItem, Decision, MeetingExtractionResult, MeetingIssue, NormalizedLine, TopicSummary } from "./types";

function topicForLine(lineNumber: number | null | undefined, lines: NormalizedLine[], topics: TopicSummary[]): string | null {
  if (!lineNumber || topics.length === 0) return null;

  let current: string | null = null;
  for (const line of lines) {
    const structuredTopic = line.text.match(/^#{1,3}\s*Topic\s*\d+\s*:\s*(.+)$/i)?.[1];
    if (structuredTopic) {
      current = topics.find((topic) => topic.title === structuredTopic)?.id ?? current;
    }
    if (line.lineNumber >= lineNumber) break;
  }

  return current;
}

function topicForText(text: string, topics: TopicSummary[], fallback: string | null = null): string | null {
  const hints: Record<string, RegExp[]> = {
    "topic-mobile": [/mobile|มือถือ/i],
    "topic-api": [/api/i],
    "topic-churn": [/churn/i],
    "topic-hiring": [/hiring|จ้าง/i],
    "topic-design": [/mockup|design|ดีไซน์/i],
    "topic-launch": [/launch|go-live|เปิดตัว|วันที่\s*(28|30)/i],
    "topic-freeze": [/freeze|วันที่\s*20/i],
    "topic-dashboard": [/dashboard|วันที่\s*25/i],
    "topic-press": [/press release|สื่อ|ประกาศ/i],
    "topic-finance": [/finance|budget|การเงิน|งบ/i]
  };

  for (const topic of topics) {
    if (hints[topic.id]?.some((pattern) => pattern.test(text))) return topic.id;
    if (text.toLowerCase().includes(topic.title.toLowerCase())) return topic.id;
  }

  return fallback ?? topics[0]?.id ?? null;
}

function attachTopicData(
  topics: TopicSummary[],
  decisions: Decision[],
  actions: ActionItem[],
  issues: MeetingIssue[],
  lines: NormalizedLine[]
): TopicSummary[] {
  const nextTopics = topics.map((topic) => ({ ...topic, decisions: [] as Decision[], actionItems: [] as ActionItem[], issues: [] as MeetingIssue[] }));
  const byId = new Map(nextTopics.map((topic) => [topic.id, topic]));

  for (const decision of decisions) {
    const topicId = topicForLine(decision.sourceLine, lines, nextTopics) ?? topicForText(decision.text, nextTopics);
    decision.topicId = topicId;
    if (topicId) byId.get(topicId)?.decisions.push(decision);
  }

  for (const action of actions) {
    const topicId = topicForLine(action.sourceLine, lines, nextTopics) ?? topicForText(action.task, nextTopics);
    action.topicId = topicId;
    if (topicId) byId.get(topicId)?.actionItems.push(action);
  }

  for (const issue of issues) {
    const topicId = issue.relatedTopicId ?? topicForLine(issue.sourceLine, lines, nextTopics) ?? topicForText(issue.message, nextTopics);
    issue.relatedTopicId = topicId;
    if (topicId) byId.get(topicId)?.issues.push(issue);
  }

  return nextTopics;
}

export function extractMeeting(fileName: string, text: string): MeetingExtractionResult {
  const lines = normalizeText(text);
  const language = detectLanguage(text);
  const format = detectFormat(lines);
  const participants = extractParticipants(lines);
  const decisions = extractDecisions(lines);
  const actionItems = extractActionItems(lines, participants);
  const topics = extractTopics(lines, format);
  const issues = detectIssues(lines, decisions, actionItems, topics);
  const topicsWithDetails = attachTopicData(topics, decisions, actionItems, issues, lines);
  const actionItemsByOwner = groupActionsByOwner(actionItems);

  return {
    fileName,
    language,
    format,
    title: extractTitle(lines),
    date: extractDate(lines),
    participants,
    topics: topicsWithDetails,
    decisions,
    actionItems,
    actionItemsByOwner,
    issues,
    rawStats: {
      lineCount: lines.length,
      wordCount: text.split(/\s+/).filter(Boolean).length,
      characterCount: text.length
    }
  };
}

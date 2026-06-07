export type Language = "en" | "th" | "mixed" | "unknown";

export type TranscriptFormat =
  | "structured_sections"
  | "rough_bullets"
  | "dialogue"
  | "unknown";

export type Participant = {
  name: string;
  role?: string | null;
  confidence: number;
};

export type Decision = {
  id: string;
  topicId?: string | null;
  text: string;
  decidedBy?: string | null;
  confidence: number;
  sourceLine?: number | null;
};

export type ActionItem = {
  id: string;
  topicId?: string | null;
  owner: string | null;
  task: string;
  dueDate: string | null;
  rawDueDate?: string | null;
  status: "open" | "done" | "unknown";
  confidence: number;
  sourceLine?: number | null;
};

export type MeetingIssueType =
  | "NO_DECISION"
  | "UNASSIGNED_ACTION"
  | "MISSING_DUE_DATE"
  | "CONFLICTING_DATE"
  | "UNRESOLVED_TOPIC"
  | "FOLLOW_UP_NOT_SCHEDULED"
  | "PENDING_EXTERNAL_DEPENDENCY"
  | "AMBIGUOUS_OWNER";

export type MeetingIssue = {
  id: string;
  type: MeetingIssueType;
  severity: "info" | "warning" | "critical";
  message: string;
  relatedTopicId?: string | null;
  relatedActionItemId?: string | null;
  sourceLine?: number | null;
};

export type TopicSummary = {
  id: string;
  title: string;
  summary: string;
  decisions: Decision[];
  actionItems: ActionItem[];
  issues: MeetingIssue[];
};

export type NormalizedLine = {
  lineNumber: number;
  text: string;
};

export type MeetingExtractionResult = {
  fileName: string;
  language: Language;
  format: TranscriptFormat;
  title: string | null;
  date: string | null;
  participants: Participant[];
  topics: TopicSummary[];
  decisions: Decision[];
  actionItems: ActionItem[];
  actionItemsByOwner: Record<string, ActionItem[]>;
  issues: MeetingIssue[];
  rawStats: {
    lineCount: number;
    wordCount: number;
    characterCount: number;
  };
};

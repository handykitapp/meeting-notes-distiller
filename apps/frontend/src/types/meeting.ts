export type MeetingIssue = {
  id: string;
  type: string;
  severity: "info" | "warning" | "critical";
  message: string;
  relatedTopicId?: string | null;
  relatedActionItemId?: string | null;
  sourceLine?: number | null;
};

export type GlobalMeetingIssue = MeetingIssue & {
  fileName: string;
  meetingTitle: string | null;
};

export type Participant = { name: string; role?: string | null; confidence: number };
export type Decision = { id: string; topicId?: string | null; text: string; confidence: number; sourceLine?: number | null };
export type ActionItem = {
  id: string;
  topicId?: string | null;
  owner: string | null;
  task: string;
  dueDate: string | null;
  rawDueDate?: string | null;
  status: string;
  confidence: number;
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

export type MeetingExtractionResult = {
  fileName: string;
  language: string;
  format: string;
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

export type ProcessFileError = {
  fileName: string;
  message: string;
};

export type ProcessResponse = {
  meetings: MeetingExtractionResult[];
  globalActionItemsByOwner: Record<string, ActionItem[]>;
  globalIssues: GlobalMeetingIssue[];
  errors: ProcessFileError[];
  summary: {
    totalFiles: number;
    processedFiles: number;
    failedFiles: number;
    totalMeetings: number;
    totalActionItems: number;
    totalIssues: number;
  };
};

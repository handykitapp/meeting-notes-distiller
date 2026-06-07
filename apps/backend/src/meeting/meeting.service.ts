import { Injectable } from "@nestjs/common";
import { extractMeeting, MeetingExtractionResult, ActionItem, MeetingIssue } from "@mnd/extractor";

export type UploadedMeetingFile = {
  originalname: string;
  buffer: Buffer;
};

export type ProcessFileError = {
  fileName: string;
  message: string;
};

export type GlobalMeetingIssue = MeetingIssue & {
  fileName: string;
  meetingTitle: string | null;
};

export type ProcessMeetingsResponse = {
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

@Injectable()
export class MeetingService {
  processFiles(files: UploadedMeetingFile[]): ProcessMeetingsResponse {
    const meetings: MeetingExtractionResult[] = [];
    const errors: ProcessFileError[] = [];

    for (const file of files) {
      try {
        const text = file.buffer.toString("utf-8");
        meetings.push(extractMeeting(file.originalname, text));
      } catch (error) {
        errors.push({
          fileName: file.originalname,
          message: error instanceof Error ? error.message : "Unknown processing error"
        });
      }
    }

    const globalActionItemsByOwner: Record<string, ActionItem[]> = {};
    const globalIssues: GlobalMeetingIssue[] = [];

    for (const meeting of meetings) {
      for (const [owner, actions] of Object.entries(meeting.actionItemsByOwner)) {
        globalActionItemsByOwner[owner] = globalActionItemsByOwner[owner] ?? [];
        globalActionItemsByOwner[owner].push(...actions);
      }
      globalIssues.push(...meeting.issues.map((issue) => ({ ...issue, fileName: meeting.fileName, meetingTitle: meeting.title })));
    }

    return {
      meetings,
      globalActionItemsByOwner,
      globalIssues,
      errors,
      summary: {
        totalFiles: files.length,
        processedFiles: meetings.length,
        failedFiles: errors.length,
        totalMeetings: meetings.length,
        totalActionItems: meetings.reduce((sum, meeting) => sum + meeting.actionItems.length, 0),
        totalIssues: meetings.reduce((sum, meeting) => sum + meeting.issues.length, 0)
      }
    };
  }
}

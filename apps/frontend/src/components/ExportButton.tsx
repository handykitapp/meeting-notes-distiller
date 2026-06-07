import { downloadWordReport } from "../lib/api";
import { MeetingExtractionResult } from "../types/meeting";
import { Download } from "lucide-react";

export function ExportButton({ meetings }: { meetings: MeetingExtractionResult[] }) {
  return (
    <button
      aria-label="Download Word Report"
      className="secondary-button"
      data-testid="download-word-report"
      disabled={meetings.length === 0}
      onClick={() => downloadWordReport(meetings)}
      type="button"
    >
      <Download size={16} aria-hidden="true" />
      ดาวน์โหลด Word Report
    </button>
  );
}

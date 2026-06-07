import { GlobalMeetingIssue } from "../types/meeting";
import { AlertCircle, AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { issueTypeLabel, severityLabel } from "../lib/display";

const severityIcon = {
  critical: ShieldAlert,
  warning: AlertTriangle,
  info: Info
};

export function IssuesPanel({ issues }: { issues: GlobalMeetingIssue[] }) {
  return (
    <section className="card overview-card" data-testid="issues-section">
      <div className="section-heading">
        <span className="icon-pill danger"><AlertCircle size={20} aria-hidden="true" /></span>
        <div>
          <span className="eyebrow">3. Problems</span>
          <h2>ปัญหาที่ต้องตรวจสอบ</h2>
          <p>{issues.length === 0 ? "ไม่พบปัญหา" : `พบ ${issues.length} รายการที่ควรตรวจสอบ`}</p>
        </div>
      </div>
      {issues.length === 0 ? <div className="empty-state success-state">ไม่พบ meeting ที่ไม่มีการตัดสินใจ หรือ Action Items ที่ไม่สอดคล้องกัน</div> : null}
      <ul className="issue-list">
        {issues.map((issue) => (
          <li className={`issue-row ${issue.severity}`} key={`${issue.fileName}-${issue.id}`}>
            <span className={`severity-mark ${issue.severity}`}>
              {(() => {
                const Icon = severityIcon[issue.severity];
                return <Icon size={16} aria-hidden="true" />;
              })()}
            </span>
            <span>
              <span className={`badge issue-${issue.severity}`}>{severityLabel(issue.severity)}</span>
              <strong>{issue.type}</strong>
              <span className="issue-label">{issueTypeLabel(issue.type)}</span>
              <span className="source-pill">{issue.fileName}</span>
              <span className="issue-message">{issue.message}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

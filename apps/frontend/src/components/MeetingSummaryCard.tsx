import { MeetingExtractionResult } from "../types/meeting";
import { AlertTriangle, CalendarDays, CheckCircle2, ClipboardList, Languages, ListChecks, Users } from "lucide-react";
import { displayOwner, dueDateLabel, issueTypeLabel, severityLabel } from "../lib/display";

function metaValue(value: string | null | undefined, fallback = "ไม่ทราบ") {
  return value && value.trim().length > 0 ? value : fallback;
}

export function MeetingSummaryCard({ meeting }: { meeting: MeetingExtractionResult }) {
  return (
    <article className="card meeting-card">
      <div className="meeting-header">
        <div>
          <span className="eyebrow">{meeting.fileName}</span>
          <h3>{metaValue(meeting.title, meeting.fileName)}</h3>
        </div>
        <span className="badge">{meeting.format}</span>
      </div>

      <div className="metadata-grid" aria-label="Meeting metadata">
        <span><CalendarDays size={15} aria-hidden="true" />วันที่: {metaValue(meeting.date)}</span>
        <span><Languages size={15} aria-hidden="true" />ภาษา/รูปแบบ: {meeting.language} / {meeting.format}</span>
        <span><Users size={15} aria-hidden="true" />ผู้เข้าร่วม: {meeting.participants.length}</span>
        <span><ClipboardList size={15} aria-hidden="true" />{meeting.rawStats.lineCount} lines / {meeting.rawStats.wordCount} words</span>
      </div>

      <section className="participants-block">
        <h4><Users size={16} aria-hidden="true" />ผู้เข้าร่วม</h4>
        {meeting.participants.length === 0 ? <p className="muted">ไม่พบชื่อผู้เข้าร่วมใน transcript</p> : (
          <div className="chip-row">
            {meeting.participants.map((participant) => <span className="chip" key={participant.name}>{participant.name}</span>)}
          </div>
        )}
      </section>

      <div className="section-title-row">
        <h4>หัวข้อที่พูดคุย</h4>
        <span className="muted">พบ {meeting.topics.length} หัวข้อ</span>
      </div>
      {meeting.topics.map((topic) => (
        <section className="topic" key={topic.id}>
          <div className="topic-heading">
            <h5>{topic.title}</h5>
            <span className="badge soft">{topic.decisions.length} decisions / {topic.actionItems.length} actions / {topic.issues.length} issues</span>
          </div>
          <p className="topic-summary"><strong>สรุปหัวข้อ:</strong> {topic.summary || "ยังไม่มี summary ที่ชัดเจนจาก transcript"}</p>

          <div className="topic-columns">
            <div className="topic-section">
              <strong><CheckCircle2 size={15} aria-hidden="true" />การตัดสินใจ</strong>
              {topic.decisions.length === 0 ? <p className="empty-inline">ไม่พบการตัดสินใจที่ชัดเจน</p> : <ul>{topic.decisions.map((d) => <li key={d.id}>{d.text}</li>)}</ul>}
            </div>

            <div className="topic-section">
              <strong><ListChecks size={15} aria-hidden="true" />Action Items</strong>
              {topic.actionItems.length === 0 ? <p className="empty-inline">ไม่พบ Action Items ในหัวข้อนี้</p> : (
                <ul>{topic.actionItems.map((a) => <li key={a.id}><span className={a.owner ? "owner-label" : "owner-label unassigned"}>{displayOwner(a.owner)}</span>{a.task} <span className={a.dueDate ? "badge due" : "badge issue-info"}>{dueDateLabel(a)}</span></li>)}</ul>
              )}
            </div>

            <div className="topic-section">
              <strong><AlertTriangle size={15} aria-hidden="true" />ปัญหา / Issues</strong>
              {topic.issues.length === 0 ? <p className="empty-inline">ไม่พบปัญหาในหัวข้อนี้</p> : (
                <ul>{topic.issues.map((issue) => <li key={issue.id}><span className={`badge issue-${issue.severity}`}>{severityLabel(issue.severity)}</span> <span className="issue-type">{issue.type}</span> <span className="issue-label">{issueTypeLabel(issue.type)}</span>: {issue.message}</li>)}</ul>
              )}
            </div>
          </div>
        </section>
      ))}
    </article>
  );
}

import { Injectable } from "@nestjs/common";
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import { ActionItem, MeetingExtractionResult, MeetingIssue } from "@mnd/extractor";

function bullet(text: string): Paragraph {
  return new Paragraph({ text, bullet: { level: 0 } });
}

function issueText(issue: MeetingIssue): string {
  return `[${severityLabel(issue.severity)}] ${issue.type} - ${issueTypeLabel(issue.type)}: ${issue.message}`;
}

function actionText(action: ActionItem): string {
  const owner = action.owner ?? "ไม่มีผู้รับผิดชอบ";
  const due = action.dueDate ? `กำหนดส่ง ${action.dueDate}` : "ไม่ระบุวันครบกำหนด";
  return `${owner}: ${action.task} (${due})`;
}

function issueTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    NO_DECISION: "ไม่มีการตัดสินใจ",
    UNASSIGNED_ACTION: "Action item ไม่มีผู้รับผิดชอบ",
    MISSING_DUE_DATE: "Action item ไม่ระบุวันครบกำหนด",
    CONFLICTING_DATE: "ข้อมูลวันไม่สอดคล้องกัน",
    UNRESOLVED_TOPIC: "หัวข้อยังไม่ได้ข้อสรุป",
    FOLLOW_UP_NOT_SCHEDULED: "มี follow-up แต่ยังไม่ได้นัดหมาย",
    PENDING_EXTERNAL_DEPENDENCY: "รอข้อมูลหรือทีมภายนอก",
    AMBIGUOUS_OWNER: "ผู้รับผิดชอบไม่ชัดเจน"
  };
  return labels[type] ?? type;
}

function severityLabel(severity: MeetingIssue["severity"]): string {
  if (severity === "critical") return "สำคัญมาก";
  if (severity === "warning") return "ควรตรวจสอบ";
  return "ข้อมูลเพิ่มเติม";
}

@Injectable()
export class WordExportService {
  async createReport(meetings: MeetingExtractionResult[]): Promise<Buffer> {
    const children: Paragraph[] = [
      new Paragraph({ text: "Meeting Notes Distiller Report", heading: HeadingLevel.TITLE }),
      new Paragraph("รายงานนี้สร้างจาก structured JSON ชุดเดียวกับที่แสดงบน browser"),
      new Paragraph(`จำนวนการประชุม: ${meetings.length}`),
      new Paragraph(`จำนวน Action Items: ${meetings.reduce((sum, meeting) => sum + meeting.actionItems.length, 0)}`),
      new Paragraph(`จำนวนปัญหาที่ต้องตรวจสอบ: ${meetings.reduce((sum, meeting) => sum + meeting.issues.length, 0)}`)
    ];

    const groupedActions = meetings.reduce<Record<string, ActionItem[]>>((acc, meeting) => {
      for (const [owner, actions] of Object.entries(meeting.actionItemsByOwner)) {
        acc[owner] = acc[owner] ?? [];
        acc[owner].push(...actions);
      }
      return acc;
    }, {});

    children.push(new Paragraph({ text: "Meeting summary ต่อการประชุม", heading: HeadingLevel.HEADING_1 }));
    for (const meeting of meetings) {
      children.push(new Paragraph({ text: meeting.title ?? meeting.fileName, heading: HeadingLevel.HEADING_2 }));
      children.push(new Paragraph(`ไฟล์ต้นทาง: ${meeting.fileName}`));
      children.push(new Paragraph(`วันที่: ${meeting.date ?? "ไม่ทราบ"}`));
      children.push(new Paragraph(`ภาษา/รูปแบบ: ${meeting.language} / ${meeting.format}`));
      children.push(new Paragraph(`ผู้เข้าร่วม: ${meeting.participants.map((p) => p.name).join(", ") || "ไม่พบชื่อผู้เข้าร่วมใน transcript"}`));

      children.push(new Paragraph({ text: "หัวข้อที่พูดคุย", heading: HeadingLevel.HEADING_3 }));
      for (const topic of meeting.topics) {
        children.push(new Paragraph({ children: [new TextRun({ text: topic.title, bold: true })] }));
        children.push(new Paragraph(`สรุปหัวข้อ: ${topic.summary || "ยังไม่มี summary ที่ชัดเจนจาก transcript"}`));

        children.push(new Paragraph({ children: [new TextRun({ text: "การตัดสินใจ", bold: true })] }));
        if (topic.decisions.length === 0) children.push(bullet("ไม่พบการตัดสินใจที่ชัดเจน"));
        for (const decision of topic.decisions) children.push(bullet(decision.text));

        children.push(new Paragraph({ children: [new TextRun({ text: "Action Items", bold: true })] }));
        if (topic.actionItems.length === 0) children.push(bullet("ไม่พบ Action Items ในหัวข้อนี้"));
        for (const action of topic.actionItems) children.push(bullet(actionText(action)));

        children.push(new Paragraph({ children: [new TextRun({ text: "ปัญหา / Issues", bold: true })] }));
        if (topic.issues.length === 0) children.push(bullet("ไม่พบปัญหาในหัวข้อนี้"));
        for (const issue of topic.issues) children.push(bullet(issueText(issue)));
      }
    }

    children.push(new Paragraph({ text: "Action Items ตามผู้รับผิดชอบ", heading: HeadingLevel.HEADING_1 }));
    if (Object.keys(groupedActions).length === 0) children.push(new Paragraph("ไม่พบ Action Items จากไฟล์ที่ประมวลผล"));
    for (const [owner, actions] of Object.entries(groupedActions)) {
      children.push(new Paragraph({ text: owner === "Unassigned" ? "ไม่มีผู้รับผิดชอบ" : owner, heading: HeadingLevel.HEADING_2 }));
      for (const action of actions) children.push(bullet(actionText(action)));
    }

    children.push(new Paragraph({ text: "ปัญหาที่ต้องตรวจสอบ", heading: HeadingLevel.HEADING_1 }));
    const allIssues = meetings.flatMap((meeting) => meeting.issues.map((issue) => ({ meeting, issue })));
    if (allIssues.length === 0) children.push(new Paragraph("ไม่พบ meeting ที่ไม่มีการตัดสินใจ หรือ Action Items ที่ไม่สอดคล้องกัน"));
    for (const { meeting, issue } of allIssues) {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: `${meeting.fileName}: `, bold: true }),
          new TextRun(issueText(issue))
        ],
        bullet: { level: 0 }
      }));
    }

    const doc = new Document({ sections: [{ children }] });
    return Packer.toBuffer(doc);
  }
}

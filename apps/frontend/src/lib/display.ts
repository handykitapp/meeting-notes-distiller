import { ActionItem, MeetingIssue } from "../types/meeting";

export function displayOwner(owner: string | null | undefined) {
  if (!owner || owner.trim().length === 0 || owner === "Unassigned") return "ไม่มีผู้รับผิดชอบ";
  return owner;
}

export function dueDateLabel(action: ActionItem) {
  return action.dueDate ? `กำหนดส่ง ${action.dueDate}` : "ไม่ระบุวันครบกำหนด";
}

export const issueTypeLabels: Record<string, string> = {
  NO_DECISION: "ไม่มีการตัดสินใจ",
  UNASSIGNED_ACTION: "Action item ไม่มีผู้รับผิดชอบ",
  MISSING_DUE_DATE: "Action item ไม่ระบุวันครบกำหนด",
  CONFLICTING_DATE: "ข้อมูลวันไม่สอดคล้องกัน",
  UNRESOLVED_TOPIC: "หัวข้อยังไม่ได้ข้อสรุป",
  FOLLOW_UP_NOT_SCHEDULED: "มี follow-up แต่ยังไม่ได้นัดหมาย",
  PENDING_EXTERNAL_DEPENDENCY: "รอข้อมูลหรือทีมภายนอก",
  AMBIGUOUS_OWNER: "ผู้รับผิดชอบไม่ชัดเจน"
};

export function issueTypeLabel(type: string) {
  return issueTypeLabels[type] ?? type;
}

export function severityLabel(severity: MeetingIssue["severity"]) {
  if (severity === "critical") return "สำคัญมาก";
  if (severity === "warning") return "ควรตรวจสอบ";
  return "ข้อมูลเพิ่มเติม";
}

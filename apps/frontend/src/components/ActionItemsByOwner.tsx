import { ActionItem } from "../types/meeting";
import { ListTodo, UserRound } from "lucide-react";
import { displayOwner, dueDateLabel } from "../lib/display";

export function ActionItemsByOwner({ groups }: { groups: Record<string, ActionItem[]> }) {
  const owners = Object.entries(groups);

  return (
    <section className="card overview-card" data-testid="actions-by-owner-section">
      <div className="section-heading">
        <span className="icon-pill success"><ListTodo size={20} aria-hidden="true" /></span>
        <div>
          <span className="eyebrow">2. Action Items</span>
          <h2>Action Items ตามผู้รับผิดชอบ</h2>
          <p>{owners.length === 0 ? "ไม่พบ Action Items" : `พบ ${owners.length} กลุ่มผู้รับผิดชอบที่ต้องติดตาม`}</p>
        </div>
      </div>

      {owners.length === 0 ? <div className="empty-state">ไม่พบ Action Items จากไฟล์ที่ประมวลผล</div> : null}
      <div className="owner-grid">
        {owners.map(([owner, actions]) => (
          <section className={owner === "Unassigned" ? "owner-card unassigned" : "owner-card"} key={owner}>
            <div className="owner-header">
              <span className={owner === "Unassigned" ? "avatar warning" : "avatar"}><UserRound size={16} aria-hidden="true" /></span>
              <h3>{displayOwner(owner)}</h3>
              <span className="count-badge">{actions.length}</span>
            </div>
            <ul className="clean-list">
              {actions.map((a, index) => (
                <li className="action-row" key={`${owner}-${a.id}-${index}`}>
                  <span>{a.task}</span>
                  <span className={a.dueDate ? "badge due" : "badge issue-info"}>{dueDateLabel(a)}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </section>
  );
}

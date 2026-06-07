"use client";

import { useState } from "react";
import { AlertTriangle, BarChart3, CheckCircle2, Download, FileText, Loader2, PlayCircle, TriangleAlert } from "lucide-react";
import { ActionItemsByOwner } from "../components/ActionItemsByOwner";
import { ExportButton } from "../components/ExportButton";
import { FileUploadPanel } from "../components/FileUploadPanel";
import { IssuesPanel } from "../components/IssuesPanel";
import { MeetingSummaryCard } from "../components/MeetingSummaryCard";
import { UploadedFileList } from "../components/UploadedFileList";
import { processMeetings } from "../lib/api";
import { ProcessResponse } from "../types/meeting";

function StatCard({ label, value, tone = "neutral" }: { label: string; value: number | string; tone?: "neutral" | "success" | "warning" | "danger" }) {
  return (
    <div className={`stat-card ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function HomePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState<ProcessResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleProcess() {
    setLoading(true);
    setError(null);
    try {
      setResult(await processMeetings(files));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <span className="eyebrow">Local rule-based extraction</span>
          <h1>Meeting Notes Distiller</h1>
          <p>อัปโหลดไฟล์ meeting note แล้วสรุปหัวข้อ ผู้เข้าร่วม การตัดสินใจ Action Items และปัญหาที่ต้องตรวจสอบตามโจทย์ DOCX</p>
        </div>
        <div className="header-status">
          <CheckCircle2 size={16} aria-hidden="true" />
          ไม่ต้องใช้ external LLM API
        </div>
      </header>

      <section className="workspace-grid" aria-label="Meeting processing workspace">
        <div className="workflow-stack">
          <FileUploadPanel onFiles={(nextFiles) => setFiles((current) => [...current, ...nextFiles])} />
          <UploadedFileList files={files} onRemove={(index) => setFiles((current) => current.filter((_, i) => i !== index))} />
        </div>

        <aside className="card process-panel">
          <div className="section-heading compact">
            <span className="icon-pill"><PlayCircle size={18} aria-hidden="true" /></span>
            <div>
              <h2>ประมวลผล</h2>
              <p>{files.length === 0 ? "เลือกไฟล์ .txt เพื่อเริ่มต้น" : `พร้อมประมวลผล ${files.length} ไฟล์`}</p>
            </div>
          </div>
          <button
            aria-label="Process Meetings"
            className="primary-button"
            data-testid="process-meetings"
            disabled={files.length === 0 || loading}
            onClick={handleProcess}
            type="button"
          >
            {loading ? <Loader2 className="spin" size={17} aria-hidden="true" /> : <PlayCircle size={17} aria-hidden="true" />}
            {loading ? "กำลังประมวลผล..." : "ประมวลผลการประชุม"}
          </button>
          {error ? <p className="error-message"><TriangleAlert size={15} aria-hidden="true" />{error}</p> : null}
        </aside>
      </section>

      {result ? (
        <section className="results-stack" aria-label="Processed meeting results">
          <div className="card summary-card" data-testid="processing-summary">
            <div className="summary-header">
              <div className="section-heading compact">
                <span className="icon-pill"><BarChart3 size={18} aria-hidden="true" /></span>
                <div>
                  <h2>สรุปผลการประมวลผล</h2>
                  <p>ประมวลผลสำเร็จ {result.summary.processedFiles} จาก {result.summary.totalFiles} ไฟล์</p>
                </div>
              </div>
            </div>
            <div className="stat-grid">
              <StatCard label="ไฟล์ทั้งหมด" value={result.summary.totalFiles} />
              <StatCard label="สำเร็จ" value={result.summary.processedFiles} tone="success" />
              <StatCard label="ไม่สำเร็จ" value={result.summary.failedFiles} tone={result.summary.failedFiles > 0 ? "danger" : "neutral"} />
              <StatCard label="การประชุม" value={result.summary.totalMeetings} />
              <StatCard label="Action Items" value={result.summary.totalActionItems} tone="warning" />
              <StatCard label="ปัญหา" value={result.summary.totalIssues} tone={result.summary.totalIssues > 0 ? "danger" : "success"} />
            </div>
          </div>
          {result.errors.length > 0 ? (
            <div className="card error-card">
              <div className="section-heading compact">
                <span className="icon-pill danger"><AlertTriangle size={18} aria-hidden="true" /></span>
                <div>
                  <h2>ไฟล์ที่ประมวลผลไม่สำเร็จ</h2>
                  <p>ไฟล์ที่สำเร็จยังแสดงผลต่อด้านล่าง</p>
                </div>
              </div>
              <ul className="clean-list">{result.errors.map((item) => <li key={item.fileName}><strong>{item.fileName}</strong><span>{item.message}</span></li>)}</ul>
            </div>
          ) : null}

          <div className="section-title-row" data-testid="meeting-summary-section">
            <div>
              <span className="eyebrow">1. Meeting summary</span>
              <h2>Meeting summary ต่อการประชุม</h2>
            </div>
            <span className="badge soft"><FileText size={14} aria-hidden="true" />{result.meetings.length} การประชุม</span>
          </div>
          <div className="meeting-grid">{result.meetings.map((meeting) => <MeetingSummaryCard key={meeting.fileName} meeting={meeting} />)}</div>

          <ActionItemsByOwner groups={result.globalActionItemsByOwner} />
          <IssuesPanel issues={result.globalIssues} />

          <div className="card export-card" data-testid="word-export-section">
            <div className="section-heading compact">
              <span className="icon-pill"><Download size={18} aria-hidden="true" /></span>
              <div>
                <h2>ดาวน์โหลดผลลัพธ์เป็น MS Word</h2>
                <p>ใช้ structured JSON ชุดเดียวกับที่แสดงบน browser ตามข้อ 5a ของเอกสาร</p>
              </div>
            </div>
            <ExportButton meetings={result.meetings} />
          </div>
        </section>
      ) : null}
    </main>
  );
}

import { FileText, UploadCloud } from "lucide-react";

export function FileUploadPanel({ onFiles }: { onFiles: (files: File[]) => void }) {
  return (
    <section className="upload-zone card">
      <div className="section-heading">
        <span className="icon-pill"><UploadCloud size={20} aria-hidden="true" /></span>
        <div>
          <h2>อัปโหลด Meeting Notes</h2>
          <p>เลือกไฟล์ transcript นามสกุล `.txt` ได้มากกว่า 1 ไฟล์</p>
        </div>
      </div>
      <label className="drop-target" htmlFor="meeting-file-upload">
        <span className="drop-icon"><FileText size={28} aria-hidden="true" /></span>
        <span className="drop-title">เลือกไฟล์ transcript</span>
        <span className="drop-copy">รองรับ meeting note ภาษาอังกฤษและภาษาไทยในรูปแบบ plain text</span>
      </label>
      <input
        id="meeting-file-upload"
        className="file-input"
        aria-label="Upload transcript files"
        data-testid="file-upload-input"
        type="file"
        accept=".txt,text/plain"
        multiple
        onChange={(event) => {
          onFiles(Array.from(event.target.files ?? []));
          event.currentTarget.value = "";
        }}
      />
    </section>
  );
}

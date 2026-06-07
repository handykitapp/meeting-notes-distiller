import { FileText, X } from "lucide-react";

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  return `${Math.max(1, Math.round(size / 1024))} KB`;
}

export function UploadedFileList({ files, onRemove }: { files: File[]; onRemove: (index: number) => void }) {
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <section className="card file-list-card">
      <div className="section-heading compact">
        <span className="icon-pill"><FileText size={18} aria-hidden="true" /></span>
        <div>
          <h2>ไฟล์ที่เลือก</h2>
          <p>{files.length === 0 ? "ยังไม่ได้เลือกไฟล์" : `พร้อมประมวลผล ${files.length} ไฟล์ รวม ${formatFileSize(totalSize)}`}</p>
        </div>
      </div>

      {files.length === 0 ? (
        <div className="empty-state">ไฟล์ `.txt` ที่เลือกจะแสดงตรงนี้ก่อนเริ่มประมวลผล</div>
      ) : null}

      <ul className="file-list">
        {files.map((file, index) => (
          <li className="file-row" key={`${file.name}-${index}`}>
            <span className="file-meta">
              <span className="file-name">{file.name}</span>
              <span className="muted">{formatFileSize(file.size)}</span>
            </span>
            <button className="ghost-button icon-button" aria-label={`ลบ ${file.name}`} onClick={() => onRemove(index)} type="button">
              <X size={16} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

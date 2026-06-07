import { MeetingExtractionResult, ProcessResponse } from "../types/meeting";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001";

export async function processMeetings(files: File[]): Promise<ProcessResponse> {
  const form = new FormData();
  for (const file of files) form.append("files", file);

  const response = await fetch(`${API_BASE}/meetings/process`, {
    method: "POST",
    body: form
  });

  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export async function downloadWordReport(meetings: MeetingExtractionResult[]) {
  const response = await fetch(`${API_BASE}/meetings/export`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ meetings })
  });

  if (!response.ok) throw new Error(await response.text());
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "meeting-notes-distiller-result.docx";
  link.click();
  URL.revokeObjectURL(url);
}

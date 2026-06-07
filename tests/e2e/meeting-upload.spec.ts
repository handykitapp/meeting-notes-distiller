import { expect, test } from "@playwright/test";
import { join } from "path";

test("uploads multiple transcript files and displays extracted result", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Upload transcript files").setInputFiles([
    join(__dirname, "../../sample-data/01_no_decisions_brainstorm.txt"),
    join(__dirname, "../../sample-data/02_structured_with_followups.txt"),
    join(__dirname, "../../sample-data/03_thai_no_decisions_roadmap.txt"),
    join(__dirname, "../../sample-data/04_thai_conflicting_launch.txt")
  ]);

  await expect(page.getByText("01_no_decisions_brainstorm.txt")).toBeVisible();
  await page.getByTestId("process-meetings").click();
  await expect(page.getByTestId("processing-summary")).toBeVisible();
  await expect(page.getByTestId("meeting-summary-section")).toContainText("Meeting summary ต่อการประชุม");
  await expect(page.getByText("NO_DECISION").first()).toBeVisible();
  await expect(page.getByText("CONFLICTING_DATE").first()).toBeVisible();
  await expect(page.getByTestId("actions-by-owner-section")).toContainText("Action Items ตามผู้รับผิดชอบ");
  await expect(page.getByTestId("actions-by-owner-section")).toContainText("ไม่มีผู้รับผิดชอบ");
  await expect(page.getByTestId("issues-section")).toContainText("ปัญหาที่ต้องตรวจสอบ");

  const downloadPromise = page.waitForEvent("download");
  await page.getByTestId("download-word-report").click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("meeting-notes-distiller-result.docx");
});

import { readFileSync } from "fs";
import { join } from "path";
import { extractMeeting } from "../src";

test("detects English rough no-decision meeting and unassigned action", () => {
  const filePath = join(__dirname, "../../../sample-data/01_no_decisions_brainstorm.txt");
  const result = extractMeeting("01_no_decisions_brainstorm.txt", readFileSync(filePath, "utf-8"));

  expect(result.format).toBe("rough_bullets");
  expect(result.issues.some((issue) => issue.type === "NO_DECISION")).toBe(true);
  expect(result.issues.some((issue) => issue.type === "UNASSIGNED_ACTION")).toBe(true);
});

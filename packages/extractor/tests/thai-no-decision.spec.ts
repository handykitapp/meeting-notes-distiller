import { readFileSync } from "fs";
import { join } from "path";
import { extractMeeting } from "../src";

test("detects Thai rough no-decision meeting", () => {
  const filePath = join(__dirname, "../../../sample-data/03_thai_no_decisions_roadmap.txt");
  const result = extractMeeting("03_thai_no_decisions_roadmap.txt", readFileSync(filePath, "utf-8"));

  expect(result.language).toBe("th");
  expect(result.issues.some((issue) => issue.type === "NO_DECISION")).toBe(true);
  expect(result.issues.some((issue) => issue.type === "UNASSIGNED_ACTION")).toBe(true);
});

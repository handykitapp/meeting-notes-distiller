import { readFileSync } from "fs";
import { join } from "path";
import { extractMeeting } from "../src";

test("detects Thai dialogue launch date conflict and unresolved freeze", () => {
  const filePath = join(__dirname, "../../../sample-data/04_thai_conflicting_launch.txt");
  const result = extractMeeting("04_thai_conflicting_launch.txt", readFileSync(filePath, "utf-8"));

  expect(result.format).toBe("dialogue");
  expect(result.participants.length).toBeGreaterThanOrEqual(4);
  expect(result.issues.some((issue) => issue.type === "CONFLICTING_DATE")).toBe(true);
  expect(result.issues.some((issue) => issue.type === "UNRESOLVED_TOPIC")).toBe(true);
});

import { readFileSync } from "fs";
import { join } from "path";
import { extractMeeting } from "../src";

test("unknown transcript format returns a structured fallback result", () => {
  const result = extractMeeting("unknown.txt", "Random note without meeting markers or useful actions.");

  expect(result.format).toBe("unknown");
  expect(result.topics).toHaveLength(1);
  expect(result.topics[0].id).toBe("topic-general");
  expect(result.rawStats.lineCount).toBe(1);
});

test("detects missing due dates and unscheduled follow-up mentions", () => {
  const roughPath = join(__dirname, "../../../sample-data/01_no_decisions_brainstorm.txt");
  const structuredPath = join(__dirname, "../../../sample-data/02_structured_with_followups.txt");

  const rough = extractMeeting("01_no_decisions_brainstorm.txt", readFileSync(roughPath, "utf-8"));
  const structured = extractMeeting("02_structured_with_followups.txt", readFileSync(structuredPath, "utf-8"));

  expect(rough.issues.some((issue) => issue.type === "FOLLOW_UP_NOT_SCHEDULED")).toBe(true);
  expect(structured.issues.some((issue) => issue.type === "MISSING_DUE_DATE")).toBe(true);
});

test("nests decisions and action items under related topics", () => {
  const filePath = join(__dirname, "../../../sample-data/02_structured_with_followups.txt");
  const result = extractMeeting("02_structured_with_followups.txt", readFileSync(filePath, "utf-8"));

  const databaseTopic = result.topics.find((topic) => topic.title === "Database performance");
  const onCallTopic = result.topics.find((topic) => topic.title === "On-call rotation");

  expect(databaseTopic?.decisions.some((decision) => /add the index/i.test(decision.text))).toBe(true);
  expect(databaseTopic?.actionItems.some((action) => action.owner === "Marcus")).toBe(true);
  expect(onCallTopic?.decisions.some((decision) => /round-robin/i.test(decision.text))).toBe(true);
  expect(onCallTopic?.actionItems.some((action) => action.owner === "Dana")).toBe(true);
});

import { readFileSync } from "fs";
import { join } from "path";
import { extractMeeting } from "../src";

test("extracts structured English participants, decisions, and action owners", () => {
  const filePath = join(__dirname, "../../../sample-data/02_structured_with_followups.txt");
  const result = extractMeeting("02_structured_with_followups.txt", readFileSync(filePath, "utf-8"));

  expect(result.format).toBe("structured_sections");
  expect(result.participants.map((p) => p.name)).toEqual(expect.arrayContaining(["Priya", "Marcus", "Dana", "Tomás"]));
  expect(result.decisions.length).toBeGreaterThanOrEqual(2);
  expect(Object.keys(result.actionItemsByOwner)).toEqual(expect.arrayContaining(["Marcus", "Dana", "Tomás"]));
});

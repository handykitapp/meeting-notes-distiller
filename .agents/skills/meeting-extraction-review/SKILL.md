# Meeting Extraction Review Skill

## Purpose

Use this skill whenever extraction logic, transcript parsing, issue detection, Word export, or test cases are changed.

## When to Use

- After modifying `packages/extractor`
- After adding a new transcript format
- After changing issue detection rules
- Before updating Word export
- Before creating unit test case documentation
- Before submitting the assignment

## Review Checklist

### 1. Metadata Extraction

Verify the extractor returns:

- title
- date
- language
- transcript format
- participants

### 2. Topic Extraction

Verify support for:

- structured English topics
- English rough-note inferred topics
- Thai rough-note inferred topics
- Thai dialogue inferred topics

### 3. Decision Extraction

Verify support for:

- English explicit decisions
- Thai explicit decisions
- no-decision detection
- partially decided meetings with unresolved topics

### 4. Action Item Extraction

Verify each action item has:

- owner or `null`
- task
- due date or `null`
- source line where possible
- confidence score

### 5. Issue Detection

Verify detection for:

- `NO_DECISION`
- `UNASSIGNED_ACTION`
- `MISSING_DUE_DATE`
- `CONFLICTING_DATE`
- `UNRESOLVED_TOPIC`
- `FOLLOW_UP_NOT_SCHEDULED`
- `PENDING_EXTERNAL_DEPENDENCY`

### 6. Sample File Coverage

Always check these files:

- `01_no_decisions_brainstorm.txt`
- `02_structured_with_followups.txt`
- `03_thai_no_decisions_roadmap.txt`
- `04_thai_conflicting_launch.txt`

### 7. Test Coverage

Verify:

- unit tests cover changed logic
- E2E tests still cover upload and process flow
- Word export contains the same information shown in browser

## Required Output When Used

Return:

1. Summary of extraction behavior
2. Problems found
3. Suggested fixes
4. Tests that should be added or updated

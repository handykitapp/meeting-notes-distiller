# Meeting Notes Distiller Web

A web application for uploading meeting transcript `.txt` files, extracting structured meeting summaries, decisions, action items, and detecting issues such as no-decision meetings, unassigned action items, missing due dates, conflicting dates, and unresolved topics.

## Features

- Upload one or multiple `.txt` meeting transcript files.
- Process files together after upload.
- Support multiple transcript formats:
  - English rough bullet notes
  - English structured notes
  - Thai rough bullet notes
  - Thai dialogue transcripts
- Extract:
  - meeting title
  - date
  - participants
  - topics
  - per-topic summaries
  - decisions
  - action items
- Nest decisions, action items, and issues under related topics.
- Group action items by owner.
- Flag meeting risks and problems.
- Display structured results in the browser.
- Export displayed results to MS Word `.docx`.
- Unit-test the extraction logic.
- E2E-test the upload/process/download flow.

## Tech Stack

- Frontend: Next.js + TypeScript
- Backend: NestJS + TypeScript
- Extractor: TypeScript package
- Unit Test: Jest
- E2E Test: Playwright
- Word Export: `docx`
- Package Manager: pnpm

## Directory Structure

```txt
apps/frontend      Browser UI
apps/backend       REST API and Word export
packages/extractor Rule-based extraction logic
tests/e2e          Playwright automation tests
sample-data        Assignment transcript samples
docs               PRD, unit test cases, SIT/UAT cases
.claude/skills     Custom Claude skill for repeated workflow checks
```

## How to Run Locally

```bash
pnpm install
pnpm approve-builds --all
pnpm dev
```

`pnpm approve-builds --all` is needed with pnpm 11 when local installs block dependency build scripts such as NestJS internals. The generated `pnpm-lock.yaml` is kept so the dependency set is reproducible.

Frontend default URL:

```txt
http://localhost:3000
```

Backend default URL:

```txt
http://localhost:3001
```

## Commands

```bash
pnpm dev              # run frontend and backend
pnpm dev:frontend     # run frontend only
pnpm dev:backend      # run backend only
pnpm test             # run extractor unit tests
pnpm test:e2e         # run Playwright E2E tests
pnpm lint             # lint all packages
pnpm build            # build all packages
```

## Extraction Design

The project uses a rule-based and heuristic extraction approach instead of requiring an external LLM API.

Design reasons:

1. The assignment can run locally without API keys.
2. Unit tests are deterministic and repeatable.
3. The provided sample transcripts contain clear recurring patterns.
4. The extractor is isolated in `packages/extractor` so it can be tested independently from frontend and backend.
5. Unknown transcript formats degrade gracefully instead of crashing the system.

## Supported Transcript Formats

| Format | Language | Example File |
|---|---|---|
| Rough bullet notes | English | `01_no_decisions_brainstorm.txt` |
| Structured sections | English | `02_structured_with_followups.txt` |
| Rough bullet notes | Thai | `03_thai_no_decisions_roadmap.txt` |
| Dialogue transcript | Thai | `04_thai_conflicting_launch.txt` |

## Issue Detection

The extractor is designed to detect:

- `NO_DECISION`
- `UNASSIGNED_ACTION`
- `MISSING_DUE_DATE`
- `CONFLICTING_DATE`
- `UNRESOLVED_TOPIC`
- `FOLLOW_UP_NOT_SCHEDULED`
- `PENDING_EXTERNAL_DEPENDENCY`

## API Behavior

`POST /meetings/process` processes every uploaded `.txt` file and returns structured JSON:

- `meetings`: successful extraction results
- `globalActionItemsByOwner`: action items grouped across all meetings, including `Unassigned`
- `globalIssues`: issues annotated with source `fileName`
- `errors`: per-file processing failures that were not silently ignored
- `summary`: total, processed, failed, action item, and issue counts

`POST /meetings/export` receives the same `meetings` JSON shown in the browser and generates the `.docx` report from that structure.

## Known Limits

- Extraction is deterministic and local, so it favors transparent heuristic coverage over perfect NLP.
- Date normalization is best-effort for mixed English and Thai transcripts.
- Unknown transcript formats return a safe general-topic fallback instead of crashing.

## Claude Skill

This repository includes:

```txt
.claude/skills/meeting-extraction-review/SKILL.md
```

Reason for creating this skill:

Extraction review is a repeated workflow during this assignment. Every time the parser, transcript format support, issue detection, unit tests, or Word export changes, the project needs a consistent checklist to verify metadata, topics, decisions, action items, issue flags, and sample-file coverage.

## CLAUDE.md Change Log

| Date | Change | Reason |
|---|---|---|
| Initial | Created `CLAUDE.md` | Defines project conventions, commands, layout, extraction rules, and AI coding constraints. |

## Assignment Documents

- `docs/PRD-Meeting-Notes-Distiller.docx`
- `docs/Unit-Test-Cases.xlsx`
- `docs/SIT-UAT-Cases.xlsx`

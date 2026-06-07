# CLAUDE.md

## Project Overview

This project is a Meeting Notes Distiller Web application. It uploads meeting transcript `.txt` files, extracts meeting summaries, participants, topics, decisions, action items, and detects issues such as no-decision meetings, unassigned action items, missing due dates, conflicting dates, and unresolved topics.

## Tech Stack

- Frontend: Next.js + TypeScript
- Backend: NestJS + TypeScript
- Shared Extractor: TypeScript
- Unit Test: Jest
- E2E Test: Playwright
- Word Export: docx
- Package Manager: pnpm

## Directory Layout

- `apps/frontend`: browser UI
- `apps/backend`: REST API and Word export
- `packages/extractor`: pure extraction logic
- `tests/e2e`: Playwright E2E tests
- `sample-data`: sample `.txt` transcripts
- `docs`: project documents
- `.claude/skills`: custom Claude skills

## Coding Style

- Use TypeScript strict mode.
- Keep extraction logic pure and deterministic.
- Do not put extraction logic inside React components.
- Do not put extraction logic directly inside NestJS controllers.
- Use typed DTOs and typed extraction results.
- Prefer small functions with direct unit tests.
- Keep browser display and Word export consistent.

## Extraction Rules

Always support:

- English rough notes
- English structured notes
- Thai rough notes
- Thai dialogue transcripts

Always extract:

- title
- date
- participants
- topics
- summaries
- decisions
- action items
- issues

Always detect:

- no decision meeting
- unassigned action item
- missing due date
- conflicting dates
- unresolved topic
- follow-up mentioned but not scheduled

## Commands

- `pnpm dev`
- `pnpm dev:frontend`
- `pnpm dev:backend`
- `pnpm test`
- `pnpm test:e2e`
- `pnpm lint`
- `pnpm build`

## Must Do

- Add or update unit tests when changing extraction logic.
- Keep README updated when changing this file.
- Do not hardcode logic by file name only.
- Ensure unknown transcript formats do not crash the app.
- Ensure browser result and Word export use the same structured JSON.
- Keep sample data in `sample-data` and E2E fixtures aligned.

## Must Not Do

- Do not require external LLM API keys for core functionality.
- Do not silently ignore processing errors.
- Do not return only unstructured plain text from backend APIs.
- Do not remove existing test coverage.
- Do not break Thai transcript support.

# Copilot Workspace Instructions for RentLedger

## 1. Project layout and high-level architecture

- Monorepo-style setup with two main folders:
  - `client/`: Next.js (React + TypeScript) UI app, app router (`app/`), and Radix/MUI components.
  - `server/`: Express + TypeScript backend API with Mongoose models, REST routes, and Google backup integration.
- Data store: MongoDB via `mongoose`.
- Primary domains: customers, products, rentals, payments, dashboard, backup.

## 2. Build and run commands

- Frontend:
  - `cd client && npm install`
  - `cd client && npm run dev` (local Next.js dev server)
  - `cd client && npm run build` / `npm start` production
- Backend:
  - `cd server && npm install`
  - `cd server && npm run dev` (ts-node-dev watch mode)
  - `cd server && npm run build && npm run start` production
- Optional Docker (exists at `server/Dockerfile`) — inspect for specific deployment flows.

## 3. Coding conventions

- TypeScript strictness and type-safe models via `src/models` + `src/types`.
- Express route modules under `src/routes` and controllers under `src/controllers`.
- React UI components in `client/components`, structured by feature.
- Unified naming for API service wrappers in `client/lib/api`.

## 4. Recommended task workflow for Copilot Chat

1. Recognize requested scope (bug fix, feature, refactor, docs).
2. Search repository for relevant files (existing patterns) and use existing API contract.
3. Edit only the minimal set of files; preserve style and existing behaviour.
4. Verify with local test run instructions in section 2.

## 5. Common pitfall notes

- Backend expects environment variables for database, JWT secret, Google credentials in `server/service-account.json`.
- Ensure Mongo IDs are handled with `mongoose.Types.ObjectId` in updates.
- Frontend uses Next.js app router; cross-check manager for page-level and layout JS/TS.

## 6. Response expectations for this workspace

- Provide concise patch summaries with file list and intent.
- Include commands to run for verification.
- For API changes include route and payload examples.

## 7. Suggested example prompts

- "Implement the feature to calculate `totalRentDue` in rental summaries and expose in `GET /api/rental`."
- "Fix the product price editing modal to validate numeric price > 0 before submit."
- "Add a backend analytics endpoint `GET /api/dashboard/usage` that returns rentals per day for the last 30 days."

## 8. Next-level agent customization ideas

- Create an agent hook to generate tests for a given endpoint based on OpenAPI-style inferred schema.
- Create an agent that flags async/await in `src/services` to catch non-awaited Promises.
- Add a codegen prompt to scaffold new features from domain entities (customer/product/rental).

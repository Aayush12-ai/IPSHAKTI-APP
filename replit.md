# IP SAKTI

IP SAKTI is a multilingual Ayurvedic intellectual-property and regulatory decision-support assistant for practitioners, researchers, and innovators.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/ip-sakti` — Expo mobile app with the five primary product sections and focused IP decision-support flows.
- `artifacts/ip-sakti/components/ip-sakti.tsx` — shared mobile UI primitives and brand components.
- `artifacts/ip-sakti/constants/colors.ts` — IP SAKTI semantic color tokens.
- `artifacts/ip-sakti/app` — Expo Router screens for home, Ask AI, tools, passport, profile, classification, radar, jurisdictions, simulator, and evidence.

## Architecture decisions

- The first build is frontend-only and uses realistic local demo state so every primary flow is demonstrable before a backend is connected.
- Expo Router tabs keep the core product sections persistent, while focused analysis tools use stack routes outside the tab group.
- Guidance is intentionally structured into assessment blocks and evidence cards rather than long chatbot paragraphs.

## Product

- Home presents a query-first copilot experience, quick actions, and recent analyses.
- Ask AI demonstrates structured, evidence-grounded responses with a legal-advice disclaimer.
- IP Tools includes classification, prior-art radar, jurisdiction comparison, what-if simulation, passport readiness, and evidence exploration.
- Profile provides a lightweight workspace for saved analyses, products, portfolio, language, privacy, and expert support.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The React Native DevTools binary may emit a missing `libglib-2.0.so.0` warning in this environment; Metro can still start and the Expo preview remains usable.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

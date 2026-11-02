<!-- impeccable:product-schema:v1 -->
# PRODUCT.md — Chella

## Positioning
- **Name**: Chella — A clone of "C"onfluence - tr"ELL"o - jir"A"
- **Category**: Unified Agile Sprint Management, Change Request (CR) Lifecycle Studio, FRD Vault, and Obsidian-Style Knowledge Graph Platform
- **Primary Audience**: Business Analysts (BA), Product Managers, Solution Architects, Developers, and QA Engineers managing high-density enterprise sprints across Vietnamese (`vi`), English (`en`), Japanese (`ja`), and Korean (`ko`).

## Operating Context
1. **Board = Sprint**: Each workspace board represents an active or planned Sprint with structured metadata (`sprintNumber`, `startDate`, `endDate`, `updateTill`, `updatedBy`, `goal`).
2. **Column = CR Topic**: Columns organize Change Requests by functional domain or workflow stage, isolated with CSS containment (`content-visibility: auto`) for 60fps drag-and-drop performance.
3. **Card = Change Request (CR)**: Rich enterprise ticket carrying `crCode` (`PREFIX-N`), `baStatus` (`Completed`, `In Testing`, `Pending Dev`, `Processing`, `Pending Sign-off`, `Blocked`), priority, assignee, `devProgress` (`0..1`), `resourceUsed` points, deadlines, checklists, linked CRs, and attached FRD documents.
4. **CR Simulation Studio (`/boards/:boardId/cr/:cardId`)**: Dedicated deep-work workspace for simulating business flows, authoring FRD specs, and inspecting bi-directional links.
5. **Knowledge Hub & Obsidian Graph (`/boards/:boardId/wiki`)**: Markdown wiki with `[[CR-CODE]]` / `[[Page Title]]` bi-directional backlinks, structural templates, and an interactive force-directed Knowledge Graph.

## Evidence on Hand
- Deployed frontend (`https://chello-web.vercel.app`) and REST + Socket.IO backend (`https://chello-api.onrender.com/v1/status`).
- 79 automated Vitest unit tests covering CR filtering, Sprint Pulse telemetry, Timeline scheduling, Obsidian graph modeling, and bilingual/multilingual i18n dictionaries.
- 7 researched workspace theme archetypes (`cosmos`, `wind-chime`, `sora-sky`, `sora-twilight`, `sora-usagi`, `furina`, `nahida`) persisted per board and per user persona.

## Product Principles
- **Data First, Chrome Second**: Status badges, overdue alerts, resource points, and sprint health telemetry carry the semantic color weight; surrounding workspace chrome remains calm, structured, and high-contrast.
- **Zero-Latency Manipulation**: Dragging CR cards, switching between Kanban / Analytics / Timeline / Graph views, and filtering tickets must feel instantaneous with smooth exponential deceleration (`cubic-bezier(0.22, 1, 0.36, 1)`).
- **Personalizable Craft Themes**: Users can switch between 7 curated workspace themes—each pairing expressive visual art with one of the 7 researched product-screen archetypes (`data-terminal`, `framed-sheet`, `achromatic-ledger`, `true-black-flat`, `pastel-consumer`, `accent-ladder`, `editorial-greeting`).

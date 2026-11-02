# DESIGN.md — Chella Design System (Impeccable + Taste-Skill Architecture)

## 1. Aesthetic Direction & Anti-Slop Commitments
Chella combines the **Craft Floor & Operational Rigor** of `impeccable` (v4.8.0) with the **7 Product Screen Archetypes** of `taste-skill` (`design-taste-frontend` v2.1):

- **No Generic AI Tells**:
  - Zero `borderLeft: '4px solid'` side-tabs on cards or blockquotes (use tonal surfaces + full `1px` hairline borders).
  - Zero elastic/bounce easings (`cubic-bezier(0.34, 1.56, 0.64, 1)` is banned; use exponential ease-out `cubic-bezier(0.22, 1, 0.36, 1)` or `cubic-bezier(0.16, 1, 0.3, 1)`).
  - Zero rainbow top-bars on Kanban columns; use a refined theme-token hairline (`--fx-accent`) and tonal surface separation.
- **Tabular Precision (`tabular-nums`)**:
  - Every numeric KPI, CR counter, sprint progress percentage, resource point cell, and date column uses `font-variant-numeric: tabular-nums` and right-aligned table cells where appropriate.
- **Browser Surface Completeness**:
  - Explicit `color-scheme: light dark`, custom `::selection`, `:focus-visible` outlines (`2px solid var(--fx-accent)`), `caret-color: var(--fx-accent)`, and `text-underline-offset: 0.18em`.
- **60fps Complex Layout Containment**:
  - Kanban columns apply `content-visibility: auto; contain-intrinsic-size: auto 308px auto 640px;` with a `@supports not (content-visibility: auto)` fallback to isolate layout/paint during drag-and-drop.

## 2. The 7 Theme Archetypes (`src/utils/animeTheme.js`)
Each of Chella's 7 workspace themes maps to a researched product style archetype from `taste-skill/library/app.json` while preserving its artwork, audio track, and MongoDB key:

| Theme Key | Theme Title | Taste-Skill Archetype | Primary Accent | Secondary Accent | Surface Character |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `cosmos` | Astral Cosmos • Milky Way & Zodiac | `data-terminal` | `#e5c058` | `#818cf8` | Deep graphite-indigo `#121526`, crisp tabular telemetry, amber-gold signal |
| `wind-chime` | Azure Breeze • Sky & Wind Chime | `framed-sheet` | `#0ea5e9` | `#10b981` | Cool mineral slate `#f8fafc` / `#0c1f2c`, inset framed sheets, teal-sky clarity |
| `sora-sky` | Sora • Beyond the Distant Sky | `achromatic-ledger` | `#38bdf8` | `#ec4899` | High-contrast ink & alabaster `#f8fafc` / `#0f172a`, precision sky-blue ledger |
| `sora-twilight` | Sora • Moonlit Black Ribbon | `true-black-flat` | `#a78bfa` | `#f472b6` | Obsidian carbon `#0a0d14`, zero resting shadow clutter, crisp `1px` violet border |
| `sora-usagi` | Usagi • Patchwork Bunny Sanctuary | `pastel-consumer` | `#ec4899` | `#a855f7` | Soft atmospheric blush `#fdf8fa` / `#181224`, generous card radius, warm tactility |
| `furina` | Furina • Salon Solitaire & Fontaine | `accent-ladder` | `#0284c7` | `#6366f1` | Structured royal hydro ladder `#f0f7ff` / `#09192e`, single sapphire-blue hierarchy |
| `nahida` | Nahida • Sanctuary of Surasthana | `editorial-greeting` | `#10b981` | `#84cc16` | Warm botanical parchment `#f7fcf9` / `#071f1a`, calm editorial reading rhythm |

## 3. CSS Custom Properties (Injected by `ThemeFxProvider`)
- `--fx-accent`: Active theme primary signal hex
- `--fx-secondary`: Active theme secondary signal hex
- `--chella-archetype`: Active `taste-skill` archetype identifier
- `--chella-surface-light` / `--chella-surface-dark`: Column & panel surface tokens
- `--chella-border`: Hairline border token (`1px solid`)
- `--chella-radius-card`: `12px`
- `--chella-ease-out`: `cubic-bezier(0.22, 1, 0.36, 1)`

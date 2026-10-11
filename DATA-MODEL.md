# Pierce Consulting Group — Data model extraction

Source: `design-source/Pierce Consulting Group v2.dc.html` (v2 is the current design; v1 differs only visually — light header, no dark hero). This file is the condensed reference for the build.

## Site identity

- **Name:** Pierce Consulting Group — tagline "Business consulting for strategy, operations, and process clarity."
- **Fonts:** DM Sans (display 400/500/600, italic), Inter (body 400/500/600), DM Mono (labels 400/500).
- **Colour tokens:**
  | Token | Hex | Use |
  |---|---|---|
  | ink | `#17242B` | primary dark, buttons, headings |
  | ink-2 | `#243943` | button hover, italic lead text |
  | ink-deep | `#111B20` | footer |
  | paper | `#F7F5EF` | page background |
  | sand | `#E8E5DC` | alt section / hover |
  | gold | `#C9B07F` | accent on dark, CTA band, ticker |
  | gold-deep | `#A88D5D` | focus ring, dashed accents |
  | bronze | `#6E5A36` | eyebrow labels on light |
  | text | `#29343A`, `#3A464C`, `#53616A` | body / secondary / muted |
  | on-dark | `#C3CBCF`, `#AEB8BD` | body on dark |
  | error | `#B42318` / bg `#FEF6F5` / text `#7A1A12` | |
  | success | `#276749` | success check |
- **Motion:** 180–300 ms ease transitions; panels grow with `cubic-bezier(.2,.7,.2,1)` 500 ms; marquee ticker 48 s linear; hero spotlight follows the cursor (radial gradient at `--x/--y`); challenge map auto-rotates every 7 s (pauses on hover, focus, manual selection, hidden tab, reduced motion). `prefers-reduced-motion` disables all animation.
- **Radius:** 2px everywhere. Grid-line backgrounds 64px (dark) / 32px (light).

## Routes and sections

| Route | Sections (in order) |
|---|---|
| `/` | Dark hero (eyebrow, H1, lead, 2 CTAs, Challenge Map tabs with auto-rotate + pause) · gold marquee ticker · §01 Proposition (3 expanding principle panels) · §02 Services bento (3 services + "Not sure which fits?" row) · §03 Challenges explorer (5) · §04 Who we work with (4 audiences) · §05 Engagement stepper (4 stages, progress bar) · Insights preview (3 latest or "Forthcoming") |
| `/services` (`/services/:slug` scrolls to section) | Hero + 3 summary tiles · sticky section tabs · Strategy (Priority matrix figure, 5 items) · Operations (Workflow figure, 4 nodes) · Process (before/after schematic) · dark CTA |
| `/industries` | Hero + "Questions by area" (4 areas × 3 questions) · Industry directory (or empty-state CTA) · Cross-industry challenges (3) |
| `/approach` | Hero + stage nodes (4) · Working principles (4) · Engagement stages list · What clients can expect (5) + image · FAQ accordion (5) |
| `/team` | Hero · Team profiles (or "Business contact — Weston Pierce" fallback card) |
| `/insights` | Hero · category filter + search · featured article · grid · "no match / clear filters" · Load more (+6, starts at 7) · or Forthcoming empty state |
| `/insights/:slug` | Article header, image, body blocks (H2 / P), related service aside · or "This article isn't available." |
| `/contact` (`?service=slug` preselects) | Intro + next steps (3) + contact details · Consultation form → success card / error alert |
| `/privacy` | Privacy placeholder text + email |
| `/admin` | Enquiry management (was a preview gate + localStorage — replaced by real auth + DB) |

Global: skip link, sticky dark header (desktop nav ≥ 1100px, otherwise full-screen menu with Esc to close), breadcrumbs on interior pages, gold closing CTA (hidden on contact, privacy, admin), footer (pages, services, contact, outlined "PIERCE" wordmark).

## Content types (seeded with the exact source copy)

- **Services** (dedicated table): strategy / operations / process published; `growth` "Growth Planning" status `awaiting-confirmation` (not shown publicly). Fields: title, kicker (DIRECTION/EXECUTION/PROCESS), summary (home card), purpose, body, focus areas, visual (`matrix` / `workflow` / `before-after` / `none`), CTA label.
- **Insights** (dedicated table): 3 sample articles flagged `isSample` — only visible when the *Template preview* setting is on.
- **Generic content blocks** (`content` table, `type` discriminator): hero-focus (3), ticker (6), principle (3), challenge (5), audience (4), stage (4), matrix-item (5), ops-node (4), process-before (5), process-after (4), industry-area (4), industry (2 samples), cross-challenge (3), approach-principle (4), expectation (5), faq (5), team-member (1 sample), next-step (3).
- **Settings** (singleton): contact name Weston Pierce, email `weston.pierce@pierceconsulting.com`, phone `+1 (215) 682-2917`, address `1 City Hall Plaza, Boston, MA 52201`, privacy text.

## Validation rules (mirrored exactly in NestJS)

| Field | Rule → message |
|---|---|
| name | trimmed length < 2 → "Enter your full name."; > 120 → "Use 120 characters or fewer." |
| email | empty → "Enter your business email."; fails `/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/` or > 254 → "Enter an email address in the format name@company.com." |
| company | empty → "Enter your company name." (maxLength 160) |
| phone | optional; if present must match `/^[+()\d\s.-]{7,40}$/` → "Use digits, spaces, and + ( ) - only." |
| service | required, a published service slug or `other` → "Select a service, or choose “Other / Not sure yet.”" |
| challenge | empty → "Describe the challenge you’d like to discuss."; < 20 chars or no 3-letter run → "Add a little more detail (at least 20 characters)."; > 4000 → "Use 4,000 characters or fewer." |
| contactMethod | optional, `email` or `phone` |
| website | honeypot — if filled, silently accept but don't store |

Error summary: "Please correct 1 field before sending." / "Please correct N fields before sending."; focus moves to the first invalid field in order name, email, company, phone, service, challenge. Payload is normalised (email lower-cased, phone null if empty) and sent with an `Idempotency-Key`.

Enquiry statuses: `new` (NEW), `review` (IN REVIEW), `contacted` (CONTACTED), `closed` (CLOSED), plus internal notes.

## Feature flags (`data-props`) → settings

| Prop | Default | Implementation |
|---|---|---|
| `submissionMode` preview / preview-failure / endpoint | preview | **Not reproduced** — always the real endpoint |
| `endpoint` | `/api/consultations` | Exposed as `/api/inquiries` and `/api/consultations` |
| `templatePreview` | false | Setting: shows sample insights / team / industries with a "TEMPLATE PREVIEW" banner |
| `showAddress` | false | Setting |
| `heroRotate` | true | Setting |

## Simulated in the comp — not reproduced

- `preview` mode saving enquiries to `localStorage` and the "PREVIEW MODE" success banner → real SQLite persistence.
- `preview-failure` simulated 900 ms failure → real network/server errors drive the error state.
- Admin "Continue in preview" gate in `sessionStorage` → JWT login with a hashed password.
- Sample content hard-coded behind `templatePreview` → DB rows flagged `isSample`.

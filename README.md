# Pierce Consulting Group — Website

A full-stack build of the Pierce Consulting Group design comp (`design-source/Pierce Consulting Group v2.dc.html`).

| Layer | Tech | Folder |
|---|---|---|
| Frontend | Next.js 14 (App Router, React 18, TypeScript) | `frontend/` |
| Backend | NestJS 10 + TypeORM | `backend/` |
| Database | SQLite3 (`sqlite3` driver) | `database/app.sqlite` (created on first run) |

`DATA-MODEL.md` has the full extraction from the design: routes, content, validation rules, flags, and what was simulated in the comp.

---

## Quick start

Requirements: **Node.js 18.18+ (20 LTS recommended)** and npm.

```bash
# 1. install everything
npm install            # root (concurrently)
npm run install:all    # backend + frontend

# 2. optional: configure
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 3. run both apps
npm run dev
```

- Website: http://localhost:3000
- API: http://localhost:4000/api
- Admin: http://localhost:3000/admin/login

On first boot the API creates `database/app.sqlite`, seeds all launch content from the design, and **prints the admin login in the console**:

```
Email:    admin@pierceconsulting.com
Password: PierceAdmin#2026
```

Change it under **Admin → Account** (or set `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `backend/.env` before the first run).

Production: `npm run build && npm start`.

Tests: `npm test` runs the dependency-free business-rule tests: form validation, article body parsing, and content validation. There are 11 checks.

---

## What's dynamic

**Public site** (all content comes from the API, nothing editable is hard-coded):

- **Home:** hero Challenge Map (tabs, arrow-key navigation, 7 s auto-rotate with pause/play, pauses on hover/focus/reduced-motion), cursor spotlight, marquee ticker, expanding principle panels, services bento, challenge explorer, audiences, engagement stepper, latest 3 insights or a "Forthcoming" empty state.
- **Services** (`/services`, `/services/:slug` deep-links and scrolls): summary tiles, sticky section tabs with scroll-spy, interactive priority matrix, workflow stages and before/after figures (all CMS data). Services added later render with a generic layout.
- **Industries:** questions-by-area switcher, industry directory (or an invitation CTA when empty), cross-industry challenges.
- **Approach:** stage nodes, principles, stages list, expectations, FAQ accordion.
- **Team:** published profiles (with portraits), or the business-contact card when there are none.
- **Insights:** category filter, debounced search, featured article, "Load more" (7, then +6), loading skeletons, no-match and error-with-retry states, shareable `?category=&q=` URLs. Article pages show the related service and a consultation CTA, or "This article isn't available."
- **Contact:** consultation form with the comp's exact validation messages, live re-validation after blur, error summary, focus on the first invalid field, character counter, `?service=` pre-selection that is remembered for the session, honeypot, idempotency key (a retry never duplicates), submitting/error/"Try Again" states, and a **success card** with a reference number plus *Return to Home / Review Our Services / Send another enquiry*.
- **Privacy:** text editable in Settings.
- Global: skip link, sticky compacting header, full-screen mobile menu (Esc closes, focus is managed), breadcrumbs, closing CTA, footer, a loading skeleton, an error boundary, a 404 page, and a "site unavailable" screen if the API is down.

**Admin** (`/admin`, JWT-protected):

- **Dashboard:** counts, last-30-days, enquiries by service, latest enquiries, quick links.
- **Enquiries:** search (name, company, email, reference), status filter with counts, sort, pagination, detail panel, status change (New / In Review / Contacted / Closed), internal notes, reply-by-email, delete with confirmation, CSV export.
- **Services:** create, edit, delete, reorder, and set status (Published / Draft / Awaiting confirmation), choose the figure, focus areas.
- **Insights:** create, edit, delete, publish/unpublish, feature (only one at a time), cover image upload, body editor (`## ` headings, blank-line paragraphs), filter, search.
- **Site content:** one editor for 18 content types (FAQ, stages, challenges, ticker, team members with portraits, industries, …). Add, edit, hide/show, reorder and delete, with forms generated from the backend schema.
- **Settings:** contact details, show address, hero auto-rotate, template preview, privacy text.
- **Account:** change password.

**Responsive:** desktop, tablet and mobile use real CSS breakpoints matching the comp: 1100px (nav to menu), 900px (bento columns), 640px (stepper titles), 520px (short header CTA). The admin sidebar becomes an off-canvas menu below 900px.

---

## API overview (`/api`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/site` | – | settings + published services (layout bootstrap) |
| GET | `/content?types=a,b` | – | published content grouped by type |
| GET | `/services`, `/services/options`, `/services/:slug` | – | published services |
| GET | `/insights?category&q&offset&limit`, `/insights/:slug` | – | articles |
| POST | `/inquiries` (alias `/consultations`) | – | submit consultation (rate-limited 5/min, `Idempotency-Key`) |
| POST | `/admin-auth/login` | – | returns JWT (rate-limited) |
| GET/PATCH | `/admin-auth/me`, `/admin-auth/password` | JWT | account |
| GET/PATCH/DELETE | `/inquiries`, `/inquiries/:id`, `/inquiries/stats`, `/inquiries/export.csv` | JWT | enquiries |
| POST/PATCH/DELETE | `/services…`, `/insights…`, `/content…` | JWT | CMS |
| GET/PATCH | `/settings/admin`, `/settings` | JWT | settings |
| POST | `/uploads` | JWT | image upload (JPG/PNG/WebP/AVIF, 5 MB) → `/uploads/…` |

Validation errors return `{ message, errors: { field: "message" } }` so forms show them inline.

## Project structure

```
pierce-consulting-group/
├── backend/            NestJS — src/{admin-auth,content,services,insights,inquiries,settings,uploads,common,database}
├── frontend/           Next.js — app/(site)/*, app/admin/*, components/*, lib/*
├── database/           app.sqlite is created here on first run
├── design-source/      original design comp (v1 + v2) for reference
├── DATA-MODEL.md       design extraction
├── package.json        root scripts
└── README.md
```

---

## Missing / not implemented

Please read this before going live.

**Verification status.** On 10 Oct 2026, with npm access available, both apps were installed and built (`nest build` and `next build` succeed with no type errors), the 11 business-rule tests pass, and the API was exercised over HTTP against a freshly seeded database: content and settings endpoints, form validation messages, a valid submission (reference number returned), the bot-trap field, rate limiting, admin login, token-protected enquiry list/search/status/notes/CSV export, insight create/publish and its public rendering, image upload (non-images and unauthenticated uploads rejected), and the Template preview toggle on the Team, Industries and Insights pages. All public routes and admin routes return 200 from the running frontend, and the frontend proxies `/api` to the backend.

**Still not verified:** nothing was opened in a real browser, so visual layout at the mobile and tablet breakpoints, the admin screens' client-side behaviour, and the form's on-screen interactions have not been checked by eye. The Google Fonts stylesheet could not be downloaded in the build sandbox (it falls back to system fonts there; it should load on a normal connection). `next@14.2.18` also reports a security advisory on install; upgrade to a patched 14.2.x release before deploying.

**Not implemented:**

- **Email notifications.** New enquiries are stored and visible in the admin, but no email is sent to Weston Pierce or the enquirer. There is no SMTP or provider integration.
- **Single admin role only.** There's one seeded admin account and no UI to invite users, manage roles, or reset a forgotten password. Change the password via Account, or delete the `admin_users` row so it re-seeds from `.env`.
- **Session storage.** The JWT is kept in `sessionStorage` (cleared when the tab closes). There is no refresh token, so sessions expire after `JWT_EXPIRES_IN`, which defaults to 8h.
- **Database migrations.** TypeORM `synchronize: true` creates and updates tables automatically. For production, switch to migrations.
- **Rate limiting is in-memory.** It resets on restart and isn't shared across instances.
- **Uploads stay on local disk** (`backend/uploads`). There's no cloud storage, image resizing, or cleanup of unused files.
- **No rich-text editor.** Insight bodies support headings and paragraphs only, via a plain-text convention. Links, lists, bold and inline images are not supported.
- **No automated E2E or API integration tests.** Only the pure validation logic has tests.
- **No SEO extras.** There's no `sitemap.xml`, `robots.txt`, Open Graph images, or analytics.
- **Unconfirmed launch content.** "Growth Planning" is seeded as *Awaiting confirmation* (as in the comp) with no copy. The sample team profile, industries and the 3 sample articles exist only behind **Template preview**, which is off by default. Real team profiles, industries and insights still need to be written and approved.
- **Address flag.** The address `1 City Hall Plaza, Boston, MA 52201` comes straight from the comp, and its ZIP looks wrong for Boston. It is hidden by default (`showAddress` = off). Verify it before enabling.
- **Comp features intentionally not reproduced.** The comp's preview-only behaviour (localStorage enquiries, simulated failure mode, "Continue in preview" admin gate) was replaced by real persistence and authentication.

# FIT & FIGHT CLUB — Ops Console (CRM prototype)

A clickable prototype of a multi-branch gym CRM for **FIT & FIGHT CLUB**
(Vashi / Nerul / Wagholi) — [fitandfightclub.com](https://www.fitandfightclub.com).
Dark, red-accent brand styling set in Oswald (headers/numbers) and Inter
(body/UI).

**This build is a single self-contained `index.html`** — all CSS and
JavaScript are inlined into the one file. That's deliberate: an earlier
split-file version (`index.html` + `css/` + `js/`) hit a real-world snag —
when pushed to GitHub, the `css/` and `js/` folders didn't make it into the
repo (a common gotcha with GitHub's web "upload files" flow, which doesn't
always preserve subfolders), so the deployed page loaded with no styling and
no data. A single file can't have that problem — there's nothing that can go
missing on push. If you'd rather have it split into separate CSS/JS files for
easier editing, ask and it can be regenerated that way — just double-check
on github.com afterward that the `css/` and `js/` folders actually show up
in the repo's file browser before assuming it deployed correctly.

This is the Phase 1 MVP scope: leads & trials, member profiles, memberships &
payments, class scheduling & attendance, follow-up tasks & message templates,
and a branch-wise dashboard/reports layer — plus lighter previews of the
Phase 2 modules (coaches & staff, personal training, MMA athlete tracking).

**This is a design/workflow prototype, not production software.** There is no
backend, database, authentication, or real WhatsApp/SMS/email sending behind
it — see [Limitations](#limitations--whats-not-real) below before you rely on
it for anything beyond reviewing the data model and user flows.

## Quick start

- **Open locally** — just double-click `index.html`. No server, no build
  step, nothing to install.
- **GitHub Pages** — push this repo, then in **Settings → Pages** set the
  source to the `main` branch, root folder. Your console will be live at
  `https://<your-username>.github.io/<repo-name>/`. Since it's one file,
  there's no folder structure to lose in the push — `git add index.html`
  (or `git add .`) and `git push` is enough.
- **Any static host** — Netlify, Vercel, Cloudflare Pages, S3, etc. all just
  need `index.html` served as a static file.

## What's inside

| Module | Notes |
|---|---|
| Dashboard | Branch-wise + total KPIs: enquiries, trials, conversions, active members, memberships expiring in 7/30 days, dues, attendance, revenue |
| Leads & Enquiries | Pipeline: New enquiry → Contacted → Trial booked → Trial attended → Interested → Payment pending → Member active → Renewal due → Renewed / Lost |
| Free Trials | Mirrors the website trial-form fields, plus coach assignment, attendance, feedback, conversion outcome |
| Member Profiles | Contact, emergency contact, medical/injury declaration, goals, documents |
| Memberships | Plans, freeze, upgrade, branch transfer, renewal, computed expiry status |
| Payments | Invoices, part-payments/EMI, discounts, mode, receipts, dues, refunds, GST breakdown |
| Class Scheduling | Weekly timetable by branch/program/coach, capacity, waitlist, substitutions |
| Attendance | QR/PIN/receptionist check-in, no-shows, late arrivals, daily branch report |
| Coaches & Staff, Personal Training, MMA Athletes | Phase 2 preview |
| Follow-ups & Templates | Task list + WhatsApp/SMS/email templates for each trigger |
| Reports | Lead→trial, trial→membership, revenue, dues, attendance, churn, coach utilisation, program/branch performance |
| Admin & Permissions | Founder/Admin, Branch Manager, Receptionist, Coach, Accountant — role-scoped navigation |

## Data & persistence

All data is **seeded sample data**, anchored to a fixed demo date so the
numbers stay coherent regardless of when you open it. Anything you add or
edit (a new lead, a recorded payment, a check-in...) is saved to your
browser's `localStorage` only — nothing is sent to a server, and nothing is
shared between browsers or devices. Use **Admin & Permissions → Reset sample
data** to wipe your edits and restore the original seed set.

## Limitations — what's not real

- No backend or database — data lives in one browser's local storage.
- No authentication — the role switcher in the top bar is a UI preview of
  what each role *would* see, not an access-control system.
- "Send now" on a message template just shows a confirmation toast; it does
  not call WhatsApp, SMS, or email providers.
- No multi-user sync — two people looking at this won't see each other's
  changes.

## Turning this into a real product

If this workflow and data model look right, the natural next step is a real
build: a backend + database (e.g. Postgres), authenticated accounts per
role/branch, and integrations for WhatsApp Business API / SMS / email and
payment collection (Razorpay/UPI). This prototype is a solid reference for
that spec — the field lists, statuses, and screens here can carry over
directly.

## Tech notes

Vanilla HTML/CSS/JS, no build step, no framework, everything in one file.
Fonts (Oswald for headers and large numbers, Inter for everything else) load
from Google Fonts over a CDN link; that's the only external request the page
makes. The palette is a single committed dark theme (surfaces `#111216` →
`#2A2D36`, red accent `#E8402B`, blue/purple/green for the three branches,
green/amber/red for status) defined as CSS custom properties at the top of
the `<style>` block — change the values there to retheme the whole app.

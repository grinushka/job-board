# Job Board

A full-stack job board for job seekers and hiring teams. Seekers browse, filter, favorite, and apply to listings. Employers post jobs through an organization dashboard, review applicants, and get AI-assisted ranking.

## Features

### Job seekers

- Browse published listings and filter by title, location, experience level, job type, location requirement, and wage.
- Save listings to a favorites list.
- Search in plain language. A Gemini matching agent returns listings that fit the prompt.
- Upload a PDF resume. Claude writes a markdown summary used later for ranking and matching.
- Apply with an optional cover letter.
- Opt into a daily email of recent listings, optionally filtered by a personal AI prompt.

Public routes (`/`, `/job-listings`, `/ai-search`, and sign-in) do not require an account. Favorites, applications, resume upload, and notifications do.

### Employers

- Sign in with a Clerk organization. Each org has its own listings.
- Create, edit, publish, delist, and delete job listings. Listings start as drafts.
- Feature listings on the board, within the org’s plan limits.
- Review applications in a table and move them through stages: applied, interested, interviewed, hired, or denied.
- Rate applicants. A Gemini agent also scores each new application from 1 to 5 using the resume summary, cover letter, and listing.
- Opt into a daily email of recent applications, filtered by a minimum rating.
- Role permissions control who can create, update, delete, or change listing status, and who can change applicant stage or rating.

Plans are enforced through Clerk billing features:

| Feature | Limit |
| --- | --- |
| `post_one_job_listing` | 1 published listing |
| `post_three_job_listings` | 3 published listings |
| `post_fifteen_job_listings` | 15 published listings |
| `one_featured_job_listing` | 1 featured listing |
| `unlimited_featured_jobs` | Unlimited featured listings |

The pricing page at `/employer/pricing` renders Clerk’s pricing table.

### Background jobs

Inngest handles work that should not block a request:

- Clerk webhooks sync users, organizations, and memberships into Postgres.
- Resume uploads trigger an AI summary.
- New applications trigger applicant ranking.
- A daily cron (7:00 America/Chicago) prepares job-seeker and employer notification emails, then sends them through Resend.

## Tech stack

- [Next.js 15](https://nextjs.org) App Router, React 19, TypeScript
- [Tailwind CSS 4](https://tailwindcss.com) and [shadcn/ui](https://ui.shadcn.com)
- [Clerk](https://clerk.com) for auth, organizations, permissions, and billing
- [Drizzle ORM](https://orm.drizzle.team) and PostgreSQL
- [Inngest](https://www.inngest.com) for events, crons, and AI agents
- [Anthropic](https://www.anthropic.com) (Claude) for resume summaries
- [Google Gemini](https://ai.google.dev) for job matching and applicant ranking
- [UploadThing](https://uploadthing.com) for resume files
- [Resend](https://resend.com) and React Email for notification emails

## Getting started

### Prerequisites

- Node.js
- Docker, for the local Postgres container
- Accounts and API keys for Clerk, UploadThing, Anthropic, Gemini, and Resend

### Run locally

```bash
npm install
docker compose up -d
npm run db:push
npm run dev
```

In a second terminal, start the Inngest dev server so background functions run:

```bash
npm run inngest
```

Open [http://localhost:3000](http://localhost:3000).

Preview email templates on port 3001:

```bash
npm run email
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint |
| `npm run db:generate` | Generate a Drizzle migration |
| `npm run db:migrate` | Apply migrations |
| `npm run db:push` | Push the schema directly (handy locally) |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run docker:start` | Start the existing Postgres container |
| `npm run inngest` | Inngest dev server pointed at `/api/inngest` |
| `npm run email` | React Email preview server |

## Project layout

```text
src/app
  (job-seeker)/     Public board, favorites, AI search, user settings
  employer/         Organization dashboard, listings, pricing
  (clerk)/          Sign-in and organization select
  api/              Inngest and UploadThing routes
src/features        Job listings, applications, favorites, users, organizations
src/services        Clerk, Inngest, Resend, UploadThing
src/drizzle         Schema, client, and migrations
```

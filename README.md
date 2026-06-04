# Notice Board

A small notice board with full **create, read, update and delete**, built for the
Reno Platforms Web Development Internship assignment.

**Live demo:** https://notice-board-bice.vercel.app/
**Repository:** https://github.com/Vaibhav-12521/notice-board

## Features

- List all notices as responsive cards (phone and desktop).
- One shared form for both **creating** and **editing** a notice; when editing,
  it loads pre-filled with the notice's current values.
- **Delete** asks for confirmation in a dialog before removing a notice.
- **Urgent notices always appear above Normal ones**, ordered in the database
  query (Prisma `orderBy`), with a red **Urgent** badge. Within each priority
  group, newer publish dates come first.
- **Server-side validation** inside the API routes — required fields cannot be
  empty and the date must be valid, even if the browser is bypassed.
- Optional **image URL** per notice (bonus), with a live preview in the form.
- **Search and filter** by text, category and priority — all applied in the
  database query via URL params, not in the browser.
- UX touches: success toasts on create/update/delete, friendly relative dates,
  consistent card headers for image-less notices, and clear empty states.
- **Fast loading:** the list page is statically generated and revalidated in
  the background (ISR), so it's served instantly from the CDN with no
  per-request database query; the client then reconciles to live data on load.

## Tech stack

| Layer        | Choice                                              |
| ------------ | --------------------------------------------------- |
| Framework    | Next.js 14, **Pages Router** (`pages/` directory)   |
| Database access | **Prisma** — schema + all queries via the client |
| Database     | **Supabase** (hosted PostgreSQL, free tier)         |
| Hosting      | **Vercel** (Hobby/free tier)                        |
| Styling      | **Tailwind CSS**                                    |

## API routes

All writes go through API routes under `pages/api/` with the correct HTTP
methods and status codes:

| Method   | Route                | Purpose                          | Status |
| -------- | -------------------- | -------------------------------- | ------ |
| `GET`    | `/api/notices`       | List notices (Urgent first); supports `?q=&category=&priority=` | 200 |
| `POST`   | `/api/notices`       | Create a notice                  | 201 / 400 |
| `GET`    | `/api/notices/:id`   | Fetch a single notice            | 200 / 404 |
| `PUT`    | `/api/notices/:id`   | Update a notice                  | 200 / 400 / 404 |
| `DELETE` | `/api/notices/:id`   | Delete a notice                  | 204 / 404 |

Validation lives in `lib/validation.js` and is called from every write route,
so the rules hold on the server regardless of the client.

## Notice fields

| Field         | Type     | Notes                                |
| ------------- | -------- | ------------------------------------ |
| `title`       | text     | Required                             |
| `body`        | text     | Required                             |
| `category`    | enum     | `Exam` \| `Event` \| `General`       |
| `priority`    | enum     | `Normal` \| `Urgent`                 |
| `publishDate` | date     | Required, must be valid              |
| `imageUrl`    | text?    | Optional image URL (bonus)           |

## Running locally

### 1. Prerequisites

- Node.js 18+ and npm
- A free Supabase project (or any hosted Postgres database)

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the database

Copy the example env file and fill in your Supabase connection strings
(Supabase dashboard → **Project Settings → Database → Connection string → Prisma**):

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://...pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://...pooler.supabase.com:5432/postgres"
```

- `DATABASE_URL` — pooled connection (port 6543) used by the app at runtime.
- `DIRECT_URL` — direct connection (port 5432) used by Prisma for `db push`.

### 4. Create the database tables

```bash
npx prisma db push
```

### 5. (Optional) Seed sample notices

```bash
npx prisma db seed
```

This inserts six demo notices so the board isn't empty on first run.

### 6. Start the dev server

```bash
npm run dev
```

Open <http://localhost:3000>.

## Deploying to Vercel

1. Push this repository to a **public** GitHub repo.
2. Import the repo into Vercel (free Hobby tier).
3. Add the environment variables `DATABASE_URL` and `DIRECT_URL` in the Vercel
   project settings (same values as your `.env`).
4. Deploy. The `build` script runs `prisma generate` automatically.

> The Prisma client is generated on every build via the `build` and
> `postinstall` scripts, so Vercel always has an up-to-date client.

## One thing I would improve with more time

Add **image file uploads** (e.g. Vercel Blob or Supabase Storage) instead of
only accepting an image URL, and **pagination** on the list page so the board
scales past a few dozen notices (the search and category/priority filters are
already implemented and run in the database query). I would also add automated
tests for the API validation logic.

## Where and how AI was used

AI (Claude) was used as a pair-programming assistant to:

- Scaffold the Next.js Pages Router project structure and boilerplate
  (config files, Prisma schema, the shared form and card components).
- Draft the server-side validation logic and the API route handlers.
- Write this README.

Every file was reviewed and adjusted by me. I made the architectural decisions
myself — choosing Supabase Postgres, using Prisma enums so the Urgent-first
ordering is enforceable directly in the database query, and keeping a single
shared form for create and edit. The AI did not have database credentials and
did not deploy the app; database setup and the Vercel deployment were done by me.

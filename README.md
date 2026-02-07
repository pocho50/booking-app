# Reservation App

Nuxt 4 reservation management app with a calendar UI, payments tracking, and an AI assistant chat that can query the database and generate charts/exports or send reports by email.

## Disclaimer (demo/educational only)

This repository is provided **for demonstration and educational purposes only**.

It is **not intended for production use**. It has not been fully tested, security-audited, or hardened.

## Tech stack

- **Framework**: Nuxt 4 (Vue 3)
- **UI**: Nuxt UI
- **AI**: `ai` + `@ai-sdk/vue` + AI Gateway
- **Database**: SQLite + Prisma
- **Charts**: `nuxt-charts` (Unovis / vue-chrts)
- **Email**: Mailgun (`mailgun.js` + `form-data`)

## Features

- **Calendar reservations**
- **Clients & resources**
- **Payments per reservation** (and balance calculation)
- **AI chat page** (`/ia`)
  - Runs **safe SQL SELECT** queries through a tool
  - Generates charts (Line / Bar / Donut)
  - Generates downloadable CSV exports
  - Sends email reports via Mailgun

## Setup

1. Install dependencies

```bash
pnpm install
```

2. Create your env file

```bash
cp .env.example .env
```

3. Configure environment variables (see below)

4. Apply database migrations

```bash
pnpm dlx prisma migrate deploy
```

If you are working locally and want Prisma to manage migrations in development, you can also use:

```bash
pnpm dlx prisma migrate dev
```

5. Seed the database (demo data)

```bash
pnpm seed
```

Demo credentials created by the seed:

- Email: `admin@demo.com`
- Password: `admin123`

6. Run the app

```bash
pnpm dev
```

## Environment variables

To use the AI chat and email features, you will need to create accounts in external services to obtain the required API keys:

- **Vercel (AI Gateway)**: required for `NUXT_AI_GATEWAY_API_KEY`
- **Mailgun**: required for `NUXT_MAILGUN_API_KEY`, `NUXT_MAILGUN_DOMAIN`, `NUXT_MAILGUN_FROM`, `NUXT_MAILGUN_TO`

Set these variables in your `.env` file:

- `DATABASE_URL`
  - SQLite connection string.
  - Example: `file:./dev.db`

- `NUXT_AI_GATEWAY_API_KEY`
  - **Value**: Your Vercel AI Gateway API key.

- `NUXT_MAILGUN_API_KEY`
  - **Value**: Your Mailgun **Private API Key** .

- `NUXT_MAILGUN_DOMAIN`
  - **Value**: Your Mailgun sending domain.
  - Example: `mg.yourdomain.com`

- `NUXT_MAILGUN_FROM`
  - **Value**: Sender address.
  - Example: `Reservation App <noreply@mg.yourdomain.com>`

- `NUXT_MAILGUN_TO`
  - **Value**: Default recipient list (comma-separated).
  - Example: `owner@yourdomain.com, admin@yourdomain.com`

## Scripts

- **Dev**: `pnpm dev`
- **Build**: `pnpm build`
- **Preview**: `pnpm preview`
- **Lint**: `pnpm lint`
- **Typecheck**: `pnpm typecheck`
- **Seed DB**: `pnpm seed`

`postinstall` runs:

- `nuxt prepare`
- `prisma generate`

Note: `prisma generate` generates the Prisma client, but it does not apply migrations. You still need to run migrations at least once for a fresh database.

## AI chat and tools

The chat backend lives in `server/api/chat.ts` and streams responses.

Available tools:

- **`executeSql`**: runs validated **SELECT-only** queries
- **`chartLineTool`**: generates line chart data
- **`chartBarTool`**: generates bar chart data
- **`chartDonutTool`**: generates donut chart data
- **`exportFileTool`**: generates a CSV file and returns a download URL
- **`sendEmailTool`**: sends an email report via Mailgun

### Exports

CSV exports are stored under:

- `.tmp/exports`

The download endpoint is:

- `GET /api/exports/:id`

## License

Private / internal project.

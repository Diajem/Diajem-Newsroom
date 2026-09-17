# Diajem Global Black News

Full-stack DGBN public website and editorial newsroom built with Next.js and MongoDB.

## Local setup

1. Copy `.env.example` to `.env.local` and provide unique secrets.
2. Install dependencies with `npm install`.
3. Start the application with `npm run dev`.
4. Seed a new, empty database once with an authenticated setup request:

```bash
curl -X POST http://localhost:3000/api/seed \
  -H "X-Seed-Secret: $SEED_SECRET"
```

The seed endpoint is disabled unless `SEED_SECRET`, `ADMIN_EMAIL`, and a unique
`ADMIN_PASSWORD` of at least 12 characters are configured. Do not commit any of
those values.

## Production requirements

- Rotate any credentials used by earlier preview deployments.
- Use a dedicated MongoDB user with least-privilege access.
- Configure an HTTPS base URL.
- Replace local filesystem media storage before deploying to ephemeral hosting.
- Run `npm audit --omit=dev` and `npm run build` before release.

## Current integration status

- AI article and script generation uses the configured OpenAI-compatible provider,
  with optional DeepSeek fallback.
- Diajem TV imports existing videos from configured YouTube RSS feeds.
- The video board tracks production work; it does not upload to social platforms.
- Google Sheets export is currently a recorded placeholder, not a live integration.

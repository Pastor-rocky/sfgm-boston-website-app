# Local setup (this machine)

## Done automatically

- **Node.js 20** + npm installed to `~/.local/node/bin`
- **npm dependencies** installed (`npm ci`)
- **Dev scripts** in `scripts/dev.sh` and `scripts/setup-path.sh`

## Add Node to your terminal (one time)

Add this line to `~/.zprofile` (create the file if needed):

```bash
export PATH="$HOME/.local/node/bin:$PATH"
```

Then open a new terminal or run: `source ~/.zprofile`

## Database (required before courses work)

Your `.env` points at `postgresql://rocky@localhost:5432/boston_ministry`, but **PostgreSQL is not running** on this Mac yet.

Pick **one** option:

### Option A — Docker (recommended if you install Docker Desktop)

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. From the project folder:

```bash
docker compose up -d
```

3. Update `.env`:

```env
DATABASE_URL=postgresql://sfgm:sfgm@localhost:5432/boston_ministry
```

4. Apply schema:

```bash
npm run db:push
```

### Option B — Postgres.app (no Docker)

1. Install [Postgres.app](https://postgresapp.com/)
2. Create database `boston_ministry` and user `rocky` (or update `.env` to match your user)
3. Run `npm run db:push`

### Option C — Neon cloud (no local Postgres)

1. Create a free database at [neon.tech](https://neon.tech)
2. Paste the connection string into `.env` as `DATABASE_URL=...?sslmode=require`
3. Run `npm run db:push`

## Run the site

```bash
./scripts/dev.sh
```

Open http://localhost:56000

Health check: http://localhost:56000/api/health

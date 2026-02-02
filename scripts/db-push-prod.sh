#!/usr/bin/env bash
set -euo pipefail

echo ""
echo "SFGM Boston — PRODUCTION DB schema push (manual)"
echo "------------------------------------------------"
echo ""

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "ERROR: DATABASE_URL is not set in this shell."
  echo ""
  echo "Set it temporarily (example):"
  echo "  export DATABASE_URL='postgresql://USER:PASSWORD@HOST/DB?sslmode=require'"
  echo ""
  exit 1
fi

if [[ ! -f "drizzle.config.ts" ]]; then
  echo "ERROR: drizzle.config.ts not found. Run this from repo root."
  exit 1
fi

if [[ ! -x "node_modules/.bin/drizzle-kit" ]]; then
  echo "Installing dependencies (needed for drizzle-kit)…"
  npm install --include=dev
fi

# Redact credentials in printed URL (best-effort)
REDACTED_URL="$(python3 - <<'PYTHON'
import os, re
u=os.environ.get('DATABASE_URL','')
u=u.strip().strip('"').strip("'")
u=re.sub(r"//([^:@/]+):([^@/]+)@", r"//***:***@", u)
print(u)
PYTHON
)"

echo ""
echo "Target DATABASE_URL (redacted):"
echo "  ${REDACTED_URL}"
echo ""
echo "Safety notes:"
echo "- This is MANUAL: nothing runs on Render automatically."
echo "- drizzle-kit may prompt you to confirm changes."
echo "- If it proposes DROP/TRUNCATE, STOP and review before continuing."
echo ""

read -r -p "Type APPLY to continue, anything else to abort: " CONFIRM
if [[ "${CONFIRM}" != "APPLY" ]]; then
  echo "Aborted."
  exit 0
fi

echo ""
echo "Running drizzle-kit push (will prompt for confirmation)…"
echo ""

node_modules/.bin/drizzle-kit push --config drizzle.config.ts --strict

echo ""
echo "Done."

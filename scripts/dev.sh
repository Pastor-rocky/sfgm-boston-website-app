#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=setup-path.sh
source "$ROOT/scripts/setup-path.sh"
cd "$ROOT"
exec npm run dev

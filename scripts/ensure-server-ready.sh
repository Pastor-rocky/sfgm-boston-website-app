#!/bin/bash
# Helper script to ensure server is ready before opening browser
# Usage: ./scripts/ensure-server-ready.sh [port] [max-wait-seconds]

PORT=${1:-56000}
MAX_WAIT=${2:-30}
URL="http://localhost:${PORT}"

echo "🔍 Checking if server is running on port ${PORT}..."

# Check if port is in use
if lsof -ti:${PORT} > /dev/null 2>&1; then
    echo "✅ Server process found on port ${PORT}"
else
    echo "⚠️  No server found on port ${PORT}"
    echo "💡 Start server with: npm run test:local"
    exit 1
fi

# Wait for server to respond
echo "⏳ Waiting for server to respond (max ${MAX_WAIT}s)..."
for i in $(seq 1 ${MAX_WAIT}); do
    if curl -s -o /dev/null -w "%{http_code}" ${URL} 2>/dev/null | grep -q "200\|404"; then
        echo "✅ Server is ready!"
        echo "🌐 Opening: ${URL}"
        exit 0
    fi
    sleep 1
    echo -n "."
done

echo ""
echo "❌ Server did not respond after ${MAX_WAIT} seconds"
echo "💡 Check server logs for errors"
exit 1

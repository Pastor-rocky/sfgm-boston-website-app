#!/bin/bash
# Opens local website in browser after ensuring server is ready
# Usage: ./scripts/open-local-browser.sh [path] [port]

PATH_TO_OPEN=${1:-"/"}
PORT=${2:-56000}
FULL_URL="http://localhost:${PORT}${PATH_TO_OPEN}"

echo "🚀 Opening local browser..."
echo "📍 URL: ${FULL_URL}"
echo ""

# First ensure server is ready
if ! ./scripts/ensure-server-ready.sh ${PORT} 30; then
    echo ""
    echo "❌ Cannot open browser - server not ready"
    echo ""
    echo "📋 To fix this:"
    echo "   1. Start server: npm run test:local"
    echo "   2. Wait for 'serving on port ${PORT}' message"
    echo "   3. Then run this script again"
    exit 1
fi

# Open in default browser
if command -v open > /dev/null; then
    # macOS
    open "${FULL_URL}"
elif command -v xdg-open > /dev/null; then
    # Linux
    xdg-open "${FULL_URL}"
elif command -v start > /dev/null; then
    # Windows
    start "${FULL_URL}"
else
    echo "❌ Cannot determine how to open browser on this system"
    echo "💡 Manually open: ${FULL_URL}"
    exit 1
fi

echo "✅ Browser opened!"

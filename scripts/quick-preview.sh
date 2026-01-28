#!/bin/bash
# Quick preview server - just for checking how things look
# Doesn't require full setup, just serves static files

PORT=${1:-8080}
DIR=${2:-"."}

echo "🚀 Starting quick preview server..."
echo "📍 Port: ${PORT}"
echo "📁 Directory: ${DIR}"
echo ""
echo "🌐 Open: http://localhost:${PORT}"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Try different simple HTTP servers
if command -v python3 > /dev/null; then
    cd "$DIR"
    python3 -m http.server ${PORT}
elif command -v python > /dev/null; then
    cd "$DIR"
    python -m SimpleHTTPServer ${PORT}
elif command -v npx > /dev/null; then
    cd "$DIR"
    npx http-server -p ${PORT} -c-1
else
    echo "❌ No HTTP server found. Install Python or Node.js"
    exit 1
fi

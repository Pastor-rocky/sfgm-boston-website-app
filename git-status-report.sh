#!/bin/bash
# Comprehensive Git status report

echo "=== GIT STATUS REPORT ==="
echo ""

echo "Repository: $(git remote get-url origin 2>/dev/null || echo 'Local only')"
echo "Branch: $(git branch --show-current)"
echo ""

UNCOMMITTED=$(git status --short 2>/dev/null | wc -l | tr -d ' ')
STAGED=$(git diff --staged --name-only 2>/dev/null | wc -l | tr -d ' ')
AHEAD=$(git rev-list --count @{upstream}..HEAD 2>/dev/null || echo "0")

echo "Uncommitted changes: $UNCOMMITTED files"
echo "Staged changes: $STAGED files"
echo "Commits ahead of remote: $AHEAD"
echo ""

echo "=== ADMIN-RELATED CHANGES ==="
echo ""
echo "Admin files with uncommitted changes:"
git status --short 2>/dev/null | grep -i admin || echo "  None"
echo ""

echo "Admin files modified (not committed):"
git diff --name-only 2>/dev/null | grep -i admin || echo "  None"
echo ""

echo "=== RECENT ADMIN WORK (Last 5 commits) ==="
git log --oneline -5 2>/dev/null | grep -i admin || echo "  (No admin commits in last 5)"
echo ""

echo "=== SUMMARY ==="
if [ "$UNCOMMITTED" -gt 0 ]; then
    echo "⚠️  You have $UNCOMMITTED uncommitted changes"
    echo "   These have NOT been committed"
    echo "   These have NOT been pushed to Git"
    echo ""
    echo "   To see what changed: git diff"
    echo "   To commit: git add . && git commit -m 'message'"
    echo "   To push: git push"
fi

if [ "$STAGED" -gt 0 ]; then
    echo "⚠️  You have $STAGED staged changes ready to commit"
fi

if [ "$AHEAD" -gt 0 ]; then
    echo "⚠️  You have $AHEAD commits ready to push"
fi

if [ "$UNCOMMITTED" -eq 0 ] && [ "$STAGED" -eq 0 ] && [ "$AHEAD" -eq 0 ]; then
    echo "✅ Everything is committed and up to date"
fi

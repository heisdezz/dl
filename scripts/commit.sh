#!/usr/bin/env bash
set -euo pipefail

echo "▸ type check..."
bunx tsgo --noEmit

git add -A

if git diff --cached --quiet; then
  echo "nothing to commit"
  exit 0
fi

echo "▸ generating commit message..."
MSG=$(git diff --cached | claude -p "Write a conventional commit message for this diff. Output ONLY the commit message — one line, no explanation, no markdown. Format: type(scope): description")

echo "▸ committing: $MSG"
git commit -m "$MSG"

echo "▸ pushing..."
git push

echo "✓ done"

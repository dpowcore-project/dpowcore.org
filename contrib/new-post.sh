#!/usr/bin/env bash
# new-post.sh — create a new English blog post
# News is English-only. Russian and other locales get mirrors automatically via posts.njk
#
# Usage:
#   ./contrib/new-post.sh "Dpowcoin Core 31.0 Released"
#   ./contrib/new-post.sh "Dpowcoin Core 31.0 Released" 2026-09-01   (custom date)

set -euo pipefail

TITLE="${1:-}"
CUSTOM_DATE="${2:-}"

if [[ -z "$TITLE" ]]; then
  echo "Usage: $0 \"Post Title\" [date=today]"
  echo ""
  echo "Examples:"
  echo "  $0 \"Dpowcoin Core 31.0 Released\""
  echo "  $0 \"Network Update\" 2026-09-01"
  exit 1
fi

# Date
if [[ -n "$CUSTOM_DATE" ]]; then
  DATE_ISO="$CUSTOM_DATE"
else
  DATE_ISO=$(date +%Y-%m-%d)
fi

DD=$(date -d "$DATE_ISO" +%d 2>/dev/null || date -j -f "%Y-%m-%d" "$DATE_ISO" +%d)
MM=$(date -d "$DATE_ISO" +%m 2>/dev/null || date -j -f "%Y-%m-%d" "$DATE_ISO" +%m)
YYYY=$(date -d "$DATE_ISO" +%Y 2>/dev/null || date -j -f "%Y-%m-%d" "$DATE_ISO" +%Y)

FILENAME="post_${DD}_${MM}_${YYYY}.md"
OUTDIR="$(dirname "$0")/../src/en/blog"
OUTFILE="${OUTDIR}/${FILENAME}"

if [[ -f "$OUTFILE" ]]; then
  echo "Error: file already exists: $OUTFILE"
  echo "Use a custom date: $0 \"$TITLE\" $(date +%Y-%m-%d)-2"
  exit 1
fi

# Slug: lowercase, only a-z0-9 and hyphens
SLUG=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9 ]//g' | tr ' ' '-' | sed 's/--*/-/g;s/^-//;s/-$//')

if [[ -z "$SLUG" ]]; then
  echo "Error: title produces empty slug. Use English words in the title."
  exit 1
fi

cat > "$OUTFILE" << MDEOF
---
layout: layouts/post.njk
locale: en
title: "${TITLE}"
summary: ""
permalink: /en/blog/${SLUG}/
# Uncomment for release posts:
# github_release: "https://github.com/dpowcore-project/dpowcoin/releases/tag/vX.Y"
# github_release_label: "GitHub Release vX.Y"
# download_url: /en/wallets/full-node/
# release_notes: "https://github.com/dpowcore-project/dpowcoin/blob/master/doc/release-notes/release-notes-X.Y.md"
---

Write your post content here in Markdown.

## Section heading

Regular paragraph text. **Bold**, *italic*, \`inline code\`.

\`\`\`
code block
\`\`\`

> Blockquote — renders as a highlighted note.

- List item one
- List item two
MDEOF

echo ""
echo "✓ Created: $OUTFILE"
echo ""
echo "  EN URL: /en/blog/${SLUG}/"
echo "  RU URL: /ru/blog/${SLUG}/  ← generated automatically"
echo ""
echo "  1. Edit $OUTFILE"
echo "  2. npm run build"

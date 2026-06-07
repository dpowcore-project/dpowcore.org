#!/usr/bin/env bash
# generate-pdf.sh — regenerate whitepaper.pdf from src/whitepaper.md
#
# Dependencies: apt install pandoc wkhtmltopdf
# Run from project root. Commit src/static/whitepaper.pdf afterwards.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INPUT="$ROOT_DIR/src/whitepaper.md"
OUTPUT="$ROOT_DIR/src/static/whitepaper.pdf"
CSS="$ROOT_DIR/contrib/whitepaper.css"
HEADER="$ROOT_DIR/contrib/whitepaper-header.html"

for f in "$INPUT" "$CSS" "$HEADER"; do
  [[ -f "$f" ]] || { echo "ERROR: $f not found" >&2; exit 1; }
done

if ! command -v pandoc &>/dev/null; then
  echo "ERROR: pandoc not found — apt install pandoc" >&2; exit 1
fi

if command -v wkhtmltopdf &>/dev/null; then
  ENGINE=wkhtmltopdf
elif command -v weasyprint &>/dev/null; then
  ENGINE=weasyprint
else
  echo "ERROR: no PDF engine — apt install wkhtmltopdf" >&2; exit 1
fi

pandoc "$INPUT" \
  --from gfm \
  --to html5 \
  --standalone \
  --metadata title="Bitweb Core White Paper" \
  --css "$CSS" \
  --include-before-body "$HEADER" \
  --pdf-engine="$ENGINE" \
  -o "$OUTPUT"

echo "Generated: $OUTPUT (engine: $ENGINE, size: $(du -sh "$OUTPUT" | cut -f1))"

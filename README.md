# Dpowcoin Core — Website

Static site for [dpowcore.org](https://dpowcore.org), built with [Eleventy](https://www.11ty.dev/) (11ty).

---

## Requirements

- **Node.js** 18 or later
- **npm** (comes with Node.js)

---

## Setup

```bash
npm install
```

---

## Development

Starts a local dev server with live reload at `http://localhost:8080`:

```bash
npm start
```

---

## Build

Outputs to `_site/`:

```bash
npm run build
```

---

## Project Structure

```
src/
├── _data/
│   ├── i18n/
│   │   ├── en.json          # English translations
│   │   └── ru.json          # Russian translations
│   ├── locales.json         # ["en", "ru"]
│   ├── rpc.json             # Generated RPC docs data (see contrib/doc-gen)
│   └── site.js              # Global site metadata (URL, GitHub links, etc.)
│
├── _includes/
│   ├── layouts/
│   │   ├── base.njk         # Root HTML layout (head, nav, footer)
│   │   ├── post.njk         # Blog post layout — wraps markdown content
│   │   └── rpc.njk          # RPC docs layout (sidebar + content)
│   └── partials/
│       ├── nav.njk          # Navigation bar
│       └── footer.njk       # Footer
│
├── static/
│   ├── css/
│   │   ├── bootstrap.min.css
│   │   └── custom.css       # All project-specific styles — edit this
│   ├── js/
│   │   ├── theme.js         # Dark/light/auto theme switcher
│   │   ├── home.js          # Fetches latest release tag from GitHub
│   │   ├── download.js      # Fetches and renders release download cards
│   │   ├── lifecycle.js     # Fetches release history, shows support status
│   │   └── rpc-sidebar.js   # Accordion + search for RPC method sidebar
│   ├── favicon.ico
│   ├── favicon.svg
│   └── apple-touch-icon.png
│
├── en/blog/                 # English blog posts (markdown only — see below)
├── ru/blog/                 # Russian blog posts (markdown only)
│
├── development/rpc/         # RPC docs pages → /en/development/rpc/ and /ru/development/rpc/
│
├── index.njk                # Home page  → /en/ and /ru/
├── about.njk                # About      → /en/about/ and /ru/about/
├── blog/index.njk           # Blog index → /en/blog/ and /ru/blog/
├── brand.njk                # Brand page → /en/brand/ and /ru/brand/
└── ...                      # Other pages follow the same pattern

contrib/
├── new-post.sh              # CLI script to create a new blog post
└── doc-gen/
    └── generate.js          # RPC documentation generator
```

---

## Pages and Localization

Every page template lives in `src/` (or a subdirectory). A single `.njk` file generates
both `/en/page/` and `/ru/page/` via Eleventy pagination:

```njk
---
pagination:
  data: locales
  size: 1
  alias: locale
permalink: "/{{ locale }}/page-name/"
---
{%- set t = i18n[locale] -%}
```

**`src/en/` and `src/ru/` are for blog posts only.** No `.njk` templates go in there.

All UI text lives in `src/_data/i18n/en.json` and `src/_data/i18n/ru.json`.
Never hardcode display text inside templates — add a key to both JSON files instead.

---

## Writing Blog Posts

### Create a post with the helper script

```bash
./contrib/new-post.sh "Post Title"                 # today's date
./contrib/new-post.sh "Post Title" 2026-07-15      # custom date
```

News posts are **English only**. Russian and other locale mirrors are generated
automatically at `/ru/blog/slug/` — no extra steps needed.

### Naming convention

The filename encodes the date — no `date:` key needed in frontmatter:

```
src/en/blog/post_DD_MM_YYYY.md
```

Examples:

```
post_07_06_2026.md   →  7 Jun 2026
post_15_07_2026.md   →  15 Jul 2026
```

Eleventy parses the date automatically from the filename at build time.

### Frontmatter

```yaml
---
layout: layouts/post.njk
locale: en
title: "Post Title"
summary: "Short description shown on the blog index."
permalink: /en/blog/my-post-slug/

# Optional — for release posts:
# github_release: "https://github.com/dpowcore-project/dpowcoin/releases/tag/vX.Y"
# github_release_label: "GitHub Release vX.Y"
# download_url: /en/wallets/full-node/
# release_notes: "https://github.com/dpowcore-project/dpowcoin/blob/master/doc/release-notes/release-notes-X.Y.md"
---
```

When `github_release`, `download_url`, or `release_notes` are set, the layout renders
the action buttons automatically — no HTML needed in the post body.

### Post body — plain Markdown

Write the post content as standard Markdown. No HTML tags.

```markdown
Regular paragraph. **Bold**, *italic*, `inline code`.

## Section heading

> Blockquote — rendered as a highlighted note with an accent left border.

- List item one
- List item two

```code block```

[Link text](https://example.com)
```

---

## RPC Documentation

The RPC method list is generated from a live node and stored in `src/_data/rpc.json`.
To regenerate it:

1. Add the node binaries to PATH (adjust version as needed):
   ```bash
   export PATH="$HOME/dpowcoin-30.3/bin:$PATH"
   ```

2. Start `dpowcoind` in regtest with RPC enabled:
   ```bash
   dpowcoind -regtest -daemon -server=1 -rpcallowip=127.0.0.1 -rpcbind=127.0.0.1
   ```
   Regtest is recommended — starts instantly, no blockchain sync required.

3. Run the generator from the project root:
   ```bash
   cd ~/dpowcore.org
   node contrib/doc-gen/generate.js
   ```
   Outputs `src/_data/rpc.json` with all methods across all categories.

4. Stop the node:
   ```bash
   dpowcoin-cli -regtest stop
   ```

5. Build and commit:
   ```bash
   npm run build
   git add src/_data/rpc.json
   git commit -m "rpc: regenerate docs for v30.3"
   ```

To use a non-default binary path:
```bash
node contrib/doc-gen/generate.js --cli /path/to/dpowcoin-cli
```

---

## Codebase Rules

These apply to all templates, scripts, and styles. The only Russian text allowed is inside
`src/_data/i18n/ru.json` — translations are a separate concern from the codebase itself.

### JavaScript

- `const` / `let` only — never `var`
- No inline JS inside `.njk` templates — JS lives in `src/static/js/*.js`
- `<script src="...">` in templates is fine; `<script>code here</script>` is not

### CSS

- No `style="..."` attributes on HTML elements
- All styles go in `src/static/css/custom.css`

### Templates

- No `.njk` files inside `src/en/` or `src/ru/` — those folders are for blog markdown only
- One template generates both `/en/page/` and `/ru/page/` via pagination (see above)
- Internal links always use `/{{ locale }}/path/` — never hardcode `/en/` or `/ru/`
- Never use `i18n.en` or `i18n.ru` directly — always `i18n[locale]`

### Comments and naming

- All code comments, variable names, template comments, and file names are in English
- Russian exists only in `src/_data/i18n/ru.json` and in the `RU Русский` language switcher label

---

## White Paper

Source: `src/whitepaper.md`. Renders as a web page at `/en/whitepaper/` and `/ru/whitepaper/`, also available as a PDF download.

To regenerate the PDF after editing the whitepaper:

```bash
bash contrib/generate-pdf.sh
```

Then commit `src/static/whitepaper.pdf`. Requires `pandoc` and `wkhtmltopdf`:

```bash
apt install pandoc wkhtmltopdf
```

Same workflow as RPC docs — generate locally, commit the artifact, the build just serves it.

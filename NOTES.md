# Dev Notes — Rules to follow without exception

## Folder structure
- `src/en/` and `src/ru/` = markdown blog posts ONLY. No `.njk` page templates!
- Page templates live in `src/` or `src/subdir/` at the top level
- ONE template → generates `/en/page/` AND `/ru/page/` via Eleventy pagination

## Pagination pattern for all pages
```yaml
---
pagination:
  data: locales
  size: 1
  alias: locale
permalink: "/{{ locale }}/page-name/"
---
{%- set t = i18n[locale] -%}
```

## JavaScript rules
- NEVER `var` — `let` / `const` only
- NEVER inline JS in HTML templates — JS lives in `src/static/js/*.js`
- NEVER inline styles in HTML — styles go in `src/static/css/custom.css`
- `<script src="...">` outside templates = fine. `<script>code here</script>` = forbidden

## Translations
- All display text in `src/_data/i18n/en.json` and `src/_data/i18n/ru.json`
- Internal links always `/{{ locale }}/path/`
- `{%- set t = i18n[locale] -%}` — never `i18n.en` or `i18n.ru`

## RPC pages
- RPC command body (descriptions) is English-only — do NOT translate the content
- But nav, footer, and sidebar UI use the locale → RPC pages ARE locale-prefixed
- Index permalink: `/{{ locale }}/development/rpc/`
- Method pages use `rpc_localized` cross-product data (`src/_data/rpc_localized.js`) + `---js` front matter with `eleventyComputed` to expose `locale` and `method`
- Links inside RPC: always `/{{ locale }}/development/rpc/` (locale-prefixed)

## Language of the codebase
- All code comments, variable names, template comments, file names: English
- Russian belongs only in `src/_data/i18n/ru.json` and the `RU Русский` nav label
- Translations are a separate concern — the codebase itself is English

## What NOT to do
- Do NOT create en/index.njk + ru/index.njk duplicates
- Do NOT add `style="..."` attributes
- Do NOT add `<script>code</script>` inside .njk templates
- Do NOT use `var` in any JS file
- Do NOT move i18n files into en/ru folders
- Do NOT write Russian comments, Russian variable names, or Russian file names in source code

## White Paper

- Source: `src/whitepaper.md` — single source of truth for both the web page and the PDF
- Web page: generated at `/en/whitepaper/` and `/ru/whitepaper/` via locales pagination (`templateEngineOverride: md`)
- Body content is English-only — do NOT translate it; nav/footer/sidebar UI ARE translated via locale
- PDF: pre-generated artifact at `src/static/whitepaper.pdf` — committed to the repo, served at `/static/whitepaper.pdf`
- To update the PDF after editing the whitepaper: run `bash contrib/generate-pdf.sh` (needs `pandoc` + `wkhtmltopdf`, falls back to `weasyprint` if wkhtmltopdf is absent), then commit `src/static/whitepaper.pdf`

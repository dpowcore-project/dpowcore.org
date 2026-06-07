/**
 * i18n loader — auto-discovers all JSON files in i18n/
 * To add a new language: create src/_data/i18n/zh.json
 * No code changes needed — the file is picked up automatically.
 *
 * Missing keys fall back to English in templates via:
 *   i18n[locale].key ?? i18n.en.key
 */
import { readFileSync, readdirSync } from 'fs';
import { resolve, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dir = resolve(__dirname, 'i18n');

const i18n = {};
for (const file of readdirSync(dir)) {
  if (!file.endsWith('.json')) continue;
  const lang = basename(file, '.json');
  i18n[lang] = JSON.parse(readFileSync(resolve(dir, file), 'utf8'));
}

export default i18n;

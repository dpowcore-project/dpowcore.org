/**
 * Auto-generates locale list from i18n/ directory.
 * English is always first; rest sorted alphabetically.
 * To add a new language: create src/_data/i18n/zh.json — done.
 */
import { readdirSync } from 'fs';
import { resolve, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dir = resolve(__dirname, 'i18n');

const langs = readdirSync(dir)
  .filter(f => f.endsWith('.json'))
  .map(f => basename(f, '.json'))
  .sort((a, b) => {
    if (a === 'en') return -1;
    if (b === 'en') return 1;
    return a.localeCompare(b);
  });

export default langs;

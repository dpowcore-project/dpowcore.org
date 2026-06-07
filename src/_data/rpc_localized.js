import { readFileSync, readdirSync } from 'fs';
import { resolve, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Auto-discover locales from i18n/ directory — no locales.json needed
const i18nDir = resolve(__dirname, 'i18n');
const locales = readdirSync(i18nDir)
  .filter(f => f.endsWith('.json'))
  .map(f => basename(f, '.json'))
  .sort((a, b) => (a === 'en' ? -1 : b === 'en' ? 1 : a.localeCompare(b)));

const rpcData = JSON.parse(readFileSync(resolve(__dirname, 'rpc.json'), 'utf8'));

export default locales.flatMap(locale =>
  rpcData.methods.map(method => ({ locale, method }))
);

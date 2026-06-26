import { readFileSync, readdirSync } from 'fs';
import { resolve, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const locales = readdirSync(resolve(__dirname, 'i18n'))
  .filter(f => f.endsWith('.json'))
  .map(f => basename(f, '.json'))
  .sort((a, b) => (a === 'en' ? -1 : b === 'en' ? 1 : a.localeCompare(b)));

const versions = readdirSync(resolve(__dirname, 'rpc'))
  .filter(f => f.endsWith('.json'))
  .map(f => basename(f, '.json'));

export default locales.flatMap(locale =>
  versions.map(version => {
    const data = JSON.parse(readFileSync(resolve(__dirname, 'rpc', `${version}.json`), 'utf8'));
    return { locale, version, rpcData: data };
  })
);

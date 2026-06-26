import { readdirSync } from 'fs';
import { resolve, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const semverParts = (v) => v.split('.').map(n => parseInt(n, 10) || 0);

const semverGt = (a, b) => {
  const pa = semverParts(a);
  const pb = semverParts(b);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff > 0;
  }
  return false;
};

const versions = readdirSync(resolve(__dirname, 'rpc'))
  .filter(f => f.endsWith('.json'))
  .map(f => basename(f, '.json'))
  .sort((a, b) => semverGt(a, b) ? -1 : 1);

const latest = versions[0] ?? null;

export default { versions, latest };

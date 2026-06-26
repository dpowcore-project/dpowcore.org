#!/usr/bin/env node
/**
 * Removes stale unversioned RPC method pages from docs/ output.
 * Run before a full rebuild when switching to versioned URL scheme.
 *
 * Deletes: docs/<locale>/development/rpc/<name>/ where <name> is not a version string
 *          and not index.html
 */

import { readdirSync, rmSync, existsSync } from 'fs';
import { resolve, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const docsDir   = resolve(__dirname, '../../docs');
const locales   = readdirSync(resolve(__dirname, '../../src/_data/i18n'))
  .filter(f => f.endsWith('.json'))
  .map(f => basename(f, '.json'));

const isVersion = (s) => /^\d+\.\d+/.test(s);

let removed = 0;
for (const locale of locales) {
  const rpcDir = resolve(docsDir, locale, 'development', 'rpc');
  if (!existsSync(rpcDir)) continue;
  for (const entry of readdirSync(rpcDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (!isVersion(entry.name)) {
      rmSync(resolve(rpcDir, entry.name), { recursive: true, force: true });
      removed++;
    }
  }
}

console.log(`clean-rpc-docs: removed ${removed} stale director${removed === 1 ? 'y' : 'ies'}`);

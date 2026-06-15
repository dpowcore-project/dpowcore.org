#!/usr/bin/env node
/**
 * Bitweb Core — RPC Documentation Generator
 *
 * Usage:
 *   node contrib/doc-gen/generate.js [options]
 *
 * Options:
 *   --cli <path>      Path to bitweb-cli binary (default: "bitweb-cli")
 *   --chain <name>    Chain: regtest | testnet | mainnet (default: "regtest")
 *   --out <path>      Output JSON path (default: "src/_data/rpc.json")
 *   --rpcuser <u>     RPC username (if not using cookie auth)
 *   --rpcpass <p>     RPC password
 *   --rpcport <port>  RPC port
 *
 * Prerequisites:
 *   (1) bitwebd must be running — regtest recommended (starts instantly)
 *   (2) Run from project root: node contrib/doc-gen/generate.js
 *   (3) Commit the generated src/_data/rpc.json
 */

import { execFileSync } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── CLI argument parsing ─────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const args = {};
for (let i = 0; i < argv.length; i += 2) {
  args[argv[i].replace(/^--/, '')] = argv[i + 1];
}

const CLI_BIN  = args['cli']     ?? 'bitweb-cli';
const CHAIN    = args['chain']   ?? 'regtest';
const OUT_PATH = args['out']     ?? resolve(__dirname, '../../src/_data/rpc.json');
const RPC_USER = args['rpcuser'] ?? null;
const RPC_PASS = args['rpcpass'] ?? null;
const RPC_PORT = args['rpcport'] ?? null;

// ── Helper: run bitweb-cli ───────────────────────────────────────────────────
function run(...cmdArgs) {
  const base = [];
  if (CHAIN === 'regtest')  base.push('-regtest');
  if (CHAIN === 'testnet')  base.push('-testnet');
  if (RPC_USER) base.push(`-rpcuser=${RPC_USER}`);
  if (RPC_PASS) base.push(`-rpcpassword=${RPC_PASS}`);
  if (RPC_PORT) base.push(`-rpcport=${RPC_PORT}`);

  const all = [...base, ...cmdArgs];
  try {
    return execFileSync(CLI_BIN, all, { encoding: 'utf8', timeout: 15000 }).trim();
  } catch (err) {
    const msg = (err.stderr?.toString() ?? err.message).split('\n')[0];
    console.error(`\n✗ Failed: ${CLI_BIN} ${all.join(' ')}`);
    console.error(`  ${msg}`);
    console.error('\nIs bitwebd running?  Try: bitwebd -regtest -daemon');
    process.exit(1);
  }
}

// ── Parse version ────────────────────────────────────────────────────────────
function getVersion() {
  const raw = run('getnetworkinfo');
  let info;
  try { info = JSON.parse(raw); } catch {
    console.error('✗ Could not parse getnetworkinfo JSON'); process.exit(1);
  }
  const v = info.version;
  return `${Math.floor(v / 10000) % 100}.${Math.floor(v / 100) % 100}.${v % 100}`;
}

// ── Parse `help` index into groups ──────────────────────────────────────────
function parseHelpIndex(raw) {
  const groups = [];
  let cur = null;
  for (const line of raw.split('\n')) {
    const s = line.trim();
    if (!s) continue;
    if (s.startsWith('== ') && s.endsWith(' ==')) {
      cur = { name: s.slice(3, -3).toLowerCase(), methods: [] };
      groups.push(cur);
    } else if (cur) {
      const name = s.split(/\s+/)[0];
      if (name) cur.methods.push(name);
    }
  }
  return groups;
}

// ── Main ─────────────────────────────────────────────────────────────────────
console.log('\nBitweb Core RPC Doc Generator');
console.log(`  CLI:   ${CLI_BIN}`);
console.log(`  Chain: ${CHAIN}`);
console.log(`  Out:   ${OUT_PATH}\n`);

console.log('→ Fetching version…');
const version = getVersion();
console.log(`  Version: ${version}\n`);

console.log('→ Fetching help index…');
const groups = parseHelpIndex(run('help'));
const total = groups.reduce((s, g) => s + g.methods.length, 0);
console.log(`  Found ${groups.length} categories, ${total} methods\n`);

const methods = [];
for (const group of groups) {
  console.log(`  [${group.name}] ${group.methods.length} methods`);
  for (const name of group.methods) {
    process.stdout.write(`    • ${name}…`);
    const desc = run('help', name).split('\n').map(l => l.trimEnd()).join('\n');
    methods.push({ name, category: group.name, description: desc });
    process.stdout.write(' ✓\n');
  }
}

const output = { version, generated: new Date().toISOString(), methods };

mkdirSync(dirname(OUT_PATH), { recursive: true });
writeFileSync(OUT_PATH, JSON.stringify(output, null, 2), 'utf8');

console.log(`\n✓ Written ${methods.length} methods → ${OUT_PATH}`);
console.log('  Now run: npm run build\n');

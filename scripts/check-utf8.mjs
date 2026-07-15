#!/usr/bin/env node
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SKIP = new Set(['node_modules', '.next', '.git']);
const EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.css', '.mjs', '.cjs']);

async function walk(dir, files = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, files);
    else if (EXT.has(path.extname(entry.name).toLowerCase())) files.push(full);
  }
  return files;
}

const invalid = [];
for (const file of await walk(ROOT)) {
  const buf = await readFile(file);
  try {
    new TextDecoder('utf-8', { fatal: true }).decode(buf);
  } catch {
    invalid.push(path.relative(ROOT, file));
  }
}

if (invalid.length > 0) {
  console.error('Invalid UTF-8:\n' + invalid.map((f) => `  - ${f}`).join('\n'));
  process.exit(1);
}

console.log('All source files are valid UTF-8.');

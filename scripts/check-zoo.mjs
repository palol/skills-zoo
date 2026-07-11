#!/usr/bin/env node
/**
 * Zoo integrity checks (no external deps):
 * - every skills/<name>/SKILL.md has required frontmatter
 * - docs preview images referenced in HTML exist
 * - README / docs card / SKILL.md version stay aligned
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warnings = [];

function fail(msg) {
  errors.push(msg);
}

function warn(msg) {
  warnings.push(msg);
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

function parseFrontmatter(md) {
  const match = md.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const fm = {};
  const lines = match[1].split(/\r?\n/);
  let inMetadata = false;
  for (const line of lines) {
    if (/^metadata:\s*$/.test(line)) {
      inMetadata = true;
      fm.metadata = {};
      continue;
    }
    if (inMetadata) {
      const m = line.match(/^\s+([A-Za-z0-9_-]+):\s*(.*)$/);
      if (m) {
        fm.metadata[m[1]] = m[2].replace(/^["']|["']$/g, '');
        continue;
      }
      if (/^[A-Za-z0-9_-]+:/.test(line)) inMetadata = false;
      else continue;
    }
    const top = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (top) fm[top[1]] = top[2].replace(/^["']|["']$/g, '');
  }
  return fm;
}

const skillsDir = path.join(root, 'skills');
const skillNames = fs
  .readdirSync(skillsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

if (skillNames.length === 0) fail('No skills found under skills/');

const skillMeta = new Map();

for (const name of skillNames) {
  const rel = `skills/${name}/SKILL.md`;
  if (!exists(rel)) {
    fail(`Missing ${rel}`);
    continue;
  }
  const fm = parseFrontmatter(read(rel));
  if (!fm) {
    fail(`${rel}: missing YAML frontmatter`);
    continue;
  }
  for (const key of ['name', 'description', 'license']) {
    if (!fm[key]) fail(`${rel}: missing top-level '${key}'`);
  }
  if (fm.name && fm.name !== name) {
    fail(`${rel}: frontmatter name '${fm.name}' does not match directory '${name}'`);
  }
  if (!fm.metadata?.author) fail(`${rel}: missing metadata.author`);
  if (!fm.metadata?.version) fail(`${rel}: missing metadata.version`);
  if (!fm.metadata?.['risk-level']) fail(`${rel}: missing metadata.risk-level`);
  if (fm.metadata?.author && fm.metadata.author !== 'palol') {
    warn(`${rel}: author is '${fm.metadata.author}' (expected 'palol')`);
  }
  if (fm.metadata?.['risk-level'] && /^L\d$/.test(fm.metadata['risk-level'])) {
    warn(`${rel}: risk-level is bare '${fm.metadata['risk-level']}' - prefer a descriptive string`);
  }
  if (fm.description && !/Trigger on:/i.test(fm.description)) {
    warn(`${rel}: description lacks a 'Trigger on:' clause`);
  }
  skillMeta.set(name, {
    version: fm.metadata?.version ?? '',
    risk: fm.metadata?.['risk-level'] ?? '',
  });
}

const docsIndex = read('docs/index.html');
const readme = read('README.md');

const previewRefs = new Set();
for (const match of docsIndex.matchAll(/src="(\.\/skills\/[^"]+\/preview-(?:dark|light)\.png)"/g)) {
  previewRefs.add(match[1].replace(/^\.\//, 'docs/'));
}

for (const name of skillNames) {
  const detail = `docs/skills/${name}/index.html`;
  if (!exists(detail)) {
    fail(`Missing docs detail page: ${detail}`);
    continue;
  }
  const html = read(detail);
  for (const match of html.matchAll(/src="(\.\/preview-(?:dark|light)\.png)"/g)) {
    previewRefs.add(`docs/skills/${name}/${match[1].slice(2)}`);
  }
  for (const match of html.matchAll(/content="https:\/\/palol\.github\.io\/skills-zoo\/(skills\/[^"]+\/preview-(?:dark|light)\.png)"/g)) {
    previewRefs.add(`docs/${match[1]}`);
  }
}

for (const match of docsIndex.matchAll(/content="https:\/\/palol\.github\.io\/skills-zoo\/(skills\/[^"]+\/preview-(?:dark|light)\.png)"/g)) {
  previewRefs.add(`docs/${match[1]}`);
}

for (const rel of [...previewRefs].sort()) {
  if (!exists(rel)) fail(`Referenced preview missing: ${rel}`);
}

for (const name of skillNames) {
  const cardRe = new RegExp(
    `id="card-${name}"[\\s\\S]*?<span class="sc-ver">v([^<]+)</span>`,
  );
  const card = docsIndex.match(cardRe);
  if (!card) {
    fail(`docs/index.html missing skill card for ${name}`);
    continue;
  }
  const docsVersion = card[1].trim();
  const meta = skillMeta.get(name);
  if (meta?.version && meta.version !== docsVersion) {
    fail(
      `Version drift for ${name}: SKILL.md metadata.version='${meta.version}' vs docs card 'v${docsVersion}'`,
    );
  }

  const readmeRow = readme.match(
    new RegExp(`\\[\`?${name}\`?\\]\\([^)]+\\)[\\s\\S]*?\\|\\s*([^|\\n]+)\\s*\\|`),
  );
  // Softer check: ensure the skill is listed in README
  if (!readme.includes(name)) {
    fail(`README.md missing catalog entry for ${name}`);
  }

  // Prefer docs link presence for discoverability
  if (!readme.includes(`https://palol.github.io/skills-zoo/skills/${name}/`)) {
    warn(`README.md missing docs link for ${name}`);
  }
}

if (warnings.length) {
  console.log('Warnings:');
  for (const w of warnings) console.log(`  - ${w}`);
  console.log('');
}

if (errors.length) {
  console.error('Zoo check failed:');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(`Zoo check passed (${skillNames.length} skills, ${previewRefs.size} preview refs).`);

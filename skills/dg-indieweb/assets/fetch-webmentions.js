// scripts/fetch-webmentions.js
// Fetches webmentions from webmention.io and saves each as an individual JSON
// file under data/webmentions/ (one per wm-id, deduped). Run by the
// fetch-webmentions GitHub Action, or locally with a .env file.
//
// SECURITY: the API token is read from process.env.WEBMENTION_IO_TOKEN ONLY.
// Never hardcode it — this file is committed to a public repo.
//
// CONFIG: set WEBMENTION_DOMAINS (comma-separated) to the domain(s) you
// registered at webmention.io, e.g. "example.com,www.example.com".
const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config();

const DOMAINS = (process.env.WEBMENTION_DOMAINS || 'example.com,www.example.com')
  .split(',').map(d => d.trim()).filter(Boolean);

function fetchWebmentionsForDomain(domain, token) {
  const url = `https://webmention.io/api/mentions.jf2?domain=${domain}&token=${token}&per-page=1000`;
  return new Promise((resolve, reject) => {
    console.log(`Fetching webmentions for ${domain}...`);
    https.get(url, res => {
      let body = "";
      res.on("data", chunk => body += chunk);
      res.on("end", () => {
        try {
          const response = JSON.parse(body);
          const webmentions = response.children || [];
          if (webmentions.length >= 1000) {
            console.log(`Warning: 1000 webmentions for ${domain} — possible pagination limit.`);
          }
          console.log(`Fetched ${webmentions.length} webmentions for ${domain}`);
          resolve(webmentions);
        } catch (error) { reject(error); }
      });
    }).on("error", reject);
  });
}

async function fetchWebmentions() {
  const token = process.env.WEBMENTION_IO_TOKEN || "";
  if (!token) {
    console.log("No WEBMENTION_IO_TOKEN found — skipping webmentions fetch");
    return [];
  }
  console.log('Fetching webmentions from API for domains:', DOMAINS.join(', '));
  const results = await Promise.all(DOMAINS.map(d => fetchWebmentionsForDomain(d, token)));

  const seen = new Set();
  const unique = [];
  results.flat().forEach(wm => {
    const id = wm["wm-id"];
    if (id && !seen.has(id)) { seen.add(id); unique.push(wm); }
  });
  console.log(`Total after deduplication: ${unique.length}`);
  return unique;
}

function saveWebmentionsAsJSON(webmentions) {
  const dir = path.join(__dirname, '../data/webmentions');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  let saved = 0;
  webmentions.forEach(wm => {
    const id = wm["wm-id"];
    if (!id) { console.log('Skipping webmention without wm-id:', wm.url || 'unknown'); return; }
    const file = path.join(dir, `${id}.json`);
    if (!fs.existsSync(file)) {
      try { fs.writeFileSync(file, JSON.stringify(wm, null, 2)); saved++; }
      catch (e) { console.error(`Failed to save ${id}:`, e.message); }
    }
  });
  console.log(`Saved ${saved} new webmentions`);
  return saved;
}

function loadAllWebmentions() {
  const dir = path.join(__dirname, '../data/webmentions');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith('.json'))
    .map(f => JSON.parse(fs.readFileSync(path.join(dir, f))))
    .sort((a, b) => a["wm-id"] - b["wm-id"]);
}

async function generateWebmentions() {
  const fromAPI = await fetchWebmentions();
  const newCount = saveWebmentionsAsJSON(fromAPI);
  const total = loadAllWebmentions().length;
  console.log(`Webmentions: ${fromAPI.length} from API, ${total} total, ${newCount} new`);
  return { total, new: newCount, fromAPI: fromAPI.length };
}

if (require.main === module) {
  generateWebmentions().catch(e => { console.error('Failed:', e); process.exit(1); });
}

module.exports = { generateWebmentions, fetchWebmentions };

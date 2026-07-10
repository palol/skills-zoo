// scripts/send-webmentions.js
// Reads your published sitemap, decides which pages need an (re)outgoing
// webmention using a dedupe log + backoff, builds a temp RSS feed, and hands
// it to the `webmention` CLI (@remy/webmention) to notify every external link.
// Run by the send-webmentions GitHub Action, or locally.
//
// CONFIG: set SITE_URL to your deployed base URL (no trailing slash), e.g.
//   SITE_URL=https://www.example.com
const { parseStringPromise } = require('xml2js');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const SITE_URL = (process.env.SITE_URL || 'https://www.example.com').replace(/\/$/, '');
const SITE_TITLE = process.env.SITE_TITLE || 'Digital Garden';

const WEBMENTION_LOG_FILE = path.join(__dirname, '..', 'data/webmentions-sent.log');
const WEBMENTION_TEST_LOG_FILE = path.join(__dirname, '..', 'data/webmentions-test.log');

async function loadWebmentionLog(isTest = false) {
  const logFile = isTest ? WEBMENTION_TEST_LOG_FILE : WEBMENTION_LOG_FILE;
  try {
    if (fs.existsSync(logFile)) {
      const log = {};
      fs.readFileSync(logFile, 'utf8').split('\n').forEach(line => {
        if (line.trim()) { const [url, ts] = line.split('\t'); log[url] = new Date(ts); }
      });
      return log;
    }
    return {};
  } catch { console.log('Warning: could not load webmention log, starting fresh'); return {}; }
}

function saveWebmentionLog(log, isTest = false) {
  const logFile = isTest ? WEBMENTION_TEST_LOG_FILE : WEBMENTION_LOG_FILE;
  const entries = Object.entries(log).map(([url, date]) => `${url}\t${date.toISOString()}`).join('\n');
  fs.writeFileSync(logFile, entries + '\n');
}

function shouldSendWebmention(url, lastModified, lastSent, minDaysBetween = 7) {
  if (!lastSent) return { send: true, reason: 'never sent before' };
  const daysSinceSent = (Date.now() - lastSent.getTime()) / 864e5;
  if (daysSinceSent < minDaysBetween)
    return { send: false, reason: `sent ${Math.round(daysSinceSent)}d ago (min ${minDaysBetween}d)` };
  if (new Date(lastModified) > lastSent)
    return { send: true, reason: `page updated since last send` };
  if (daysSinceSent >= 30)
    return { send: true, reason: `periodic refresh (${Math.round(daysSinceSent)}d)` };
  return { send: false, reason: `no update needed (last sent ${Math.round(daysSinceSent)}d ago)` };
}

async function runWebmention(rssFile, isTest = false) {
  const action = isTest ? '--test' : '--send';
  return new Promise((resolve, reject) => {
    const wm = spawn('npx', ['webmention', rssFile, '--limit', '0', action], { stdio: ['inherit', 'pipe', 'pipe'] });
    let out = '', err = '';
    wm.stdout.on('data', d => { process.stdout.write(d); out += d; });
    wm.stderr.on('data', d => { process.stderr.write(d); err += d; });
    wm.on('close', code => code === 0 ? resolve({ out, err })
      : reject(new Error(`webmention ${isTest ? 'test' : 'send'} exit ${code}: ${err}`)));
  });
}

async function sendWebmentions(isTest = false) {
  try {
    const mode = isTest ? 'TEST' : 'PRODUCTION';
    const log = await loadWebmentionLog(isTest);

    console.log('📡 Fetching sitemap...');
    const res = await fetch(`${SITE_URL}/sitemap.xml`);
    const sitemap = await parseStringPromise(await res.text());
    const urls = sitemap.urlset.url.map(u => ({
      url: u.loc[0], lastmod: u.lastmod ? u.lastmod[0] : new Date().toISOString()
    }));
    console.log(`📄 ${urls.length} URLs · mode ${mode}`);

    const toProcess = [], skipped = [];
    for (const item of urls) {
      const d = shouldSendWebmention(item.url, item.lastmod, log[item.url]);
      (d.send ? toProcess : skipped).push(item);
      console.log(`${d.send ? '✅' : '⏭️ '} ${item.url} — ${d.reason}`);
    }
    if (!toProcess.length) { console.log(`🎉 Nothing to send in ${mode}`); return; }

    const items = toProcess.map(i => `
      <item><title>${i.url.split('/').pop() || 'Page'}</title>
        <link>${i.url}</link><guid>${i.url}</guid>
        <pubDate>${new Date(i.lastmod).toUTCString()}</pubDate></item>`).join('');
    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>${SITE_TITLE} — Webmentions ${mode}</title>
  <description>Updated pages for webmention ${isTest ? 'testing' : 'processing'}</description>
  <link>${SITE_URL}</link><lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}
</channel></rss>`;

    const tmp = path.join(__dirname, `temp-webmention-feed${isTest ? '-test' : ''}.xml`);
    fs.writeFileSync(tmp, rss);
    try {
      await runWebmention(tmp, isTest);
      const now = new Date();
      toProcess.forEach(i => { log[i.url] = now; });
      saveWebmentionLog(log, isTest);
      console.log(`✅ ${mode} log updated`);
    } finally { if (fs.existsSync(tmp)) fs.unlinkSync(tmp); }

    console.log(`📊 ${mode}: sent ${toProcess.length}, skipped ${skipped.length}, total ${urls.length}`);
  } catch (e) { console.error('💥', e); process.exit(1); }
}

if (require.main === module) {
  sendWebmentions(process.argv.includes('--test') || process.argv.includes('-t'));
}
module.exports = { sendWebmentions };

// src/site/_data/vaultStats.js
// Build-time vault analytics for the obsifetch tribute. Exposes `vaultStats`
// to templates: file counts + sizes, orphan detection, internal-link count,
// theme name/appearance, and the site domain. Read-only scan of the built
// notes/files/img trees — no network, no writes.
//
// CONFIG: the domain is read from SITE_DOMAIN (env) or meta.domain; edit the
// fallback string below if you prefer to hardcode it.
const fs = require('fs');
const path = require('path');

function formatBytes(bytes, decimals = 1) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

function scanDirectory(dirPath) {
  const files = { markdown: [], attachments: [], all: [] };
  const ATTACH = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.svg'];
  function walkDir(currentPath) {
    let items;
    try { items = fs.readdirSync(currentPath); }
    catch (e) { console.warn(`vaultStats: cannot scan ${currentPath}: ${e.message}`); return; }
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      let stat;
      try { stat = fs.statSync(fullPath); } catch { continue; }
      if (stat.isDirectory()) { walkDir(fullPath); continue; }
      if (!stat.isFile()) continue;
      const ext = path.extname(item).toLowerCase();
      const rec = { path: path.relative(process.cwd(), fullPath), size: stat.size, name: item };
      files.all.push(rec);
      if (ext === '.md') files.markdown.push(rec);
      else if (ATTACH.includes(ext)) files.attachments.push(rec);
    }
  }
  walkDir(dirPath);
  return files;
}

function countInternalLinks(markdownFiles) {
  const linkPattern = /\[\[([^\]]+)\]\]/g;
  let n = 0;
  for (const f of markdownFiles) {
    try { const m = fs.readFileSync(f.path, 'utf8').match(linkPattern); if (m) n += m.length; }
    catch (e) { console.warn(`vaultStats: cannot read ${f.path}: ${e.message}`); }
  }
  return n;
}

function countOrphanFiles(files) {
  const mdFiles = files.filter(f => path.extname(f.name).toLowerCase() === '.md');
  const linkedBaseNames = new Set();
  const filesWithOutgoingLinks = new Set();
  const linkPatterns = [
    /\[\[([^\]]+?)\]\]/g,
    /\[\[([^\]]+?)\\\|[^\]]*\]\]/g,
    /\[\[([^\]]+?)\|[^\]]*\]\]/g,
  ];
  const normalizedToActual = new Map();
  for (const file of mdFiles) {
    const base = path.basename(file.name, '.md');
    normalizedToActual.set(base.toLowerCase().trim(), base);
    const rel = file.path.replace(/\\/g, '/');
    const fromNotes = rel.split('src/site/notes/')[1];
    if (fromNotes) normalizedToActual.set(fromNotes.replace('.md', '').toLowerCase().trim(), base);
  }
  for (const file of mdFiles) {
    let content;
    try { content = fs.readFileSync(file.path, 'utf8'); } catch { continue; }
    const fileBase = path.basename(file.name, '.md');
    let hasOutgoing = false;
    for (const lp of linkPatterns) {
      const regex = new RegExp(lp.source, lp.flags);
      let match;
      while ((match = regex.exec(content)) !== null) {
        const target = match[1].split('#')[0].trim();
        if (!target) continue;
        const nt = target.toLowerCase().trim();
        let actual = null;
        if (normalizedToActual.has(nt)) actual = normalizedToActual.get(nt);
        else if (target.includes('/')) {
          const justName = target.split('/').pop().toLowerCase().trim();
          if (normalizedToActual.has(justName)) actual = normalizedToActual.get(justName);
        }
        if (actual) { linkedBaseNames.add(actual); hasOutgoing = true; }
      }
    }
    if (hasOutgoing) filesWithOutgoingLinks.add(fileBase);
  }
  let orphans = 0;
  for (const file of mdFiles) {
    const base = path.basename(file.name, '.md');
    if (!linkedBaseNames.has(base) && !filesWithOutgoingLinks.has(base)) orphans++;
  }
  return orphans;
}

function getThemeInfo() {
  let themeName = process.env.THEME || 'default';
  if (themeName.includes('/')) {
    const known = ['typewriter', 'retroma', 'things', 'catppuccin'];
    const hit = known.find(k => themeName.toLowerCase().includes(k));
    if (hit) themeName = hit;
    else {
      const part = themeName.split('/').find(p => p.includes('obsidian-') && !p.includes('.css'));
      themeName = part ? part.replace('obsidian-', '') : 'custom';
    }
  }
  return { name: themeName, appearance: process.env.BASE_THEME || 'light' };
}

module.exports = function () {
  const notes = scanDirectory(path.join(process.cwd(), 'src', 'site', 'notes'));
  const filesDir = scanDirectory(path.join(process.cwd(), 'src', 'site', 'files'));
  const imgDir = scanDirectory(path.join(process.cwd(), 'src', 'site', 'img'));

  const allMarkdown = [...notes.markdown];
  const allAttachments = [...notes.attachments, ...filesDir.attachments, ...imgDir.attachments];
  const allFiles = [...allMarkdown, ...allAttachments];

  const totalSize = allFiles.reduce((s, f) => s + f.size, 0);
  const markdownSize = allMarkdown.reduce((s, f) => s + f.size, 0);
  const attachmentSize = allAttachments.reduce((s, f) => s + f.size, 0);

  return {
    // CONFIG: your published domain. SITE_DOMAIN env wins; else edit fallback.
    domain: process.env.SITE_DOMAIN || 'example.com',
    lastUpdated: new Date().toISOString().split('T')[0],
    files: {
      total: { count: allFiles.length, size: formatBytes(totalSize) },
      markdown: { count: allMarkdown.length, size: formatBytes(markdownSize) },
      attachments: { count: allAttachments.length, size: formatBytes(attachmentSize) },
    },
    orphanFiles: countOrphanFiles(allFiles),
    internalLinks: countInternalLinks(allMarkdown),
    theme: getThemeInfo(),
  };
};

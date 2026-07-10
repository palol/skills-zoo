// Post-build script to generate dungeon data from sitemap
const fs = require('fs');
const path = require('path');
const { parse } = require('node-html-parser');
const matter = require('gray-matter');
const { generateHexSpiral } = require('../src/helpers/hex-spiral.js');

// Fixed icon directory path (site template)
const ICON_DIR = path.join(__dirname, '../src/site/img');
const ICON_EXTENSIONS = ['.png', '.svg', '.jpg', '.webp'];
const EXCLUDED_ICON_NAMES = [];

/**
 * Build icon type -> URL map from the contents of the icon directory.
 * Returns an object like { 'tree-1': '/img/tree-1.svg', ... }.
 */
function buildIconMapFromDirectory() {
  try {
    const files = fs.readdirSync(ICON_DIR);
    const map = {};
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (!ICON_EXTENSIONS.includes(ext)) continue;
      const key = path.basename(file, ext);
      if (EXCLUDED_ICON_NAMES.includes(key)) continue;
      map[key] = '/img/' + path.basename(file);
    }
    return map;
  } catch (err) {
    return {};
  }
}

/**
 * Sort items by creation date only. First date = first tile, last date = last content tile.
 * Home/exit styling is applied by name/flag in the renderer, not by position.
 */
function sortContentItemsByDate(dungeonItems) {
  return [...dungeonItems].sort((a, b) => {
    const dateA = a[4] || new Date();
    const dateB = b[4] || new Date();
    return new Date(dateA) - new Date(dateB);
  });
}

/**
 * Gets the first n digits of pi (pattern e.g. 3,1,4,1,5,9,...)
 */
function getPiDigits(n) {
  const piString = "3141592653589793238462643383279502884197169399375105820974944592307816406286208998628034825342117067";
  const digits = [];
  for (let i = 0; i < Math.min(n, piString.length); i++) {
    digits.push(parseInt(piString[i]));
  }
  return digits;
}

/**
 * Build virtual tile list with pi-based filler interspersion.
 * Each tile is { item: contentItem | null, isAmbient: boolean }.
 * Content is in date order
 */
function createVirtualTileList(contentItems) {

  const piDigits = getPiDigits(100);
  const virtualTiles = [];
  let itemIndex = 0;
  let piIndex = 0;

  while (itemIndex < contentItems.length && piIndex < piDigits.length - 1) {
    const itemsToPlace = piDigits[piIndex];
    const ambientToPlace = piDigits[piIndex + 1];

    for (let i = 0; i < itemsToPlace && itemIndex < contentItems.length; i++) {
      virtualTiles.push({ item: contentItems[itemIndex++], isAmbient: false });
    }

    const remainingItems = contentItems.length - itemIndex;
    if (remainingItems > 0) {
      for (let i = 0; i < ambientToPlace; i++) {
        virtualTiles.push({ item: null, isAmbient: true });
      }
    }
    piIndex += 2;
  }

  while (itemIndex < contentItems.length) {
    virtualTiles.push({ item: contentItems[itemIndex++], isAmbient: false });
  }



  return virtualTiles;
}

/**
 * Build pathway connections for SVG (optional). Return empty for now; spiral is drawn from hexData.
 */
function buildPathwayConnections(hexData) {
  return [];
}

/**
 * Generates dungeon data after build using sitemap or file system
 */
async function generateDungeonData() {
  console.log('[DEBUG] Starting post-build dungeon data generation...');

  try {
    const rawItems = await getDungeonItemsFromSources();
    const contentItems = sortContentItemsByDate(rawItems);

    if (contentItems.length === 0) {
      console.log('[DEBUG] No dungeon items found, creating empty data');
      return createEmptyDungeonData();
    }

    console.log(`[DEBUG] Found ${contentItems.length} items for dungeon`);

    const virtualTileList = createVirtualTileList(contentItems);
    const totalSlots = virtualTileList.length;
    const spiralPositions = generateHexSpiral(totalSlots, 28, 24);

    const hexData = [];
    for (let i = 0; i < totalSlots; i++) {
      const pos = spiralPositions[i];
      const tile = virtualTileList[i];
      hexData.push({
        q: pos.q,
        r: pos.r,
        x: pos.x,
        y: pos.y,
        ring: pos.ring,
        item: tile.isAmbient ? null : tile.item,
        isAtmosphere: tile.isAmbient
      });
    }

    const pathwayConnections = buildPathwayConnections(hexData);
    const hexGridData = { hexData, pathwayConnections };

    // Calculate legends from icon map (fixed icon path)
    const iconMap = buildIconMapFromDirectory();
    const noteLabels = {};
    for (const key of Object.keys(iconMap)) {
      noteLabels[key] = { label: key, count: 0, icon: key };
    }

    const itemCounts = JSON.parse(JSON.stringify(noteLabels));
    contentItems.forEach(item => {
      const iconType = item[0];
      if (itemCounts[iconType]) {
        itemCounts[iconType].count++;
      }
    });

    const legends = Object.values(itemCounts)
      .filter(c => c.count > 0)
      .sort((a, b) => b.count - a.count);

    const dungeonData = {
      hexGridData,
      dungeonItems: contentItems,
      legends,
      generatedAt: new Date().toISOString(),
      itemCount: contentItems.length
    };

    const outputPath = path.join(__dirname, '../dist/data/dungeon-data.json');
    await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.promises.writeFile(outputPath, JSON.stringify(dungeonData, null, 2));

    const eleventyDataPath = path.join(__dirname, '../src/site/_data/dungeonData.json');
    await fs.promises.mkdir(path.dirname(eleventyDataPath), { recursive: true });
    await fs.promises.writeFile(eleventyDataPath, JSON.stringify(dungeonData, null, 2));

    console.log(`[DEBUG] Dungeon data written to ${outputPath}`);
    console.log(`[DEBUG] Dungeon data copied to ${eleventyDataPath}`);
    return dungeonData;
  } catch (error) {
    console.error('[ERROR] Failed to generate dungeon data:', error);
    return createEmptyDungeonData();
  }
}

/**
 * Get dungeon items from multiple sources
 */
async function getDungeonItemsFromSources() {
  const items = [];
  
  // Try sitemap first
  try {
    const sitemapItems = await getDungeonItemsFromSitemap();
    if (sitemapItems.length > 0) {
      console.log(`[DEBUG] Got ${sitemapItems.length} items from sitemap`);
      return sitemapItems;
    }
  } catch (error) {
    console.log('[DEBUG] Sitemap method failed, trying file system approach');
  }
  
  // Fallback to file system
  try {
    const fsItems = await getDungeonItemsFromFileSystem();
    console.log(`[DEBUG] Got ${fsItems.length} items from file system`);
    return fsItems;
  } catch (error) {
    console.error('[ERROR] File system method failed:', error);
    return [];
  }
}

/**
 * Extract dungeon items from generated sitemap
 */
async function getDungeonItemsFromSitemap() {
  const sitemapPath = path.join(__dirname, '../dist/sitemap.xml');
  
  if (!fs.existsSync(sitemapPath)) {
    throw new Error('Sitemap not found');
  }
  
  const sitemapContent = await fs.promises.readFile(sitemapPath, 'utf8');
  const sitemapDoc = parse(sitemapContent);
  
  const noteUrls = [];
  const urlElements = sitemapDoc.querySelectorAll('url loc');
  
  urlElements.forEach(loc => {
    const url = loc.innerHTML;
    if (url.includes('/notes/') && !url.endsWith('/notes/')) {
      noteUrls.push(url);
    }
  });
  
  console.log(`[DEBUG] Found ${noteUrls.length} note URLs in sitemap`);
  
  // Convert URLs back to file paths and extract metadata
  const dungeonItems = [];
  
  for (const url of noteUrls) {
    try {
      const item = await extractItemFromUrl(url);
      if (item) { // Only add non-hidden items
        dungeonItems.push(item);
      }
    } catch (error) {
      console.warn(`[WARN] Failed to process URL ${url}:`, error.message);
    }
  }
  
  return dungeonItems;
}

/**
 * Extract dungeon items directly from file system
 */
async function getDungeonItemsFromFileSystem() {
  const notesDir = path.join(__dirname, '../src/site/notes');
  const noteFiles = await findMarkdownFiles(notesDir);
  
  const dungeonItems = [];
  
  for (const filePath of noteFiles) {
    try {
      const item = await extractItemFromFile(filePath);
      if (item) { // Only add non-hidden items
        dungeonItems.push(item);
      }
    } catch (error) {
      console.warn(`[WARN] Failed to process file ${filePath}:`, error.message);
    }
  }
  
  return dungeonItems;
}

/**
 * Recursively find all markdown files
 */
async function findMarkdownFiles(dir) {
  const files = [];
  
  async function traverse(currentDir) {
    const entries = await fs.promises.readdir(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        await traverse(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  }
  
  await traverse(dir);
  return files;
}

/**
 * Extract item data from URL (reverse engineering)
 */
async function extractItemFromUrl(url) {
  // Extract slug from URL
  const urlParts = url.split('/');
  const slug = urlParts[urlParts.length - 1];
  
  // Try to find corresponding file
  const notesDir = path.join(__dirname, '../src/site/notes');
  const possiblePaths = [
    path.join(notesDir, `${slug}.md`),
    // Add more possible path patterns if needed
  ];
  
  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      const item = await extractItemFromFile(filePath, url);
      return item; // This will be null for hidden files
    }
  }
  
  // If file not found, check if it's a hidden URL and skip it
  // But don't skip the exit URL or home URL
  if (slug.toLowerCase() === 'hidden' && slug !== 'exit' && slug !== 'home') {
    console.log(`[DEBUG] Skipping hidden URL: ${url}`);
    return null;
  }
  
  // If file not found, create minimal item from URL
  return [
    'tree-1', // default icon
    url,
    slug,
    2, // default height
    new Date(), // default date
    false // not home page
  ];
}

/**
 * Extract item data from file
 */
async function extractItemFromFile(filePath, url = null) {
  const fileContent = await fs.promises.readFile(filePath, 'utf8');
  const frontMatter = matter(fileContent);
  
  const fileName = path.basename(filePath, '.md').toLowerCase();
  
  // Check if file should be hidden from dungeon
  // Don't hide the exit file or home page even if they contain "hidden" logic
  if (fileName === 'hidden') {
    console.log(`[DEBUG] Skipping hidden file: ${filePath}`);
    return null; // Return null for hidden files
  }
  
  // Use permalink field if available, otherwise generate URL
  if (!url) {
    if (frontMatter.data.permalink) {
      url = frontMatter.data.permalink;
      console.log(`[DEBUG] Using permalink for ${fileName}: ${url}`);
    } else {
      const relativePath = path.relative(path.join(__dirname, '../src/site/notes'), filePath);
      const slug = relativePath.replace(/\.md$/, '').replace(/\\/g, '/');
      url = `/notes/${slug}`;
      console.log(`[DEBUG] Generated URL for ${fileName}: ${url}`);
    }
  }
  
  // Extract icon (JSON/Obsidian often exports noteIcon as string "1"; map to tree-1 like numeric 1)
  const rawIcon = frontMatter.data.noteIcon;
  let icon;
  let height = 2;
  if (rawIcon === undefined || rawIcon === null || rawIcon === '') {
    icon = 'tree-1';
  } else if (typeof rawIcon === 'number') {
    height = rawIcon;
    icon = `tree-${rawIcon}`;
  } else if (typeof rawIcon === 'string' && /^\d+$/.test(rawIcon.trim())) {
    const n = parseInt(rawIcon.trim(), 10);
    height = n;
    icon = `tree-${n}`;
  } else {
    icon = String(rawIcon);
  }
  
  // Extract dates
  const createdDate = frontMatter.data['date created'] || 
                     frontMatter.data.created || 
                     frontMatter.data.date || 
                     new Date();
  
  // Check if home page
  const isHomePage = frontMatter.data['dg-home'] === true || fileName === 'home';
  
  // Extract title
  const title = frontMatter.data.title || 
                path.basename(filePath, '.md');
  
  console.log(`[DEBUG] Processing ${fileName}: icon=${icon}, height=${height}, isHome=${isHomePage}, url=${url}`);
  
  return [
    icon,
    url,
    title,
    height,
    createdDate,
    isHomePage
  ];
}

/**
 * Create empty dungeon data (compatible with new hex-spiral shape)
 */
function createEmptyDungeonData() {
  return {
    hexGridData: {
      hexData: [],
      pathwayConnections: []
    },
    dungeonItems: [],
    legends: [],
    generatedAt: new Date().toISOString(),
    itemCount: 0
  };
}

// Run if called directly
if (require.main === module) {
  generateDungeonData()
    .then(() => {
      console.log('[DEBUG] Dungeon data generation completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('[ERROR] Dungeon data generation failed:', error);
      process.exit(1);
    });
}

module.exports = { generateDungeonData };

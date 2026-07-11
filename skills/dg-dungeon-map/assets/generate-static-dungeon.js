// Enhanced script to generate both dungeon data AND static SVG
const fs = require('fs');
const path = require('path');
const { generateDungeonData } = require('./generate-dungeon-data.js');

// Fixed icon directory path (site template)
const ICON_DIR = path.join(__dirname, '../src/site/img');
const ICON_EXTENSIONS = ['.png', '.svg', '.jpg', '.webp'];
const EXCLUDED_ICON_NAMES = [];

/**
 * Build icon type -> URL map from the contents of the icon directory.
 * Returns an object like { 'tree-1': '/img/tree-1.svg', ... }.
 * Uses the file's real extension. Excludes non-dungeon assets. Returns {} if directory is missing or empty.
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
 * Generate static SVG dungeon map and coordinate mappings
 */
async function generateStaticDungeon() {
  console.log('[DEBUG] Generating static dungeon map...');
  
  try {
    // Get the dungeon data (reuse existing logic)
    const dungeonData = await generateDungeonData();
    
    if (!dungeonData || dungeonData.hexGridData.hexData.length === 0) {
      console.log('[DEBUG] No dungeon data available, skipping SVG generation');
      return;
    }
    
    // Generate SVG
    const svg = generateDungeonSVG(dungeonData);
    
    // Generate coordinate mapping for star positioning
    const coordinateMap = generateCoordinateMapping(dungeonData);
    
    // Write SVG file
    const svgPath = path.join(__dirname, '../dist/img/dungeon-map.svg');
    await fs.promises.mkdir(path.dirname(svgPath), { recursive: true });
    await fs.promises.writeFile(svgPath, svg);
    
    // Write coordinate mapping
    const coordPath = path.join(__dirname, '../dist/data/dungeon-coordinates.json');
    await fs.promises.writeFile(coordPath, JSON.stringify(coordinateMap, null, 2));
    
    console.log(`[DEBUG] Static dungeon map generated:`);
    console.log(`  SVG: ${svgPath}`);
    console.log(`  Coordinates: ${coordPath}`);
    
    return { svg, coordinateMap };
    
  } catch (error) {
    console.error('[ERROR] Failed to generate static dungeon:', error);
    throw error;
  }
}

/**
 * Generate SVG content from dungeon data
 */
function generateDungeonSVG(dungeonData) {

  const { hexGridData } = dungeonData;
  // Compute bounds of all hexes (including atmosphere and content)
  const allHexes = hexGridData.hexData;
  if (!allHexes.length) return '';

  // Find min/max x/y
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  allHexes.forEach(hex => {
    if (hex.x < minX) minX = hex.x;
    if (hex.x > maxX) maxX = hex.x;
    if (hex.y < minY) minY = hex.y;
    if (hex.y > maxY) maxY = hex.y;
  });

  // Add padding
  const padding = 20;
  minX -= padding;
  maxX += padding;
  minY -= padding;
  maxY += padding;

  const width = maxX - minX;
  const height = maxY - minY;

  // All hexes will be offset by (-minX, -minY) to fit in the new viewBox
  const offsetX = -minX;
  const offsetY = -minY;

  const iconMap = buildIconMapFromDirectory();

  let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <!-- Hexagon clip path -->
    <clipPath id="hexClip">
      <polygon points="20,0 80,0 100,50 80,100 20,100 0,50"/>
    </clipPath>
    
    <!-- Gradient definitions for different hex types -->
    <linearGradient id="contentHex" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:rgba(34,139,34,0.5);stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgba(34,139,34,0.7);stop-opacity:1" />
    </linearGradient>
    
    <linearGradient id="homeHex" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:rgba(255,215,0,0.7);stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgba(255,215,0,0.9);stop-opacity:1" />
    </linearGradient>
    
    <linearGradient id="exitHex" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:rgba(184,134,11,0.8);stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgba(146,106,8,0.9);stop-opacity:1" />
    </linearGradient>

    <linearGradient id="voidHex" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:rgba(0, 0, 0, 0.8);stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgba(0,0,0,0.9);stop-opacity:1" />
    </linearGradient>
    
    <!-- Ambient hex gradients that will be styled with CSS variables -->
    <linearGradient id="ambientDark" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" class="ambient-dark-start" />
      <stop offset="100%" class="ambient-dark-end" />
    </linearGradient>
    
    <linearGradient id="ambientLight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" class="ambient-light-start" />
      <stop offset="100%" class="ambient-light-end" />
    </linearGradient>
  </defs>
  
  <!-- Styles that use CSS variables from the theme -->
  <style>
    .ambient-dark-start { stop-color: var(--background-primary, rgb(32, 31, 31)); stop-opacity: 0.4; }
    .ambient-dark-end { stop-color: var(--background-primary, rgb(32, 31, 31)); stop-opacity: 0.6; }
    .ambient-light-start { stop-color: var(--background-secondary, rgb(57, 56, 56)); stop-opacity: 0.3; }
    .ambient-light-end { stop-color: var(--background-secondary, rgb(57, 56, 56)); stop-opacity: 0.5; }
    .ambient-center-dark { fill: var(--text-muted, rgba(255,255,255,0.8)); }
    .ambient-center-light { fill: var(--text-faint, rgba(0, 0, 0, 0.8)); }
  </style>
  
  <!-- No background rect: SVG will be fully transparent -->
`;

  // Render pathway connections first (behind everything) - continuous white lines through pathways
  if (hexGridData.pathwayConnections && hexGridData.pathwayConnections.length > 0) {
    hexGridData.pathwayConnections.forEach(pathway => {
      // Draw lines connecting each hex in the pathway
      for (let i = 0; i < pathway.hexes.length - 1; i++) {
        const currentHex = pathway.hexes[i];
        const nextHex = pathway.hexes[i + 1];
        // Use pre-calculated pixel coordinates from hexagonGrid
        const x1 = currentHex.x + offsetX;
        const y1 = currentHex.y + offsetY;
        const x2 = nextHex.x + offsetX;
        const y2 = nextHex.y + offsetY;
        svgContent += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
          stroke="rgba(255,255,255,0.8)" stroke-width="2" opacity="0.9"/>`;
      }
    });
  }

  // Render the main spiral path - one continuous line from start to end
  // Connect ALL hexes in spiral order (content + ambient) to form the meditation path... clock-wise. 
  const allHexesInOrder = hexGridData.hexData; // Already in spiral order
  if (allHexesInOrder.length > 1) {
    for (let i = 0; i < allHexesInOrder.length - 1; i++) {
      const fromHex = allHexesInOrder[i];
      const toHex = allHexesInOrder[i + 1];
      const x1 = fromHex.x + offsetX;
      const y1 = fromHex.y + offsetY;
      const x2 = toHex.x + offsetX;
      const y2 = toHex.y + offsetY;
      svgContent += generateMeditationPath(x1, y1, x2, y2);
    }
  }
  
  // Render content hexes with embedded permalinks
  hexGridData.hexData.filter(hex => hex.item).forEach(hex => {
    const x = hex.x + offsetX;
    const y = hex.y + offsetY;
    const isHome = hex.item[5]; // isHomePage flag
    const isExit = hex.item[0] === 'exit'; // Check if icon type is 'exit'
    const isVoid = hex.item[0] === 'void'; // Check if icon type is 'void'
    let hexType;
    if (isHome) {
      hexType = 'homeHex';
    } else if (isExit) {
      hexType = 'exitHex';
    } else if (isVoid) {
      hexType = 'voidHex';
    } else {
      hexType = 'contentHex';
    }
    // If this is the home hex, force permalink to '/'
    const permalink = isHome ? '/' : (hex.item[1] || '#');
    svgContent += `\n<a href="${permalink}" target="_top">`;
    svgContent += renderHexagon(x, y, 28, 24, hexType);
    svgContent += renderIcon(x, y, hex.item[0], permalink, hex.item[2], iconMap); // icon, url, title, iconMap
    svgContent += `</a>`;
  });
  
  // Render atmosphere hexes with alternating dark/light colors that match website themes
  // Group atmosphere hexes by "sets" (rings) and alternate between dark/light for each set
  // In generateDungeonSVG, replace the atmosphere sorting/grouping with:
  const atmosphereHexes = hexGridData.hexData.filter(hex => hex.isAtmosphere);

  atmosphereHexes.forEach(hex => {
    const x = hex.x + offsetX;
    const y = hex.y + offsetY;
    // Alternate by ring number - no distance calculation needed
    const isDarkSet = hex.ring % 2 === 0;
    svgContent += renderAtmosphereHex(x, y, 28, 24, isDarkSet ? 'dark' : 'light');
  });
  svgContent += '</svg>';
  return svgContent;
}

/**
 * Render a hexagon at given position
 */
function renderHexagon(x, y, width, height, fillId) {
  const points = generateHexagonPoints(width, height);
  return `
  <g transform="translate(${x - width/2}, ${y - height/2})">
    <polygon points="${points}" 
      fill="url(#${fillId})" 
      fill-opacity="0.2"
      stroke="url(#${fillId})"
      stroke-width="2"/>
  </g>`;
}

/**
 * Render an atmosphere hexagon with theme-aware colors and center point
 */
function renderAtmosphereHex(x, y, width, height, themeType) {
  const points = generateHexagonPoints(width, height);
  const isDark = themeType === 'dark';
  
  // Define border colors that match the theme
  const borderColor = isDark 
    ? 'rgba(31, 25, 59, 1)'  // Darker border for dark ambient cells
    : 'rgba(190, 182, 232, 1)'; // Lighter border for light ambient cells 
  
  return `
  <g transform="translate(${x - width/2}, ${y - height/2})">
    <polygon points="${points}" 
      fill="${borderColor}" 
      stroke="none"
      stroke-width="1"
      opacity="0.3"/>
  </g>
  <g transform="translate(${x}, ${y})">
    <circle r="6" class="ambient-center-${isDark ? 'dark' : 'light'}" opacity="0.6"/>
    <circle r="1.5" class="ambient-center-${isDark ? 'dark' : 'light'}" opacity="1"/>
  </g>`;
}

/**
 * Generate hexagon points for flat-top hexagon
 */
function generateHexagonPoints(width, height) {
  // Flat-top hexagon proportions
  const w = width;
  const h = height;
  return `${w*0.25},0 ${w*0.75},0 ${w},${h*0.5} ${w*0.75},${h} ${w*0.25},${h} 0,${h*0.5}`;
}

/**
 * Render icon in hexagon. Uses directory-derived iconMap; shows nothing for void or unknown icon types.
 */
function renderIcon(x, y, iconType, url, title, iconMap) {
  if (iconType === 'void') {
    return '';
  }
  const iconPath = iconMap[iconType];
  if (!iconPath) {
    return '';
  }
  return `
  <g class="dungeon-hex-icon" transform="translate(${x}, ${y})">
    <circle r="12" fill="rgba(0,0,0,0.0)" opacity="0"/>
    <image x="-8" y="-8" width="16" height="16" href="${iconPath}" />
  </g>`;
}

/**
 * Generate coordinate mapping for CSS positioning
 */
function generateCoordinateMapping(dungeonData) {
  const { hexGridData } = dungeonData;
  const centerX = 225; // Half of 450px width
  const centerY = 160; // Half of 320px height
  
  const coordinateMap = {};
  
  hexGridData.hexData.filter(hex => hex.item).forEach(hex => {
    const url = hex.item[1];
    const slug = extractSlugFromUrl(url);
    
    coordinateMap[slug] = {
      x: hex.x + centerX,
      y: hex.y + centerY,
      title: hex.item[2],
      icon: hex.item[0],
      isHome: hex.item[5]
    };
  });
  
  return coordinateMap;
}


/**
 * Generate a meditation garden style path between two points
 * Uses simple, clean lines for clarity and zen aesthetics
 */
function generateMeditationPath(x1, y1, x2, y2) {
  // Always use straight lines for simplicity and clarity
  // In real meditation gardens, paths are often simple and direct
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
    stroke="rgba(255,255,255,0.6)" stroke-width="0.75" opacity="0.6"/>`;
}

/**
 * Extract slug from URL for coordinate mapping
 */
function extractSlugFromUrl(url) {
  // Remove leading and trailing slashes, then get the last segment
  const cleanUrl = url.replace(/^\/+|\/+$/g, '');
  
  if (!cleanUrl || url === '/') {
    return 'home';
  }
  
  // Split by / and get the last part as the slug
  const parts = cleanUrl.split('/');
  const slug = parts[parts.length - 1];
  
  // Return the slug, or 'unknown' if empty
  return slug || 'unknown';
}

// Run if called directly
if (require.main === module) {
  generateStaticDungeon()
    .then(() => {
      console.log('[DEBUG] Static dungeon generation completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('[ERROR] Static dungeon generation failed:', error);
      process.exit(1);
    });
}

module.exports = { generateStaticDungeon };

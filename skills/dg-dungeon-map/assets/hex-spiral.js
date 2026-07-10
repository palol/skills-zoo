// hex-spiral.js
// Tight hexagonal spiral using axial coordinates and ring-walking.
// Based on: https://www.redblobgames.com/grids/hexagons/#rings-spiral

// ============================================================
// 1. AXIAL COORDINATE HELPERS
// ============================================================

const AXIAL_DIRECTIONS = [
    { q: +1, r:  0 },  // 0: E
    { q: +1, r: -1 },  // 1: NE
    { q:  0, r: -1 },  // 2: NW
    { q: -1, r:  0 },  // 3: W
    { q: -1, r: +1 },  // 4: SW
    { q:  0, r: +1 },  // 5: SE
  ];
  
  function axial_add(a, b) {
    return { q: a.q + b.q, r: a.r + b.r };
  }
  
  function axial_scale(hex, factor) {
    return { q: hex.q * factor, r: hex.r * factor };
  }
  
  function axial_neighbor(hex, direction) {
    return axial_add(hex, AXIAL_DIRECTIONS[direction]);
  }

  /** Axial distance from (0,0). For center (0,0), ring N = { hex : axialDistance(hex) === N }. */
  function axialDistance(hex) {
    return (Math.abs(hex.q) + Math.abs(hex.r) + Math.abs(hex.q + hex.r)) / 2;
  }
  
  // ============================================================
  // 2. AXIAL → PIXEL  (flat-top hexagons)
  // ============================================================
  
  function axialToPixel(q, r, hexWidth = 28, hexHeight = 24) {
    const x = (hexWidth * 0.75) * q;
    const y = hexHeight * (r + q / 2);
    return { x, y };
  }
  
  // ============================================================
  // 3. SINGLE RING
  // ============================================================
  
  function hexRing(center, radius) {
    if (radius <= 0) return [center];
    const results = [];
    let hex = axial_add(center, axial_scale(AXIAL_DIRECTIONS[4], radius));
    for (let side = 0; side < 6; side++) {
      for (let step = 0; step < radius; step++) {
        results.push({ q: hex.q, r: hex.r });
        hex = axial_neighbor(hex, side);
      }
    }
    return results;
  }

  /** Same ring as hexRing(center, radius) but starting at startHex so the path is continuous from the previous ring. */
  function hexRingFrom(center, radius, startHex) {
    const ring = hexRing(center, radius);
    const idx = ring.findIndex(h => h.q === startHex.q && h.r === startHex.r);
    if (idx < 0) return ring;
    return ring.slice(idx).concat(ring.slice(0, idx));
  }

  /** Direction index (0..5) from fromHex to toHex when they are neighbors; else -1. */
  function directionFrom(fromHex, toHex) {
    const dq = toHex.q - fromHex.q;
    const dr = toHex.r - fromHex.r;
    return AXIAL_DIRECTIONS.findIndex(d => d.q === dq && d.r === dr);
  }

  /** Neighbor of hex that lies on the given ring (distance from center === targetRing). */
  function neighborOnRing(hex, targetRing) {
    for (let d = 0; d < 6; d++) {
      const n = axial_neighbor(hex, d);
      if (axialDistance(n) === targetRing) return n;
    }
    return null;
  }

  /** Neighbor of hex on targetRing, preferring the one in approachDir to continue straight. */
  function neighborOnRingPreferDirection(hex, targetRing, approachDir) {
    if (approachDir >= 0 && approachDir < 6) {
      const straight = axial_neighbor(hex, approachDir);
      if (axialDistance(straight) === targetRing) return straight;
    }
    return neighborOnRing(hex, targetRing);
  }
  
  // ============================================================
  // 4. SPIRAL GENERATOR
  // ============================================================
  
  function generateHexSpiral(totalHexesNeeded, hexWidth = 28, hexHeight = 24) {
    const center = { q: 0, r: 0 };
    const centerPixel = axialToPixel(0, 0, hexWidth, hexHeight);
    const results = [{
      q: 0, r: 0,
      x: centerPixel.x, y: centerPixel.y,
      ring: 0,
    }];
  
    let ringIndex = 1;
    while (results.length < totalHexesNeeded) {
      let ring;
      if (ringIndex === 1) {
        ring = hexRing(center, ringIndex);
      } else {
        const lastHex = results[results.length - 1];
        const approachDir = results.length >= 2
          ? directionFrom(results[results.length - 2], lastHex)
          : -1;
        const startHex = neighborOnRingPreferDirection(lastHex, ringIndex, approachDir);
        ring = startHex ? hexRingFrom(center, ringIndex, startHex) : hexRing(center, ringIndex);
      }
      for (const hex of ring) {
        if (results.length >= totalHexesNeeded) break;
        const pixel = axialToPixel(hex.q, hex.r, hexWidth, hexHeight);
        results.push({
          q: hex.q, r: hex.r,
          x: pixel.x, y: pixel.y,
          ring: ringIndex,
        });
      }
      ringIndex++;
    }
    return results;
  }
  
  function ringsNeeded(count) {
    let n = 0;
    while (1 + 3 * n * (n + 1) < count) n++;
    return n;
  }
  
  module.exports = {
    AXIAL_DIRECTIONS, axial_add, axial_scale, axial_neighbor,
    axialDistance, axialToPixel, hexRing, hexRingFrom, neighborOnRing,
    generateHexSpiral, ringsNeeded,
  };
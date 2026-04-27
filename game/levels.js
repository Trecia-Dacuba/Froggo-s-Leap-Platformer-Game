/* =========================================
   FROGGO'S LEAP — Level Definitions
   3 hand-crafted levels with generous
   platform widths for beginner-friendly play
   ========================================= */

'use strict';

/**
 * Each level defines:
 *  theme       — colors, sky, water, background
 *  platforms   — ground slabs + lily pads (wider = easier)
 *  flies       — collectible items
 *  mushrooms   — speed power-up pickups
 *  shields     — 1-hit absorb star pickups
 *  checkpoints — mid-level save flags
 *  hornets     — enemy patrol data
 *  lotusX      — X position of the goal flower
 *  lotusPlatIdx— which platform the lotus sits on
 *
 * DIFFICULTY NOTES (beginner-friendly design):
 *  - Lily pads are 110–140px wide (vs 65–90px before)
 *  - Gaps between pads are ≤170px (easily double-jumpable)
 *  - Platform heights are closer together (max 50px vertical gap)
 *  - Moving platforms move slowly on level 2, moderately on 3
 *  - Hornets only 1–2 per level on level 1, 3–4 on level 2/3
 *  - More checkpoints placed throughout
 */

const LEVELS = [

  /* ══════════════════════════════════════
     LEVEL 1 — POND AT DUSK
     Introductory: all static platforms,
     wide pads, very few enemies
     ══════════════════════════════════════ */
  {
    theme: {
      name:     'POND AT DUSK',
      bg1:      '#071510',
      bg2:      '#0c2218',
      water:    '#0a2040',
      pad:      '#2d7a35',
      padL:     '#3ea844',
      trunk:    '#4a3010',
      cloud:    '#1a3322',
      moon:     '#eeffd0',
      moonGlow: '#aaffaa',
      star:     '#ccffcc',
      bgTree:   '#1a3a1a',
    },

    platforms: [
      // Starting ground — wide and safe
      { x: 0,    y: 420, w: 260, h: 80, type: 'ground' },
      // Lily pads — all wide, gentle height steps
      { x: 310,  y: 390, w: 130, h: 20, type: 'lily' },
      { x: 490,  y: 370, w: 120, h: 20, type: 'lily' },
      { x: 665,  y: 355, w: 130, h: 20, type: 'lily' },
      { x: 850,  y: 370, w: 120, h: 20, type: 'lily' },
      { x: 1025, y: 350, w: 130, h: 20, type: 'lily' },
      { x: 1210, y: 365, w: 120, h: 20, type: 'lily' },
      { x: 1390, y: 345, w: 130, h: 20, type: 'lily' },
      { x: 1575, y: 360, w: 125, h: 20, type: 'lily' },
      { x: 1755, y: 340, w: 130, h: 20, type: 'lily' },
      // End ground — wide finish
      { x: 1940, y: 420, w: 260, h: 80, type: 'ground' },
    ],

    flies: [
      { x: 375,  y: 375 },
      { x: 555,  y: 355 },
      { x: 730,  y: 340 },
      { x: 910,  y: 355 },
      { x: 1090, y: 335 },
      { x: 1270, y: 350 },
      { x: 1455, y: 330 },
      { x: 1637, y: 345 },
      { x: 1820, y: 325 },
      { x: 1990, y: 360 },
    ],

    mushrooms:   [{ x: 665, y: 325 }, { x: 1390, y: 315 }],
    shields:     [{ x: 1025, y: 320 }],
    checkpoints: [{ x: 850, y: 310 }, { x: 1575, y: 325 }],

    hornets: [
      { x: 490,  y: 348, range: 110, speed: 1.0 },
      { x: 1210, y: 342, range: 110, speed: 1.2 },
    ],

    lotusX:      2060,
    lotusPlatIdx: 10,
  },


  /* ══════════════════════════════════════
     LEVEL 2 — MOONLIT MARSH
     Introduces slow-moving platforms.
     Pads still wide; moderate enemies
     ══════════════════════════════════════ */
  {
    theme: {
      name:     'MOONLIT MARSH',
      bg1:      '#06060f',
      bg2:      '#0a0a1e',
      water:    '#060c2a',
      pad:      '#4a3080',
      padL:     '#6a45c0',
      trunk:    '#302060',
      cloud:    '#1a1a30',
      moon:     '#ccccff',
      moonGlow: '#8888ff',
      star:     '#ddddff',
      bgTree:   '#1a1a40',
    },

    platforms: [
      // Start ground
      { x: 0,    y: 420, w: 220, h: 80, type: 'ground' },
      // Static intro pads
      { x: 270,  y: 390, w: 120, h: 20, type: 'lily' },
      { x: 445,  y: 370, w: 120, h: 20, type: 'lily' },
      // First moving pad (slow)
      { x: 625,  y: 355, w: 115, h: 20, type: 'lily', moving: true, mRange: 70, mSpeed: 0.9 },
      { x: 810,  y: 370, w: 125, h: 20, type: 'lily' },
      // Moving pad
      { x: 995,  y: 350, w: 115, h: 20, type: 'lily', moving: true, mRange: 65, mSpeed: 1.0 },
      { x: 1175, y: 365, w: 125, h: 20, type: 'lily' },
      // Moving pad
      { x: 1360, y: 345, w: 115, h: 20, type: 'lily', moving: true, mRange: 70, mSpeed: 1.1 },
      { x: 1545, y: 360, w: 125, h: 20, type: 'lily' },
      // Moving pad
      { x: 1730, y: 340, w: 115, h: 20, type: 'lily', moving: true, mRange: 65, mSpeed: 1.2 },
      { x: 1910, y: 355, w: 120, h: 20, type: 'lily' },
      // End ground
      { x: 2085, y: 420, w: 240, h: 80, type: 'ground' },
    ],

    flies: [
      { x: 330,  y: 375 },
      { x: 505,  y: 355 },
      { x: 682,  y: 340 },
      { x: 873,  y: 355 },
      { x: 1053, y: 335 },
      { x: 1238, y: 350 },
      { x: 1418, y: 330 },
      { x: 1607, y: 345 },
      { x: 1788, y: 325 },
      { x: 1970, y: 340 },
      { x: 2140, y: 355 },
    ],

    mushrooms:   [{ x: 445, y: 340 }, { x: 1175, y: 335 }, { x: 1910, y: 325 }],
    shields:     [{ x: 810, y: 340 }, { x: 1545, y: 330 }],
    checkpoints: [{ x: 625, y: 300 }, { x: 1360, y: 290 }, { x: 1910, y: 310 }],

    hornets: [
      { x: 445,  y: 348, range: 110, speed: 1.3 },
      { x: 810,  y: 348, range: 115, speed: 1.5 },
      { x: 1360, y: 322, range: 110, speed: 1.4 },
      { x: 1730, y: 317, range: 110, speed: 1.6 },
    ],

    lotusX:      2200,
    lotusPlatIdx: 11,
  },


  /* ══════════════════════════════════════
     LEVEL 3 — VOLCANIC SPRINGS
     Faster moving platforms, more enemies.
     Pads slightly narrower but still fair
     ══════════════════════════════════════ */
  {
    theme: {
      name:     'VOLCANIC SPRINGS',
      bg1:      '#140500',
      bg2:      '#200800',
      water:    '#3a1000',
      pad:      '#8a3a10',
      padL:     '#c05820',
      trunk:    '#501008',
      cloud:    '#301008',
      moon:     '#ffcc88',
      moonGlow: '#ff8800',
      star:     '#ffddaa',
      bgTree:   '#301008',
    },

    platforms: [
      // Start ground
      { x: 0,    y: 420, w: 200, h: 80, type: 'ground' },
      // Static opener
      { x: 250,  y: 390, w: 115, h: 20, type: 'lily' },
      // Moving pairs
      { x: 420,  y: 368, w: 110, h: 20, type: 'lily', moving: true, mRange: 65, mSpeed: 1.4 },
      { x: 595,  y: 380, w: 115, h: 20, type: 'lily' },
      { x: 770,  y: 358, w: 110, h: 20, type: 'lily', moving: true, mRange: 70, mSpeed: 1.6 },
      { x: 945,  y: 372, w: 115, h: 20, type: 'lily' },
      { x: 1120, y: 352, w: 110, h: 20, type: 'lily', moving: true, mRange: 65, mSpeed: 1.8 },
      { x: 1300, y: 368, w: 115, h: 20, type: 'lily' },
      { x: 1478, y: 348, w: 110, h: 20, type: 'lily', moving: true, mRange: 70, mSpeed: 1.6 },
      { x: 1658, y: 364, w: 115, h: 20, type: 'lily' },
      { x: 1838, y: 344, w: 110, h: 20, type: 'lily', moving: true, mRange: 65, mSpeed: 2.0 },
      { x: 2015, y: 360, w: 115, h: 20, type: 'lily' },
      // End ground
      { x: 2185, y: 420, w: 230, h: 80, type: 'ground' },
    ],

    flies: [
      { x: 307,  y: 375 },
      { x: 475,  y: 353 },
      { x: 652,  y: 365 },
      { x: 825,  y: 343 },
      { x: 1002, y: 357 },
      { x: 1175, y: 337 },
      { x: 1357, y: 353 },
      { x: 1533, y: 333 },
      { x: 1715, y: 349 },
      { x: 1893, y: 329 },
      { x: 2072, y: 345 },
      { x: 2250, y: 360 },
    ],

    mushrooms:   [{ x: 595, y: 350 }, { x: 1300, y: 338 }, { x: 2015, y: 330 }],
    shields:     [{ x: 945, y: 342 }, { x: 1658, y: 334 }],
    checkpoints: [{ x: 770, y: 310 }, { x: 1478, y: 300 }, { x: 1838, y: 295 }],

    hornets: [
      { x: 420,  y: 345, range: 105, speed: 1.6 },
      { x: 770,  y: 335, range: 105, speed: 1.8 },
      { x: 1120, y: 329, range: 105, speed: 2.0 },
      { x: 1478, y: 325, range: 105, speed: 1.8 },
      { x: 1838, y: 321, range: 105, speed: 2.2 },
    ],

    lotusX:      2300,
    lotusPlatIdx: 12,
  },
];
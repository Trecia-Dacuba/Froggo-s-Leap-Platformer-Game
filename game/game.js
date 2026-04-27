/* =========================================
   FROGGO'S LEAP — Main Game Logic
   Physics, rendering, input, state machine
   ========================================= */

'use strict';

/* ── CANVAS SETUP ── */
const cv  = document.getElementById('gc');
const ctx = cv.getContext('2d');
const W   = 800;
const H   = 500;

/* ── GLOBAL STATE ── */
let gameState = 'menu'; // menu | playing | levelclear | win | gameover
window.level  = 1;      // exposed for audio.js BGM lookup
let score     = 0;
let lives     = 3;
let hiScore   = 0;
let fliesCollected = 0;
let totalFlies     = 0;
let t = 0; // game time (seconds)

// Level-clear
let lcTimer = 0;
let lcBonus = 0;

// Fade transition
let fadeAlpha    = 0;
let fadeDir      = 0;  // 1 = fade to black, -1 = fade back in
let pendingLevel = null;

/* ── ENTITY ARRAYS ── */
let player, platforms, flyItems, mushrooms, shields, hornets, checkpoints, lotus, camera;

/* ── PHYSICS CONSTANTS ── */
const GRAV    = 0.50;   // gravity per frame (lowered = floatier, easier)
const JFORCE  = -12.5;  // jump impulse
const SPD     = 4.8;    // max horizontal speed
const COYOTE  = 8;      // coyote-time frames (can jump just after walking off edge)
const JBUFFER = 10;     // jump-buffer frames (early jump input queues)

/* ── INPUT ── */
const keys  = {};
const dKeys = { left: false, right: false };

/* ── PARTICLES ── */
let particles  = [];
let floatTexts = [];

/* ═══════════════════════════════════════════
   LEVEL INITIALISATION
   ═══════════════════════════════════════════ */
function initLevel(lvl) {
  window.level = lvl;
  const def = LEVELS[lvl - 1];
  const th  = def.theme;

  camera     = { x: 0 };
  particles  = [];
  floatTexts = [];

  /* Build platform objects from definition */
  platforms = def.platforms.map(p => ({
    ...p,
    c:        th,
    bobPhase: Math.random() * Math.PI * 2,
    bobAmp:   p.type === 'lily' ? 3 : 0,  // gentle bob
    mDir:     1,
    mOriginX: p.x,
    origY:    p.y,
    mSpeed:   p.mSpeed || 0,
    mRange:   p.mRange || 0,
  }));

  flyItems = def.flies.map(f => ({
    ...f, collected: false, phase: Math.random() * Math.PI * 2
  }));
  totalFlies     = flyItems.length;
  fliesCollected = 0;

  mushrooms   = def.mushrooms.map(m => ({ ...m, collected: false, phase: Math.random() * Math.PI * 2 }));
  shields     = def.shields.map(s => ({ ...s, collected: false, phase: Math.random() * Math.PI * 2 }));
  checkpoints = def.checkpoints.map(cp => ({ ...cp, active: false }));

  hornets = def.hornets.map(h => ({
    x:       h.x,
    y:       h.y,
    vx:      h.speed * (Math.random() > 0.5 ? 1 : -1),
    w:       22, h: 18,
    patrolX: h.x - h.range / 2,
    patrolW: h.range,
    phase:   Math.random() * Math.PI * 2,
    alive:   true,
    stompTimer: 0,
  }));

  const lp = platforms[def.lotusPlatIdx] || platforms[platforms.length - 1];
  lotus = {
    x:       def.lotusX,
    y:       lp.y - 50,
    w:       28, h: 45,
    reached: false,
    phase:   0,
  };

  const firstGround = platforms.find(p => p.type === 'ground');
  const spawnY      = firstGround ? firstGround.y - 32 : 385;

  player = {
    x: 50, y: spawnY,
    vx: 0, vy: 0,
    w:  26, h: 28,

    onGround:    false,
    wasOnGround: false,
    coyoteFrames: 0,
    jumpBuffer:   0,

    jumps:    0,
    maxJumps: 2,

    facing:   1,
    phase:    0,
    squish:   1,
    squishV:  0,

    invincible:  0,
    shielded:    0,
    shieldTimer: 0,
    boosted:     0,
    dead:        false,

    respawnX: 50,
    respawnY: spawnY,
    ridingPlat: null,
  };

  updateHUD();
}

/* ═══════════════════════════════════════════
   UPDATE — called every frame
   ═══════════════════════════════════════════ */
function update() {
  /* Level-clear countdown */
  if (gameState === 'levelclear') {
    lcTimer--;
    if (lcTimer <= 0) {
      doFadeTransition(() => {
        ov.style.display = 'none';
        window.level++;
        initLevel(window.level);
        gameState = 'playing';
        startBGM();
      });
    }
    updateParticles();
    return;
  }

  if (gameState !== 'playing') return;

  t += 1 / 60;

  /* ── Moving & bobbing platforms ── */
  platforms.forEach(p => {
    p.y = p.origY + Math.sin(t + p.bobPhase) * p.bobAmp;
    if (p.moving) {
      p.x += p.mDir * p.mSpeed;
      if (p.x >= p.mOriginX + p.mRange || p.x <= p.mOriginX - p.mRange) p.mDir *= -1;
    }
  });

  /* ── Hornets ── */
  hornets.forEach(h => {
    if (!h.alive) { if (h.stompTimer > 0) h.stompTimer--; return; }
    h.phase += 0.07;
    h.x += h.vx;
    if (h.x < h.patrolX)            h.vx =  Math.abs(h.vx);
    if (h.x > h.patrolX + h.patrolW) h.vx = -Math.abs(h.vx);
  });

  /* ── Item animation ── */
  flyItems.forEach(f => { f.phase += 0.05; });
  mushrooms.forEach(m => { m.phase += 0.04; });
  shields.forEach(s => { s.phase += 0.06; });
  lotus.phase += 0.04;

  /* ════════════════════════════
     PLAYER PHYSICS
     ════════════════════════════ */
  const p = player;
  p.phase  += 0.10;
  p.squishV += (1 - p.squish) * 0.28; p.squishV *= 0.72; p.squish += p.squishV;
  if (p.invincible  > 0) p.invincible--;
  if (p.shieldTimer > 0) { p.shieldTimer--; if (p.shieldTimer === 0) p.shielded = 0; }
  if (p.boosted     > 0) p.boosted--;
  if (p.jumpBuffer  > 0) p.jumpBuffer--;

  /* Coyote time: allow jump just after walking off edge */
  if (p.wasOnGround && !p.onGround && p.vy >= 0) {
    p.coyoteFrames = COYOTE;
  }
  if (p.coyoteFrames > 0) p.coyoteFrames--;

  const maxSpd = p.boosted > 0 ? SPD * 1.7 : SPD;
  const mLeft  = keys['ArrowLeft']  || keys['KeyA'] || keys['a'] || dKeys.left;
  const mRight = keys['ArrowRight'] || keys['KeyD'] || keys['d'] || dKeys.right;

  if (mLeft)  { p.vx -= 1.4; p.facing = -1; }
  if (mRight) { p.vx += 1.4; p.facing =  1; }
  p.vx *= 0.75;
  if (Math.abs(p.vx) > maxSpd) p.vx = Math.sign(p.vx) * maxSpd;

  /* Gravity — slightly reduced when holding jump (variable jump height) */
  const holdingJump = keys['Space'] || keys['ArrowUp'] || keys['KeyW'] || dKeys.jump;
  const gravMod = (holdingJump && p.vy < 0) ? 0.65 : 1.0;
  p.vy = Math.min(p.vy + GRAV * gravMod, 16);

  p.wasOnGround = p.onGround;
  p.onGround    = false;
  p.ridingPlat  = null;

  /* ── Buffered jump execution ── */
  if (p.jumpBuffer > 0 && (p.onGround || p.coyoteFrames > 0 || p.jumps < p.maxJumps)) {
    execJump();
  }

  /* ── Move X ── */
  p.x += p.vx;
  if (p.x < 0) { p.x = 0; p.vx = 0; }

  /* X collisions */
  platforms.forEach(pl => {
    if (!aabb(p, pl)) return;
    const ox = overlapX(p, pl);
    p.x += Math.sign((p.x + p.w / 2) - (pl.x + pl.w / 2)) * ox;
    p.vx = 0;
  });

  /* ── Move Y ── */
  p.y += p.vy;

  /* Y collisions */
  platforms.forEach(pl => {
    if (!aabb(p, pl)) return;
    const py = p.y + p.h / 2, by = pl.y + pl.h / 2;
    const dy = py - by;
    if (dy < 0) {
      // Land on top
      p.y         = pl.y - p.h;
      p.vy        = 0;
      p.onGround  = true;
      p.jumps     = 0;
      p.coyoteFrames = 0;
      p.ridingPlat = pl;
      if (!p.wasOnGround) {
        p.squish  = 0.65;
        p.squishV = 0.35;
        sfxLand();
      }
    } else {
      // Hit underside
      p.y  = pl.y + pl.h;
      p.vy = Math.abs(p.vy) * 0.2;
    }
  });

  /* Ride moving platform */
  if (p.ridingPlat && p.ridingPlat.moving) {
    p.x += p.ridingPlat.mDir * p.ridingPlat.mSpeed;
  }

  /* ══ COLLECT FLIES ══ */
  flyItems.forEach(f => {
    if (f.collected || !circ(p, f.x, f.y, 38)) return;  // was 18 — much larger pickup radius
    f.collected = true;
    score += 10;
    fliesCollected++;
    sfxFly();
    spawnParticles(f.x, f.y, '#ffff66', 6, 4);
    spawnFloat(f.x, f.y, '+10', '#ffee44');
    updateHUD();
  });

  /* ══ MUSHROOM (speed boost) ══ */
  mushrooms.forEach(m => {
    if (m.collected || !circ(p, m.x, m.y, 34)) return;  // was 20
    m.collected = true;
    p.boosted   = 360; // 6 seconds
    sfxMushroom();
    spawnParticles(m.x, m.y, '#ff5533', 10, 5);
    spawnFloat(m.x, m.y, 'SPEED!', '#ff8844');
    showPowerHud('SPEED');
  });

  /* ══ SHIELD STAR ══ */
  shields.forEach(s => {
    if (s.collected || !circ(p, s.x, s.y, 34)) return;  // was 20
    s.collected    = true;
    p.shielded     = 1;
    p.shieldTimer  = 480; // 8 seconds
    sfxShield();
    spawnParticles(s.x, s.y, '#ff88ff', 12, 5);
    spawnFloat(s.x, s.y, 'SHIELD!', '#ff88ff');
    showPowerHud('SHIELD');
  });

  if (p.boosted === 0 && p.shielded === 0) hidePowerHud();

  /* ══ CHECKPOINTS ══ */
  checkpoints.forEach(cp => {
    if (cp.active || !circ(p, cp.x, cp.y + 20, 32)) return;
    cp.active    = true;
    p.respawnX   = cp.x - p.w / 2;
    p.respawnY   = cp.y - 5;
    sfxCheckpoint();
    spawnParticles(cp.x, cp.y + 20, '#ffffff', 12, 4);
    spawnFloat(cp.x, cp.y, 'CHECKPOINT!', '#ffffff');
  });

  /* ══ HORNETS ══ */
  hornets.forEach(h => {
    if (!h.alive || p.invincible > 0) return;
    const hBox = { x: h.x - h.w / 2, y: h.y - h.h / 2, w: h.w, h: h.h };
    if (!aabb(p, hBox)) return;

    const feetY  = p.y + p.h;
    const hornetTop = h.y - h.h / 2;

    // Stomp: feet are above hornet center AND falling
    if (p.vy > 0 && feetY < hornetTop + 12) {
      killHornet(h);
      p.vy   = JFORCE * 0.6;
      p.jumps = 1;
    } else {
      takeDamage();
    }
  });

  /* ══ LOTUS (goal) ══ */
  if (!lotus.reached && circ(p, lotus.x, lotus.y + 20, 34)) {
    lotus.reached = true;
    lcBonus = 100 + window.level * 50 + fliesCollected * 5;
    score  += lcBonus;
    sfxLevelClear();
    spawnParticles(lotus.x, lotus.y + 20, '#ff88cc', 24, 7);
    spawnParticles(lotus.x, lotus.y + 20, '#ffee44', 16, 5);
    spawnFloat(lotus.x, lotus.y, '+' + lcBonus + ' CLEAR!', '#ff88cc');
    updateHUD();
    if (window.level >= 3) {
      triggerWin();
    } else {
      gameState = 'levelclear';
      lcTimer   = 200;
      showLevelClear();
    }
  }

  /* ══ FALL OFF WORLD ══ */
  if (p.y > H + 80) {
    takeDamage();
  }

  /* ── Smooth camera ── */
  const targetCamX = Math.max(0, p.x - 240);
  camera.x += (targetCamX - camera.x) * 0.10;

  /* ── Fade ── */
  if (fadeDir !== 0) {
    fadeAlpha += fadeDir * 0.035;
    if (fadeAlpha >= 1) {
      fadeAlpha = 1; fadeDir = 0;
      if (pendingLevel) { pendingLevel(); pendingLevel = null; fadeDir = -1; }
    }
    if (fadeAlpha <= 0) { fadeAlpha = 0; fadeDir = 0; }
  }

  updateParticles();
}

/* ── Jump execution (extracted so buffer can trigger it) ── */
function execJump() {
  const p = player;
  const canJump = p.onGround || p.coyoteFrames > 0 || p.jumps < p.maxJumps;
  if (!canJump) return;
  p.vy         = JFORCE;
  p.jumps      = p.onGround || p.coyoteFrames > 0 ? 1 : p.jumps + 1;
  p.jumpBuffer = 0;
  p.coyoteFrames = 0;
  p.squish     = 0.62;
  p.squishV    = 0.38;
  p.jumps === 1 ? sfxJump() : sfxDJump();
  spawnParticles(p.x + p.w / 2, p.y + p.h, '#88ffaa', 5, 2.5);
}

function doJump() {
  if (gameState !== 'playing') return;
  const p = player;
  if (p.onGround || p.coyoteFrames > 0 || p.jumps < p.maxJumps) {
    execJump();
  } else {
    p.jumpBuffer = JBUFFER; // queue the jump
  }
}

function killHornet(h) {
  h.alive      = false;
  h.stompTimer = 30;
  score += 25;
  sfxStomp();
  spawnParticles(h.x, h.y, '#ffaa00', 10, 5);
  spawnFloat(h.x, h.y, '+25 STOMP!', '#ffaa00');
  updateHUD();
}

function takeDamage() {
  const p = player;
  if (p.shielded) {
    p.shielded    = 0;
    p.shieldTimer = 0;
    p.invincible  = 100;
    spawnParticles(p.x + 13, p.y + 14, '#ff88ff', 14, 5);
    spawnFloat(p.x + 13, p.y, 'BLOCKED!', '#ff88ff');
    hidePowerHud();
    sfxShield();
    return;
  }
  lives--;
  sfxHurt();
  p.invincible = 110;
  spawnParticles(p.x + 13, p.y + 14, '#ff4444', 12, 5);
  updateHUD();
  if (lives <= 0) { setTimeout(triggerGameOver, 700); return; }
  // Respawn at last checkpoint (or level start)
  p.x  = p.respawnX;
  p.y  = p.respawnY;
  p.vx = 0;
  p.vy = 0;
}

function triggerGameOver() {
  stopBGM();
  gameState = 'gameover';
  if (score > hiScore) hiScore = score;
  showGameOver();
}

function triggerWin() {
  stopBGM();
  gameState = 'win';
  if (score > hiScore) hiScore = score;
  sfxWin();
  setTimeout(showWin, 1200);
}

function doFadeTransition(fn) {
  fadeAlpha    = 0;
  fadeDir      = 1;
  pendingLevel = fn;
}

/* ═══════════════════════════════════════════
   PARTICLES
   ═══════════════════════════════════════════ */
function spawnParticles(x, y, color, count, speed) {
  for (let i = 0; i < count; i++) {
    const a = (Math.PI * 2 / count) * i + Math.random() * 0.6;
    const s = speed * (0.5 + Math.random());
    particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 2, life: 1, maxLife: 0.5 + Math.random() * 0.5, sz: 2 + Math.random() * 4, color });
  }
}

function spawnFloat(x, y, text, color = '#ffcc44') {
  floatTexts.push({ x, y, text, color, life: 1, vy: -1.4 });
}

function updateParticles() {
  particles  = particles.filter(p  => { p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.life -= 0.018 / p.maxLife; return p.life > 0; });
  floatTexts = floatTexts.filter(f => { f.y += f.vy; f.life -= 0.016; return f.life > 0; });
}

/* ═══════════════════════════════════════════
   COLLISION HELPERS
   ═══════════════════════════════════════════ */
function aabb(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
function overlapX(a, b) { return (a.w + b.w) / 2 - Math.abs((a.x + a.w / 2) - (b.x + b.w / 2)); }
function circ(p, cx2, cy2, r) { const dx = p.x + p.w / 2 - cx2, dy = p.y + p.h / 2 - cy2; return dx * dx + dy * dy < r * r; }

/* ═══════════════════════════════════════════
   RENDER
   ═══════════════════════════════════════════ */
function render() {
  ctx.clearRect(0, 0, W, H);

  if (gameState === 'playing' || gameState === 'levelclear') {
    const th   = LEVELS[window.level - 1].theme;
    const camX = camera.x;

    drawBG(th, camX);
    platforms.forEach(p  => drawPlatform(p, camX));
    checkpoints.forEach(cp => drawCheckpoint(cp, camX));
    flyItems.forEach(f   => drawFly(f, camX));
    mushrooms.forEach(m  => drawMushroom(m, camX));
    shields.forEach(s    => drawShield(s, camX));
    hornets.forEach(h    => drawHornet(h, camX));
    drawLotus(camX);
    drawPlayer(camX);
    drawParticles(camX);
    drawTimerBars();
  }

  // Fade overlay for transitions
  if (fadeAlpha > 0) {
    ctx.fillStyle = `rgba(0,0,0,${fadeAlpha})`;
    ctx.fillRect(0, 0, W, H);
  }
}

/* ── BACKGROUND ── */
function drawBG(th, camX) {
  ctx.fillStyle = th.bg1;
  ctx.fillRect(0, 0, W, H);

  // Moon
  const mx = 660 - camX * 0.04;
  ctx.save();
  ctx.shadowBlur = 32; ctx.shadowColor = th.moonGlow;
  ctx.fillStyle  = th.moon;
  ctx.beginPath(); ctx.arc(mx, 65, 28, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0; ctx.restore();

  // Stars (parallax 0.03)
  ctx.fillStyle = th.star;
  for (let i = 0; i < 50; i++) {
    const sx = ((i * 163 + camX * 0.03) % W + W) % W;
    const sy = (i * 91 + 18) % 185;
    ctx.globalAlpha = (0.3 + 0.7 * Math.sin(t * 1.2 + i * 0.8)) * 0.75;
    ctx.fillRect(sx, sy, 1.5, 1.5);
  }
  ctx.globalAlpha = 1;

  // Background trees (parallax 0.22)
  ctx.fillStyle = th.bgTree;
  for (let i = 0; i < 14; i++) {
    const tx  = ((i * 180 + 400 - camX * 0.22) % 2200 + 2200) % 2200;
    const ht2 = 48 + (i * 37) % 38;
    ctx.fillRect(tx, H - 135 - ht2, 14, ht2);
    ctx.beginPath(); ctx.arc(tx + 7, H - 135 - ht2, 27, 0, Math.PI * 2); ctx.fill();
  }

  // Clouds (parallax 0.38)
  ctx.fillStyle = th.cloud;
  for (let i = 0; i < 6; i++) {
    const cxc = ((i * 250 + 180 - camX * 0.38) % 1900 + 1900) % 1900;
    const cy2 = 55 + i * 24;
    ctx.globalAlpha = 0.45;
    ctx.beginPath(); ctx.ellipse(cxc,      cy2,     50, 17, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cxc + 40, cy2 - 5, 34, 14, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cxc - 30, cy2 + 4, 29, 12, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Water
  const wg = ctx.createLinearGradient(0, H - 88, 0, H);
  wg.addColorStop(0, th.water); wg.addColorStop(1, '#020406');
  ctx.fillStyle = wg;
  ctx.fillRect(0, H - 88, W, 88);

  // Water shimmer
  ctx.strokeStyle = 'rgba(150,220,255,0.10)'; ctx.lineWidth = 1;
  for (let i = 0; i < 7; i++) {
    const wy  = H - 80 + i * 11;
    const off = Math.sin(t * 1.1 + i * 0.9) * 18;
    ctx.beginPath(); ctx.moveTo(0, wy);
    for (let xw = 0; xw < W; xw += 22) ctx.lineTo(xw, wy + Math.sin((xw + off) * 0.05) * 2.5);
    ctx.stroke();
  }

  // Level name watermark
  ctx.globalAlpha = 0.15;
  ctx.fillStyle   = '#ffffff';
  ctx.font        = 'bold 10px Courier New';
  ctx.textAlign   = 'left';
  ctx.fillText(LEVELS[window.level - 1].theme.name, 10, H - 7);
  ctx.globalAlpha = 1;
}

/* ── PLATFORM ── */
function drawPlatform(pl, camX) {
  const x = pl.x - camX, y = pl.y, w = pl.w, h = pl.h;
  if (x + w < -10 || x > W + 10) return;
  const c = pl.c;

  if (pl.type === 'ground') {
    const g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, c.padL); g.addColorStop(0.3, c.pad); g.addColorStop(1, c.trunk);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.roundRect(x, y, w, h, 5); ctx.fill();
    ctx.strokeStyle = c.padL + '88'; ctx.lineWidth = 1; ctx.stroke();
    // Grass top
    ctx.fillStyle = c.padL;
    ctx.beginPath(); ctx.roundRect(x + 3, y, w - 6, 7, 3); ctx.fill();
    // Tufts
    for (let i = 0; i < Math.floor(w / 20); i++) {
      const tx = x + 10 + i * 20;
      ctx.beginPath(); ctx.moveTo(tx, y); ctx.lineTo(tx - 3, y - 6); ctx.lineTo(tx + 3, y - 6); ctx.closePath(); ctx.fill();
    }
  } else {
    // Lily pad — draw as filled ellipse for a rounder look
    const cx2 = x + w / 2, cy2 = y + h / 2;
    const g = ctx.createLinearGradient(x, y, x, y + h + 4);
    g.addColorStop(0, c.padL); g.addColorStop(1, c.pad);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(cx2, cy2 + 1, w / 2, h / 2 + 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = c.padL + 'cc'; ctx.lineWidth = 1.5; ctx.stroke();
    // Leaf veins
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 0.8;
    [0, 60, 120, 180, 240, 300].forEach(deg => {
      const rad = deg * Math.PI / 180;
      ctx.beginPath(); ctx.moveTo(cx2, cy2);
      ctx.lineTo(cx2 + Math.cos(rad) * (w / 2 - 4), cy2 + Math.sin(rad) * (h / 2 + 1));
      ctx.stroke();
    });
    // Notch at top
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.moveTo(cx2, y); ctx.lineTo(cx2 - 5, y + 9); ctx.lineTo(cx2 + 5, y + 9); ctx.closePath(); ctx.fill();
    // Moving pad indicator (pulsing dots)
    if (pl.moving) {
      ctx.fillStyle = `rgba(255,220,80,${0.5 + 0.4 * Math.sin(t * 4)})`;
      ctx.beginPath(); ctx.arc(cx2 - 6, cy2, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx2 + 6, cy2, 2.5, 0, Math.PI * 2); ctx.fill();
    }
  }
}

/* ── CHECKPOINT FLAG ── */
function drawCheckpoint(cp, camX) {
  const x = cp.x - camX, y = cp.y;
  if (x < -30 || x > W + 30) return;
  const waved = cp.active ? Math.sin(t * 4) * 5 : 0;
  ctx.strokeStyle = cp.active ? '#ffffff' : '#777777'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(x, y + 42); ctx.lineTo(x, y); ctx.stroke();
  ctx.fillStyle = cp.active ? '#2ecc71' : '#555555';
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 22 + waved, y + 8); ctx.lineTo(x, y + 17); ctx.closePath(); ctx.fill();
  if (cp.active) {
    ctx.save(); ctx.shadowBlur = 12; ctx.shadowColor = '#2ecc71';
    ctx.fillStyle = '#2ecc71';
    ctx.beginPath(); ctx.arc(x, y + 42, 5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  } else {
    ctx.fillStyle = '#444';
    ctx.beginPath(); ctx.arc(x, y + 42, 4, 0, Math.PI * 2); ctx.fill();
  }
}

/* ── FLY ── */
function drawFly(f, camX) {
  if (f.collected) return;
  const x = f.x - camX, y = f.y + Math.sin(f.phase) * 5;
  if (x < -20 || x > W + 20) return;
  ctx.save(); ctx.shadowBlur = 8; ctx.shadowColor = '#ffffaa';
  ctx.fillStyle = '#222233';
  ctx.beginPath(); ctx.ellipse(x, y, 5, 3.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(180,230,255,0.65)';
  ctx.beginPath(); ctx.ellipse(x - 5, y - 3, 5, 3, -0.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x + 5, y - 3, 5, 3,  0.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffff55';
  ctx.beginPath(); ctx.arc(x + 2, y - 1, 2, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0; ctx.restore();
}

/* ── MUSHROOM ── */
function drawMushroom(m, camX) {
  if (m.collected) return;
  const x = m.x - camX, y = m.y + Math.sin(m.phase) * 3;
  if (x < -30 || x > W + 30) return;
  ctx.fillStyle = '#ddccaa';
  ctx.beginPath(); ctx.roundRect(x - 6, y, 12, 14, 2); ctx.fill();
  ctx.fillStyle = '#dd3311';
  ctx.beginPath(); ctx.ellipse(x, y + 2, 15, 11, 0, Math.PI, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.beginPath(); ctx.arc(x - 5, y - 3, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 5, y - 2, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x, y - 7, 2, 0, Math.PI * 2); ctx.fill();
}

/* ── SHIELD STAR ── */
function drawShield(s, camX) {
  if (s.collected) return;
  const x = s.x - camX, y = s.y + Math.sin(s.phase) * 5;
  if (x < -30 || x > W + 30) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(s.phase * 0.5);
  ctx.shadowBlur = 14; ctx.shadowColor = '#ff88ff';
  ctx.fillStyle  = '#ffaaff';
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a  = (Math.PI * 2 / 5) * i - Math.PI / 2;
    const a2 = a + Math.PI / 5;
    if (i === 0) ctx.moveTo(Math.cos(a) * 13, Math.sin(a) * 13);
    else ctx.lineTo(Math.cos(a) * 13, Math.sin(a) * 13);
    ctx.lineTo(Math.cos(a2) * 6, Math.sin(a2) * 6);
  }
  ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0; ctx.restore();
}

/* ── HORNET ── */
function drawHornet(h, camX) {
  const x = h.x - camX, y = h.y;
  if (x < -30 || x > W + 30) return;
  if (!h.alive) {
    if (h.stompTimer > 0) {
      ctx.globalAlpha = h.stompTimer / 30;
      ctx.fillStyle   = '#ffddaa';
      ctx.beginPath(); ctx.arc(x, y, 14 * (1 - h.stompTimer / 30) + 5, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }
    return;
  }
  const wf = Math.sin(h.phase * 3) * 4;
  ctx.save(); ctx.translate(x, y + Math.sin(h.phase) * 2);
  if (h.vx < 0) ctx.scale(-1, 1);
  // Wings
  ctx.fillStyle = 'rgba(200,230,255,0.65)';
  ctx.beginPath(); ctx.ellipse(-4, -9 + wf, 9, 5, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse( 4, -9 - wf, 9, 5,  0.3, 0, Math.PI * 2); ctx.fill();
  // Body
  ctx.fillStyle = '#ffcc00';
  ctx.beginPath(); ctx.ellipse(0, 0, 11, 7, 0, 0, Math.PI * 2); ctx.fill();
  // Stripes
  ctx.fillStyle = '#222';
  ctx.fillRect(-10, -3.5, 4.5, 7); ctx.fillRect(-1, -3.5, 4.5, 7);
  // Stinger
  ctx.beginPath(); ctx.moveTo(-11, 0); ctx.lineTo(-16, -3); ctx.lineTo(-16, 3); ctx.closePath(); ctx.fill();
  // Eye
  ctx.fillStyle = '#ff2200';
  ctx.beginPath(); ctx.arc(8, -2, 3.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ff7700';
  ctx.beginPath(); ctx.arc(9, -3, 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

/* ── LOTUS ── */
function drawLotus(camX) {
  const x = lotus.x - camX, y = lotus.y;
  if (x < -50 || x > W + 50) return;
  const pulse = 1 + Math.sin(lotus.phase) * 0.06;
  ctx.save(); ctx.translate(x, y + 22); ctx.scale(pulse, pulse);
  // Stem
  ctx.strokeStyle = '#2d7a35'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(0, 20); ctx.lineTo(0, 0); ctx.stroke();
  // Base leaves
  ctx.fillStyle = '#2d7a35';
  ctx.beginPath(); ctx.ellipse(-12, 12, 12, 6, -0.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse( 12, 12, 12, 6,  0.4, 0, Math.PI * 2); ctx.fill();
  // Petals
  const pCols = ['#ff88cc', '#ffaaee', '#ff66bb', '#ff55aa', '#ee88dd', '#ffbbdd'];
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI * 2 / 8) * i + lotus.phase * 0.15;
    ctx.save(); ctx.rotate(a); ctx.fillStyle = pCols[i % pCols.length]; ctx.globalAlpha = 0.9;
    ctx.beginPath(); ctx.ellipse(0, -19, 6.5, 14, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  // Center glow
  ctx.save(); ctx.shadowBlur = 20; ctx.shadowColor = '#ffee44';
  ctx.fillStyle = '#ffee44';
  ctx.beginPath(); ctx.arc(0, -5, 9, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // Sparkles
  ctx.strokeStyle = 'rgba(255,255,200,0.7)'; ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const a2 = (Math.PI / 2) * i + lotus.phase;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a2) * 11, Math.sin(a2) * 11 - 5);
    ctx.lineTo(Math.cos(a2) * 20, Math.sin(a2) * 20 - 5);
    ctx.stroke();
  }
  ctx.restore();
}

/* ── PLAYER ── */
function drawPlayer(camX) {
  const p = player;
  const x = p.x - camX, y = p.y;
  if (x < -60 || x > W + 60) return;
  const blink = p.invincible > 0 && Math.floor(p.invincible / 5) % 2 === 0;
  if (blink) return;

  const sq     = p.squish;
  const yScale = !p.onGround ? (p.vy < 0 ? 1.12 : 0.90) : 1;

  ctx.save();
  ctx.translate(x + p.w / 2, y + p.h);
  ctx.scale(p.facing * sq, yScale / sq);

  // Shield aura
  if (p.shielded) {
    ctx.save();
    ctx.globalAlpha  = 0.35 + 0.2 * Math.sin(t * 8);
    ctx.strokeStyle  = '#ff88ff'; ctx.lineWidth = 3;
    ctx.shadowBlur   = 14; ctx.shadowColor = '#ff88ff';
    ctx.beginPath(); ctx.arc(0, -p.h / 2, 22, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  // Speed trail
  if (p.boosted > 0 && Math.floor(t * 12) % 2 === 0) {
    ctx.save(); ctx.globalAlpha = 0.4;
    ctx.fillStyle = '#ff6633';
    ctx.beginPath(); ctx.ellipse(-7, -p.h / 2, 8, 15, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // Ground shadow
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath(); ctx.ellipse(0, 0, 11, 4, 0, 0, Math.PI * 2); ctx.fill();

  ctx.translate(0, -p.h / 2);

  // Body
  ctx.fillStyle = '#3ecc55';
  ctx.beginPath(); ctx.ellipse(0, 0, 13, 11, 0, 0, Math.PI * 2); ctx.fill();

  // Belly
  ctx.fillStyle = '#90eeaa';
  ctx.beginPath(); ctx.ellipse(0, 3, 8, 7, 0, 0, Math.PI * 2); ctx.fill();

  // Eyes
  const ey = p.onGround ? 0 : (p.vy < 0 ? -2 : 1.5);
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(-5.5, -6 + ey, 5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc( 5.5, -6 + ey, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.arc(-5,   -5.5 + ey, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc( 6,   -5.5 + ey, 3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(-4, -6.5 + ey, 1, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc( 7, -6.5 + ey, 1, 0, Math.PI * 2); ctx.fill();

  // Mouth (expression changes with velocity)
  ctx.strokeStyle = '#1a5528'; ctx.lineWidth = 1.5;
  if (p.vy < -3) {
    ctx.beginPath(); ctx.arc(0, 3, 3.5, 0, Math.PI); ctx.stroke();
  } else if (p.vy > 5) {
    ctx.beginPath(); ctx.arc(0, 5.5, 3, Math.PI, 0); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.moveTo(-3.5, 3.5); ctx.quadraticCurveTo(0, 6.5, 3.5, 3.5); ctx.stroke();
  }

  // Legs
  ctx.fillStyle = '#2aaa44';
  const lp2 = p.onGround ? Math.sin(t * 14) * 0.4 : 0;
  ctx.save(); ctx.rotate(-0.75 + lp2);
  ctx.beginPath(); ctx.roundRect(-2, 8, 6, 10, 3); ctx.fill(); ctx.restore();
  ctx.save(); ctx.rotate( 0.75 - lp2);
  ctx.beginPath(); ctx.roundRect(-3.5, 8, 6, 10, 3); ctx.fill(); ctx.restore();

  // Hat
  ctx.fillStyle = '#0d3318';
  ctx.fillRect(-8, -16, 16, 5);   // brim
  ctx.fillRect(-5, -25, 10, 11);  // crown
  ctx.fillStyle = '#2ecc71';
  ctx.fillRect(-8, -16, 16, 2);   // hatband

  ctx.restore();
}

/* ── PARTICLES ── */
function drawParticles(camX) {
  particles.forEach(p => {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle   = p.color;
    ctx.beginPath(); ctx.arc(p.x - camX, p.y, Math.max(0, p.sz * p.life), 0, Math.PI * 2); ctx.fill();
  });
  floatTexts.forEach(f => {
    ctx.globalAlpha = Math.max(0, f.life);
    ctx.fillStyle   = f.color;
    ctx.font        = 'bold 12px Courier New';
    ctx.textAlign   = 'center';
    ctx.fillText(f.text, f.x - camera.x, f.y);
  });
  ctx.globalAlpha = 1;
  ctx.textAlign   = 'left';
}

/* ── POWER-UP TIMER BARS ── */
function drawTimerBars() {
  const p = player;
  let barY = H - 12;
  if (p.shieldTimer > 0) {
    const frac = p.shieldTimer / 480;
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(10, barY - 7, 120, 6);
    ctx.fillStyle = '#ff88ff';          ctx.fillRect(10, barY - 7, 120 * frac, 6);
    ctx.fillStyle = '#ff88ff'; ctx.font = '9px Courier New'; ctx.fillText('SHIELD', 136, barY);
    barY -= 12;
  }
  if (p.boosted > 0) {
    const frac = p.boosted / 360;
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(10, barY - 7, 120, 6);
    ctx.fillStyle = '#ff6633';          ctx.fillRect(10, barY - 7, 120 * frac, 6);
    ctx.fillStyle = '#ff6633'; ctx.font = '9px Courier New'; ctx.fillText('SPEED', 136, barY);
  }
}

/* ═══════════════════════════════════════════
   HUD HELPERS
   ═══════════════════════════════════════════ */
function updateHUD() {
  document.getElementById('sHud').textContent = score;
  document.getElementById('fHud').textContent = fliesCollected + '/' + totalFlies;
  document.getElementById('lvHud').textContent = window.level;
  document.getElementById('hiHud').textContent = hiScore;
  const h = ['💀', '❤️', '❤️❤️', '❤️❤️❤️'];
  document.getElementById('livHud').textContent = h[Math.max(0, Math.min(lives, 3))];
}
function showPowerHud(txt) {
  document.getElementById('powerHud').style.display = 'flex';
  document.getElementById('pHud').textContent = txt;
}
function hidePowerHud() {
  document.getElementById('powerHud').style.display = 'none';
}

/* ═══════════════════════════════════════════
   OVERLAY SCREENS
   ═══════════════════════════════════════════ */
const ov = document.getElementById('overlay');

function showMenu() {
  ov.innerHTML = `
    <div class="frog">🐸</div>
    <h1>FROGGO'S LEAP</h1>
    <div class="sub">LILY PAD PLATFORMER</div>
    <button class="btn" id="playBtn">▶ PLAY</button>
    <div class="instructions">
      ← → MOVE &nbsp;|&nbsp; SPACE / ↑ JUMP &nbsp;|&nbsp; DOUBLE JUMP!<br>
      🪰 Collect flies &nbsp;|&nbsp; 🐝 Jump ON hornets to stomp<br>
      ⭐ Shield star = absorbs one hit &nbsp;|&nbsp; 🍄 Mushroom = speed<br>
      🚩 Reach checkpoints to save progress &nbsp;|&nbsp; 🌸 Lotus = next level<br>
      <span style="color:#ffcc44">HI-SCORE: <span id="hiHud">${hiScore}</span></span>
    </div>`;
  ov.style.display = 'flex';
  document.getElementById('playBtn').onclick = startGame;
}

function showLevelClear() {
  ov.innerHTML = `
    <div class="frog">🐸</div>
    <div style="color:#88ffbb;font-size:11px;letter-spacing:5px;margin-bottom:6px">LEVEL ${window.level} COMPLETE!</div>
    <h1 style="font-size:36px">CLEAR!</h1>
    <div class="lc-stars">★★★</div>
    <div class="lc-bonus">+${lcBonus} BONUS</div>
    <div style="color:#88ffbb;font-size:12px;letter-spacing:3px;margin-top:10px">
      Flies: ${fliesCollected}/${totalFlies}
    </div>
    <div style="color:#66aa88;font-size:11px;margin-top:16px">Level ${window.level + 1} loading…</div>`;
  ov.style.display = 'flex';
}

function showWin() {
  ov.innerHTML = `
    <div style="font-size:40px;margin-bottom:8px;animation:fbounce 0.8s ease-in-out infinite alternate">🏆</div>
    <div class="win-title">YOU WIN!</div>
    <div style="color:#ffee88;font-size:13px;letter-spacing:4px;margin:10px 0 4px">ALL 3 LEVELS CLEARED!</div>
    <div class="score-label">FINAL SCORE</div>
    <div class="score-big">${score}</div>
    <div class="hi">${score >= hiScore ? '🏆 NEW HIGH SCORE!' : 'BEST: ' + hiScore}</div>
    <button class="btn" id="replayBtn">▶ PLAY AGAIN</button>
    <button class="btn" id="menuBtnW" style="font-size:13px">MAIN MENU</button>`;
  ov.style.display = 'flex';
  document.getElementById('replayBtn').onclick = startGame;
  document.getElementById('menuBtnW').onclick  = () => { gameState = 'menu'; showMenu(); };
}

function showGameOver() {
  ov.innerHTML = `
    <div style="color:#ff4444;font-size:13px;letter-spacing:6px;margin-bottom:6px;text-shadow:0 0 10px #ff4444">GAME OVER</div>
    <div class="frog" style="animation:none">💀</div>
    <div class="score-label">SCORE</div>
    <div class="score-big">${score}</div>
    <div class="hi">${score >= hiScore ? '🏆 NEW HIGH SCORE!' : 'BEST: ' + hiScore}</div>
    <button class="btn" id="replayBtnGO">▶ TRY AGAIN</button>
    <button class="btn" id="menuBtnGO" style="font-size:13px">MAIN MENU</button>`;
  ov.style.display = 'flex';
  document.getElementById('replayBtnGO').onclick = startGame;
  document.getElementById('menuBtnGO').onclick   = () => { gameState = 'menu'; showMenu(); };
}

function startGame() {
  initAC();
  score = 0; lives = 3; window.level = 1; fliesCollected = 0;
  // Fully reset fade state so a second play-through never starts blacked out
  fadeAlpha = 0; fadeDir = 0; pendingLevel = null;
  lcTimer = 0;
  ov.style.display = 'none';
  initLevel(1);
  gameState = 'playing';
  stopBGM(); startBGM();
  updateHUD();
}

/* ═══════════════════════════════════════════
   INPUT
   ═══════════════════════════════════════════ */
document.addEventListener('keydown', e => {
  keys[e.code] = true; keys[e.key] = true;
  if (['Space', 'ArrowUp', 'KeyW'].includes(e.code) || e.key === 'ArrowUp') {
    e.preventDefault(); doJump();
  }
  if (['ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
});
document.addEventListener('keyup', e => { keys[e.code] = false; keys[e.key] = false; });

/* Mobile D-Pad */
function setupDpad() {
  const dl = document.getElementById('dp-left');
  const dr = document.getElementById('dp-right');
  const dj = document.getElementById('dpad-jump');

  function hold(btn, key) {
    btn.addEventListener('touchstart',  e => { e.preventDefault(); dKeys[key] = true;  }, { passive: false });
    btn.addEventListener('touchend',    e => { e.preventDefault(); dKeys[key] = false; }, { passive: false });
    btn.addEventListener('touchcancel', e => { e.preventDefault(); dKeys[key] = false; }, { passive: false });
    btn.addEventListener('mousedown', () => dKeys[key] = true);
    btn.addEventListener('mouseup',   () => dKeys[key] = false);
  }
  hold(dl, 'left');
  hold(dr, 'right');
  dj.addEventListener('touchstart', e => { e.preventDefault(); doJump(); }, { passive: false });
  dj.addEventListener('mousedown',  () => doJump());
}
setupDpad();

/* ═══════════════════════════════════════════
   GAME LOOP
   ═══════════════════════════════════════════ */
function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}

/* Boot */
showMenu();
loop();
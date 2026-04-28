'use strict';

/* ═══════════════════ AUDIO ═══════════════════ */
let audioCtx = null;

function initAC() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
}

function playTone(freq, type, dur, vol=0.25) {
  if (!audioCtx) return;
  try {
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    o.start(); o.stop(audioCtx.currentTime + dur + 0.01);
  } catch(e) {}
}

function sfxJump()       { playTone(300,'square',0.1,0.18); setTimeout(()=>playTone(440,'square',0.07,0.1),40); }
function sfxDJump()      { playTone(370,'square',0.09,0.18); setTimeout(()=>playTone(580,'triangle',0.08,0.12),35); }
function sfxLand()       { playTone(110,'sine',0.07,0.12); }
function sfxFly()        { playTone(880,'sine',0.05,0.12); setTimeout(()=>playTone(1100,'sine',0.03,0.07),30); }
function sfxMushroom()   { [300,420,540,680].forEach((f,i)=>setTimeout(()=>playTone(f,'square',0.09,0.18),i*38)); }
function sfxShield()     { [220,380,580,820].forEach((f,i)=>setTimeout(()=>playTone(f,'triangle',0.09,0.14),i*28)); }
function sfxCheckpoint() { [440,550,660,880].forEach((f,i)=>setTimeout(()=>playTone(f,'sine',0.13,0.18),i*55)); }
function sfxStomp()      { playTone(160,'sawtooth',0.1,0.22); setTimeout(()=>playTone(320,'square',0.07,0.09),40); }
function sfxHurt()       { playTone(210,'sawtooth',0.18,0.28); setTimeout(()=>playTone(160,'sawtooth',0.14,0.18),80); }
function sfxLevelClear() { [523,659,784,1047].forEach((f,i)=>setTimeout(()=>playTone(f,'sine',0.28,0.28),i*95)); }
function sfxWin()        { [523,659,784,880,1047,1319].forEach((f,i)=>setTimeout(()=>playTone(f,'sine',0.35,0.28),i*110)); }

let bgmPlaying = false;
let bgmTimeout = null;

function startBGM() {
  stopBGM();
  if (!audioCtx) return;
  bgmPlaying = true;
  const themes = [
    [261,329,392,329,261,220,261,329],      // L1 – gentle swamp
    [220,277,330,415,330,277,220,185],      // L2 – mysterious cavern
    [196,247,294,370,440,370,294,247],      // L3 – volcanic energy
  ];
  const seq = themes[Math.min(window.level - 1, 2)];
  let i = 0;
  function tick() {
    if (!bgmPlaying) return;
    playTone(seq[i % seq.length], 'triangle', 0.22, 0.055);
    i++;
    bgmTimeout = setTimeout(tick, 260);
  }
  tick();
}

function stopBGM() {
  bgmPlaying = false;
  if (bgmTimeout) { clearTimeout(bgmTimeout); bgmTimeout = null; }
}

/* ═══════════════════ LEVELS ═══════════════════ */
const LEVELS = [

  /* ── LEVEL 1 : Moonlit Swamp ── */
  {
    theme: {
      name:'MOONLIT SWAMP', bg1:'#071510',
      moonGlow:'#66ffaa', moon:'#cceedd', star:'#aaffcc',
      bgTree:'#0d3318', cloud:'#0e2219', water:'#0a2818',
      padL:'#4ecb6a', pad:'#2a8a40', trunk:'#1a5528',
    },
    platforms: [
      { x:0,    y:400, w:200, h:30, type:'ground' },
      { x:255,  y:368, w:80,  h:14, type:'lily' },
      { x:392,  y:343, w:80,  h:14, type:'lily' },
      { x:535,  y:400, w:175, h:30, type:'ground' },
      { x:763,  y:358, w:80,  h:14, type:'lily' },
      { x:893,  y:328, w:80,  h:14, type:'lily' },
      { x:1022, y:400, w:160, h:30, type:'ground' },
      { x:1235, y:353, w:80,  h:14, type:'lily', moving:true, mSpeed:1.2, mRange:60 },
      { x:1363, y:313, w:80,  h:14, type:'lily' },
      { x:1492, y:400, w:160, h:30, type:'ground' },
      { x:1703, y:353, w:80,  h:14, type:'lily' },
      { x:1833, y:313, w:80,  h:14, type:'lily' },
      { x:1965, y:400, w:200, h:30, type:'ground' },
    ],
    flies: [
      {x:280,y:346},{x:417,y:321},{x:622,y:376},
      {x:788,y:336},{x:918,y:306},{x:1087,y:376},
      {x:1260,y:331},{x:1388,y:291},{x:1728,y:331},{x:1858,y:291},
    ],
    mushrooms: [{x:605,y:376},{x:1542,y:376}],
    shields:   [{x:1375,y:291}],
    hornets: [
      {x:648, y:376, speed:1.4, range:140},
      {x:1082,y:376, speed:1.7, range:110},
      {x:1545,y:376, speed:1.9, range:120},
    ],
    checkpoints: [{x:1027,y:365}],
    lotusPlatIdx: 12,
    lotusX: 2045,
  },

  /* ── LEVEL 2 : Crystal Cavern ── */
  {
    theme: {
      name:'CRYSTAL CAVERN', bg1:'#050a18',
      moonGlow:'#8888ff', moon:'#aabbff', star:'#aabbff',
      bgTree:'#0a1035', cloud:'#0c1440', water:'#080e2e',
      padL:'#6688ff', pad:'#3355cc', trunk:'#1a2a88',
    },
    platforms: [
      { x:0,    y:400, w:200, h:30, type:'ground' },
      { x:253,  y:358, w:72,  h:14, type:'lily' },
      { x:382,  y:315, w:72,  h:14, type:'lily' },
      { x:504,  y:272, w:72,  h:14, type:'lily' },
      { x:633,  y:400, w:160, h:30, type:'ground' },
      { x:852,  y:348, w:72,  h:14, type:'lily', moving:true, mSpeed:1.5, mRange:75 },
      { x:984,  y:303, w:72,  h:14, type:'lily', moving:true, mSpeed:1.8, mRange:60 },
      { x:1113, y:400, w:160, h:30, type:'ground' },
      { x:1323, y:343, w:72,  h:14, type:'lily' },
      { x:1452, y:293, w:72,  h:14, type:'lily' },
      { x:1573, y:343, w:72,  h:14, type:'lily', moving:true, mSpeed:2.0, mRange:68 },
      { x:1703, y:400, w:160, h:30, type:'ground' },
      { x:1913, y:348, w:72,  h:14, type:'lily' },
      { x:2043, y:298, w:72,  h:14, type:'lily' },
      { x:2183, y:400, w:200, h:30, type:'ground' },
    ],
    flies: [
      {x:274,y:336},{x:403,y:293},{x:525,y:250},
      {x:703,y:376},{x:877,y:326},{x:1009,y:281},
      {x:1183,y:376},{x:1348,y:321},{x:1477,y:271},
      {x:1743,y:376},{x:1938,y:326},{x:2068,y:276},
    ],
    mushrooms: [{x:683,y:376},{x:1758,y:376}],
    shields:   [{x:1463,y:271},{x:2058,y:276}],
    hornets: [
      {x:503, y:250, speed:1.8, range:95},
      {x:705, y:376, speed:2.0, range:128},
      {x:1163,y:376, speed:2.2, range:118},
      {x:1703,y:376, speed:2.4, range:128},
      {x:2233,y:376, speed:2.0, range:148},
    ],
    checkpoints: [{x:1118,y:365},{x:1708,y:365}],
    lotusPlatIdx: 14,
    lotusX: 2263,
  },

  /* ── LEVEL 3 : Volcanic Sky ── */
  {
    theme: {
      name:'VOLCANIC SKY', bg1:'#110403',
      moonGlow:'#ff6622', moon:'#ffcc66', star:'#ffcc88',
      bgTree:'#380900', cloud:'#280800', water:'#381005',
      padL:'#ff8844', pad:'#cc4400', trunk:'#7a2200',
    },
    platforms: [
      { x:0,    y:400, w:178, h:30, type:'ground' },
      { x:238,  y:353, w:65,  h:14, type:'lily', moving:true, mSpeed:1.5, mRange:50 },
      { x:368,  y:308, w:65,  h:14, type:'lily' },
      { x:488,  y:263, w:65,  h:14, type:'lily', moving:true, mSpeed:2.0, mRange:58 },
      { x:618,  y:400, w:158, h:30, type:'ground' },
      { x:838,  y:338, w:65,  h:14, type:'lily', moving:true, mSpeed:2.5, mRange:78 },
      { x:968,  y:283, w:65,  h:14, type:'lily' },
      { x:1088, y:338, w:65,  h:14, type:'lily', moving:true, mSpeed:2.2, mRange:72 },
      { x:1218, y:400, w:148, h:30, type:'ground' },
      { x:1418, y:338, w:65,  h:14, type:'lily', moving:true, mSpeed:3.0, mRange:88 },
      { x:1558, y:278, w:65,  h:14, type:'lily' },
      { x:1678, y:338, w:65,  h:14, type:'lily', moving:true, mSpeed:2.8, mRange:78 },
      { x:1808, y:400, w:148, h:30, type:'ground' },
      { x:2008, y:338, w:65,  h:14, type:'lily', moving:true, mSpeed:2.5, mRange:68 },
      { x:2138, y:283, w:65,  h:14, type:'lily' },
      { x:2268, y:400, w:200, h:30, type:'ground' },
    ],
    flies: [
      {x:263,y:331},{x:393,y:286},{x:513,y:241},
      {x:688,y:376},{x:863,y:316},{x:993,y:261},
      {x:1113,y:316},{x:1288,y:376},{x:1443,y:316},
      {x:1583,y:256},{x:1703,y:316},{x:1878,y:376},
      {x:2033,y:316},{x:2163,y:261},
    ],
    mushrooms: [{x:658,y:376},{x:1248,y:376},{x:1838,y:376}],
    shields:   [{x:503,y:241},{x:1568,y:256}],
    hornets: [
      {x:395, y:286, speed:2.0, range:78},
      {x:658, y:376, speed:2.5, range:128},
      {x:983, y:261, speed:2.8, range:98},
      {x:1248,y:376, speed:3.0, range:118},
      {x:1593,y:256, speed:2.5, range:88},
      {x:1848,y:376, speed:3.2, range:138},
      {x:2298,y:376, speed:2.8, range:158},
    ],
    checkpoints: [{x:623,y:365},{x:1223,y:365},{x:1813,y:365}],
    lotusPlatIdx: 15,
    lotusX: 2348,
  },
];

/* ═══════════════════ CANVAS ═══════════════════ */
const cv  = document.getElementById('gc');
const ctx = cv.getContext('2d');
const W   = 800;
const H   = 500;

/* Scale the canvas pixel buffer by devicePixelRatio so it renders
   at the screen's native resolution — no blurry upscaling.
   All game logic still uses W=800 / H=500 coordinates unchanged. */
(function setupHiDPI() {
  const dpr = window.devicePixelRatio || 1;
  cv.width  = W * dpr;
  cv.height = H * dpr;
  cv.style.width  = W + 'px';
  cv.style.height = H + 'px';
  ctx.scale(dpr, dpr);
})();

/* ═══════════════════ GLOBAL STATE ═══════════════════ */
let gameState = 'menu';
window.level  = 1;
let score     = 0;
let lives     = 3;
let hiScore   = 0;
let fliesCollected = 0;
let totalFlies     = 0;
let t = 0;

let lcTimer = 0, lcBonus = 0;
let fadeAlpha = 0, fadeDir = 0, pendingLevel = null;

let player, platforms, flyItems, mushrooms, shields, hornets, checkpoints, lotus, camera;

/* ═══════════════════ PHYSICS ═══════════════════ */
const GRAV    = 0.50;
const JFORCE  = -12.5;
const SPD     = 4.8;
const COYOTE  = 8;
const JBUFFER = 10;

/* ═══════════════════ INPUT ═══════════════════ */
const keys  = {};
const dKeys = { left:false, right:false, jump:false };

/* ═══════════════════ PARTICLES ═══════════════════ */
let particles  = [];
let floatTexts = [];

/* ═══════════════════ INIT LEVEL ═══════════════════ */
function initLevel(lvl) {
  window.level = lvl;
  const def = LEVELS[lvl - 1];
  const th  = def.theme;

  camera     = { x:0 };
  particles  = [];
  floatTexts = [];

  platforms = def.platforms.map(p => ({
    ...p,
    c:        th,
    bobPhase: Math.random() * Math.PI * 2,
    bobAmp:   p.type === 'lily' ? 3 : 0,
    mDir:     1,
    mOriginX: p.x,
    origY:    p.y,
    mSpeed:   p.mSpeed || 0,
    mRange:   p.mRange || 0,
  }));

  flyItems = def.flies.map(f => ({
    ...f, collected:false, phase:Math.random()*Math.PI*2
  }));
  totalFlies     = flyItems.length;
  fliesCollected = 0;

  mushrooms   = def.mushrooms.map(m => ({...m, collected:false, phase:Math.random()*Math.PI*2}));
  shields     = def.shields.map(s   => ({...s, collected:false, phase:Math.random()*Math.PI*2}));
  checkpoints = def.checkpoints.map(cp => ({...cp, active:false}));

  hornets = def.hornets.map(h => ({
    x:h.x, y:h.y,
    vx:h.speed * (Math.random()>0.5?1:-1),
    w:22, h:18,
    patrolX:h.x - h.range/2,
    patrolW:h.range,
    phase:Math.random()*Math.PI*2,
    alive:true, stompTimer:0,
  }));

  const lp = platforms[def.lotusPlatIdx] || platforms[platforms.length-1];
  lotus = { x:def.lotusX, y:lp.y-50, w:28, h:45, reached:false, phase:0 };

  const firstGround = platforms.find(p => p.type==='ground');
  const spawnY      = firstGround ? firstGround.y - 32 : 385;

  player = {
    x:50, y:spawnY, vx:0, vy:0, w:26, h:28,
    onGround:false, wasOnGround:false,
    coyoteFrames:0, jumpBuffer:0,
    jumps:0, maxJumps:2,
    facing:1, phase:0, squish:1, squishV:0,
    invincible:0, shielded:0, shieldTimer:0,
    boosted:0, dead:false,
    respawnX:50, respawnY:spawnY, ridingPlat:null,
  };
  updateHUD();
}

/* ═══════════════════ UPDATE ═══════════════════ */
function update() {

  /* Fade transition */
  if (fadeDir !== 0) {
    fadeAlpha += fadeDir * 0.04;
    if (fadeAlpha >= 1) {
      fadeAlpha = 1; fadeDir = 0;
      if (pendingLevel) {
        pendingLevel();
        pendingLevel = null;
        fadeDir = -1;
        ov.style.display = 'none';
      }
    }
    if (fadeAlpha <= 0) { fadeAlpha = 0; fadeDir = 0; }
  }

  /* Level-clear hold */
  if (gameState === 'levelclear') {
    lcTimer--;
    if (lcTimer <= 0 && !pendingLevel) {
      doFadeTransition(() => {
        window.level++;
        if (window.level > LEVELS.length) { triggerWin(); return; }
        initLevel(window.level);
        gameState = 'playing';
        stopBGM();
        startBGM();
      });
    }
    updateParticles();
    return;
  }

  if (gameState !== 'playing') return;
  t += 1/60;

  /* Moving / bobbing platforms */
  platforms.forEach(p => {
    p.y = p.origY + Math.sin(t + p.bobPhase) * p.bobAmp;
    if (p.moving) {
      p.x += p.mDir * p.mSpeed;
      if (p.x >= p.mOriginX + p.mRange || p.x <= p.mOriginX - p.mRange) p.mDir *= -1;
    }
  });

  /* Hornets */
  hornets.forEach(h => {
    if (!h.alive) { if (h.stompTimer>0) h.stompTimer--; return; }
    h.phase += 0.07; h.x += h.vx;
    if (h.x < h.patrolX)             h.vx =  Math.abs(h.vx);
    if (h.x > h.patrolX + h.patrolW) h.vx = -Math.abs(h.vx);
  });

  /* Item animation */
  flyItems.forEach(f  => { f.phase  += 0.05; });
  mushrooms.forEach(m => { m.phase  += 0.04; });
  shields.forEach(s   => { s.phase  += 0.06; });
  lotus.phase += 0.04;

  /* ─── PLAYER ─── */
  const p = player;
  p.phase  += 0.10;
  p.squishV += (1 - p.squish) * 0.28; p.squishV *= 0.72; p.squish += p.squishV;
  if (p.invincible  > 0) p.invincible--;
  if (p.shieldTimer > 0) { p.shieldTimer--; if (p.shieldTimer===0) p.shielded=0; }
  if (p.boosted     > 0) p.boosted--;
  if (p.jumpBuffer  > 0) p.jumpBuffer--;

  if (p.wasOnGround && !p.onGround && p.vy>=0) p.coyoteFrames = COYOTE;
  if (p.coyoteFrames > 0) p.coyoteFrames--;

  const maxSpd = p.boosted > 0 ? SPD*1.7 : SPD;
  const mLeft  = keys['ArrowLeft']  || keys['KeyA'] || keys['a'] || dKeys.left;
  const mRight = keys['ArrowRight'] || keys['KeyD'] || keys['d'] || dKeys.right;

  if (mLeft)  { p.vx -= 1.4; p.facing = -1; }
  if (mRight) { p.vx += 1.4; p.facing =  1; }
  p.vx *= 0.75;
  if (Math.abs(p.vx) > maxSpd) p.vx = Math.sign(p.vx)*maxSpd;

  const holdingJump = keys['Space'] || keys['ArrowUp'] || keys['KeyW'] || dKeys.jump;
  const gravMod = (holdingJump && p.vy < 0) ? 0.65 : 1.0;
  p.vy = Math.min(p.vy + GRAV*gravMod, 16);

  p.wasOnGround = p.onGround;
  p.onGround    = false;
  p.ridingPlat  = null;

  if (p.jumpBuffer > 0 && (p.onGround || p.coyoteFrames>0 || p.jumps<p.maxJumps)) execJump();

  /* Move X */
  p.x += p.vx;
  if (p.x < 0) { p.x=0; p.vx=0; }
  platforms.forEach(pl => {
    if (!aabb(p,pl)) return;
    const ox = overlapX(p,pl);
    p.x += Math.sign((p.x+p.w/2)-(pl.x+pl.w/2))*ox;
    p.vx = 0;
  });

  /* Move Y */
  p.y += p.vy;
  platforms.forEach(pl => {
    if (!aabb(p,pl)) return;
    const dy = (p.y+p.h/2) - (pl.y+pl.h/2);
    if (dy < 0) {
      p.y = pl.y - p.h; p.vy = 0; p.onGround = true; p.jumps = 0;
      p.coyoteFrames = 0; p.ridingPlat = pl;
      if (!p.wasOnGround) { p.squish=0.65; p.squishV=0.35; sfxLand(); }
    } else {
      p.y  = pl.y + pl.h;
      p.vy = Math.abs(p.vy)*0.2;
    }
  });

  if (p.ridingPlat && p.ridingPlat.moving) p.x += p.ridingPlat.mDir * p.ridingPlat.mSpeed;

  /* Collect items */
  flyItems.forEach(f => {
    if (f.collected || !circ(p,f.x,f.y,18)) return;
    f.collected=true; score+=10; fliesCollected++;
    sfxFly(); spawnParticles(f.x,f.y,'#ffff66',6,4);
    spawnFloat(f.x,f.y,'+10','#ffee44'); updateHUD();
  });
  mushrooms.forEach(m => {
    if (m.collected || !circ(p,m.x,m.y,20)) return;
    m.collected=true; p.boosted=360;
    sfxMushroom(); spawnParticles(m.x,m.y,'#ff5533',10,5);
    spawnFloat(m.x,m.y,'SPEED!','#ff8844'); showPowerHud('SPEED');
  });
  shields.forEach(s => {
    if (s.collected || !circ(p,s.x,s.y,20)) return;
    s.collected=true; p.shielded=1; p.shieldTimer=480;
    sfxShield(); spawnParticles(s.x,s.y,'#ff88ff',12,5);
    spawnFloat(s.x,s.y,'SHIELD!','#ff88ff'); showPowerHud('SHIELD');
  });
  if (p.boosted===0 && p.shielded===0) hidePowerHud();

  checkpoints.forEach(cp => {
    if (cp.active || !circ(p,cp.x,cp.y+20,32)) return;
    cp.active=true; p.respawnX=cp.x-p.w/2; p.respawnY=cp.y-5;
    sfxCheckpoint(); spawnParticles(cp.x,cp.y+20,'#ffffff',12,4);
    spawnFloat(cp.x,cp.y,'CHECKPOINT!','#ffffff');
  });

  /* Hornets */
  hornets.forEach(h => {
    if (!h.alive || p.invincible>0) return;
    const hBox = { x:h.x-h.w/2, y:h.y-h.h/2, w:h.w, h:h.h };
    if (!aabb(p,hBox)) return;
    if (p.vy>0 && (p.y+p.h) < h.y-h.h/2+12) {
      killHornet(h); p.vy=JFORCE*0.6; p.jumps=1;
    } else {
      takeDamage();
    }
  });

  /* Lotus (goal) */
  if (!lotus.reached && circ(p,lotus.x,lotus.y+20,34)) {
    lotus.reached = true;
    lcBonus = 100 + window.level*50 + fliesCollected*5;
    score  += lcBonus;
    sfxLevelClear();
    spawnParticles(lotus.x,lotus.y+20,'#ff88cc',24,7);
    spawnParticles(lotus.x,lotus.y+20,'#ffee44',16,5);
    spawnFloat(lotus.x,lotus.y,'+'+lcBonus+' CLEAR!','#ff88cc');
    updateHUD();
    if (window.level >= LEVELS.length) {
      triggerWin();
    } else {
      gameState = 'levelclear';
      lcTimer   = 200;
      showLevelClear();
    }
  }

  /* Fall */
  if (p.y > H+80) takeDamage();

  /* Camera */
  const targetCamX = Math.max(0, p.x - 240);
  camera.x += (targetCamX - camera.x) * 0.10;

  updateParticles();
}

/* ─── Jump ─── */
function execJump() {
  const p = player;
  if (!(p.onGround || p.coyoteFrames>0 || p.jumps<p.maxJumps)) return;
  p.vy = JFORCE;
  p.jumps = (p.onGround || p.coyoteFrames>0) ? 1 : p.jumps+1;
  p.jumpBuffer=0; p.coyoteFrames=0;
  p.squish=0.62; p.squishV=0.38;
  p.jumps===1 ? sfxJump() : sfxDJump();
  spawnParticles(p.x+p.w/2, p.y+p.h, '#88ffaa', 5, 2.5);
}

function doJump() {
  if (gameState!=='playing') return;
  const p = player;
  if (p.onGround || p.coyoteFrames>0 || p.jumps<p.maxJumps) execJump();
  else p.jumpBuffer = JBUFFER;
}

function killHornet(h) {
  h.alive=false; h.stompTimer=30; score+=25;
  sfxStomp(); spawnParticles(h.x,h.y,'#ffaa00',10,5);
  spawnFloat(h.x,h.y,'+25 STOMP!','#ffaa00'); updateHUD();
}

function takeDamage() {
  const p = player;
  if (p.invincible>0) return;
  if (p.shielded) {
    p.shielded=0; p.shieldTimer=0; p.invincible=100;
    spawnParticles(p.x+13,p.y+14,'#ff88ff',14,5);
    spawnFloat(p.x+13,p.y,'BLOCKED!','#ff88ff');
    hidePowerHud(); sfxShield(); return;
  }
  lives--;
  sfxHurt(); p.invincible=110;
  spawnParticles(p.x+13,p.y+14,'#ff4444',12,5);
  updateHUD();
  if (lives<=0) { setTimeout(triggerGameOver, 700); return; }
  p.x=p.respawnX; p.y=p.respawnY; p.vx=0; p.vy=0;
}

function triggerGameOver() {
  stopBGM(); gameState='gameover';
  if (score>hiScore) hiScore=score;
  showGameOver();
}

function triggerWin() {
  stopBGM(); gameState='win';
  if (score>hiScore) hiScore=score;
  sfxWin(); setTimeout(showWin, 1200);
}

function doFadeTransition(fn) {
  if (pendingLevel) return; // guard against double-trigger
  fadeAlpha=0; fadeDir=1; pendingLevel=fn;
}

/* ═══════════════════ PARTICLES ═══════════════════ */
function spawnParticles(x,y,color,count,speed) {
  for (let i=0;i<count;i++) {
    const a=(Math.PI*2/count)*i+Math.random()*0.6;
    const s=speed*(0.5+Math.random());
    particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-2,life:1,maxLife:0.5+Math.random()*0.5,sz:2+Math.random()*4,color});
  }
}
function spawnFloat(x,y,text,color='#ffcc44') {
  floatTexts.push({x,y,text,color,life:1,vy:-1.4});
}
function updateParticles() {
  particles  = particles.filter(p => { p.x+=p.vx; p.y+=p.vy; p.vy+=0.12; p.life-=0.018/p.maxLife; return p.life>0; });
  floatTexts = floatTexts.filter(f => { f.y+=f.vy; f.life-=0.016; return f.life>0; });
}

/* ═══════════════════ COLLISION ═══════════════════ */
function aabb(a,b) { return a.x<b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y; }
function overlapX(a,b) { return (a.w+b.w)/2-Math.abs((a.x+a.w/2)-(b.x+b.w/2)); }
function circ(p,cx,cy,r) { const dx=p.x+p.w/2-cx,dy=p.y+p.h/2-cy; return dx*dx+dy*dy<r*r; }

/* ═══════════════════ RENDER ═══════════════════ */
function render() {
  ctx.clearRect(0,0,W,H);
  if (gameState==='playing' || gameState==='levelclear') {
    const th   = LEVELS[window.level-1].theme;
    const camX = camera.x;
    drawBG(th,camX);
    platforms.forEach(p => drawPlatform(p,camX));
    checkpoints.forEach(cp => drawCheckpoint(cp,camX));
    flyItems.forEach(f => drawFly(f,camX));
    mushrooms.forEach(m => drawMushroom(m,camX));
    shields.forEach(s => drawShield(s,camX));
    hornets.forEach(h => drawHornet(h,camX));
    drawLotus(camX);
    drawPlayer(camX);
    drawParticles(camX);
    drawTimerBars();
  }
  if (fadeAlpha>0) {
    ctx.fillStyle=`rgba(0,0,0,${fadeAlpha})`;
    ctx.fillRect(0,0,W,H);
  }
}

/* ─── BG ─── */
function drawBG(th,camX) {
  ctx.fillStyle=th.bg1; ctx.fillRect(0,0,W,H);
  const mx=660-camX*0.04;
  ctx.save(); ctx.shadowBlur=32; ctx.shadowColor=th.moonGlow;
  ctx.fillStyle=th.moon; ctx.beginPath(); ctx.arc(mx,65,28,0,Math.PI*2); ctx.fill();
  ctx.shadowBlur=0; ctx.restore();
  ctx.fillStyle=th.star;
  for (let i=0;i<50;i++) {
    const sx=((i*163+camX*0.03)%W+W)%W, sy=(i*91+18)%185;
    ctx.globalAlpha=(0.3+0.7*Math.sin(t*1.2+i*0.8))*0.75;
    ctx.fillRect(sx,sy,1.5,1.5);
  }
  ctx.globalAlpha=1;
  ctx.fillStyle=th.bgTree;
  for (let i=0;i<14;i++) {
    const tx=((i*180+400-camX*0.22)%2200+2200)%2200, ht=48+(i*37)%38;
    ctx.fillRect(tx,H-135-ht,14,ht);
    ctx.beginPath(); ctx.arc(tx+7,H-135-ht,27,0,Math.PI*2); ctx.fill();
  }
  ctx.fillStyle=th.cloud;
  for (let i=0;i<6;i++) {
    const cx=((i*250+180-camX*0.38)%1900+1900)%1900, cy=55+i*24;
    ctx.globalAlpha=0.45;
    ctx.beginPath(); ctx.ellipse(cx,cy,50,17,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx+40,cy-5,34,14,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx-30,cy+4,29,12,0,0,Math.PI*2); ctx.fill();
  }
  ctx.globalAlpha=1;
  const wg=ctx.createLinearGradient(0,H-88,0,H);
  wg.addColorStop(0,th.water); wg.addColorStop(1,'#020406');
  ctx.fillStyle=wg; ctx.fillRect(0,H-88,W,88);
  ctx.strokeStyle='rgba(150,220,255,0.10)'; ctx.lineWidth=1;
  for (let i=0;i<7;i++) {
    const wy=H-80+i*11, off=Math.sin(t*1.1+i*0.9)*18;
    ctx.beginPath(); ctx.moveTo(0,wy);
    for (let xw=0;xw<W;xw+=22) ctx.lineTo(xw,wy+Math.sin((xw+off)*0.05)*2.5);
    ctx.stroke();
  }
  ctx.globalAlpha=0.13; ctx.fillStyle='#ffffff';
  ctx.font='bold 10px Courier New'; ctx.textAlign='left';
  ctx.fillText('LV '+window.level+' — '+th.name, 10, H-7);
  ctx.globalAlpha=1;
}

/* ─── PLATFORM ─── */
function drawPlatform(pl,camX) {
  const x=pl.x-camX, y=pl.y, w=pl.w, h=pl.h;
  if (x+w<-10||x>W+10) return;
  const c=pl.c;
  if (pl.type==='ground') {
    const g=ctx.createLinearGradient(x,y,x,y+h);
    g.addColorStop(0,c.padL); g.addColorStop(0.3,c.pad); g.addColorStop(1,c.trunk);
    ctx.fillStyle=g; ctx.beginPath(); ctx.roundRect(x,y,w,h,5); ctx.fill();
    ctx.strokeStyle=c.padL+'88'; ctx.lineWidth=1; ctx.stroke();
    ctx.fillStyle=c.padL; ctx.beginPath(); ctx.roundRect(x+3,y,w-6,7,3); ctx.fill();
    for (let i=0;i<Math.floor(w/20);i++) {
      const tx=x+10+i*20;
      ctx.beginPath(); ctx.moveTo(tx,y); ctx.lineTo(tx-3,y-6); ctx.lineTo(tx+3,y-6); ctx.closePath(); ctx.fill();
    }
  } else {
    const cx=x+w/2, cy=y+h/2;
    const g=ctx.createLinearGradient(x,y,x,y+h+4);
    g.addColorStop(0,c.padL); g.addColorStop(1,c.pad);
    ctx.fillStyle=g; ctx.beginPath(); ctx.ellipse(cx,cy+1,w/2,h/2+3,0,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle=c.padL+'cc'; ctx.lineWidth=1.5; ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,0.12)'; ctx.lineWidth=0.8;
    [0,60,120,180,240,300].forEach(deg => {
      const rad=deg*Math.PI/180;
      ctx.beginPath(); ctx.moveTo(cx,cy);
      ctx.lineTo(cx+Math.cos(rad)*(w/2-4), cy+Math.sin(rad)*(h/2+1)); ctx.stroke();
    });
    ctx.fillStyle='rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.moveTo(cx,y); ctx.lineTo(cx-5,y+9); ctx.lineTo(cx+5,y+9); ctx.closePath(); ctx.fill();
    if (pl.moving) {
      ctx.fillStyle=`rgba(255,220,80,${0.5+0.4*Math.sin(t*4)})`;
      ctx.beginPath(); ctx.arc(cx-6,cy,2.5,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx+6,cy,2.5,0,Math.PI*2); ctx.fill();
    }
  }
}

/* ─── CHECKPOINT ─── */
function drawCheckpoint(cp,camX) {
  const x=cp.x-camX, y=cp.y;
  if (x<-30||x>W+30) return;
  const waved=cp.active?Math.sin(t*4)*5:0;
  ctx.strokeStyle=cp.active?'#ffffff':'#777777'; ctx.lineWidth=2.5;
  ctx.beginPath(); ctx.moveTo(x,y+42); ctx.lineTo(x,y); ctx.stroke();
  ctx.fillStyle=cp.active?'#2ecc71':'#555555';
  ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+22+waved,y+8); ctx.lineTo(x,y+17); ctx.closePath(); ctx.fill();
  if (cp.active) {
    ctx.save(); ctx.shadowBlur=12; ctx.shadowColor='#2ecc71';
    ctx.fillStyle='#2ecc71'; ctx.beginPath(); ctx.arc(x,y+42,5,0,Math.PI*2); ctx.fill(); ctx.restore();
  } else {
    ctx.fillStyle='#444'; ctx.beginPath(); ctx.arc(x,y+42,4,0,Math.PI*2); ctx.fill();
  }
}

/* ─── FLY ─── */
function drawFly(f,camX) {
  if (f.collected) return;
  const x=f.x-camX, y=f.y+Math.sin(f.phase)*5;
  if (x<-20||x>W+20) return;
  ctx.save(); ctx.shadowBlur=8; ctx.shadowColor='#ffffaa';
  ctx.fillStyle='#222233'; ctx.beginPath(); ctx.ellipse(x,y,5,3.5,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(180,230,255,0.65)';
  ctx.beginPath(); ctx.ellipse(x-5,y-3,5,3,-0.4,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x+5,y-3,5,3, 0.4,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#ffff55'; ctx.beginPath(); ctx.arc(x+2,y-1,2,0,Math.PI*2); ctx.fill();
  ctx.shadowBlur=0; ctx.restore();
}

/* ─── MUSHROOM ─── */
function drawMushroom(m,camX) {
  if (m.collected) return;
  const x=m.x-camX, y=m.y+Math.sin(m.phase)*3;
  if (x<-30||x>W+30) return;
  ctx.fillStyle='#ddccaa'; ctx.beginPath(); ctx.roundRect(x-6,y,12,14,2); ctx.fill();
  ctx.fillStyle='#dd3311'; ctx.beginPath(); ctx.ellipse(x,y+2,15,11,0,Math.PI,Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.8)';
  ctx.beginPath(); ctx.arc(x-5,y-3,3,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(x+5,y-2,2.5,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(x,y-7,2,0,Math.PI*2); ctx.fill();
}

/* ─── SHIELD ─── */
function drawShield(s,camX) {
  if (s.collected) return;
  const x=s.x-camX, y=s.y+Math.sin(s.phase)*5;
  if (x<-30||x>W+30) return;
  ctx.save(); ctx.translate(x,y); ctx.rotate(s.phase*0.5);
  ctx.shadowBlur=14; ctx.shadowColor='#ff88ff'; ctx.fillStyle='#ffaaff';
  ctx.beginPath();
  for (let i=0;i<5;i++) {
    const a=(Math.PI*2/5)*i-Math.PI/2, a2=a+Math.PI/5;
    if (i===0) ctx.moveTo(Math.cos(a)*13,Math.sin(a)*13); else ctx.lineTo(Math.cos(a)*13,Math.sin(a)*13);
    ctx.lineTo(Math.cos(a2)*6,Math.sin(a2)*6);
  }
  ctx.closePath(); ctx.fill(); ctx.shadowBlur=0; ctx.restore();
}

/* ─── HORNET ─── */
function drawHornet(h,camX) {
  const x=h.x-camX, y=h.y;
  if (x<-30||x>W+30) return;
  if (!h.alive) {
    if (h.stompTimer>0) {
      ctx.globalAlpha=h.stompTimer/30; ctx.fillStyle='#ffddaa';
      ctx.beginPath(); ctx.arc(x,y,14*(1-h.stompTimer/30)+5,0,Math.PI*2); ctx.fill();
      ctx.globalAlpha=1;
    }
    return;
  }
  const wf=Math.sin(h.phase*3)*4;
  ctx.save(); ctx.translate(x,y+Math.sin(h.phase)*2);
  if (h.vx<0) ctx.scale(-1,1);
  ctx.fillStyle='rgba(200,230,255,0.65)';
  ctx.beginPath(); ctx.ellipse(-4,-9+wf,9,5,-0.3,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse( 4,-9-wf,9,5, 0.3,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#ffcc00'; ctx.beginPath(); ctx.ellipse(0,0,11,7,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#222';
  ctx.fillRect(-10,-3.5,4.5,7); ctx.fillRect(-1,-3.5,4.5,7);
  ctx.beginPath(); ctx.moveTo(-11,0); ctx.lineTo(-16,-3); ctx.lineTo(-16,3); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#ff2200'; ctx.beginPath(); ctx.arc(8,-2,3.5,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#ff7700'; ctx.beginPath(); ctx.arc(9,-3,1.5,0,Math.PI*2); ctx.fill();
  ctx.restore();
}

/* ─── LOTUS ─── */
function drawLotus(camX) {
  const x=lotus.x-camX, y=lotus.y;
  if (x<-50||x>W+50) return;
  const pulse=1+Math.sin(lotus.phase)*0.06;
  ctx.save(); ctx.translate(x,y+22); ctx.scale(pulse,pulse);
  ctx.strokeStyle='#2d7a35'; ctx.lineWidth=3;
  ctx.beginPath(); ctx.moveTo(0,20); ctx.lineTo(0,0); ctx.stroke();
  ctx.fillStyle='#2d7a35';
  ctx.beginPath(); ctx.ellipse(-12,12,12,6,-0.4,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse( 12,12,12,6, 0.4,0,Math.PI*2); ctx.fill();
  const pCols=['#ff88cc','#ffaaee','#ff66bb','#ff55aa','#ee88dd','#ffbbdd'];
  for (let i=0;i<8;i++) {
    const a=(Math.PI*2/8)*i+lotus.phase*0.15;
    ctx.save(); ctx.rotate(a); ctx.fillStyle=pCols[i%pCols.length]; ctx.globalAlpha=0.9;
    ctx.beginPath(); ctx.ellipse(0,-19,6.5,14,0,0,Math.PI*2); ctx.fill(); ctx.restore();
  }
  ctx.globalAlpha=1;
  ctx.save(); ctx.shadowBlur=20; ctx.shadowColor='#ffee44';
  ctx.fillStyle='#ffee44'; ctx.beginPath(); ctx.arc(0,-5,9,0,Math.PI*2); ctx.fill(); ctx.restore();
  ctx.strokeStyle='rgba(255,255,200,0.7)'; ctx.lineWidth=1;
  for (let i=0;i<4;i++) {
    const a2=(Math.PI/2)*i+lotus.phase;
    ctx.beginPath(); ctx.moveTo(Math.cos(a2)*11,Math.sin(a2)*11-5);
    ctx.lineTo(Math.cos(a2)*20,Math.sin(a2)*20-5); ctx.stroke();
  }
  ctx.restore();
}

/* ─── PLAYER ─── */
function drawPlayer(camX) {
  const p=player;
  const x=p.x-camX, y=p.y;
  if (x<-60||x>W+60) return;
  const blink=p.invincible>0 && Math.floor(p.invincible/5)%2===0;
  if (blink) return;
  const sq=p.squish;
  const yScale=!p.onGround?(p.vy<0?1.12:0.90):1;
  ctx.save(); ctx.translate(x+p.w/2,y+p.h); ctx.scale(p.facing*sq,yScale/sq);
  if (p.shielded) {
    ctx.save(); ctx.globalAlpha=0.35+0.2*Math.sin(t*8);
    ctx.strokeStyle='#ff88ff'; ctx.lineWidth=3; ctx.shadowBlur=14; ctx.shadowColor='#ff88ff';
    ctx.beginPath(); ctx.arc(0,-p.h/2,22,0,Math.PI*2); ctx.stroke(); ctx.restore();
  }
  if (p.boosted>0 && Math.floor(t*12)%2===0) {
    ctx.save(); ctx.globalAlpha=0.4; ctx.fillStyle='#ff6633';
    ctx.beginPath(); ctx.ellipse(-7,-p.h/2,8,15,0,0,Math.PI*2); ctx.fill(); ctx.restore();
  }
  ctx.fillStyle='rgba(0,0,0,0.22)'; ctx.beginPath(); ctx.ellipse(0,0,11,4,0,0,Math.PI*2); ctx.fill();
  ctx.translate(0,-p.h/2);
  ctx.fillStyle='#3ecc55'; ctx.beginPath(); ctx.ellipse(0,0,13,11,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#90eeaa'; ctx.beginPath(); ctx.ellipse(0,3,8,7,0,0,Math.PI*2); ctx.fill();
  const ey=p.onGround?0:(p.vy<0?-2:1.5);
  ctx.fillStyle='#fff';
  ctx.beginPath(); ctx.arc(-5.5,-6+ey,5,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc( 5.5,-6+ey,5,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#111';
  ctx.beginPath(); ctx.arc(-5,-5.5+ey,3,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc( 6,-5.5+ey,3,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#fff';
  ctx.beginPath(); ctx.arc(-4,-6.5+ey,1,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc( 7,-6.5+ey,1,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='#1a5528'; ctx.lineWidth=1.5;
  if (p.vy<-3) { ctx.beginPath(); ctx.arc(0,3,3.5,0,Math.PI); ctx.stroke(); }
  else if (p.vy>5) { ctx.beginPath(); ctx.arc(0,5.5,3,Math.PI,0); ctx.stroke(); }
  else { ctx.beginPath(); ctx.moveTo(-3.5,3.5); ctx.quadraticCurveTo(0,6.5,3.5,3.5); ctx.stroke(); }
  ctx.fillStyle='#2aaa44';
  const lp2=p.onGround?Math.sin(t*14)*0.4:0;
  ctx.save(); ctx.rotate(-0.75+lp2); ctx.beginPath(); ctx.roundRect(-2,8,6,10,3); ctx.fill(); ctx.restore();
  ctx.save(); ctx.rotate( 0.75-lp2); ctx.beginPath(); ctx.roundRect(-3.5,8,6,10,3); ctx.fill(); ctx.restore();
  ctx.fillStyle='#0d3318'; ctx.fillRect(-8,-16,16,5); ctx.fillRect(-5,-25,10,11);
  ctx.fillStyle='#2ecc71'; ctx.fillRect(-8,-16,16,2);
  ctx.restore();
}

/* ─── PARTICLES ─── */
function drawParticles(camX) {
  particles.forEach(p => {
    ctx.globalAlpha=Math.max(0,p.life); ctx.fillStyle=p.color;
    ctx.beginPath(); ctx.arc(p.x-camX,p.y,Math.max(0,p.sz*p.life),0,Math.PI*2); ctx.fill();
  });
  floatTexts.forEach(f => {
    ctx.globalAlpha=Math.max(0,f.life); ctx.fillStyle=f.color;
    ctx.font='bold 12px Courier New'; ctx.textAlign='center';
    ctx.fillText(f.text,f.x-camera.x,f.y);
  });
  ctx.globalAlpha=1; ctx.textAlign='left';
}

/* ─── TIMER BARS ─── */
function drawTimerBars() {
  const p=player; let barY=H-12;
  if (p.shieldTimer>0) {
    const frac=p.shieldTimer/480;
    ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillRect(10,barY-7,120,6);
    ctx.fillStyle='#ff88ff';          ctx.fillRect(10,barY-7,120*frac,6);
    ctx.fillStyle='#ff88ff'; ctx.font='9px Courier New'; ctx.fillText('SHIELD',136,barY); barY-=12;
  }
  if (p.boosted>0) {
    const frac=p.boosted/360;
    ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillRect(10,barY-7,120,6);
    ctx.fillStyle='#ff6633';          ctx.fillRect(10,barY-7,120*frac,6);
    ctx.fillStyle='#ff6633'; ctx.font='9px Courier New'; ctx.fillText('SPEED',136,barY);
  }
}

/* ═══════════════════ HUD ═══════════════════ */
function updateHUD() {
  document.getElementById('sHud').textContent  = score;
  document.getElementById('fHud').textContent  = fliesCollected+'/'+totalFlies;
  document.getElementById('lvHud').textContent = window.level;
  document.getElementById('hiHud').textContent = hiScore;
  const h=['💀','❤️','❤️❤️','❤️❤️❤️'];
  document.getElementById('livHud').textContent = h[Math.max(0,Math.min(lives,3))];
}
function showPowerHud(txt) {
  document.getElementById('powerHud').style.display='flex';
  document.getElementById('pHud').textContent=txt;
}
function hidePowerHud() { document.getElementById('powerHud').style.display='none'; }

/* ═══════════════════ OVERLAYS ═══════════════════ */
const ov = document.getElementById('overlay');

function showMenu() {
  ov.innerHTML=`
    <div class="frog">🐸</div>
    <h1>FROGGO'S LEAP</h1>
    <div class="sub">LILY PAD PLATFORMER · 3 LEVELS</div>
    <button class="btn" id="playBtn">▶ PLAY</button>
    <div class="instructions">
      ← → MOVE &nbsp;|&nbsp; SPACE / ↑ JUMP &nbsp;|&nbsp; DOUBLE JUMP!<br>
      🪰 Collect flies &nbsp;|&nbsp; 🐝 Stomp hornets from above<br>
      ⭐ Shield star absorbs one hit &nbsp;|&nbsp; 🍄 Mushroom = speed boost<br>
      🚩 Checkpoints save progress &nbsp;|&nbsp; 🌸 Reach the lotus!<br>
      <span style="color:#ffcc44">HI-SCORE: ${hiScore}</span>
    </div>`;
  ov.style.display='flex';
  document.getElementById('playBtn').onclick=startGame;
}

function showLevelClear() {
  const nextLvl = window.level + 1;
  ov.innerHTML=`
    <div class="frog">🐸</div>
    <div style="color:#88ffbb;font-size:11px;letter-spacing:5px;margin-bottom:6px">LEVEL ${window.level} COMPLETE!</div>
    <h1 style="font-size:34px">CLEAR!</h1>
    <div class="lc-stars">★★★</div>
    <div class="lc-bonus">+${lcBonus} BONUS</div>
    <div style="color:#88ffbb;font-size:12px;letter-spacing:3px;margin-top:10px">Flies: ${fliesCollected}/${totalFlies}</div>
    <div style="color:#66aa88;font-size:11px;margin-top:16px">Level ${nextLvl} loading…</div>`;
  ov.style.display='flex';
}

function showWin() {
  ov.innerHTML=`
    <div style="font-size:40px;margin-bottom:8px;animation:fb 0.8s ease-in-out infinite alternate">🏆</div>
    <div class="win-title">YOU WIN!</div>
    <div style="color:#ffee88;font-size:13px;letter-spacing:4px;margin:10px 0 4px">ALL ${LEVELS.length} LEVELS CLEARED!</div>
    <div class="score-label">FINAL SCORE</div>
    <div class="score-big">${score}</div>
    <div class="hi">${score>=hiScore?'🏆 NEW HIGH SCORE!':'BEST: '+hiScore}</div>
    <button class="btn" id="replayBtn">▶ PLAY AGAIN</button>
    <button class="btn" id="menuBtnW" style="font-size:13px">MAIN MENU</button>`;
  ov.style.display='flex';
  document.getElementById('replayBtn').onclick=startGame;
  document.getElementById('menuBtnW').onclick=()=>{ gameState='menu'; showMenu(); };
}

function showGameOver() {
  ov.innerHTML=`
    <div style="color:#ff4444;font-size:13px;letter-spacing:6px;margin-bottom:6px;text-shadow:0 0 10px #ff4444">GAME OVER</div>
    <div class="frog" style="animation:none">💀</div>
    <div class="score-label">SCORE</div>
    <div class="score-big">${score}</div>
    <div class="hi">${score>=hiScore?'🏆 NEW HIGH SCORE!':'BEST: '+hiScore}</div>
    <button class="btn" id="replayBtnGO">▶ TRY AGAIN</button>
    <button class="btn" id="menuBtnGO" style="font-size:13px">MAIN MENU</button>`;
  ov.style.display='flex';
  document.getElementById('replayBtnGO').onclick=startGame;
  document.getElementById('menuBtnGO').onclick=()=>{ gameState='menu'; showMenu(); };
}

/* ═══════════════════ START GAME ═══════════════════ */
function startGame() {
  initAC();

  /* Cancel any pending overlay timers */
  stopBGM();

  /* Reset all state */
  score=0; lives=3; window.level=1; fliesCollected=0;
  fadeAlpha=0; fadeDir=0; pendingLevel=null;
  lcTimer=0; lcBonus=0; t=0;
  particles=[]; floatTexts=[];
  gameState='playing';
  ov.style.display='none';

  initLevel(1);
  startBGM();
  updateHUD();
}

/* ═══════════════════ INPUT ═══════════════════ */
document.addEventListener('keydown', e => {
  keys[e.code]=true; keys[e.key]=true;
  if (['Space','ArrowUp','KeyW'].includes(e.code)||e.key==='ArrowUp') { e.preventDefault(); doJump(); }
  if (['ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault();
});
document.addEventListener('keyup', e => { keys[e.code]=false; keys[e.key]=false; });

/* Mobile D-Pad */
function setupDpad() {
  const dl=document.getElementById('dp-left');
  const dr=document.getElementById('dp-right');
  const dj=document.getElementById('dpad-jump');

  function holdKey(btn,key) {
    btn.addEventListener('touchstart', e=>{ e.preventDefault(); dKeys[key]=true;  },{passive:false});
    btn.addEventListener('touchend',   e=>{ e.preventDefault(); dKeys[key]=false; },{passive:false});
    btn.addEventListener('touchcancel',e=>{ e.preventDefault(); dKeys[key]=false; },{passive:false});
    btn.addEventListener('mousedown',  ()=>dKeys[key]=true);
    btn.addEventListener('mouseup',    ()=>dKeys[key]=false);
    btn.addEventListener('mouseleave', ()=>dKeys[key]=false);
  }
  holdKey(dl,'left');
  holdKey(dr,'right');

  /* Jump button — fires doJump() AND holds dKeys.jump for variable height */
  dj.addEventListener('touchstart', e=>{ e.preventDefault(); dKeys.jump=true; doJump(); },{passive:false});
  dj.addEventListener('touchend',   e=>{ e.preventDefault(); dKeys.jump=false; },{passive:false});
  dj.addEventListener('touchcancel',e=>{ e.preventDefault(); dKeys.jump=false; },{passive:false});
  dj.addEventListener('mousedown',  ()=>{ dKeys.jump=true;  doJump(); });
  dj.addEventListener('mouseup',    ()=>{ dKeys.jump=false; });
  dj.addEventListener('mouseleave', ()=>{ dKeys.jump=false; });
}
setupDpad();

/* ═══════════════════ GAME LOOP ═══════════════════ */
function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}

showMenu();
loop();

/* ═══════════════════ SHARP SCALING ═══════════════════
   The wrapper is scaled via CSS transform to fill the screen
   while the canvas always renders at its native DPR resolution.
   Game logic coordinates (W=800, H=500) never change.
═══════════════════════════════════════════════════════ */
function resizeGame() {
  const dpr    = window.devicePixelRatio || 1;
  const GAME_W = 800;
  const GAME_H = 500;

  /* Re-apply DPR scale on the canvas buffer in case DPR changed
     (e.g. moving window between displays) */
  cv.width  = GAME_W * dpr;
  cv.height = GAME_H * dpr;
  cv.style.width  = GAME_W + 'px';
  cv.style.height = GAME_H + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  /* Scale wrapper to fill the viewport, keeping 16:10 aspect ratio */
  const scaleX = window.innerWidth  / GAME_W;
  const scaleY = window.innerHeight / GAME_H;
  const scale  = Math.min(scaleX, scaleY);
  document.getElementById('wrapper').style.transform = `scale(${scale})`;
}

window.addEventListener('resize', resizeGame);
resizeGame(); /* Run once on load */
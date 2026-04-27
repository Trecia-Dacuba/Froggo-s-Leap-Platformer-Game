/* =========================================
   FROGGO'S LEAP — Audio Engine
   Web Audio API chiptune BGM + SFX
   ========================================= */

'use strict';

let AC = null;

/** Initialize AudioContext on first user interaction */
function initAC() {
  if (!AC) {
    AC = new (window.AudioContext || window.webkitAudioContext)();
  }
}

/**
 * Play a single synthesized tone.
 * @param {number} freq    - Frequency in Hz
 * @param {number} dur     - Duration in seconds
 * @param {string} type    - Oscillator type: 'square'|'sine'|'sawtooth'|'triangle'
 * @param {number} vol     - Peak volume (0–1)
 * @param {number} delay   - Delay before start (seconds)
 * @param {number} slide   - Frequency to slide to (0 = no slide)
 */
function tone(freq, dur, type = 'square', vol = 0.12, delay = 0, slide = 0) {
  if (!AC) return;
  const o = AC.createOscillator();
  const g = AC.createGain();
  o.connect(g);
  g.connect(AC.destination);
  o.type = type;
  o.frequency.setValueAtTime(freq, AC.currentTime + delay);
  if (slide) o.frequency.linearRampToValueAtTime(slide, AC.currentTime + delay + dur);
  g.gain.setValueAtTime(0.001, AC.currentTime + delay);
  g.gain.linearRampToValueAtTime(vol, AC.currentTime + delay + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, AC.currentTime + delay + dur);
  o.start(AC.currentTime + delay);
  o.stop(AC.currentTime + delay + dur + 0.02);
}

/* ── SOUND EFFECTS ── */
function sfxJump()       { tone(280, 0.04, 'square',   0.10); tone(480, 0.07, 'square',   0.09, 0.03); }
function sfxDJump()      { tone(360, 0.03, 'square',   0.10); tone(600, 0.04, 'square',   0.09, 0.03); tone(900, 0.07, 'square', 0.08, 0.07); }
function sfxFly()        { tone(880, 0.05, 'sine',     0.12); tone(1100, 0.09, 'sine',    0.10, 0.04); }
function sfxStomp()      { tone(400, 0.04, 'sawtooth', 0.15); tone(200,  0.12, 'sawtooth',0.12, 0.03, 80); }
function sfxHurt()       { tone(220, 0.12, 'sawtooth', 0.18); tone(110,  0.18, 'sawtooth',0.14, 0.08); }
function sfxDie()        { [280, 240, 200, 160, 120].forEach((f, i) => tone(f, 0.09, 'sawtooth', 0.15, i * 0.07)); }
function sfxCheckpoint() { [523, 659, 784].forEach((n, i) => tone(n, 0.10, 'sine', 0.14, i * 0.10)); }
function sfxShield()     { [800, 900, 1000, 1200].forEach((n, i) => tone(n, 0.06, 'sine', 0.12, i * 0.06)); }
function sfxMushroom()   { tone(600, 0.06, 'sine', 0.12); tone(800, 0.06, 'sine', 0.11, 0.06); tone(700, 0.10, 'sine', 0.13, 0.12); }
function sfxLand()       { tone(120, 0.04, 'square', 0.07); }
function sfxLevelClear() { [523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, 0.13, 'sine', 0.15, i * 0.12)); }
function sfxWin()        { [523, 659, 784, 1047, 784, 1047, 1319, 1047, 1319, 1568].forEach((f, i) => tone(f, 0.14, 'sine', 0.15, i * 0.10)); }

/* ── BACKGROUND MUSIC (per level) ── */
const BGM = {
  1: { // Bouncy pond tune
    melody: [
      [330,0.12],[330,0.12],[392,0.12],[330,0.12],[294,0.12],[262,0.24],
      [294,0.12],[330,0.12],[392,0.12],[440,0.12],[392,0.24],
      [330,0.12],[294,0.12],[262,0.12],[220,0.12],[262,0.12],[294,0.24],
      [262,0.48]
    ],
    bass: [
      [130,0.24],[196,0.24],[165,0.24],[196,0.24],
      [130,0.24],[196,0.24],[110,0.48]
    ]
  },
  2: { // Mystical marsh
    melody: [
      [440,0.12],[494,0.12],[523,0.12],[494,0.12],[440,0.24],
      [392,0.12],[440,0.12],[494,0.12],[523,0.12],[587,0.24],
      [523,0.12],[494,0.12],[440,0.12],[392,0.12],[349,0.24],
      [392,0.48]
    ],
    bass: [
      [110,0.24],[147,0.24],[131,0.24],[147,0.24],
      [110,0.24],[131,0.24],[98,0.48]
    ]
  },
  3: { // Volcanic climax
    melody: [
      [587,0.09],[659,0.09],[698,0.09],[784,0.09],[698,0.09],[659,0.09],[587,0.18],
      [523,0.09],[587,0.09],[659,0.09],[698,0.09],[784,0.09],[880,0.18],
      [784,0.09],[698,0.09],[659,0.09],[587,0.09],[523,0.09],[494,0.18],
      [523,0.36]
    ],
    bass: [
      [147,0.18],[196,0.18],[175,0.18],[196,0.18],
      [147,0.18],[175,0.18],[131,0.36]
    ]
  }
};

let bgmTimer   = null;
let bassTimer  = null;
let bgmIdx     = 0;
let bassBeat   = 0;
let bgmRunning = false;

function scheduleMelody() {
  if (!bgmRunning) return;
  const lv = Math.min(window.level || 1, 3);
  const pat = BGM[lv].melody;
  const [freq, dur] = pat[bgmIdx % pat.length];
  tone(freq,     dur * 0.75, 'square',   0.04);
  tone(freq * 2, dur * 0.75, 'triangle', 0.025);
  bgmIdx++;
  bgmTimer = setTimeout(scheduleMelody, dur * 1000);
}

function scheduleBass() {
  if (!bgmRunning) return;
  const lv = Math.min(window.level || 1, 3);
  const pat = BGM[lv].bass;
  const [freq, dur] = pat[bassBeat % pat.length];
  tone(freq, dur * 0.6, 'triangle', 0.06);
  bassBeat++;
  bassTimer = setTimeout(scheduleBass, dur * 1000);
}

function startBGM() {
  stopBGM();
  bgmIdx = 0;
  bassBeat = 0;
  bgmRunning = true;
  if (AC && AC.state === 'suspended') AC.resume();
  setTimeout(scheduleMelody, 60);
  setTimeout(scheduleBass,   60);
}

function stopBGM() {
  bgmRunning = false;
  clearTimeout(bgmTimer);
  clearTimeout(bassTimer);
  bgmTimer = null;
  bassTimer = null;
}
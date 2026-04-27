# 🐸 Froggo's Leap
### A Lily Pad Platformer — UPHSD CCS WST Final Project 2025

> **Group:** Agban-Dacuba &nbsp;|&nbsp; **Genre:** Platformer &nbsp;|&nbsp; **Year:** 2nd Year IT — Game Development Major

---

## 🎮 Play the Game

**[▶ Play Froggo's Leap on GitHub Pages](https://YOUR-USERNAME.github.io/froggos-leap/)**

---

## 📖 About

**Froggo's Leap** is an original HTML5 canvas platformer where you control Froggo — a small, determined frog in a tiny hat — leaping across lily pads above moonlit ponds, mysterious marshes, and volcanic springs.

Built entirely with **vanilla JavaScript + HTML5 Canvas** and the **Web Audio API** — zero external libraries, zero dependencies.

---

## 🕹️ Controls

| Input | Action |
|---|---|
| `← →` or `A D` | Move left / right |
| `Space` or `↑` or `W` | Jump |
| Jump again (mid-air) | Double jump |
| Hold jump button | Higher arc (variable jump height) |
| Mobile `◀ ▶` | Move (on-screen d-pad) |
| Mobile `▲` | Jump (on-screen button) |

> **Tips:**
> - **Coyote time** — you can still jump a few frames after walking off a platform
> - **Jump buffer** — press jump slightly early and it will still register
> - **Stomp hornets** by landing on top of them for +25 points
> - **Touch checkpoints** (green flags) to save your respawn position

---

## 🏆 Scoring

| Action | Points |
|---|---|
| Collect a fly 🪰 | +10 |
| Stomp a hornet 🐝 | +25 |
| Reach the lotus 🌸 (base) | +100 |
| Level bonus | +50 × level |
| Fly collection bonus | +5 per fly collected |

---

## ⭐ Power-Ups

| Power-Up | Effect | Duration |
|---|---|---|
| 🍄 **Red Mushroom** | Speed boost (1.7× movement speed) | 6 seconds |
| ⭐ **Shield Star** | Absorbs one hit from any damage source | 8 seconds |

---

## 🗺️ Levels

| Level | Name | New Elements |
|---|---|---|
| 1 | **Pond at Dusk** | Static lily pads, intro enemies |
| 2 | **Moonlit Marsh** | Slow moving platforms, more hornets |
| 3 | **Volcanic Springs** | Fast moving platforms, tight gaps |

---

## 📸 Screenshots

> *(Replace with actual screenshots — save them to a `screenshots/` folder)*

| Menu Screen | Level 1 Gameplay |
|---|---|
| `screenshots/menu.png` | `screenshots/level1.png` |

| Level 2 Gameplay | Level 3 Gameplay |
|---|---|
| `screenshots/level2.png` | `screenshots/level3.png` |

| Win Screen | Game Over Screen |
|---|---|
| `screenshots/win.png` | `screenshots/gameover.png` |

---

## 📁 File Structure

```
froggos-leap/
│
├── index.html          ← Web portal landing page
├── index.css           ← Portal stylesheet
│
├── game/
│   ├── game.html       ← Game entry point (open this to play)
│   ├── game.css        ← Game UI styles (HUD, overlays, d-pad)
│   ├── audio.js        ← Web Audio engine: BGM + all SFX
│   ├── levels.js       ← Level data: platforms, enemies, items
│   └── game.js         ← Core engine: physics, rendering, input
│
├── screenshots/        ← (Add your screenshots here)
│   ├── menu.png
│   ├── level1.png
│   ├── level2.png
│   ├── level3.png
│   ├── win.png
│   └── gameover.png
│
└── README.md           ← This file
```

---

## 🛠️ Built With

| Technology | Usage |
|---|---|
| **HTML5 Canvas API** | All game rendering (player, platforms, enemies, particles, backgrounds) |
| **Vanilla JavaScript ES6+** | Game engine, physics, collision detection, state machine |
| **Web Audio API** | Procedural chiptune BGM (3 unique per-level tracks) + 10+ SFX |
| **CSS3** | HUD, overlay screens, mobile d-pad, animations, responsive layout |
| **GitHub Pages** | Free static hosting for the web portal and game |

---

## 🔧 How to Run Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/froggos-leap.git
   cd froggos-leap
   ```

2. **Open with a local server** *(required for the separate JS files to load)*

   Using Python:
   ```bash
   python -m http.server 8000
   ```
   Then open `http://localhost:8000` in your browser.

   Or use the **Live Server** extension in VS Code.

3. **Or just open `game/game.html` directly** in your browser — the game works as a standalone file too.

---

## 👥 Team

### Agban, [First Name]
**Role: Game Developer & Lead Programmer**
- Core game engine and main loop architecture
- Player physics: gravity, coyote time, jump buffering, squish-and-stretch
- Collision detection (AABB + circle)
- Enemy AI patrol system
- Power-up system (shield, speed boost)
- Web Audio API chiptune BGM and all SFX
- Particle effects engine
- Game state machine (menu → playing → level clear → win/game over)

**GitHub:** [github.com/agban](https://github.com/YOUR-USERNAME)

---

### Dacuba, [First Name]
**Role: Web Designer & Level Designer**
- Web portal design (`index.html` + `index.css`)
- Level design: platform layout, gap distances, enemy placement
- Visual art direction: color themes, parallax backgrounds
- GitHub Pages setup and deployment
- README documentation
- Screenshot collection

**GitHub:** [github.com/dacuba](https://github.com/YOUR-USERNAME)

---

## 📋 Project Info

| Detail | Value |
|---|---|
| **School** | UPHSD Molino — College of Computer Studies |
| **Course** | Web Systems & Technologies (WST) |
| **Year Level** | 2nd Year |
| **Program** | BS Information Technology — Game Development Major |
| **Sprint Duration** | 14 days |
| **Submission** | Day 14 Final Defense |

---

## 📜 License

MIT License — free to use, modify, and distribute with attribution.

---

*Built with 🐸 by Agban-Dacuba · UPHSD CCS · 2025*
# Froggo-s-Leap-Platformer-Game
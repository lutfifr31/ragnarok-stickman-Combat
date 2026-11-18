# RAGNAROK: STICKMAN COMBAT

A dark, gritty 1v1 arcade fighting game built with **Vanilla JavaScript**, **HTML5 Canvas**, and **Vite** — blending the brutal visual aesthetic of *Mortal Kombat* with the historical clash concept of *Record of Ragnarok*.

## Core Features (Roadmap)
- **Procedural Stickman Rig (60 FPS):** Dynamic joint-based animations with *Prime Youth* silhouettes, signature hairstyles, weapons, and X-Ray impact frames.
- **50 Playable Fighters (5 Factions):** Data-driven roster featuring young versions of world pioneers, creators, warriors, philosophers, and revolutionaries.
- **Arcade Mechanics:** Directional input buffer for special moves, blocking, hitstop, screen shake, and *"FINISH HIM!"* executions.
- **FSM AI Opponent:** Finite State Machine bot for single-player arcade ladder mode.

## Tech Stack
- **Engine:** HTML5 2D Canvas API & JavaScript (ES6 Modules)
- **Bundler:** Vite
- **Architecture:** Data-Driven Roster (`fighters.json`) + Modular State Machine

## Getting Started
```bash
npm install
npm run dev
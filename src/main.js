import './style.css';
import fightersData from './data/fighters.json';
import { FighterBase } from './fighters/FighterBase.js';
import { StickmanRenderer } from './render/StickmanRenderer.js';
import { BotAI } from './ai/BotAI.js';
import { ScreenUI } from './ui/ScreenUI.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;
const GROUND_Y = 500;

// State Alur Game: 'TITLE' | 'SELECT' | 'FIGHT'
let currentScreen = 'TITLE';
let titleMenuIndex = 0; // 0 = 1P Arcade (VS AI), 1 = 2P Local
let gameMode = '1P';
let isPausedMoveList = false;

// State Pemilihan Karakter
const selectState = {
  p1Index: 0,
  p2Index: 1,
  p1Locked: false,
  p2Locked: false,
};

let p1 = new FighterBase({ data: fightersData[0], x: 220, y: GROUND_Y - 145, facing: 1 });
let p2 = new FighterBase({ data: fightersData[1], x: 750, y: GROUND_Y - 145, facing: -1 });
const botAI = new BotAI();

let p1DisplayHp = p1.maxHp;
let p2DisplayHp = p2.maxHp;
let p1Combo = { count: 0, timer: 0 };
let p2Combo = { count: 0, timer: 0 };

const keys = {};
let projectiles = [];
let particles = [];
let floatingTexts = [];
let screenShake = 0;
let hitstop = 0;
let xrayFlash = 0;
let timer = 99;
let timerTick = 0;
let roundOver = false;
let introTimer = 75;

function startBattle() {
  p1 = new FighterBase({ data: fightersData[selectState.p1Index], x: 220, y: GROUND_Y - 145, facing: 1 });
  p2 = new FighterBase({ data: fightersData[selectState.p2Index], x: 750, y: GROUND_Y - 145, facing: -1 });
  p1DisplayHp = p1.maxHp;
  p2DisplayHp = p2.maxHp;
  p1Combo = { count: 0, timer: 0 };
  p2Combo = { count: 0, timer: 0 };
  timer = 99;
  introTimer = 75;
  roundOver = false;
  isPausedMoveList = false;
  projectiles = [];
  particles = [];
  floatingTexts = [];
  xrayFlash = 0;
  currentScreen = 'FIGHT';
}

window.addEventListener('keydown', (e) => {
  keys[e.code] = true;

  // 1. KONTROL TITLE SCREEN
  if (currentScreen === 'TITLE') {
    if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'KeyS' || e.code === 'ArrowDown') {
      titleMenuIndex = titleMenuIndex === 0 ? 1 : 0;
    }
    if (e.code === 'Enter' || e.code === 'KeyF' || e.code === 'Space') {
      gameMode = titleMenuIndex === 0 ? '1P' : '2P';
      selectState.p1Locked = false;
      selectState.p2Locked = false;
      currentScreen = 'SELECT';
    }
    return;
  }

  // 2. KONTROL CHARACTER SELECT SCREEN
  if (currentScreen === 'SELECT') {
    if (e.code === 'Escape') {
      currentScreen = 'TITLE';
      return;
    }

    // Navigasi P1
    if (!selectState.p1Locked) {
      if (e.code === 'KeyA') selectState.p1Index = (selectState.p1Index - 1 + fightersData.length) % fightersData.length;
      if (e.code === 'KeyD') selectState.p1Index = (selectState.p1Index + 1) % fightersData.length;
      if (e.code === 'KeyF' || e.code === 'Enter') {
        selectState.p1Locked = true;
      }
    } else if (gameMode === '1P' && !selectState.p2Locked) {
      // Di mode 1P, setelah P1 terkunci, P1 memilih lawan AI menggunakan A/D atau Panah
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        selectState.p2Index = (selectState.p2Index - 1 + fightersData.length) % fightersData.length;
      }
      if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        selectState.p2Index = (selectState.p2Index + 1) % fightersData.length;
      }
      if (e.code === 'KeyF' || e.code === 'KeyK' || e.code === 'Enter') {
        selectState.p2Locked = true;
      }
    }

    // Navigasi P2 (Mode 2P)
    if (gameMode === '2P' && !selectState.p2Locked) {
      if (e.code === 'ArrowLeft') selectState.p2Index = (selectState.p2Index - 1 + fightersData.length) % fightersData.length;
      if (e.code === 'ArrowRight') selectState.p2Index = (selectState.p2Index + 1) % fightersData.length;
      if (e.code === 'KeyK' || e.code === 'Enter') {
        selectState.p2Locked = true;
      }
    }

    if (selectState.p1Locked && selectState.p2Locked) {
      setTimeout(() => startBattle(), 350);
    }
    return;
  }

  // 3. KONTROL ARENA PERTARUNGAN
  if (currentScreen === 'FIGHT') {
    if (e.code === 'Tab') {
      e.preventDefault();
      isPausedMoveList = !isPausedMoveList;
      return;
    }
    if (e.code === 'Escape') {
      selectState.p1Locked = false;
      selectState.p2Locked = false;
      currentScreen = 'SELECT';
      return;
    }

    if (isPausedMoveList) return;

    if (!roundOver && introTimer <= 20) {
      // --- PLAYER 1 ---
      if (e.code === 'KeyQ') {
        const dir = keys['KeyA'] ? -1 : keys['KeyD'] ? 1 : p1.facing;
        if (p1.dash(dir)) spawnSparks(p1.x + 25, GROUND_Y - 10, '#e4e4e7', 8);
      }
      if (e.code === 'KeyE') {
        const dir = keys['KeyA'] ? -1 : keys['KeyD'] ? 1 : p1.facing;
        if (p1.roll(dir)) spawnFloatingText(p1.x + 25, p1.y + 20, 'ROLL!', '#a1a1aa');
      }
      if (e.code === 'KeyF') p1.attack();
      if (e.code === 'KeyR') p1.kick();
      if (e.code === 'KeyG') {
        const proj = p1.castSpecial();
        if (proj) {
          projectiles.push(proj);
          spawnFloatingText(p1.x + 25, p1.y - 15, `${proj.name.toUpperCase()}!`, proj.color);
        }
      }
      if (e.code === 'KeyT') {
        const skillName = p1.castSkill2();
        if (skillName) {
          screenShake = 10;
          spawnFloatingText(p1.x + 25, p1.y - 25, skillName, p1.visuals.rimColor);
        }
      }

      // --- PLAYER 2 (Hanya jika mode 2P) ---
      if (gameMode === '2P') {
        if (e.code === 'KeyM') {
          const dir = keys['ArrowLeft'] ? -1 : keys['ArrowRight'] ? 1 : p2.facing;
          if (p2.dash(dir)) spawnSparks(p2.x + 25, GROUND_Y - 10, '#e4e4e7', 8);
        }
        if (e.code === 'Comma') {
          const dir = keys['ArrowLeft'] ? -1 : keys['ArrowRight'] ? 1 : p2.facing;
          if (p2.roll(dir)) spawnFloatingText(p2.x + 25, p2.y + 20, 'ROLL!', '#a1a1aa');
        }
        if (e.code === 'KeyK') p2.attack();
        if (e.code === 'Period') p2.kick();
        if (e.code === 'KeyL') {
          const proj = p2.castSpecial();
          if (proj) {
            projectiles.push(proj);
            spawnFloatingText(p2.x + 25, p2.y - 15, `${proj.name.toUpperCase()}!`, proj.color);
          }
        }
        if (e.code === 'Slash') {
          const skillName = p2.castSkill2();
          if (skillName) {
            screenShake = 10;
            spawnFloatingText(p2.x + 25, p2.y - 25, skillName, p2.visuals.rimColor);
          }
        }
      }
    }
    if (e.code === 'Enter' && roundOver) startBattle();
  }
});

window.addEventListener('keyup', (e) => {
  keys[e.code] = false;
});

function handleControls() {
  if (introTimer > 20) return;
  const lockedStates = ['attack', 'kick', 'special', 'skill2', 'dash', 'roll'];

  if (p1.state !== 'ko' && !lockedStates.includes(p1.state)) {
    p1.vx = 0;
    if (keys['KeyS']) {
      p1.state = 'block';
    } else {
      if (keys['KeyA']) { p1.vx = -p1.speed * 1.15; p1.state = 'walk'; }
      else if (keys['KeyD']) { p1.vx = p1.speed * 1.15; p1.state = 'walk'; }
      else { p1.state = 'idle'; }

      if (keys['KeyW'] && p1.y + p1.height >= GROUND_Y) p1.vy = -16;
    }
  }

  if (gameMode === '2P') {
    if (p2.state !== 'ko' && !lockedStates.includes(p2.state)) {
      p2.vx = 0;
      if (keys['ArrowDown']) {
        p2.state = 'block';
      } else {
        if (keys['ArrowLeft']) { p2.vx = -p2.speed * 1.15; p2.state = 'walk'; }
        else if (keys['ArrowRight']) { p2.vx = p2.speed * 1.15; p2.state = 'walk'; }
        else { p2.state = 'idle'; }

        if (keys['ArrowUp'] && p2.y + p2.height >= GROUND_Y) p2.vy = -16;
      }
    }
  } else {
    // Kendali Bot AI di Mode 1P
    botAI.update(
      p2,
      p1,
      GROUND_Y,
      () => {
        const proj = p2.castSpecial();
        if (proj) {
          projectiles.push(proj);
          spawnFloatingText(p2.x + 25, p2.y - 15, `${proj.name.toUpperCase()}!`, proj.color);
        }
      },
      () => {
        const skillName = p2.castSkill2();
        if (skillName) {
          screenShake = 10;
          spawnFloatingText(p2.x + 25, p2.y - 25, skillName, p2.visuals.rimColor);
        }
      },
      (dir) => p2.dash(dir),
      (dir) => p2.roll(dir)
    );
  }
}

function spawnSparks(x, y, color, count = 16) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.5) * 16,
      life: 20 + Math.random() * 12,
      color,
    });
  }
}

function spawnFloatingText(x, y, text, color) {
  floatingTexts.push({ x, y, text, color, life: 45 });
}

function registerHit(attackerCombo) {
  attackerCombo.count++;
  attackerCombo.timer = 90;
}

function checkCombat() {
  const p1Box = p1.getHitbox();
  if (p1Box && !p1.hasHitThisSwing && !p2.invulnerable && rectsOverlap(p1Box, p2)) {
    p1.hasHitThisSwing = true;
    const wasBlocked = p2.state === 'block';
    p2.takeDamage(p1Box.damage, p1Box.isXray);
    if (!wasBlocked) {
      registerHit(p1Combo);
      if (p1Box.launchY) p2.vy = p1Box.launchY;
    }
    p2.vx = p1.facing * (wasBlocked ? p1Box.knockback * 0.4 : p1Box.knockback);
    hitstop = p1Box.isXray && !wasBlocked ? 8 : 3;
    screenShake = p1Box.isXray && !wasBlocked ? 15 : 6;
    if ((p1Box.isXray && !wasBlocked) || p2.hp === 0) xrayFlash = 16;
    spawnSparks(p2.x + p2.width / 2, p2.y + 55, p1.visuals.rimColor, p1Box.isXray ? 28 : 12);
  }

  const p2Box = p2.getHitbox();
  if (p2Box && !p2.hasHitThisSwing && !p1.invulnerable && rectsOverlap(p2Box, p1)) {
    p2.hasHitThisSwing = true;
    const wasBlocked = p1.state === 'block';
    p1.takeDamage(p2Box.damage, p2Box.isXray);
    if (!wasBlocked) {
      registerHit(p2Combo);
      if (p2Box.launchY) p1.vy = p2Box.launchY;
    }
    p1.vx = p2.facing * (wasBlocked ? p2Box.knockback * 0.4 : p2Box.knockback);
    hitstop = p2Box.isXray && !wasBlocked ? 8 : 3;
    screenShake = p2Box.isXray && !wasBlocked ? 15 : 6;
    if ((p2Box.isXray && !wasBlocked) || p1.hp === 0) xrayFlash = 16;
    spawnSparks(p1.x + p1.width / 2, p1.y + 55, p2.visuals.rimColor, p2Box.isXray ? 28 : 12);
  }

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const proj = projectiles[i];
    proj.x += proj.vx;

    if (Math.random() < 0.6) {
      spawnSparks(proj.x + proj.width / 2, proj.y + proj.height / 2, proj.color, 2);
    }

    const isP1Owner = proj.ownerId === p1.id;
    const target = isP1Owner ? p2 : p1;
    if (!target.invulnerable && rectsOverlap(proj, target)) {
      const wasBlocked = target.state === 'block';
      target.takeDamage(proj.damage, true);
      if (!wasBlocked) registerHit(isP1Owner ? p1Combo : p2Combo);
      target.vx = proj.facing * (wasBlocked ? 5 : 14);
      hitstop = wasBlocked ? 3 : 8;
      screenShake = wasBlocked ? 6 : 16;
      if (!wasBlocked) xrayFlash = 14;
      spawnSparks(target.x + target.width / 2, target.y + 55, proj.color, 28);
      projectiles.splice(i, 1);
      continue;
    }

    if (proj.x < -60 || proj.x > canvas.width + 60) {
      projectiles.splice(i, 1);
    }
  }
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function drawArena() {
  ctx.save();
  const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  skyGrad.addColorStop(0, '#050508');
  skyGrad.addColorStop(0.55, '#12090d');
  skyGrad.addColorStop(1, '#1c1917');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, canvas.width, GROUND_Y);

  if (xrayFlash > 0) {
    ctx.fillStyle = `rgba(14, 165, 233, ${xrayFlash * 0.025})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    xrayFlash--;
  }

  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  for (let i = 0; i < 28; i++) {
    const sx = (i * 137) % canvas.width;
    const sy = (i * 73) % (GROUND_Y - 140);
    ctx.fillRect(sx, sy, 2, 2);
  }

  const moonX = canvas.width / 2;
  const moonY = 215;
  const moonGlow = ctx.createRadialGradient(moonX, moonY, 30, moonX, moonY, 220);
  moonGlow.addColorStop(0, 'rgba(220, 38, 38, 0.35)');
  moonGlow.addColorStop(0.5, 'rgba(153, 27, 27, 0.12)');
  moonGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = moonGlow;
  ctx.beginPath();
  ctx.arc(moonX, moonY, 220, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#450a0a';
  ctx.strokeStyle = 'rgba(248, 113, 113, 0.45)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(moonX, moonY, 95, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#0c0a0d';
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(0, 340);
  ctx.lineTo(180, 260);
  ctx.lineTo(360, 350);
  ctx.lineTo(512, 290);
  ctx.lineTo(680, 360);
  ctx.lineTo(860, 250);
  ctx.lineTo(canvas.width, 330);
  ctx.lineTo(canvas.width, GROUND_Y);
  ctx.closePath();
  ctx.fill();

  const pillars = [95, canvas.width - 145];
  const flicker = Math.sin(Date.now() * 0.02) * 4;
  pillars.forEach((px) => {
    ctx.fillStyle = '#141418';
    ctx.fillRect(px, 110, 50, GROUND_Y - 110);
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 2;
    ctx.strokeRect(px + 8, 120, 34, GROUND_Y - 130);

    const torchX = px + 25;
    const torchY = 230;
    ctx.fillStyle = '#3f3f46';
    ctx.fillRect(torchX - 10, torchY, 20, 8);

    const fireGrad = ctx.createRadialGradient(torchX, torchY - 10, 2, torchX, torchY - 12, 26 + flicker);
    fireGrad.addColorStop(0, '#fef08a');
    fireGrad.addColorStop(0.5, '#f97316');
    fireGrad.addColorStop(1, 'rgba(220, 38, 38, 0)');
    ctx.fillStyle = fireGrad;
    ctx.beginPath();
    ctx.arc(torchX, torchY - 12, 26 + flicker, 0, Math.PI * 2);
    ctx.fill();
  });

  const floorGrad = ctx.createLinearGradient(0, GROUND_Y, 0, canvas.height);
  floorGrad.addColorStop(0, '#1f1d24');
  floorGrad.addColorStop(1, '#09090b');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);

  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(canvas.width, GROUND_Y);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 1.5;
  for (let gx = 64; gx < canvas.width; gx += 128) {
    ctx.beginPath();
    ctx.moveTo(gx, GROUND_Y);
    ctx.lineTo(gx + (gx - canvas.width / 2) * 0.25, canvas.height);
    ctx.stroke();
  }
  ctx.restore();
}

function drawProjectiles() {
  projectiles.forEach((proj) => {
    ctx.save();
    ctx.shadowColor = proj.color;
    ctx.shadowBlur = 20;
    ctx.fillStyle = proj.color;

    if (proj.ownerId === 'edison' || proj.ownerId === 'tesla') {
      ctx.beginPath();
      ctx.arc(proj.x + proj.width / 2, proj.y + proj.height / 2, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(proj.x + proj.width / 2, proj.y + proj.height / 2, 7, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.ellipse(proj.x + proj.width / 2, proj.y + proj.height / 2, 22, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.restore();
  });
}

function drawSkewedBar(x, y, w, h, skew, fillRatio, trailRatio, fillColor, alignRight = false) {
  ctx.save();
  const drawPoly = (offsetW, ratio) => {
    const activeW = offsetW * Math.max(0, Math.min(1, ratio));
    ctx.beginPath();
    if (!alignRight) {
      ctx.moveTo(x, y);
      ctx.lineTo(x + activeW, y);
      ctx.lineTo(x + activeW - skew, y + h);
      ctx.lineTo(x - skew, y + h);
    } else {
      ctx.moveTo(x + w - activeW, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w + skew, y + h);
      ctx.lineTo(x + w - activeW + skew, y + h);
    }
    ctx.closePath();
  };

  drawPoly(w, 1);
  ctx.fillStyle = '#18181b';
  ctx.fill();

  drawPoly(w, trailRatio);
  ctx.fillStyle = '#dc2626';
  ctx.fill();

  drawPoly(w, fillRatio);
  ctx.fillStyle = fillColor;
  ctx.fill();

  drawPoly(w, 1);
  ctx.strokeStyle = '#e4e4e7';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function drawHUD() {
  if (p1DisplayHp > p1.hp) p1DisplayHp = Math.max(p1.hp, p1DisplayHp - 4);
  if (p2DisplayHp > p2.hp) p2DisplayHp = Math.max(p2.hp, p2DisplayHp - 4);

  const barWidth = 385;
  const barHeight = 24;

  drawSkewedBar(45, 30, barWidth, barHeight, 14, p1.hp / p1.maxHp, p1DisplayHp / p1.maxHp, p1.visuals.rimColor, false);
  drawSkewedBar(canvas.width - 45 - barWidth, 30, barWidth, barHeight, 14, p2.hp / p2.maxHp, p2DisplayHp / p2.maxHp, p2.visuals.rimColor, true);

  // Skill Badges P1
  const p1S1 = 1 - p1.specialCooldown / p1.maxSpecialCooldown;
  const p1S2 = 1 - p1.skill2Cooldown / p1.maxSkill2Cooldown;
  ctx.fillStyle = '#18181b';
  ctx.fillRect(35, 59, 130, 7);
  ctx.fillStyle = p1S1 >= 1 ? p1.visuals.rimColor : '#52525b';
  ctx.fillRect(35, 59, 130 * p1S1, 7);

  ctx.fillStyle = '#18181b';
  ctx.fillRect(175, 59, 130, 7);
  ctx.fillStyle = p1S2 >= 1 ? '#38bdf8' : '#52525b';
  ctx.fillRect(175, 59, 130 * p1S2, 7);

  // Skill Badges P2
  const p2S1 = 1 - p2.specialCooldown / p2.maxSpecialCooldown;
  const p2S2 = 1 - p2.skill2Cooldown / p2.maxSkill2Cooldown;
  ctx.fillStyle = '#18181b';
  ctx.fillRect(canvas.width - 165, 59, 130, 7);
  ctx.fillStyle = p2S1 >= 1 ? p2.visuals.rimColor : '#52525b';
  ctx.fillRect(canvas.width - 165 + 130 * (1 - p2S1), 59, 130 * p2S1, 7);

  ctx.fillStyle = '#18181b';
  ctx.fillRect(canvas.width - 305, 59, 130, 7);
  ctx.fillStyle = p2S2 >= 1 ? '#38bdf8' : '#52525b';
  ctx.fillRect(canvas.width - 305 + 130 * (1 - p2S2), 59, 130 * p2S2, 7);

  // Nama & Era
  ctx.fillStyle = '#f4f4f5';
  ctx.font = 'bold 14px Courier New';
  ctx.textAlign = 'left';
  ctx.fillText(`${p1.name.toUpperCase()} — ${p1.era}`, 35, 84);
  ctx.textAlign = 'right';
  const p2Tag = gameMode === '1P' ? '[AI] ' : '';
  ctx.fillText(`${p2Tag}${p2.name.toUpperCase()} — ${p2.era}`, canvas.width - 35, 84);

  // Timer
  ctx.fillStyle = '#09090b';
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 2;
  ctx.fillRect(canvas.width / 2 - 34, 24, 68, 42);
  ctx.strokeRect(canvas.width / 2 - 34, 24, 68, 42);

  ctx.textAlign = 'center';
  ctx.font = 'bold 32px Courier New';
  ctx.fillStyle = timer <= 15 ? '#ef4444' : '#facc15';
  ctx.fillText(String(timer).padStart(2, '0'), canvas.width / 2, 55);

  // Combo Counter
  if (p1Combo.count >= 2 && p1Combo.timer > 0) {
    ctx.save();
    ctx.textAlign = 'left';
    ctx.fillStyle = '#facc15';
    ctx.shadowColor = '#ea580c';
    ctx.shadowBlur = 12;
    ctx.font = 'italic bold 28px Courier New';
    ctx.fillText(`${p1Combo.count} HITS!`, 45, 135);
    ctx.restore();
  }
  if (p2Combo.count >= 2 && p2Combo.timer > 0) {
    ctx.save();
    ctx.textAlign = 'right';
    ctx.fillStyle = '#f97316';
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 12;
    ctx.font = 'italic bold 28px Courier New';
    ctx.fillText(`${p2Combo.count} HITS!`, canvas.width - 45, 135);
    ctx.restore();
  }

  // FINISH HIM!
  if (!roundOver && ((p1.hp > 0 && p1.hp <= p1.maxHp * 0.18) || (p2.hp > 0 && p2.hp <= p2.maxHp * 0.18))) {
    if (Math.floor(Date.now() / 220) % 2 === 0) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#991b1b';
      ctx.shadowBlur = 20;
      ctx.font = 'italic bold 36px Courier New';
      ctx.fillText('FINISH HIM!', canvas.width / 2, 135);
      ctx.restore();
    }
  }

  // Intro ROUND 1 - FIGHT!
  if (introTimer > 0) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = introTimer > 25 ? '#facc15' : '#ef4444';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 16;
    ctx.font = 'italic bold 52px Courier New';
    ctx.fillText(introTimer > 25 ? 'ROUND 1' : 'FIGHT!', canvas.width / 2, 260);
    ctx.restore();
  }

  // Footer UX Ringkas & Bersih
  ctx.fillStyle = '#a1a1aa';
  ctx.font = '12px Courier New';
  ctx.textAlign = 'center';
  ctx.fillText('[TAB] Move List & Kontrol  •  [ESC] Ganti Karakter', canvas.width / 2, canvas.height - 14);

  // Kemenangan / KO
  if (p1.hp <= 0 || p2.hp <= 0 || timer <= 0) {
    roundOver = true;
    const winner = p1.hp > p2.hp ? p1.name : p2.hp > p1.hp ? p2.name : 'DRAW';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 190, canvas.width, 155);

    ctx.fillStyle = '#ef4444';
    ctx.font = 'italic bold 22px Courier New';
    ctx.fillText('RAGNAROK FINISH!', canvas.width / 2, 228);

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 44px Courier New';
    ctx.fillText(winner === 'DRAW' ? 'DOUBLE KO!' : `${winner.toUpperCase()} WINS!`, canvas.width / 2, 276);

    ctx.fillStyle = '#e4e4e7';
    ctx.font = '14px Courier New';
    ctx.fillText('Tekan [ENTER] Rematch  •  Tekan [ESC] Character Select', canvas.width / 2, 318);
  }
}

function gameLoop() {
  requestAnimationFrame(gameLoop);

  if (currentScreen === 'TITLE') {
    ScreenUI.drawTitleScreen(ctx, canvas, titleMenuIndex);
    return;
  }

  if (currentScreen === 'SELECT') {
    ScreenUI.drawCharacterSelect(ctx, canvas, fightersData, selectState, gameMode);
    return;
  }

  if (isPausedMoveList) {
    ScreenUI.drawMoveListOverlay(ctx, canvas, p1, p2);
    return;
  }

  if (hitstop > 0) {
    hitstop--;
    return;
  }

  if (introTimer > 0) introTimer--;
  if (p1Combo.timer > 0) { p1Combo.timer--; if (p1Combo.timer === 0) p1Combo.count = 0; }
  if (p2Combo.timer > 0) { p2Combo.timer--; if (p2Combo.timer === 0) p2Combo.count = 0; }

  if (!roundOver) {
    if (introTimer <= 20) {
      timerTick++;
      if (timerTick >= 60 && timer > 0) {
        timer--;
        timerTick = 0;
      }
    }
    handleControls();
    p1.update(GROUND_Y, canvas.width, p2);
    p2.update(GROUND_Y, canvas.width, p1);
    checkCombat();
  }

  ctx.save();
  if (screenShake > 0) {
    const dx = (Math.random() - 0.5) * screenShake;
    const dy = (Math.random() - 0.5) * screenShake;
    ctx.translate(dx, dy);
    screenShake *= 0.8;
    if (screenShake < 0.5) screenShake = 0;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawArena();
  StickmanRenderer.draw(ctx, p1, GROUND_Y);
  StickmanRenderer.draw(ctx, p2, GROUND_Y);
  drawProjectiles();

  for (let i = particles.length - 1; i >= 0; i--) {
    const pt = particles[i];
    pt.x += pt.vx;
    pt.y += pt.vy;
    pt.life--;
    ctx.fillStyle = pt.color;
    ctx.fillRect(pt.x, pt.y, 4, 4);
    if (pt.life <= 0) particles.splice(i, 1);
  }

  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i];
    ft.y -= 0.8;
    ft.life--;
    ctx.fillStyle = ft.color;
    ctx.font = 'bold 14px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText(ft.text, ft.x, ft.y);
    if (ft.life <= 0) floatingTexts.splice(i, 1);
  }

  ctx.restore();
  drawHUD();
}

gameLoop();
import './style.css';
import fightersData from './data/fighters.json';
import { FighterBase } from './fighters/FighterBase.js';
import { StickmanRenderer } from './render/StickmanRenderer.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;
const GROUND_Y = 500;

// Inisialisasi 2 Karakter Pertama (Edison vs Kishimoto)
const p1 = new FighterBase({ data: fightersData[0], x: 220, y: GROUND_Y - 145, facing: 1 });
const p2 = new FighterBase({ data: fightersData[1], x: 750, y: GROUND_Y - 145, facing: -1 });

// State Arena & Arcade
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

window.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (!roundOver) {
    if (e.code === 'KeyF') p1.attack();
    if (e.code === 'KeyG') {
      const proj = p1.castSpecial();
      if (proj) {
        projectiles.push(proj);
        spawnFloatingText(p1.x + 25, p1.y - 15, `${proj.name.toUpperCase()}!`, proj.color);
      }
    }
    if (e.code === 'KeyK') p2.attack();
    if (e.code === 'KeyL') {
      const proj = p2.castSpecial();
      if (proj) {
        projectiles.push(proj);
        spawnFloatingText(p2.x + 25, p2.y - 15, `${proj.name.toUpperCase()}!`, proj.color);
      }
    }
  }
  if (e.code === 'Enter' && roundOver) resetMatch();
});

window.addEventListener('keyup', (e) => {
  keys[e.code] = false;
});

function resetMatch() {
  p1.hp = p1.maxHp;
  p1.x = 220;
  p1.state = 'idle';
  p1.specialCooldown = 0;
  p1.xrayTimer = 0;

  p2.hp = p2.maxHp;
  p2.x = 750;
  p2.state = 'idle';
  p2.specialCooldown = 0;
  p2.xrayTimer = 0;

  timer = 99;
  roundOver = false;
  projectiles = [];
  particles = [];
  floatingTexts = [];
  xrayFlash = 0;
}

function handleControls() {
  if (p1.state !== 'ko') {
    p1.vx = 0;
    if (keys['KeyS']) {
      p1.state = 'block';
    } else if (p1.state !== 'attack' && p1.state !== 'special') {
      if (keys['KeyA']) { p1.vx = -p1.speed; p1.state = 'walk'; }
      else if (keys['KeyD']) { p1.vx = p1.speed; p1.state = 'walk'; }
      else { p1.state = 'idle'; }

      if (keys['KeyW'] && p1.y + p1.height >= GROUND_Y) p1.vy = -16;
    }
  }

  if (p2.state !== 'ko') {
    p2.vx = 0;
    if (keys['ArrowDown']) {
      p2.state = 'block';
    } else if (p2.state !== 'attack' && p2.state !== 'special') {
      if (keys['ArrowLeft']) { p2.vx = -p2.speed; p2.state = 'walk'; }
      else if (keys['ArrowRight']) { p2.vx = p2.speed; p2.state = 'walk'; }
      else { p2.state = 'idle'; }

      if (keys['ArrowUp'] && p2.y + p2.height >= GROUND_Y) p2.vy = -16;
    }
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

function checkCombat() {
  // Pukulan Jarak Dekat P1
  const p1Box = p1.getHitbox();
  if (p1Box && !p1.hasHitThisSwing && rectsOverlap(p1Box, p2)) {
    p1.hasHitThisSwing = true;
    p2.takeDamage(p1.power, false);
    p2.vx = p1.facing * 8;
    hitstop = 4;
    screenShake = 8;
    if (p2.hp === 0) xrayFlash = 16;
    spawnSparks(p2.x + p2.width / 2, p2.y + 55, p1.visuals.rimColor);
  }

  // Pukulan Jarak Dekat P2
  const p2Box = p2.getHitbox();
  if (p2Box && !p2.hasHitThisSwing && rectsOverlap(p2Box, p1)) {
    p2.hasHitThisSwing = true;
    p1.takeDamage(p2.power, false);
    p1.vx = p2.facing * 8;
    hitstop = 4;
    screenShake = 8;
    if (p1.hp === 0) xrayFlash = 16;
    spawnSparks(p1.x + p1.width / 2, p1.y + 55, p2.visuals.rimColor);
  }

  // Proyektil Jurus Spesial
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const proj = projectiles[i];
    proj.x += proj.vx;

    // Jejak partikel proyektil
    if (Math.random() < 0.6) {
      spawnSparks(proj.x + proj.width / 2, proj.y + proj.height / 2, proj.color, 2);
    }

    const target = proj.ownerId === p1.id ? p2 : p1;
    if (rectsOverlap(proj, target)) {
      const wasBlocked = target.state === 'block';
      target.takeDamage(proj.damage, true);
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
  // Kilatan X-Ray latar belakang saat jurus masuk telak
  if (xrayFlash > 0) {
    ctx.fillStyle = `rgba(14, 165, 233, ${xrayFlash * 0.022})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    xrayFlash--;
  }

  // Bulan Purnama Merah Gelap
  ctx.fillStyle = 'rgba(185, 28, 28, 0.14)';
  ctx.beginPath();
  ctx.arc(canvas.width / 2, 230, 150, 0, Math.PI * 2);
  ctx.fill();

  // Pilar Arena Gelap
  ctx.fillStyle = '#121215';
  ctx.fillRect(110, 120, 45, GROUND_Y - 120);
  ctx.fillRect(canvas.width - 155, 120, 45, GROUND_Y - 120);

  // Lantai Arena
  ctx.fillStyle = '#18181b';
  ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(canvas.width, GROUND_Y);
  ctx.stroke();
  ctx.restore();
}

function drawProjectiles() {
  projectiles.forEach((proj) => {
    ctx.save();
    ctx.shadowColor = proj.color;
    ctx.shadowBlur = 20;
    ctx.fillStyle = proj.color;

    if (proj.ownerId === 'edison') {
      // Bola Petir Menlo Voltage
      ctx.beginPath();
      ctx.arc(proj.x + proj.width / 2, proj.y + proj.height / 2, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(proj.x + proj.width / 2, proj.y + proj.height / 2, 7, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Sabitan Tinta Hitam-Oranye Kishimoto
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

function drawHUD() {
  const barWidth = 380;
  const barHeight = 24;

  // Health Bar P1 (Kiri)
  ctx.fillStyle = '#27272a';
  ctx.fillRect(40, 32, barWidth, barHeight);
  ctx.fillStyle = '#eab308';
  ctx.fillRect(40, 32, barWidth * (p1.hp / p1.maxHp), barHeight);
  ctx.strokeStyle = '#f4f4f5';
  ctx.strokeRect(40, 32, barWidth, barHeight);

  // Special Cooldown Bar P1
  const p1SpecRatio = 1 - p1.specialCooldown / p1.maxSpecialCooldown;
  ctx.fillStyle = '#18181b';
  ctx.fillRect(40, 60, 180, 7);
  ctx.fillStyle = p1SpecRatio >= 1 ? '#facc15' : '#71717a';
  ctx.fillRect(40, 60, 180 * p1SpecRatio, 7);

  // Health Bar P2 (Kanan)
  ctx.fillStyle = '#27272a';
  ctx.fillRect(canvas.width - 40 - barWidth, 32, barWidth, barHeight);
  const p2Fill = barWidth * (p2.hp / p2.maxHp);
  ctx.fillStyle = '#ea580c';
  ctx.fillRect(canvas.width - 40 - p2Fill, 32, p2Fill, barHeight);
  ctx.strokeStyle = '#f4f4f5';
  ctx.strokeRect(canvas.width - 40 - barWidth, 32, barWidth, barHeight);

  // Special Cooldown Bar P2
  const p2SpecRatio = 1 - p2.specialCooldown / p2.maxSpecialCooldown;
  ctx.fillStyle = '#18181b';
  ctx.fillRect(canvas.width - 220, 60, 180, 7);
  ctx.fillStyle = p2SpecRatio >= 1 ? '#f97316' : '#71717a';
  ctx.fillRect(canvas.width - 220 + 180 * (1 - p2SpecRatio), 60, 180 * p2SpecRatio, 7);

  // Nama & Era Muda Karakter
  ctx.fillStyle = '#f4f4f5';
  ctx.font = 'bold 14px Courier New';
  ctx.textAlign = 'left';
  ctx.fillText(`${p1.name.toUpperCase()} — ${p1.era}`, 40, 86);
  ctx.textAlign = 'right';
  ctx.fillText(`${p2.name.toUpperCase()} — ${p2.era}`, canvas.width - 40, 86);

  // Timer Tengah
  ctx.textAlign = 'center';
  ctx.font = 'bold 34px Courier New';
  ctx.fillStyle = timer <= 15 ? '#ef4444' : '#facc15';
  ctx.fillText(String(timer).padStart(2, '0'), canvas.width / 2, 54);

  // Panduan Kontrol Bawah Layar
  ctx.fillStyle = '#a1a1aa';
  ctx.font = '12px Courier New';
  ctx.fillText('P1: [W/A/S/D] Gerak/Blok | [F] Pukul | [G] Jurus    ||    P2: [ARROWS] Gerak/Blok | [K] Pukul | [L] Jurus', canvas.width / 2, canvas.height - 15);

  // Pengumuman Kemenangan / Finish
  if (p1.hp <= 0 || p2.hp <= 0 || timer <= 0) {
    roundOver = true;
    const winner = p1.hp > p2.hp ? p1.name : p2.hp > p1.hp ? p2.name : 'DRAW';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(0, 200, canvas.width, 130);

    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 46px Courier New';
    ctx.fillText(winner === 'DRAW' ? 'DOUBLE KO!' : `${winner.toUpperCase()} WINS!`, canvas.width / 2, 265);

    ctx.fillStyle = '#e4e4e7';
    ctx.font = '16px Courier New';
    ctx.fillText('Tekan [ENTER] untuk bertarung ulang', canvas.width / 2, 305);
  }
}

function gameLoop() {
  requestAnimationFrame(gameLoop);

  if (hitstop > 0) {
    hitstop--;
    return;
  }

  if (!roundOver) {
    timerTick++;
    if (timerTick >= 60 && timer > 0) {
      timer--;
      timerTick = 0;
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
  StickmanRenderer.draw(ctx, p1);
  StickmanRenderer.draw(ctx, p2);
  drawProjectiles();

  // Render Percikan Energi
  for (let i = particles.length - 1; i >= 0; i--) {
    const pt = particles[i];
    pt.x += pt.vx;
    pt.y += pt.vy;
    pt.life--;
    ctx.fillStyle = pt.color;
    ctx.fillRect(pt.x, pt.y, 4, 4);
    if (pt.life <= 0) particles.splice(i, 1);
  }

  // Render Teks Nama Jurus Melayang
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
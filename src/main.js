import './style.css';
import fightersData from './data/fighters.json';
import { BALANCE, getComboScaledDamage } from './data/balance.js';
import { FighterBase } from './fighters/FighterBase.js';
import { StickmanRenderer } from './render/StickmanRenderer.js';
import { BotAI } from './ai/BotAI.js';
import { ScreenUI } from './ui/ScreenUI.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;
const GROUND_Y = 500;

let currentScreen = 'TITLE';
let titleMenuIndex = 0;
let selectingDifficulty = false;
let difficultyIndex = 1;
const DIFFICULTY_LIST = ['EASY', 'NORMAL', 'HARD'];

let gameMode = '1P';
let isPausedMoveList = false;

let showHitboxes = false;
const DUMMY_MODES = ['IDLE', 'BLOCK', 'JUMP'];
let dummyModeIndex = 0;
let trainingStats = {
  lastHitDamage: 0,
  comboDamage: 0,
};

const selectState = {
  p1Index: 0,
  p2Index: 4,
  p1Team: [],
  p2Team: [],
};

let p1Team = [
  new FighterBase({ data: fightersData[0], x: 220, y: GROUND_Y - 145, facing: 1 }),
  new FighterBase({ data: fightersData[1], x: 220, y: GROUND_Y - 145, facing: 1 }),
];
let p2Team = [
  new FighterBase({ data: fightersData[4], x: 750, y: GROUND_Y - 145, facing: -1 }),
  new FighterBase({ data: fightersData[5], x: 750, y: GROUND_Y - 145, facing: -1 }),
];
let p1ActiveIdx = 0;
let p2ActiveIdx = 0;
let p1TagCooldown = 0;
let p2TagCooldown = 0;

let p1Meter = 0;
let p2Meter = 0;

const botAI = new BotAI();

let p1DisplayHp = 1000;
let p2DisplayHp = 1000;
let p1Combo = { count: 0, timer: 0 };
let p2Combo = { count: 0, timer: 0 };

const keys = {};
let projectiles = [];
let chargingHorses = []; // Kuda Napoleon yang muncul dari belakang lawan sebelum ditunggangi
let scheduledSpawns = []; // Jadwal 3 pisau Sarung Tangan Ilahi Jack the Ripper
let particles = [];
let floatingTexts = [];
let screenShake = 0;
let hitstop = 0;
let xrayFlash = 0;
let timer = 99;
let timerTick = 0;
let roundOver = false;
let introTimer = 75;

function getP1() { return p1Team[p1ActiveIdx]; }
function getP1Partner() { return p1Team[p1ActiveIdx === 0 ? 1 : 0]; }
function getP2() { return p2Team[p2ActiveIdx]; }
function getP2Partner() { return p2Team[p2ActiveIdx === 0 ? 1 : 0]; }

function addTeamMeter(playerNum, amount) {
  if (amount <= 0) return;
  if (playerNum === 1) {
    p1Meter = Math.min(BALANCE.METER_MAX, p1Meter + amount);
  } else {
    p2Meter = Math.min(BALANCE.METER_MAX, p2Meter + amount);
  }
}

function queueSkill2Effects(caster, opponent, ownerSide) {
  const s2 = caster.skills?.skill2;
  if (!s2) return;

  // 1. Jack the Ripper: Sarung Tangan Ilahi mendatangkan 3 pisau berturut-turut ke arah lawan
  if (Array.isArray(s2.multiProjectiles)) {
    s2.multiProjectiles.forEach((mp) => {
      scheduledSpawns.push({
        delay: mp.delayFrame ?? 5,
        ownerSide,
        caster,
        vfx: 'steampunk_knife_single',
        offsetY: mp.offsetY ?? 40,
        width: mp.width ?? 34,
        height: mp.height ?? 14,
        speed: mp.speed ?? 16,
        vy: mp.vy ?? 0,
        gravity: mp.gravity ?? 0,
        damage: mp.damage ?? 50,
        stunDuration: mp.stun ?? 0,
      });
    });
  }

  // 2. Napoleon Bonaparte: Memanggil kuda dari arah belakang lawan, menerjang lawan, lalu ditunggangi 4 detik
  if (caster.hasModifier('summonMount')) {
    const behindDir = opponent.x >= caster.x ? 1 : -1;
    const spawnX = Math.max(40, Math.min(canvas.width - 100, opponent.x + behindDir * 145));
    const chargeDir = caster.x >= spawnX ? 1 : -1;

    chargingHorses.push({
      ownerSide,
      caster,
      x: spawnX,
      y: GROUND_Y - 78,
      width: 78,
      height: 78,
      vx: chargeDir * 17,
      facing: chargeDir,
      damage: 95,
      hasHitOpponent: false,
      life: 90,
      phase: 0,
    });
  }
}

function resetTrainingPositionsAndHp() {
  p1Team.forEach((f, idx) => {
    f.hp = f.maxHp;
    f.redHp = 0;
    f.mountTimer = 0;
    f.x = 260;
    f.y = GROUND_Y - f.height;
    f.vx = 0;
    f.vy = 0;
    f.facing = 1;
    f.state = 'idle';
    f.stunTimer = 0;
    f.stunImmuneTimer = 0;
    f.specialCooldown = 0;
    f.skill2Cooldown = 0;
    if (idx === p1ActiveIdx) p1DisplayHp = f.maxHp;
  });
  p2Team.forEach((f, idx) => {
    f.hp = f.maxHp;
    f.redHp = 0;
    f.mountTimer = 0;
    f.x = 710;
    f.y = GROUND_Y - f.height;
    f.vx = 0;
    f.vy = 0;
    f.facing = -1;
    f.state = 'idle';
    f.stunTimer = 0;
    f.stunImmuneTimer = 0;
    f.specialCooldown = 0;
    f.skill2Cooldown = 0;
    if (idx === p2ActiveIdx) p2DisplayHp = f.maxHp;
  });
  p1TagCooldown = 0;
  p2TagCooldown = 0;
  p1Meter = BALANCE.METER_MAX;
  p2Meter = BALANCE.METER_MAX;
  p1Combo = { count: 0, timer: 0 };
  p2Combo = { count: 0, timer: 0 };
  trainingStats = { lastHitDamage: 0, comboDamage: 0 };
  projectiles = [];
  chargingHorses = [];
  scheduledSpawns = [];
  spawnFloatingText(canvas.width / 2, 220, 'TRAINING RESET!', '#38bdf8');
}

function startBattle() {
  const p1A = fightersData[selectState.p1Team[0] ?? 0];
  const p1B = fightersData[selectState.p1Team[1] ?? 1];
  const p2A = fightersData[selectState.p2Team[0] ?? 4];
  const p2B = fightersData[selectState.p2Team[1] ?? 5];

  p1Team = [
    new FighterBase({ data: p1A, x: 220, y: GROUND_Y - 145, facing: 1 }),
    new FighterBase({ data: p1B, x: 220, y: GROUND_Y - 145, facing: 1 }),
  ];
  p2Team = [
    new FighterBase({ data: p2A, x: 750, y: GROUND_Y - 145, facing: -1 }),
    new FighterBase({ data: p2B, x: 750, y: GROUND_Y - 145, facing: -1 }),
  ];

  p1ActiveIdx = 0;
  p2ActiveIdx = 0;
  p1TagCooldown = 0;
  p2TagCooldown = 0;
  p1Meter = gameMode === 'TRAINING' ? BALANCE.METER_MAX : 0;
  p2Meter = gameMode === 'TRAINING' ? BALANCE.METER_MAX : 0;
  p1DisplayHp = getP1().maxHp;
  p2DisplayHp = getP2().maxHp;
  p1Combo = { count: 0, timer: 0 };
  p2Combo = { count: 0, timer: 0 };
  trainingStats = { lastHitDamage: 0, comboDamage: 0 };
  timer = 99;
  introTimer = gameMode === 'TRAINING' ? 0 : 75;
  roundOver = false;
  isPausedMoveList = false;
  projectiles = [];
  chargingHorses = [];
  scheduledSpawns = [];
  particles = [];
  floatingTexts = [];
  xrayFlash = 0;
  botAI.resetState();
  currentScreen = 'FIGHT';
}

function switchCharacter(playerNum, forceAutoTag = false) {
  const isP1 = playerNum === 1;
  const active = isP1 ? getP1() : getP2();
  const partner = isP1 ? getP1Partner() : getP2Partner();
  const opponent = isP1 ? getP2() : getP1();
  const tagCd = isP1 ? p1TagCooldown : p2TagCooldown;

  if (!partner || partner.hp <= 0) return false;
  if (!forceAutoTag) {
    if (tagCd > 0) return false;
    if (['stun', 'ko', 'roll'].includes(active.state)) return false;
  }

  const oldX = active.x;
  const dirToOpponent = opponent.x >= oldX ? 1 : -1;

  active.vx = 0;
  active.vy = 0;
  active.mountTimer = 0;
  active.state = 'idle';
  active.comboStep = 0;
  active.comboChain = [];
  active.stunTimer = 0;
  active.invulnerable = false;

  if (isP1) {
    p1ActiveIdx = p1ActiveIdx === 0 ? 1 : 0;
    p1DisplayHp = partner.hp;
    p1TagCooldown = forceAutoTag ? BALANCE.TAG_AUTO_COOLDOWN : BALANCE.TAG_COOLDOWN_MAX;
  } else {
    p2ActiveIdx = p2ActiveIdx === 0 ? 1 : 0;
    p2DisplayHp = partner.hp;
    p2TagCooldown = forceAutoTag ? BALANCE.TAG_AUTO_COOLDOWN : BALANCE.TAG_COOLDOWN_MAX;
  }

  partner.x = Math.max(40, Math.min(canvas.width - 90, oldX - dirToOpponent * 65));
  partner.y = GROUND_Y - partner.height;
  partner.facing = dirToOpponent;
  partner.invulnerable = false;
  partner.stunTimer = 0;
  partner.afterimages.push({ x: partner.x, y: partner.y, facing: partner.facing, alpha: 0.7 });
  partner.executeComboMove('P', 1);
  partner.vx = dirToOpponent * 13;

  spawnSparks(partner.x + 25, partner.y + 70, partner.visuals.rimColor, 18);
  spawnFloatingText(
    partner.x + 25,
    partner.y - 22,
    forceAutoTag ? `NEXT FIGHTER: ${partner.name.split(' ').slice(-1)[0].toUpperCase()}!` : 'TAG SWITCH!',
    partner.visuals.rimColor
  );
  return true;
}

function triggerTagCounter(playerNum) {
  const isP1 = playerNum === 1;
  const active = isP1 ? getP1() : getP2();
  const partner = isP1 ? getP1Partner() : getP2Partner();
  const opponent = isP1 ? getP2() : getP1();
  const meter = isP1 ? p1Meter : p2Meter;

  if (!partner || partner.hp <= 0) return false;
  if (active.state !== 'block') return false;
  if (meter < BALANCE.METER_BAR_COST) return false;

  const oldX = active.x;
  const dirToOpponent = opponent.x >= oldX ? 1 : -1;

  active.vx = 0;
  active.vy = 0;
  active.mountTimer = 0;
  active.state = 'idle';
  active.comboStep = 0;
  active.comboChain = [];
  active.invulnerable = false;

  if (isP1) {
    p1Meter -= BALANCE.METER_BAR_COST;
    p1ActiveIdx = p1ActiveIdx === 0 ? 1 : 0;
    p1DisplayHp = partner.hp;
    p1TagCooldown = BALANCE.TAG_COOLDOWN_MAX;
  } else {
    p2Meter -= BALANCE.METER_BAR_COST;
    p2ActiveIdx = p2ActiveIdx === 0 ? 1 : 0;
    p2DisplayHp = partner.hp;
    p2TagCooldown = BALANCE.TAG_COOLDOWN_MAX;
  }

  partner.x = Math.max(40, Math.min(canvas.width - 90, oldX - dirToOpponent * 48));
  partner.y = GROUND_Y - partner.height;
  partner.stunTimer = 0;
  partner.startTagCounter(dirToOpponent);
  partner.afterimages.push({ x: partner.x, y: partner.y, facing: partner.facing, alpha: 0.85 });

  hitstop = 5;
  screenShake = 10;
  spawnSparks(partner.x + 25, partner.y + 65, '#38bdf8', 24);
  spawnFloatingText(partner.x + 25, partner.y - 26, 'TAG COUNTER!', '#38bdf8');
  return true;
}

window.addEventListener('keydown', (e) => {
  keys[e.code] = true;

  if (e.code === 'F1') {
    e.preventDefault();
    showHitboxes = !showHitboxes;
    return;
  }

  if (currentScreen === 'FIGHT' && gameMode === 'TRAINING') {
    if (e.code === 'F2') {
      e.preventDefault();
      resetTrainingPositionsAndHp();
      return;
    }
    if (e.code === 'F3') {
      e.preventDefault();
      dummyModeIndex = (dummyModeIndex + 1) % DUMMY_MODES.length;
      spawnFloatingText(getP2().x + 25, getP2().y - 25, `DUMMY: ${DUMMY_MODES[dummyModeIndex]}`, '#facc15');
      return;
    }
  }

  if (currentScreen === 'TITLE') {
    if (!selectingDifficulty) {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        titleMenuIndex = (titleMenuIndex - 1 + 3) % 3;
      }
      if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        titleMenuIndex = (titleMenuIndex + 1) % 3;
      }
      if (e.code === 'Enter' || e.code === 'KeyF' || e.code === 'Space') {
        if (titleMenuIndex === 0) {
          selectingDifficulty = true;
          difficultyIndex = 1;
        } else {
          gameMode = titleMenuIndex === 1 ? '2P' : 'TRAINING';
          selectState.p1Team = [];
          selectState.p2Team = [];
          currentScreen = 'SELECT';
        }
      }
    } else {
      if (e.code === 'Escape') {
        selectingDifficulty = false;
        return;
      }
      if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        difficultyIndex = (difficultyIndex - 1 + DIFFICULTY_LIST.length) % DIFFICULTY_LIST.length;
      }
      if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        difficultyIndex = (difficultyIndex + 1) % DIFFICULTY_LIST.length;
      }
      if (e.code === 'Enter' || e.code === 'KeyF' || e.code === 'Space') {
        gameMode = '1P';
        botAI.setDifficulty(DIFFICULTY_LIST[difficultyIndex]);
        selectingDifficulty = false;
        selectState.p1Team = [];
        selectState.p2Team = [];
        currentScreen = 'SELECT';
      }
    }
    return;
  }

  if (currentScreen === 'SELECT') {
    if (e.code === 'Escape') {
      currentScreen = 'TITLE';
      return;
    }

    if (selectState.p1Team.length < 2) {
      if (e.code === 'KeyA') selectState.p1Index = (selectState.p1Index - 1 + fightersData.length) % fightersData.length;
      if (e.code === 'KeyD') selectState.p1Index = (selectState.p1Index + 1) % fightersData.length;
      if (e.code === 'KeyW') selectState.p1Index = (selectState.p1Index - 5 + fightersData.length) % fightersData.length;
      if (e.code === 'KeyS') selectState.p1Index = (selectState.p1Index + 5) % fightersData.length;
      if (e.code === 'KeyF' || e.code === 'Enter') {
        if (!selectState.p1Team.includes(selectState.p1Index)) {
          selectState.p1Team.push(selectState.p1Index);
          selectState.p1Index = (selectState.p1Index + 1) % fightersData.length;
        }
      }
    } else if ((gameMode === '1P' || gameMode === 'TRAINING') && selectState.p2Team.length < 2) {
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') selectState.p2Index = (selectState.p2Index - 1 + fightersData.length) % fightersData.length;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') selectState.p2Index = (selectState.p2Index + 1) % fightersData.length;
      if (e.code === 'KeyW' || e.code === 'ArrowUp') selectState.p2Index = (selectState.p2Index - 5 + fightersData.length) % fightersData.length;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') selectState.p2Index = (selectState.p2Index + 5) % fightersData.length;
      if (e.code === 'KeyF' || e.code === 'KeyK' || e.code === 'Enter') {
        if (!selectState.p2Team.includes(selectState.p2Index)) {
          selectState.p2Team.push(selectState.p2Index);
          selectState.p2Index = (selectState.p2Index + 1) % fightersData.length;
        }
      }
    }

    if (gameMode === '2P' && selectState.p2Team.length < 2) {
      if (e.code === 'ArrowLeft') selectState.p2Index = (selectState.p2Index - 1 + fightersData.length) % fightersData.length;
      if (e.code === 'ArrowRight') selectState.p2Index = (selectState.p2Index + 1) % fightersData.length;
      if (e.code === 'ArrowUp') selectState.p2Index = (selectState.p2Index - 5 + fightersData.length) % fightersData.length;
      if (e.code === 'ArrowDown') selectState.p2Index = (selectState.p2Index + 5) % fightersData.length;
      if (e.code === 'KeyK' || e.code === 'Enter') {
        if (!selectState.p2Team.includes(selectState.p2Index)) {
          selectState.p2Team.push(selectState.p2Index);
          selectState.p2Index = (selectState.p2Index + 1) % fightersData.length;
        }
      }
    }

    if (selectState.p1Team.length === 2 && selectState.p2Team.length === 2) {
      setTimeout(() => startBattle(), 380);
    }
    return;
  }

  if (currentScreen === 'FIGHT') {
    if (e.code === 'Tab') {
      e.preventDefault();
      isPausedMoveList = !isPausedMoveList;
      return;
    }
    if (e.code === 'Escape') {
      selectState.p1Team = [];
      selectState.p2Team = [];
      currentScreen = 'SELECT';
      return;
    }

    if (isPausedMoveList) return;

    const p1 = getP1();
    const p2 = getP2();

    if (!roundOver && introTimer <= 20) {
      // --- PLAYER 1 ---
      if (e.code === 'KeyQ') {
        const dir = keys['KeyA'] ? -1 : keys['KeyD'] ? 1 : p1.facing;
        if (p1.dash(dir)) spawnSparks(p1.x + 25, GROUND_Y - 10, '#e4e4e7', 8);
      }
      if (e.code === 'KeyX') {
        const dir = keys['KeyA'] ? -1 : keys['KeyD'] ? 1 : p1.facing;
        if (p1.roll(dir)) spawnFloatingText(p1.x + 25, p1.y + 20, 'ROLL!', '#a1a1aa');
      }
      if (e.code === 'KeyE') {
        if (!(keys['KeyS'] && triggerTagCounter(1))) {
          switchCharacter(1, false);
        }
      }
      if (e.code === 'KeyF') p1.attack();
      if (e.code === 'KeyR') p1.kick();
      if (e.code === 'KeyG') {
        const res = p1.castSpecial(1);
        if (res) {
          if (!res.isMeleeSkill) projectiles.push(res);
          spawnFloatingText(p1.x + 25, p1.y - 15, `${res.name.toUpperCase()}!`, res.color);
        }
      }
      if (e.code === 'KeyT') {
        const s2Res = p1.castSkill2();
        if (s2Res) {
          screenShake = 10;
          queueSkill2Effects(p1, p2, 1);
          spawnFloatingText(p1.x + 25, p1.y - 25, s2Res.name, p1.visuals.rimColor);
        }
      }

      // --- PLAYER 2 (Mode 2P) ---
      if (gameMode === '2P') {
        if (e.code === 'KeyM') {
          const dir = keys['ArrowLeft'] ? -1 : keys['ArrowRight'] ? 1 : p2.facing;
          if (p2.dash(dir)) spawnSparks(p2.x + 25, GROUND_Y - 10, '#e4e4e7', 8);
        }
        if (e.code === 'KeyN') {
          const dir = keys['ArrowLeft'] ? -1 : keys['ArrowRight'] ? 1 : p2.facing;
          if (p2.roll(dir)) spawnFloatingText(p2.x + 25, p2.y + 20, 'ROLL!', '#a1a1aa');
        }
        if (e.code === 'Comma') {
          if (!(keys['ArrowDown'] && triggerTagCounter(2))) {
            switchCharacter(2, false);
          }
        }
        if (e.code === 'KeyK') p2.attack();
        if (e.code === 'Period') p2.kick();
        if (e.code === 'KeyL') {
          const res = p2.castSpecial(2);
          if (res) {
            if (!res.isMeleeSkill) projectiles.push(res);
            spawnFloatingText(p2.x + 25, p2.y - 15, `${res.name.toUpperCase()}!`, res.color);
          }
        }
        if (e.code === 'Slash') {
          const s2Res = p2.castSkill2();
          if (s2Res) {
            screenShake = 10;
            queueSkill2Effects(p2, p1, 2);
            spawnFloatingText(p2.x + 25, p2.y - 25, s2Res.name, p2.visuals.rimColor);
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

function handleDummyTraining(dummy) {
  const locked = ['stun', 'ko'];
  if (locked.includes(dummy.state)) return;

  const mode = DUMMY_MODES[dummyModeIndex];
  dummy.vx = 0;
  if (mode === 'BLOCK') {
    dummy.state = 'block';
  } else if (mode === 'JUMP') {
    dummy.state = 'idle';
    if (dummy.y + dummy.height >= GROUND_Y) {
      dummy.vy = -15;
    }
  } else {
    dummy.state = 'idle';
  }
}

function handleControls() {
  if (introTimer > 20) return;
  const p1 = getP1();
  const p2 = getP2();
  const lockedStates = ['attack', 'kick', 'special', 'skill2', 'tag_counter', 'dash', 'roll', 'stun'];

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

  if (gameMode === 'TRAINING') {
    handleDummyTraining(p2);
  } else if (gameMode === '2P') {
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
    botAI.update(p2, getP2Partner(), p1, GROUND_Y, {
      projectiles,
      teamMeter: p2Meter,
      onSpecial: () => {
        const res = p2.castSpecial(2);
        if (res) {
          if (!res.isMeleeSkill) projectiles.push(res);
          spawnFloatingText(p2.x + 25, p2.y - 15, `${res.name.toUpperCase()}!`, res.color);
        }
      },
      onSkill2: () => {
        const s2Res = p2.castSkill2();
        if (s2Res) {
          screenShake = 10;
          queueSkill2Effects(p2, p1, 2);
          spawnFloatingText(p2.x + 25, p2.y - 25, s2Res.name, p2.visuals.rimColor);
        }
      },
      onDash: (dir) => p2.dash(dir),
      onSwitch: () => switchCharacter(2, false),
      onTagCounter: () => triggerTagCounter(2),
    });
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

function registerHit(attackerCombo, playerNum, damageDealt) {
  if (playerNum === 1 && attackerCombo.timer === 0) {
    trainingStats.comboDamage = 0;
  }
  attackerCombo.count++;
  attackerCombo.timer = 90;
  if (playerNum === 1) {
    trainingStats.lastHitDamage = damageDealt;
    trainingStats.comboDamage += damageDealt;
  }
}

function resolveXrayTrigger(box, wasBlocked, attackerSide) {
  if (wasBlocked || !box.isXray) return false;
  if (!box.isFinisher) return true;
  if (!BALANCE.XRAY_FINISHER_REQUIRES_METER) return true;

  if (attackerSide === 1 && p1Meter >= BALANCE.METER_BAR_COST) {
    p1Meter -= BALANCE.METER_BAR_COST;
    return true;
  }
  if (attackerSide === 2 && p2Meter >= BALANCE.METER_BAR_COST) {
    p2Meter -= BALANCE.METER_BAR_COST;
    return true;
  }
  return false;
}

function updateScheduledProjectilesAndHorses() {
  // 1. Proses jadwal 3 pisau Jack the Ripper (Sarung Tangan Ilahi)
  for (let i = scheduledSpawns.length - 1; i >= 0; i--) {
    const sp = scheduledSpawns[i];
    sp.delay--;
    if (sp.delay <= 0) {
      const c = sp.caster;
      if (c && c.hp > 0) {
        projectiles.push({
          ownerSide: sp.ownerSide,
          ownerId: c.id,
          name: 'Divine Blade',
          vfx: sp.vfx,
          x: c.facing === 1 ? c.x + c.width + 12 : c.x - sp.width - 12,
          y: c.y + sp.offsetY,
          width: sp.width,
          height: sp.height,
          vx: c.facing * sp.speed,
          vy: sp.vy,
          gravity: sp.gravity,
          damage: sp.damage,
          stunDuration: sp.stunDuration,
          color: c.visuals.rimColor,
          facing: c.facing,
        });
        spawnSparks(
          c.facing === 1 ? c.x + c.width + 16 : c.x - 16,
          c.y + sp.offsetY,
          '#facc15',
          10
        );
      }
      scheduledSpawns.splice(i, 1);
    }
  }

  // 2. Proses Kuda Napoleon (datang dari belakang lawan, menerjang lawan, lalu ditunggangi 4 detik)
  for (let i = chargingHorses.length - 1; i >= 0; i--) {
    const horse = chargingHorses[i];
    horse.x += horse.vx;
    horse.phase += 0.45;
    horse.life--;

    const isP1Owner = horse.ownerSide === 1;
    const target = isP1Owner ? getP2() : getP1();
    const caster = horse.caster;

    // Tabrak lawan saat kuda melintas dari belakang lawan
    if (!horse.hasHitOpponent && !target.invulnerable && rectsOverlap(horse, target)) {
      horse.hasHitOpponent = true;
      const wasBlocked = target.state === 'block';
      const actualDamage = target.takeDamage(horse.damage, false, 20);
      if (!wasBlocked) {
        registerHit(isP1Owner ? p1Combo : p2Combo, horse.ownerSide, actualDamage);
        target.vy = -7;
      }
      target.vx = horse.facing * 18;
      hitstop = 4;
      screenShake = 12;
      spawnSparks(target.x + 25, target.y + 80, '#3b82f6', 24);
      spawnFloatingText(target.x + 25, target.y - 20, 'CAVALRY TRAMPLE!', '#60a5fa');
    }

    // Ketika kuda mencapai Napoleon, Napoleon langsung menungganginya selama 4 detik (240 frame)
    if (caster && caster.hp > 0 && rectsOverlap(horse, caster)) {
      caster.startMount(240);
      spawnSparks(caster.x + 25, GROUND_Y - 30, '#facc15', 22);
      spawnFloatingText(caster.x + 25, caster.y - 45, 'MOUNTED CAVALRY (4.0s)!', '#38bdf8');
      chargingHorses.splice(i, 1);
      continue;
    }

    if (horse.life <= 0 || horse.x < -120 || horse.x > canvas.width + 120) {
      if (caster && caster.hp > 0) {
        caster.startMount(240);
        spawnFloatingText(caster.x + 25, caster.y - 45, 'MOUNTED CAVALRY (4.0s)!', '#38bdf8');
      }
      chargingHorses.splice(i, 1);
    }
  }
}

function checkCombat() {
  const p1 = getP1();
  const p2 = getP2();

  // Melee / Skill Hitbox P1 -> P2
  const p1Box = p1.getHitbox();
  if (p1Box && !p1.hasHitId(p1Box.hitId) && !p2.invulnerable && rectsOverlap(p1Box, p2)) {
    p1.markHitId(p1Box.hitId);
    const wasBlocked = p2.state === 'block';
    const nextHitNumber = wasBlocked ? 1 : p1Combo.count + 1;
    const scaledDamage = getComboScaledDamage(p1Box.damage, nextHitNumber);
    const triggerXray = resolveXrayTrigger(p1Box, wasBlocked, 1);

    const actualDamage = p2.takeDamage(scaledDamage, triggerXray, p1Box.stunDuration || 0);

    if (wasBlocked) {
      addTeamMeter(2, scaledDamage * BALANCE.METER_GAIN_BLOCK_MULT);
    } else {
      addTeamMeter(1, actualDamage * BALANCE.METER_GAIN_DEALT_MULT);
      addTeamMeter(2, actualDamage * BALANCE.METER_GAIN_TAKEN_MULT);
      registerHit(p1Combo, 1, actualDamage);
      if (p1Box.launchY) p2.vy = p1Box.launchY;
      if (p1Box.stunDuration > 0 && p2.stunTimer > 0) {
        spawnFloatingText(p2.x + 25, p2.y - 25, 'STUNNED!', '#38bdf8');
      }
    }

    p2.vx = p1.facing * (wasBlocked ? p1Box.knockback * 0.4 : p1Box.knockback);
    hitstop = triggerXray ? 8 : 3;
    screenShake = triggerXray ? 15 : 6;
    if (triggerXray || p2.hp === 0) xrayFlash = 16;
    spawnSparks(p2.x + p2.width / 2, p2.y + 55, p1.visuals.rimColor, triggerXray ? 28 : 12);
  }

  // Melee / Skill Hitbox P2 -> P1
  const p2Box = p2.getHitbox();
  if (p2Box && !p2.hasHitId(p2Box.hitId) && !p1.invulnerable && rectsOverlap(p2Box, p1)) {
    p2.markHitId(p2Box.hitId);
    const wasBlocked = p1.state === 'block';
    const nextHitNumber = wasBlocked ? 1 : p2Combo.count + 1;
    const scaledDamage = getComboScaledDamage(p2Box.damage, nextHitNumber);
    const triggerXray = resolveXrayTrigger(p2Box, wasBlocked, 2);

    const actualDamage = p1.takeDamage(scaledDamage, triggerXray, p2Box.stunDuration || 0);

    if (wasBlocked) {
      addTeamMeter(1, scaledDamage * BALANCE.METER_GAIN_BLOCK_MULT);
    } else {
      addTeamMeter(2, actualDamage * BALANCE.METER_GAIN_DEALT_MULT);
      addTeamMeter(1, actualDamage * BALANCE.METER_GAIN_TAKEN_MULT);
      registerHit(p2Combo, 2, actualDamage);
      if (p2Box.launchY) p1.vy = p2Box.launchY;
      if (p2Box.stunDuration > 0 && p1.stunTimer > 0) {
        spawnFloatingText(p1.x + 25, p1.y - 25, 'STUNNED!', '#38bdf8');
      }
    }

    p1.vx = p2.facing * (wasBlocked ? p2Box.knockback * 0.4 : p2Box.knockback);
    hitstop = triggerXray ? 8 : 3;
    screenShake = triggerXray ? 15 : 6;
    if (triggerXray || p1.hp === 0) xrayFlash = 16;
    spawnSparks(p1.x + p1.width / 2, p1.y + 55, p2.visuals.rimColor, triggerXray ? 28 : 12);
  }

  // Proyektil Skill 1 & Skill 2
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const proj = projectiles[i];
    proj.x += proj.vx;
    if (proj.gravity) {
      proj.vy = (proj.vy || 0) + proj.gravity;
      proj.y += proj.vy;
    }

    if (Math.random() < 0.6) {
      spawnSparks(proj.x + proj.width / 2, proj.y + proj.height / 2, proj.color, 2);
    }

    const isP1Owner = proj.ownerSide === 1;
    const target = isP1Owner ? p2 : p1;
    const attackerCombo = isP1Owner ? p1Combo : p2Combo;
    const attackerSide = isP1Owner ? 1 : 2;
    const defenderSide = isP1Owner ? 2 : 1;

    if (!target.invulnerable && rectsOverlap(proj, target)) {
      const wasBlocked = target.state === 'block';
      const nextHitNumber = wasBlocked ? 1 : attackerCombo.count + 1;
      const scaledDamage = getComboScaledDamage(proj.damage, nextHitNumber);
      const actualDamage = target.takeDamage(scaledDamage, true, proj.stunDuration || 0);

      if (wasBlocked) {
        addTeamMeter(defenderSide, scaledDamage * BALANCE.METER_GAIN_BLOCK_MULT);
      } else {
        addTeamMeter(attackerSide, actualDamage * BALANCE.METER_GAIN_DEALT_MULT);
        addTeamMeter(defenderSide, actualDamage * BALANCE.METER_GAIN_TAKEN_MULT);
        registerHit(attackerCombo, attackerSide, actualDamage);
        if (proj.stunDuration > 0 && target.stunTimer > 0) {
          spawnFloatingText(target.x + 25, target.y - 25, 'TORNADO STUN!', '#c084fc');
        }
      }

      target.vx = proj.facing * (wasBlocked ? BALANCE.PROJECTILE_BLOCK_KNOCKBACK : BALANCE.PROJECTILE_KNOCKBACK);
      hitstop = wasBlocked ? 3 : 8;
      screenShake = wasBlocked ? 6 : 16;
      if (!wasBlocked) xrayFlash = 14;
      spawnSparks(target.x + target.width / 2, target.y + 55, proj.color, 28);
      projectiles.splice(i, 1);
      continue;
    }

    if (proj.x < -80 || proj.x > canvas.width + 80 || proj.y > GROUND_Y + 20) {
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

function drawProjectilesAndHorses() {
  projectiles.forEach((proj) => {
    StickmanRenderer.drawProjectile(ctx, proj);

    if (showHitboxes) {
      ctx.save();
      ctx.strokeStyle = '#f97316';
      ctx.fillStyle = 'rgba(249, 115, 22, 0.28)';
      ctx.lineWidth = 2;
      ctx.fillRect(proj.x, proj.y, proj.width, proj.height);
      ctx.strokeRect(proj.x, proj.y, proj.width, proj.height);
      ctx.restore();
    }
  });

  chargingHorses.forEach((horse) => {
    StickmanRenderer.drawWarhorse(ctx, horse.x + horse.width / 2, GROUND_Y, horse.facing, '#3b82f6', horse.phase);
  });
}

function drawSkewedBar(x, y, w, h, skew, fillRatio, trailRatio, redHpRatio, fillColor, alignRight = false) {
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
  ctx.fillStyle = '#7f1d1d';
  ctx.fill();

  if (redHpRatio > 0) {
    drawPoly(w, Math.min(1, fillRatio + redHpRatio));
    ctx.fillStyle = 'rgba(239, 68, 68, 0.52)';
    ctx.fill();
  }

  drawPoly(w, fillRatio);
  ctx.fillStyle = fillColor;
  ctx.fill();

  drawPoly(w, 1);
  ctx.strokeStyle = '#e4e4e7';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function drawTeamMeterBar(x, y, w, h, meterValue, alignRight = false) {
  ctx.save();
  const bars = 3;
  const gap = 4;
  const segW = (w - gap * (bars - 1)) / bars;

  for (let i = 0; i < bars; i++) {
    const barIdx = alignRight ? bars - 1 - i : i;
    const sx = x + i * (segW + gap);
    const barFill = Math.max(0, Math.min(1, (meterValue - barIdx * 100) / 100));

    ctx.fillStyle = '#18181b';
    ctx.fillRect(sx, y, segW, h);

    if (barFill > 0) {
      ctx.fillStyle = barFill >= 1 ? '#38bdf8' : '#0284c7';
      const fillW = segW * barFill;
      ctx.fillRect(alignRight ? sx + (segW - fillW) : sx, y, fillW, h);
    }

    ctx.strokeStyle = barFill >= 1 ? '#bae6fd' : '#52525b';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(sx, y, segW, h);
  }

  ctx.fillStyle = meterValue >= 100 ? '#38bdf8' : '#71717a';
  ctx.font = 'bold 10px Courier New';
  ctx.textAlign = alignRight ? 'right' : 'left';
  const stocks = Math.floor(meterValue / 100);
  ctx.fillText(`METER [${stocks}/3]`, alignRight ? x + w : x, y + h + 11);
  ctx.restore();
}

function drawHUD() {
  const p1 = getP1();
  const p1Partner = getP1Partner();
  const p2 = getP2();
  const p2Partner = getP2Partner();

  if (p1DisplayHp > p1.hp) p1DisplayHp = Math.max(p1.hp, p1DisplayHp - 4);
  else if (p1DisplayHp < p1.hp) p1DisplayHp = p1.hp;

  if (p2DisplayHp > p2.hp) p2DisplayHp = Math.max(p2.hp, p2DisplayHp - 4);
  else if (p2DisplayHp < p2.hp) p2DisplayHp = p2.hp;

  const barWidth = 385;
  const barHeight = 24;

  drawSkewedBar(
    45, 28, barWidth, barHeight, 14,
    p1.hp / p1.maxHp,
    p1DisplayHp / p1.maxHp,
    p1.redHp / p1.maxHp,
    p1.visuals.rimColor,
    false
  );
  drawSkewedBar(
    canvas.width - 45 - barWidth, 28, barWidth, barHeight, 14,
    p2.hp / p2.maxHp,
    p2DisplayHp / p2.maxHp,
    p2.redHp / p2.maxHp,
    p2.visuals.rimColor,
    true
  );

  const p1S1 = 1 - p1.specialCooldown / p1.maxSpecialCooldown;
  const p1S2 = 1 - p1.skill2Cooldown / p1.maxSkill2Cooldown;
  ctx.fillStyle = '#18181b';
  ctx.fillRect(35, 57, 130, 5);
  ctx.fillStyle = p1S1 >= 1 ? p1.visuals.rimColor : '#52525b';
  ctx.fillRect(35, 57, 130 * p1S1, 5);

  ctx.fillStyle = '#18181b';
  ctx.fillRect(175, 57, 130, 5);
  ctx.fillStyle = p1S2 >= 1 ? '#38bdf8' : '#52525b';
  ctx.fillRect(175, 57, 130 * p1S2, 5);

  const p2S1 = 1 - p2.specialCooldown / p2.maxSpecialCooldown;
  const p2S2 = 1 - p2.skill2Cooldown / p2.maxSkill2Cooldown;
  ctx.fillStyle = '#18181b';
  ctx.fillRect(canvas.width - 165, 57, 130, 5);
  ctx.fillStyle = p2S1 >= 1 ? p2.visuals.rimColor : '#52525b';
  ctx.fillRect(canvas.width - 165 + 130 * (1 - p2S1), 57, 130 * p2S1, 5);

  ctx.fillStyle = '#18181b';
  ctx.fillRect(canvas.width - 305, 57, 130, 5);
  ctx.fillStyle = p2S2 >= 1 ? '#38bdf8' : '#52525b';
  ctx.fillRect(canvas.width - 305 + 130 * (1 - p2S2), 57, 130 * p2S2, 5);

  drawTeamMeterBar(35, 67, 210, 8, p1Meter, false);
  drawTeamMeterBar(canvas.width - 245, 67, 210, 8, p2Meter, true);

  ctx.fillStyle = '#f4f4f5';
  ctx.font = 'bold 14px Courier New';
  ctx.textAlign = 'left';
  const p1Suffix = p1.id === 'napoleon' ? ` [${p1.weaponMode.toUpperCase()}${p1.mountTimer > 0 ? ` • HORSE ${(p1.mountTimer / 60).toFixed(1)}s` : ''}]` : '';
  ctx.fillText(`${p1.name.toUpperCase()}${p1Suffix}`, 35, 102);

  ctx.textAlign = 'right';
  const p2Suffix = p2.id === 'napoleon' ? ` [${p2.weaponMode.toUpperCase()}${p2.mountTimer > 0 ? ` • HORSE ${(p2.mountTimer / 60).toFixed(1)}s` : ''}]` : '';
  const p2Tag =
    gameMode === 'TRAINING'
      ? `[DUMMY:${DUMMY_MODES[dummyModeIndex]}] `
      : gameMode === '1P'
        ? `[AI:${botAI.difficulty}] `
        : '';
  ctx.fillText(`${p2Tag}${p2.name.toUpperCase()}${p2Suffix}`, canvas.width - 35, 102);

  if (p1Partner) {
    ctx.textAlign = 'left';
    const p1Ready = p1Partner.hp > 0 && p1TagCooldown === 0;
    ctx.fillStyle = p1Partner.hp <= 0 ? '#71717a' : p1Ready ? '#4ade80' : '#a1a1aa';
    ctx.font = 'bold 11px Courier New';
    const tagTxt = p1Partner.hp <= 0 ? 'PARTNER KO' : p1Ready ? 'TAG READY [E]' : `TAG CD ${(p1TagCooldown / 60).toFixed(1)}s`;
    ctx.fillText(`SUB: ${p1Partner.name.split(' ').slice(-1)[0].toUpperCase()} (${tagTxt})`, 35, 118);

    ctx.fillStyle = '#18181b';
    ctx.fillRect(35, 123, 160, 6);
    if (p1Partner.hp > 0 && p1Partner.redHp > 0) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.55)';
      ctx.fillRect(35, 123, 160 * Math.min(1, (p1Partner.hp + p1Partner.redHp) / p1Partner.maxHp), 6);
    }
    ctx.fillStyle = p1Partner.hp > 0 ? p1Partner.visuals.rimColor : '#3f3f46';
    ctx.fillRect(35, 123, 160 * (p1Partner.hp / p1Partner.maxHp), 6);
  }

  if (p2Partner) {
    ctx.textAlign = 'right';
    const p2Ready = p2Partner.hp > 0 && p2TagCooldown === 0;
    ctx.fillStyle = p2Partner.hp <= 0 ? '#71717a' : p2Ready ? '#4ade80' : '#a1a1aa';
    ctx.font = 'bold 11px Courier New';
    const tagTxt = p2Partner.hp <= 0 ? 'PARTNER KO' : p2Ready ? 'TAG READY [,]' : `TAG CD ${(p2TagCooldown / 60).toFixed(1)}s`;
    ctx.fillText(`SUB: ${p2Partner.name.split(' ').slice(-1)[0].toUpperCase()} (${tagTxt})`, canvas.width - 35, 118);

    const subW = 160 * (p2Partner.hp / p2Partner.maxHp);
    ctx.fillStyle = '#18181b';
    ctx.fillRect(canvas.width - 195, 123, 160, 6);
    if (p2Partner.hp > 0 && p2Partner.redHp > 0) {
      const subRedW = 160 * Math.min(1, (p2Partner.hp + p2Partner.redHp) / p2Partner.maxHp);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.55)';
      ctx.fillRect(canvas.width - 35 - subRedW, 123, subRedW, 6);
    }
    ctx.fillStyle = p2Partner.hp > 0 ? p2Partner.visuals.rimColor : '#3f3f46';
    ctx.fillRect(canvas.width - 35 - subW, 123, subW, 6);
  }

  ctx.fillStyle = '#09090b';
  ctx.strokeStyle = gameMode === 'TRAINING' ? '#38bdf8' : '#dc2626';
  ctx.lineWidth = 2;
  ctx.fillRect(canvas.width / 2 - 36, 22, 72, 42);
  ctx.strokeRect(canvas.width / 2 - 36, 22, 72, 42);

  ctx.textAlign = 'center';
  ctx.font = 'bold 30px Courier New';
  ctx.fillStyle = gameMode === 'TRAINING' ? '#38bdf8' : timer <= 15 ? '#ef4444' : '#facc15';
  ctx.fillText(gameMode === 'TRAINING' ? '∞' : String(timer).padStart(2, '0'), canvas.width / 2, 53);

  if (gameMode === 'TRAINING') {
    ctx.save();
    ctx.fillStyle = 'rgba(9, 9, 11, 0.84)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.fillRect(canvas.width / 2 - 125, 72, 250, 46);
    ctx.strokeRect(canvas.width / 2 - 125, 72, 250, 46);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 11px Courier New';
    ctx.fillText(`LAST HIT: ${trainingStats.lastHitDamage}  |  COMBO DMG: ${trainingStats.comboDamage}`, canvas.width / 2, 91);
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '10px Courier New';
    ctx.fillText('[F1] Hitbox  [F2] Reset  [F3] Dummy Mode', canvas.width / 2, 108);
    ctx.restore();
  }

  if (p1Combo.count >= 2 && p1Combo.timer > 0) {
    ctx.save();
    ctx.textAlign = 'left';
    ctx.fillStyle = '#facc15';
    ctx.shadowColor = '#ea580c';
    ctx.shadowBlur = 12;
    ctx.font = 'italic bold 28px Courier New';
    ctx.fillText(`${p1Combo.count} HITS!`, 45, 165);
    ctx.restore();
  }
  if (p2Combo.count >= 2 && p2Combo.timer > 0) {
    ctx.save();
    ctx.textAlign = 'right';
    ctx.fillStyle = '#f97316';
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 12;
    ctx.font = 'italic bold 28px Courier New';
    ctx.fillText(`${p2Combo.count} HITS!`, canvas.width - 45, 165);
    ctx.restore();
  }

  const p1TotalHp = p1.hp + (p1Partner ? p1Partner.hp : 0);
  const p2TotalHp = p2.hp + (p2Partner ? p2Partner.hp : 0);
  if (gameMode !== 'TRAINING' && !roundOver && ((p1TotalHp > 0 && p1TotalHp <= 220) || (p2TotalHp > 0 && p2TotalHp <= 220))) {
    if (Math.floor(Date.now() / 220) % 2 === 0) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#991b1b';
      ctx.shadowBlur = 20;
      ctx.font = 'italic bold 36px Courier New';
      ctx.fillText('FINISH HIM!', canvas.width / 2, 150);
      ctx.restore();
    }
  }

  if (introTimer > 0) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = introTimer > 25 ? '#facc15' : '#ef4444';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 16;
    ctx.font = 'italic bold 52px Courier New';
    ctx.fillText(introTimer > 25 ? 'TAG DUEL' : 'FIGHT!', canvas.width / 2, 260);
    ctx.restore();
  }

  ctx.fillStyle = '#a1a1aa';
  ctx.font = '12px Courier New';
  ctx.textAlign = 'center';
  ctx.fillText(
    '[F1] Hitbox  •  [S+E]/[↓+,] Tag Counter (1 Bar)  •  [TAB] Move List  •  [ESC] Ganti Tim',
    canvas.width / 2,
    canvas.height - 14
  );

  if (gameMode !== 'TRAINING' && (p1TotalHp <= 0 || p2TotalHp <= 0 || timer <= 0)) {
    roundOver = true;
    const winner = p1TotalHp > p2TotalHp ? 'PLAYER 1 TEAM' : p2TotalHp > p1TotalHp ? (gameMode === '1P' ? 'CPU / AI TEAM' : 'PLAYER 2 TEAM') : 'DRAW';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.78)';
    ctx.fillRect(0, 190, canvas.width, 155);

    ctx.fillStyle = '#ef4444';
    ctx.font = 'italic bold 22px Courier New';
    ctx.fillText('RAGNAROK TAG FINISH!', canvas.width / 2, 228);

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 42px Courier New';
    ctx.fillText(winner === 'DRAW' ? 'DOUBLE KO!' : `${winner} WINS!`, canvas.width / 2, 276);

    ctx.fillStyle = '#e4e4e7';
    ctx.font = '14px Courier New';
    ctx.fillText('Tekan [ENTER] Rematch  •  Tekan [ESC] Character Select', canvas.width / 2, 318);
  }
}

function gameLoop() {
  requestAnimationFrame(gameLoop);

  if (currentScreen === 'TITLE') {
    ScreenUI.drawTitleScreen(ctx, canvas, titleMenuIndex, selectingDifficulty, difficultyIndex);
    return;
  }

  if (currentScreen === 'SELECT') {
    ScreenUI.drawCharacterSelect(ctx, canvas, fightersData, selectState, gameMode, DIFFICULTY_LIST[difficultyIndex]);
    return;
  }

  if (isPausedMoveList) {
    ScreenUI.drawMoveListOverlay(ctx, canvas, getP1(), getP2());
    return;
  }

  if (hitstop > 0) {
    hitstop--;
    return;
  }

  if (introTimer > 0) introTimer--;
  if (p1TagCooldown > 0) p1TagCooldown--;
  if (p2TagCooldown > 0) p2TagCooldown--;
  if (p1Combo.timer > 0) { p1Combo.timer--; if (p1Combo.timer === 0) p1Combo.count = 0; }
  if (p2Combo.timer > 0) { p2Combo.timer--; if (p2Combo.timer === 0) p2Combo.count = 0; }

  const p1 = getP1();
  const p2 = getP2();

  if (!roundOver) {
    if (gameMode !== 'TRAINING' && introTimer <= 20) {
      timerTick++;
      if (timerTick >= 60 && timer > 0) {
        timer--;
        timerTick = 0;
      }
    }
    handleControls();
    p1.update(GROUND_Y, canvas.width, p2);
    p2.update(GROUND_Y, canvas.width, p1);

    const p1Partner = getP1Partner();
    const p2Partner = getP2Partner();
    if (p1Partner) p1Partner.recoverBenchRedHp();
    if (p2Partner) p2Partner.recoverBenchRedHp();

    updateScheduledProjectilesAndHorses();
    checkCombat();

    if (p1.hp <= 0 && p1Partner && p1Partner.hp > 0) {
      switchCharacter(1, true);
    }
    if (p2.hp <= 0 && p2Partner && p2Partner.hp > 0) {
      switchCharacter(2, true);
    }
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
  StickmanRenderer.draw(ctx, getP1(), GROUND_Y);
  StickmanRenderer.draw(ctx, getP2(), GROUND_Y);
  drawProjectilesAndHorses();

  if (showHitboxes) {
    StickmanRenderer.drawHitboxOverlay(ctx, getP1(), 'P1');
    StickmanRenderer.drawHitboxOverlay(ctx, getP2(), 'P2');
  }

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
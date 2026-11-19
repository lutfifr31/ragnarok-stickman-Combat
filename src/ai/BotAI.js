import { BALANCE } from '../data/balance.js';

export class BotAI {
  constructor() {
    this.difficulty = 'NORMAL';
    this.config = BALANCE.BOT_DIFFICULTY.NORMAL;
    this.decisionTimer = 0;
    this.currentAction = 'idle';
    this.moveDir = 0;

    // Antrean reaksi berbasis reactionDelay
    this.pendingReaction = null;
    this.reactionCountdown = 0;
    this.lastOpponentState = 'idle';
  }

  setDifficulty(level) {
    const key = BALANCE.BOT_DIFFICULTY[level] ? level : 'NORMAL';
    this.difficulty = key;
    this.config = BALANCE.BOT_DIFFICULTY[key];
    this.resetState();
  }

  resetState() {
    this.decisionTimer = 0;
    this.currentAction = 'idle';
    this.moveDir = 0;
    this.pendingReaction = null;
    this.reactionCountdown = 0;
    this.lastOpponentState = 'idle';
  }

  detectThreat(bot, opponent, projectiles, dist) {
    // 1. Cek proyektil musuh yang mengarah ke bot
    for (const proj of projectiles) {
      if (proj.ownerSide === 2) continue;
      const dx = bot.x + bot.width / 2 - (proj.x + proj.width / 2);
      const movingTowardBot = (dx > 0 && proj.vx > 0) || (dx < 0 && proj.vx < 0);
      if (movingTowardBot && Math.abs(dx) < 240) {
        return { type: 'projectile', distance: Math.abs(dx) };
      }
    }

    // 2. Cek serangan melee / skill aktif lawan dalam jarak dekat
    const offensiveStates = ['attack', 'kick', 'special', 'skill2', 'tag_counter'];
    if (offensiveStates.includes(opponent.state) && dist < 145) {
      return { type: 'melee', distance: dist };
    }

    return null;
  }

  chooseDefensiveReaction(threat, bot, opponent, groundY, onTagCounter) {
    const cfg = this.config;
    const dirAway = opponent.x > bot.x ? -1 : 1;

    // HARD dapat memakai Tag Counter saat sedang block & meter >= 100
    if (
      cfg.useTagCounter &&
      bot.state === 'block' &&
      threat.type === 'melee' &&
      typeof onTagCounter === 'function'
    ) {
      if (onTagCounter()) {
        this.currentAction = 'idle';
        return;
      }
    }

    if (threat.type === 'projectile') {
      if (cfg.useRoll && bot.rollCooldown === 0 && Math.random() < cfg.evadeChance) {
        bot.roll(-dirAway);
        return;
      }
      if (bot.y + bot.height >= groundY && Math.random() < cfg.evadeChance) {
        bot.vy = -16;
        bot.vx = -dirAway * bot.speed;
        return;
      }
      if (Math.random() < cfg.blockChance) {
        this.currentAction = 'block';
        this.decisionTimer = 16;
      }
      return;
    }

    if (threat.type === 'melee') {
      if (cfg.useRoll && bot.rollCooldown === 0 && Math.random() < cfg.evadeChance * 0.65) {
        bot.roll(dirAway);
        return;
      }
      if (Math.random() < cfg.blockChance) {
        this.currentAction = 'block';
        this.decisionTimer = 18;
      }
    }
  }

  update(bot, partner, opponent, groundY, context) {
    const {
      projectiles = [],
      onSpecial,
      onSkill2,
      onDash,
      onSwitch,
      onTagCounter,
      teamMeter = 0,
    } = context;

    const lockedStates = ['attack', 'kick', 'special', 'skill2', 'tag_counter', 'dash', 'roll', 'stun', 'ko'];
    if (lockedStates.includes(bot.state)) {
      this.lastOpponentState = opponent.state;
      return;
    }

    const cfg = this.config;
    const dist = Math.abs(opponent.x - bot.x);
    const dirToOpponent = opponent.x > bot.x ? 1 : -1;

    // Auto-switch taktis saat HP kritis
    if (partner && partner.hp > 0 && bot.hp < bot.maxHp * cfg.tagHpThreshold && Math.random() < 0.015) {
      if (onSwitch && onSwitch()) return;
    }

    // Deteksi Whiff Punish (lawan baru saja selesai skill / serangan tanpa mengenai bot)
    const wasSkill = ['special', 'skill2'].includes(this.lastOpponentState);
    if (wasSkill && opponent.state === 'idle' && dist < 160 && Math.random() < cfg.punishWhiffChance) {
      this.pendingReaction = null;
      if (bot.skill2Cooldown === 0 && dist < 110) {
        onSkill2();
      } else if (dist > 85 && bot.dashCooldown === 0) {
        onDash(dirToOpponent);
      } else {
        bot.attack();
      }
      this.lastOpponentState = opponent.state;
      return;
    }
    this.lastOpponentState = opponent.state;

    // Deteksi Ancaman Reaktif dengan reactionDelay
    const threat = this.detectThreat(bot, opponent, projectiles, dist);
    if (threat) {
      if (!this.pendingReaction) {
        this.pendingReaction = threat;
        this.reactionCountdown = cfg.reactionDelay;
      }
    } else {
      this.pendingReaction = null;
      this.reactionCountdown = 0;
    }

    if (this.pendingReaction) {
      if (this.reactionCountdown > 0) {
        this.reactionCountdown--;
      } else {
        const activeThreat = this.pendingReaction;
        this.pendingReaction = null;
        this.chooseDefensiveReaction(
          activeThreat,
          bot,
          opponent,
          groundY,
          teamMeter >= BALANCE.METER_BAR_COST ? onTagCounter : null
        );
      }
    }

    // Eksekusi aksi berjalan jika masih dalam timer
    if (this.decisionTimer > 0) {
      this.decisionTimer--;
      if (this.currentAction === 'block') {
        bot.state = 'block';
        bot.vx = 0;
      } else if (this.currentAction === 'approach') {
        bot.vx = dirToOpponent * bot.speed * 1.15;
        bot.state = 'walk';
      } else if (this.currentAction === 'retreat') {
        bot.vx = -dirToOpponent * bot.speed;
        bot.state = 'walk';
      } else {
        bot.vx = 0;
        bot.state = 'idle';
      }
      return;
    }

    // Pilih keputusan ofensif berikutnya
    const roll = Math.random();
    this.decisionTimer = Math.max(8, Math.floor(14 + Math.random() * 14));

    if (dist > 300) {
      if (bot.specialCooldown === 0 && roll < cfg.skillChance) {
        onSpecial();
        this.currentAction = 'idle';
      } else if (bot.dashCooldown === 0 && roll < cfg.skillChance + 0.25) {
        onDash(dirToOpponent);
        this.currentAction = 'approach';
      } else {
        this.currentAction = 'approach';
      }
    } else if (dist > 105) {
      if (bot.skill2Cooldown === 0 && roll < cfg.skillChance * 0.7) {
        onSkill2();
        this.currentAction = 'idle';
      } else if (bot.specialCooldown === 0 && roll < cfg.skillChance) {
        onSpecial();
        this.currentAction = 'idle';
      } else if (bot.dashCooldown === 0 && roll < 0.78) {
        onDash(dirToOpponent);
        this.currentAction = 'approach';
      } else {
        this.currentAction = 'approach';
      }
    } else {
      // Jarak dekat: eksekusi kombo sesuai batas maxComboChain per level
      if (bot.skill2Cooldown === 0 && roll < cfg.skillChance * 0.5) {
        onSkill2();
        this.currentAction = 'idle';
      } else if (roll < 0.78) {
        const useKick = bot.comboStep >= 2 && Math.random() < 0.55;
        if (useKick) bot.kick();
        else bot.attack();

        if (bot.comboStep < cfg.maxComboChain) {
          this.decisionTimer = 5;
        }
        this.currentAction = 'idle';
      } else {
        this.currentAction = 'retreat';
      }
    }
  }
}
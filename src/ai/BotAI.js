export class BotAI {
  constructor() {
    this.decisionTimer = 0;
    this.intent = 'idle'; // approach, retreat, block, idle
  }

  update(bot, player, groundY, onCastSpecial, onCastSkill2, onDash, onRoll) {
    if (bot.state === 'ko' || player.state === 'ko') return;

    const dx = player.x - bot.x;
    const dist = Math.abs(dx);
    const dirToPlayer = dx >= 0 ? 1 : -1;
    const busyStates = ['attack', 'kick', 'special', 'skill2', 'dash', 'roll'];

    this.decisionTimer--;

    // Reaksi cepat jika pemain menembakkan jurus atau menyerang jarak dekat
    if (!busyStates.includes(bot.state)) {
      if (['attack', 'kick', 'skill2'].includes(player.state) && dist < 110 && Math.random() < 0.08) {
        bot.state = 'block';
        this.decisionTimer = 18;
        return;
      }

      if (player.state === 'special' && dist > 160 && bot.rollCooldown === 0 && Math.random() < 0.06) {
        if (onRoll(dirToPlayer)) return;
      }
    }

    // Ambil keputusan taktis berkala
    if (this.decisionTimer <= 0) {
      this.decisionTimer = 14 + Math.floor(Math.random() * 14);
      const rand = Math.random();

      if (dist > 340) {
        if (bot.specialCooldown === 0 && rand < 0.45) {
          onCastSpecial();
          return;
        }
        if (bot.dashCooldown === 0 && rand < 0.7) {
          onDash(dirToPlayer);
          return;
        }
        this.intent = 'approach';
      } else if (dist > 115) {
        if (bot.specialCooldown === 0 && rand < 0.25) {
          onCastSpecial();
          return;
        }
        this.intent = rand < 0.78 ? 'approach' : 'idle';
      } else {
        // Jarak pukul dekat
        if (bot.skill2Cooldown === 0 && rand < 0.22) {
          onCastSkill2();
          return;
        }
        if (rand < 0.55) {
          bot.attack();
          this.intent = 'idle';
          return;
        }
        if (rand < 0.78) {
          bot.kick();
          this.intent = 'idle';
          return;
        }
        this.intent = rand < 0.9 ? 'block' : 'retreat';
      }
    }

    // Eksekusi pergerakan berdasarkan intent
    if (!busyStates.includes(bot.state)) {
      bot.vx = 0;
      if (this.intent === 'approach') {
        bot.vx = dirToPlayer * bot.speed * 1.1;
        bot.state = 'walk';
      } else if (this.intent === 'retreat') {
        bot.vx = -dirToPlayer * bot.speed * 0.95;
        bot.state = 'walk';
      } else if (this.intent === 'block') {
        bot.state = 'block';
      } else {
        bot.state = 'idle';
      }

      if (player.y + player.height < groundY - 50 && bot.y + bot.height >= groundY && Math.random() < 0.02) {
        bot.vy = -16;
      }
    }
  }
}
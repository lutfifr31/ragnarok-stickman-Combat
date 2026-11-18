export class FighterBase {
  constructor({ data, x, y, facing }) {
    this.id = data.id;
    this.name = data.name;
    this.era = data.era;
    this.visuals = data.visuals;
    this.specialMove = data.specialMove;
    this.maxHp = data.stats.hp;
    this.hp = data.stats.hp;
    this.speed = data.stats.speed;
    this.power = data.stats.power;

    this.x = x;
    this.y = y;
    this.width = 50;
    this.height = 145;
    this.vx = 0;
    this.vy = 0;
    this.facing = facing; // 1 = kanan, -1 = kiri

    // State: idle, walk, dash, roll, attack, kick, special, skill2, block, ko
    this.state = 'idle';
    this.walkPhase = 0; // Fase langkah kaki kumulatif agar menapak natural
    this.comboStep = 0; // 1 = Jab, 2 = Cross, 3 = Heavy Hook/Elbow, 4 = Uppercut Finisher
    this.comboResetTimer = 0;
    this.queuedNextAttack = false;

    this.actionTimer = 0;
    this.attackFrame = 0;
    this.attackCooldown = 0;
    this.dashCooldown = 0;
    this.rollCooldown = 0;
    this.specialCooldown = 0;
    this.skill2Cooldown = 0;
    this.maxSpecialCooldown = 180;
    this.maxSkill2Cooldown = 300;
    this.hasHitThisSwing = false;
    this.xrayTimer = 0;
    this.invulnerable = false;
    this.afterimages = [];
  }

  update(groundY, canvasWidth, opponent) {
    if (this.xrayTimer > 0) this.xrayTimer--;

    for (let i = this.afterimages.length - 1; i >= 0; i--) {
      this.afterimages[i].alpha -= 0.08;
      if (this.afterimages[i].alpha <= 0) this.afterimages.splice(i, 1);
    }

    if (this.hp <= 0) {
      this.hp = 0;
      this.state = 'ko';
      return;
    }

    const busyStates = ['attack', 'kick', 'special', 'skill2', 'dash', 'roll'];

    // Hadap lawan otomatis jika di tanah & tidak terkunci animasi
    if (this.y + this.height >= groundY && !busyStates.includes(this.state)) {
      this.facing = opponent.x >= this.x ? 1 : -1;
    }

    // Gravitasi
    this.vy += this.state === 'dash' ? 0.25 : 0.85;
    this.x += this.vx;
    this.y += this.vy;

    // Lantai arena
    if (this.y + this.height >= groundY) {
      this.y = groundY - this.height;
      this.vy = 0;
    }

    // Batas dinding arena
    if (this.x < 30) this.x = 30;
    if (this.x + this.width > canvasWidth - 30) this.x = canvasWidth - 30 - this.width;

    // Perbarui fase langkah kaki berdasarkan kecepatan aktual (mencegah kaki terseret)
    if (this.state === 'walk' && this.y + this.height >= groundY) {
      this.walkPhase += Math.abs(this.vx) * 0.055;
    } else if (this.state === 'idle') {
      this.walkPhase = 0;
    }

    // Jendela waktu penyambungan kombo 4-hit
    if (this.comboResetTimer > 0) {
      this.comboResetTimer--;
      if (this.comboResetTimer === 0 && this.state !== 'attack') {
        this.comboStep = 0;
      }
    }

    // Penanganan durasi aksi
    if (this.state === 'dash') {
      this.actionTimer--;
      if (this.actionTimer % 2 === 0) {
        this.afterimages.push({ x: this.x, y: this.y, facing: this.facing, alpha: 0.55 });
      }
      if (this.actionTimer <= 0) {
        this.state = 'idle';
        this.vx = 0;
      }
    } else if (this.state === 'roll') {
      this.actionTimer--;
      this.invulnerable = true;
      if (this.actionTimer % 3 === 0) {
        this.afterimages.push({ x: this.x, y: this.y + 30, facing: this.facing, alpha: 0.4 });
      }
      if (this.actionTimer <= 0) {
        this.state = 'idle';
        this.vx = 0;
        this.invulnerable = false;
      }
    } else if (this.state === 'attack') {
      this.attackFrame++;
      // Gesekan langkah maju saat memukul agar berhenti mulus
      this.vx *= 0.72;

      const maxFrames = this.comboStep === 4 ? 18 : 13;
      if (this.attackFrame > maxFrames) {
        if (this.queuedNextAttack && this.comboStep < 4) {
          this.queuedNextAttack = false;
          this.startComboHit(this.comboStep + 1);
        } else {
          this.state = 'idle';
          this.attackFrame = 0;
          this.hasHitThisSwing = false;
          this.queuedNextAttack = false;
          if (this.comboStep >= 4) this.comboStep = 0;
        }
      }
    } else if (['kick', 'special', 'skill2'].includes(this.state)) {
      this.attackFrame++;
      if (this.state === 'kick') this.vx *= 0.75;
      const maxFrames = this.state === 'skill2' ? 22 : this.state === 'kick' ? 18 : 15;
      if (this.attackFrame > maxFrames) {
        this.state = 'idle';
        this.attackFrame = 0;
        this.hasHitThisSwing = false;
      }
    }

    if (this.attackCooldown > 0) this.attackCooldown--;
    if (this.dashCooldown > 0) this.dashCooldown--;
    if (this.rollCooldown > 0) this.rollCooldown--;
    if (this.specialCooldown > 0) this.specialCooldown--;
    if (this.skill2Cooldown > 0) this.skill2Cooldown--;
  }

  startComboHit(step) {
    this.state = 'attack';
    this.comboStep = step;
    this.comboResetTimer = 42; // 0.7 detik jendela tekan tombol berikutnya
    this.attackFrame = 0;
    this.hasHitThisSwing = false;
    // Sedikit dorongan langkah maju tiap pukulan seperti Tekken
    this.vx = this.facing * (step === 4 ? 7.5 : 4.5);
  }

  attack() {
    const unavailable = ['kick', 'special', 'skill2', 'roll', 'ko'];
    if (unavailable.includes(this.state)) return;

    // Jika sedang memukul dan tombol ditekan lagi di tengah ayunan -> antrekan hit berikutnya (1->2->3->4)
    if (this.state === 'attack') {
      if (this.attackFrame >= 4 && this.comboStep < 4) {
        this.queuedNextAttack = true;
      }
      return;
    }

    if (this.attackCooldown === 0) {
      const nextStep = this.comboResetTimer > 0 && this.comboStep < 4 ? this.comboStep + 1 : 1;
      this.startComboHit(nextStep);
      this.attackCooldown = 6;
    }
  }

  dash(dir = this.facing) {
    const busy = ['attack', 'kick', 'special', 'skill2', 'dash', 'roll', 'ko'];
    if (this.dashCooldown === 0 && !busy.includes(this.state)) {
      this.state = 'dash';
      this.actionTimer = 10;
      this.dashCooldown = 32;
      this.vx = dir * 18;
      return true;
    }
    return false;
  }

  roll(dir = this.facing) {
    const busy = ['attack', 'kick', 'special', 'skill2', 'dash', 'roll', 'ko'];
    if (this.rollCooldown === 0 && !busy.includes(this.state)) {
      this.state = 'roll';
      this.actionTimer = 16;
      this.rollCooldown = 45;
      this.invulnerable = true;
      this.vx = dir * 13;
      return true;
    }
    return false;
  }

  kick() {
    const busy = ['attack', 'kick', 'special', 'skill2', 'roll', 'ko'];
    if (this.attackCooldown === 0 && !busy.includes(this.state)) {
      this.state = 'kick';
      this.attackFrame = 0;
      this.attackCooldown = 26;
      this.hasHitThisSwing = false;
      this.vx = this.facing * 5;
      this.comboStep = 0;
    }
  }

  castSpecial() {
    const busy = ['special', 'skill2', 'roll', 'ko'];
    if (this.specialCooldown === 0 && !busy.includes(this.state)) {
      this.state = 'special';
      this.attackFrame = 0;
      this.specialCooldown = this.maxSpecialCooldown;
      this.comboStep = 0;
      return {
        ownerId: this.id,
        name: this.specialMove.name,
        x: this.facing === 1 ? this.x + this.width + 10 : this.x - 45,
        y: this.y + 42,
        width: 38,
        height: 28,
        vx: this.facing * 13,
        damage: this.specialMove.damage,
        color: this.visuals.rimColor,
        facing: this.facing,
      };
    }
    return null;
  }

  castSkill2() {
    const busy = ['special', 'skill2', 'roll', 'ko'];
    if (this.skill2Cooldown === 0 && !busy.includes(this.state)) {
      this.state = 'skill2';
      this.attackFrame = 0;
      this.skill2Cooldown = this.maxSkill2Cooldown;
      this.hasHitThisSwing = false;
      this.comboStep = 0;
      if (this.id === 'kishimoto') {
        this.vx = this.facing * 14;
      }
      return this.id === 'edison' ? 'DC ARC SURGE!' : 'MANGA PANEL SLASH!';
    }
    return null;
  }

  getHitbox() {
    if (this.state === 'attack' && this.attackFrame >= 3 && this.attackFrame <= 9) {
      const step = this.comboStep || 1;
      const mult = step === 4 ? 1.5 : step === 3 ? 1.25 : step === 2 ? 1.1 : 1.0;
      const reach = step === 4 ? 64 : step === 3 ? 60 : 56;
      return {
        x: this.facing === 1 ? this.x + this.width - 4 : this.x - reach + 4,
        y: step === 4 ? this.y + 20 : this.y + 38,
        width: reach,
        height: step === 4 ? 50 : 34,
        damage: Math.floor(this.power * mult),
        knockback: step === 4 ? 16 : step === 3 ? 9 : 5,
        launchY: step === 4 ? -9 : 0, // Hit ke-4 melontarkan lawan sedikit ke atas!
        isXray: step === 4,
      };
    }
    if (this.state === 'kick' && this.attackFrame >= 5 && this.attackFrame <= 12) {
      return {
        x: this.facing === 1 ? this.x + this.width - 5 : this.x - 72,
        y: this.y + 65,
        width: 72,
        height: 36,
        damage: Math.floor(this.power * 1.25),
        knockback: 14,
        launchY: 0,
        isXray: false,
      };
    }
    if (this.state === 'skill2' && this.attackFrame >= 6 && this.attackFrame <= 16) {
      if (this.id === 'edison') {
        return {
          x: this.x - 65,
          y: this.y + 10,
          width: this.width + 130,
          height: 120,
          damage: 145,
          knockback: 18,
          launchY: -7,
          isXray: true,
        };
      } else {
        return {
          x: this.facing === 1 ? this.x + 10 : this.x - 115,
          y: this.y + 15,
          width: 115,
          height: 115,
          damage: 140,
          knockback: 16,
          launchY: -6,
          isXray: true,
        };
      }
    }
    return null;
  }

  takeDamage(amount, triggerXray = false) {
    if (this.state === 'ko' || this.invulnerable) return 0;
    const isBlocking = this.state === 'block';
    const finalDamage = isBlocking ? Math.floor(amount * 0.2) : amount;
    this.hp = Math.max(0, this.hp - finalDamage);

    if ((!isBlocking && triggerXray) || this.hp === 0) {
      this.xrayTimer = 28;
    }
    return finalDamage;
  }
}
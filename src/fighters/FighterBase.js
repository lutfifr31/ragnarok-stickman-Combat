import { BALANCE } from '../data/balance.js';

export class FighterBase {
  constructor({ data, x, y, facing }) {
    this.id = data.id;
    this.name = data.name;
    this.era = data.era;
    this.faction = data.faction;
    this.archetype = data.archetype;
    this.visuals = data.visuals;
    this.skills = data.skills;

    this.maxHp = data.stats.hp;
    this.hp = data.stats.hp;
    this.redHp = 0;
    this.baseSpeed = data.stats.speed;
    this.basePower = data.stats.power;
    this.baseReachBonus = data.stats.reachBonus || 0;
    this.speed = this.baseSpeed;
    this.power = this.basePower;
    this.reachBonus = this.baseReachBonus;

    // State khusus karakter
    this.weaponMode = 'saber'; // 'saber' (long) | 'epee' (short & fast) untuk Napoleon
    this.mountTimer = 0; // Durasi tunggangi kuda (240 frame = 4 detik)

    this.x = x;
    this.y = y;
    this.width = 50;
    this.height = 145;
    this.vx = 0;
    this.vy = 0;
    this.facing = facing;

    this.state = 'idle';
    this.walkPhase = 0;

    this.comboStep = 0;
    this.comboChain = [];
    this.comboResetTimer = 0;
    this.queuedNextMove = null;

    this.actionTimer = 0;
    this.attackFrame = 0;
    this.attackCooldown = 0;
    this.dashCooldown = 0;
    this.rollCooldown = 0;
    this.specialCooldown = 0;
    this.skill2Cooldown = 0;
    this.maxSpecialCooldown = this.skills?.skill1?.cooldown ?? BALANCE.DEFAULT_SKILL1_COOLDOWN;
    this.maxSkill2Cooldown = this.skills?.skill2?.cooldown ?? BALANCE.DEFAULT_SKILL2_COOLDOWN;

    this.hitIdsThisSwing = new Set();
    this.activeModifiers = new Set();

    this.xrayTimer = 0;
    this.stunTimer = 0;
    this.stunImmuneTimer = 0;
    this.invulnerable = false;
    this.invulnTimer = 0;
    this.afterimages = [];
  }

  get comboSignature() {
    return this.comboChain.join('-');
  }

  hasModifier(modName) {
    return this.activeModifiers.has(modName);
  }

  registerModifierHook(modName) {
    if (modName) this.activeModifiers.add(modName);
  }

  clearModifierHook(modName) {
    this.activeModifiers.delete(modName);
  }

  resetSwingHits() {
    this.hitIdsThisSwing.clear();
  }

  hasHitId(hitId) {
    return this.hitIdsThisSwing.has(hitId);
  }

  markHitId(hitId) {
    this.hitIdsThisSwing.add(hitId);
  }

  toggleWeaponStance() {
    if (this.weaponMode === 'saber') {
      this.weaponMode = 'epee';
      this.reachBonus = 6;
      this.speed = this.baseSpeed * 1.22;
      this.power = Math.floor(this.basePower * 0.94);
    } else {
      this.weaponMode = 'saber';
      this.reachBonus = 24;
      this.speed = this.baseSpeed * 0.96;
      this.power = Math.floor(this.basePower * 1.14);
    }
    return this.weaponMode;
  }

  startMount(durationFrames = 240) {
    this.mountTimer = durationFrames;
    this.speed = this.baseSpeed * 1.38;
    this.power = Math.floor(this.basePower * 1.15);
  }

  recoverBenchRedHp() {
    if (this.hp <= 0) {
      this.redHp = 0;
      return;
    }
    if (this.redHp > 0) {
      const heal = Math.min(this.redHp, BALANCE.RED_HP_RECOVERY_PER_FRAME);
      this.hp = Math.min(this.maxHp, this.hp + heal);
      this.redHp = Math.max(0, this.redHp - heal);
      if (this.hp + this.redHp > this.maxHp) {
        this.redHp = Math.max(0, this.maxHp - this.hp);
      }
    }
  }

  startTagCounter(dirToOpponent) {
    this.state = 'tag_counter';
    this.attackFrame = 0;
    this.resetSwingHits();
    this.comboStep = 0;
    this.comboChain = [];
    this.facing = dirToOpponent;
    this.vx = dirToOpponent * 14;
    this.invulnerable = true;
    this.invulnTimer = BALANCE.TAG_COUNTER_INVULN_FRAMES;
  }

  applySkillMovement(skillDef) {
    if (!skillDef || !Array.isArray(skillDef.movement)) return;
    let matchedSegment = false;

    for (const seg of skillDef.movement) {
      if (this.attackFrame >= seg.from && this.attackFrame <= seg.to) {
        matchedSegment = true;
        if (typeof seg.vx === 'number') {
          this.vx = this.facing * seg.vx;
        } else if (typeof seg.friction === 'number' && seg.friction !== 1) {
          this.vx *= seg.friction;
        }
        if (typeof seg.vy === 'number') {
          this.vy = seg.vy;
        }
        if (seg.afterimage && this.attackFrame % 2 === 0) {
          this.afterimages.push({ x: this.x, y: this.y, facing: this.facing, alpha: 0.5 });
        }
      }
    }

    if (!matchedSegment && skillDef.movement.length > 0) {
      const lastSeg = skillDef.movement[skillDef.movement.length - 1];
      if (typeof lastSeg.friction === 'number' && lastSeg.friction !== 1) {
        this.vx *= lastSeg.friction;
      }
    }
  }

  update(groundY, canvasWidth, opponent) {
    if (this.xrayTimer > 0) this.xrayTimer--;
    if (this.stunImmuneTimer > 0) this.stunImmuneTimer--;

    // Timer Kuda Napoleon (4 detik = 240 frame)
    if (this.mountTimer > 0) {
      this.mountTimer--;
      if (this.mountTimer === 0) {
        this.speed = this.baseSpeed;
        this.power = this.basePower;
      }
    }

    if (this.invulnTimer > 0) {
      this.invulnTimer--;
      this.invulnerable = true;
      if (this.invulnTimer === 0 && this.state !== 'roll') {
        this.invulnerable = false;
      }
    }

    for (let i = this.afterimages.length - 1; i >= 0; i--) {
      this.afterimages[i].alpha -= 0.08;
      if (this.afterimages[i].alpha <= 0) this.afterimages.splice(i, 1);
    }

    if (this.hp <= 0) {
      this.hp = 0;
      this.redHp = 0;
      this.mountTimer = 0;
      this.state = 'ko';
      return;
    }

    if (this.stunTimer > 0) {
      this.stunTimer--;
      this.state = 'stun';
      this.vx *= 0.8;
      this.vy += 0.85;
      this.x += this.vx;
      this.y += this.vy;
      if (this.y + this.height >= groundY) {
        this.y = groundY - this.height;
        this.vy = 0;
      }
      if (this.x < 30) this.x = 30;
      if (this.x + this.width > canvasWidth - 30) this.x = canvasWidth - 30 - this.width;
      if (this.stunTimer === 0) {
        this.state = 'idle';
        this.stunImmuneTimer = BALANCE.STUN_IMMUNITY_FRAMES;
      }
      return;
    }

    const busyStates = ['attack', 'kick', 'special', 'skill2', 'tag_counter', 'dash', 'roll', 'stun'];

    if (this.y + this.height >= groundY && !busyStates.includes(this.state)) {
      this.facing = opponent.x >= this.x ? 1 : -1;
    }

    this.vy += this.state === 'dash' ? 0.25 : 0.85;
    this.x += this.vx;
    this.y += this.vy;

    if (this.y + this.height >= groundY) {
      this.y = groundY - this.height;
      this.vy = 0;
    }

    if (this.x < 30) this.x = 30;
    if (this.x + this.width > canvasWidth - 30) this.x = canvasWidth - 30 - this.width;

    if (this.state === 'walk' && this.y + this.height >= groundY) {
      this.walkPhase += Math.abs(this.vx) * 0.055;
    } else if (this.state === 'idle') {
      this.walkPhase = 0;
    }

    if (this.comboResetTimer > 0) {
      this.comboResetTimer--;
      if (this.comboResetTimer === 0 && this.state !== 'attack' && this.state !== 'kick') {
        this.comboStep = 0;
        this.comboChain = [];
      }
    }

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
        if (this.invulnTimer === 0) this.invulnerable = false;
      }
    } else if (this.state === 'tag_counter') {
      this.attackFrame++;
      this.vx *= 0.76;
      if (this.attackFrame % 2 === 0) {
        this.afterimages.push({ x: this.x, y: this.y, facing: this.facing, alpha: 0.6 });
      }
      if (this.attackFrame > 16) {
        this.state = 'idle';
        this.attackFrame = 0;
        this.resetSwingHits();
        this.vx = 0;
      }
    } else if (this.state === 'attack' || this.state === 'kick') {
      this.attackFrame++;
      this.vx *= 0.74;

      const maxFrames =
        this.comboStep === 4
          ? BALANCE.BASIC_FINISHER_FRAMES
          : this.state === 'kick'
            ? BALANCE.BASIC_KICK_FRAMES
            : BALANCE.BASIC_PUNCH_FRAMES;

      if (this.attackFrame > maxFrames) {
        if (this.queuedNextMove && this.comboStep < 4) {
          const nextType = this.queuedNextMove;
          this.queuedNextMove = null;
          this.executeComboMove(nextType, this.comboStep + 1);
        } else {
          this.state = 'idle';
          this.attackFrame = 0;
          this.resetSwingHits();
          this.queuedNextMove = null;
          if (this.comboStep >= 4) {
            this.comboStep = 0;
            this.comboChain = [];
          }
        }
      }
    } else if (this.state === 'special') {
      const s1 = this.skills?.skill1;
      const totalFrames = s1?.totalFrames ?? BALANCE.DEFAULT_SKILL1_FRAMES;
      this.attackFrame++;
      this.applySkillMovement(s1);

      if (this.attackFrame > totalFrames) {
        this.state = 'idle';
        this.attackFrame = 0;
        this.resetSwingHits();
        this.activeModifiers.clear();
      }
    } else if (this.state === 'skill2') {
      const s2 = this.skills?.skill2;
      const totalFrames = s2?.totalFrames ?? BALANCE.DEFAULT_SKILL2_FRAMES;
      this.attackFrame++;
      this.applySkillMovement(s2);

      if (this.attackFrame > totalFrames) {
        this.state = 'idle';
        this.attackFrame = 0;
        this.resetSwingHits();
        this.activeModifiers.clear();
        this.vx = 0;
      }
    }

    if (this.attackCooldown > 0) this.attackCooldown--;
    if (this.dashCooldown > 0) this.dashCooldown--;
    if (this.rollCooldown > 0) this.rollCooldown--;
    if (this.specialCooldown > 0) this.specialCooldown--;
    if (this.skill2Cooldown > 0) this.skill2Cooldown--;
  }

  executeComboMove(type, step) {
    if (step === 1) {
      this.comboChain = [type];
    } else {
      this.comboChain = [...this.comboChain.slice(0, step - 1), type];
    }
    this.comboStep = step;
    this.state = type === 'P' ? 'attack' : 'kick';
    this.comboResetTimer = 46;
    this.attackFrame = 0;
    this.resetSwingHits();

    const sig = this.comboSignature;
    if (step === 4) {
      this.vx = this.facing * 8.5;
      if (sig === 'P-K-K-K' || sig === 'K-K-K-K') {
        this.vy = -6.5;
      }
    } else {
      this.vx = this.facing * (type === 'K' ? 5.5 : 4.5);
    }
  }

  triggerComboInput(type) {
    const unavailable = ['special', 'skill2', 'tag_counter', 'roll', 'stun', 'ko'];
    if (unavailable.includes(this.state)) return;

    if (this.state === 'attack' || this.state === 'kick') {
      if (this.attackFrame >= 3 && this.comboStep < 4) {
        this.queuedNextMove = type;
      }
      return;
    }

    if (this.attackCooldown === 0) {
      const nextStep = this.comboResetTimer > 0 && this.comboStep < 4 ? this.comboStep + 1 : 1;
      this.executeComboMove(type, nextStep);
      this.attackCooldown = 5;
    }
  }

  attack() {
    this.triggerComboInput('P');
  }

  kick() {
    this.triggerComboInput('K');
  }

  dash(dir = this.facing) {
    const busy = ['attack', 'kick', 'special', 'skill2', 'tag_counter', 'dash', 'roll', 'stun', 'ko'];
    if (this.dashCooldown === 0 && !busy.includes(this.state)) {
      this.state = 'dash';
      this.actionTimer = BALANCE.DASH_DURATION;
      this.dashCooldown = BALANCE.DASH_COOLDOWN;
      this.vx = dir * 18;
      this.comboStep = 0;
      this.comboChain = [];
      return true;
    }
    return false;
  }

  roll(dir = this.facing) {
    const busy = ['attack', 'kick', 'special', 'skill2', 'tag_counter', 'dash', 'roll', 'stun', 'ko'];
    if (this.rollCooldown === 0 && !busy.includes(this.state)) {
      this.state = 'roll';
      this.actionTimer = BALANCE.ROLL_DURATION;
      this.rollCooldown = BALANCE.ROLL_COOLDOWN;
      this.invulnerable = true;
      this.vx = dir * 13;
      this.comboStep = 0;
      this.comboChain = [];
      return true;
    }
    return false;
  }

  castSpecial(ownerSide = 1) {
    const busy = ['special', 'skill2', 'tag_counter', 'roll', 'stun', 'ko'];
    const s1 = this.skills?.skill1;
    if (!s1) return null;

    if (this.specialCooldown === 0 && !busy.includes(this.state)) {
      this.state = 'special';
      this.attackFrame = 0;
      this.specialCooldown = s1.cooldown;
      this.resetSwingHits();
      this.comboStep = 0;
      this.comboChain = [];

      if (Array.isArray(s1.modifiers)) {
        s1.modifiers.forEach((m) => this.registerModifierHook(m));
      }

      // Modifier ganti pedang Napoleon (Saber <-> Epée)
      if (this.hasModifier('weaponSwitch')) {
        const newMode = this.toggleWeaponStance();
        return {
          name: `SWITCH: ${newMode === 'saber' ? 'NAPOLEON SABER' : 'EPÉE BLADE'}`,
          color: this.visuals.rimColor,
          isMeleeSkill: true,
        };
      }

      if (s1.projectile) {
        const p = s1.projectile;
        return {
          ownerSide,
          ownerId: this.id,
          name: s1.name,
          vfx: s1.vfx || 'electric_orb',
          x: this.facing === 1 ? this.x + this.width + 10 : this.x - (p.width ?? 38) - 10,
          y: this.y + (p.height > 50 ? 28 : 42),
          width: p.width ?? BALANCE.PROJECTILE_WIDTH,
          height: p.height ?? BALANCE.PROJECTILE_HEIGHT,
          vx: this.facing * (p.speed ?? BALANCE.PROJECTILE_SPEED),
          vy: p.vy ?? 0,
          gravity: p.gravity ?? 0,
          damage: p.damage,
          stunDuration: p.stun ?? 0,
          color: this.visuals.rimColor,
          facing: this.facing,
        };
      }
      return { name: s1.name, color: this.visuals.rimColor, isMeleeSkill: true };
    }
    return null;
  }

  castSkill2() {
    const busy = ['special', 'skill2', 'tag_counter', 'roll', 'stun', 'ko'];
    const s2 = this.skills?.skill2;
    if (!s2) return null;

    if (this.skill2Cooldown === 0 && !busy.includes(this.state)) {
      this.state = 'skill2';
      this.attackFrame = 0;
      this.skill2Cooldown = s2.cooldown;
      this.resetSwingHits();
      this.comboStep = 0;
      this.comboChain = [];

      if (Array.isArray(s2.modifiers)) {
        s2.modifiers.forEach((m) => this.registerModifierHook(m));
      }

      return {
        name: s2.name,
        summonMount: this.hasModifier('summonMount'),
      };
    }
    return null;
  }

  resolveSkillHitbox(skillDef) {
    if (!skillDef || !Array.isArray(skillDef.hitboxes)) return null;

    for (let i = 0; i < skillDef.hitboxes.length; i++) {
      const hb = skillDef.hitboxes[i];
      if (this.attackFrame >= hb.from && this.attackFrame <= hb.to) {
        const hitId = hb.hitId || `${this.id}_${this.state}_${i}`;
        if (this.hasHitId(hitId)) continue;

        const offsetX = hb.offsetX ?? -5;
        return {
          hitId,
          x: this.facing === 1 ? this.x + this.width + offsetX : this.x - hb.width - offsetX,
          y: this.y + (hb.offsetY ?? 20),
          width: hb.width,
          height: hb.height,
          damage: hb.damage,
          knockback: hb.knockback ?? 10,
          launchY: hb.launchY ?? 0,
          isXray: Boolean(hb.isXray),
          isFinisher: false,
          stunDuration: hb.stun ?? 0,
        };
      }
    }
    return null;
  }

  getHitbox() {
    const step = this.comboStep || 1;
    const sig = this.comboSignature;
    const isFinisher = step === 4;

    if (this.state === 'tag_counter' && this.attackFrame >= 2 && this.attackFrame <= 12) {
      const hitId = 'tag_counter_strike';
      if (this.hasHitId(hitId)) return null;
      const w = BALANCE.TAG_COUNTER_HITBOX_WIDTH;
      return {
        hitId,
        x: this.facing === 1 ? this.x + this.width - 10 : this.x - w + 10,
        y: this.y + 18,
        width: w,
        height: BALANCE.TAG_COUNTER_HITBOX_HEIGHT,
        damage: BALANCE.TAG_COUNTER_DAMAGE,
        knockback: BALANCE.TAG_COUNTER_KNOCKBACK,
        launchY: BALANCE.TAG_COUNTER_LAUNCH_Y,
        isXray: false,
        isFinisher: false,
        stunDuration: 0,
      };
    }

    if (
      this.state === 'attack' &&
      this.attackFrame >= BALANCE.PUNCH_ACTIVE_FROM &&
      this.attackFrame <= BALANCE.PUNCH_ACTIVE_TO
    ) {
      const hitId = `basic_P_${step}`;
      if (this.hasHitId(hitId)) return null;

      const mult = isFinisher ? 1.55 : step === 3 ? 1.25 : step === 2 ? 1.1 : 1.0;
      const reach = (isFinisher ? 66 : step === 3 ? 60 : 56) + this.reachBonus;

      return {
        hitId,
        x: this.facing === 1 ? this.x + this.width - 4 : this.x - reach + 4,
        y: isFinisher ? this.y + 20 : this.y + 38,
        width: reach,
        height: isFinisher ? 52 : 34,
        damage: Math.floor(this.power * mult),
        knockback: isFinisher ? 17 : step === 3 ? 9 : 5,
        launchY: isFinisher ? -9.5 : 0,
        isXray: isFinisher,
        isFinisher,
        stunDuration: 0,
      };
    }

    if (
      this.state === 'kick' &&
      this.attackFrame >= BALANCE.KICK_ACTIVE_FROM &&
      this.attackFrame <= BALANCE.KICK_ACTIVE_TO
    ) {
      const hitId = `basic_K_${step}`;
      if (this.hasHitId(hitId)) return null;

      const mult = isFinisher ? 1.6 : step === 3 ? 1.3 : step === 2 ? 1.15 : 1.05;
      const reach = isFinisher ? 82 : step === 3 ? 76 : 70;
      const hitY = step === 1 ? this.y + 88 : isFinisher ? this.y + 25 : this.y + 52;
      const launchY =
        sig === 'P-K-K-K' || sig === 'P-P-K-K' ? -10 :
        sig === 'K-K-K-K' ? 6 :
        isFinisher ? -8 : 0;

      return {
        hitId,
        x: this.facing === 1 ? this.x + this.width - 5 : this.x - reach + 5,
        y: hitY,
        width: reach,
        height: isFinisher ? 54 : 38,
        damage: Math.floor(this.power * mult),
        knockback: isFinisher ? 18 : step === 3 ? 11 : 6,
        launchY,
        isXray: isFinisher,
        isFinisher,
        stunDuration: 0,
      };
    }

    if (this.state === 'special') {
      return this.resolveSkillHitbox(this.skills?.skill1);
    }

    if (this.state === 'skill2') {
      return this.resolveSkillHitbox(this.skills?.skill2);
    }

    return null;
  }

  takeDamage(amount, triggerXray = false, stunDuration = 0) {
    if (this.state === 'ko' || this.invulnerable) return 0;
    const isBlocking = this.state === 'block';
    const armorMult = this.hasModifier('superArmor') ? 0.5 : 1.0;
    const finalDamage = Math.floor((isBlocking ? amount * 0.2 : amount) * armorMult);
    this.hp = Math.max(0, this.hp - finalDamage);

    if (this.hp <= 0) {
      this.redHp = 0;
      this.mountTimer = 0;
    } else if (finalDamage > 0) {
      this.redHp = Math.min(this.maxHp - this.hp, this.redHp + finalDamage * BALANCE.RED_HP_RATIO);
    }

    if (!isBlocking && !this.hasModifier('superArmor') && stunDuration > 0 && this.stunImmuneTimer === 0 && this.hp > 0) {
      this.stunTimer = stunDuration;
      this.state = 'stun';
      this.comboStep = 0;
      this.comboChain = [];
    }

    if ((!isBlocking && triggerXray) || this.hp === 0) {
      this.xrayTimer = 28;
    }
    return finalDamage;
  }
}
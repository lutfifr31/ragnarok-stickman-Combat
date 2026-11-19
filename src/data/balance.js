export const BALANCE = {
  // Skala damage berantai dalam satu kombo (hit ke-1 100%, ke-2 90%, ke-3 80%, ke-4 70%, ke-5+ 60%)
  COMBO_DAMAGE_SCALING: [1.0, 0.9, 0.8, 0.7, 0.6],

  // Durasi kebal stun (90 frame = 1.5 detik) setelah efek stun selesai
  STUN_IMMUNITY_FRAMES: 90,

  // Cooldown & durasi mekanik dasar
  TAG_COOLDOWN_MAX: 240,
  TAG_AUTO_COOLDOWN: 60,
  ROLL_DURATION: 16,
  ROLL_COOLDOWN: 45,
  DASH_DURATION: 10,
  DASH_COOLDOWN: 32,

  // Default Skill Cooldowns & Frames
  DEFAULT_SKILL1_COOLDOWN: 180,
  DEFAULT_SKILL1_FRAMES: 15,
  DEFAULT_SKILL2_COOLDOWN: 280,
  DEFAULT_SKILL2_FRAMES: 24,

  // Serangan Dasar (4-Hit Mixup Combo)
  BASIC_PUNCH_FRAMES: 13,
  BASIC_KICK_FRAMES: 15,
  BASIC_FINISHER_FRAMES: 19,
  PUNCH_ACTIVE_FROM: 3,
  PUNCH_ACTIVE_TO: 9,
  KICK_ACTIVE_FROM: 4,
  KICK_ACTIVE_TO: 11,

  // Proyektil Default
  PROJECTILE_WIDTH: 38,
  PROJECTILE_HEIGHT: 28,
  PROJECTILE_SPEED: 13,
  PROJECTILE_KNOCKBACK: 14,
  PROJECTILE_BLOCK_KNOCKBACK: 5,

  // Team Meter (0 - 300 = 3 Bar)
  METER_MAX: 300,
  METER_BAR_COST: 100,
  METER_GAIN_DEALT_MULT: 0.20,
  METER_GAIN_TAKEN_MULT: 0.10,
  METER_GAIN_BLOCK_MULT: 0.05,
  XRAY_FINISHER_REQUIRES_METER: true,

  // Tag Counter (Switch saat block dengan meter >= 100)
  TAG_COUNTER_INVULN_FRAMES: 12,
  TAG_COUNTER_HITBOX_WIDTH: 115,
  TAG_COUNTER_HITBOX_HEIGHT: 95,
  TAG_COUNTER_DAMAGE: 75,
  TAG_COUNTER_KNOCKBACK: 22,
  TAG_COUNTER_LAUNCH_Y: -6,

  // Red Life (HP abu-abu/merah yang pulih saat di bangku cadangan)
  RED_HP_RATIO: 0.5,
  RED_HP_RECOVERY_PER_FRAME: 0.12,

  // Konfigurasi Bot AI per Tingkat Kesulitan
  BOT_DIFFICULTY: {
    EASY: {
      label: 'EASY',
      reactionDelay: 24,
      blockChance: 0.35,
      evadeChance: 0.20,
      punishWhiffChance: 0.15,
      maxComboChain: 2,
      useRoll: false,
      useTagCounter: false,
      skillChance: 0.25,
      tagHpThreshold: 0.25,
    },
    NORMAL: {
      label: 'NORMAL',
      reactionDelay: 14,
      blockChance: 0.65,
      evadeChance: 0.45,
      punishWhiffChance: 0.50,
      maxComboChain: 3,
      useRoll: false,
      useTagCounter: false,
      skillChance: 0.55,
      tagHpThreshold: 0.35,
    },
    HARD: {
      label: 'HARD',
      reactionDelay: 6,
      blockChance: 0.85,
      evadeChance: 0.75,
      punishWhiffChance: 0.90,
      maxComboChain: 4,
      useRoll: true,
      useTagCounter: true,
      skillChance: 0.80,
      tagHpThreshold: 0.42,
    },
  },
};

export function getComboScaledDamage(baseDamage, hitNumber) {
  const index = Math.min(
    Math.max(0, hitNumber - 1),
    BALANCE.COMBO_DAMAGE_SCALING.length - 1
  );
  return Math.max(1, Math.floor(baseDamage * BALANCE.COMBO_DAMAGE_SCALING[index]));
}
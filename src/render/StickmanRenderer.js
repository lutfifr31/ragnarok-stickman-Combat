export const WEAPON_PRESETS = {
  dc_dagger: {
    drawBack() {},
    drawHeld(ctx, pose) {
      const { frontHand, backHand, facing, state, comboStep, isAttacking, time } = pose;
      const activeHand = state === 'attack' && comboStep === 2 ? backHand : frontHand;
      const [hx, hy] = activeHand;
      const bladeLen = isAttacking ? 36 : 26;
      const angle = state === 'attack' && comboStep === 4 ? -Math.PI / 2.2 : isAttacking ? 0 : -0.35 * facing;

      ctx.save();
      ctx.translate(hx, hy);
      if (facing === -1 && !isAttacking) ctx.scale(-1, 1);
      else if (facing === -1 && isAttacking && comboStep !== 4) ctx.scale(-1, 1);
      ctx.rotate(angle);

      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-7, 0);
      ctx.lineTo(4, 0);
      ctx.stroke();

      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(4, -7);
      ctx.lineTo(4, 7);
      ctx.stroke();

      ctx.fillStyle = '#fef08a';
      ctx.strokeStyle = '#facc15';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = isAttacking ? 24 : 12;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(4, -4);
      ctx.lineTo(4 + bladeLen, 0);
      ctx.lineTo(4, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(6, 0);
      ctx.lineTo(14, -4 + Math.sin(time * 0.05) * 3);
      ctx.lineTo(22, 4 - Math.cos(time * 0.05) * 3);
      ctx.lineTo(4 + bladeLen, 0);
      ctx.stroke();
      ctx.restore();
    },
  },

  ink_scroll_pen: {
    drawBack(ctx, pose) {
      const { shoulderX, shoulderY, bodyCenterX, hipY, facing, state, time } = pose;
      ctx.save();
      const isAttacking = ['attack', 'special', 'skill2', 'tag_counter'].includes(state);
      const topX = shoulderX - 16 * facing;
      const topY = shoulderY - 8;
      const botX = bodyCenterX + 12 * facing;
      const botY = hipY + 6;

      ctx.strokeStyle = '#f97316';
      ctx.shadowColor = '#ea580c';
      ctx.shadowBlur = isAttacking ? 18 : 8;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(topX, topY);
      ctx.lineTo(botX, botY);
      ctx.stroke();

      ctx.strokeStyle = '#18181b';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(topX, topY);
      ctx.lineTo(botX, botY);
      ctx.stroke();

      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(topX, topY, 5.5, 0, Math.PI * 2);
      ctx.arc(botX, botY, 5.5, 0, Math.PI * 2);
      ctx.fill();

      if (isAttacking) {
        const wave = Math.sin(time * 0.03) * 8;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(topX, topY);
        ctx.quadraticCurveTo(topX - 28 * facing, topY - 18 + wave, topX - 48 * facing, topY + 6 - wave);
        ctx.stroke();
      }
      ctx.restore();
    },
    drawHeld(ctx, pose) {
      const { frontHand, facing, state, isAttacking } = pose;
      if (state === 'skill2') return;
      const [hx, hy] = frontHand;
      const tipX = hx + (isAttacking ? 64 : 34) * facing;
      const tipY = hy - (isAttacking ? 2 : 28);

      ctx.save();
      ctx.strokeStyle = '#18181b';
      ctx.lineWidth = 5.5;
      ctx.beginPath();
      ctx.moveTo(hx - 16 * facing, hy + 12);
      ctx.lineTo(hx + 10 * facing, hy - 4);
      ctx.stroke();

      ctx.strokeStyle = '#f97316';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = isAttacking ? 24 : 12;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(hx + 10 * facing, hy - 9);
      ctx.lineTo(tipX, tipY);
      ctx.lineTo(hx + 10 * facing, hy + 3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    },
  },

  ac_lightning_sword: {
    drawBack() {},
    drawHeld(ctx, pose) {
      const { frontHand, facing, state, comboStep, isAttacking, time } = pose;
      const [hx, hy] = frontHand;
      const swordLen = isAttacking ? 82 : 62;
      const swordAngle =
        state === 'skill2' || state === 'tag_counter' ? 0.15 :
        state === 'attack' && comboStep === 4 ? -1.35 :
        state === 'attack' && comboStep === 3 ? 0.25 :
        isAttacking ? -0.05 : -0.75;

      ctx.save();
      ctx.translate(hx, hy);
      if (facing === -1) ctx.scale(-1, 1);
      ctx.rotate(swordAngle);

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(-14, 0);
      ctx.lineTo(4, 0);
      ctx.stroke();

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(4, -9);
      ctx.lineTo(4, 9);
      ctx.stroke();

      ctx.shadowColor = '#0ea5e9';
      ctx.shadowBlur = isAttacking ? 28 : 16;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(4, 0);
      ctx.lineTo(4 + swordLen, -2);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(5, 0);
      ctx.lineTo(4 + swordLen, -2);
      ctx.stroke();

      ctx.strokeStyle = '#bae6fd';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(8, 0);
      for (let s = 16; s < swordLen; s += 14) {
        const jitter = Math.sin(time * 0.08 + s) * (isAttacking ? 9 : 5);
        ctx.lineTo(s, jitter);
      }
      ctx.lineTo(4 + swordLen, -2);
      ctx.stroke();
      ctx.restore();
    },
  },

  crimson_nunchaku: {
    drawBack() {},
    drawHeld(ctx, pose) {
      const { frontHand, facing, state, isAttacking, time } = pose;
      const [hx, hy] = frontHand;
      ctx.save();
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = isAttacking ? 26 : 12;

      if (isAttacking && state !== 'skill2') {
        const spinCenterX = hx + 28 * facing;
        const spinCenterY = hy;
        const rot = time * 0.06 * facing;

        ctx.strokeStyle = 'rgba(239, 68, 68, 0.55)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(spinCenterX, spinCenterY, 26, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#fca5a5';
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.moveTo(hx, hy);
        ctx.lineTo(spinCenterX, spinCenterY);
        ctx.stroke();

        const endX = spinCenterX + Math.cos(rot) * 26;
        const endY = spinCenterY + Math.sin(rot) * 26;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(spinCenterX, spinCenterY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      } else {
        const sway = Math.sin(time * 0.012) * 5;
        const stick1EndX = hx + 16 * facing;
        const stick1EndY = hy + 10;
        const chainEndX = stick1EndX + (8 + sway * 0.5) * facing;
        const chainEndY = stick1EndY + 8;
        const stick2EndX = chainEndX - (4 - sway) * facing;
        const stick2EndY = chainEndY + 22;

        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(hx, hy);
        ctx.lineTo(stick1EndX, stick1EndY);
        ctx.stroke();

        ctx.strokeStyle = '#e4e4e7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(stick1EndX, stick1EndY);
        ctx.lineTo(chainEndX, chainEndY);
        ctx.stroke();

        ctx.strokeStyle = '#fca5a5';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(chainEndX, chainEndY);
        ctx.lineTo(stick2EndX, stick2EndY);
        ctx.stroke();
      }
      ctx.restore();
    },
  },

  // 5. MUHAMMAD ALI — Sarung Tinju Merah di kedua tangan
  red_boxing_gloves: {
    drawBack() {},
    drawHeld(ctx, pose) {
      const { frontHand, backHand, facing, isAttacking } = pose;
      const drawGlove = ([hx, hy], isLead) => {
        ctx.save();
        ctx.translate(hx + 3 * facing, hy);
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = isAttacking ? 22 : 10;

        ctx.fillStyle = '#f4f4f5';
        ctx.fillRect(-5 * facing - 3, -5, 6, 10);

        ctx.fillStyle = '#dc2626';
        ctx.strokeStyle = '#fca5a5';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(2 * facing, 0, isLead && isAttacking ? 12 : 10, 8.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.beginPath();
        ctx.ellipse(4 * facing, -3, 4.5, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };

      drawGlove(backHand, false);
      drawGlove(frontHand, true);
    },
  },

  // 6. SASAKI KOJIRO — Double Long Sword Katana (2 bilah panjang di kedua tangan)
  dual_long_katana: {
    drawBack() {},
    drawHeld(ctx, pose) {
      const { frontHand, backHand, facing, state, isAttacking } = pose;
      const drawKatana = ([hx, hy], angle, len) => {
        ctx.save();
        ctx.translate(hx, hy);
        if (facing === -1) ctx.scale(-1, 1);
        ctx.rotate(angle);

        ctx.strokeStyle = '#27272a';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-14, 0);
        ctx.lineTo(4, 0);
        ctx.stroke();

        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(4, -8);
        ctx.lineTo(4, 8);
        ctx.stroke();

        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = isAttacking ? 24 : 12;
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(4, 0);
        ctx.quadraticCurveTo(4 + len * 0.55, -5, 4 + len, -9);
        ctx.stroke();

        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(6, 2);
        ctx.quadraticCurveTo(4 + len * 0.55, -2, 4 + len, -7);
        ctx.stroke();
        ctx.restore();
      };

      const backAngle = state === 'skill2' ? 0.35 : isAttacking ? -0.45 : -1.05;
      const frontAngle = state === 'skill2' ? -0.15 : isAttacking ? 0.08 : -0.68;
      drawKatana(backHand, backAngle, 86);
      drawKatana(frontHand, frontAngle, 92);
    },
  },

  // 7. OKITA SOUJI — Mid Sword Katana dengan Aura Demon Sword merah-hitam
  demon_mid_katana: {
    drawBack() {},
    drawHeld(ctx, pose) {
      const { frontHand, facing, state, isAttacking, time } = pose;
      const [hx, hy] = frontHand;
      const len = 64;
      const angle = state === 'skill2' ? 0.45 : isAttacking ? 0.02 : -0.62;

      ctx.save();
      ctx.translate(hx, hy);
      if (facing === -1) ctx.scale(-1, 1);
      ctx.rotate(angle);

      // Aura Iblis Merah-Hitam menyelimuti bilah
      ctx.shadowColor = '#e11d48';
      ctx.shadowBlur = isAttacking ? 30 : 18;
      ctx.strokeStyle = 'rgba(225, 29, 72, 0.72)';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(4, 0);
      ctx.quadraticCurveTo(4 + len * 0.5, -4 + Math.sin(time * 0.04) * 3, 4 + len + 6, -7);
      ctx.stroke();

      // Gagang & Tsuba
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(-13, 0);
      ctx.lineTo(4, 0);
      ctx.stroke();

      ctx.strokeStyle = '#fb7185';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(4, -8);
      ctx.lineTo(4, 8);
      ctx.stroke();

      // Bilah Katana Mid-Sword
      ctx.strokeStyle = '#18181b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(4, 0);
      ctx.quadraticCurveTo(4 + len * 0.5, -3, 4 + len, -6);
      ctx.stroke();

      ctx.strokeStyle = '#fda4af';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(5, -1);
      ctx.quadraticCurveTo(4 + len * 0.5, -4, 4 + len, -7);
      ctx.stroke();
      ctx.restore();
    },
  },

  // 8. RAIDEN TAMEEMON — Gelang besi sumo di kedua pergelangan + sabuk Mawashi tebal
  sumo_wrist_rings: {
    drawBack(ctx, pose) {
      const { bodyCenterX, hipY } = pose;
      ctx.save();
      ctx.fillStyle = '#d97706';
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.fillRect(bodyCenterX - 11, hipY - 6, 22, 11);
      ctx.strokeRect(bodyCenterX - 11, hipY - 6, 22, 11);
      ctx.restore();
    },
    drawHeld(ctx, pose) {
      const { frontHand, backHand, isAttacking } = pose;
      const drawRing = ([hx, hy]) => {
        ctx.save();
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = isAttacking ? 20 : 10;
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(hx, hy, 7.5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(hx, hy, 5, 0, Math.PI);
        ctx.stroke();
        ctx.restore();
      };
      drawRing(backHand);
      drawRing(frontHand);
    },
  },

  // 9. NAPOLEON BONAPARTE — Saber melengkung panjang vs Epée ramping pendek
  napoleon_saber_epee: {
    drawBack() {},
    drawHeld(ctx, pose) {
      const { frontHand, facing, isAttacking, weaponMode } = pose;
      const [hx, hy] = frontHand;
      const isEpee = weaponMode === 'epee';
      const len = isEpee ? 52 : 80;
      const angle = isAttacking ? 0.05 : isEpee ? -0.35 : -0.65;

      ctx.save();
      ctx.translate(hx, hy);
      if (facing === -1) ctx.scale(-1, 1);
      ctx.rotate(angle);

      // Pelindung tangan emas (knuckle bow)
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.arc(0, 3, 7, -Math.PI * 0.4, Math.PI * 0.9);
      ctx.stroke();

      ctx.shadowColor = isEpee ? '#38bdf8' : '#3b82f6';
      ctx.shadowBlur = isAttacking ? 24 : 12;

      if (isEpee) {
        // Epée ramping & lurus untuk tusukan cepat
        ctx.strokeStyle = '#e0f2fe';
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(4, 0);
        ctx.lineTo(4 + len, 0);
        ctx.stroke();
      } else {
        // Napoleon Saber melengkung panjang
        ctx.strokeStyle = '#93c5fd';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(4, 0);
        ctx.quadraticCurveTo(4 + len * 0.55, 6, 4 + len, -6);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(5, -1);
        ctx.quadraticCurveTo(4 + len * 0.55, 4, 4 + len, -7);
        ctx.stroke();
      }
      ctx.restore();
    },
  },

  // 10. JACK THE RIPPER — Sarung Tangan Ilahi (Divine Gauntlet) & Pisau Steampunk
  divine_steampunk_knives: {
    drawBack(ctx, pose) {
      // Siluet jubah/kerah tinggi bangsawan Victoria + roda gigi steampunk berputar di punggung
      const { shoulderX, shoulderY, facing, time } = pose;
      ctx.save();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(shoulderX - 15 * facing, shoulderY - 10);
      ctx.lineTo(shoulderX - 6 * facing, shoulderY + 4);
      ctx.lineTo(shoulderX + 12 * facing, shoulderY - 6);
      ctx.stroke();

      // Roda gigi steampunk berputar
      const gx = shoulderX - 16 * facing;
      const gy = shoulderY + 12;
      ctx.translate(gx, gy);
      ctx.rotate(time * 0.004);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 6, Math.sin(a) * 6);
        ctx.lineTo(Math.cos(a) * 11, Math.sin(a) * 11);
        ctx.stroke();
      }
      ctx.restore();
    },
    drawHeld(ctx, pose) {
      const { frontHand, backHand, facing, isAttacking } = pose;

      // Sarung Tangan Ilahi emas-zamrud bercahaya di tangan depan
      const [fx, fy] = frontHand;
      ctx.save();
      ctx.translate(fx, fy);
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = isAttacking ? 24 : 14;
      ctx.fillStyle = '#eab308';
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(2 * facing, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Pisau Steampunk bergerigi di tangan belakang & depan
      const drawKnife = ([hx, hy], angle) => {
        ctx.save();
        ctx.translate(hx, hy);
        if (facing === -1) ctx.scale(-1, 1);
        ctx.rotate(angle);

        ctx.fillStyle = '#34d399';
        ctx.strokeStyle = '#ecfdf5';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 14;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(3, -3.5);
        ctx.lineTo(28, 0);
        ctx.lineTo(3, 3.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      };

      drawKnife(backHand, isAttacking ? 0.1 : -0.4);
      drawKnife(frontHand, isAttacking ? 0 : 0.25);
    },
  },
};

export const VFX_PRESETS = {
  spiral_wind_orb(ctx, { frontHand, facing, attackFrame, time }) {
    const [hx, hy] = frontHand;
    const orbX = hx + 16 * facing;
    const orbY = hy;
    const radius = attackFrame < 9 ? 12 + attackFrame * 1.4 : 26;

    ctx.save();
    ctx.shadowColor = '#67e8f9';
    ctx.shadowBlur = 30;
    const grad = ctx.createRadialGradient(orbX, orbY, 2, orbX, orbY, radius);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.5, '#cffafe');
    grad.addColorStop(0.85, '#22d3ee');
    grad.addColorStop(1, 'rgba(34, 211, 238, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(orbX, orbY, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const startAng = time * 0.048 + (i * Math.PI) / 2;
      ctx.beginPath();
      ctx.arc(orbX, orbY, radius * 0.72, startAng, startAng + 1.25);
      ctx.stroke();
    }
    ctx.restore();
  },

  lightning_slash(ctx, { centerX, y, height, facing, attackFrame, color = '#38bdf8' }) {
    if (attackFrame < 6 || attackFrame > 18) return;
    const slashCenterX = centerX + 20 * facing;
    const slashCenterY = y + height * 0.45;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.shadowColor = '#0ea5e9';
    ctx.shadowBlur = 30;
    ctx.lineWidth = 6;

    const startAng = facing === 1 ? -0.9 : Math.PI - 0.9;
    const endAng = facing === 1 ? 0.9 : Math.PI + 0.9;
    ctx.beginPath();
    ctx.arc(slashCenterX, slashCenterY, 95, startAng, endAng);
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(slashCenterX, slashCenterY, 86, startAng + 0.1, endAng - 0.1);
    ctx.stroke();
    ctx.restore();
  },

  dagger_blitz(ctx, { centerX, y, facing, attackFrame, color = '#facc15' }) {
    if (attackFrame < 5 || attackFrame > 16) return;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.shadowColor = '#eab308';
    ctx.shadowBlur = 24;
    ctx.lineWidth = 3;
    for (let i = 0; i < 5; i++) {
      const sy = y + 32 + i * 16;
      const sx = centerX + (15 + (i % 2) * 15) * facing;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + 78 * facing, sy + (i % 2 === 0 ? -8 : 8));
      ctx.stroke();
    }
    ctx.restore();
  },

  dragon_kick_arc(ctx, { centerX, y, facing, attackFrame, color = '#ef4444' }) {
    if (attackFrame < 5 || attackFrame > 16) return;
    const kickTipX = centerX + 86 * facing;
    const kickTipY = y + 58;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 28;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.arc(kickTipX, kickTipY, 26, -Math.PI * 0.6, Math.PI * 0.6, facing === -1);
    ctx.stroke();
    ctx.restore();
  },

  // VFX Muhammad Ali
  critical_punch_flash(ctx, { frontHand, facing, attackFrame }) {
    if (attackFrame < 6 || attackFrame > 14) return;
    const [hx, hy] = frontHand;
    const burstX = hx + 16 * facing;
    ctx.save();
    ctx.strokeStyle = '#facc15';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 28;
    ctx.lineWidth = 3.5;
    for (let i = 0; i < 6; i++) {
      const ang = (i * Math.PI) / 3 + attackFrame * 0.15;
      ctx.beginPath();
      ctx.moveTo(burstX + Math.cos(ang) * 10, hy + Math.sin(ang) * 10);
      ctx.lineTo(burstX + Math.cos(ang) * 38, hy + Math.sin(ang) * 38);
      ctx.stroke();
    }
    ctx.restore();
  },

  double_critical_punch(ctx, { frontHand, backHand, facing, attackFrame }) {
    const isSecondHit = attackFrame >= 13;
    const isFirstHit = attackFrame >= 4 && attackFrame <= 10;
    if (!isFirstHit && !isSecondHit) return;
    const [hx, hy] = isSecondHit ? frontHand : backHand;
    const burstX = hx + 18 * facing;
    const radius = isSecondHit ? 48 : 34;

    ctx.save();
    ctx.strokeStyle = isSecondHit ? '#ffffff' : '#facc15';
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 32;
    ctx.lineWidth = isSecondHit ? 4.5 : 3;
    ctx.beginPath();
    ctx.arc(burstX, hy, radius * 0.65, -0.9, 0.9, facing === -1);
    ctx.stroke();

    for (let i = 0; i < 8; i++) {
      const ang = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(burstX + Math.cos(ang) * 12, hy + Math.sin(ang) * 12);
      ctx.lineTo(burstX + Math.cos(ang) * radius, hy + Math.sin(ang) * radius);
      ctx.stroke();
    }
    ctx.restore();
  },

  // VFX Sasaki Kojiro — Angin Topan & Double Slash Sword
  typhoon_tornado(ctx, proj) {
    const cx = proj.x + proj.width / 2;
    const topY = proj.y + 8;
    const botY = proj.y + proj.height - 6;
    const t = Date.now() * 0.025;

    ctx.strokeStyle = '#c084fc';
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 22;
    ctx.lineWidth = 3;

    for (let i = 0; i < 5; i++) {
      const ratio = i / 4;
      const ly = topY + (botY - topY) * ratio;
      const rx = 24 - ratio * 14;
      const offset = Math.sin(t + i * 1.4) * 5;
      ctx.beginPath();
      ctx.ellipse(cx + offset, ly, rx, 5.5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  },

  dual_katana_cross(ctx, { centerX, y, height, facing, attackFrame }) {
    if (attackFrame < 5 || attackFrame > 23) return;
    const cx = centerX + 42 * facing;
    const cy = y + height * 0.45;
    ctx.save();
    ctx.strokeStyle = '#e9d5ff';
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 28;
    ctx.lineWidth = 5;

    if (attackFrame <= 12) {
      ctx.beginPath();
      ctx.moveTo(cx - 38 * facing, cy + 44);
      ctx.lineTo(cx + 46 * facing, cy - 44);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(cx - 38 * facing, cy - 44);
      ctx.lineTo(cx + 46 * facing, cy + 44);
      ctx.stroke();
    }
    ctx.restore();
  },

  // VFX Okita Souji — Cut Slash Demon & Flying Demon Slash
  demon_cut_slash(ctx, { centerX, y, height, facing, attackFrame }) {
    if (attackFrame < 4 || attackFrame > 13) return;
    const cx = centerX + 36 * facing;
    const cy = y + height * 0.44;
    ctx.save();
    ctx.strokeStyle = '#e11d48';
    ctx.shadowColor = '#be123c';
    ctx.shadowBlur = 30;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(cx, cy, 56, -0.85, 0.85, facing === -1);
    ctx.stroke();

    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 50, -0.75, 0.75, facing === -1);
    ctx.stroke();
    ctx.restore();
  },

  flying_demon_slash(ctx, { centerX, y, height, facing, attackFrame }) {
    if (attackFrame < 4 || attackFrame > 18) return;
    const cx = centerX + 34 * facing;
    const cy = y + height * 0.48;
    ctx.save();
    ctx.strokeStyle = '#fb7185';
    ctx.shadowColor = '#e11d48';
    ctx.shadowBlur = 32;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(cx, cy, 68, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#18181b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 48, cy - 32);
    ctx.lineTo(cx + 48, cy + 32);
    ctx.moveTo(cx - 48, cy + 32);
    ctx.lineTo(cx + 48, cy - 32);
    ctx.stroke();
    ctx.restore();
  },

  // VFX Raiden Tameemon — Shiko & Suriashi
  shiko_quake(ctx, { centerX, y, height, attackFrame }) {
    if (attackFrame < 11 || attackFrame > 19) return;
    const groundY = y + height;
    const spread = (attackFrame - 10) * 14;
    ctx.save();
    ctx.strokeStyle = '#f59e0b';
    ctx.shadowColor = '#d97706';
    ctx.shadowBlur = 24;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(centerX, groundY, spread, 12, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },

  suriashi_palm(ctx, { centerX, y, height, facing, attackFrame }) {
    if (attackFrame < 5 || attackFrame > 20) return;
    const px = centerX + 36 * facing;
    const py = y + height * 0.45;
    ctx.save();
    ctx.strokeStyle = '#fbbf24';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 28;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(px, py, 34, -0.8, 0.8, facing === -1);
    ctx.stroke();
    ctx.restore();
  },

  // VFX Napoleon — Switch Sword & Cavalry Summon
  sword_stance_swap(ctx, { frontHand, facing, attackFrame }) {
    if (attackFrame < 3 || attackFrame > 12) return;
    const [hx, hy] = frontHand;
    ctx.save();
    ctx.strokeStyle = '#60a5fa';
    ctx.shadowColor = '#3b82f6';
    ctx.shadowBlur = 24;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(hx + 16 * facing, hy, 32, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },

  cavalry_summon(ctx, { centerX, y, attackFrame }) {
    if (attackFrame > 16) return;
    ctx.save();
    ctx.strokeStyle = '#facc15';
    ctx.shadowColor = '#3b82f6';
    ctx.shadowBlur = 24;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX, y + 10);
    ctx.lineTo(centerX, y - 34);
    ctx.moveTo(centerX - 16, y - 18);
    ctx.lineTo(centerX + 16, y - 18);
    ctx.stroke();
    ctx.restore();
  },

  // VFX Jack the Ripper — Sarung Tangan Ilahi & Pisau Steampunk
  divine_gauntlet_summon(ctx, { frontHand, facing, attackFrame }) {
    if (attackFrame < 2 || attackFrame > 14) return;
    const [hx, hy] = frontHand;
    ctx.save();
    ctx.strokeStyle = '#facc15';
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 28;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(hx + 24 * facing, hy, 12, 34, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },

  steampunk_knife_single(ctx, proj) {
    const cx = proj.x + proj.width / 2;
    const cy = proj.y + proj.height / 2;
    ctx.save();
    ctx.translate(cx, cy);
    if (proj.facing === -1) ctx.scale(-1, 1);

    ctx.fillStyle = '#34d399';
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-16, -4);
    ctx.lineTo(18, 0);
    ctx.lineTo(-16, 4);
    ctx.lineTo(-10, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  },

  electric_orb(ctx, proj) {
    const cx = proj.x + proj.width / 2;
    const cy = proj.y + proj.height / 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, Math.PI * 2);
    ctx.fill();
  },

  ink_slash_orb(ctx, proj) {
    const cx = proj.x + proj.width / 2;
    const cy = proj.y + proj.height / 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 22, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 3;
    ctx.stroke();
  },

  dragon_wave_orb(ctx, proj) {
    const cx = proj.x + proj.width / 2;
    const cy = proj.y + proj.height / 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 22, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 3;
    ctx.stroke();
  },
};

export class StickmanRenderer {
  static drawProjectile(ctx, proj) {
    ctx.save();
    ctx.shadowColor = proj.color;
    ctx.shadowBlur = 20;
    ctx.fillStyle = proj.color;

    const renderer = VFX_PRESETS[proj.vfx] || VFX_PRESETS.ink_slash_orb;
    renderer(ctx, proj);
    ctx.restore();
  }

  // Gambar Kuda Perang Napoleon (baik saat menerjang dari belakang lawan maupun saat ditunggangi)
  static drawWarhorse(ctx, horseX, groundY, facing, color = '#3b82f6', gallopPhase = 0) {
    ctx.save();
    ctx.translate(horseX, groundY);
    if (facing === -1) ctx.scale(-1, 1);

    const stride = Math.sin(gallopPhase) * 14;
    ctx.strokeStyle = color;
    ctx.fillStyle = '#09090b';
    ctx.shadowColor = color;
    ctx.shadowBlur = 18;
    ctx.lineWidth = 3;

    // 4 Kaki kuda berderap
    const drawHorseLeg = (lx, swing) => {
      ctx.beginPath();
      ctx.moveTo(lx, -34);
      ctx.lineTo(lx + swing * 0.6, -16);
      ctx.lineTo(lx + swing, -2);
      ctx.stroke();
    };
    drawHorseLeg(-22, -stride);
    drawHorseLeg(-14, stride * 0.7);
    drawHorseLeg(18, stride);
    drawHorseLeg(26, -stride * 0.7);

    // Badan kuda kekar
    ctx.beginPath();
    ctx.ellipse(0, -42, 34, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Leher & Kepala kuda
    ctx.beginPath();
    ctx.moveTo(22, -48);
    ctx.lineTo(38, -74);
    ctx.lineTo(52, -64);
    ctx.lineTo(34, -40);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Mata menyala & Ekor berkibar
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(41, -67, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#93c5fd';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-34, -46);
    ctx.quadraticCurveTo(-52, -42 + stride * 0.4, -56, -24);
    ctx.stroke();

    ctx.restore();
  }

  static drawHitboxOverlay(ctx, fighter, label) {
    ctx.save();
    ctx.strokeStyle = '#22c55e';
    ctx.fillStyle = 'rgba(34, 197, 94, 0.14)';
    ctx.lineWidth = 2;
    ctx.fillRect(fighter.x, fighter.y, fighter.width, fighter.height);
    ctx.strokeRect(fighter.x, fighter.y, fighter.width, fighter.height);

    const box = fighter.getHitbox();
    if (box) {
      ctx.strokeStyle = '#ef4444';
      ctx.fillStyle = 'rgba(239, 68, 68, 0.32)';
      ctx.lineWidth = 2.5;
      ctx.fillRect(box.x, box.y, box.width, box.height);
      ctx.strokeRect(box.x, box.y, box.width, box.height);
    }

    ctx.fillStyle = '#09090b';
    ctx.fillRect(fighter.x - 28, fighter.y - 44, 112, 34);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.strokeRect(fighter.x - 28, fighter.y - 44, 112, 34);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 10px Courier New';
    ctx.textAlign = 'left';
    ctx.fillText(`${label}: ${fighter.state}`, fighter.x - 24, fighter.y - 31);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`step:${fighter.comboStep} f:${fighter.attackFrame}`, fighter.x - 24, fighter.y - 17);
    ctx.restore();
  }

  static draw(ctx, fighter, groundY = 500) {
    const {
      x, y, width, height, facing, state, visuals, skills,
      attackFrame, xrayTimer, afterimages, invulnerable, vx, walkPhase,
      comboStep, comboChain, weaponMode, mountTimer
    } = fighter;

    const time = Date.now();
    const isMounted = mountTimer > 0 && state !== 'ko';
    const mountLiftY = isMounted ? -26 : 0;
    const isAirborne = y + height < groundY - 2;
    const centerX = x + width / 2;
    const footY = y + height + mountLiftY;
    const sig = (comboChain || []).join('-');
    const vfxKey = state === 'skill2' ? skills?.skill2?.vfx : state === 'special' ? skills?.skill1?.vfx : null;

    // Gambar kuda perang jika Napoleon sedang menungganginya (durasi 4 detik)
    if (isMounted) {
      this.drawWarhorse(ctx, centerX, groundY, facing, visuals.rimColor, time * 0.025);
    }

    // 1. Afterimage Trail
    afterimages.forEach((ghost) => {
      ctx.save();
      ctx.globalAlpha = ghost.alpha * 0.4;
      ctx.fillStyle = visuals.rimColor;
      ctx.beginPath();
      ctx.arc(ghost.x + width / 2, ghost.y + 24, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(ghost.x + width / 2 - 12, ghost.y + 42);
      ctx.lineTo(ghost.x + width / 2 + 12, ghost.y + 42);
      ctx.lineTo(ghost.x + width / 2 + 6, ghost.y + 92);
      ctx.lineTo(ghost.x + width / 2 - 6, ghost.y + 92);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });

    // 2. Bayangan Lantai + Aura Cincin Energi
    const heightAboveGround = Math.max(0, groundY - (y + height));
    const shadowScale = Math.max(0.35, 1 - heightAboveGround / 260);
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.ellipse(centerX, groundY + 4, (isMounted ? 48 : 34) * shadowScale, 8 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();

    if (!isAirborne && state !== 'ko') {
      ctx.strokeStyle = visuals.rimColor;
      ctx.globalAlpha = 0.28;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(centerX, groundY + 4, isMounted ? 50 : 36, 9, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // 3. Animasi Rolling
    if (state === 'roll') {
      ctx.save();
      const rollCenterY = footY - 32;
      const spinAngle = (time * 0.028) * facing;
      ctx.translate(centerX, rollCenterY);
      ctx.rotate(spinAngle);

      ctx.shadowColor = visuals.rimColor;
      ctx.shadowBlur = 20;
      ctx.strokeStyle = visuals.rimColor;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(0, 0, 25, 0, Math.PI * 1.65);
      ctx.stroke();

      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.arc(0, 0, 19, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    // 4. Kalkulasi Gerakan Pinggul Berdasarkan Gaya Stance
    let idleBob = 0;
    let idleSwayX = 0;
    if (state === 'idle' && !isAirborne) {
      if (visuals.hairStyle === 'wingchun_classic' || visuals.hairStyle === 'ali_crop') {
        idleBob = Math.abs(Math.sin(time * 0.013)) * 5.5;
        idleSwayX = Math.sin(time * 0.0065) * 4 * facing;
      } else if (visuals.hairStyle === 'spiky_hair') {
        idleBob = 4 + Math.sin(time * 0.006) * 2;
      } else if (visuals.hairStyle === 'sleek_side') {
        idleBob = Math.sin(time * 0.005) * 1.8;
      } else {
        idleBob = Math.sin(time * 0.008) * 3;
      }
    }

    const walkBob = state === 'walk' && !isAirborne ? Math.abs(Math.cos(walkPhase)) * 4.5 : 0;
    const stunShake = state === 'stun' ? Math.sin(time * 0.06) * 5 : 0;
    const finisherLift = (state === 'attack' || state === 'kick') && comboStep === 4 && attackFrame >= 4 ? -7 : 0;

    const bodyCenterX = centerX + idleSwayX + stunShake;
    const headY = y + 22 + idleBob + walkBob + finisherLift + mountLiftY;
    const neckY = y + 40 + idleBob + walkBob + finisherLift + mountLiftY;
    const hipY = y + 92 + idleBob * 0.6 + walkBob * 0.8 + finisherLift + mountLiftY;

    ctx.save();
    if (invulnerable) ctx.globalAlpha = 0.65;

    const activeColor =
      state === 'tag_counter' ? '#38bdf8' :
      xrayTimer > 0 ? '#38bdf8' :
      state === 'stun' ? '#94a3b8' : visuals.rimColor;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = activeColor;
    ctx.shadowBlur = ['attack', 'kick', 'special', 'skill2', 'tag_counter'].includes(state) || xrayTimer > 0 ? 24 : 12;

    const drawMuscularSegment = (x1, y1, x2, y2, r1, r2) => {
      const angle = Math.atan2(y2 - y1, x2 - x1);
      const perpX = -Math.sin(angle);
      const perpY = Math.cos(angle);

      ctx.beginPath();
      ctx.moveTo(x1 + perpX * r1, y1 + perpY * r1);
      ctx.lineTo(x2 + perpX * r2, y2 + perpY * r2);
      ctx.arc(x2, y2, r2, angle + Math.PI / 2, angle - Math.PI / 2, true);
      ctx.lineTo(x1 - perpX * r1, y1 - perpY * r1);
      ctx.arc(x1, y1, r1, angle - Math.PI / 2, angle + Math.PI / 2, true);
      ctx.closePath();

      ctx.fillStyle = xrayTimer > 0 ? '#020617' : '#09090b';
      ctx.fill();
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    };

    const drawJointedLimb = (p0, p1, p2, r0, r1, r2) => {
      drawMuscularSegment(p0[0], p0[1], p1[0], p1[1], r0, r1);
      drawMuscularSegment(p1[0], p1[1], p2[0], p2[1], r1, r2);
    };

    const getWalkLegPoints = (phase, moveDir) => {
      const sinP = Math.sin(phase);
      const cosP = Math.cos(phase);
      const isSwinging = cosP > 0;
      const footX = bodyCenterX + sinP * 24 * moveDir;
      const footHeight = isSwinging ? Math.sin(cosP * Math.PI * 0.5) * 16 : 0;
      const currentFootY = footY - footHeight;

      const kneeX = (bodyCenterX + footX) * 0.5 + (isSwinging ? 14 : 6) * facing;
      const kneeY = (hipY + currentFootY) * 0.5 - (isSwinging ? 8 : 2);
      return [[bodyCenterX, hipY], [kneeX, kneeY], [footX, currentFootY]];
    };

    // 5. Kaki Berartikulasi (proporsi lebih tebal untuk Raiden Sumo, posisi berkuda untuk Napoleon)
    const isSumo = visuals.hairStyle === 'sumo_topknot';
    const legR0 = isSumo ? 10 : 7.5;
    const legR1 = isSumo ? 8.5 : 6;
    const legR2 = isSumo ? 6 : 4.5;

    if (state === 'ko') {
      drawJointedLimb([centerX - 38, groundY - 12], [centerX, groundY - 18], [centerX + 38, groundY - 10], 7, 6, 5);
    } else if (isMounted) {
      // Kaki menekuk di pelana kuda
      drawJointedLimb([bodyCenterX, hipY], [bodyCenterX + 14 * facing, hipY + 14], [bodyCenterX + 6 * facing, hipY + 32], legR0, legR1, legR2);
    } else if (state === 'special' && vfxKey === 'shiko_quake') {
      // Pose hentakan kaki tinggi Shiko Raiden
      const lift = attackFrame < 9 ? -28 : 0;
      drawJointedLimb([bodyCenterX, hipY], [bodyCenterX - 18 * facing, hipY + 24], [bodyCenterX - 24 * facing, footY], legR0, legR1, legR2);
      drawJointedLimb([bodyCenterX, hipY], [bodyCenterX + 32 * facing, hipY + 6 + lift], [bodyCenterX + 36 * facing, footY + lift], legR0, legR1, legR2);
    } else if (state === 'skill2' && vfxKey === 'dragon_kick_arc') {
      drawJointedLimb([bodyCenterX, hipY], [bodyCenterX - 18 * facing, hipY + 10], [bodyCenterX - 34 * facing, hipY + 24], 7.5, 6, 4.5);
      drawJointedLimb([bodyCenterX, hipY], [bodyCenterX + 44 * facing, hipY - 16], [bodyCenterX + 86 * facing, hipY - 34], 8.5, 7, 5);
    } else if (state === 'skill2' && (vfxKey === 'spiral_wind_orb' || vfxKey === 'dagger_blitz')) {
      drawJointedLimb([bodyCenterX, hipY], [bodyCenterX + 28 * facing, hipY + 18], [bodyCenterX + 36 * facing, footY], 8, 6.5, 4.5);
      drawJointedLimb([bodyCenterX, hipY], [bodyCenterX - 24 * facing, hipY + 22], [bodyCenterX - 42 * facing, footY], 7.5, 6, 4.5);
    } else if (state === 'kick') {
      const step = comboStep || 1;
      const ext = attackFrame >= 4 && attackFrame <= 11 ? 1 : 0.48;

      if (step === 1) {
        drawJointedLimb([bodyCenterX, hipY], [bodyCenterX - 8 * facing, hipY + 26], [bodyCenterX - 12 * facing, footY], legR0, legR1, legR2);
        drawJointedLimb([bodyCenterX, hipY], [bodyCenterX + 32 * ext * facing, hipY + 14], [bodyCenterX + 68 * ext * facing, footY - 10], legR0, legR1, legR2);
      } else if (step === 2) {
        drawJointedLimb([bodyCenterX, hipY], [bodyCenterX - 10 * facing, hipY + 26], [bodyCenterX - 14 * facing, footY], legR0, legR1, legR2);
        drawJointedLimb([bodyCenterX, hipY], [bodyCenterX + 36 * ext * facing, hipY - 4], [bodyCenterX + 74 * ext * facing, hipY - 12], legR0, legR1, legR2);
      } else if (step === 3) {
        if (sig === 'P-P-K') {
          drawJointedLimb([bodyCenterX, hipY], [bodyCenterX - 14 * facing, hipY + 22], [bodyCenterX - 18 * facing, footY - 4], legR0, legR1, legR2);
          drawJointedLimb([bodyCenterX, hipY], [bodyCenterX + 54 * ext * facing, hipY - 18], [bodyCenterX + 26 * ext * facing, hipY + 14], legR0, legR1, legR2);
        } else {
          drawJointedLimb([bodyCenterX, hipY], [bodyCenterX - 6 * facing, hipY + 26], [bodyCenterX - 8 * facing, footY], legR0, legR1, legR2);
          drawJointedLimb([bodyCenterX, hipY], [bodyCenterX + 38 * ext * facing, hipY - 22], [bodyCenterX + 78 * ext * facing, hipY - 44], legR0, legR1, legR2);
        }
      } else {
        if (sig === 'K-K-K-K') {
          const slamY = attackFrame >= 6 ? hipY + 26 : hipY - 62;
          drawJointedLimb([bodyCenterX, hipY], [bodyCenterX - 12 * facing, hipY + 20], [bodyCenterX - 16 * facing, footY - 6], legR0, legR1, legR2);
          drawJointedLimb([bodyCenterX, hipY], [bodyCenterX + 36 * facing, hipY - 34], [bodyCenterX + 78 * facing, slamY], legR0, legR1, legR2);
        } else if (sig === 'P-K-K-K') {
          drawJointedLimb([bodyCenterX, hipY], [bodyCenterX - 24 * facing, hipY - 8], [bodyCenterX - 46 * facing, hipY + 10], legR0, legR1, legR2);
          drawJointedLimb([bodyCenterX, hipY], [bodyCenterX + 42 * ext * facing, hipY - 24], [bodyCenterX + 84 * ext * facing, hipY - 46], legR0, legR1, legR2);
        } else {
          drawJointedLimb([bodyCenterX, hipY], [bodyCenterX - 10 * facing, hipY + 24], [bodyCenterX - 14 * facing, footY], legR0, legR1, legR2);
          drawJointedLimb([bodyCenterX, hipY], [bodyCenterX + 40 * ext * facing, hipY - 26], [bodyCenterX + 82 * ext * facing, hipY - 52], legR0, legR1, legR2);
        }
      }

      if (attackFrame >= 4 && attackFrame <= 11) {
        this.drawKickArc(ctx, bodyCenterX, hipY, facing, step, sig, activeColor);
      }
    } else if (state === 'dash') {
      drawJointedLimb([bodyCenterX, hipY], [bodyCenterX + 24 * facing, hipY + 18], [bodyCenterX + 18 * facing, footY - 4], legR0, legR1, legR2);
      drawJointedLimb([bodyCenterX, hipY], [bodyCenterX - 24 * facing, hipY + 16], [bodyCenterX - 40 * facing, footY - 10], legR0, legR1, legR2);
    } else if (isAirborne) {
      drawJointedLimb([bodyCenterX, hipY], [bodyCenterX + 16 * facing, hipY + 18], [bodyCenterX + 8 * facing, hipY + 38], legR0, legR1, legR2);
      drawJointedLimb([bodyCenterX, hipY], [bodyCenterX - 14 * facing, hipY + 22], [bodyCenterX - 22 * facing, hipY + 42], legR0, legR1, legR2);
    } else if (state === 'walk') {
      const moveDir = vx >= 0 ? 1 : -1;
      const legA = getWalkLegPoints(walkPhase, moveDir);
      const legB = getWalkLegPoints(walkPhase + Math.PI, moveDir);
      drawJointedLimb(legB[0], legB[1], legB[2], legR0, legR1, legR2);
      drawJointedLimb(legA[0], legA[1], legA[2], legR0, legR1, legR2);
    } else if (state === 'attack' || state === 'tag_counter') {
      const lunge = Math.min(9, attackFrame * 1.6) * facing;
      drawJointedLimb([bodyCenterX, hipY], [bodyCenterX + (18 * facing + lunge), hipY + 25], [bodyCenterX + (24 * facing + lunge), footY], legR0, legR1, legR2);
      drawJointedLimb([bodyCenterX, hipY], [bodyCenterX - 16 * facing, hipY + 25], [bodyCenterX - 24 * facing, footY], legR0, legR1, legR2);
    } else {
      const stanceSpread =
        isSumo ? 30 :
        visuals.hairStyle === 'spiky_hair' ? 28 :
        visuals.hairStyle === 'wingchun_classic' ? 25 : 21;
      drawJointedLimb([bodyCenterX, hipY], [bodyCenterX + (stanceSpread - 4) * facing, hipY + 24], [bodyCenterX + stanceSpread * facing, footY], legR0, legR1, legR2);
      drawJointedLimb([bodyCenterX, hipY], [bodyCenterX - (stanceSpread - 6) * facing, hipY + 24], [bodyCenterX - stanceSpread * facing, footY], legR0, legR1, legR2);
    }

    // 6. Torso V-Taper (atau torso kekar Sumo untuk Raiden)
    const weaponPreset = WEAPON_PRESETS[visuals.weapon];
    if (state !== 'ko') {
      const defaultLean = visuals.hairStyle === 'spiky_hair' ? 8 : visuals.hairStyle === 'sleek_side' ? 0 : 4;
      const lean =
        state === 'dash' ? 18 * facing :
        state === 'walk' ? (vx * 1.6) :
        state === 'stun' ? -12 * facing :
        state === 'tag_counter' ? 16 * facing :
        state === 'skill2' && vfxKey === 'dragon_kick_arc' ? -20 * facing :
        state === 'skill2' && (vfxKey === 'spiral_wind_orb' || vfxKey === 'dagger_blitz') ? 18 * facing :
        state === 'kick' ? (comboStep === 1 ? -6 : comboStep === 4 ? -18 : -12) * facing :
        state === 'attack' ? (comboStep === 4 ? 14 : 10) * facing :
        state === 'special' ? 10 * facing : defaultLean * facing;

      const shoulderX = bodyCenterX + lean;
      const shoulderY = neckY + 4;

      if (weaponPreset?.drawBack) {
        weaponPreset.drawBack(ctx, { shoulderX, shoulderY, bodyCenterX, hipY, facing, state, time });
      }

      const shoulderHalfW = isSumo ? 18 : 13;
      const waistHalfW = isSumo ? 14 : 7;

      ctx.beginPath();
      ctx.moveTo(shoulderX - shoulderHalfW, shoulderY);
      ctx.lineTo(shoulderX + shoulderHalfW, shoulderY);
      ctx.lineTo(bodyCenterX + waistHalfW, hipY);
      ctx.lineTo(bodyCenterX - waistHalfW, hipY);
      ctx.closePath();
      ctx.fillStyle = xrayTimer > 0 ? '#020617' : '#09090b';
      ctx.fill();
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = 2.8;
      ctx.stroke();

      // Sabuk Tarung berkibar
      const beltWave = Math.sin(time * 0.018) * 5 + vx * 0.8;
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(bodyCenterX - waistHalfW - 1, hipY - 2);
      ctx.lineTo(bodyCenterX + waistHalfW + 1, hipY - 2);
      ctx.moveTo(bodyCenterX - 6 * facing, hipY - 2);
      ctx.quadraticCurveTo(bodyCenterX - 18 * facing, hipY + 8 + beltWave * 0.5, bodyCenterX - 24 * facing, hipY + 22 - beltWave);
      ctx.stroke();

      // 7. Lengan Berotot
      let frontHand = [shoulderX + 26 * facing, shoulderY + 14];
      let frontElbow = [shoulderX + 12 * facing, shoulderY + 24];
      let backHand = [shoulderX - 12 * facing, shoulderY + 10];
      let backElbow = [shoulderX - 18 * facing, shoulderY + 22];

      if (state === 'idle') {
        if (visuals.hairStyle === 'wingchun_classic' || visuals.hairStyle === 'ali_crop') {
          frontElbow = [shoulderX + 16 * facing, shoulderY + 12];
          frontHand = [shoulderX + 24 * facing, shoulderY - 8];
          backElbow = [shoulderX + 4 * facing, shoulderY + 14];
          backHand = [shoulderX + 14 * facing, shoulderY - 10];
        } else if (visuals.hairStyle === 'spiky_hair') {
          frontElbow = [shoulderX + 18 * facing, shoulderY + 12];
          frontHand = [shoulderX + 24 * facing, shoulderY + 4];
          backElbow = [shoulderX - 16 * facing, shoulderY + 16];
          backHand = [shoulderX - 22 * facing, shoulderY + 6];
        } else if (visuals.hairStyle === 'sleek_side') {
          frontElbow = [shoulderX + 18 * facing, shoulderY + 14];
          frontHand = [shoulderX + 30 * facing, shoulderY + 6];
          backElbow = [shoulderX - 18 * facing, shoulderY + 12];
          backHand = [shoulderX - 24 * facing, shoulderY - 4];
        }
      } else if (state === 'stun') {
        frontElbow = [shoulderX + 8 * facing, shoulderY + 24];
        frontHand = [shoulderX + 12 * facing, shoulderY + 44];
        backElbow = [shoulderX - 8 * facing, shoulderY + 24];
        backHand = [shoulderX - 12 * facing, shoulderY + 44];
      } else if (state === 'walk') {
        const moveDir = vx >= 0 ? 1 : -1;
        const armSwing = -Math.sin(walkPhase) * 15 * moveDir;
        frontElbow = [shoulderX + armSwing * 0.4, shoulderY + 21];
        frontHand = [shoulderX + 16 * facing + armSwing, shoulderY + 11];
        backElbow = [shoulderX - armSwing * 0.4, shoulderY + 21];
        backHand = [shoulderX - 14 * facing - armSwing, shoulderY + 13];
      } else if (state === 'dash') {
        frontElbow = [shoulderX - 10 * facing, shoulderY + 14];
        frontHand = [shoulderX - 24 * facing, shoulderY + 16];
        backElbow = [shoulderX - 14 * facing, shoulderY + 18];
        backHand = [shoulderX - 28 * facing, shoulderY + 20];
      } else if (state === 'tag_counter') {
        frontElbow = [shoulderX + 36 * facing, shoulderY - 2];
        frontHand = [shoulderX + 74 * facing, shoulderY - 4];
        backElbow = [shoulderX - 16 * facing, shoulderY + 12];
        backHand = [shoulderX - 26 * facing, shoulderY + 2];
      } else if (state === 'kick') {
        frontElbow = [shoulderX + 14 * facing, shoulderY + 10];
        frontHand = [shoulderX + 20 * facing, shoulderY - 8];
        backElbow = [shoulderX - 22 * facing, shoulderY + 8];
        backHand = [shoulderX - 34 * facing, shoulderY - 6];
      } else if (state === 'attack') {
        const ext = attackFrame >= 3 && attackFrame <= 9 ? 1 : 0.45;
        if (comboStep === 1) {
          frontElbow = [shoulderX + 32 * ext * facing, shoulderY + 4];
          frontHand = [shoulderX + 64 * ext * facing, shoulderY + 2];
          backElbow = [shoulderX - 12 * facing, shoulderY + 16];
          backHand = [shoulderX + 6 * facing, shoulderY + 4];
        } else if (comboStep === 2) {
          frontElbow = [shoulderX - 14 * facing, shoulderY + 14];
          frontHand = [shoulderX - 4 * facing, shoulderY + 2];
          backElbow = [shoulderX + 34 * ext * facing, shoulderY + 8];
          backHand = [shoulderX + 68 * ext * facing, shoulderY + 10];
        } else if (comboStep === 3) {
          frontElbow = [shoulderX + 46 * ext * facing, shoulderY - 4];
          frontHand = [shoulderX + 28 * ext * facing, shoulderY + 16];
          backElbow = [shoulderX - 20 * facing, shoulderY + 14];
          backHand = [shoulderX - 30 * facing, shoulderY + 6];
        } else {
          if (sig.includes('K')) {
            frontElbow = [shoulderX + 38 * ext * facing, shoulderY + 2];
            frontHand = [shoulderX + 74 * ext * facing, shoulderY - 6];
            backElbow = [shoulderX - 24 * facing, shoulderY + 10];
            backHand = [shoulderX - 36 * facing, shoulderY - 4];
          } else {
            frontElbow = [shoulderX + 24 * ext * facing, shoulderY - 6];
            frontHand = [shoulderX + 34 * ext * facing, shoulderY - 42 * ext];
            backElbow = [shoulderX - 18 * facing, shoulderY + 18];
            backHand = [shoulderX - 26 * facing, shoulderY + 10];
          }
        }
      } else if (state === 'skill2') {
        if (vfxKey === 'double_critical_punch') {
          const isSecond = attackFrame >= 12;
          if (!isSecond) {
            backElbow = [shoulderX + 34 * facing, shoulderY + 4];
            backHand = [shoulderX + 68 * facing, shoulderY + 4];
            frontElbow = [shoulderX - 10 * facing, shoulderY + 14];
            frontHand = [shoulderX + 6 * facing, shoulderY + 2];
          } else {
            frontElbow = [shoulderX + 38 * facing, shoulderY - 2];
            frontHand = [shoulderX + 74 * facing, shoulderY - 4];
            backElbow = [shoulderX - 14 * facing, shoulderY + 14];
            backHand = [shoulderX - 4 * facing, shoulderY + 4];
          }
        } else if (vfxKey === 'spiral_wind_orb') {
          if (attackFrame < 9) {
            frontElbow = [shoulderX - 10 * facing, shoulderY + 18];
            frontHand = [shoulderX - 18 * facing, shoulderY + 22];
            backElbow = [shoulderX - 4 * facing, shoulderY + 14];
            backHand = [shoulderX - 14 * facing, shoulderY + 20];
          } else {
            frontElbow = [shoulderX + 34 * facing, shoulderY + 6];
            frontHand = [shoulderX + 66 * facing, shoulderY + 6];
            backElbow = [shoulderX - 22 * facing, shoulderY + 14];
            backHand = [shoulderX - 34 * facing, shoulderY + 4];
          }
        } else if (vfxKey === 'dagger_blitz') {
          const slashSwing = Math.sin(attackFrame * 0.9) * 18;
          frontElbow = [shoulderX + 32 * facing, shoulderY + 4];
          frontHand = [shoulderX + 64 * facing, shoulderY + slashSwing];
          backElbow = [shoulderX + 20 * facing, shoulderY + 14];
          backHand = [shoulderX + 46 * facing, shoulderY - slashSwing];
        } else if (vfxKey === 'lightning_slash' || vfxKey === 'dual_katana_cross') {
          const swordSwingY = attackFrame < 12 ? -24 : 18;
          frontElbow = [shoulderX + 32 * facing, shoulderY + swordSwingY * 0.5];
          frontHand = [shoulderX + 62 * facing, shoulderY + swordSwingY];
          backElbow = [shoulderX + 24 * facing, shoulderY - swordSwingY * 0.4];
          backHand = [shoulderX + 54 * facing, shoulderY - swordSwingY * 0.8];
        } else {
          frontElbow = [shoulderX + 28 * facing, shoulderY + 2];
          frontHand = [shoulderX + 56 * facing, shoulderY - 4];
          backElbow = [shoulderX - 20 * facing, shoulderY + 8];
          backHand = [shoulderX - 32 * facing, shoulderY - 4];
        }
      } else if (state === 'special') {
        frontElbow = [shoulderX + 32 * facing, shoulderY + 4];
        frontHand = [shoulderX + 64 * facing, shoulderY + 4];
        backElbow = [shoulderX - 16 * facing, shoulderY + 16];
        backHand = [shoulderX - 24 * facing, shoulderY + 4];
      } else if (state === 'block') {
        frontElbow = [shoulderX + 16 * facing, shoulderY + 12];
        frontHand = [shoulderX + 18 * facing, shoulderY - 12];
        backElbow = [shoulderX + 10 * facing, shoulderY + 16];
        backHand = [shoulderX + 12 * facing, shoulderY - 8];
      }

      const armR0 = isSumo ? 8.5 : 6.5;
      const armR1 = isSumo ? 7.5 : 5.5;
      drawJointedLimb([shoulderX - 6 * facing, shoulderY + 2], backElbow, backHand, armR0, armR1, 5);
      drawJointedLimb([shoulderX + 6 * facing, shoulderY + 2], frontElbow, frontHand, armR0, armR1, 5);

      if (state === 'attack' && attackFrame >= 3 && attackFrame <= 9) {
        this.drawAttackArc(ctx, shoulderX, shoulderY, facing, comboStep, sig, activeColor);
      } else if (state === 'tag_counter' && attackFrame >= 2 && attackFrame <= 12) {
        this.drawAttackArc(ctx, shoulderX, shoulderY, facing, 4, 'P-P-P-P', '#38bdf8');
      }

      // 8. Kepala & Aura Mata
      const headX = shoulderX;
      ctx.fillStyle = xrayTimer > 0 ? '#020617' : '#09090b';
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(headX, headY, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(headX + 8 * facing, headY - 1, 4.5, 1.8, 0.2 * facing, 0, Math.PI * 2);
      ctx.fill();

      if (state === 'stun') {
        this.drawStunHalo(ctx, headX, headY - 28, time);
      }

      // 9. Rambut / Topi & Senjata dari WEAPON_PRESETS
      this.drawHairStyle(ctx, headX, headY, facing, visuals.hairStyle);
      if (weaponPreset?.drawHeld) {
        const isAttacking = ['attack', 'special', 'skill2', 'tag_counter'].includes(state);
        weaponPreset.drawHeld(ctx, {
          headX, headY, frontElbow, frontHand, backHand, facing, visuals, state, comboStep, isAttacking, time, weaponMode
        });
      }

      // 10. Visual Jurus Spesial 1 & 2 dari VFX_PRESETS
      if ((state === 'special' || state === 'skill2') && vfxKey && VFX_PRESETS[vfxKey]) {
        VFX_PRESETS[vfxKey](ctx, {
          centerX: bodyCenterX,
          y: y + mountLiftY,
          width,
          height,
          facing,
          attackFrame,
          frontHand,
          backHand,
          color: visuals.rimColor,
          time,
        });
      }

      // 11. Kerangka X-Ray
      if (xrayTimer > 0) {
        this.drawXraySkeleton(ctx, headX, headY, neckY, hipY);
      }
    } else if (weaponPreset?.drawHeld) {
      weaponPreset.drawHeld(ctx, {
        headX: centerX,
        headY: groundY - 14,
        frontElbow: [centerX + 10 * facing, groundY - 12],
        frontHand: [centerX + 24 * facing, groundY - 10],
        backHand: [centerX - 18 * facing, groundY - 10],
        facing,
        visuals,
        state,
        comboStep,
        isAttacking: false,
        time,
        weaponMode,
      });
    }

    ctx.restore();
  }

  static drawStunHalo(ctx, cx, cy, time) {
    ctx.save();
    ctx.strokeStyle = '#facc15';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 10;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 18, 5, 0, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < 3; i++) {
      const ang = time * 0.012 + (i * Math.PI * 2) / 3;
      const sx = cx + Math.cos(ang) * 18;
      const sy = cy + Math.sin(ang) * 5;
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(sx, sy, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  static drawHairStyle(ctx, headX, headY, facing, hairStyle) {
    ctx.save();
    if (hairStyle === 'parted_goggles') {
      ctx.strokeStyle = '#e4e4e7';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(headX - 15, headY - 7);
      ctx.quadraticCurveTo(headX - 4, headY - 22, headX, headY - 12);
      ctx.quadraticCurveTo(headX + 4, headY - 22, headX + 15, headY - 7);
      ctx.stroke();

      ctx.fillStyle = '#facc15';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 12;
      ctx.fillRect(headX + 3 * facing - 5, headY - 12, 11, 6);
    } else if (hairStyle === 'spiky_hair') {
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(headX - 14, headY - 8);
      ctx.lineTo(headX - 10, headY - 26);
      ctx.lineTo(headX - 2, headY - 14);
      ctx.lineTo(headX + 4, headY - 28);
      ctx.lineTo(headX + 10, headY - 14);
      ctx.lineTo(headX + 16, headY - 23);
      ctx.lineTo(headX + 14, headY - 8);
      ctx.stroke();
    } else if (hairStyle === 'sleek_side') {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(headX - 15, headY - 7);
      ctx.quadraticCurveTo(headX, headY - 23, headX + 15 * facing, headY - 9);
      ctx.stroke();
    } else if (hairStyle === 'wingchun_classic') {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(headX, headY - 4, 16, Math.PI, 0);
      ctx.stroke();
    } else if (hairStyle === 'ali_crop') {
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.arc(headX, headY - 2, 16.5, Math.PI * 1.05, -Math.PI * 0.05);
      ctx.stroke();
    } else if (hairStyle === 'kojiro_ponytail') {
      // Kuncir ekor kuda panjang Sasaki Kojiro
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(headX - 12 * facing, headY - 8);
      ctx.quadraticCurveTo(headX - 28 * facing, headY - 14, headX - 34 * facing, headY + 12);
      ctx.stroke();
    } else if (hairStyle === 'okita_ponytail') {
      // Kuncir kepala tinggi Okita Souji + ikat kepala putih
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(headX - 15, headY - 9);
      ctx.lineTo(headX + 15, headY - 9);
      ctx.stroke();

      ctx.strokeStyle = '#fb7185';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(headX - 6 * facing, headY - 15);
      ctx.quadraticCurveTo(headX - 24 * facing, headY - 26, headX - 30 * facing, headY - 4);
      ctx.stroke();
    } else if (hairStyle === 'sumo_topknot') {
      // Sanggul Chonmage sumo Raiden
      ctx.fillStyle = '#09090b';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.ellipse(headX, headY - 19, 6, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (hairStyle === 'bicorne_hat') {
      // Topi Bicorne ikonik Napoleon Bonaparte
      ctx.fillStyle = '#09090b';
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(headX - 24, headY - 10);
      ctx.quadraticCurveTo(headX, headY - 32, headX + 24, headY - 10);
      ctx.quadraticCurveTo(headX, headY - 15, headX - 24, headY - 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Lencana kokarde biru-putih-merah di topi
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(headX + 4 * facing, headY - 17, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (hairStyle === 'victorian_tophat_monocle') {
      // Topi Tinggi Bangsawan Victoria + Monokel Steampunk Jack the Ripper
      ctx.fillStyle = '#09090b';
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.3;
      // Brim topi
      ctx.beginPath();
      ctx.moveTo(headX - 22, headY - 12);
      ctx.lineTo(headX + 22, headY - 12);
      ctx.stroke();
      // Mahkota topi tinggi
      ctx.fillRect(headX - 13, headY - 34, 26, 22);
      ctx.strokeRect(headX - 13, headY - 34, 26, 22);
      // Pita steampunk emas pada topi
      ctx.fillStyle = '#d97706';
      ctx.fillRect(headX - 13, headY - 17, 26, 4);
      // Monokel emas di mata
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(headX + 8 * facing, headY - 1, 5.5, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  static drawKickArc(ctx, centerX, hipY, facing, step, sig, color) {
    ctx.save();
    ctx.strokeStyle = step === 4 ? '#ffffff' : color;
    ctx.shadowColor = color;
    ctx.shadowBlur = step === 4 ? 22 : 14;
    ctx.lineWidth = step === 4 ? 4.5 : 2.8;
    ctx.beginPath();

    if (step === 1) {
      ctx.moveTo(centerX + 20 * facing, hipY + 35);
      ctx.lineTo(centerX + 75 * facing, hipY + 45);
    } else if (step === 2) {
      ctx.arc(centerX + 15 * facing, hipY + 5, 58, -0.35, 0.45, facing === -1);
    } else if (step === 3) {
      ctx.arc(centerX + 10 * facing, hipY - 12, 66, 0.25, -0.85, facing === 1);
    } else {
      if (sig === 'K-K-K-K') {
        const startAng = facing === 1 ? -1.4 : Math.PI + 1.4;
        const endAng = facing === 1 ? 0.5 : Math.PI - 0.5;
        ctx.arc(centerX + 12 * facing, hipY - 10, 72, startAng, endAng, facing === -1);
      } else {
        ctx.arc(centerX + 8 * facing, hipY - 16, 74, 0, Math.PI * 1.45);
      }
    }
    ctx.stroke();
    ctx.restore();
  }

  static drawAttackArc(ctx, shoulderX, shoulderY, facing, step, sig, color) {
    ctx.save();
    ctx.strokeStyle = step === 4 ? '#ffffff' : color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    ctx.lineWidth = step === 4 ? 4 : 2.5;
    ctx.beginPath();

    if (step === 1 || step === 2) {
      const yOff = step === 1 ? 2 : 10;
      ctx.moveTo(shoulderX + 25 * facing, shoulderY + yOff);
      ctx.lineTo(shoulderX + 74 * facing, shoulderY + yOff);
    } else if (step === 3) {
      ctx.arc(shoulderX + 15 * facing, shoulderY + 6, 48, -0.5, 0.7, facing === -1);
    } else if (step === 4) {
      if (sig.includes('K')) {
        ctx.arc(shoulderX + 18 * facing, shoulderY + 2, 62, -0.45, 0.45, facing === -1);
      } else {
        const startAng = facing === 1 ? 0.3 : Math.PI - 0.3;
        const endAng = facing === 1 ? -1.3 : Math.PI + 1.3;
        ctx.arc(shoulderX + 12 * facing, shoulderY + 10, 52, startAng, endAng, facing === 1);
      }
    }
    ctx.stroke();
    ctx.restore();
  }

  static drawXraySkeleton(ctx, centerX, headY, neckY, hipY) {
    ctx.save();
    ctx.strokeStyle = '#e0f2fe';
    ctx.fillStyle = '#e0f2fe';
    ctx.shadowColor = '#0ea5e9';
    ctx.shadowBlur = 15;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(centerX, headY, 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(centerX - 4, headY - 2, 2.5, 0, Math.PI * 2);
    ctx.arc(centerX + 4, headY - 2, 2.5, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 4; i++) {
      const ribY = neckY + 12 + i * 9;
      ctx.beginPath();
      ctx.moveTo(centerX - 11, ribY);
      ctx.lineTo(centerX + 11, ribY);
      ctx.stroke();
    }

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(centerX - 8, neckY + 15);
    ctx.lineTo(centerX + 2, neckY + 23);
    ctx.lineTo(centerX - 4, neckY + 30);
    ctx.lineTo(centerX + 9, neckY + 38);
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 13px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('CRACK! X-RAY', centerX, headY - 28);
    ctx.restore();
  }
}
export class StickmanRenderer {
  static draw(ctx, fighter, groundY = 500) {
    const {
      x, y, width, height, facing, state, visuals,
      attackFrame, xrayTimer, afterimages, invulnerable, vx, walkPhase, comboStep
    } = fighter;

    const time = Date.now();
    const isAirborne = y + height < groundY - 2;
    const centerX = x + width / 2;
    const footY = y + height;

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
    const heightAboveGround = Math.max(0, groundY - footY);
    const shadowScale = Math.max(0.35, 1 - heightAboveGround / 260);
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.ellipse(centerX, groundY + 4, 34 * shadowScale, 8 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();

    if (!isAirborne && state !== 'ko') {
      ctx.strokeStyle = visuals.rimColor;
      ctx.globalAlpha = 0.28;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(centerX, groundY + 4, 36, 9, 0, 0, Math.PI * 2);
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

    // 4. Kalkulasi Gerakan Pinggul (Hip Bob) & Sendi Anatomi
    const breathe = state === 'idle' && !isAirborne ? Math.sin(time * 0.007) * 2.5 : 0;
    const walkBob = state === 'walk' && !isAirborne ? Math.abs(Math.cos(walkPhase)) * 4.5 : 0;
    const uppercutLift = state === 'attack' && comboStep === 4 && attackFrame >= 4 ? -6 : 0;

    const headY = y + 22 + breathe + walkBob + uppercutLift;
    const neckY = y + 40 + breathe + walkBob + uppercutLift;
    const hipY = y + 92 + breathe * 0.5 + walkBob * 0.8 + uppercutLift;

    ctx.save();
    if (invulnerable) ctx.globalAlpha = 0.65;

    const activeColor = xrayTimer > 0 ? '#38bdf8' : visuals.rimColor;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = activeColor;
    ctx.shadowBlur = ['attack', 'kick', 'special', 'skill2'].includes(state) || xrayTimer > 0 ? 24 : 12;

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
      const footX = centerX + sinP * 24 * moveDir;
      const footHeight = isSwinging ? Math.sin(cosP * Math.PI * 0.5) * 16 : 0;
      const currentFootY = footY - footHeight;

      const kneeX = (centerX + footX) * 0.5 + (isSwinging ? 14 : 6) * facing;
      const kneeY = (hipY + currentFootY) * 0.5 - (isSwinging ? 8 : 2);
      return [[centerX, hipY], [kneeX, kneeY], [footX, currentFootY]];
    };

    // 5. Kaki Berartikulasi
    if (state === 'ko') {
      drawJointedLimb([centerX - 38, footY - 12], [centerX, footY - 18], [centerX + 38, footY - 10], 7, 6, 5);
    } else if (state === 'kick') {
      drawJointedLimb([centerX, hipY], [centerX - 8 * facing, hipY + 26], [centerX - 12 * facing, footY], 7.5, 6, 4.5);
      const kickExtend = attackFrame >= 4 && attackFrame <= 13 ? 72 : 34;
      drawJointedLimb(
        [centerX, hipY],
        [centerX + kickExtend * 0.52 * facing, hipY - 14],
        [centerX + kickExtend * facing, hipY - 28],
        8, 6.5, 5
      );
    } else if (state === 'dash') {
      drawJointedLimb([centerX, hipY], [centerX + 24 * facing, hipY + 18], [centerX + 18 * facing, footY - 4], 7.5, 6, 4.5);
      drawJointedLimb([centerX, hipY], [centerX - 24 * facing, hipY + 16], [centerX - 40 * facing, footY - 10], 7.5, 6, 4.5);
    } else if (isAirborne) {
      drawJointedLimb([centerX, hipY], [centerX + 16 * facing, hipY + 18], [centerX + 8 * facing, hipY + 38], 7.5, 6, 4.5);
      drawJointedLimb([centerX, hipY], [centerX - 14 * facing, hipY + 22], [centerX - 22 * facing, hipY + 42], 7.5, 6, 4.5);
    } else if (state === 'walk') {
      const moveDir = vx >= 0 ? 1 : -1;
      const legA = getWalkLegPoints(walkPhase, moveDir);
      const legB = getWalkLegPoints(walkPhase + Math.PI, moveDir);
      drawJointedLimb(legB[0], legB[1], legB[2], 7.5, 6, 4.5);
      drawJointedLimb(legA[0], legA[1], legA[2], 7.5, 6, 4.5);
    } else if (state === 'attack') {
      const lunge = Math.min(8, attackFrame * 1.5) * facing;
      drawJointedLimb([centerX, hipY], [centerX + (18 * facing + lunge), hipY + 25], [centerX + (24 * facing + lunge), footY], 7.5, 6, 4.5);
      drawJointedLimb([centerX, hipY], [centerX - 16 * facing, hipY + 25], [centerX - 24 * facing, footY], 7.5, 6, 4.5);
    } else {
      drawJointedLimb([centerX, hipY], [centerX + 16 * facing, hipY + 25], [centerX + 22 * facing, footY], 7.5, 6, 4.5);
      drawJointedLimb([centerX, hipY], [centerX - 14 * facing, hipY + 25], [centerX - 22 * facing, footY], 7.5, 6, 4.5);
    }

    // 6. Torso V-Taper & Sabuk Tarung
    if (state !== 'ko') {
      const lean =
        state === 'dash' ? 18 * facing :
        state === 'walk' ? (vx * 1.6) :
        state === 'kick' ? -10 * facing :
        state === 'attack' ? (comboStep === 4 ? 14 : 10) * facing :
        ['special', 'skill2'].includes(state) ? 10 * facing : 3 * facing;

      const shoulderX = centerX + lean;
      const shoulderY = neckY + 4;

      ctx.beginPath();
      ctx.moveTo(shoulderX - 13, shoulderY);
      ctx.lineTo(shoulderX + 13, shoulderY);
      ctx.lineTo(centerX + 7, hipY);
      ctx.lineTo(centerX - 7, hipY);
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
      ctx.moveTo(centerX - 8, hipY - 2);
      ctx.lineTo(centerX + 8, hipY - 2);
      ctx.moveTo(centerX - 6 * facing, hipY - 2);
      ctx.quadraticCurveTo(centerX - 18 * facing, hipY + 8 + beltWave * 0.5, centerX - 24 * facing, hipY + 22 - beltWave);
      ctx.stroke();

      // 7. Lengan Berotot + 4 Animasi Basic Attack
      let frontHand = [shoulderX + 26 * facing, shoulderY + 14];
      let frontElbow = [shoulderX + 12 * facing, shoulderY + 24];
      let backHand = [shoulderX - 12 * facing, shoulderY + 10];
      let backElbow = [shoulderX - 18 * facing, shoulderY + 22];

      if (state === 'walk') {
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
          frontHand = [shoulderX + 26 * ext * facing, shoulderY + 14];
          backElbow = [shoulderX - 20 * facing, shoulderY + 14];
          backHand = [shoulderX - 30 * facing, shoulderY + 6];
        } else {
          frontElbow = [shoulderX + 24 * ext * facing, shoulderY - 6];
          frontHand = [shoulderX + 34 * ext * facing, shoulderY - 42 * ext];
          backElbow = [shoulderX - 18 * facing, shoulderY + 18];
          backHand = [shoulderX - 26 * facing, shoulderY + 10];
        }
      } else if (['special', 'skill2'].includes(state)) {
        frontElbow = [shoulderX + 28 * facing, shoulderY + 6];
        frontHand = [shoulderX + 56 * facing, shoulderY + 6];
        backElbow = [shoulderX - 16 * facing, shoulderY + 16];
        backHand = [shoulderX - 24 * facing, shoulderY + 4];
      } else if (state === 'block') {
        frontElbow = [shoulderX + 16 * facing, shoulderY + 12];
        frontHand = [shoulderX + 18 * facing, shoulderY - 12];
        backElbow = [shoulderX + 10 * facing, shoulderY + 16];
        backHand = [shoulderX + 12 * facing, shoulderY - 8];
      }

      drawJointedLimb([shoulderX - 6 * facing, shoulderY + 2], backElbow, backHand, 6.5, 5.5, 5);
      drawJointedLimb([shoulderX + 6 * facing, shoulderY + 2], frontElbow, frontHand, 6.5, 5.5, 5);

      if (state === 'attack' && attackFrame >= 3 && attackFrame <= 9) {
        this.drawAttackArc(ctx, shoulderX, shoulderY, facing, comboStep, activeColor);
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

      // 9. Rambut & Senjata Khas (Edison, Kishimoto, Tesla, Bruce Lee)
      this.drawSignatureTraits(ctx, headX, headY, frontElbow, frontHand, facing, visuals, state);

      // 10. Visual Skill 2
      if (state === 'skill2' && attackFrame >= 5 && attackFrame <= 17) {
        this.drawSkill2Visual(ctx, centerX, y, width, height, facing, fighter.id);
      }

      // 11. Kerangka X-Ray
      if (xrayTimer > 0) {
        this.drawXraySkeleton(ctx, headX, headY, neckY, hipY);
      }
    }

    ctx.restore();
  }

  static drawAttackArc(ctx, shoulderX, shoulderY, facing, step, color) {
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
      const startAng = facing === 1 ? 0.3 : Math.PI - 0.3;
      const endAng = facing === 1 ? -1.3 : Math.PI + 1.3;
      ctx.arc(shoulderX + 12 * facing, shoulderY + 10, 52, startAng, endAng, facing === 1);
    }
    ctx.stroke();
    ctx.restore();
  }

  static drawSkill2Visual(ctx, centerX, y, width, height, facing, id) {
    ctx.save();
    if (id === 'edison' || id === 'tesla') {
      const ringColor = id === 'tesla' ? '#38bdf8' : '#fef08a';
      ctx.strokeStyle = ringColor;
      ctx.shadowColor = ringColor;
      ctx.shadowBlur = 28;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(centerX, y + height / 2, 88, 0, Math.PI * 2);
      ctx.stroke();

      for (let i = 0; i < 8; i++) {
        const ang = (Math.PI * 2 * i) / 8 + Date.now() * 0.03;
        ctx.beginPath();
        ctx.moveTo(centerX, y + height / 2);
        ctx.lineTo(centerX + Math.cos(ang) * 88, y + height / 2 + Math.sin(ang) * 88);
        ctx.stroke();
      }
    } else {
      const slashX = facing === 1 ? centerX + 15 : centerX - 115;
      ctx.strokeStyle = id === 'bruce_lee' ? '#ef4444' : '#f97316';
      ctx.shadowColor = id === 'bruce_lee' ? '#dc2626' : '#ea580c';
      ctx.shadowBlur = 25;
      ctx.lineWidth = 3.5;
      ctx.strokeRect(slashX, y + 18, 100, 105);

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(slashX + 10, y + 25);
      ctx.lineTo(slashX + 90, y + 115);
      ctx.moveTo(slashX + 90, y + 25);
      ctx.lineTo(slashX + 10, y + 115);
      ctx.stroke();
    }
    ctx.restore();
  }

  static drawSignatureTraits(ctx, headX, headY, frontElbow, frontHand, facing, visuals, state) {
    ctx.save();
    const isAttacking = ['attack', 'special', 'skill2'].includes(state);
    if (visuals.hairStyle === 'parted_goggles') {
      // Edison Muda: Rambut belah tengah + Goggles + Bola Lampu Menlo
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

      const [hx, hy] = frontHand;
      ctx.fillStyle = '#fef08a';
      ctx.shadowBlur = isAttacking ? 28 : 16;
      ctx.beginPath();
      ctx.arc(hx + 7 * facing, hy - 3, 7.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (visuals.hairStyle === 'spiky_headband') {
      // Kishimoto Muda: Ikat kepala berkibar + Rambut jabrik + Pena G-Pen raksasa
      const wave = Math.sin(Date.now() * 0.018) * 6;
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(headX - 15, headY - 6);
      ctx.lineTo(headX + 15, headY - 6);
      ctx.moveTo(headX - 15 * facing, headY - 6);
      ctx.quadraticCurveTo(headX - 30 * facing, headY - 12 + wave, headX - 44 * facing, headY + 4 - wave);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(headX - 14, headY - 9);
      ctx.lineTo(headX - 10, headY - 26);
      ctx.lineTo(headX - 2, headY - 15);
      ctx.lineTo(headX + 4, headY - 28);
      ctx.lineTo(headX + 10, headY - 15);
      ctx.lineTo(headX + 16, headY - 23);
      ctx.lineTo(headX + 14, headY - 9);
      ctx.stroke();

      const [hx, hy] = frontHand;
      const tipX = hx + (isAttacking ? 56 : 30) * facing;
      const tipY = hy - (isAttacking ? 4 : 24);

      ctx.strokeStyle = '#18181b';
      ctx.lineWidth = 5.5;
      ctx.beginPath();
      ctx.moveTo(hx - 14 * facing, hy + 10);
      ctx.lineTo(hx + 10 * facing, hy - 4);
      ctx.stroke();

      ctx.strokeStyle = '#f97316';
      ctx.fillStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(hx + 10 * facing, hy - 8);
      ctx.lineTo(tipX, tipY);
      ctx.lineTo(hx + 10 * facing, hy + 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (visuals.hairStyle === 'sleek_side') {
      // Nikola Tesla Muda: Rambut klimis belah samping + Sarung Tangan Plasma AC
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(headX - 15, headY - 7);
      ctx.quadraticCurveTo(headX, headY - 23, headX + 15 * facing, headY - 9);
      ctx.stroke();

      const [hx, hy] = frontHand;
      ctx.strokeStyle = '#7dd3fc';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = isAttacking ? 26 : 14;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(hx + 5 * facing, hy, isAttacking ? 11 : 7, 0, Math.PI * 2);
      ctx.stroke();
    } else if (visuals.hairStyle === 'wingchun_classic') {
      // Bruce Lee Muda: Rambut Wing Chun klasik + Nunchaku berputar
      ctx.fillStyle = '#09090b';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(headX, headY - 4, 16, Math.PI, 0);
      ctx.stroke();

      const [hx, hy] = frontHand;
      const swing = isAttacking ? Math.sin(Date.now() * 0.05) * 24 : 14;
      ctx.strokeStyle = '#fca5a5';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.lineTo(hx + 18 * facing, hy + 12);
      ctx.moveTo(hx + 22 * facing, hy + 12);
      ctx.lineTo(hx + (22 + swing) * facing, hy + 26);
      ctx.stroke();
    }
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
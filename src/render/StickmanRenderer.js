export class StickmanRenderer {
  static draw(ctx, fighter) {
    const { x, y, width, height, facing, state, visuals, attackFrame, xrayTimer } = fighter;
    const centerX = x + width / 2;
    const headY = y + 25;
    const neckY = y + 43;
    const hipY = y + 95;
    const footY = y + height;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Aura & Rim Light (Berubah biru X-Ray saat tulang retak)
    const activeColor = xrayTimer > 0 ? '#38bdf8' : visuals.rimColor;
    ctx.shadowColor = activeColor;
    ctx.shadowBlur = state === 'attack' || state === 'special' || xrayTimer > 0 ? 24 : 12;
    ctx.strokeStyle = activeColor;
    ctx.lineWidth = 7;

    // 1. Kaki
    const walkOffset = state === 'walk' ? Math.sin(Date.now() * 0.015) * 14 : 0;
    ctx.beginPath();
    ctx.moveTo(centerX, hipY);
    ctx.lineTo(centerX - 16 + walkOffset, footY);
    ctx.moveTo(centerX, hipY);
    ctx.lineTo(centerX + 16 - walkOffset, footY);
    ctx.stroke();

    // 2. Badan Utama
    ctx.beginPath();
    ctx.moveTo(centerX, neckY);
    ctx.lineTo(centerX, hipY);
    ctx.stroke();

    // 3. Tangan & Pose Serangan / Jurus / Blocking
    ctx.beginPath();
    if (state === 'attack' || state === 'special') {
      const punchReach = state === 'special' ? 48 * facing : attackFrame > 3 ? 58 * facing : 30 * facing;
      ctx.moveTo(centerX, neckY + 10);
      ctx.lineTo(centerX + punchReach, neckY + 12);
      ctx.moveTo(centerX, neckY + 10);
      ctx.lineTo(centerX - 15 * facing, neckY + 28);
    } else if (state === 'block') {
      ctx.moveTo(centerX, neckY + 10);
      ctx.lineTo(centerX + 20 * facing, neckY - 5);
      ctx.moveTo(centerX, neckY + 15);
      ctx.lineTo(centerX + 22 * facing, neckY + 5);
    } else {
      ctx.moveTo(centerX, neckY + 10);
      ctx.lineTo(centerX + 22 * facing, neckY + 25);
      ctx.moveTo(centerX, neckY + 10);
      ctx.lineTo(centerX - 16 * facing, neckY + 28);
    }
    ctx.stroke();

    // 4. Kepala Siluet Hitam dengan Rim Light
    ctx.fillStyle = xrayTimer > 0 ? '#020617' : '#09090b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, headY, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 5. Identitas Prime Youth (Rambut & Senjata)
    this.drawSignatureTraits(ctx, centerX, headY, neckY, facing, visuals, state);

    // 6. Efek Kerangka X-Ray Mortal Kombat saat terkena jurus / KO
    if (xrayTimer > 0) {
      this.drawXraySkeleton(ctx, centerX, headY, neckY, hipY);
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

    // Tengkorak & Rongga Mata
    ctx.beginPath();
    ctx.arc(centerX, headY, 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(centerX - 4, headY - 2, 2.5, 0, Math.PI * 2);
    ctx.arc(centerX + 4, headY - 2, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Tulang Rusuk (Ribcage)
    for (let i = 0; i < 4; i++) {
      const ribY = neckY + 12 + i * 9;
      ctx.beginPath();
      ctx.moveTo(centerX - 11, ribY);
      ctx.lineTo(centerX + 11, ribY);
      ctx.stroke();
    }

    // Garis Retakan Tulang Merah Menyala
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(centerX - 8, neckY + 15);
    ctx.lineTo(centerX + 2, neckY + 23);
    ctx.lineTo(centerX - 4, neckY + 30);
    ctx.lineTo(centerX + 9, neckY + 38);
    ctx.stroke();

    // Teks "X-RAY!" di atas kepala
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 13px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('CRACK! X-RAY', centerX, headY - 28);
    ctx.restore();
  }

  static drawSignatureTraits(ctx, centerX, headY, neckY, facing, visuals, state) {
    ctx.shadowBlur = 6;
    if (visuals.hairStyle === 'parted_goggles') {
      ctx.strokeStyle = '#e4e4e7';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX - 16, headY - 8);
      ctx.quadraticCurveTo(centerX, headY - 22, centerX + 16, headY - 8);
      ctx.stroke();

      ctx.fillStyle = '#facc15';
      ctx.fillRect(centerX + 4 * facing - 5, headY - 12, 10, 6);
    } else if (visuals.hairStyle === 'spiky_headband') {
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX - 16, headY - 6);
      ctx.lineTo(centerX + 16, headY - 6);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(centerX - 14, headY - 10);
      ctx.lineTo(centerX - 8, headY - 25);
      ctx.lineTo(centerX, headY - 15);
      ctx.lineTo(centerX + 8, headY - 26);
      ctx.lineTo(centerX + 14, headY - 10);
      ctx.stroke();

      if (state === 'attack' || state === 'special') {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(centerX + 20 * facing, neckY + 12);
        ctx.lineTo(centerX + 75 * facing, neckY + 12);
        ctx.stroke();
      }
    }
  }
}
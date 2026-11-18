import { StickmanRenderer } from '../render/StickmanRenderer.js';

export class ScreenUI {
  // 1. LAYAR UTAMA (TITLE SCREEN)
  static drawTitleScreen(ctx, canvas, menuIndex) {
    ctx.save();
    // Latar gelap radial dramatis
    const bg = ctx.createRadialGradient(canvas.width / 2, 240, 40, canvas.width / 2, 280, 560);
    bg.addColorStop(0, '#2a0808');
    bg.addColorStop(0.55, '#0c0a0d');
    bg.addColorStop(1, '#050507');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Garis bingkai arcade luar
    ctx.strokeStyle = 'rgba(220, 38, 38, 0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48);

    // Subjudul atas
    ctx.textAlign = 'center';
    ctx.fillStyle = '#a1a1aa';
    ctx.font = 'bold 14px Courier New';
    ctx.fillText('THE ULTIMATE HISTORICAL & CREATOR TOURNAMENT', canvas.width / 2, 115);

    // Logo Utama RAGNAROK
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 28;
    ctx.fillStyle = '#facc15';
    ctx.font = 'italic bold 74px Courier New';
    ctx.fillText('RAGNAROK', canvas.width / 2, 190);

    // Sub-logo STICKMAN COMBAT
    ctx.shadowColor = '#ea580c';
    ctx.shadowBlur = 16;
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 28px Courier New';
    ctx.fillText('— STICKMAN COMBAT —', canvas.width / 2, 232);
    ctx.shadowBlur = 0;

    // Tombol Pilihan Mode
    const options = [
      { label: '1P ARCADE (VS AI BOT)', desc: 'Uji kombo melawan bot taktis' },
      { label: '2P VERSUS (LOCAL DUEL)', desc: 'Duel 1v1 dalam satu keyboard' },
    ];

    options.forEach((opt, idx) => {
      const boxW = 420;
      const boxH = 58;
      const boxX = canvas.width / 2 - boxW / 2;
      const boxY = 295 + idx * 78;
      const isSelected = menuIndex === idx;

      ctx.fillStyle = isSelected ? 'rgba(220, 38, 38, 0.22)' : 'rgba(24, 24, 27, 0.75)';
      ctx.strokeStyle = isSelected ? '#facc15' : '#3f3f46';
      ctx.lineWidth = isSelected ? 2.5 : 1.5;
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      ctx.fillStyle = isSelected ? '#facc15' : '#e4e4e7';
      ctx.font = 'bold 19px Courier New';
      ctx.fillText(isSelected ? `▶ ${opt.label} ◀` : opt.label, canvas.width / 2, boxY + 26);

      ctx.fillStyle = '#a1a1aa';
      ctx.font = '12px Courier New';
      ctx.fillText(opt.desc, canvas.width / 2, boxY + 46);
    });

    // Footer navigasi
    ctx.fillStyle = '#71717a';
    ctx.font = '13px Courier New';
    ctx.fillText('Gunakan [W/S] atau [↑/↓] untuk memilih  •  Tekan [ENTER] atau [F] untuk Mulai', canvas.width / 2, canvas.height - 45);
    ctx.restore();
  }

  // 2. LAYAR PEMILIHAN KARAKTER (CHARACTER SELECT SCREEN)
  static drawCharacterSelect(ctx, canvas, fighters, selectState, gameMode) {
    ctx.save();
    ctx.fillStyle = '#070709';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header
    ctx.textAlign = 'center';
    ctx.fillStyle = '#facc15';
    ctx.font = 'italic bold 32px Courier New';
    ctx.fillText('CHOOSE YOUR FIGHTER', canvas.width / 2, 54);

    ctx.fillStyle = '#a1a1aa';
    ctx.font = '13px Courier New';
    ctx.fillText(
      gameMode === '1P'
        ? 'MODE: 1P ARCADE  |  P1 Pilih & Kunci [F], lalu Pilih Lawan AI & Kunci [F/K]'
        : 'MODE: 2P VERSUS  |  P1: [A/D] + [F] Kunci   •   P2: [←/→] + [K] Kunci',
      canvas.width / 2,
      80
    );

    const p1Data = fighters[selectState.p1Index];
    const p2Data = fighters[selectState.p2Index];

    // Panel Preview P1 (Kiri) & P2 (Kanan)
    this.drawFighterPreviewCard(ctx, 40, 105, 290, 275, p1Data, 'PLAYER 1', selectState.p1Locked, 1);
    this.drawFighterPreviewCard(
      ctx,
      canvas.width - 330,
      105,
      290,
      275,
      p2Data,
      gameMode === '1P' ? 'CPU / AI OPPONENT' : 'PLAYER 2',
      selectState.p2Locked,
      -1
    );

    // Teks VS di tengah
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 18;
    ctx.font = 'italic bold 48px Courier New';
    ctx.fillText('VS', canvas.width / 2, 245);
    ctx.shadowBlur = 0;

    // Grid Kartu Roster di Bagian Bawah
    const cardW = 195;
    const cardH = 105;
    const gap = 22;
    const totalW = fighters.length * cardW + (fighters.length - 1) * gap;
    const startX = (canvas.width - totalW) / 2;
    const startY = 410;

    fighters.forEach((f, idx) => {
      const cx = startX + idx * (cardW + gap);
      const isP1 = selectState.p1Index === idx;
      const isP2 = selectState.p2Index === idx;

      ctx.fillStyle = '#121216';
      ctx.fillRect(cx, startY, cardW, cardH);

      // Bingkai seleksi P1 (Kuning) / P2 (Oranye/Merah)
      ctx.lineWidth = isP1 || isP2 ? 3 : 1.5;
      ctx.strokeStyle = isP1 && isP2 ? '#38bdf8' : isP1 ? '#facc15' : isP2 ? '#ef4444' : '#27272a';
      ctx.strokeRect(cx, startY, cardW, cardH);

      // Badge P1 / P2 di sudut kartu
      ctx.font = 'bold 11px Courier New';
      if (isP1) {
        ctx.fillStyle = '#facc15';
        ctx.textAlign = 'left';
        ctx.fillText(selectState.p1Locked ? 'P1 READY' : 'P1', cx + 8, startY + 16);
      }
      if (isP2) {
        ctx.fillStyle = '#ef4444';
        ctx.textAlign = 'right';
        ctx.fillText(selectState.p2Locked ? 'P2 READY' : 'P2', cx + cardW - 8, startY + 16);
      }

      // Nama & Fraksi
      ctx.textAlign = 'center';
      ctx.fillStyle = f.visuals.rimColor;
      ctx.font = 'bold 13px Courier New';
      ctx.fillText(f.name.split(' ').slice(-1)[0].toUpperCase(), cx + cardW / 2, startY + 46);

      ctx.fillStyle = '#a1a1aa';
      ctx.font = '10px Courier New';
      ctx.fillText(f.faction, cx + cardW / 2, startY + 64);

      ctx.fillStyle = '#71717a';
      ctx.fillText(`[${f.archetype.toUpperCase()}]`, cx + cardW / 2, startY + 84);
    });

    ctx.fillStyle = '#71717a';
    ctx.font = '12px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('Tekan [ESC] untuk kembali ke Title Screen', canvas.width / 2, canvas.height - 18);
    ctx.restore();
  }

  static drawFighterPreviewCard(ctx, x, y, w, h, fighterData, roleLabel, isLocked, facing) {
    ctx.save();
    ctx.fillStyle = isLocked ? 'rgba(220, 38, 38, 0.14)' : '#121216';
    ctx.strokeStyle = isLocked ? '#22c55e' : fighterData.visuals.rimColor;
    ctx.lineWidth = 2;
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);

    // Label Player & Status Locked
    ctx.font = 'bold 12px Courier New';
    ctx.textAlign = 'left';
    ctx.fillStyle = isLocked ? '#4ade80' : '#a1a1aa';
    ctx.fillText(isLocked ? `${roleLabel} — LOCKED ✓` : roleLabel, x + 12, y + 20);

    // Render Preview Stickman Hidup di dalam Kotak Preview
    const dummyFighter = {
      x: x + w / 2 - 25,
      y: y + 48,
      width: 50,
      height: 145,
      facing,
      state: 'idle',
      visuals: fighterData.visuals,
      attackFrame: 0,
      xrayTimer: 0,
      afterimages: [],
      invulnerable: false,
      vx: 0,
      walkPhase: 0,
      comboStep: 0,
    };
    StickmanRenderer.draw(ctx, dummyFighter, y + 193);

    // Nama Lengkap & Statistik Bar
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f4f4f5';
    ctx.font = 'bold 14px Courier New';
    ctx.fillText(fighterData.name.toUpperCase(), x + w / 2, y + 218);

    ctx.fillStyle = fighterData.visuals.rimColor;
    ctx.font = '11px Courier New';
    ctx.fillText(`Jurus: ${fighterData.specialMove.name}`, x + w / 2, y + 236);

    // Bar Speed & Power ringkas
    ctx.textAlign = 'left';
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '10px Courier New';
    ctx.fillText('SPD', x + 16, y + 256);
    ctx.fillStyle = '#27272a';
    ctx.fillRect(x + 42, y + 248, 85, 7);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(x + 42, y + 248, (fighterData.stats.speed / 10) * 85, 7);

    ctx.fillStyle = '#a1a1aa';
    ctx.fillText('PWR', x + 145, y + 256);
    ctx.fillStyle = '#27272a';
    ctx.fillRect(x + 170, y + 248, 95, 7);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x + 170, y + 248, (fighterData.stats.power / 100) * 95, 7);

    ctx.restore();
  }

  // 3. OVERLAY DAFTAR JURUS & KONTROL ([TAB])
  static drawMoveListOverlay(ctx, canvas, p1, p2) {
    ctx.save();
    ctx.fillStyle = 'rgba(5, 5, 8, 0.88)';
    ctx.fillRect(90, 95, canvas.width - 180, canvas.height - 190);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.strokeRect(90, 95, canvas.width - 180, canvas.height - 190);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 24px Courier New';
    ctx.fillText('COMMAND & MOVE LIST (PAUSED)', canvas.width / 2, 135);

    const rows = [
      ['Gerak & Lompat', 'W / A / D', '↑ / ← / →'],
      ['Bertahan (Block)', 'Tahan S', 'Tahan ↓'],
      ['Dash / Roll Kebal', 'Q / E', 'M / ,'],
      ['4-Hit Basic Combo', 'F (Tekan 4x)', 'K (Tekan 4x)'],
      ['High Kick', 'R', '. (Titik)'],
      ['Skill 1 (Proyektil)', `G (${p1.specialMove.name})`, `L (${p2.specialMove.name})`],
      ['Skill 2 (Area Burst)', 'T (Overload)', '/ (Slash Burst)'],
    ];

    ctx.font = 'bold 13px Courier New';
    ctx.fillStyle = '#a1a1aa';
    ctx.fillText('AKSI', 240, 172);
    ctx.fillStyle = '#facc15';
    ctx.fillText('PLAYER 1', 512, 172);
    ctx.fillStyle = '#f97316';
    ctx.fillText('PLAYER 2', 775, 172);

    rows.forEach((r, i) => {
      const ry = 205 + i * 32;
      ctx.fillStyle = '#e4e4e7';
      ctx.font = '13px Courier New';
      ctx.fillText(r[0], 240, ry);
      ctx.fillStyle = '#fef08a';
      ctx.fillText(r[1], 512, ry);
      ctx.fillStyle = '#fdba74';
      ctx.fillText(r[2], 775, ry);
    });

    ctx.fillStyle = '#71717a';
    ctx.font = '12px Courier New';
    ctx.fillText('Tekan [TAB] untuk Lanjut Bertarung  •  Tekan [ESC] untuk Ganti Karakter', canvas.width / 2, canvas.height - 115);
    ctx.restore();
  }
}
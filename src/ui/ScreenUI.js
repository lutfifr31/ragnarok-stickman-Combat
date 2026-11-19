import { StickmanRenderer } from '../render/StickmanRenderer.js';

export class ScreenUI {
  static drawTitleScreen(ctx, canvas, menuIndex, selectingDifficulty = false, difficultyIndex = 1) {
    ctx.save();
    const bg = ctx.createRadialGradient(canvas.width / 2, 240, 40, canvas.width / 2, 280, 560);
    bg.addColorStop(0, '#2a0808');
    bg.addColorStop(0.55, '#0c0a0d');
    bg.addColorStop(1, '#050507');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(220, 38, 38, 0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#a1a1aa';
    ctx.font = 'bold 14px Courier New';
    ctx.fillText('2V2 TAG-TEAM HISTORICAL & CREATOR TOURNAMENT', canvas.width / 2, 95);

    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 28;
    ctx.fillStyle = '#facc15';
    ctx.font = 'italic bold 72px Courier New';
    ctx.fillText('RAGNAROK', canvas.width / 2, 165);

    ctx.shadowColor = '#ea580c';
    ctx.shadowBlur = 16;
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 26px Courier New';
    ctx.fillText('— STICKMAN TAG COMBAT —', canvas.width / 2, 205);
    ctx.shadowBlur = 0;

    if (!selectingDifficulty) {
      const options = [
        { label: '1P TAG ARCADE (VS AI BOT)', desc: 'Pilih 2 Petarung (Main + Partner) melawan Tim AI' },
        { label: '2P TAG VERSUS (LOCAL DUEL)', desc: 'Duel Tag-Team 2v2 dalam satu keyboard' },
        { label: 'TRAINING MODE (LAB & HITBOX)', desc: 'Latihan kombo, Red Life, Meter & Hitbox Viewer [F1-F3]' },
      ];

      options.forEach((opt, idx) => {
        const boxW = 470;
        const boxH = 54;
        const boxX = canvas.width / 2 - boxW / 2;
        const boxY = 250 + idx * 68;
        const isSelected = menuIndex === idx;

        ctx.fillStyle = isSelected ? 'rgba(220, 38, 38, 0.24)' : 'rgba(24, 24, 27, 0.78)';
        ctx.strokeStyle = isSelected ? '#facc15' : '#3f3f46';
        ctx.lineWidth = isSelected ? 2.5 : 1.5;
        ctx.fillRect(boxX, boxY, boxW, boxH);
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        ctx.fillStyle = isSelected ? '#facc15' : '#e4e4e7';
        ctx.font = 'bold 18px Courier New';
        ctx.fillText(isSelected ? `▶ ${opt.label} ◀` : opt.label, canvas.width / 2, boxY + 24);

        ctx.fillStyle = '#a1a1aa';
        ctx.font = '11px Courier New';
        ctx.fillText(opt.desc, canvas.width / 2, boxY + 42);
      });

      ctx.fillStyle = '#71717a';
      ctx.font = '13px Courier New';
      ctx.fillText('Gunakan [W/S] atau [↑/↓] untuk memilih  •  Tekan [ENTER] atau [F] untuk Lanjut', canvas.width / 2, canvas.height - 42);
    } else {
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 20px Courier New';
      ctx.fillText('SELECT AI BOT DIFFICULTY', canvas.width / 2, 252);

      const diffs = [
        { key: 'EASY', desc: 'Reaksi lambat (24f), kombo 1-2 hit, jarang bertahan' },
        { key: 'NORMAL', desc: 'Reaksi sedang (14f), kombo 2-3 hit, blokir & proyektil seimbang' },
        { key: 'HARD', desc: 'Reaksi kilat (6f), kombo 4-hit penuh, whiff punish, roll & Tag Counter' },
      ];

      diffs.forEach((d, idx) => {
        const boxW = 470;
        const boxH = 54;
        const boxX = canvas.width / 2 - boxW / 2;
        const boxY = 275 + idx * 66;
        const isSelected = difficultyIndex === idx;

        ctx.fillStyle = isSelected ? 'rgba(56, 189, 248, 0.2)' : 'rgba(24, 24, 27, 0.8)';
        ctx.strokeStyle = isSelected ? '#38bdf8' : '#3f3f46';
        ctx.lineWidth = isSelected ? 2.5 : 1.5;
        ctx.fillRect(boxX, boxY, boxW, boxH);
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        ctx.fillStyle = isSelected ? '#38bdf8' : '#e4e4e7';
        ctx.font = 'bold 18px Courier New';
        ctx.fillText(isSelected ? `▶ ${d.key} ◀` : d.key, canvas.width / 2, boxY + 24);

        ctx.fillStyle = '#a1a1aa';
        ctx.font = '11px Courier New';
        ctx.fillText(d.desc, canvas.width / 2, boxY + 42);
      });

      ctx.fillStyle = '#71717a';
      ctx.font = '13px Courier New';
      ctx.fillText('[W/S] Pilih Level  •  [ENTER/F] Konfirmasi  •  [ESC] Kembali', canvas.width / 2, canvas.height - 42);
    }

    ctx.restore();
  }

  static drawCharacterSelect(ctx, canvas, fighters, selectState, gameMode, botDifficulty = 'NORMAL') {
    ctx.save();
    ctx.fillStyle = '#070709';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#facc15';
    ctx.font = 'italic bold 28px Courier New';
    ctx.fillText('SELECT YOUR TAG TEAM (10 LEGENDS)', canvas.width / 2, 42);

    ctx.fillStyle = '#a1a1aa';
    ctx.font = '12px Courier New';
    const subPrompt =
      gameMode === 'TRAINING'
        ? 'TRAINING: Pilih 2 Tim Anda dengan [A/D] + [F], lalu 2 Tim Dummy dengan [A/D] + [F/K]'
        : gameMode === '1P'
          ? `1P (${botDifficulty}): [A/D] + [F] Pilih Main & Partner  •  Lalu pilih Tim AI dengan [A/D] + [F/K]`
          : 'P1: [A/D] + [F] Pilih 2 Petarung  •  P2: [←/→] + [K] Pilih 2 Petarung';
    ctx.fillText(subPrompt, canvas.width / 2, 64);

    const p1Main = fighters[selectState.p1Index];
    const p1Partner = selectState.p1Team.length > 1 ? fighters[selectState.p1Team[1]] : null;
    const p2Main = fighters[selectState.p2Index];
    const p2Partner = selectState.p2Team.length > 1 ? fighters[selectState.p2Team[1]] : null;

    this.drawTeamPreviewCard(
      ctx, 40, 82, 310, 290,
      p1Main, p1Partner,
      'PLAYER 1 TEAM',
      selectState.p1Team.length,
      1
    );

    const rightTitle =
      gameMode === 'TRAINING'
        ? 'TRAINING DUMMY TEAM'
        : gameMode === '1P'
          ? `CPU / AI [${botDifficulty}]`
          : 'PLAYER 2 TEAM';

    this.drawTeamPreviewCard(
      ctx, canvas.width - 350, 82, 310, 290,
      p2Main, p2Partner,
      rightTitle,
      selectState.p2Team.length,
      -1
    );

    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 18;
    ctx.font = 'italic bold 46px Courier New';
    ctx.fillText('VS', canvas.width / 2, 232);
    ctx.shadowBlur = 0;

    // Grid Roster 5 Kolom x 2 Baris (10 Karakter)
    const cols = 5;
    const cardW = 176;
    const cardH = 68;
    const gapX = 14;
    const gapY = 10;
    const totalW = cols * cardW + (cols - 1) * gapX;
    const startX = (canvas.width - totalW) / 2;
    const startY = 390;

    fighters.forEach((f, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const cx = startX + col * (cardW + gapX);
      const cy = startY + row * (cardH + gapY);
      const isP1Cursor = selectState.p1Index === idx;
      const isP2Cursor = selectState.p2Index === idx;
      const p1Slot = selectState.p1Team.indexOf(idx);
      const p2Slot = selectState.p2Team.indexOf(idx);

      ctx.fillStyle = '#121216';
      ctx.fillRect(cx, cy, cardW, cardH);

      ctx.lineWidth = isP1Cursor || isP2Cursor ? 2.5 : 1.5;
      ctx.strokeStyle = isP1Cursor && isP2Cursor ? '#38bdf8' : isP1Cursor ? '#facc15' : isP2Cursor ? '#ef4444' : '#27272a';
      ctx.strokeRect(cx, cy, cardW, cardH);

      ctx.font = 'bold 9px Courier New';
      if (p1Slot !== -1 || isP1Cursor) {
        ctx.fillStyle = p1Slot !== -1 ? '#4ade80' : '#facc15';
        ctx.textAlign = 'left';
        const label = p1Slot === 0 ? 'P1 MAIN✓' : p1Slot === 1 ? 'P1 SUB✓' : 'P1';
        ctx.fillText(label, cx + 6, cy + 13);
      }
      if (p2Slot !== -1 || isP2Cursor) {
        ctx.fillStyle = p2Slot !== -1 ? '#4ade80' : '#ef4444';
        ctx.textAlign = 'right';
        const label = p2Slot === 0 ? 'P2 MAIN✓' : p2Slot === 1 ? 'P2 SUB✓' : 'P2';
        ctx.fillText(label, cx + cardW - 6, cy + 13);
      }

      ctx.textAlign = 'center';
      ctx.fillStyle = f.visuals.rimColor;
      ctx.font = 'bold 12px Courier New';
      ctx.fillText(f.name.toUpperCase(), cx + cardW / 2, cy + 36);

      ctx.fillStyle = '#a1a1aa';
      ctx.font = '9px Courier New';
      ctx.fillText(f.archetype, cx + cardW / 2, cy + 54);
    });

    ctx.fillStyle = '#71717a';
    ctx.font = '12px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('[ESC] Kembali ke Title Screen  •  Setiap tim wajib memilih 2 petarung berbeda', canvas.width / 2, canvas.height - 14);
    ctx.restore();
  }

  static drawTeamPreviewCard(ctx, x, y, w, h, activeData, partnerData, roleLabel, lockedCount, facing) {
    ctx.save();
    const isTeamReady = lockedCount === 2;
    ctx.fillStyle = isTeamReady ? 'rgba(34, 197, 94, 0.1)' : '#121216';
    ctx.strokeStyle = isTeamReady ? '#22c55e' : activeData.visuals.rimColor;
    ctx.lineWidth = 2;
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);

    ctx.font = 'bold 12px Courier New';
    ctx.textAlign = 'left';
    ctx.fillStyle = isTeamReady ? '#4ade80' : '#facc15';
    const statusText = lockedCount === 0 ? 'PILIH MAIN [1/2]' : lockedCount === 1 ? 'PILIH PARTNER [2/2]' : 'TEAM READY ✓';
    ctx.fillText(`${roleLabel} • ${statusText}`, x + 12, y + 20);

    const dummyMain = {
      id: activeData.id,
      x: x + w / 2 - 25 - (partnerData ? 26 * facing : 0),
      y: y + 48,
      width: 50,
      height: 145,
      facing,
      state: 'idle',
      visuals: activeData.visuals,
      skills: activeData.skills,
      attackFrame: 0,
      xrayTimer: 0,
      afterimages: [],
      invulnerable: false,
      vx: 0,
      walkPhase: 0,
      comboStep: 0,
      comboChain: [],
      weaponMode: 'saber',
      mountTimer: 0,
    };
    StickmanRenderer.draw(ctx, dummyMain, y + 193);

    if (partnerData) {
      ctx.save();
      ctx.globalAlpha = 0.78;
      const dummyPartner = {
        ...dummyMain,
        id: partnerData.id,
        x: x + w / 2 - 25 + 42 * facing,
        y: y + 42,
        visuals: partnerData.visuals,
        skills: partnerData.skills,
      };
      StickmanRenderer.draw(ctx, dummyPartner, y + 187);
      ctx.restore();
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = '#f4f4f5';
    ctx.font = 'bold 13px Courier New';
    ctx.fillText(`MAIN: ${activeData.name.toUpperCase()}`, x + w / 2, y + 216);

    ctx.fillStyle = partnerData ? partnerData.visuals.rimColor : '#71717a';
    ctx.font = 'bold 12px Courier New';
    ctx.fillText(
      partnerData ? `PARTNER: ${partnerData.name.toUpperCase()}` : 'PARTNER: (Belum Dipilih)',
      x + w / 2,
      y + 236
    );

    ctx.fillStyle = '#a1a1aa';
    ctx.font = '10px Courier New';
    ctx.fillText(`S1: ${activeData.skills.skill1.name}  |  S2: ${activeData.skills.skill2.name}`, x + w / 2, y + 258);
    ctx.restore();
  }

  static drawMoveListOverlay(ctx, canvas, p1, p2) {
    ctx.save();
    ctx.fillStyle = 'rgba(5, 5, 8, 0.92)';
    ctx.fillRect(75, 58, canvas.width - 150, canvas.height - 116);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.strokeRect(75, 58, canvas.width - 150, canvas.height - 116);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 23px Courier New';
    ctx.fillText('TAG-TEAM COMMAND & MOVE LIST (PAUSED)', canvas.width / 2, 94);

    const rows = [
      ['Gerak & Lompat', 'W / A / D', '↑ / ← / →'],
      ['Bertahan (Block)', 'Tahan S', 'Tahan ↓'],
      ['Quick Dash / Evasive Roll', 'Q (Dash) / X (Roll)', 'M (Dash) / N (Roll)'],
      ['SWITCH CHARACTER (Tag-In)', 'E (Ganti Partner)', ', (Koma - Ganti Partner)'],
      ['TAG COUNTER (Saat Block, 1 Bar)', 'Tahan S + E (100 Meter)', 'Tahan ↓ + , (100 Meter)'],
      ['4-Hit Mixup Combo', 'F (Punch) + R (Kick)', 'K (Punch) + . (Kick)'],
      ['Skill 1 (Signature 1)', `G (${p1.skills.skill1.name})`, `L (${p2.skills.skill1.name})`],
      ['Skill 2 (Signature 2)', `T (${p1.skills.skill2.name})`, `/ (${p2.skills.skill2.name})`],
    ];

    ctx.font = 'bold 13px Courier New';
    ctx.fillStyle = '#a1a1aa';
    ctx.fillText('AKSI', 235, 130);
    ctx.fillStyle = '#facc15';
    ctx.fillText('PLAYER 1', 515, 130);
    ctx.fillStyle = '#f97316';
    ctx.fillText('PLAYER 2', 780, 130);

    rows.forEach((r, i) => {
      const ry = 160 + i * 31;
      const isHighlight = i === 3 || i === 4;
      ctx.fillStyle = isHighlight ? '#38bdf8' : '#e4e4e7';
      ctx.font = isHighlight ? 'bold 13px Courier New' : '13px Courier New';
      ctx.fillText(r[0], 235, ry);
      ctx.fillStyle = '#fef08a';
      ctx.fillText(r[1], 515, ry);
      ctx.fillStyle = '#fdba74';
      ctx.fillText(r[2], 780, ry);
    });

    ctx.fillStyle = '#71717a';
    ctx.font = '12px Courier New';
    ctx.fillText('[F1] Hitbox Viewer  •  Training: [F2] Reset HP/Posisi, [F3] Mode Dummy  •  [TAB] Tutup', canvas.width / 2, canvas.height - 76);
    ctx.restore();
  }
}
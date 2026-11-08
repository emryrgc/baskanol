// ANA SAYFA (Kampanya Merkezi): aday ortada, göstergeler, takvim, anket, butonlar ve rastgele olaylar.
window.BO = window.BO || {};

BO.HubScene = class extends Phaser.Scene {
  constructor() { super('Hub'); }

  create() {
    BO.normalizeOy();
    const S = BO.state;

    // Özel günler: seçim / münazara / anket ekranlarına yönlendir
    if (S.faz === 'sabah') {
      const ozel = BO.ozelGun(S.gun);
      if (ozel === 'secim') { this.scene.start('Election'); return; }
      if (ozel && !S.ozel[S.gun]) {
        S.ozel[S.gun] = true;
        BO.save();
        this.scene.start(ozel === 'anket' ? 'Poll' : 'Debate');
        return;
      }
    }
    BO.save();
    this.draw();

    // Sabah rastgele olay
    if (S.faz === 'sabah' && S.olayGun !== S.gun && S.gun > 1) {
      S.olayGun = S.gun;
      if (Math.random() < 0.4) this.time.delayedCall(450, () => this.showEvent(Phaser.Utils.Array.GetRandom(BO.OLAYLAR)));
    }
  }

  draw() {
    const W = this.scale.width, H = this.scale.height, P = BO.PAL, S = BO.state;
    const aksam = S.faz === 'aksam';
    const C = (k) => Phaser.Display.Color.HexStringToColor(P[k] || k).color;
    this.C = C;

    // --- Üst bar + takvim ---
    this.add.rectangle(0, 0, W, H, C('k')).setOrigin(0);
    BO.text(this, W / 2, 3, 'GÜN ' + S.gun + '/60 - ' + (aksam ? 'AKŞAM' : 'SABAH'), { color: aksam ? P.L : P.y, ox: 0.5 });
    const cx0 = 15, cw = 150;
    for (let g = 1; g <= BO.SON_GUN; g++) {
      const x = cx0 + Math.floor((g - 1) * cw / BO.SON_GUN);
      const oz = BO.ozelGun(g);
      const col = g < S.gun ? C('o') : g === S.gun ? C('y') : C('N');
      this.add.rectangle(x, 14, 2, 5, col).setOrigin(0);
      if (oz) this.add.rectangle(x, 12, 2, 1, C(oz === 'secim' ? 'r' : oz === 'munazara' ? 'c' : 'l')).setOrigin(0);
    }
    const sir = BO.siradakiOzel(S.gun + (S.faz === 'sabah' && BO.ozelGun(S.gun) ? 1 : 0)) || BO.siradakiOzel(S.gun);
    if (sir) {
      const ad = { anket: 'ANKET', munazara: 'MÜNAZARA', secim: 'SEÇİM' }[sir.tip];
      const kalan = sir.gun - S.gun;
      BO.text(this, W / 2, 22, kalan <= 0 ? ad + ': BUGÜN' : ad + ': ' + kalan + ' GÜN SONRA', { color: P.L, ox: 0.5 });
    }

    // --- Oda ---
    const roomTop = 34, roomBottom = H - 150;
    this.add.rectangle(0, roomTop, W, roomBottom - roomTop, C(aksam ? '#1f2547' : '#3b5dc9')).setOrigin(0);
    const wx = 62, wy = roomTop + 6, ww = 56, wh = 30;
    this.add.rectangle(wx - 2, wy - 2, ww + 4, wh + 4, C('k')).setOrigin(0);
    this.add.rectangle(wx, wy, ww, wh, C(aksam ? 'B' : 't')).setOrigin(0);
    if (aksam) {
      this.add.rectangle(wx + 40, wy + 5, 7, 7, C('w')).setOrigin(0);
      this.add.rectangle(wx + 42, wy + 5, 5, 5, C('B')).setOrigin(0);
      [[6, 5], [18, 12], [30, 4], [10, 22], [48, 22], [26, 18]].forEach(([x, y]) => this.add.rectangle(wx + x, wy + y, 1, 1, C('w')).setOrigin(0));
    } else {
      this.add.rectangle(wx + 40, wy + 5, 9, 9, C('y')).setOrigin(0);
      this.add.rectangle(wx + 6, wy + 12, 16, 4, C('w')).setOrigin(0);
      this.add.rectangle(wx + 10, wy + 10, 8, 2, C('w')).setOrigin(0);
    }
    this.add.rectangle(wx + ww / 2 - 1, wy, 2, wh, C('k')).setOrigin(0);
    this.add.rectangle(wx - 8, wy + wh + 4, ww + 16, 13, C('o')).setOrigin(0);
    BO.text(this, W / 2, wy + wh + 7, 'OY VER!', { color: P.k, ox: 0.5 });
    this.add.rectangle(0, roomBottom - 16, W, 16, C('m')).setOrigin(0);
    this.add.rectangle(0, roomBottom - 16, W, 1, C('k')).setOrigin(0);
    const podY = roomBottom - 22;
    this.add.rectangle(W / 2 - 18, podY, 36, 16, C('k')).setOrigin(0);
    this.add.rectangle(W / 2 - 17, podY + 1, 34, 14, C('E')).setOrigin(0);
    this.add.rectangle(W / 2 - 6, podY + 5, 12, 6, C('o')).setOrigin(0);
    const aday = this.add.sprite(W / 2, podY + 2, 'aday0').setOrigin(0.5, 1).setScale(3).play('el_salla');
    this.tweens.add({ targets: aday, y: aday.y - 2, duration: 500, yoyo: true, repeat: -1 });

    // --- Göstergeler ---
    this.cards = {};
    const card = (key, x, y, label, value, color) => {
      this.add.rectangle(x, y, 52, 28, C('k'), 0.85).setOrigin(0).setStrokeStyle(1, C('n'));
      BO.text(this, x + 26, y + 4, label, { color: P.L, ox: 0.5 });
      this.cards[key] = BO.text(this, x + 26, y + 16, value, { color: color, ox: 0.5 });
    };
    const y1 = roomTop + 6, y2 = roomTop + 40;
    card('oy', 4, y1, 'OY', '', P.l);
    card('itibar', 4, y2, 'İTİBAR', '', P.w);
    this.add.rectangle(10, y2 + 17, 40, 6, C('N')).setOrigin(0);
    this.itibarBar = this.add.rectangle(10, y2 + 17, 0, 6, C('g')).setOrigin(0);
    card('kasa', 124, y1, 'KASA', '', P.y);
    card('erzak', 124, y2, 'ERZAK', '', P.w);
    this.refreshCards();

    // --- Anket ---
    let y = roomBottom + 6;
    BO.text(this, 6, y, 'ANKET', { color: P.y });
    y += 13;
    const rows = [{ ad: 'BİZ', renk: 'o', oy: S.oy }]
      .concat(BO.RIVALS.map((r) => ({ ad: r.kisa, renk: r.renk, oy: BO.rakip(r.id).oy })))
      .concat([{ ad: 'KARARSIZ', renk: 'n', oy: S.kararsiz }]);
    const max = Math.max.apply(null, rows.map((r) => r.oy));
    rows.forEach((r) => {
      this.add.rectangle(6, y + 1, 6, 6, C(r.renk)).setOrigin(0);
      BO.text(this, 15, y, r.ad, { color: r.ad === 'BİZ' ? P.y : P.w });
      this.add.rectangle(84, y + 1, Math.max(1, Math.round(48 * r.oy / max)), 6, C(r.renk)).setOrigin(0);
      BO.text(this, W - 6, y, '%' + r.oy.toFixed(1), { color: P.L, ox: 1 });
      y += 11;
    });

    // --- Butonlar ---
    if (!aksam) {
      const b = BO.button(this, W / 2, H - 46, 164, 22, 'GÜNDÜZ: SAHAYA İN', { fill: 'y', shade: 'o', onClick: () => this.go('Day') });
      this.tweens.add({ targets: b, scale: 1.04, duration: 500, yoyo: true, repeat: -1 });
      BO.button(this, 46, H - 18, 84, 16, 'GÜNÜ ATLA', { fill: 'n', shade: 'N', color: 'w', onClick: () => this.skip(1) });
      BO.button(this, W - 46, H - 18, 84, 16, 'HAFTA ATLA', { fill: 'n', shade: 'N', color: 'w', onClick: () => this.skip(7) });
    } else {
      const b = BO.button(this, W / 2, H - 46, 164, 22, 'GECE: OPERASYON', { fill: 'p', shade: 'k', color: 'w', onClick: () => this.go('Night') });
      this.tweens.add({ targets: b, scale: 1.04, duration: 500, yoyo: true, repeat: -1 });
      BO.button(this, W / 2, H - 18, 164, 16, 'GECEYİ ATLA', {
        fill: 'n', shade: 'N', color: 'w',
        onClick: () => this.go('Morning', { log: [] }),
      });
    }

    this.cameras.main.fadeIn(300, 26, 28, 44);
  }

  refreshCards() {
    const S = BO.state, C = this.C;
    this.cards.oy.setText('%' + S.oy.toFixed(1));
    this.cards.itibar.setText('');
    this.itibarBar.width = Math.round(40 * S.itibar / 100);
    this.itibarBar.fillColor = C(S.itibar > 60 ? 'g' : S.itibar > 30 ? 'y' : 'r');
    this.cards.kasa.setText(S.kasa >= 100000 ? Math.round(S.kasa / 1000) + 'B' : BO.tl(S.kasa).replace(' TL', ''));
    this.cards.erzak.setText(String(S.erzak));
  }

  go(scene, data) {
    BO.sfx.unlock();
    this.cameras.main.fadeOut(250, 26, 28, 44);
    this.time.delayedCall(260, () => this.scene.start(scene, data));
  }

  // Gün/hafta atla: özel güne gelince durur
  skip(n) {
    const S = BO.state, gunler = [];
    for (let i = 0; i < n; i++) {
      gunler.push(BO.otomatikGun());
      if (BO.ozelGun(S.gun)) break;
    }
    this.go('Skip', { gunler });
  }

  // ---------- Rastgele olay penceresi ----------
  showEvent(ev) {
    const W = this.scale.width, H = this.scale.height, P = BO.PAL, S = BO.state;
    const ui = [];
    const add = (o) => { o.setDepth(500); ui.push(o); return o; };
    add(this.add.rectangle(0, 0, W, H, 0x000000, 0.6).setOrigin(0).setInteractive());
    const top = Math.round(H * 0.18);
    add(this.add.rectangle(8, top, W - 16, 150, 0xf4f4f4).setOrigin(0));
    add(this.add.rectangle(8, top, W - 16, 14, 0xb13e53).setOrigin(0));
    add(BO.text(this, W / 2, top + 3, 'OLAY!', { color: P.w, ox: 0.5 }));
    add(BO.text(this, W / 2, top + 20, ev.baslik, { color: P.k, ox: 0.5 }));
    const metin = add(BO.text(this, W / 2, top + 34, ev.metin, { color: P.n, ox: 0.5, align: 'center' }));
    let by = top + 80;
    const btns = [];
    ev.secenek.forEach((o) => {
      const h = o.label.includes('\n') ? 22 : 14;
      const yetmez = o.etki.kasa < 0 && S.kasa < -o.etki.kasa;
      const b = add(BO.button(this, W / 2, by + h / 2, 150, h, o.label, {
        fill: yetmez ? 'L' : 'y', shade: yetmez ? 'n' : 'o', depth: 510,
        onClick: () => {
          if (yetmez) { BO.floatText(this, W / 2, by, 'KASADA PARA YOK!', P.r); return; }
          btns.forEach((x) => x.destroy());
          let sec = o;
          if (o.risk && Math.random() < 0.5) sec = o.risk;
          const e = sec.etki || {};
          if (e.kasa) S.kasa += e.kasa;
          if (e.itibar) S.itibar = BO.clamp(S.itibar + e.itibar, 0, 100);
          if (e.oy) S.oy = Math.max(0, S.oy + e.oy);
          if (e.erzak) S.erzak = Math.max(0, S.erzak + e.erzak);
          BO.normalizeOy();
          BO.save();
          this.refreshCards();
          metin.setText(sec.sonuc).setColor(P.r);
          const ozet = [];
          if (e.oy) ozet.push('OY ' + (e.oy > 0 ? '+' : '') + e.oy.toFixed(1));
          if (e.itibar) ozet.push('İTİBAR ' + (e.itibar > 0 ? '+' : '') + e.itibar);
          if (e.kasa) ozet.push((e.kasa > 0 ? '+' : '') + BO.tl(e.kasa));
          if (e.erzak) ozet.push('ERZAK ' + (e.erzak > 0 ? '+' : '') + e.erzak);
          add(BO.text(this, W / 2, top + 84, ozet.join('\n') || 'ETKİSİ YOK', { color: P.B, ox: 0.5, align: 'center' }));
          add(BO.button(this, W / 2, top + 136, 100, 14, 'TAMAM', {
            fill: 'y', shade: 'o', depth: 510,
            onClick: () => ui.forEach((x) => x.destroy()),
          }));
        },
      }));
      btns.push(b);
      by += h + 8;
    });
    BO.sfx.alarm();
  }
};

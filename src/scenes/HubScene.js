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

    // Yeni görev açıldı mı?
    const yeni = BO.GOREVLER.gunduz.concat(BO.GOREVLER.gece).filter((g) => g.gun === S.gun && g.gun > 1);
    if (yeni.length && !(S.duyuru || {})[S.gun]) {
      S.duyuru = S.duyuru || {}; S.duyuru[S.gun] = true; S.olayGun = S.gun;
      this.time.delayedCall(450, () => this.modal('YENİ GÖREV!', yeni.map((g) => g.ad + '\n' + g.acik).join('\n\n') + '\n\nYENİ GÖREVLER ARTIK\nARA SIRA KARŞINA\nÇIKACAK!', [{ label: 'SÜPER!', onPick: (k) => k() }]));
    }
    // Sabah rastgele olay
    if (S.faz === 'sabah' && S.olayGun !== S.gun && S.gun > 1) {
      S.olayGun = S.gun;
      if (Math.random() < 0.4) this.time.delayedCall(450, () => this.showEvent(Phaser.Utils.Array.GetRandom(BO.OLAYLAR)));
    }
  }

  draw() {
    const W = BO.W, H = BO.H, P = BO.PAL, S = BO.state;
    const aksam = S.faz === 'aksam';
    const C = (k) => Phaser.Display.Color.HexStringToColor(P[k] || k).color;
    this.C = C;

    // --- Üst bar + takvim ---
    this.add.rectangle(0, 0, W, H, C('k')).setOrigin(0);
    BO.text(this, W / 2, 0, 'GÜN ' + S.gun + '/60 - ' + (aksam ? 'AKŞAM' : 'SABAH'), { color: aksam ? P.L : P.y, ox: 0.5 });
    const cx0 = 15, cw = 150;
    for (let g = 1; g <= BO.SON_GUN; g++) {
      const x = cx0 + Math.floor((g - 1) * cw / BO.SON_GUN);
      const oz = BO.ozelGun(g);
      const col = g < S.gun ? C('o') : g === S.gun ? C('y') : C('N');
      this.add.rectangle(x, 15, 2, 4, col).setOrigin(0);
      if (oz) this.add.rectangle(x, 13, 2, 1, C(oz === 'secim' ? 'r' : oz === 'munazara' ? 'c' : 'l')).setOrigin(0);
    }
    const sir = BO.siradakiOzel(S.gun + (S.faz === 'sabah' && BO.ozelGun(S.gun) ? 1 : 0)) || BO.siradakiOzel(S.gun);
    if (sir) {
      const ad = { anket: 'ANKET', munazara: 'MÜNAZARA', secim: 'SEÇİM' }[sir.tip];
      const kalan = sir.gun - S.gun;
      BO.text(this, W / 2, 20, kalan <= 0 ? ad + ': BUGÜN' : ad + ': ' + kalan + ' GÜN SONRA', { color: P.L, ox: 0.5 });
    }

    // --- Oda ---
    const roomTop = 36, roomBottom = H - BO.ALT - 170;
    this.add.rectangle(0, roomTop, W, roomBottom - roomTop, C(aksam ? '#1f2547' : '#2f3f73')).setOrigin(0);
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
    BO.text(this, W / 2, wy + wh + 7, BO.kisaAd(), { color: P.k, ox: 0.5 });
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
    const CW = 54, CH = 26;
    const card = (key, x, y, label, value, color) => {
      this.add.rectangle(x, y, CW, CH, C('k'), 0.85).setOrigin(0).setStrokeStyle(1, C('n'));
      BO.text(this, x + CW / 2, y + 1, label, { color: P.L, ox: 0.5 });
      this.cards[key] = BO.text(this, x + CW / 2, y + 12, value, { color: color, ox: 0.5 });
    };
    const lx = 4, rx = W - 4 - CW;
    const y1 = roomTop + 5, y2 = y1 + 30;
    card('oy', lx, y1, 'OY', '', P.l);
    card('itibar', lx, y2, 'İTİBAR ?', '', P.w);
    this.hotspot(lx, y2, CW, CH, () => this.itibarInfo());
    this.add.rectangle(lx + 7, y2 + 16, CW - 14, 5, C('N')).setOrigin(0);
    this.itibarBar = this.add.rectangle(lx + 7, y2 + 16, 0, 5, C('g')).setOrigin(0);
    this.itibarBarW = CW - 14;
    card('kasa', rx, y1, 'KASA +', '', P.y);
    this.hotspot(rx, y1, CW, CH, () => this.paraPanel());
    if (S.kasa < 2000) {
      const uyari = this.add.rectangle(rx - 1, y1 - 1, CW + 2, CH + 2).setOrigin(0).setStrokeStyle(2, C('r'));
      this.tweens.add({ targets: uyari, alpha: 0.1, duration: 400, yoyo: true, repeat: -1 });
    }
    card('erzak', rx, y2, 'ERZAK', '', P.w);
    BO.button(this, lx + CW / 2, y2 + 40, CW, 16, 'DÜKKAN', { fill: 'y', shade: 'o', onClick: () => { if (!this.modalAcik) this.go('Shop'); } });
    this.refreshCards();

    // --- Anket ---
    let y = roomBottom + 6;
    BO.text(this, 6, y, 'ANKET', { color: P.y });
    y += 13;
    const rows = [{ ad: BO.kisaAd(), biz: true, renk: 'o', oy: S.oy }]
      .concat(BO.RIVALS.map((r) => ({ ad: r.kisa, renk: r.renk, oy: BO.rakip(r.id).oy })))
      .concat([{ ad: 'KARARSIZ', renk: 'n', oy: S.kararsiz }]);
    const max = Math.max.apply(null, rows.map((r) => r.oy));
    rows.forEach((r) => {
      this.add.rectangle(6, y + 4, 6, 6, C(r.renk)).setOrigin(0);
      BO.text(this, 15, y, r.ad, { color: r.biz ? P.y : P.w });
      this.add.rectangle(84, y + 4, Math.max(1, Math.round(48 * r.oy / max)), 6, C(r.renk)).setOrigin(0);
      BO.text(this, W - 6, y, '%' + r.oy.toFixed(1), { color: P.L, ox: 1 });
      y += 12;
    });

    // --- Butonlar ---
    if (!aksam) {
      const g = BO.bugunGorev('gunduz');
      BO.text(this, W / 2, H - BO.ALT - 86, 'BUGÜNÜN GÖREVİ', { color: P.L, ox: 0.5 });
      const b = BO.button(this, W / 2, H - BO.ALT - 60, 164, 22, 'GÜNDÜZ: ' + g.kisa, { fill: 'y', shade: 'o', onClick: () => { if (!this.modalAcik) this.goreveGit('gunduz', g); } });
      BO.pulse(this, b);
      BO.button(this, 45, H - BO.ALT - 30, 84, 18, 'GECEYE GEÇ', {
        fill: 'n', shade: 'N', color: 'w',
        onClick: () => { BO.gunduzAtla(); this.go('Hub'); },
      });
      BO.button(this, W - 45, H - BO.ALT - 30, 84, 18, 'HAFTA ATLA', { fill: 'n', shade: 'N', color: 'w', onClick: () => this.skip(7) });
    } else {
      const g = BO.bugunGorev('gece');
      BO.text(this, W / 2, H - BO.ALT - 86, 'BU GECENİN GÖREVİ', { color: P.L, ox: 0.5 });
      const b = BO.button(this, W / 2, H - BO.ALT - 60, 164, 22, 'GECE: ' + g.kisa, { fill: 'p', shade: 'k', color: 'w', onClick: () => { if (!this.modalAcik) this.goreveGit('gece', g); } });
      BO.pulse(this, b, 'p');
      BO.button(this, W / 2, H - BO.ALT - 30, 164, 18, 'GECEYİ ATLA', {
        fill: 'n', shade: 'N', color: 'w',
        onClick: () => this.go('Morning', { log: [] }),
      });
    }

    this.cameras.main.fadeIn(300, 26, 28, 44);
  }

  hotspot(x, y, w, h, fn) {
    const z = this.add.zone(x, y, w, h).setOrigin(0).setInteractive({ useHandCursor: true });
    z.on('pointerup', () => { if (!this.modalAcik) { BO.sfx.click(); fn(); } });
  }

  // Genel pencere: başlık, metin, butonlar
  modal(baslik, metin, secenekler) {
    const W = BO.W, H = BO.H, P = BO.PAL;
    const ui = [];
    this.modalAcik = true;
    const add = (o) => { o.setDepth(500); ui.push(o); return o; };
    const kapat = () => { ui.forEach((x) => x.destroy()); this.modalAcik = false; };
    add(this.add.rectangle(0, 0, W, H, 0x000000, 0.6).setOrigin(0).setInteractive());
    // önce metni oluşturup yüksekliğini ölç, pencereyi ona göre boyutla
    const m = BO.text(this, 16, 0, metin, { color: P.k });
    const btnH = secenekler.reduce((t, o) => t + (o.label.includes('\n') ? 28 : 16) + 8, 0);
    const ph = 30 + m.height + btnH;
    const top = Math.max(4, Math.round((H - ph) / 2));
    add(this.add.rectangle(8, top, W - 16, ph, 0xf4f4f4).setOrigin(0));
    add(this.add.rectangle(8, top, W - 16, 16, 0x29366f).setOrigin(0));
    add(BO.text(this, W / 2, top + 1, baslik, { color: P.y, ox: 0.5 })).setDepth(505);
    add(m).setDepth(505); m.y = top + 20;
    let by = top + 26 + m.height;
    secenekler.forEach((o) => {
      const h = o.label.includes('\n') ? 28 : 16;
      add(BO.button(this, W / 2, by + h / 2, 150, h, o.label, {
        fill: o.fill || 'y', shade: o.shade || 'o', color: o.color || 'k', depth: 510,
        onClick: () => o.onPick(kapat, m),
      }));
      by += h + 8;
    });
    return kapat;
  }

  goreveGit(faz, g) {
    const S = BO.state;
    S.sonGorev = S.sonGorev || {};
    S.sonGorev[faz] = g.id;
    BO.save();
    this.go(g.id);
  }

  itibarInfo() {
    const S = BO.state;
    const gunluk = (S.itibar - 50) * 0.012 + S.kararsiz * 0.012 * (S.itibar / 60);
    this.modal('İTİBAR: ' + Math.round(S.itibar) + '/100',
      'YÜKSEK İTİBAR:\n+ HER GECE OY\n+ SEÇMEN MEMNUN\n+ BAĞIŞ ARTAR\n+ SEÇİMDE KARARSIZ\n  SANA GELİR\nDÜŞÜK İTİBAR:\n- DOMATES, KOVALAMA\n- OY KAÇAR\n\nŞU AN HER GECE:\n' + (gunluk >= 0 ? '+%' : '-%') + Math.abs(gunluk).toFixed(1) + ' OY',
      [{ label: 'ANLADIM', onPick: (kapat) => kapat() }]);
  }

  paraPanel() {
    const S = BO.state, P = BO.PAL;
    const fonAlindi = S.fonGun === S.gun;
    const yemek = Math.round(S.itibar * 80 / 100) * 100;
    const aksam = S.faz === 'aksam';
    const sonuc = (m, yazi, sonra) => {
      m.setText(yazi).setColor(P.r);
      this.refreshCards();
      BO.save();
      this.time.delayedCall(1600, sonra);
    };
    this.modal('PARA BUL',
      'KASA: ' + BO.tl(S.kasa) + '\n\nFON: HIZLI PARA,\nAMA İTİBAR DÜŞER,\nORTAYA ÇIKABİLİR.\n\nBAĞIŞ YEMEĞİ:\nİTİBARIN KADAR\nPARA, AMA ' + (aksam ? 'GECE' : 'GÜNDÜZ') + '\nBOŞA GİDER.',
      [
        { label: fonAlindi ? 'FON: BUGÜN ALDIN' : 'DIŞ GÜÇLERDEN FON\n+6.000 TL',
          fill: fonAlindi ? 'L' : 'r', shade: fonAlindi ? 'n' : 'k', color: 'w',
          onPick: (kapat, m) => {
            if (fonAlindi) return;
            S.kasa += 6000; S.itibar = BO.clamp(S.itibar - 8, 0, 100);
            S.fonGun = S.gun; S.fonRisk = true;
            BO.sfx.coin();
            sonuc(m, 'ZARF GELDİ!\nKİMSE SORMASIN...\n\n+6.000 TL\nİTİBAR -8', () => this.scene.restart());
          } },
        { label: 'BAĞIŞ YEMEĞİ\n+' + BO.tl(yemek), onPick: (kapat, m) => {
            S.kasa += yemek;
            BO.sfx.coin();
            sonuc(m, 'YEMEK BİTTİ,\nKASA DOLDU!\n\n+' + BO.tl(yemek), () => {
              if (aksam) this.go('Morning', { log: [] });
              else { S.faz = 'aksam'; this.go('Hub'); }
            });
          } },
        { label: 'VAZGEÇ', fill: 'n', shade: 'N', color: 'w', onPick: (kapat) => kapat() },
      ]);
  }

  refreshCards() {
    const S = BO.state, C = this.C;
    this.cards.oy.setText('%' + S.oy.toFixed(1));
    this.cards.itibar.setText('');
    this.itibarBar.width = Math.round(this.itibarBarW * S.itibar / 100);
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
    const W = BO.W, H = BO.H, P = BO.PAL, S = BO.state;
    const ui = [];
    const add = (o) => { o.setDepth(500); ui.push(o); return o; };
    add(this.add.rectangle(0, 0, W, H, 0x000000, 0.6).setOrigin(0).setInteractive());
    const top = Math.round(H * 0.18);
    add(this.add.rectangle(8, top, W - 16, 178, 0xf4f4f4).setOrigin(0));
    add(this.add.rectangle(8, top, W - 16, 16, 0x29366f).setOrigin(0));
    add(BO.text(this, W / 2, top + 1, 'OLAY!', { color: P.y, ox: 0.5 }));
    add(BO.text(this, W / 2, top + 20, ev.baslik, { color: P.k, ox: 0.5 }));
    const metin = add(BO.text(this, W / 2, top + 36, ev.metin, { color: P.n, ox: 0.5, align: 'center' }));
    let by = top + 80;
    const btns = [];
    ev.secenek.forEach((o) => {
      const h = o.label.includes('\n') ? 28 : 16;
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
          add(BO.text(this, W / 2, top + 88, ozet.join('\n') || 'ETKİSİ YOK', { color: P.B, ox: 0.5, align: 'center' }));
          add(BO.button(this, W / 2, top + 160, 100, 16, 'TAMAM', {
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

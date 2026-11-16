// Açılış menüsü ve menü ekranları: Yeni oyun (aday adı), Oyun yükle, Ayarlar, Credits, Çıkış.
window.BO = window.BO || {};

BO.BootScene = class extends Phaser.Scene {
  constructor() { super('Boot'); }
  create() {
    BO.makeTextures(this);
    this.scene.start('Title');
  }
};

// Menü ekranlarının ortak arka planı: akan yol + yürüyen seçmenler
BO.menuArkaPlan = function (scene, karart) {
  const W = BO.W, H = BO.H;
  scene.bg = scene.add.tileSprite(0, 0, W, H, 'yol').setOrigin(0);
  scene.walkers = [];
  for (let i = 0; i < 6; i++) {
    const side = i % 2 ? BO.WALK.right : BO.WALK.left;
    const s = scene.add.sprite(Phaser.Math.Between(side[0], side[1]), Phaser.Math.Between(0, H), 'secmen0').play('yuru');
    s.setFlipX(Math.random() < 0.5);
    scene.walkers.push(s);
  }
  if (karart) scene.add.rectangle(0, 0, W, H, 0x1a1c2c, karart).setOrigin(0);
};
BO.menuArkaPlanGuncelle = function (scene, delta) {
  const dt = delta / 1000, H = BO.H;
  scene.bg.tilePositionY -= 26 * dt;
  scene.walkers.forEach((s) => { s.y += 26 * dt; if (s.y > H + 12) s.y = -12; });
};

// Basit evet/hayır penceresi
BO.onayKutusu = function (scene, soru, evet, hayir) {
  const W = BO.W, H = BO.H, P = BO.PAL;
  const ui = [];
  const add = (o) => { o.setDepth(900); ui.push(o); return o; };
  const kapat = () => ui.forEach((o) => o.destroy());
  add(scene.add.rectangle(0, 0, W, H, 0x000000, 0.65).setOrigin(0).setInteractive());
  add(scene.add.rectangle(12, H / 2 - 50, W - 24, 100, 0xf4f4f4).setOrigin(0));
  add(BO.text(scene, W / 2, H / 2 - 38, soru, { color: P.k, ox: 0.5, align: 'center' }));
  add(BO.button(scene, W / 2 - 38, H / 2 + 30, 64, 18, 'EVET', { fill: 'r', shade: 'k', color: 'w', depth: 910, onClick: () => { kapat(); evet(); } }));
  add(BO.button(scene, W / 2 + 38, H / 2 + 30, 64, 18, 'HAYIR', { fill: 'n', shade: 'N', color: 'w', depth: 910, onClick: () => { kapat(); if (hayir) hayir(); } }));
};

// ================= Ana menü =================
BO.TitleScene = class extends Phaser.Scene {
  constructor() { super('Title'); }

  create() {
    const W = BO.W, H = BO.H, P = BO.PAL;
    BO.menuArkaPlan(this, 0);

    this.add.rectangle(0, 0, W, 104, 0x1a1c2c, 0.9).setOrigin(0);
    const t1 = BO.text(this, W / 2, 26, 'BAŞKAN', { size: 24, color: P.y, ox: 0.5, oy: 0.5, stroke: 4 });
    const t2 = BO.text(this, W / 2, 56, 'OL!', { size: 24, color: P.o, ox: 0.5, oy: 0.5, stroke: 4 });
    this.tweens.add({ targets: [t1, t2], scale: 1.06, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    BO.text(this, W / 2, 84, 'SEÇİME 60 GÜN KALDI', { color: P.w, ox: 0.5 });

    const kayit = BO.load();
    const items = [
      { label: 'YENİ OYUN', fill: 'y', shade: 'o', onClick: () => this.yeniOyun(kayit) },
      { label: 'OYUN YÜKLE', fill: kayit ? 'n' : 'L', shade: kayit ? 'N' : 'n', onClick: () => this.go('Load') },
      { label: 'AYARLAR', fill: 'c', shade: 'b', onClick: () => this.go('Settings') },
      { label: 'CREDITS', fill: 'c', shade: 'b', onClick: () => this.go('Credits') },
      { label: 'ÇIKIŞ', fill: 'n', shade: 'N', color: 'w', onClick: () => this.cikis() },
    ];
    const gap = Math.min(30, Math.floor((H - 120) / items.length));
    let y = 118 + Math.max(0, (H - 120 - gap * items.length) / 2);
    items.forEach((it, i) => {
      const b = BO.button(this, W / 2, y + 10, 128, 20, it.label, { fill: it.fill, shade: it.shade, color: it.color || 'k', size: 16, onClick: it.onClick });
      b.setAlpha(0);
      this.tweens.add({ targets: b, alpha: 1, duration: 250, delay: 100 + i * 70 });
      if (i === 0) BO.pulse(this, b);
      y += gap;
    });
    const sonlar = BO.acilanSonlar();
    if (sonlar.length) BO.text(this, 4, H - 12, 'SONLAR: ' + sonlar.length + '/' + BO.SON_SIRA.length, { color: P.y });
    BO.text(this, W - 3, H - 10, 'v0.15', { color: P.n, ox: 1 });
    this.cameras.main.fadeIn(300, 26, 28, 44);
  }

  go(key, data) {
    BO.sfx.unlock();
    this.cameras.main.fadeOut(200, 26, 28, 44);
    this.time.delayedCall(210, () => this.scene.start(key, data));
  }

  yeniOyun(kayit) {
    if (kayit) BO.onayKutusu(this, 'ESKİ KAYIT\nSİLİNECEK.\nEMİN MİSİN?', () => this.go('Intro'));
    else this.go('Intro');
  }

  cikis() {
    BO.onayKutusu(this, 'OYUNDAN ÇIKMAK\nİSTİYOR MUSUN?', () => {
      BO.save();
      // Mağaza uygulamasında (Capacitor) gerçekten kapanır
      const app = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
      if (app && app.exitApp) { app.exitApp(); return; }
      try { window.close(); } catch (e) {}
      this.go('Bye');
    });
  }

  update(t, d) { BO.menuArkaPlanGuncelle(this, d); }
};

// ================= Aday adı =================
BO.NameScene = class extends Phaser.Scene {
  constructor() { super('Name'); }

  create() {
    const W = BO.W, H = BO.H, P = BO.PAL;
    this.add.rectangle(0, 0, W, H, 0x1a1c2c).setOrigin(0);
    this.ad = '';
    BO.text(this, W / 2, 8, 'ADAYIN ADI NE?', { color: P.y, ox: 0.5 });
    this.aday = this.add.sprite(W / 2, 64, 'aday0').setOrigin(0.5, 1).setScale(3).play('el_salla');
    this.add.rectangle(10, 70, W - 20, 18, 0xf4f4f4).setOrigin(0);
    this.adT = BO.text(this, W / 2, 79, '', { color: P.k, ox: 0.5, oy: 0.5 });
    this.imlec = this.add.rectangle(0, 75, 5, 8, 0x1a1c2c).setOrigin(0);
    this.tweens.add({ targets: this.imlec, alpha: 0, duration: 400, yoyo: true, repeat: -1 });

    // Türkçe pixel klavye
    const rows = ['ABCÇDEFG', 'ĞHIİJKLM', 'NOÖPRSŞT', 'UÜVYZ'];
    const kw = 19, kh = 18, gx = 3;
    let y = 102;
    rows.forEach((row) => {
      const total = row.length * kw + (row.length - 1) * gx;
      let x = (W - total) / 2 + kw / 2;
      if (row.length < 8) x = (W - (8 * kw + 7 * gx)) / 2 + kw / 2;
      row.split('').forEach((ch) => {
        BO.button(this, x, y, kw, kh, ch, { fill: 'w', shade: 'L', size: 16, onDown: () => this.yaz(ch) });
        x += kw + gx;
      });
      if (row.length < 8) {
        BO.button(this, x + 4, y, 30, kh, 'BOŞ', { fill: 'L', shade: 'n', onDown: () => this.yaz(' ') });
        BO.button(this, x + 38, y, 30, kh, 'SİL', { fill: 'r', shade: 'k', color: 'w', onDown: () => this.sil() });
      }
      y += kh + 6;
    });
    BO.button(this, 26, y + 8, 44, 18, 'GERİ', { fill: 'n', shade: 'N', color: 'w', onClick: () => this.scene.start('Title') });
    BO.button(this, 114, y + 8, 116, 18, 'RASTGELE AD', {
      fill: 'c', shade: 'b', onClick: () => { this.ad = Phaser.Utils.Array.GetRandom(BO.ADLAR); this.guncelle(); },
    });
    this.tamam = BO.button(this, W / 2, Math.max(y + 42, H - BO.ALT - 26), 160, 20, 'KAMPANYAYI BAŞLAT', {
      fill: 'y', shade: 'o', onClick: () => this.basla(),
    });
    // Bilgisayar klavyesi de çalışsın
    this.input.keyboard.on('keydown', (e) => {
      if (e.key === 'Backspace') this.sil();
      else if (e.key === 'Enter') this.basla();
      else if (e.key.length === 1) {
        const ch = e.key.toLocaleUpperCase('tr-TR');
        if (/[A-ZÇĞİÖŞÜ ]/.test(ch)) this.yaz(ch);
      }
    });
    this.guncelle();
    this.cameras.main.fadeIn(250, 26, 28, 44);
  }

  yaz(ch) {
    if (this.ad.length >= 12) return;
    if (ch === ' ' && (!this.ad.length || this.ad.endsWith(' '))) return;
    this.ad += ch;
    BO.sfx.click();
    this.guncelle();
  }

  sil() { this.ad = this.ad.slice(0, -1); this.guncelle(); }

  guncelle() {
    this.adT.setText(this.ad || '');
    this.imlec.x = Math.round(BO.W / 2 + this.adT.width / 2 + 1);
    this.tamam.setAlpha(this.ad.trim().length >= 2 ? 1 : 0.5);
  }

  basla() {
    const ad = this.ad.trim();
    if (ad.length < 2) {
      BO.floatText(this, BO.W / 2, 96, 'EN AZ 2 HARF!', BO.PAL.r);
      return;
    }
    BO.sfx.unlock();
    BO.state = BO.newGameState();
    BO.state.adayAd = ad;
    BO.save();
    this.cameras.main.fadeOut(300, 26, 28, 44);
    this.time.delayedCall(310, () => this.scene.start('Hub'));
  }
};

// ================= Oyun yükle =================
BO.LoadScene = class extends Phaser.Scene {
  constructor() { super('Load'); }
  create() {
    const W = BO.W, H = BO.H, P = BO.PAL;
    BO.menuArkaPlan(this, 0.85);
    BO.text(this, W / 2, 14, 'OYUN YÜKLE', { size: 16, color: P.y, ox: 0.5 });
    const k = BO.load();
    if (!k) {
      BO.text(this, W / 2, H / 2 - 20, 'KAYITLI OYUN\nYOK', { color: P.L, ox: 0.5, align: 'center' });
    } else {
      const top = 50;
      this.add.rectangle(10, top, W - 20, 118, 0xf4f4f4).setOrigin(0);
      this.add.sprite(32, top + 50, 'aday0').setOrigin(0.5, 1).setScale(3);
      BO.text(this, 56, top + 10, k.adayAd, { color: P.k });
      BO.text(this, 56, top + 24, 'GÜN ' + k.gun + '/60', { color: P.n });
      BO.text(this, 56, top + 36, k.faz === 'aksam' ? 'AKŞAM' : 'SABAH', { color: P.n });
      BO.text(this, 18, top + 62, 'OY ORANI', { color: P.n });
      BO.text(this, W - 18, top + 62, '%' + k.oy.toFixed(1), { color: P.g, ox: 1 });
      BO.text(this, 18, top + 76, 'KASA', { color: P.n });
      BO.text(this, W - 18, top + 76, BO.tl(k.kasa), { color: P.o, ox: 1 });
      BO.text(this, 18, top + 90, 'İTİBAR', { color: P.n });
      BO.text(this, W - 18, top + 90, Math.round(k.itibar) + '/100', { color: P.B, ox: 1 });
      BO.button(this, W / 2, top + 140, 128, 20, 'YÜKLE', {
        fill: 'y', shade: 'o',
        onClick: () => {
          BO.sfx.unlock();
          BO.state = k;
          this.cameras.main.fadeOut(300, 26, 28, 44);
          this.time.delayedCall(310, () => this.scene.start('Hub'));
        },
      });
      BO.button(this, W / 2, top + 168, 128, 16, 'KAYDI SİL', {
        fill: 'r', shade: 'k', color: 'w',
        onClick: () => BO.onayKutusu(this, 'KAYIT SİLİNECEK.\nEMİN MİSİN?', () => { BO.clearSave(); this.scene.restart(); }),
      });
    }
    BO.button(this, W / 2, H - BO.ALT - 20, 100, 16, 'GERİ', { fill: 'n', shade: 'N', color: 'w', onClick: () => this.scene.start('Title') });
  }
  update(t, d) { BO.menuArkaPlanGuncelle(this, d); }
};

// ================= Ayarlar =================
BO.SettingsScene = class extends Phaser.Scene {
  constructor() { super('Settings'); }
  create() {
    const W = BO.W, H = BO.H, P = BO.PAL, A = BO.ayar;
    BO.menuArkaPlan(this, 0.85);
    BO.text(this, W / 2, 14, 'AYARLAR', { size: 16, color: P.y, ox: 0.5 });
    let y = 52;
    const satir = (label, deger, fn) => {
      BO.text(this, 12, y - 4, label, { color: P.w });
      const b = BO.button(this, W - 44, y, 72, 16, deger(), { fill: 'c', shade: 'b', onClick: () => { fn(); b.label.setText(deger()); BO.ayarKaydet(); } });
      y += 26;
      return b;
    };
    satir('SES', () => (A.ses ? 'AÇIK' : 'KAPALI'), () => { BO.sfx.toggle(); BO.sfx.unlock(); BO.sfx.click(); });
    satir('TİTREŞİM', () => (A.titresim ? 'AÇIK' : 'KAPALI'), () => { A.titresim = !A.titresim; BO.titret(80); });
    satir('ZORLUK', () => BO.zor().ad, () => {
      const sira = ['kolay', 'normal', 'zor'];
      A.zorluk = sira[(sira.indexOf(A.zorluk) + 1) % 3];
    });
    BO.text(this, W / 2, y - 10, 'KOLAY: POLİS YAVAŞ,\nRAKİPLER YUMUŞAK.\nZOR: TAM TERSİ.\nBAŞLANGIÇ PARASI\nDA DEĞİŞİR.', { color: P.L, ox: 0.5, align: 'center', lineSpacing: 3 });
    y += 90;
    BO.button(this, W / 2, y, 140, 16, 'KAYITLARI SİL', {
      fill: 'r', shade: 'k', color: 'w',
      onClick: () => BO.onayKutusu(this, 'TÜM KAYITLAR\nSİLİNECEK!', () => { BO.clearSave(); BO.floatText(this, W / 2, y - 14, 'SİLİNDİ', P.l); }),
    });
    BO.button(this, W / 2, H - BO.ALT - 20, 100, 16, 'GERİ', { fill: 'n', shade: 'N', color: 'w', onClick: () => this.scene.start('Title') });
  }
  update(t, d) { BO.menuArkaPlanGuncelle(this, d); }
};

// ================= Credits =================
BO.CreditsScene = class extends Phaser.Scene {
  constructor() { super('Credits'); }
  create() {
    const W = BO.W, H = BO.H, P = BO.PAL;
    this.add.rectangle(0, 0, W, H, 0x1a1c2c).setOrigin(0);
    const satirlar = [
      ['BAŞKAN OL!', P.y, 16], ['', P.w],
      ['OYUN FİKRİ VE', P.L], ['YÖNETMEN', P.L], ['EMRYRGC', P.w], ['', P.w],
      ['KOD VE GRAFİK', P.L], ['CLAUDE', P.w], ['(ANTHROPIC)', P.w], ['', P.w],
      ['OYUN MOTORU', P.L], ['PHASER 3', P.w], ['', P.w],
      ['YAZI TİPİ', P.L], ['RUBIK (OFL)', P.w], ['', P.w],
      ['RENK PALETİ', P.L], ['SWEETIE 16', P.w], ['GRAFXKID', P.w], ['', P.w],
      ['TEST EKİBİ', P.L], ['EMRYRGC', P.w], ['', P.w],
      ['TEŞEKKÜRLER', P.L], ['TÜM KARARSIZ', P.w], ['SEÇMENLERE', P.w], ['', P.w], ['', P.w],
      ['OYLARINIZI', P.o], ['BEKLİYORUZ!', P.o],
    ];
    this.liste = this.add.container(0, H + 10);
    let y = 0;
    satirlar.forEach(([t, c, s]) => {
      this.liste.add(BO.text(this, W / 2, y, t, { color: c, size: s || 8, ox: 0.5 }));
      y += s ? 26 : 13;
    });
    this.boy = y;
    BO.button(this, 26, 12, 44, 14, 'GERİ', { fill: 'n', shade: 'N', color: 'w', depth: 10, onClick: () => this.scene.start('Title') });
  }
  update(t, d) {
    this.liste.y -= 18 * d / 1000;
    if (this.liste.y < -this.boy) this.liste.y = BO.H + 10;
  }
};

// ================= Çıkış (tarayıcıda) =================
BO.ByeScene = class extends Phaser.Scene {
  constructor() { super('Bye'); }
  create() {
    const W = BO.W, H = BO.H, P = BO.PAL;
    this.add.rectangle(0, 0, W, H, 0x000000).setOrigin(0);
    BO.text(this, W / 2, H / 2 - 30, 'GÖRÜŞÜRÜZ\nBAŞKANIM!', { size: 16, color: P.y, ox: 0.5, align: 'center' });
    BO.text(this, W / 2, H / 2 + 14, 'OYUN KAYDEDİLDİ.\nSEKMEYİ\nKAPATABİLİRSİN.', { color: P.L, ox: 0.5, align: 'center' });
    const t = BO.text(this, W / 2, H - BO.ALT - 30, 'MENÜYE DÖNMEK\nİÇİN DOKUN', { color: P.n, ox: 0.5, align: 'center' });
    this.tweens.add({ targets: t, alpha: 0.2, duration: 600, yoyo: true, repeat: -1 });
    this.time.delayedCall(500, () => this.input.once('pointerdown', () => this.scene.start('Title')));
  }
};

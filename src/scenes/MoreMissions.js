// Yeni görevler: PAZAR TEZGÂHI (gündüz) ve LASTİK OPERASYONU (gece)
window.BO = window.BO || {};

// ================= PAZAR TEZGÂHI =================
// Gelen seçmen ne istediğini balonla gösterir; alttan doğru ürüne bas.
BO.MarketScene = class extends Phaser.Scene {
  constructor() { super('Market'); }

  create() {
    const W = BO.W, H = BO.H, P = BO.PAL, S = BO.state;
    this.W = W; this.H = H;
    const C = (k) => Phaser.Display.Color.HexStringToColor(P[k] || k).color;
    this.sure = 35;
    this.bitti = false;
    this.combo = 0;
    this.kuyruk = [];
    this.aktif = null;
    this.gelis = 0.3;
    this.st = { tur: 'pazar', gun: S.gun, oyBas: S.oy, itibarBas: S.itibar, dogru: 0, yanlis: 0, kacan: 0, seri: 0, bagis: 0 };
    this.urunler = ['simit', 'cay', 'makarna'];

    // Pazar yeri
    this.add.rectangle(0, 0, W, H, C('#3d4a6b')).setOrigin(0);
    for (let k = 0; k < 4; k++) {                       // arka tezgah tenteleri
      const x = k * 48 - 6;
      for (let s = 0; s < 6; s++) this.add.rectangle(x + s * 8, 34, 8, 16, C(s % 2 ? 'w' : ['r', 'g', 'b', 'o'][k])).setOrigin(0);
      this.add.rectangle(x, 50, 46, 22, C('m')).setOrigin(0);
      for (let m = 0; m < 5; m++) this.add.circle(x + 6 + m * 8, 56, 3, C(['r', 'y', 'g', 'o', 'l'][(m + k) % 5]));
    }
    this.add.rectangle(0, 74, W, H - 74, C('#566c86')).setOrigin(0);
    for (let y = 80; y < H; y += 12) this.add.rectangle(0, y, W, 1, C('#4a5c75')).setOrigin(0);

    // Bizim tezgah
    this.tezgahY = H - BO.ALT - 104;
    this.add.sprite(W / 2, this.tezgahY - 2, 'aday0').setOrigin(0.5, 1).setScale(2).play('el_salla');
    for (let s = 0; s < 12; s++) this.add.rectangle(W / 2 - 48 + s * 8, this.tezgahY - 46, 8, 10, C(s % 2 ? 'w' : 'o')).setOrigin(0);
    this.add.rectangle(W / 2 - 48, this.tezgahY - 2, 96, 18, C('E')).setOrigin(0).setStrokeStyle(1, C('k'));
    this.urunler.forEach((u, i) => this.add.image(W / 2 - 30 + i * 30, this.tezgahY + 6, u).setScale(2));
    this.musteriY = this.tezgahY + 34;

    // Ürün butonları
    const by = H - BO.ALT - 30;
    this.urunler.forEach((u, i) => {
      const b = BO.button(this, W / 2 - 54 + i * 54, by, 48, 34, null, { fill: 'w', icon: u, depth: 50, onDown: () => this.ver(u) });
      b.label.setScale(3);
    });

    // HUD
    this.add.rectangle(0, 0, W, 30, C('k'), 0.92).setOrigin(0).setDepth(100);
    BO.text(this, 4, 2, 'PAZAR TEZGÂHI', { color: P.y, depth: 101 });
    this.saatT = BO.text(this, W - 4, 2, '', { color: P.w, ox: 1, depth: 101 });
    this.skorT = BO.text(this, 4, 16, '', { color: P.l, depth: 101 });

    const ipucu = BO.text(this, W / 2, H * 0.42, 'SEÇMEN NE İSTİYOR?\nDOĞRU ÜRÜNE BAS!', { color: P.y, ox: 0.5, oy: 0.5, align: 'center', stroke: 3, depth: 120 });
    this.tweens.add({ targets: ipucu, alpha: 0, delay: 2200, duration: 400, onComplete: () => ipucu.destroy() });
    this.cameras.main.fadeIn(300, 26, 28, 44);
  }

  yeniMusteri() {
    const W = this.W;
    const soldan = Math.random() < 0.5;
    const m = this.add.sprite(soldan ? -10 : W + 10, this.musteriY + 20, 'secmen0').setScale(1.5).play('yuru').setDepth(20);
    m.istek = Phaser.Utils.Array.GetRandom(this.urunler);
    this.kuyruk.push(m);
    this.kuyrukDiz();
  }

  kuyrukDiz() {
    // ilk sıradaki tezgahın önünde, diğerleri arkasında sıralanır
    this.kuyruk.forEach((m, i) => {
      const x = this.W / 2 + (i === 0 ? 0 : (i % 2 ? -1 : 1) * (18 + Math.floor((i - 1) / 2) * 16));
      const y = this.musteriY + (i === 0 ? 0 : 22 + Math.floor((i - 1) / 2) * 6);
      this.tweens.add({ targets: m, x, y, duration: 400 });
      m.setDepth(20 + (i === 0 ? 10 : 0));
    });
    if (!this.aktif && this.kuyruk.length) this.time.delayedCall(420, () => this.sirayaAl());
  }

  sirayaAl() {
    if (this.aktif || !this.kuyruk.length || this.bitti) return;
    const m = this.kuyruk[0];
    this.aktif = m;
    m.anims.stop(); m.setTexture('secmen0');
    const sabir = Math.max(1.6, 3.2 - (35 - this.sure) * 0.04);
    m.sabir = sabir; m.kalan = sabir;
    m.balon = this.add.container(m.x, m.y - 30).setDepth(40);
    m.balon.add(this.add.rectangle(0, 0, 22, 18, 0xf4f4f4).setStrokeStyle(1, 0x1a1c2c));
    m.balon.add(this.add.triangle(0, 11, -3, 0, 3, 0, 0, 4, 0xf4f4f4));
    m.balon.add(this.add.image(0, 0, m.istek).setScale(2));
    m.bar = this.add.rectangle(m.x - 11, m.y - 42, 22, 3, 0xa7f070).setOrigin(0).setDepth(40);
  }

  ver(urun) {
    const m = this.aktif;
    if (!m || this.bitti) return;
    const P = BO.PAL, S = BO.state;
    if (urun === m.istek) {
      this.combo++;
      this.st.dogru++;
      this.st.seri = Math.max(this.st.seri, this.combo);
      BO.sfx.happy();
      m.setTexture('secmen_mutlu');
      BO.floatText(this, m.x, m.y - 36, this.combo >= 3 ? '+OY x' + this.combo : '+OY', P.l);
      const g = this.add.image(this.W / 2, this.tezgahY, urun).setScale(2).setDepth(45);
      this.tweens.add({ targets: g, x: m.x, y: m.y - 6, duration: 200, onComplete: () => g.destroy() });
    } else {
      this.combo = 0;
      this.st.yanlis++;
      BO.sfx.angry();
      m.setTexture('secmen_kizgin');
      BO.floatText(this, m.x, m.y - 36, 'BU DEĞİL!', P.r);
      this.cameras.main.shake(80, 0.004);
    }
    this.gonder(m);
  }

  gonder(m) {
    if (m.balon) m.balon.destroy();
    if (m.bar) m.bar.destroy();
    this.aktif = null;
    this.kuyruk.shift();
    const hedef = Math.random() < 0.5 ? -20 : this.W + 20;
    m.setFlipX(hedef < 0);
    this.time.delayedCall(250, () => { m.play('yuru'); this.tweens.add({ targets: m, x: hedef, duration: 900, onComplete: () => m.destroy() }); });
    this.kuyrukDiz();
  }

  update(t, delta) {
    if (this.bitti) return;
    const dt = Math.min(delta, 50) / 1000;
    this.sure -= dt;
    this.gelis -= dt;
    if (this.gelis <= 0 && this.kuyruk.length < 6) {
      this.yeniMusteri();
      this.gelis = Math.max(0.7, 1.6 - (35 - this.sure) * 0.02) * (1 - 0.1 * BO.seviye('hoparlor'));
    }
    const m = this.aktif;
    if (m) {
      m.kalan -= dt;
      m.bar.width = Math.max(0, 22 * m.kalan / m.sabir);
      m.bar.fillColor = m.kalan / m.sabir > 0.4 ? 0xa7f070 : 0xb13e53;
      if (m.kalan <= 0) {
        this.combo = 0;
        this.st.kacan++;
        m.setTexture('secmen_kizgin');
        BO.floatText(this, m.x, m.y - 36, 'SIKILDI!', BO.PAL.r);
        this.gonder(m);
      }
    }
    this.skorT.setText('DOĞRU ' + this.st.dogru + (this.combo >= 2 ? '   SERİ x' + this.combo : ''));
    this.saatT.setText('0:' + String(Math.max(0, Math.ceil(this.sure))).padStart(2, '0'));
    if (this.sure <= 0) this.bitir();
  }

  bitir() {
    this.bitti = true;
    const S = BO.state, st = this.st;
    S.oy += st.dogru * 0.06 + st.seri * 0.02;
    S.itibar = BO.clamp(S.itibar + Math.round((st.dogru - st.yanlis * 2 - st.kacan) / 4), 0, 100);
    st.bagis = Math.round(st.dogru * 60 / 50) * 50;
    S.kasa += st.bagis;
    BO.sfx.win();
    const tx = BO.text(this, this.W / 2, this.H * 0.4, 'PAZAR KAPANDI!', { size: 16, color: BO.PAL.y, ox: 0.5, oy: 0.5, stroke: 4, depth: 200 });
    tx.setScale(0.3);
    this.tweens.add({ targets: tx, scale: 1, duration: 300, ease: 'Back.easeOut' });
    this.time.delayedCall(1500, () => {
      this.cameras.main.fadeOut(400, 26, 28, 44);
      this.time.delayedCall(420, () => this.scene.start('Summary', st));
    });
  }
};

// ================= LASTİK OPERASYONU =================
// Rakip otobüslerinin lastiklerine dokunup havasını indir. Köpek uyanıkken dokunma!
BO.TireScene = class extends Phaser.Scene {
  constructor() { super('Tire'); }

  create() {
    const W = BO.W, H = BO.H, P = BO.PAL, S = BO.state;
    this.W = W; this.H = H;
    const C = (k) => Phaser.Display.Color.HexStringToColor(P[k] || k).color;
    this.C = C;
    this.sure = 40;
    this.bitti = false;
    this.suphe = 0;
    this.log = [];
    this.kopek = 'uyku';
    this.kopekZaman = 3;

    // Otopark
    this.add.rectangle(0, 0, W, H, C('#1e2236')).setOrigin(0);
    for (let y = 60; y < H - 40; y += 60) this.add.rectangle(10, y, W - 20, 1, C('#3d4566')).setOrigin(0);
    this.add.image(W - 20, 44, 'isik').setScale(1.2);

    // 3 rakip otobüsü (yan yatık)
    this.otobusler = [];
    const alan0 = 50, alan1 = H - BO.ALT - 90;
    BO.RIVALS.forEach((r, i) => {
      const y = Math.round(alan0 + (alan1 - alan0) * (i + 0.5) / 3);
      const x = W / 2 + 8;
      const img = this.add.image(x, y, 'otobus_' + r.id).setAngle(90).setScale(2);
      BO.text(this, x, y - 30, r.kisa, { color: P.w, ox: 0.5, oy: 0.5, stroke: 2 });
      const lastikler = [[-30, -24], [30, -24], [-30, 24], [30, 24]].map(([dx, dy]) => {
        const g = this.add.graphics();
        const l = { x: x + dx, y: y + dy, p: 0, bitti: false, g };
        this.lastikCiz(l);
        return l;
      });
      this.otobusler.push({ r, img, lastikler, bitti: false, y });
    });

    // Bekçi köpeği (sol alt)
    this.kopekX = 26; this.kopekY = H - BO.ALT - 54;
    this.add.rectangle(this.kopekX - 14, this.kopekY - 18, 28, 22, C('m')).setOrigin(0).setStrokeStyle(1, C('k'));
    this.add.graphics().fillStyle(C('r'), 1).fillTriangle(this.kopekX - 17, this.kopekY - 18, this.kopekX + 17, this.kopekY - 18, this.kopekX, this.kopekY - 30);   // kulübe çatısı
    this.kopekG = this.add.graphics().setDepth(5);
    this.kopekT = BO.text(this, this.kopekX + 18, this.kopekY - 12, '', { color: P.y, stroke: 2, depth: 6 });
    this.kopekCiz();

    // Oyuncu
    this.oyuncu = this.add.sprite(W / 2, H - BO.ALT - 70, 'kilik0').setScale(2).setOrigin(0.5, 1).setDepth(30);

    // HUD
    this.add.rectangle(0, 0, W, 30, C('k'), 0.92).setOrigin(0).setDepth(100);
    BO.text(this, 4, 2, 'LASTİK OPERASYONU', { color: P.y, depth: 101 });
    this.saatT = BO.text(this, W - 4, 2, '', { color: P.w, ox: 1, depth: 101 });
    BO.text(this, 4, 16, 'ŞÜPHE', { color: P.r, depth: 101 });
    this.add.rectangle(46, 20, 60, 6, C('N')).setOrigin(0).setDepth(101);
    this.supheBar = this.add.rectangle(46, 20, 0, 6, C('r')).setOrigin(0).setDepth(102);
    this.sayacT = BO.text(this, W - 4, 16, '', { color: P.l, ox: 1, depth: 101 });
    BO.button(this, W - 34, H - BO.ALT - 24, 60, 16, 'EVE DÖN', { fill: 'n', depth: 110, onClick: () => this.bitir() });

    this.input.on('pointerdown', (p, over) => { if (!(over && over.length)) this.dokun(p.worldX, p.worldY); });

    const ipucu = BO.text(this, W / 2, H * 0.45, 'LASTİKLERE DOKUN!\nKÖPEK UYANIKKEN\nSAKIN DOKUNMA!', { color: P.y, ox: 0.5, oy: 0.5, align: 'center', stroke: 3, depth: 120 });
    this.tweens.add({ targets: ipucu, alpha: 0, delay: 2600, duration: 400, onComplete: () => ipucu.destroy() });
    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  lastikCiz(l) {
    const g = l.g;
    g.clear();
    if (l.bitti) {
      g.fillStyle(0x11131f, 1).fillRect(l.x - 6, l.y - 2, 12, 4);   // basık lastik
    } else {
      g.fillStyle(0x11131f, 1).fillRect(l.x - 5, l.y - 4, 10, 8);
      g.fillStyle(0x566c86, 1).fillRect(l.x - 2, l.y - 1, 4, 2);
      if (l.p > 0) g.fillStyle(0xa7f070, 1).fillRect(l.x - 5, l.y + 6, Math.round(10 * l.p / 5), 2);
    }
  }

  kopekCiz() {
    const g = this.kopekG, x = this.kopekX, y = this.kopekY + 12;   // kulübenin önünde
    g.clear();
    g.fillStyle(0xffcd75, 1).fillRect(x - 8, y - 6, 16, 8);           // gövde
    g.fillStyle(0xffcd75, 1).fillRect(x + 4, y - 10, 7, 6);           // kafa
    g.fillStyle(0xffcd75, 1).fillRect(x - 11, y - 6, 3, 2);           // kuyruk
    const kulak = this.kopek === 'uyku' ? 2 : 4;
    g.fillStyle(0x5a3a28, 1).fillRect(x + 4, y - 10 - kulak + 2, 2, kulak).fillRect(x + 9, y - 10 - kulak + 2, 2, kulak);
    g.fillStyle(0x1a1c2c, 1);
    if (this.kopek === 'uyku') g.fillRect(x + 6, y - 8, 3, 1);       // kapalı göz
    else g.fillRect(x + 6, y - 9, 1, 2).fillRect(x + 9, y - 9, 1, 2);
    this.kopekT.setText(this.kopek === 'uyku' ? 'Zzz' : this.kopek === 'kipir' ? '?' : '!!');
    this.kopekT.setColor(this.kopek === 'uyanik' ? BO.PAL.r : BO.PAL.y);
  }

  dokun(x, y) {
    if (this.bitti) return;
    let hedef = null, en = 16;
    this.otobusler.forEach((o) => o.lastikler.forEach((l) => {
      if (l.bitti) return;
      const d = Math.hypot(l.x - x, l.y - y);
      if (d < en) { en = d; hedef = { o, l }; }
    }));
    if (!hedef) return;
    const { o, l } = hedef;
    this.tweens.add({ targets: this.oyuncu, x: l.x, y: l.y + (l.y < o.y ? -8 : 22), duration: 120 });
    if (this.kopek === 'uyanik') {
      this.suphe += 34 * (1 - 0.2 * BO.seviye('biyik'));
      BO.floatText(this, this.kopekX + 10, this.kopekY - 40, 'HIRRR!', BO.PAL.r);
      BO.sfx.angry();
      if (this.suphe >= 100) { this.yakalandi(); return; }
    }
    l.p++;
    BO.sfx.lane();
    if (l.p >= 5) {
      l.bitti = true;
      BO.floatText(this, l.x, l.y - 10, 'PSSST!', BO.PAL.w);
      BO.sfx.splat();
      if (o.lastikler.every((k) => k.bitti) && !o.bitti) {
        o.bitti = true;
        o.img.setTint(0x777777);
        this.tweens.add({ targets: o.img, y: o.img.y + 3, duration: 300 });
        this.log.push({ tip: 'lastik', id: o.r.id });
        BO.floatText(this, this.W / 2, o.y - 10, o.r.kisa + ' YOLDA KALACAK!', BO.PAL.y, { duration: 1300 });
        BO.sfx.coin();
        if (this.otobusler.every((k) => k.bitti)) this.time.delayedCall(900, () => this.bitir());
      }
    }
    this.lastikCiz(l);
  }

  update(t, delta) {
    if (this.bitti) return;
    const dt = Math.min(delta, 50) / 1000;
    this.sure -= dt;
    this.suphe = Math.max(0, this.suphe - 6 * dt);
    // köpeğin uyku döngüsü (ilerleyen günlerde daha az uyur)
    this.kopekZaman -= dt;
    if (this.kopekZaman <= 0) {
      const gunEtki = Math.min(1.2, BO.state.gun * 0.02);
      if (this.kopek === 'uyku') { this.kopek = 'kipir'; this.kopekZaman = 0.9; }
      else if (this.kopek === 'kipir') { this.kopek = 'uyanik'; this.kopekZaman = Phaser.Math.FloatBetween(1.6, 2.4) * BO.zor().det; }
      else { this.kopek = 'uyku'; this.kopekZaman = Phaser.Math.FloatBetween(2.6, 4.8) - gunEtki; }
      this.kopekCiz();
    }
    this.supheBar.width = Math.round(60 * Math.min(1, this.suphe / 100));
    const n = this.otobusler.filter((o) => o.bitti).length;
    this.sayacT.setText('OTOBÜS ' + n + '/3');
    this.saatT.setText('0:' + String(Math.max(0, Math.ceil(this.sure))).padStart(2, '0'));
    if (this.sure <= 0) this.bitir();
  }

  yakalandi() {
    this.bitti = true;
    this.log.push({ tip: 'skandal' });
    BO.sfx.lose(); BO.titret(200);
    this.cameras.main.shake(300, 0.02);
    BO.floatText(this, this.kopekX + 10, this.kopekY - 40, 'HAV HAV HAV!', BO.PAL.r, { duration: 1500 });
    this.oyuncu.setTexture('aday0');
    const tx = BO.text(this, this.W / 2, this.H * 0.4, 'YAKALANDIN!', { size: 16, color: BO.PAL.r, ox: 0.5, oy: 0.5, stroke: 4, depth: 200 });
    BO.text(this, this.W / 2, this.H * 0.4 + 20, 'KÖPEK HER ŞEYİ GÖRDÜ!', { color: BO.PAL.y, ox: 0.5, oy: 0.5, stroke: 3, depth: 200 });
    tx.setScale(0.3);
    this.tweens.add({ targets: tx, scale: 1, duration: 250, ease: 'Back.easeOut' });
    this.time.delayedCall(2000, () => this.git());
  }

  bitir() {
    if (this.bitti) return;
    this.bitti = true;
    this.git();
  }

  git() {
    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.time.delayedCall(620, () => this.scene.start('Morning', { log: this.log }));
  }
};

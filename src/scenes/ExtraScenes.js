// Dükkân, MİTİNG (gündüz görevi) ve AFİŞ BASKINI (gece görevi).
window.BO = window.BO || {};

// ================= Dükkân =================
BO.ShopScene = class extends Phaser.Scene {
  constructor() { super('Shop'); }
  create() {
    const W = this.scale.width, H = this.scale.height, P = BO.PAL, S = BO.state;
    S.ekipman = S.ekipman || {};
    this.add.rectangle(0, 0, W, H, 0x1a1c2c).setOrigin(0);
    this.add.rectangle(0, 0, W, 30, 0x5d275d).setOrigin(0);
    BO.text(this, W / 2, 7, 'DÜKKAN', { size: 16, color: P.y, ox: 0.5 });
    this.kasaT = BO.text(this, W / 2, 36, '', { color: P.y, ox: 0.5 });
    let y = 54;
    BO.EKIPMAN.forEach((e) => {
      const lv = BO.seviye(e.id);
      this.add.rectangle(4, y - 4, W - 8, 32, 0x262b44).setOrigin(0);
      BO.text(this, 8, y, e.ad, { color: P.w });
      for (let i = 0; i < 3; i++) this.add.rectangle(W - 26 + i * 7, y + 1, 5, 5, i < lv ? 0xffcd75 : 0x566c86).setOrigin(0);
      BO.text(this, 8, y + 13, e.acik, { color: P.L });
      const max = lv >= 3;
      const fiyat = max ? 0 : e.fiyat[lv];
      const yetmez = !max && S.kasa < fiyat;
      BO.button(this, W - 36, y + 17, 58, 12, max ? 'MAX' : BO.tl(fiyat).replace(' TL', ''), {
        fill: max ? 'n' : yetmez ? 'L' : 'y', shade: max ? 'N' : yetmez ? 'n' : 'o', color: max ? 'w' : 'k',
        onClick: () => {
          if (max) return;
          if (yetmez) { BO.floatText(this, W / 2, y + 8, 'PARA YETMİYOR!', P.r); return; }
          S.kasa -= fiyat;
          S.ekipman[e.id] = lv + 1;
          BO.save();
          BO.sfx.win();
          this.scene.restart();
        },
      });
      y += 36;
    });
    BO.text(this, W / 2, y + 2, 'HER SEVİYE ETKİYİ\nARTIRIR.', { color: P.n, ox: 0.5, align: 'center' });
    BO.button(this, W / 2, H - 18, 120, 16, 'GERİ', { fill: 'n', shade: 'N', color: 'w', onClick: () => this.scene.start('Hub') });
    this.kasaT.setText('KASA: ' + BO.tl(S.kasa));
    this.cameras.main.fadeIn(200, 26, 28, 44);
  }
};

// ================= MİTİNG =================
// Zamanlama oyunu: ok yeşil bölgedeyken SLOGAN AT. Yuhalayanlara dokunup sustur.
BO.RallyScene = class extends Phaser.Scene {
  constructor() { super('Rally'); }

  create() {
    const W = this.scale.width, H = this.scale.height, P = BO.PAL, S = BO.state;
    this.W = W; this.H = H;
    this.sure = 40;
    this.cosku = 40;
    this.toplam = 0;
    this.combo = 0;
    this.bitti = false;
    this.bekleme = 0;
    this.st = { tur: 'miting', gun: S.gun, oyBas: S.oy, itibarBas: S.itibar, mukemmel: 0, iyi: 0, kacan: 0, susturulan: 0, yuh: 0, bagis: 0 };
    const C = (k) => Phaser.Display.Color.HexStringToColor(P[k] || k).color;

    // Sahne
    this.add.rectangle(0, 0, W, H, C('#1f2547')).setOrigin(0);
    this.add.rectangle(0, 30, W, 80, C('p')).setOrigin(0);
    for (let x = 0; x < W; x += 12) this.add.rectangle(x, 30, 6, 80, C('#6a3070')).setOrigin(0);
    this.add.rectangle(20, 36, W - 40, 14, C('o')).setOrigin(0).setStrokeStyle(1, C('k'));
    BO.text(this, W / 2, 39, (S.adayAd || 'ADAY').slice(0, 14), { color: P.k, ox: 0.5 });
    [[8, 70], [W - 22, 70]].forEach(([x, y]) => {
      this.add.rectangle(x, y, 14, 30, C('k')).setOrigin(0);
      this.add.circle(x + 7, y + 9, 4, C('n')); this.add.circle(x + 7, y + 21, 5, C('n'));
    });
    this.add.rectangle(0, 104, W, 8, C('m')).setOrigin(0);
    this.aday = this.add.sprite(W / 2, 100, 'aday0').setOrigin(0.5, 1).setScale(2).play('el_salla');
    this.add.image(W / 2 + 8, 82, 'mikrofon').setScale(2);
    this.add.rectangle(W / 2 - 14, 86, 28, 18, C('k')).setOrigin(0);
    this.add.rectangle(W / 2 - 13, 87, 26, 16, C('E')).setOrigin(0);
    this.add.rectangle(W / 2 - 5, 91, 10, 6, C('o')).setOrigin(0);

    // Kalabalık (arkadan)
    this.kalabalik = [];
    const crowdBottom = H - 74;
    for (let y = 122; y < crowdBottom; y += 15) {
      for (let x = 12; x < W - 6; x += 19) {
        const s = this.add.image(x + Phaser.Math.Between(-3, 3), y + Phaser.Math.Between(-2, 2), 'secmen_arka');
        s.baseY = s.y; s.yuh = false;
        this.kalabalik.push(s);
      }
    }
    this.kalabalik.forEach((s) => s.setDepth(s.y));
    this.yuhTimer = 3;

    // HUD
    this.add.rectangle(0, 0, W, 28, C('k'), 0.92).setOrigin(0).setDepth(500);
    BO.text(this, 4, 4, 'MİTİNG', { color: P.y, depth: 501 });
    this.saatT = BO.text(this, W - 4, 4, '', { color: P.w, ox: 1, depth: 501 });
    BO.text(this, 4, 16, 'COŞKU', { color: P.o, depth: 501 });
    this.add.rectangle(48, 17, W - 54, 6, C('N')).setOrigin(0).setDepth(501);
    this.coskuBar = this.add.rectangle(48, 17, 0, 6, C('o')).setOrigin(0).setDepth(502);

    // Zamanlama çubuğu
    const by = H - 58;
    this.barX = 15; this.barW = W - 30;
    this.add.rectangle(this.barX - 1, by - 1, this.barW + 2, 10, C('k')).setOrigin(0).setDepth(500);
    this.add.rectangle(this.barX, by, this.barW, 8, C('r')).setOrigin(0).setDepth(500);
    this.add.rectangle(W / 2 - 22, by, 44, 8, C('y')).setOrigin(0).setDepth(500);
    this.add.rectangle(W / 2 - 7, by, 14, 8, C('l')).setOrigin(0).setDepth(500);
    this.ok = this.add.rectangle(this.barX, by - 3, 3, 14, C('w')).setOrigin(0.5, 0).setDepth(501);
    this.okDir = 1;
    BO.button(this, W / 2, H - 26, 150, 22, 'SLOGAN AT!', { fill: 'y', shade: 'o', size: 8, depth: 510, onDown: () => this.slogan() });

    this.balon = BO.text(this, W / 2, 56, '', { color: P.w, ox: 0.5, oy: 0.5, stroke: 3, depth: 520 });

    this.input.on('pointerdown', (p, over) => { if (!(over && over.length)) this.dokun(p.x, p.y); });
    this.input.keyboard.on('keydown-SPACE', () => this.slogan());

    const ipucu = BO.text(this, W / 2, H * 0.5, 'OK YEŞİLDEYKEN\nSLOGAN AT!\nYUHALAYANLARA\nDOKUN!', { color: P.y, ox: 0.5, oy: 0.5, align: 'center', stroke: 3, depth: 600 });
    this.tweens.add({ targets: ipucu, alpha: 0, delay: 2500, duration: 400, onComplete: () => ipucu.destroy() });
    this.cameras.main.fadeIn(300, 26, 28, 44);
  }

  slogan() {
    if (this.bitti || this.bekleme > 0) return;
    this.bekleme = 0.25;
    const P = BO.PAL, merkez = this.W / 2;
    const d = Math.abs(this.ok.x - merkez);
    const ad = BO.kisaAd();
    const sloganlar = [ad + ' BAŞKAN!', 'SİMİT HERKESE!', 'YOLLAR ASFALT!', 'ÇAY BEDAVA!', 'GELİYOR ' + ad + '!', 'DEĞİŞİM ŞART!'];
    let puan, yazi, renk;
    if (d <= 7) { puan = 12; yazi = 'MÜKEMMEL!'; renk = P.l; this.st.mukemmel++; this.combo++; }
    else if (d <= 22) { puan = 6; yazi = 'İYİ!'; renk = P.y; this.st.iyi++; this.combo++; }
    else { puan = -8; yazi = 'IHHH...'; renk = P.r; this.st.kacan++; this.combo = 0; }
    this.cosku = BO.clamp(this.cosku + puan, 0, 100);
    this.balon.setText(puan > 0 ? Phaser.Utils.Array.GetRandom(sloganlar) : 'EEE... ŞEY...');
    this.balon.setScale(0.6);
    this.tweens.add({ targets: this.balon, scale: 1, duration: 150, ease: 'Back.easeOut' });
    BO.floatText(this, this.W / 2, this.H - 72, yazi + (this.combo > 2 ? ' x' + this.combo : ''), renk);
    this.tweens.add({ targets: this.aday, scaleY: 2.2, duration: 80, yoyo: true });
    if (puan > 0) {
      BO.sfx.happy();
      const zipla = Phaser.Utils.Array.Shuffle(this.kalabalik.filter((s) => !s.yuh)).slice(0, puan > 10 ? 30 : 12);
      zipla.forEach((s) => this.tweens.add({ targets: s, y: s.baseY - 4, duration: 120, yoyo: true, delay: Phaser.Math.Between(0, 120) }));
    } else {
      BO.sfx.splat();
      this.cameras.main.shake(100, 0.005);
    }
  }

  dokun(x, y) {
    if (this.bitti) return;
    const s = this.kalabalik.find((k) => k.yuh && Math.abs(k.x - x) < 12 && Math.abs(k.y - y) < 14);
    if (!s) return;
    this.yuhBitir(s, true);
  }

  yuhBaslat() {
    const adaylar = this.kalabalik.filter((s) => !s.yuh);
    if (!adaylar.length) return;
    const s = Phaser.Utils.Array.GetRandom(adaylar);
    s.yuh = true; s.kalan = 2.6;
    s.setTexture('secmen_kizgin');
    s.etiket = BO.text(this, s.x, s.y - 12, 'YUH!', { color: BO.PAL.r, ox: 0.5, oy: 1, stroke: 2, depth: 400 });
    s.titre = this.tweens.add({ targets: s, x: s.x + 1, duration: 50, yoyo: true, repeat: -1 });
    BO.sfx.angry();
  }

  yuhBitir(s, susturuldu) {
    s.yuh = false;
    s.titre.stop();
    s.etiket.destroy();
    const P = BO.PAL;
    if (susturuldu) {
      this.st.susturulan++;
      this.cosku = BO.clamp(this.cosku + 4, 0, 100);
      s.setTexture('secmen_mutlu');
      BO.floatText(this, s.x, s.y - 14, Phaser.Utils.Array.GetRandom(['TAMAM ABİ!', 'HAKLISIN!', 'PEKİ...']), P.l);
      BO.sfx.coin();
      this.time.delayedCall(900, () => s.setTexture('secmen_arka'));
    } else {
      this.st.yuh++;
      this.cosku = BO.clamp(this.cosku - 10, 0, 100);
      BO.titret(80);
      // domates sahneye uçar
      const t = this.add.image(s.x, s.y - 6, 'domates').setDepth(450);
      this.tweens.add({
        targets: t, x: this.aday.x + Phaser.Math.Between(-10, 10), y: 80, angle: 400, duration: 400,
        onComplete: () => {
          t.setTexture('leke'); BO.sfx.splat();
          this.tweens.add({ targets: t, alpha: 0, delay: 600, duration: 400, onComplete: () => t.destroy() });
        },
      });
      BO.floatText(this, s.x, s.y - 14, 'COŞKU -10', P.r);
      this.time.delayedCall(700, () => s.setTexture('secmen_arka'));
    }
  }

  update(t, delta) {
    if (this.bitti) return;
    const dt = Math.min(delta, 50) / 1000;
    this.sure -= dt;
    this.bekleme -= dt;
    const azalma = 2.5 * (1 - 0.2 * BO.seviye('hoparlor'));
    this.cosku = BO.clamp(this.cosku - azalma * dt, 0, 100);
    this.toplam += this.cosku * dt;

    // ok ileri geri
    const hiz = Math.min(230, 95 + this.combo * 10 + (40 - this.sure) * 1.5);
    this.ok.x += this.okDir * hiz * dt;
    if (this.ok.x > this.barX + this.barW) { this.ok.x = this.barX + this.barW; this.okDir = -1; }
    if (this.ok.x < this.barX) { this.ok.x = this.barX; this.okDir = 1; }

    // yuhalayanlar
    this.yuhTimer -= dt;
    if (this.yuhTimer <= 0) { this.yuhBaslat(); this.yuhTimer = Phaser.Math.FloatBetween(2.5, 5); }
    this.kalabalik.forEach((s) => {
      if (!s.yuh) return;
      s.kalan -= dt;
      if (s.kalan <= 0) this.yuhBitir(s, false);
    });

    this.coskuBar.width = Math.round((this.W - 54) * this.cosku / 100);
    this.coskuBar.fillColor = this.cosku > 66 ? 0xa7f070 : this.cosku > 33 ? 0xef7d57 : 0xb13e53;
    const s = Math.max(0, Math.ceil(this.sure));
    this.saatT.setText('0:' + String(s).padStart(2, '0'));
    if (this.sure <= 0) this.bitir();
  }

  bitir() {
    this.bitti = true;
    const S = BO.state, st = this.st;
    const ort = this.toplam / 40;
    st.ortCosku = Math.round(ort);
    const oyD = (ort / 100) * 1.6 + st.mukemmel * 0.02;
    S.oy += oyD;
    S.itibar = BO.clamp(S.itibar + Math.round((ort - 45) / 8), 0, 100);
    st.bagis = Math.round(ort * 30 / 50) * 50;
    S.kasa += st.bagis;
    BO.sfx.win();
    const t = BO.text(this, this.W / 2, this.H * 0.45, 'MİTİNG BİTTİ!', { size: 16, color: BO.PAL.y, ox: 0.5, oy: 0.5, stroke: 4, depth: 700 });
    t.setScale(0.3);
    this.tweens.add({ targets: t, scale: 1, duration: 300, ease: 'Back.easeOut' });
    this.kalabalik.forEach((s) => this.tweens.add({ targets: s, y: s.baseY - 4, duration: 150, yoyo: true, repeat: 3, delay: Phaser.Math.Between(0, 300) }));
    this.time.delayedCall(1600, () => {
      this.cameras.main.fadeOut(400, 26, 28, 44);
      this.time.delayedCall(420, () => this.scene.start('Summary', st));
    });
  }
};

// ================= AFİŞ BASKINI =================
// Afişe basılı tutarak bıyık çiz. Polis gelince parmağını çek!
BO.PosterScene = class extends Phaser.Scene {
  constructor() { super('Poster'); }

  create() {
    const W = this.scale.width, H = this.scale.height, P = BO.PAL;
    this.W = W; this.H = H;
    this.sure = 45;
    this.bitti = false;
    this.log = [];
    this.cizilen = 0;
    this.aktif = null;
    this.polis = null;
    this.polisTimer = 4;
    const C = (k) => Phaser.Display.Color.HexStringToColor(P[k] || k).color;

    this.add.tileSprite(0, 0, W, H - 56, 'tugla').setOrigin(0);
    this.add.rectangle(0, 0, W, H, 0x000000, 0.35).setOrigin(0);
    this.kaldirimY = H - 56;
    this.add.rectangle(0, this.kaldirimY, W, 22, C('n')).setOrigin(0);
    this.add.rectangle(0, this.kaldirimY, W, 2, C('L')).setOrigin(0);
    this.add.rectangle(0, this.kaldirimY + 22, W, 34, C('#1e2236')).setOrigin(0);
    for (let x = 4; x < W; x += 24) this.add.rectangle(x, H - 18, 12, 2, C('L')).setOrigin(0);
    this.add.image(W - 14, 40, 'isik').setScale(0.8);

    // Afişler
    this.afisler = [];
    const top = 40, alt = this.kaldirimY - 6;
    const ph = 60, pw = 50;
    const satirlar = (alt - top) > 2 * ph + 16 ? 2 : 1;
    const ys = satirlar === 2 ? [top + ph / 2 + 4, top + ph * 1.5 + 18] : [top + (alt - top) / 2];
    ys.forEach((y) => [32, 90, 148].forEach((x) => {
      const r = Phaser.Utils.Array.GetRandom(BO.RIVALS);
      const c = this.add.container(x, y);
      c.add(this.add.rectangle(0, 0, pw + 2, ph + 2, C('w')));
      c.add(this.add.rectangle(0, 0, pw - 2, ph - 2, C(r.renk)));
      c.add(this.add.image(0, -6, 'rakip_' + r.id).setScale(3));
      c.add(BO.text(this, 0, ph / 2 - 11, r.kisa, { color: P.w, ox: 0.5, stroke: 2 }));
      const g = this.add.graphics();
      c.add(g);
      const bar = this.add.rectangle(x - pw / 2, y + ph / 2 + 3, 0, 3, C('l')).setOrigin(0);
      this.afisler.push({ c, g, r, x, y, ilerleme: 0, bitti: false, bar, w: pw, h: ph });
    }));

    // Oyuncu (kılıklı) kaldırımda
    this.oyuncu = this.add.sprite(W / 2, this.kaldirimY + 16, 'kilik0').setOrigin(0.5, 1).setDepth(50);
    this.coneG = this.add.graphics().setDepth(40);

    // HUD
    this.add.rectangle(0, 0, W, 28, C('k'), 0.92).setOrigin(0).setDepth(500);
    BO.text(this, 4, 4, 'AFİŞ BASKINI', { color: P.y, depth: 501 });
    this.saatT = BO.text(this, W - 4, 4, '', { color: P.w, ox: 1, depth: 501 });
    this.sayacT = BO.text(this, 4, 16, '', { color: P.l, depth: 501 });
    this.uyariT = BO.text(this, W - 4, 16, '', { color: P.r, ox: 1, depth: 501 });
    BO.button(this, W - 30, H - 9, 52, 12, 'EVE DÖN', { fill: 'p', shade: 'k', color: 'w', depth: 510, onClick: () => this.bitir(false) });

    this.input.on('pointerdown', (p, over) => {
      if (this.bitti || (over && over.length)) return;
      const a = this.afisler.find((f) => !f.bitti && Math.abs(p.x - f.x) < f.w / 2 + 2 && Math.abs(p.y - f.y) < f.h / 2 + 2);
      if (a) { this.aktif = a; this.tweens.add({ targets: this.oyuncu, x: a.x, duration: 200 }); }
    });
    this.input.on('pointerup', () => { this.aktif = null; });

    const ipucu = BO.text(this, W / 2, H * 0.45, 'AFİŞE BASILI TUT,\nBIYIK ÇİZ!\nPOLİS GELİNCE\nPARMAĞINI ÇEK!', { color: P.y, ox: 0.5, oy: 0.5, align: 'center', stroke: 3, depth: 600 });
    this.tweens.add({ targets: ipucu, alpha: 0, delay: 2800, duration: 400, onComplete: () => ipucu.destroy() });
    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  ciz(a) {
    // bıyık + rastgele süs
    const g = a.g, k = 0x1a1c2c;
    g.fillStyle(k, 1);
    g.fillRect(-9, 0, 18, 3); g.fillRect(-12, 2, 4, 3); g.fillRect(8, 2, 4, 3);
    const tip = Phaser.Math.Between(0, 2);
    if (tip === 0) { g.fillStyle(0xb13e53, 1); g.fillTriangle(-12, -24, -8, -34, -5, -24); g.fillTriangle(5, -24, 8, -34, 12, -24); }
    else if (tip === 1) { g.fillStyle(k, 1); g.fillRect(-11, -14, 9, 5); g.fillRect(2, -14, 9, 5); g.fillRect(-2, -13, 4, 2); }
    else { g.lineStyle(2, k, 1); g.lineBetween(-10, -16, -4, -10); g.lineBetween(-4, -16, -10, -10); g.lineBetween(4, -16, 10, -10); g.lineBetween(10, -16, 4, -10); }
    this.tweens.add({ targets: a.c, angle: { from: -4, to: 4 }, duration: 60, yoyo: true, repeat: 3, onComplete: () => a.c.setAngle(Phaser.Math.Between(-3, 3)) });
  }

  update(t, delta) {
    if (this.bitti) return;
    const dt = Math.min(delta, 50) / 1000, P = BO.PAL;
    this.sure -= dt;

    // çizim
    const a = this.aktif;
    const ciziyor = a && !a.bitti && Math.abs(this.oyuncu.x - a.x) < 3;
    if (ciziyor) {
      a.ilerleme += dt / 1.5;
      a.bar.width = Math.round(a.w * Math.min(1, a.ilerleme));
      this.oyuncu.setTexture(Math.floor(t / 100) % 2 ? 'kilik0' : 'kilik1');
      if (a.ilerleme >= 1) {
        a.bitti = true; this.aktif = null; this.cizilen++;
        this.ciz(a);
        BO.sfx.coin();
        BO.floatText(this, a.x, a.y - 30, a.r.kisa + ' -2', P.l);
        const e = this.log.find((l) => l.id === a.r.id);
        if (e) e.sayi++; else this.log.push({ tip: 'afis', id: a.r.id, sayi: 1 });
        if (this.afisler.every((f) => f.bitti)) { BO.floatText(this, this.W / 2, this.H / 2, 'TAM TEMİZLİK!', P.y, { size: 16 }); this.time.delayedCall(800, () => this.bitir(false)); }
      }
    }
    this.oyuncu.setAlpha(ciziyor ? 1 : 0.6);

    // polis devriyesi
    this.polisTimer -= dt;
    if (!this.polis && this.polisTimer <= 0) this.polisGeliyor();
    this.coneG.clear();
    this.uyariT.setText(this.polisUyari ? 'AYAK SESİ!' : '');
    if (this.polis) {
      const p = this.polis;
      p.x += p.dir * 55 * dt;
      p.aci = -Math.PI / 2 + Math.sin(t / 250) * 0.5;
      const L = 120, half = 0.35;
      const ox = p.x, oy = p.y - 10;
      this.coneG.fillStyle(0xd8f4ff, 0.3).fillTriangle(ox, oy,
        ox + Math.cos(p.aci - half) * L, oy + Math.sin(p.aci - half) * L,
        ox + Math.cos(p.aci + half) * L, oy + Math.sin(p.aci + half) * L);
      // fener altında çiziyorsan yakalanırsın (bıyık seviyesi tolerans verir)
      const gorur = ciziyor && Math.abs(this.oyuncu.x - p.x) < 28;
      p.risk = gorur ? p.risk + dt : 0;
      if (p.risk > 0.15 + 0.15 * BO.seviye('biyik')) { this.yakalandi(); return; }
      if ((p.dir > 0 && p.x > this.W + 20) || (p.dir < 0 && p.x < -20)) {
        p.destroy(); this.polis = null;
        this.polisTimer = Phaser.Math.FloatBetween(3.5, 6.5) / BO.zor().det;
      }
    }

    this.sayacT.setText('AFİŞ ' + this.cizilen + '/' + this.afisler.length);
    const s = Math.max(0, Math.ceil(this.sure));
    this.saatT.setText('0:' + String(s).padStart(2, '0'));
    if (this.sure <= 0) this.bitir(false);
  }

  polisGeliyor() {
    this.polisTimer = 99;
    this.polisUyari = true;
    BO.sfx.alarm();
    const dir = Math.random() < 0.5 ? 1 : -1;
    const isaret = this.add.image(dir > 0 ? 10 : this.W - 10, this.kaldirimY + 2, 'isaret').setDepth(60).setScale(2);
    this.tweens.add({ targets: isaret, alpha: 0.2, duration: 150, yoyo: true, repeat: 4, onComplete: () => isaret.destroy() });
    this.time.delayedCall(1400, () => {
      if (this.bitti) return;
      this.polisUyari = false;
      const p = this.add.sprite(dir > 0 ? -12 : this.W + 12, this.kaldirimY + 18, 'polis0').setOrigin(0.5, 1).setDepth(55).play('polis_yuru');
      p.dir = dir; p.risk = 0; p.setFlipX(dir < 0);
      this.polis = p;
    });
  }

  yakalandi() {
    this.bitti = true;
    this.log.push({ tip: 'skandal' });
    BO.sfx.lose(); BO.titret(200);
    this.cameras.main.shake(300, 0.02);
    this.cameras.main.flash(250, 255, 255, 255);
    this.oyuncu.setTexture('aday0').setAlpha(1);
    const t = BO.text(this, this.W / 2, this.H * 0.4, 'YAKALANDIN!', { size: 16, color: BO.PAL.r, ox: 0.5, oy: 0.5, stroke: 4, depth: 700 });
    BO.text(this, this.W / 2, this.H * 0.4 + 20, 'KILIĞIN DÜŞTÜ!', { color: BO.PAL.y, ox: 0.5, oy: 0.5, stroke: 3, depth: 700 });
    t.setScale(0.3);
    this.tweens.add({ targets: t, scale: 1, duration: 250, ease: 'Back.easeOut' });
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

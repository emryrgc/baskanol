// AÇILIŞ HİKAYESİ: "Yeni oyun"dan sonra oynayan kısa sinematik. Rakipleri tanıtır.
// Dokun: yazıyı tamamla / sonraki sahne. GEÇ: hikayeyi atla.
window.BO = window.BO || {};

BO.IntroScene = class extends Phaser.Scene {
  constructor() { super('Intro'); }

  create() {
    const W = BO.W, H = BO.H, P = BO.PAL;
    this.W = W; this.H = H;
    this.i = -1;
    this.sahne = null;
    this.yaziyor = false;
    const C = (k) => Phaser.Display.Color.HexStringToColor(P[k] || k).color;
    this.C = C;

    this.add.rectangle(0, 0, W, H, 0x000000).setOrigin(0);
    // Altta yazı kutusu
    const by = H - BO.ALT - 96;
    this.kutuY = by;
    this.add.rectangle(6, by, W - 12, 84, C('k'), 0.94).setOrigin(0).setStrokeStyle(1, C('n')).setDepth(100);
    this.yazi = BO.text(this, 12, by + 6, '', { color: P.w, wrap: W - 24, depth: 101 });
    this.devamT = BO.text(this, W - 12, by + 72, 'DOKUN ›', { color: P.n, ox: 1, depth: 101 });
    this.tweens.add({ targets: this.devamT, alpha: 0.2, duration: 500, yoyo: true, repeat: -1 });
    this.noktalar = [];
    for (let k = 0; k < this.slaytlar().length; k++) {
      this.noktalar.push(this.add.rectangle(W / 2 - 28 + k * 8, by - 6, 4, 4, C('N')).setDepth(100));
    }
    BO.button(this, W - 24, 10, 40, 14, 'GEÇ', { fill: 'n', depth: 120, onClick: () => this.bitir() });

    this.input.on('pointerdown', (p, over) => {
      if (over && over.length) return;
      if (this.yaziyor) this.yaziTamamla(); else this.sonraki();
    });
    this.sonraki();
  }

  // ---------- Sahneler ----------
  slaytlar() {
    const S = this;
    return [
      { yazi: 'BİR ŞEHİR...\nVE SEÇİME SADECE 60 GÜN KALDI.', ciz: (c) => S.sehir(c) },
      { yazi: 'ŞEHRİ YILLARDIR AYNI ÜÇ ADAY YÖNETMEK İSTİYOR. VAATLER BOL, İCRAAT YOK.', ciz: (c) => S.ucAday(c) },
      { yazi: "VAATÇİ VEDAT - BOL VAAT PARTİSİ.\n'HER EVE METRO!' DEDİ. METRO HÂLÂ YOK.", ciz: (c) => S.rakipKart(c, 'vedat', ['METRO!', 'KÖPRÜ!', 'UÇAK!']) },
      { yazi: 'SELFİ SELİN - IŞILTI PARTİSİ.\nGÜNDE 300 SELFİ ÇEKER. PROGRAMI: FİLTRE.', ciz: (c) => S.rakipKart(c, 'selin', ['ÇEK!', 'FİLTRE!', '#BEN']) },
      { yazi: 'UYKUCU ULVİ - YARIN PARTİSİ.\nHER İŞİ YARINA BIRAKIR. MİTİNGDE BİLE UYUR.', ciz: (c) => S.rakipKart(c, 'ulvi', ['Z', 'ZZ', 'ZZZ']) },
      { yazi: 'VE SEN... SIRADAN BİR VATANDAŞ.\nBİR OTOBÜS, BİRAZ PARA VE ÇOK FAZLA SİMİT.', ciz: (c) => S.sen(c) },
      { yazi: "GÜNDÜZ HALKA ERZAK DAĞIT, MİTİNG YAP.\nGECE RAKİPLERİ BİRAZ 'RAHATSIZ' ET.", ciz: (c) => S.gunGece(c) },
      { yazi: '60 GÜN SONRA SANDIK KURULACAK.\nHAZIR MISIN?', ciz: (c) => S.sandik(c), son: true },
    ];
  }

  sonraki() {
    const list = this.slaytlar();
    this.i++;
    if (this.i >= list.length) { this.bitir(); return; }
    const sl = list[this.i];
    this.noktalar.forEach((n, k) => n.setFillStyle(k <= this.i ? 0xffcd75 : 0x333c57));
    if (this.sahne) {
      const eski = this.sahne;
      this.tweens.add({ targets: eski, alpha: 0, duration: 200, onComplete: () => eski.destroy() });
    }
    this.sahne = this.add.container(0, 0).setAlpha(0);
    this.tweens.add({ targets: this.sahne, alpha: 1, duration: 300 });
    sl.ciz(this.sahne);
    this.yazdir(sl.yazi);
    this.devamT.setText(sl.son ? '' : 'DOKUN ›');
    if (sl.son) {
      this.time.delayedCall(600, () => {
        const b = BO.button(this, this.W / 2, this.kutuY + 64, 150, 18, 'ADAYINI OLUŞTUR', { fill: 'y', depth: 110, onClick: () => this.bitir() });
        BO.pulse(this, b);
      });
    }
  }

  yazdir(metin) {
    this.hedefYazi = metin;
    this.harf = 0;
    this.yaziyor = true;
    this.yazi.setText('');
    if (this.yaziOlay) this.yaziOlay.remove();
    this.yaziOlay = this.time.addEvent({
      delay: 28, loop: true, callback: () => {
        this.harf++;
        this.yazi.setText(metin.slice(0, this.harf));
        if (this.harf % 3 === 0 && metin[this.harf - 1] !== ' ') BO.sfx.lane();
        if (this.harf >= metin.length) this.yaziTamamla();
      },
    });
  }

  yaziTamamla() {
    if (this.yaziOlay) this.yaziOlay.remove();
    this.yazi.setText(this.hedefYazi);
    this.yaziyor = false;
  }

  bitir() {
    if (this.bitti) return;
    this.bitti = true;
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.time.delayedCall(310, () => this.scene.start('Name'));
  }

  // ---------- Çizimler ----------
  gokyuzu(c, renkler) {
    const W = this.W, alan = this.kutuY - 10;
    const bant = Math.ceil(alan / renkler.length);
    renkler.forEach((r, k) => c.add(this.add.rectangle(0, k * bant, W, bant + 1, this.C(r)).setOrigin(0)));
    return alan;
  }

  siluet(c, zemin, renk, pencere) {
    // basit şehir silueti
    let x = -4, seed = 3;
    const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    while (x < this.W + 4) {
      const w = 14 + Math.floor(rnd() * 16), h = 30 + Math.floor(rnd() * 60);
      c.add(this.add.rectangle(x, zemin - h, w, h, this.C(renk)).setOrigin(0));
      for (let wy = zemin - h + 4; wy < zemin - 6; wy += 7) for (let wx = x + 3; wx < x + w - 3; wx += 5) {
        if (rnd() < 0.35) c.add(this.add.rectangle(wx, wy, 2, 3, this.C(pencere)).setOrigin(0));
      }
      x += w + 2;
    }
    c.add(this.add.rectangle(0, zemin, this.W, 12, this.C('k')).setOrigin(0));
  }

  sehir(c) {
    const alan = this.gokyuzu(c, ['#1a1c2c', '#29366f', '#5d275d', '#b13e53', '#ef7d57']);
    for (let k = 0; k < 18; k++) {
      const y = Phaser.Math.Between(4, alan * 0.4);
      const s = this.add.rectangle(Phaser.Math.Between(0, this.W), y, 1, 1, 0xf4f4f4);
      c.add(s);
      this.tweens.add({ targets: s, alpha: 0.2, duration: Phaser.Math.Between(400, 1200), yoyo: true, repeat: -1 });
    }
    const ay = this.add.circle(140, 26, 8, 0xffcd75); c.add(ay);
    const sil = this.add.container(0, 0); c.add(sil);
    this.siluet(sil, alan - 6, '#11131f', '#ffcd75');
    this.tweens.add({ targets: sil, x: -6, duration: 6000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    const t = BO.text(this, this.W / 2, 34, 'SEÇİME 60 GÜN', { size: 16, color: BO.PAL.y, ox: 0.5, stroke: 3 });
    c.add(t);
  }

  ucAday(c) {
    const alan = this.gokyuzu(c, ['#29366f', '#3b4a70']);
    c.add(this.add.rectangle(0, alan - 40, this.W, 40, this.C('m')).setOrigin(0));
    c.add(this.add.rectangle(0, alan - 40, this.W, 2, this.C('k')).setOrigin(0));
    const lafler = { vedat: 'METRO!', selin: 'FİLTRE!', ulvi: 'YARIN!' };
    BO.RIVALS.forEach((r, k) => {
      const x = 36 + k * 54, y = alan - 30;
      const sp = this.add.image(x, y, 'rakip_' + r.id).setScale(3).setOrigin(0.5, 1);
      c.add(sp);
      this.tweens.add({ targets: sp, y: y - 3, duration: 300 + k * 80, yoyo: true, repeat: -1 });
      const b = BO.text(this, x, y - 62, lafler[r.id], { color: BO.PAL[r.renk === 'g' ? 'l' : 'w'], ox: 0.5, stroke: 2 });
      c.add(b);
      this.tweens.add({ targets: b, alpha: 0.3, duration: 400, delay: k * 200, yoyo: true, repeat: -1 });
    });
  }

  rakipKart(c, id, lafler) {
    const r = BO.rakipBilgi(id), P = BO.PAL;
    const alan = this.kutuY - 10;
    c.add(this.add.rectangle(0, 0, this.W, alan, this.C(r.renk)).setOrigin(0));
    // ışık huzmeleri
    const g = this.add.graphics(); c.add(g);
    g.fillStyle(0xffffff, 0.08);
    for (let k = 0; k < 6; k++) g.fillTriangle(this.W / 2, alan * 0.55, k * 36 - 10, -10, k * 36 + 10, -10);
    c.add(this.add.rectangle(0, alan - 18, this.W, 18, this.C('k'), 0.5).setOrigin(0));
    const sp = this.add.image(this.W / 2, alan - 16, 'rakip_' + id).setScale(5).setOrigin(0.5, 1);
    c.add(sp);
    sp.y += 30;
    this.tweens.add({ targets: sp, y: alan - 16, duration: 450, ease: 'Back.easeOut' });
    this.tweens.add({ targets: sp, scaleY: 5.15, duration: 400, delay: 500, yoyo: true, repeat: -1 });
    c.add(this.add.rectangle(10, 10, this.W - 20, 30, this.C('k'), 0.75).setOrigin(0));
    c.add(BO.text(this, this.W / 2, 12, r.ad, { size: 16, color: P.y, ox: 0.5 }));
    c.add(BO.text(this, this.W / 2, 28, r.parti, { color: P.w, ox: 0.5 }));
    lafler.forEach((l, k) => {
      const t = BO.text(this, k % 2 ? 140 : 40, 60 + k * 22, l, { color: P.w, ox: 0.5, stroke: 2 });
      t.setAlpha(0); c.add(t);
      this.tweens.add({ targets: t, alpha: 1, y: t.y - 6, duration: 400, delay: 500 + k * 450, yoyo: true, hold: 600, repeat: -1, repeatDelay: 800 });
    });
  }

  sen(c) {
    const alan = this.kutuY - 10, P = BO.PAL;
    c.add(this.add.rectangle(0, 0, this.W, alan, 0x000000).setOrigin(0));
    const g = this.add.graphics(); c.add(g);
    g.fillStyle(0xffcd75, 0.12).fillTriangle(this.W / 2, -10, this.W / 2 - 50, alan, this.W / 2 + 50, alan);
    c.add(this.add.ellipse(this.W / 2, alan - 12, 70, 10, 0xffcd75, 0.18));
    const sp = this.add.image(this.W / 2, alan - 12, 'aday0').setScale(5).setOrigin(0.5, 1).setTint(0x111111);
    c.add(sp);
    const q = BO.text(this, this.W / 2 + 34, alan - 90, '?', { size: 24, color: P.y, ox: 0.5 });
    c.add(q);
    this.tweens.add({ targets: q, y: q.y - 6, duration: 500, yoyo: true, repeat: -1 });
    // biraz sonra ışık yanar, aday görünür
    this.time.delayedCall(1400, () => { if (sp.active) { sp.clearTint(); BO.sfx.happy(); } });
  }

  gunGece(c) {
    const alan = this.kutuY - 10, W = this.W;
    // sol: gündüz
    c.add(this.add.rectangle(0, 0, W / 2, alan, this.C('t')).setOrigin(0));
    c.add(this.add.circle(20, 20, 8, 0xffcd75));
    c.add(this.add.rectangle(0, alan - 30, W / 2, 30, this.C('L')).setOrigin(0));
    const bus = this.add.image(W / 4, alan - 40, 'otobus').setScale(2).setAngle(-90);
    c.add(bus);
    this.tweens.add({ targets: bus, x: W / 4 + 6, duration: 600, yoyo: true, repeat: -1 });
    const sm = this.add.image(W / 4 - 10, alan - 80, 'simit').setScale(2); c.add(sm);
    this.tweens.add({ targets: sm, y: alan - 100, angle: 360, duration: 800, repeat: -1 });
    // sağ: gece
    c.add(this.add.rectangle(W / 2, 0, W / 2, alan, this.C('#1a1c2c')).setOrigin(0));
    c.add(this.add.circle(W - 20, 20, 7, 0xf4f4f4));
    const g = this.add.graphics(); c.add(g);
    g.fillStyle(0xd8f4ff, 0.18).fillTriangle(W - 20, alan - 30, W / 2 + 10, alan - 70, W / 2 + 10, alan - 30);
    const kl = this.add.sprite(W * 0.68, alan - 30, 'kilik0').setScale(3).setOrigin(0.5, 1).play('kilik_yuru'); c.add(kl);
    c.add(this.add.rectangle(W / 2 - 1, 0, 2, alan, this.C('k')).setOrigin(0));
    c.add(BO.text(this, W / 4, 34, 'GÜNDÜZ', { size: 16, color: BO.PAL.k, ox: 0.5 }));
    c.add(BO.text(this, W * 0.75, 34, 'GECE', { size: 16, color: BO.PAL.y, ox: 0.5 }));
  }

  sandik(c) {
    const alan = this.kutuY - 10, W = this.W;
    this.gokyuzu(c, ['#29366f', '#3b4a70', '#566c86']);
    c.add(this.add.rectangle(W / 2 - 30, alan - 70, 60, 50, 0xf4f4f4).setOrigin(0).setStrokeStyle(2, 0x1a1c2c));
    c.add(this.add.rectangle(W / 2 - 14, alan - 70, 28, 3, 0x1a1c2c).setOrigin(0));
    c.add(BO.text(this, W / 2, alan - 52, 'SANDIK', { color: BO.PAL.k, ox: 0.5 }));
    for (let k = 0; k < 5; k++) {
      const z = this.add.rectangle(W / 2 + Phaser.Math.Between(-30, 30), -10, 10, 6, 0xffcd75).setStrokeStyle(1, 0x1a1c2c);
      c.add(z);
      this.tweens.add({ targets: z, y: alan - 70, x: W / 2, duration: 900, delay: k * 350, repeat: -1, repeatDelay: 900 });
    }
    c.add(BO.text(this, W / 2, 24, 'BAŞKAN OL!', { size: 24, color: BO.PAL.y, ox: 0.5, stroke: 3 }));
  }
};

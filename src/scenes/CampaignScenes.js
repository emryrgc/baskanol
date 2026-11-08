// Kampanya ekranları: gün atlama özeti, anket, TV münazarası, seçim günü.
window.BO = window.BO || {};

BO.fadeTo = function (scene, key, data) {
  scene.cameras.main.fadeOut(250, 26, 28, 44);
  scene.time.delayedCall(260, () => scene.scene.start(key, data));
};

// Anket çubukları (Poll ve Election ortak kullanır)
BO.partiListesi = function () {
  const S = BO.state;
  return [{ id: 'biz', ad: 'BİZ', renk: 'o', oy: S.oy }]
    .concat(BO.RIVALS.map((r) => ({ id: r.id, ad: r.kisa, renk: r.renk, oy: BO.rakip(r.id).oy })));
};

// ================= Gün atlama özeti =================
BO.SkipScene = class extends Phaser.Scene {
  constructor() { super('Skip'); }
  init(d) { this.gunler = d.gunler || []; }
  create() {
    const W = this.scale.width, H = this.scale.height, P = BO.PAL, S = BO.state;
    this.add.rectangle(0, 0, W, H, 0x1a1c2c).setOrigin(0);
    const n = this.gunler.length;
    BO.text(this, W / 2, 10, n + ' GÜN GEÇTİ', { size: 16, color: P.y, ox: 0.5 });
    BO.text(this, W / 2, 32, 'EKİP KAMPANYAYI\nİDARE ETTİ', { color: P.L, ox: 0.5, align: 'center' });

    let y = 60;
    let topOy = 0, topPara = 0;
    const olaylar = [];
    this.gunler.forEach((g) => {
      topOy += g.oyD; topPara += g.para;
      BO.text(this, 10, y, 'GÜN ' + g.gun, { color: P.w });
      BO.text(this, 92, y, (g.oyD >= 0 ? '+' : '') + g.oyD.toFixed(1), { color: g.oyD >= 0 ? P.l : P.r, ox: 1 });
      BO.text(this, W - 10, y, '+' + BO.tl(g.para), { color: P.y, ox: 1 });
      y += 11;
      g.olaylar.forEach((o) => olaylar.push(o));
    });
    y += 4;
    if (olaylar.length) {
      BO.text(this, 10, y, 'RAKİPLER:', { color: P.o }); y += 12;
      olaylar.slice(0, 4).forEach((o) => {
        BO.text(this, 10, y, o.yazi, { color: P.L, wrap: W - 20 }); y += 11;
        BO.text(this, W - 10, y, o.etki, { color: P[o.renk], ox: 1 }); y += 12;
      });
    }
    y += 2;
    this.add.rectangle(10, y, W - 20, 1, 0x566c86).setOrigin(0); y += 6;
    BO.text(this, 10, y, 'OY ORANI', { color: P.L });
    BO.text(this, W - 10, y, '%' + S.oy.toFixed(1), { color: P.l, ox: 1 }); y += 12;
    BO.text(this, 10, y, 'KASA', { color: P.L });
    BO.text(this, W - 10, y, BO.tl(S.kasa), { color: P.y, ox: 1 }); y += 12;

    const oz = BO.ozelGun(S.gun);
    if (oz) {
      const ad = { anket: 'BUGÜN ANKET VAR!', munazara: 'BUGÜN MÜNAZARA!', secim: 'BUGÜN SEÇİM!' }[oz];
      const t = BO.text(this, W / 2, y + 4, ad, { color: P.r, ox: 0.5 });
      this.tweens.add({ targets: t, alpha: 0.3, duration: 400, yoyo: true, repeat: -1 });
      y += 14;
    }
    BO.button(this, W / 2, Math.max(y + 16, H - 22), 120, 18, 'DEVAM', { fill: 'y', shade: 'o', onClick: () => BO.fadeTo(this, 'Hub') });
    this.cameras.main.fadeIn(300, 26, 28, 44);
  }
};

// ================= Anket günü =================
BO.PollScene = class extends Phaser.Scene {
  constructor() { super('Poll'); }
  create() {
    const W = this.scale.width, H = this.scale.height, P = BO.PAL, S = BO.state;
    const C = (k) => Phaser.Display.Color.HexStringToColor(P[k] || k).color;
    BO.normalizeOy();
    this.add.rectangle(0, 0, W, H, 0x1a1c2c).setOrigin(0);
    this.add.rectangle(0, 0, W, 40, C('B')).setOrigin(0);
    BO.text(this, W / 2, 8, 'ANKET', { size: 16, color: P.y, ox: 0.5 });
    BO.text(this, W / 2, 27, 'SEÇİME ' + (BO.SON_GUN - S.gun) + ' GÜN KALDI', { color: P.w, ox: 0.5 });

    const once = S.sonAnket || {};
    const list = BO.partiListesi().concat([{ id: 'kararsiz', ad: 'KARARSIZ', renk: 'n', oy: S.kararsiz }]);
    const sirali = list.filter((p) => p.id !== 'kararsiz').sort((a, b) => b.oy - a.oy);
    let y = 54;
    const max = Math.max.apply(null, list.map((p) => p.oy));
    list.forEach((p, i) => {
      this.add.rectangle(8, y + 1, 6, 6, C(p.renk)).setOrigin(0);
      BO.text(this, 18, y, p.ad, { color: p.id === 'biz' ? P.y : P.w });
      const bar = this.add.rectangle(18, y + 12, 0, 7, C(p.renk)).setOrigin(0);
      this.tweens.add({ targets: bar, width: Math.max(2, Math.round(110 * p.oy / max)), duration: 900, delay: i * 150, ease: 'Quad.easeOut' });
      BO.text(this, W - 8, y, '%' + p.oy.toFixed(1), { color: P.w, ox: 1 });
      if (once[p.id] != null) {
        const d = p.oy - once[p.id];
        BO.text(this, W - 8, y + 11, (d >= 0 ? '+' : '') + d.toFixed(1), { color: d >= 0 ? P.l : P.r, ox: 1 });
      }
      y += 26;
    });
    const sira = sirali.findIndex((p) => p.id === 'biz') + 1;
    const yorum = sira === 1 ? 'ZİRVEDESİN!\nBIRAKMA!' : sira === 2 ? 'ZİRVEYE ÇOK\nYAKINSIN!' : 'DAHA ÇOK\nÇALIŞMALISIN!';
    BO.text(this, W / 2, y + 4, sira + '. SIRADASIN', { color: sira === 1 ? P.l : P.o, ox: 0.5 });
    BO.text(this, W / 2, y + 18, yorum, { color: P.L, ox: 0.5, align: 'center' });

    // bir sonraki anket için kaydet
    S.sonAnket = {};
    list.forEach((p) => { S.sonAnket[p.id] = p.oy; });
    BO.save();

    BO.button(this, W / 2, H - 22, 120, 18, 'DEVAM', { fill: 'y', shade: 'o', onClick: () => BO.fadeTo(this, 'Hub') });
    this.cameras.main.fadeIn(300, 26, 28, 44);
  }
};

// ================= TV münazarası =================
BO.DebateScene = class extends Phaser.Scene {
  constructor() { super('Debate'); }
  create() {
    const W = this.scale.width, H = this.scale.height, P = BO.PAL;
    const C = (k) => Phaser.Display.Color.HexStringToColor(P[k] || k).color;
    this.W = W; this.H = H; this.P = P;
    // en güçlü rakip karşına çıkar
    const lider = BO.RIVALS.slice().sort((a, b) => BO.rakip(b.id).oy - BO.rakip(a.id).oy)[0];
    this.rakip = lider;
    this.sorular = Phaser.Utils.Array.Shuffle(BO.MUNAZARA.slice()).slice(0, 4);
    this.i = 0; this.biz = 0; this.o = 0;

    // Stüdyo
    this.add.rectangle(0, 0, W, H, C('#141729')).setOrigin(0);
    this.add.rectangle(0, 0, W, 16, C('r')).setOrigin(0);
    BO.text(this, W / 2, 4, 'CANLI - MÜNAZARA', { color: P.w, ox: 0.5 });
    const g = this.add.graphics();
    g.fillStyle(0xffcd75, 0.08).fillTriangle(40, 16, 10, 120, 70, 120).fillTriangle(140, 16, 110, 120, 170, 120);
    this.add.rectangle(0, 120, W, 4, C('p')).setOrigin(0);
    // kürsüler
    const kursu = (x, renk) => {
      this.add.rectangle(x - 16, 92, 32, 28, C('k')).setOrigin(0);
      this.add.rectangle(x - 15, 93, 30, 26, C(renk)).setOrigin(0);
    };
    this.bizSp = this.add.sprite(40, 96, 'aday0').setOrigin(0.5, 1).setScale(2).play('el_salla');
    kursu(40, 'o');
    this.oSp = this.add.image(140, 96, 'rakip_' + lider.id).setOrigin(0.5, 1).setScale(2).setFlipX(true);
    kursu(140, lider.renk);
    BO.text(this, 40, 106, 'BİZ', { color: P.k, ox: 0.5 });
    BO.text(this, 140, 106, lider.kisa, { color: P.w, ox: 0.5 });
    BO.text(this, W / 2, 22, 'VS', { size: 16, color: P.y, ox: 0.5 });

    // Alkış metreleri
    BO.text(this, 6, 128, 'ALKIŞ', { color: P.L });
    this.add.rectangle(48, 129, 56, 6, C('N')).setOrigin(0);
    this.add.rectangle(116, 129, 56, 6, C('N')).setOrigin(0);
    this.bizBar = this.add.rectangle(48, 129, 0, 6, C('o')).setOrigin(0);
    this.oBar = this.add.rectangle(116, 129, 0, 6, C(lider.renk)).setOrigin(0);

    this.soruT = BO.text(this, W / 2, 144, '', { color: P.w, ox: 0.5, align: 'center' });
    this.balonBiz = BO.text(this, 40, 40, '', { color: P.y, ox: 0.5, align: 'center', stroke: 2, depth: 20 });
    this.balonO = BO.text(this, 140, 40, '', { color: P.w, ox: 0.5, align: 'center', stroke: 2, depth: 20 });
    this.btns = [];
    this.cameras.main.fadeIn(300, 26, 28, 44);
    this.time.delayedCall(400, () => this.ask());
  }

  ask() {
    const W = this.W, H = this.H, P = this.P, q = this.sorular[this.i];
    this.balonBiz.setText(''); this.balonO.setText('');
    this.soruT.setText('SORU ' + (this.i + 1) + '/4\n' + q.soru);
    const tipler = Phaser.Utils.Array.Shuffle(['ciddi', 'populist', 'saldirgan']);
    let y = 186;
    const room = H - y - 4;
    const step = Math.min(30, Math.floor(room / 3));
    tipler.forEach((t) => {
      const b = BO.button(this, W / 2, y + 11, 164, 22, q.cevap[t], {
        fill: 'w', shade: 'L', onClick: () => this.answer(t),
      });
      this.btns.push(b);
      y += step;
    });
  }

  answer(t) {
    const q = this.sorular[this.i], P = this.P;
    this.btns.forEach((b) => b.destroy()); this.btns = [];
    const puan = t === q.iyi ? 25 : (t === 'saldirgan' || q.iyi === 'saldirgan') ? -5 : 10;
    const rp = Phaser.Math.Between(5, 20);
    this.biz += puan; this.o += rp;
    this.balonBiz.setText(q.cevap[t]);
    const tepki = puan >= 25 ? 'ALKIŞ!!' : puan > 0 ? 'HMM...' : 'YUHH!';
    this.soruT.setText('SEYİRCİ:\n' + tepki).setColor(puan >= 25 ? P.l : puan > 0 ? P.y : P.r);
    if (puan >= 25) BO.sfx.happy(); else if (puan < 0) BO.sfx.splat();
    this.tweens.add({ targets: this.bizSp, y: this.bizSp.y - 3, duration: 80, yoyo: true, repeat: 2 });
    const bar = (v) => Math.max(0, Math.min(56, Math.round(56 * v / 100)));
    this.tweens.add({ targets: this.bizBar, width: bar(this.biz), duration: 400 });
    this.time.delayedCall(1300, () => {
      this.balonO.setText(Phaser.Utils.Array.GetRandom(BO.MUNAZARA_RAKIP));
      this.tweens.add({ targets: this.oBar, width: bar(this.o), duration: 400 });
    });
    this.time.delayedCall(2800, () => {
      this.soruT.setColor(P.w);
      this.i++;
      if (this.i < this.sorular.length) this.ask(); else this.finish();
    });
  }

  finish() {
    const W = this.W, H = this.H, P = this.P, S = BO.state;
    this.balonBiz.setText(''); this.balonO.setText('');
    const fark = this.biz - this.o;
    const oyD = BO.clamp(fark / 20, -1.5, 2.5);
    S.oy = Math.max(0, S.oy + oyD);
    S.itibar = BO.clamp(S.itibar + (fark > 0 ? 5 : -3), 0, 100);
    if (fark > 0) BO.rakibeDarbe(this.rakip.id, 6);
    BO.normalizeOy(); BO.save();
    const kazandi = fark > 0;
    if (kazandi) BO.sfx.win(); else BO.sfx.lose();
    this.soruT.setText(kazandi ? 'MÜNAZARAYI\nKAZANDIN!' : 'MÜNAZARAYI\nKAYBETTİN...').setColor(kazandi ? P.l : P.r);
    BO.text(this, W / 2, 182, 'OY ' + (oyD >= 0 ? '+' : '') + oyD.toFixed(1) + '   İTİBAR ' + (kazandi ? '+5' : '-3'), { color: P.y, ox: 0.5 });
    BO.button(this, W / 2, Math.max(214, H - 24), 120, 18, 'DEVAM', { fill: 'y', shade: 'o', onClick: () => BO.fadeTo(this, 'Hub') });
  }
};

// ================= Seçim günü =================
BO.ElectionScene = class extends Phaser.Scene {
  constructor() { super('Election'); }
  create() {
    const W = this.scale.width, H = this.scale.height, P = BO.PAL;
    const C = (k) => Phaser.Display.Color.HexStringToColor(P[k] || k).color;
    const sonuc = BO.secimSonucu();
    BO.clearSave();
    this.add.rectangle(0, 0, W, H, 0x1a1c2c).setOrigin(0);
    BO.text(this, W / 2, 10, 'SEÇİM GÜNÜ!', { size: 16, color: P.y, ox: 0.5 });
    const say = BO.text(this, W / 2, 32, 'OYLAR SAYILIYOR...', { color: P.L, ox: 0.5 });
    this.tweens.add({ targets: say, alpha: 0.3, duration: 300, yoyo: true, repeat: 8 });

    // sandık
    this.add.rectangle(W / 2 - 16, 46, 32, 24, C('w')).setOrigin(0).setStrokeStyle(1, C('k'));
    this.add.rectangle(W / 2 - 8, 46, 16, 2, C('k')).setOrigin(0);
    BO.text(this, W / 2, 58, 'OY', { color: P.k, ox: 0.5, oy: 0.5 });
    const zarf = this.add.rectangle(W / 2, 30, 8, 5, C('y'));
    this.tweens.add({ targets: zarf, y: 46, duration: 350, repeat: 8, onRepeat: () => BO.sfx.lane() });

    let y = 82;
    const max = sonuc[0].son;
    const yazi = [];
    sonuc.forEach((p, i) => {
      this.add.rectangle(8, y + 1, 6, 6, C(p.renk)).setOrigin(0);
      BO.text(this, 18, y, p.ad, { color: p.id === 'biz' ? P.y : P.w });
      const bar = this.add.rectangle(18, y + 12, 0, 8, C(p.renk)).setOrigin(0);
      const t = BO.text(this, W - 8, y, '%0.0', { color: P.w, ox: 1 });
      const counter = { v: 0 };
      this.tweens.add({
        targets: counter, v: p.son, duration: 3200, ease: 'Cubic.easeOut',
        onUpdate: () => { t.setText('%' + counter.v.toFixed(1)); bar.width = Math.round(130 * counter.v / max); },
      });
      yazi.push(t);
      y += 26;
    });

    const kazanan = sonuc[0];
    this.time.delayedCall(3500, () => {
      const biz = kazanan.id === 'biz';
      if (biz) { BO.sfx.win(); this.konfeti(); } else BO.sfx.lose();
      const bas = BO.text(this, W / 2, y + 10, biz ? 'KAZANDIN!' : 'KAYBETTİN', { size: 16, color: biz ? P.l : P.r, ox: 0.5, stroke: 4 });
      bas.setScale(0.3);
      this.tweens.add({ targets: bas, scale: 1, duration: 300, ease: 'Back.easeOut' });
      BO.text(this, W / 2, y + 32, biz ? 'BAŞKAN SENSİN!' : kazanan.ad + ' KAZANDI.\nBİR DAHAKİNE!', { color: P.w, ox: 0.5, align: 'center' });
      BO.button(this, W / 2, Math.max(y + 70, H - 22), 140, 18, 'YENİDEN OYNA', {
        fill: 'y', shade: 'o',
        onClick: () => { BO.state = BO.newGameState(); BO.fadeTo(this, 'Title'); },
      });
    });
    this.cameras.main.fadeIn(400, 26, 28, 44);
  }

  konfeti() {
    const W = this.scale.width, H = this.scale.height;
    const renk = [0xef7d57, 0xffcd75, 0xa7f070, 0x41a6f6, 0xf4f4f4, 0xb13e53];
    for (let i = 0; i < 60; i++) {
      const p = this.add.rectangle(Phaser.Math.Between(0, W), -10 - Phaser.Math.Between(0, 120), 2, 3, Phaser.Utils.Array.GetRandom(renk)).setDepth(50);
      this.tweens.add({ targets: p, y: H + 10, x: p.x + Phaser.Math.Between(-30, 30), angle: 360, duration: Phaser.Math.Between(1800, 3200), repeat: -1, delay: Phaser.Math.Between(0, 1500) });
    }
  }
};

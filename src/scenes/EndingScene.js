// FARKLI SONLAR: seçim sonucuna, farka ve itibara göre 7 son. Her biri kısa bir sinematik.
window.BO = window.BO || {};

BO.SONLAR = {
  halkin: { baslik: 'HALKIN BAŞKANI', kazandi: true },
  heyelan: { baslik: 'EFSANE BAŞKAN', kazandi: true },
  kilpayi: { baslik: 'KIL PAYI BAŞKAN', kazandi: true },
  zafer: { baslik: 'BAŞKAN', kazandi: true },
  yardimci: { baslik: 'BAŞKAN YARDIMCISI', kazandi: false },
  kayip: { baslik: 'SİMİTÇİ', kazandi: false },
  skandal: { baslik: 'KAÇAK ADAY', kazandi: false },
};
BO.SON_SIRA = ['halkin', 'heyelan', 'kilpayi', 'zafer', 'yardimci', 'kayip', 'skandal'];

// Hangi son? sonuc: BO.secimSonucu() çıktısı (büyükten küçüğe sıralı)
BO.sonBelirle = function (sonuc) {
  const S = BO.state;
  const sira = sonuc.findIndex((p) => p.id === 'biz') + 1;
  const biz = sonuc[sira - 1];
  if (sira === 1) {
    const fark = biz.son - sonuc[1].son;
    if (S.itibar >= 85) return 'halkin';
    if (fark >= 10 || biz.son >= 40) return 'heyelan';
    if (fark < 2) return 'kilpayi';
    return 'zafer';
  }
  if (S.itibar < 20) return 'skandal';
  if (sira === 2 && sonuc[0].son - biz.son < 3) return 'yardimci';
  return 'kayip';
};

// Açılan sonlar cihazda saklanır
BO.acilanSonlar = function () {
  try { return JSON.parse(localStorage.getItem('bo_sonlar') || '[]'); } catch (e) { return []; }
};
BO.sonuKaydet = function (id) {
  const l = BO.acilanSonlar();
  if (!l.includes(id)) l.push(id);
  try { localStorage.setItem('bo_sonlar', JSON.stringify(l)); } catch (e) {}
  return l;
};

BO.EndingScene = class extends Phaser.Scene {
  constructor() { super('Ending'); }

  init(d) { this.sonId = d.id; this.sonuc = d.sonuc; }

  create() {
    const W = BO.W, H = BO.H, P = BO.PAL;
    this.W = W; this.H = H;
    const C = (k) => Phaser.Display.Color.HexStringToColor(P[k] || k).color;
    this.C = C;
    this.ad = BO.kisaAd();
    const birinci = this.sonuc[0], ikinci = this.sonuc[1];
    const rakipKazanan = birinci.id === 'biz' ? null : BO.rakipBilgi(birinci.id);
    const ikinciAd = ikinci.id === 'biz' ? this.ad : ikinci.ad;
    const fark = Math.abs(birinci.son - ikinci.son).toFixed(1);
    const rakipSoz = {
      vedat: 'VEDAT İLK İŞ OLARAK METROYU YİNE ERTELEDİ.',
      selin: 'SELİN BELEDİYE BİNASINA DEV BİR FİLTRE TAKTIRDI.',
      ulvi: 'ULVİ YEMİN TÖRENİNE ÜÇ GÜN GEÇ GELDİ.',
    };
    const A = this.ad;
    const senaryo = {
      halkin: [
        ['balkon', 'SANDIKLAR AÇILDI. ŞEHİR TEK AĞIZDAN BAĞIRDI: ' + A + '!'],
        ['balkon2', 'HİÇ SKANDALA KARIŞMADIN (YA DA KİMSE ÖĞRENMEDİ).'],
        ['cay', 'İLK İCRAAT: HER MAHALLEYE ÇAY OCAĞI. HALK MUTLU, ÇAYCILAR ZENGİN.'],
      ],
      heyelan: [
        ['balkon', A + ' RAKİPLERİNİ SİLİP SÜPÜRDÜ!'],
        ['rakipler', 'RAKİPLER TEBRİK İÇİN ARADI AMA HAT MEŞGULDÜ.'],
        ['cay', 'İLK İCRAAT: BEDAVA SİMİT VE ÇAY. DİYETİSYENLER ENDİŞELİ.'],
      ],
      kilpayi: [
        ['sayim', 'OYLAR O KADAR YAKINDI Kİ ÜÇ KEZ SAYILDI.'],
        ['sayim2', 'SONUNDA KOLTUĞUN ALTINDAN BİR ZARF ÇIKTI...'],
        ['balkon', A + ' ' + fark + ' PUAN FARKLA KAZANDI! ' + ikinciAd + ' HÂLÂ İTİRAZ EDİYOR.'],
      ],
      zafer: [
        ['balkon', A + ' BAŞKAN SEÇİLDİ!'],
        ['rakip2', ikinciAd + " 'BİR DAHAKİNE' DEDİ VE EVİNE GİTTİ."],
        ['cay', 'BELEDİYENİN İLK TOPLANTISI ÇAY MOLASIYLA BAŞLADI.'],
      ],
      yardimci: [
        ['rakipKazandi', rakipKazanan ? rakipKazanan.kisa + ' KAZANDI. AMA FARK ÇOK AZDI...' : ''],
        ['yardimci', rakipKazanan ? rakipKazanan.kisa + ', ' + A + "'İ BAŞKAN YARDIMCISI YAPTI." : ''],
        ['cay', 'YENİ GÖREVİN: BELEDİYE ÇAY OCAĞI SORUMLUSU.'],
      ],
      kayip: [
        ['rakipKazandi', rakipKazanan ? rakipKazanan.kisa + ' KAZANDI. ' + rakipSoz[rakipKazanan.id] : ''],
        ['simit', A + ' SİYASETİ BIRAKIP SİMİT TEZGÂHI AÇTI.'],
        ['simit2', 'İŞLER İYİ GİDİYOR. BELKİ BİR DAHAKİ SEÇİMDE...'],
      ],
      skandal: [
        ['gazete', 'SKANDALLAR PEŞİNİ BIRAKMADI. KİMSE OY VERMEDİ.'],
        ['kacis', A + " 'KISA BİR TATİLE' ÇIKTI."],
        ['kacis2', 'TAKMA BIYIĞINI DA YANINA ALDI.'],
      ],
    }[this.sonId];
    this.slaytlar = senaryo;
    this.i = -1;

    this.add.rectangle(0, 0, W, H, 0x000000).setOrigin(0);
    const by = H - BO.ALT - 96;
    this.kutuY = by;
    this.kutu = this.add.rectangle(6, by, W - 12, 84, C('k'), 0.94).setOrigin(0).setStrokeStyle(1, C('n')).setDepth(100);
    this.yazi = BO.text(this, 12, by + 6, '', { color: P.w, wrap: W - 24, depth: 101 });
    this.devamT = BO.text(this, W - 12, by + 72, 'DOKUN ›', { color: P.n, ox: 1, depth: 101 });
    this.tweens.add({ targets: this.devamT, alpha: 0.2, duration: 500, yoyo: true, repeat: -1 });
    this.input.on('pointerdown', (p, over) => {
      if (over && over.length) return;
      if (this.finalde) return;
      if (this.yaziyor) this.yaziTamamla(); else this.sonraki();
    });
    if (BO.SONLAR[this.sonId].kazandi) BO.sfx.win(); else BO.sfx.lose();
    this.sonraki();
  }

  sonraki() {
    this.i++;
    if (this.i >= this.slaytlar.length) { this.final(); return; }
    const [tur, metin] = this.slaytlar[this.i];
    if (this.sahne) { const e = this.sahne; this.tweens.add({ targets: e, alpha: 0, duration: 200, onComplete: () => e.destroy() }); }
    this.sahne = this.add.container(0, 0).setAlpha(0);
    this.tweens.add({ targets: this.sahne, alpha: 1, duration: 300 });
    this.ciz(tur, this.sahne);
    this.yazdir(metin);
  }

  yazdir(metin) {
    this.hedef = metin; this.harf = 0; this.yaziyor = true;
    if (this.olay) this.olay.remove();
    this.olay = this.time.addEvent({
      delay: 28, loop: true, callback: () => {
        this.harf++;
        this.yazi.setText(metin.slice(0, this.harf));
        if (this.harf % 3 === 0) BO.sfx.lane();
        if (this.harf >= metin.length) this.yaziTamamla();
      },
    });
  }

  yaziTamamla() { if (this.olay) this.olay.remove(); this.yazi.setText(this.hedef); this.yaziyor = false; }

  // ---------- Final kartı ----------
  final() {
    this.finalde = true;
    const W = this.W, H = this.H, P = BO.PAL, S = BO.state;
    const son = BO.SONLAR[this.sonId];
    const acilan = BO.sonuKaydet(this.sonId);
    BO.clearSave();
    if (this.sahne) this.sahne.destroy();
    this.yazi.destroy(); this.devamT.destroy(); this.kutu.destroy();
    this.add.rectangle(0, 0, W, H, son.kazandi ? 0x29366f : 0x1a1c2c).setOrigin(0);
    if (son.kazandi) this.konfeti();
    BO.text(this, W / 2, 26, 'SON', { color: P.L, ox: 0.5, oy: 0.5 });
    const t = BO.text(this, W / 2, 46, son.baslik, { size: 16, color: son.kazandi ? P.y : P.r, ox: 0.5, oy: 0.5, stroke: 3 });
    t.setScale(0.3);
    this.tweens.add({ targets: t, scale: 1, duration: 400, ease: 'Back.easeOut' });
    this.add.sprite(W / 2, 112, 'aday0').setOrigin(0.5, 1).setScale(3).play('el_salla');
    let y = 124;
    const satir = (a, b, c) => { BO.text(this, 16, y, a, { color: P.L }); BO.text(this, W - 16, y, b, { color: c || P.w, ox: 1 }); y += 14; };
    const biz = this.sonuc.find((p) => p.id === 'biz');
    satir('ADAY', S.adayAd);
    satir('SEÇİM SONUCU', '%' + biz.son.toFixed(1), son.kazandi ? P.l : P.r);
    satir('SIRA', (this.sonuc.indexOf(biz) + 1) + '.');
    satir('İTİBAR', Math.round(S.itibar) + '/100');
    satir('ZORLUK', BO.zor().ad);
    y += 4;
    BO.text(this, W / 2, y, 'AÇILAN SONLAR: ' + acilan.length + '/' + BO.SON_SIRA.length, { color: P.y, ox: 0.5 });
    y += 16;
    // açılan son simgeleri
    BO.SON_SIRA.forEach((id, k) => {
      const ac = acilan.includes(id);
      this.add.rectangle(W / 2 - 42 + k * 14, y + 4, 10, 10, ac ? (BO.SONLAR[id].kazandi ? 0xffcd75 : 0xb13e53) : 0x333c57).setStrokeStyle(1, 0x1a1c2c);
    });
    BO.button(this, W / 2, H - BO.ALT - 26, 140, 20, 'YENİDEN OYNA', {
      fill: 'y', onClick: () => { BO.state = BO.newGameState(); BO.fadeTo(this, 'Title'); },
    });
  }

  konfeti() {
    const W = this.W, H = this.H;
    const renk = [0xef7d57, 0xffcd75, 0xa7f070, 0x41a6f6, 0xf4f4f4, 0xb13e53];
    for (let i = 0; i < 50; i++) {
      const p = this.add.rectangle(Phaser.Math.Between(0, W), -10 - Phaser.Math.Between(0, 120), 2, 3, Phaser.Utils.Array.GetRandom(renk)).setDepth(50);
      this.tweens.add({ targets: p, y: H + 10, x: p.x + Phaser.Math.Between(-30, 30), angle: 360, duration: Phaser.Math.Between(1800, 3200), repeat: -1, delay: Phaser.Math.Between(0, 1500) });
    }
  }

  // ---------- Çizimler ----------
  ciz(tur, c) {
    const W = this.W, alan = this.kutuY - 10, C = this.C, P = BO.PAL;
    const bg = (renk) => c.add(this.add.rectangle(0, 0, W, alan, C(renk)).setOrigin(0));
    const aday = (x, y, s, tint) => { const a = this.add.sprite(x, y, 'aday0').setOrigin(0.5, 1).setScale(s).play('el_salla'); if (tint) a.setTint(tint); c.add(a); return a; };
    const kalabalik = (yy) => {
      for (let x = 6; x < W; x += 12) for (let r = 0; r < 2; r++) {
        const s = this.add.image(x + (r ? 6 : 0), yy + r * 10, 'secmen_mutlu');
        c.add(s);
        this.tweens.add({ targets: s, y: s.y - 3, duration: 200 + Math.random() * 200, yoyo: true, repeat: -1 });
      }
    };
    switch (tur) {
      case 'balkon': case 'balkon2': {
        bg('#29366f');
        c.add(this.add.rectangle(30, 18, W - 60, alan - 58, C('#3b4a70')).setOrigin(0));
        c.add(this.add.rectangle(30, 4, W - 60, 14, C('o')).setOrigin(0));
        c.add(BO.text(this, W / 2, 11, 'BELEDİYE', { color: P.k, ox: 0.5, oy: 0.5 }));
        aday(W / 2, 74, 3);
        c.add(this.add.rectangle(40, 72, W - 80, 10, C('w')).setOrigin(0));               // balkon
        kalabalik(alan - 30);
        for (let k = 0; k < 20; k++) {
          const p = this.add.rectangle(Phaser.Math.Between(0, W), -5, 2, 3, [0xffcd75, 0xef7d57, 0xa7f070, 0x41a6f6][k % 4]);
          c.add(p);
          this.tweens.add({ targets: p, y: alan, angle: 360, duration: Phaser.Math.Between(1500, 2600), repeat: -1, delay: k * 80 });
        }
        break;
      }
      case 'cay': {
        bg('#5d275d');
        c.add(this.add.rectangle(20, alan - 50, W - 40, 12, C('m')).setOrigin(0));
        aday(W / 2, alan - 50, 3);
        for (let k = 0; k < 5; k++) {
          const b = this.add.image(36 + k * 27, alan - 56, k % 2 ? 'cay' : 'simit').setScale(2);
          c.add(b);
          this.tweens.add({ targets: b, y: b.y - 4, duration: 300, delay: k * 100, yoyo: true, repeat: -1 });
        }
        kalabalik(alan - 26);
        break;
      }
      case 'rakipler': case 'rakip2': case 'rakipKazandi': {
        const kazanan = this.sonuc[0].id === 'biz' ? null : BO.rakipBilgi(this.sonuc[0].id);
        bg(kazanan ? kazanan.renk : '#1a1c2c');
        if (tur === 'rakipKazandi' && kazanan) {
          c.add(this.add.image(W / 2, alan - 20, 'rakip_' + kazanan.id).setScale(5).setOrigin(0.5, 1));
          c.add(BO.text(this, W / 2, 24, 'KAZANAN: ' + kazanan.kisa, { size: 16, color: P.y, ox: 0.5, stroke: 3 }));
        } else {
          BO.RIVALS.forEach((r, k) => {
            const sp = this.add.image(36 + k * 54, alan - 24, 'rakip_' + r.id).setScale(3).setOrigin(0.5, 1).setTint(0xaaaaaa);
            c.add(sp);
            this.tweens.add({ targets: sp, angle: { from: -4, to: 4 }, duration: 600, yoyo: true, repeat: -1 });
          });
          c.add(BO.text(this, W / 2, 30, 'ÜZGÜN RAKİPLER', { color: P.w, ox: 0.5 }));
        }
        break;
      }
      case 'sayim': case 'sayim2': {
        bg('#3b4a70');
        c.add(this.add.rectangle(W / 2 - 30, alan - 70, 60, 50, 0xf4f4f4).setOrigin(0).setStrokeStyle(2, 0x1a1c2c));
        c.add(BO.text(this, W / 2, alan - 50, 'SANDIK', { color: P.k, ox: 0.5 }));
        for (let k = 0; k < 8; k++) {
          const z = this.add.rectangle(W / 2, alan - 70, 10, 6, 0xffcd75).setStrokeStyle(1, 0x1a1c2c);
          c.add(z);
          this.tweens.add({ targets: z, x: Phaser.Math.Between(10, W - 10), y: Phaser.Math.Between(20, alan - 80), angle: 360, duration: 900, delay: k * 150, yoyo: true, repeat: -1 });
        }
        if (tur === 'sayim2') {
          const z = this.add.rectangle(W / 2, 40, 16, 10, 0xffcd75).setStrokeStyle(1, 0x1a1c2c);
          c.add(z);
          c.add(BO.text(this, W / 2, 24, '!!!', { size: 16, color: P.r, ox: 0.5 }));
          this.tweens.add({ targets: z, scale: 1.4, duration: 300, yoyo: true, repeat: -1 });
        }
        break;
      }
      case 'yardimci': {
        const kazanan = BO.rakipBilgi(this.sonuc[0].id);
        bg('#2f3f73');
        c.add(this.add.rectangle(20, alan - 40, W - 40, 14, C('m')).setOrigin(0));
        c.add(this.add.image(W / 2 - 30, alan - 40, 'rakip_' + kazanan.id).setScale(3).setOrigin(0.5, 1));
        aday(W / 2 + 30, alan - 40, 3);
        c.add(this.add.image(W / 2 + 50, alan - 46, 'cay').setScale(2));
        c.add(BO.text(this, W / 2 - 30, 24, 'BAŞKAN', { color: P.y, ox: 0.5 }));
        c.add(BO.text(this, W / 2 + 30, 24, 'YARDIMCI', { color: P.L, ox: 0.5 }));
        break;
      }
      case 'simit': case 'simit2': {
        bg('#566c86');
        c.add(this.add.rectangle(W / 2 - 40, alan - 40, 80, 20, C('E')).setOrigin(0).setStrokeStyle(1, C('k')));
        for (let s = 0; s < 10; s++) c.add(this.add.rectangle(W / 2 - 40 + s * 8, alan - 80, 8, 10, C(s % 2 ? 'w' : 'r')).setOrigin(0));
        aday(W / 2, alan - 40, 3);
        for (let k = 0; k < 5; k++) c.add(this.add.image(W / 2 - 30 + k * 15, alan - 34, 'simit').setScale(2));
        if (tur === 'simit2') {
          for (let k = 0; k < 4; k++) {
            const m = this.add.sprite(20 + k * 14, alan - 8, 'secmen0').play('yuru');
            c.add(m);
          }
          c.add(BO.text(this, W / 2, 24, 'SİMİT 5 TL', { size: 16, color: P.y, ox: 0.5, stroke: 3 }));
        }
        break;
      }
      case 'gazete': {
        bg('#1a1c2c');
        c.add(this.add.rectangle(20, 20, W - 40, alan - 40, 0xf4f4f4).setOrigin(0).setAngle(-3));
        c.add(BO.text(this, W / 2, 40, 'SKANDAL!', { size: 24, color: P.r, ox: 0.5 }));
        c.add(BO.text(this, W / 2, 80, 'TAKMA BIYIK\nDIŞ GÜÇ FONU\nGECE OPERASYONLARI', { color: P.k, ox: 0.5, align: 'center' }));
        break;
      }
      case 'kacis': case 'kacis2': {
        bg('#41a6f6');
        c.add(this.add.rectangle(0, alan - 30, W, 30, C('L')).setOrigin(0));
        const a = aday(W / 2, alan - 30, 3);
        c.add(this.add.rectangle(W / 2 + 18, alan - 52, 14, 18, C('m')).setOrigin(0).setStrokeStyle(1, C('k')));   // valiz
        if (tur === 'kacis2') {
          a.setTexture('kilik0'); a.anims.stop();
          const u = this.add.rectangle(-30, 30, 40, 8, 0xf4f4f4); c.add(u);
          this.tweens.add({ targets: u, x: W + 40, duration: 2400, repeat: -1 });
        }
        break;
      }
      default: bg('#1a1c2c');
    }
  }
};

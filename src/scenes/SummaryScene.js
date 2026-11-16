// Gün sonu özeti: sabah gazetesi tadında bir manşet + istatistikler.
window.BO = window.BO || {};

BO.SummaryScene = class extends Phaser.Scene {
  constructor() { super('Summary'); }

  init(stats) { this.st = stats; }

  create() {
    BO.normalizeOy();
    const W = BO.W, H = BO.H, P = BO.PAL, S = BO.state, st = this.st;
    this.add.rectangle(0, 0, W, H, 0x1a1c2c).setOrigin(0);

    // Gazete kâğıdı
    const top = 10;
    this.add.rectangle(8, top, W - 16, 64, 0xf4f4f4).setOrigin(0);
    this.add.rectangle(8, top + 64, W - 16, 2, 0x94b0c2).setOrigin(0);
    BO.text(this, W / 2, top + 3, 'AKŞAM POSTASI', { color: P.k, ox: 0.5 });
    this.add.rectangle(14, top + 18, W - 28, 1, 0x1a1c2c).setOrigin(0);
    BO.text(this, W / 2, top + 22, this.headline(), { color: P.r, ox: 0.5, align: 'center', wrap: W - 28, lineSpacing: 3 });

    // İstatistikler
    let y = top + 74;
    const row = (label, val, color) => {
      BO.text(this, 12, y, label, { color: P.L });
      BO.text(this, W - 12, y, String(val), { color: color || P.w, ox: 1 });
      y += 12;
    };
    BO.text(this, W / 2, y, 'GÜN ' + st.gun + ' RAPORU', { color: P.y, ox: 0.5 }); y += 14;
    if (st.tur === 'pazar') {
      row('DOĞRU ÜRÜN', st.dogru, P.l);
      row('YANLIŞ ÜRÜN', st.yanlis, P.r);
      row('SIKILAN', st.kacan, P.r);
      row('EN İYİ SERİ', 'x' + st.seri, P.y);
      row('BAĞIŞ', '+' + BO.tl(st.bagis), P.y);
    } else if (st.tur === 'miting') {
      row('ORT. COŞKU', '%' + st.ortCosku, st.ortCosku > 60 ? P.l : P.o);
      row('MÜKEMMEL', st.mukemmel, P.l);
      row('İYİ', st.iyi, P.y);
      row('KAÇAN', st.kacan, P.r);
      row('SUSTURULAN', st.susturulan, P.l);
      row('YUHALAMA', st.yuh, P.r);
      row('BAĞIŞ', '+' + BO.tl(st.bagis), P.y);
    } else {
      row('DAĞITILAN', st.dagitilan);
      row('MEMNUN', st.memnun, P.l);
      row('DOMATES', st.domates, P.r);
      row('KOVALAMA', st.kovalama);
      row('KAÇIŞ', st.kacis + '/' + st.kovalama, P.l);
      row('ÇARPMA', st.kaza, P.o);
      row('RAKİP KAPTI', st.rakipKapti || 0, P.r);
      row('BAĞIŞ', '+' + BO.tl(st.bagis), P.y);
    }
    y += 4;
    this.add.rectangle(12, y, W - 24, 1, 0x566c86).setOrigin(0); y += 6;
    const dOy = S.oy - st.oyBas;
    row('OY ORANI', '%' + S.oy.toFixed(1) + (dOy >= 0 ? ' +' : ' ') + dOy.toFixed(1), dOy >= 0 ? P.l : P.r);
    row('İTİBAR', Math.round(S.itibar) + '/100', S.itibar >= st.itibarBas ? P.l : P.r);
    row('KASA', BO.tl(S.kasa), P.y);

    const by = Math.max(y + 18, H - BO.ALT - 30);
    const devam = BO.button(this, W / 2, by, 140, 20, 'DEVAM', {
      fill: 'y', shade: 'o',
      onClick: () => { S.faz = 'aksam'; this.go('Hub'); },
    });
    BO.pulse(this, devam);

    this.cameras.main.fadeIn(400, 26, 28, 44);
  }

  go(scene) {
    this.cameras.main.fadeOut(250, 26, 28, 44);
    this.time.delayedCall(260, () => this.scene.start(scene));
  }

  headline() {
    const st = this.st;
    const pick = (a) => Phaser.Utils.Array.GetRandom(a);
    const ad = BO.kisaAd();
    if (st.tur === 'pazar') {
      if (st.dogru >= 15) return pick(['PAZARIN YILDIZI ' + ad + '!', 'TEZGÂHTA KUYRUK OLUŞTU!']);
      if (st.yanlis + st.kacan > st.dogru) return pick(['ÇAY İSTEDİ, MAKARNA ALDI!', 'PAZARDA KARIŞIKLIK!']);
      return pick(['ADAY PAZARA İNDİ!', ad + ' TEZGÂH AÇTI!']);
    }
    if (st.tur === 'miting') {
      if (st.ortCosku >= 65) return pick(['MEYDANLAR DOLDU TAŞTI!', ad + ' MEYDANI SALLADI!']);
      if (st.ortCosku >= 40) return pick(['MİTİNGE YOĞUN İLGİ!', ad + ' SLOGANLARI DİLLERDE!']);
      return pick(['MİTİNGDE ESNEYENLER ÇOĞUNLUKTA!', ad + ' MİKROFONU YUTTU!']);
    }
    if (st.yakalanma >= 2) return pick(['ADAYIN OTOBÜSÜ YİNE YAKALANDI!', 'SEÇMENLER OTOBÜSÜ SIKIŞTIRDI!']);
    if (st.domates >= 4) return pick(['ADAY DOMATES YAĞMURUNA TUTULDU!', 'MANAVLAR BU KAMPANYAYA BAYILDI!']);
    if (st.kaza >= 4) return 'TRAFİK POLİSİ ADAYI ARIYOR!';
    if (st.kacis >= 2) return pick(['OTOBÜS FORMULA 1\'E HAZIR!', 'ADAY MAKAS ATMANIN USTASI!']);
    if ((st.rakibeDomates || 0) >= 1) return pick(['RAKİP OTOBÜSÜNE DOMATES YAĞDI!', 'OTOBÜS SAVAŞLARI BAŞLADI!']);
    if ((st.rakipKapti || 0) >= 4) return pick(['RAKİP OTOBÜSÜ SEÇMENLERİ KAPTI!', ad + ' GERİDE KALDI!']);
    if (st.memnun >= 15) return pick(['SİMİTLER BİTTİ, OYLAR ARTTI!', 'MAHALLE ADAYI SEVDİ!']);
    if (st.dagitilan < 5) return 'ADAY BUGÜN PEK GÖRÜNMEDİ...';
    return pick(['KAMPANYA OTOBÜSÜ ŞEHRİ SALLADI!', 'ADAY ÇAY DAĞITTI, GÜNDEM OLDU!']);
  }
};

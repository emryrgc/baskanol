// Gün sonu özeti: sabah gazetesi tadında bir manşet + istatistikler.
window.BO = window.BO || {};

BO.SummaryScene = class extends Phaser.Scene {
  constructor() { super('Summary'); }

  init(stats) { this.st = stats; }

  create() {
    BO.normalizeOy();
    const W = this.scale.width, H = this.scale.height, P = BO.PAL, S = BO.state, st = this.st;
    this.add.rectangle(0, 0, W, H, 0x1a1c2c).setOrigin(0);

    // Gazete kâğıdı
    const top = 10;
    this.add.rectangle(8, top, W - 16, 64, 0xf4f4f4).setOrigin(0);
    this.add.rectangle(8, top + 64, W - 16, 2, 0x94b0c2).setOrigin(0);
    BO.text(this, W / 2, top + 6, 'AKŞAM POSTASI', { color: P.k, ox: 0.5 });
    this.add.rectangle(14, top + 17, W - 28, 1, 0x1a1c2c).setOrigin(0);
    BO.text(this, W / 2, top + 22, this.headline(), { color: P.r, ox: 0.5, align: 'center', wrap: W - 28, lineSpacing: 3 });

    // İstatistikler
    let y = top + 74;
    const row = (label, val, color) => {
      BO.text(this, 12, y, label, { color: P.L });
      BO.text(this, W - 12, y, String(val), { color: color || P.w, ox: 1 });
      y += 12;
    };
    BO.text(this, W / 2, y, 'GÜN ' + st.gun + ' RAPORU', { color: P.y, ox: 0.5 }); y += 14;
    row('DAĞITILAN', st.dagitilan);
    row('MEMNUN', st.memnun, P.l);
    row('DOMATES', st.domates, P.r);
    row('KOVALAMA', st.kovalama);
    row('KAÇIŞ', st.kacis + '/' + st.kovalama, P.l);
    row('ÇARPMA', st.kaza, P.o);
    row('BAĞIŞ', '+' + BO.tl(st.bagis), P.y);
    y += 4;
    this.add.rectangle(12, y, W - 24, 1, 0x566c86).setOrigin(0); y += 6;
    const dOy = S.oy - st.oyBas;
    row('OY ORANI', '%' + S.oy.toFixed(1) + (dOy >= 0 ? ' +' : ' ') + dOy.toFixed(1), dOy >= 0 ? P.l : P.r);
    row('İTİBAR', Math.round(S.itibar) + '/100', S.itibar >= st.itibarBas ? P.l : P.r);
    row('KASA', BO.tl(S.kasa), P.y);

    const by = Math.max(y + 18, H - 30);
    const devam = BO.button(this, W / 2, by, 140, 20, 'DEVAM', {
      fill: 'y', shade: 'o',
      onClick: () => { S.faz = 'aksam'; this.go('Hub'); },
    });
    this.tweens.add({ targets: devam, scale: 1.05, duration: 500, yoyo: true, repeat: -1 });

    this.cameras.main.fadeIn(400, 26, 28, 44);
  }

  go(scene) {
    this.cameras.main.fadeOut(250, 26, 28, 44);
    this.time.delayedCall(260, () => this.scene.start(scene));
  }

  headline() {
    const st = this.st;
    const pick = (a) => Phaser.Utils.Array.GetRandom(a);
    if (st.yakalanma >= 2) return pick(['ADAYIN OTOBÜSÜ YİNE YAKALANDI!', 'SEÇMENLER OTOBÜSÜ SIKIŞTIRDI!']);
    if (st.domates >= 4) return pick(['ADAY DOMATES YAĞMURUNA TUTULDU!', 'MANAVLAR BU KAMPANYAYA BAYILDI!']);
    if (st.kaza >= 4) return 'TRAFİK POLİSİ ADAYI ARIYOR!';
    if (st.kacis >= 2) return pick(['OTOBÜS FORMULA 1\'E HAZIR!', 'ADAY MAKAS ATMANIN USTASI!']);
    if (st.memnun >= 15) return pick(['SİMİTLER BİTTİ, OYLAR ARTTI!', 'MAHALLE ADAYI SEVDİ!']);
    if (st.dagitilan < 5) return 'ADAY BUGÜN PEK GÖRÜNMEDİ...';
    return pick(['KAMPANYA OTOBÜSÜ ŞEHRİ SALLADI!', 'ADAY ÇAY DAĞITTI, GÜNDEM OLDU!']);
  }
};

// SABAH GAZETESİ: Gecenin sonuçları manşet olur, etkileri uygulanır.
window.BO = window.BO || {};

BO.MorningScene = class extends Phaser.Scene {
  constructor() { super('Morning'); }

  init(data) { this.log = (data && data.log) || []; }

  create() {
    const W = this.scale.width, H = this.scale.height, P = BO.PAL, S = BO.state, N = BO.NIGHT;
    const pick = (a) => Phaser.Utils.Array.GetRandom(a);
    const lines = [];

    // Etkileri uygula (video etkisi gece uygulandı)
    let manset = null;
    this.log.forEach((e) => {
      if (e.tip === 'gazete') {
        BO.rakibeDarbe(e.id, N.gazeteEtki);
        lines.push([BO.rakipBilgi(e.id).kisa + ' İTİBAR', '-' + N.gazeteEtki, P.l]);
      } else if (e.tip === 'video') {
        lines.push(['VİDEO İZLENME', e.izlenme + ' MN', P.y]);
        lines.push([BO.rakipBilgi(e.id).kisa + ' İTİBAR', '-' + e.kayip, P.l]);
      } else if (e.tip === 'skandal') {
        S.itibar = BO.clamp(S.itibar + N.skandalItibar, 0, 100);
        S.oy = Math.max(0, S.oy + N.skandalOy);
        lines.push(['BİZİM İTİBAR', String(N.skandalItibar), P.r]);
        lines.push(['BİZİM OY', '-%' + Math.abs(N.skandalOy).toFixed(1), P.r]);
      }
    });
    BO.normalizeOy();

    // Manşet önceliği: skandal > video > gazete > sakin
    const has = (t) => this.log.find((e) => e.tip === t);
    if (has('skandal')) manset = pick(BO.MANSET.skandal);
    else if (has('video')) manset = pick(BO.MANSET.video).replace('{AD}', BO.rakipBilgi(has('video').id).kisa);
    else if (has('gazete')) manset = pick(BO.MANSET.gazete[has('gazete').id]);
    else manset = pick(BO.MANSET.sakin);

    // Çizim
    this.add.rectangle(0, 0, W, H, 0x1a1c2c).setOrigin(0);
    const top = 10;
    this.add.rectangle(8, top, W - 16, 92, 0xf4f4f4).setOrigin(0);
    this.add.rectangle(8, top + 92, W - 16, 2, 0x94b0c2).setOrigin(0);
    BO.text(this, W / 2, top + 6, 'SABAH GAZETESİ', { color: P.k, ox: 0.5 });
    this.add.rectangle(14, top + 17, W - 28, 1, 0x1a1c2c).setOrigin(0);
    BO.text(this, W / 2, top + 24, manset, { color: P.r, ox: 0.5, align: 'center', lineSpacing: 4 });

    let y = top + 106;
    BO.text(this, W / 2, y, 'GECENİN SONUCU', { color: P.y, ox: 0.5 }); y += 16;
    if (!lines.length) { BO.text(this, W / 2, y, 'HİÇBİR ŞEY OLMADI', { color: P.L, ox: 0.5 }); y += 12; }
    lines.forEach(([a, b, c]) => {
      BO.text(this, 12, y, a, { color: P.L });
      BO.text(this, W - 12, y, b, { color: c, ox: 1 });
      y += 12;
    });
    y += 4;
    this.add.rectangle(12, y, W - 24, 1, 0x566c86).setOrigin(0); y += 6;
    BO.text(this, 12, y, 'OY ORANI', { color: P.L });
    BO.text(this, W - 12, y, '%' + S.oy.toFixed(1), { color: P.l, ox: 1 }); y += 12;
    BO.text(this, 12, y, 'İTİBAR', { color: P.L });
    BO.text(this, W - 12, y, Math.round(S.itibar) + '/100', { color: P.w, ox: 1 }); y += 12;

    const b = BO.button(this, W / 2, Math.max(y + 18, H - 30), 140, 20, 'YENİ GÜN', {
      fill: 'y', shade: 'o',
      onClick: () => {
        S.gun++; S.faz = 'sabah';
        this.cameras.main.fadeOut(250, 26, 28, 44);
        this.time.delayedCall(260, () => this.scene.start('Hub'));
      },
    });
    this.tweens.add({ targets: b, scale: 1.05, duration: 500, yoyo: true, repeat: -1 });
    this.cameras.main.fadeIn(500, 26, 28, 44);
  }
};

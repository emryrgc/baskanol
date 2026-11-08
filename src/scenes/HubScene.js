// ANA SAYFA (Kampanya Merkezi): aday ortada, etrafında göstergeler, altta anket ve butonlar.
window.BO = window.BO || {};

BO.HubScene = class extends Phaser.Scene {
  constructor() { super('Hub'); }

  create() {
    BO.normalizeOy();
    const W = this.scale.width, H = this.scale.height, P = BO.PAL, S = BO.state;
    const aksam = S.faz === 'aksam';
    const C = (k) => Phaser.Display.Color.HexStringToColor(P[k] || k).color;

    // --- Oda ---
    const roomTop = 16, roomBottom = H - 150;
    this.add.rectangle(0, 0, W, H, C('k')).setOrigin(0);
    this.add.rectangle(0, roomTop, W, roomBottom - roomTop, C(aksam ? '#1f2547' : '#3b5dc9')).setOrigin(0);
    // pencere
    const wx = 62, wy = roomTop + 8, ww = 56, wh = 36;
    this.add.rectangle(wx - 2, wy - 2, ww + 4, wh + 4, C('k')).setOrigin(0);
    this.add.rectangle(wx, wy, ww, wh, C(aksam ? 'B' : 't')).setOrigin(0);
    if (aksam) {
      this.add.rectangle(wx + 40, wy + 6, 7, 7, C('w')).setOrigin(0);
      this.add.rectangle(wx + 42, wy + 6, 5, 5, C('B')).setOrigin(0);
      [[6, 5], [18, 12], [30, 4], [10, 24], [48, 26], [26, 20]].forEach(([x, y]) => this.add.rectangle(wx + x, wy + y, 1, 1, C('w')).setOrigin(0));
    } else {
      this.add.rectangle(wx + 40, wy + 5, 9, 9, C('y')).setOrigin(0);
      this.add.rectangle(wx + 6, wy + 14, 16, 4, C('w')).setOrigin(0);
      this.add.rectangle(wx + 10, wy + 12, 8, 2, C('w')).setOrigin(0);
    }
    this.add.rectangle(wx + ww / 2 - 1, wy, 2, wh, C('k')).setOrigin(0);
    // pankart
    this.add.rectangle(wx - 8, wy + wh + 5, ww + 16, 13, C('o')).setOrigin(0);
    BO.text(this, W / 2, wy + wh + 8, 'OY VER!', { color: P.k, ox: 0.5 });
    // zemin + kürsü
    this.add.rectangle(0, roomBottom - 16, W, 16, C('m')).setOrigin(0);
    this.add.rectangle(0, roomBottom - 16, W, 1, C('k')).setOrigin(0);
    const podY = roomBottom - 22;
    this.add.rectangle(W / 2 - 18, podY, 36, 16, C('k')).setOrigin(0);
    this.add.rectangle(W / 2 - 17, podY + 1, 34, 14, C('E')).setOrigin(0);
    this.add.rectangle(W / 2 - 6, podY + 5, 12, 6, C('o')).setOrigin(0);

    // aday (3 kat büyük)
    const aday = this.add.sprite(W / 2, podY + 2, 'aday0').setOrigin(0.5, 1).setScale(3).play('el_salla');
    this.tweens.add({ targets: aday, y: aday.y - 2, duration: 500, yoyo: true, repeat: -1 });

    // --- Üst bar ---
    BO.text(this, W / 2, 4, 'GÜN ' + S.gun + '/60 - ' + (aksam ? 'AKŞAM' : 'SABAH'), { color: aksam ? P.L : P.y, ox: 0.5 });

    // --- Göstergeler ---
    const card = (x, y, label, value, color) => {
      this.add.rectangle(x, y, 52, 28, C('k'), 0.85).setOrigin(0).setStrokeStyle(1, C('n'));
      BO.text(this, x + 26, y + 4, label, { color: P.L, ox: 0.5 });
      return BO.text(this, x + 26, y + 16, value, { color: color, ox: 0.5 });
    };
    const y1 = roomTop + 8, y2 = roomTop + 42;
    card(4, y1, 'OY', '%' + S.oy.toFixed(1), P.l);
    card(4, y2, 'İTİBAR', '', P.w);
    this.add.rectangle(10, y2 + 17, 40, 6, C('N')).setOrigin(0);
    this.add.rectangle(10, y2 + 17, Math.round(40 * S.itibar / 100), 6,
      C(S.itibar > 60 ? 'g' : S.itibar > 30 ? 'y' : 'r')).setOrigin(0);
    const kasa = S.kasa >= 100000 ? Math.round(S.kasa / 1000) + 'B' : BO.tl(S.kasa).replace(' TL', '');
    card(124, y1, 'KASA', kasa, P.y);
    card(124, y2, 'ERZAK', String(S.erzak), P.w);

    // --- Anket ---
    let y = roomBottom + 6;
    BO.text(this, 6, y, 'ANKET', { color: P.y });
    y += 13;
    const rows = [{ ad: 'BİZ', renk: 'o', oy: S.oy }]
      .concat(BO.RIVALS.map((r) => ({ ad: r.kisa, renk: r.renk, oy: BO.rakip(r.id).oy })))
      .concat([{ ad: 'KARARSIZ', renk: 'n', oy: S.kararsiz }]);
    const max = Math.max.apply(null, rows.map((r) => r.oy));
    rows.forEach((r) => {
      this.add.rectangle(6, y + 1, 6, 6, C(r.renk)).setOrigin(0);
      BO.text(this, 15, y, r.ad, { color: r.ad === 'BİZ' ? P.y : P.w });
      this.add.rectangle(84, y + 1, Math.max(1, Math.round(48 * r.oy / max)), 6, C(r.renk)).setOrigin(0);
      BO.text(this, W - 6, y, '%' + r.oy.toFixed(1), { color: P.L, ox: 1 });
      y += 11;
    });

    // --- Butonlar ---
    const go = (scene, data) => {
      BO.sfx.unlock();
      this.cameras.main.fadeOut(250, 26, 28, 44);
      this.time.delayedCall(260, () => this.scene.start(scene, data));
    };
    if (!aksam) {
      const b = BO.button(this, W / 2, H - 46, 164, 22, 'GÜNDÜZ: SAHAYA İN', { fill: 'y', shade: 'o', onClick: () => go('Day') });
      this.tweens.add({ targets: b, scale: 1.04, duration: 500, yoyo: true, repeat: -1 });
      BO.button(this, W / 2, H - 18, 164, 16, 'GÜNDÜZÜ ATLA', {
        fill: 'n', shade: 'N', color: 'w',
        onClick: () => { S.faz = 'aksam'; go('Hub'); },
      });
    } else {
      const b = BO.button(this, W / 2, H - 46, 164, 22, 'GECE: OPERASYON', { fill: 'p', shade: 'k', color: 'w', onClick: () => go('Night') });
      this.tweens.add({ targets: b, scale: 1.04, duration: 500, yoyo: true, repeat: -1 });
      BO.button(this, W / 2, H - 18, 164, 16, 'GECEYİ ATLA', {
        fill: 'n', shade: 'N', color: 'w',
        onClick: () => { S.gun++; S.faz = 'sabah'; go('Hub'); },
      });
    }

    this.cameras.main.fadeIn(300, 26, 28, 44);
  }
};

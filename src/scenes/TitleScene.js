window.BO = window.BO || {};

BO.BootScene = class extends Phaser.Scene {
  constructor() { super('Boot'); }
  create() {
    BO.makeTextures(this);
    this.scene.start('Title');
  }
};

BO.TitleScene = class extends Phaser.Scene {
  constructor() { super('Title'); }

  create() {
    const W = this.scale.width, H = this.scale.height, P = BO.PAL;
    this.bg = this.add.tileSprite(0, 0, W, H, 'yol').setOrigin(0);

    // Yolda giden otobüs + el sallayan aday
    this.bus = this.add.container(BO.LANE_X[1], H * 0.62);
    this.bus.add(this.add.image(0, 0, 'otobus'));
    this.bus.add(this.add.image(4, 10, 'bayrak').setOrigin(0, 1));
    this.bus.add(this.add.sprite(0, -4, 'aday0').play('el_salla'));
    this.tweens.add({ targets: this.bus, y: this.bus.y - 2, duration: 300, yoyo: true, repeat: -1 });

    // Kaldırımda yürüyen seçmenler (süs)
    this.walkers = [];
    for (let i = 0; i < 6; i++) {
      const side = i % 2 ? BO.WALK.right : BO.WALK.left;
      const s = this.add.sprite(Phaser.Math.Between(side[0], side[1]), Phaser.Math.Between(0, H), 'secmen0').play('yuru');
      s.setFlipX(Math.random() < 0.5);
      this.walkers.push(s);
    }

    // Başlık paneli
    this.add.rectangle(0, 0, W, 112, 0x1a1c2c, 0.88).setOrigin(0);
    const t1 = BO.text(this, W / 2, 26, 'BAŞKAN', { size: 24, color: P.y, ox: 0.5, oy: 0.5, stroke: 4 });
    const t2 = BO.text(this, W / 2, 56, 'OL!', { size: 24, color: P.o, ox: 0.5, oy: 0.5, stroke: 4 });
    this.tweens.add({ targets: [t1, t2], scale: 1.06, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    BO.text(this, W / 2, 84, 'SEÇİME 60 GÜN KALDI', { size: 8, color: P.w, ox: 0.5 });
    BO.text(this, W / 2, 98, 'PROTOTİP 1: GÜNDÜZ', { size: 8, color: P.L, ox: 0.5 });

    // Butonlar
    const basla = BO.button(this, W / 2, H - 70, 120, 24, 'BAŞLA', {
      fill: 'y', shade: 'o', size: 16,
      onClick: () => {
        BO.sfx.unlock();
        BO.state = BO.newGameState();
        this.cameras.main.fadeOut(250, 26, 28, 44);
        this.time.delayedCall(260, () => this.scene.start('Day'));
      },
    });
    this.tweens.add({ targets: basla, scale: 1.05, duration: 500, yoyo: true, repeat: -1 });

    const sesLabel = () => (BO.sfx.isMuted() ? 'SES: KAPALI' : 'SES: AÇIK');
    const ses = BO.button(this, W / 2, H - 34, 120, 16, sesLabel(), {
      fill: 'n', shade: 'N', color: 'w',
      onClick: () => { BO.sfx.toggle(); BO.sfx.unlock(); ses.label.setText(sesLabel()); },
    });

    this.cameras.main.fadeIn(300, 26, 28, 44);
  }

  update(t, delta) {
    const dt = delta / 1000;
    this.bg.tilePositionY -= 26 * dt;
    const H = this.scale.height;
    this.walkers.forEach((s) => {
      s.y += 26 * dt;
      if (s.y > H + 12) s.y = -12;
    });
  }
};

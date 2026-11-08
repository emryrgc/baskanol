// GÜNDÜZ: Otobüsten seçmenlere erzak fırlat. Rastgele anda "KAÇ!" kovalaması.
window.BO = window.BO || {};

BO.DayScene = class extends Phaser.Scene {
  constructor() { super('Day'); }

  create() {
    const W = this.scale.width, H = this.scale.height;
    const S = BO.state, T = BO.TUNE;
    this.W = W; this.H = H;

    this.mode = 'day';            // day | alarm | chase | recover | end
    this.speed = T.yolHizi;
    this.dayTime = T.gunSuresi;
    this.spawnTimer = 0.3;
    this.chaseTimer = Phaser.Math.FloatBetween(T.kovalamaAraligi[0], T.kovalamaAraligi[1]);
    this.donateTimer = 4;
    this.voters = [];
    this.cars = [];
    this.stats = {
      gun: S.gun, dagitilan: 0, memnun: 0, domates: 0, kovalama: 0,
      kacis: 0, yakalanma: 0, kaza: 0, bagis: 0, harcama: 0,
      oyBas: S.oy, itibarBas: S.itibar,
    };

    this.bg = this.add.tileSprite(0, 0, W, H, 'yol').setOrigin(0).setDepth(0);

    // --- Otobüs ---
    this.busDayY = H - 84;
    this.busChaseY = Math.round(H * 0.5);
    this.lane = 1;
    this.bus = this.add.container(BO.LANE_X[1], this.busDayY).setDepth(20);
    this.bus.add(this.add.image(0, 0, 'otobus'));
    this.flag = this.add.image(4, 10, 'bayrak').setOrigin(0, 1);
    this.bus.add(this.flag);
    this.aday = this.add.sprite(0, -4, 'aday0').play('el_salla');
    this.bus.add(this.aday);
    this.busBob = this.tweens.add({ targets: this.aday, y: -5, duration: 260, yoyo: true, repeat: -1 });
    this.invuln = 0;

    // --- Kovalayan kamyonet (gizli) ---
    this.truck = this.add.container(BO.LANE_X[1], H + 60).setDepth(19).setVisible(false);
    this.truck.add(this.add.image(0, 0, 'kamyonet'));
    this.truck.add(this.add.image(-4, 6, 'secmen_kizgin'));
    this.truck.add(this.add.image(5, 8, 'secmen_kizgin').setFlipX(true));
    this.truckFists = this.tweens.add({ targets: this.truck.list.slice(1), y: '-=2', duration: 120, yoyo: true, repeat: -1, paused: true });

    this.buildHud();
    this.buildControls();

    // Ekrana dokununca en yakın seçmene fırlat (küçük hedefleri vurmak kolay olsun)
    this.input.on('pointerdown', (p, over) => {
      if (over && over.length) return;
      this.tapAt(p.x, p.y);
    });
    this.input.keyboard.on('keydown-LEFT', () => this.changeLane(-1));
    this.input.keyboard.on('keydown-RIGHT', () => this.changeLane(1));
    this.input.keyboard.on('keydown-A', () => this.changeLane(-1));
    this.input.keyboard.on('keydown-D', () => this.changeLane(1));

    const hint = BO.text(this, W / 2, H * 0.42, 'SEÇMENLERE DOKUN\nERZAK FIRLAT!', { size: 8, color: BO.PAL.y, ox: 0.5, oy: 0.5, align: 'center', stroke: 3, depth: 60 });
    this.tweens.add({ targets: hint, alpha: 0, delay: 2600, duration: 500, onComplete: () => hint.destroy() });
    this.tweens.add({ targets: hint, scale: 1.08, duration: 300, yoyo: true, repeat: 4 });

    this.cameras.main.fadeIn(300, 26, 28, 44);
  }

  // ================= HUD =================
  buildHud() {
    const W = this.W, P = BO.PAL;
    this.add.rectangle(0, 0, W, 26, 0x1a1c2c, 0.92).setOrigin(0).setDepth(80);
    this.add.rectangle(0, 26, W, 1, 0x566c86).setOrigin(0).setDepth(80);
    this.hudOy = BO.text(this, 4, 4, '', { color: P.l, depth: 81 });
    this.hudKasa = BO.text(this, W - 4, 4, '', { color: P.y, ox: 1, depth: 81 });
    this.hudGun = BO.text(this, 4, 15, '', { color: P.w, depth: 81 });
    this.add.image(52, 18, 'kalp').setDepth(81);
    this.add.rectangle(57, 15, 32, 6, 0x333c57).setOrigin(0).setDepth(81);
    this.hudItibar = this.add.rectangle(57, 15, 32, 6, 0x38b764).setOrigin(0).setDepth(82);
    this.add.image(98, 18, 'simit').setDepth(81);
    this.hudErzak = BO.text(this, 103, 15, '', { color: P.w, depth: 81 });
    this.hudSaat = BO.text(this, W - 4, 15, '', { color: P.w, ox: 1, depth: 81 });

    // Kaçış ilerleme çubuğu (kovalamada görünür)
    this.chaseBar = this.add.container(0, 30).setDepth(80).setVisible(false);
    this.chaseBar.add(this.add.rectangle(0, 0, W, 12, 0x1a1c2c, 0.85).setOrigin(0));
    this.chaseBar.add(BO.text(this, 4, 2, 'KAÇIŞ', { color: P.o }));
    this.chaseBar.add(this.add.rectangle(48, 3, W - 54, 6, 0x333c57).setOrigin(0));
    this.chaseFill = this.add.rectangle(48, 3, 0, 6, 0xa7f070).setOrigin(0);
    this.chaseBar.add(this.chaseFill);
    this.updateHud();
  }

  updateHud() {
    const S = BO.state;
    this.hudOy.setText('OY %' + S.oy.toFixed(1));
    this.hudKasa.setText(BO.tl(S.kasa));
    this.hudGun.setText('GÜN ' + S.gun);
    this.hudItibar.width = Math.round(32 * S.itibar / 100);
    this.hudItibar.fillColor = S.itibar > 60 ? 0x38b764 : S.itibar > 30 ? 0xffcd75 : 0xb13e53;
    this.hudErzak.setText(String(S.erzak));
    const t = Math.max(0, Math.ceil(this.dayTime));
    this.hudSaat.setText(Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0'));
  }

  // ================= Kontroller =================
  buildControls() {
    const W = this.W, H = this.H, T = BO.TUNE;
    this.erzakBtn = BO.button(this, W / 2, H - 22, 140, 18, '+' + T.erzakPaketi + ' ERZAK ' + T.erzakFiyati + 'TL', {
      fill: 'y', shade: 'o', depth: 70,
      onClick: () => this.buyErzak(),
    });
    this.leftBtn = BO.button(this, 30, H - 28, 50, 36, null, { icon: 'ok_sol', fill: 'c', shade: 'b', depth: 70, onDown: () => this.changeLane(-1) });
    this.rightBtn = BO.button(this, W - 30, H - 28, 50, 36, null, { icon: 'ok_sag', fill: 'c', shade: 'b', depth: 70, onDown: () => this.changeLane(1) });
    this.leftBtn.setVisible(false); this.rightBtn.setVisible(false);
  }

  buyErzak() {
    const S = BO.state, T = BO.TUNE;
    if (this.mode !== 'day') return;
    if (S.kasa < T.erzakFiyati) {
      BO.floatText(this, this.W / 2, this.H - 40, 'KASADA PARA YOK!', BO.PAL.r);
      this.cameras.main.shake(120, 0.01);
      return;
    }
    S.kasa -= T.erzakFiyati;
    S.erzak += T.erzakPaketi;
    this.stats.harcama += T.erzakFiyati;
    BO.sfx.coin();
    BO.floatText(this, this.W / 2, this.H - 40, '+' + T.erzakPaketi + ' ERZAK', BO.PAL.y);
  }

  // ================= Seçmenler =================
  spawnVoter() {
    const sideLeft = Math.random() < 0.5;
    const side = sideLeft ? BO.WALK.left : BO.WALK.right;
    const v = this.add.sprite(Phaser.Math.Between(side[0], side[1]), 30, 'secmen0').setDepth(10);
    v.y = 20 - Phaser.Math.Between(0, 10);
    v.play({ key: 'yuru', startFrame: Phaser.Math.Between(0, 1) });
    v.setFlipX(sideLeft ? Math.random() < 0.3 : Math.random() < 0.7);
    v.dy = Phaser.Math.FloatBetween(-8, 6);   // kendi yürüme hızı
    v.served = false;
    this.voters.push(v);
  }

  tapAt(x, y) {
    if (this.mode !== 'day') return;
    let best = null, bestD = 22;
    this.voters.forEach((v) => {
      if (v.served || !v.active) return;
      const d = Phaser.Math.Distance.Between(x, y, v.x, v.y);
      if (d < bestD) { best = v; bestD = d; }
    });
    if (best) this.throwGift(best);
  }

  throwGift(v) {
    const S = BO.state;
    if (S.erzak <= 0) {
      BO.floatText(this, this.bus.x, this.bus.y - 30, 'ERZAK BİTTİ!', BO.PAL.r);
      this.tweens.add({ targets: this.erzakBtn, scale: 1.15, duration: 100, yoyo: true, repeat: 2 });
      return;
    }
    S.erzak--;
    v.served = true;
    this.stats.dagitilan++;
    BO.sfx.throw();

    const key = Phaser.Utils.Array.GetRandom(['simit', 'makarna', 'cay']);
    const g = this.add.image(this.bus.x, this.bus.y - 10, key).setDepth(30);
    const sx = g.x, sy = g.y, flight = 420;
    const tx = v.x, ty = v.y + (this.speed + v.dy) * flight / 1000;
    const arc = 26;
    this.tweens.addCounter({
      from: 0, to: 1, duration: flight,
      onUpdate: (tw) => {
        const k = tw.getValue();
        g.x = sx + (tx - sx) * k;
        g.y = sy + (ty - sy) * k - Math.sin(Math.PI * k) * arc;
        g.angle = k * 540;
      },
      onComplete: () => { g.destroy(); this.reaction(v); },
    });
  }

  reaction(v) {
    if (!v.active || this.mode !== 'day') return;
    const S = BO.state, T = BO.TUNE, P = BO.PAL;
    const r = Math.random();
    v.anims.stop();
    if (r < T.tepki.memnun) {
      // Memnun
      v.setTexture('secmen_mutlu');
      S.oy += T.memnunOy;
      S.itibar = BO.clamp(S.itibar + T.memnunItibar, 0, 100);
      this.stats.memnun++;
      BO.sfx.happy();
      const h = this.add.image(v.x, v.y - 10, 'kalp').setDepth(40);
      this.tweens.add({ targets: h, y: h.y - 14, alpha: 0, duration: 800, onComplete: () => h.destroy() });
      BO.floatText(this, v.x, v.y - 18, '+OY', P.l);
      this.tweens.add({ targets: v, scaleY: 1.25, duration: 90, yoyo: true, repeat: 1 });
    } else if (r < T.tepki.memnun + T.tepki.domates) {
      // Domates fırlatır
      v.setTexture('secmen_kizgin');
      this.stats.domates++;
      this.throwTomato(v);
    } else {
      // Kızar ve kovalama başlar
      v.setTexture('secmen_kizgin');
      BO.sfx.angry();
      const ex = this.add.image(v.x, v.y - 12, 'isaret').setDepth(40);
      this.tweens.add({ targets: ex, y: ex.y - 4, duration: 100, yoyo: true, repeat: 3, onComplete: () => ex.destroy() });
      BO.floatText(this, v.x, v.y - 20, 'KIZDI!', P.r);
      this.time.delayedCall(500, () => this.triggerChase());
    }
  }

  throwTomato(v) {
    const t = this.add.image(v.x, v.y - 4, 'domates').setDepth(30);
    const sx = t.x, sy = t.y;
    this.tweens.addCounter({
      from: 0, to: 1, duration: 380,
      onUpdate: (tw) => {
        const k = tw.getValue();
        t.x = sx + (this.bus.x - sx) * k;
        t.y = sy + (this.bus.y - 6 - sy) * k - Math.sin(Math.PI * k) * 20;
        t.angle = -k * 400;
      },
      onComplete: () => {
        t.destroy();
        const S = BO.state;
        S.itibar = BO.clamp(S.itibar + BO.TUNE.domatesItibar, 0, 100);
        BO.sfx.splat();
        this.cameras.main.shake(100, 0.006);
        const leke = this.add.image(Phaser.Math.Between(-5, 5), Phaser.Math.Between(-12, 4), 'leke');
        this.bus.add(leke);
        this.tweens.add({ targets: leke, alpha: 0, delay: 1800, duration: 600, onComplete: () => leke.destroy() });
        BO.floatText(this, this.bus.x, this.bus.y - 26, '-İTİBAR', BO.PAL.r);
      },
    });
  }

  // ================= Kovalama =================
  triggerChase() {
    if (this.mode !== 'day') return;
    const W = this.W, H = this.H, P = BO.PAL;
    this.mode = 'alarm';
    this.stats.kovalama++;
    this.erzakBtn.setVisible(false);
    BO.sfx.alarm();

    const red = this.add.rectangle(0, 0, W, H, 0xb13e53, 0).setOrigin(0).setDepth(60);
    this.tweens.add({ targets: red, alpha: 0.4, duration: 160, yoyo: true, repeat: 3, onComplete: () => red.destroy() });
    const kac = BO.text(this, W / 2, H * 0.36, 'KAÇ!', { size: 32, color: P.y, ox: 0.5, oy: 0.5, stroke: 6, depth: 90 });
    kac.setScale(0.2);
    this.tweens.add({ targets: kac, scale: 1, duration: 260, ease: 'Back.easeOut' });
    this.tweens.add({ targets: kac, angle: { from: -6, to: 6 }, duration: 90, yoyo: true, repeat: 6 });
    this.tweens.add({ targets: kac, alpha: 0, scale: 1.6, delay: 1200, duration: 300, onComplete: () => kac.destroy() });

    // Herkes kızgın bakar
    this.voters.forEach((v) => { if (v.active && !v.served) { v.anims.stop(); v.setTexture('secmen_kizgin'); } });

    this.time.delayedCall(1200, () => this.startChaseRun());
  }

  startChaseRun() {
    const H = this.H;
    this.mode = 'chase';
    this.chaseTime = 0;
    this.distance = 55;
    this.carTimer = 0.9;
    this.shoutTimer = 1;

    this.voters.forEach((v) => this.tweens.add({ targets: v, alpha: 0, duration: 300, onComplete: () => v.destroy() }));
    this.voters = [];

    this.tweens.add({ targets: this, speed: BO.TUNE.kacisYolHizi, duration: 900, ease: 'Quad.easeIn' });
    this.tweens.add({ targets: this.bus, y: this.busChaseY, duration: 700, ease: 'Quad.easeOut' });

    this.truck.setVisible(true).setPosition(this.bus.x, H + 40);
    this.truckFists.resume();

    this.leftBtn.setVisible(true); this.rightBtn.setVisible(true);
    this.chaseBar.setVisible(true);
  }

  changeLane(d) {
    if (this.mode !== 'chase') return;
    const nl = BO.clamp(this.lane + d, 0, 2);
    if (nl === this.lane) return;
    this.lane = nl;
    BO.sfx.lane();
    if (this.laneTween) this.laneTween.stop();
    this.laneTween = this.tweens.add({ targets: this.bus, x: BO.LANE_X[nl], duration: 120, ease: 'Quad.easeOut' });
    this.tweens.add({ targets: this.bus, angle: d * 8, duration: 60, yoyo: true });
  }

  spawnCar(lane) {
    const key = Phaser.Utils.Array.GetRandom(['araba_mavi', 'araba_sari', 'araba_yesil', 'araba_beyaz', 'araba_kirmizi', 'dolmus']);
    const c = this.add.image(BO.LANE_X[lane], -24, key).setDepth(15);
    c.own = Phaser.Math.Between(50, 58);  // arabanın kendi hızı (bizden yavaş)
    c.hit = false;
    this.cars.push(c);
  }

  updateChase(dt) {
    const T = BO.TUNE, P = BO.PAL;
    this.chaseTime += dt;
    this.distance = Math.min(100, this.distance + 3.5 * dt);

    // Trafik üret
    this.carTimer -= dt;
    if (this.carTimer <= 0) {
      const lanes = Phaser.Utils.Array.Shuffle([0, 1, 2]);
      const pair = Math.random() < 0.3 && this.chaseTime > 3;
      this.spawnCar(lanes[0]);
      if (pair) this.spawnCar(lanes[1]);
      const hiz = Math.max(0.45, 0.85 - this.chaseTime * 0.015);
      this.carTimer = pair ? hiz + 0.45 : Phaser.Math.FloatBetween(hiz, hiz + 0.35);
    }

    // Kamyonet takibi
    const ty = this.busChaseY + 36 + this.distance * 0.9;
    this.truck.y += (ty - this.truck.y) * Math.min(1, dt * 4);
    this.truck.x += (this.bus.x - this.truck.x) * Math.min(1, dt * 2.2);

    // Bağırışlar
    this.shoutTimer -= dt;
    if (this.shoutTimer <= 0) {
      this.shoutTimer = Phaser.Math.FloatBetween(1.8, 3);
      const s = Phaser.Utils.Array.GetRandom(['DUR!', 'KAÇMA!', 'GEL BURAYA!', 'SİMİT BAYATTI!', 'OYUMU GERİ VER!', 'MAKARNA ÇİĞ!']);
      BO.floatText(this, this.truck.x, this.truck.y - 22, s, P.w, { duration: 1100 });
    }

    // Çarpışmalar
    if (this.invuln > 0) this.invuln -= dt;
    const bx = this.bus.x, by = this.bus.y;
    this.cars.forEach((c) => {
      if (c.hit) return;
      const hw = c.width / 2 - 2, hh = c.height / 2 - 2;
      if (this.invuln <= 0 && Math.abs(c.x - bx) < 9 + hw && Math.abs(c.y - by) < 20 + hh) {
        this.crash(c);
      } else if (this.truck.visible && Math.abs(c.x - this.truck.x) < 9 + hw && Math.abs(c.y - this.truck.y) < 15 + hh) {
        this.fling(c, c.x < this.truck.x ? -1 : 1);  // kamyonet arabaları savurur
      }
    });

    this.chaseFill.width = Math.round((this.W - 54) * Math.min(1, this.chaseTime / T.kacisSuresi));

    if (this.distance <= 0) this.endChase(false);
    else if (this.chaseTime >= T.kacisSuresi) this.endChase(true);
  }

  fling(c, dir) {
    c.hit = true;
    this.tweens.add({ targets: c, x: c.x + dir * 34, angle: dir * 70, alpha: 0.5, duration: 400, ease: 'Quad.easeOut' });
  }

  crash(c) {
    const S = BO.state;
    this.fling(c, c.x < this.bus.x ? -1 : (c.x > this.bus.x ? 1 : (Math.random() < 0.5 ? -1 : 1)));
    this.distance -= BO.TUNE.kazaMesafe;
    S.itibar = BO.clamp(S.itibar - 1, 0, 100);
    this.stats.kaza++;
    this.invuln = 1;
    BO.sfx.crash();
    this.cameras.main.shake(220, 0.02);
    this.tweens.add({ targets: this.bus, alpha: 0.3, duration: 80, yoyo: true, repeat: 5 });
    this.speed *= 0.6;
    this.tweens.add({ targets: this, speed: BO.TUNE.kacisYolHizi, duration: 800 });
    BO.floatText(this, this.bus.x, this.bus.y - 28, 'ÇARPTIN!', BO.PAL.o);
  }

  endChase(won) {
    const S = BO.state, T = BO.TUNE, P = BO.PAL, W = this.W, H = this.H;
    this.mode = 'recover';
    this.leftBtn.setVisible(false); this.rightBtn.setVisible(false);
    this.chaseBar.setVisible(false);
    let title;
    if (won) {
      this.stats.kacis++;
      BO.sfx.win();
      title = BO.text(this, W / 2, H * 0.3, 'KURTULDUN!', { size: 16, color: P.l, ox: 0.5, oy: 0.5, stroke: 4, depth: 90 });
      this.tweens.add({ targets: this.truck, y: H + 60, duration: 900, ease: 'Quad.easeIn' });
    } else {
      this.stats.yakalanma++;
      BO.sfx.lose();
      this.cameras.main.shake(400, 0.03);
      this.cameras.main.flash(200, 177, 62, 83);
      S.oy = Math.max(0, S.oy + T.yakalanmaOy);
      S.itibar = BO.clamp(S.itibar + T.yakalanmaItibar, 0, 100);
      const kayip = Math.min(S.erzak, T.yakalanmaErzak);
      S.erzak -= kayip;
      title = BO.text(this, W / 2, H * 0.3, 'YAKALANDIN!', { size: 16, color: P.r, ox: 0.5, oy: 0.5, stroke: 4, depth: 90 });
      BO.floatText(this, W / 2, H * 0.3 + 22, 'OY ' + T.yakalanmaOy.toFixed(1) + '%  İTİBAR ' + T.yakalanmaItibar, P.w, { duration: 1800, rise: 10 });
      if (kayip) BO.floatText(this, W / 2, H * 0.3 + 34, '-' + kayip + ' ERZAK ÇALINDI', P.y, { duration: 1800, rise: 10 });
      // otobüse tosla, sonra geri çekil
      this.tweens.add({ targets: this.truck, y: this.bus.y + 30, duration: 150, yoyo: true,
        onComplete: () => this.tweens.add({ targets: this.truck, y: H + 60, duration: 800, delay: 500 }) });
    }
    title.setScale(0.3);
    this.tweens.add({ targets: title, scale: 1, duration: 250, ease: 'Back.easeOut' });
    this.tweens.add({ targets: title, alpha: 0, delay: 1500, duration: 300, onComplete: () => title.destroy() });

    this.time.delayedCall(1700, () => {
      this.truck.setVisible(false); this.truckFists.pause();
      this.tweens.add({ targets: this, speed: T.yolHizi, duration: 900 });
      this.lane = 1;
      this.tweens.add({ targets: this.bus, x: BO.LANE_X[1], y: this.busDayY, duration: 900, ease: 'Sine.easeInOut' });
      this.time.delayedCall(900, () => {
        this.mode = 'day';
        this.erzakBtn.setVisible(true);
        this.spawnTimer = 0.2;
        this.chaseTimer = Phaser.Math.FloatBetween(T.kovalamaAraligi[0], T.kovalamaAraligi[1]);
      });
    });
  }

  // ================= Gün sonu =================
  endDay() {
    this.mode = 'end';
    const t = BO.text(this, this.W / 2, this.H * 0.4, 'AKŞAM OLDU!', { size: 16, color: BO.PAL.y, ox: 0.5, oy: 0.5, stroke: 4, depth: 90 });
    t.setScale(0.3);
    this.tweens.add({ targets: t, scale: 1, duration: 300, ease: 'Back.easeOut' });
    this.erzakBtn.setVisible(false);
    this.time.delayedCall(1400, () => {
      this.cameras.main.fadeOut(500, 26, 28, 44);
      this.time.delayedCall(520, () => this.scene.start('Summary', this.stats));
    });
  }

  // ================= Döngü =================
  update(time, delta) {
    const dt = Math.min(delta, 50) / 1000;
    const S = BO.state, T = BO.TUNE;
    this.bg.tilePositionY -= this.speed * dt;

    // Seçmenler yolla birlikte aşağı akar
    for (let i = this.voters.length - 1; i >= 0; i--) {
      const v = this.voters[i];
      if (!v.active) { this.voters.splice(i, 1); continue; }
      v.y += (this.speed + v.dy) * dt;
      if (v.y > this.H + 16 || v.y < -30) { v.destroy(); this.voters.splice(i, 1); }
    }
    // Arabalar
    for (let i = this.cars.length - 1; i >= 0; i--) {
      const c = this.cars[i];
      c.y += (this.speed - c.own) * dt;
      if (c.y > this.H + 30 || c.y < -60) { c.destroy(); this.cars.splice(i, 1); }
    }

    if (this.mode === 'day') {
      this.dayTime -= dt;
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        this.spawnVoter();
        this.spawnTimer = Phaser.Math.FloatBetween(0.6, 1.3);
      }
      this.chaseTimer -= dt;
      if (this.chaseTimer <= 0 && this.dayTime > 6) {
        BO.floatText(this, this.W / 2, this.H * 0.5, 'YANDAŞLAR GELİYOR!', BO.PAL.r, { duration: 1000 });
        this.triggerChase();
      }
      // Bağış: itibar yüksekse para gelir
      this.donateTimer -= dt;
      if (this.donateTimer <= 0) {
        this.donateTimer = 4;
        if (S.itibar >= 35 && Math.random() < S.itibar / 110) {
          const amt = Math.round(S.itibar * Phaser.Math.FloatBetween(4, 9) / 50) * 50;
          S.kasa += amt;
          this.stats.bagis += amt;
          BO.sfx.coin();
          BO.floatText(this, this.W - 40, 36, '+' + BO.tl(amt) + ' BAĞIŞ', BO.PAL.y, { rise: 10, duration: 1300 });
        }
      }
      if (this.dayTime <= 0) this.endDay();
    } else if (this.mode === 'chase') {
      this.updateChase(dt);
    }

    this.updateHud();
  }
};

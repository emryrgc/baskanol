// GECE: Kılık değiştirip mahallede gizlice gez. Gazeteye para ver, rakibi kışkırt, videoya çek.
window.BO = window.BO || {};

BO.NightScene = class extends Phaser.Scene {
  constructor() { super('Night'); }

  create() {
    const W = this.scale.width, H = this.scale.height, N = BO.NIGHT, M = BO.NIGHT_MAP, TS = N.tile;
    this.W = W; this.H = H;
    this.cols = M[0].length; this.rows = M.length;
    this.worldH = this.rows * TS;
    this.timeLeft = N.sure;
    this.det = 0;              // yakalanma göstergesi 0..1
    this.paused = false;
    this.ended = false;
    this.log = [];
    this.gazeteDone = false;
    this.rivalDone = false;
    this.path = [];
    this.target = null;        // null | 'rakip' | 'kapi'
    this.repath = 0;

    this.add.image(0, 0, 'gece_harita').setOrigin(0).setDepth(0);

    // Lambalar ve ışıkları
    this.lamps = [];
    M.forEach((row, cy) => row.split('').forEach((ch, cx) => {
      if (ch !== 'L') return;
      const x = cx * TS + TS / 2, y = cy * TS + TS / 2;
      this.add.image(x, y + 4, 'isik').setDepth(1);
      this.add.image(x + 4, y - 2, 'lamba').setOrigin(0.5, 1).setDepth(y);
      this.lamps.push({ x, y });
    }));

    // Gazete tabelası
    const [gx, gy, gw] = N.gazeteBlok;
    const sx = gx * TS + gw * TS / 2, sy = gy * TS + 14;
    this.add.rectangle(sx, sy, 52, 12, 0x1a1c2c).setStrokeStyle(1, 0xffcd75).setDepth(2);
    BO.text(this, sx, sy, 'GAZETE', { color: BO.PAL.y, ox: 0.5, oy: 0.5, depth: 3 });
    const [kx, ky] = N.kapi;
    this.doorPos = { x: kx * TS + TS / 2, y: (ky + 1) * TS + TS / 2 };
    this.doorMark = BO.text(this, kx * TS + TS / 2, ky * TS - 2, '$', { color: BO.PAL.y, ox: 0.5, oy: 1, stroke: 2, depth: 400 });
    this.tweens.add({ targets: this.doorMark, y: this.doorMark.y - 3, duration: 400, yoyo: true, repeat: -1 });
    // gazete binası etrafında yanıp sönen çerçeve + kapı ışığı
    const [, , , gh] = N.gazeteBlok;
    this.gazeteCerceve = this.add.rectangle(gx * TS, gy * TS, gw * TS, gh * TS).setOrigin(0).setStrokeStyle(2, 0xffcd75).setDepth(3);
    this.tweens.add({ targets: this.gazeteCerceve, alpha: 0.2, duration: 500, yoyo: true, repeat: -1 });
    this.add.image(this.doorPos.x, this.doorPos.y - 6, 'isik').setDepth(1).setScale(0.6);

    // Bizim araba (dönüş noktası, süs)
    this.add.image(N.araba[0] * TS + 14, N.araba[1] * TS + 6, 'araba_siyah').setAngle(90).setDepth(5);

    // Oyuncu
    const p0 = this.tileCenter(N.start[0], N.start[1]);
    this.player = this.add.sprite(p0.x, p0.y, 'kilik0').setOrigin(0.5, 0.85);

    // Polisler
    this.cops = N.polisler.map((wps) => {
      const pts = wps.map(([c, r]) => this.tileCenter(c, r));
      const s = this.add.sprite(pts[0].x, pts[0].y, 'polis0').setOrigin(0.5, 0.85).play('polis_yuru');
      s.wps = pts; s.idx = 1; s.wait = 0; s.ang = 0; s.look = 0;
      s.q = this.add.image(s.x, s.y - 16, 'soru').setVisible(false).setDepth(1000);
      return s;
    });
    this.coneG = this.add.graphics().setDepth(4);

    // Rakip lider (her gece rastgele biri)
    this.rivalInfo = Phaser.Utils.Array.GetRandom(BO.RIVALS);
    const rp = N.rakipYolu.map(([c, r]) => this.tileCenter(c, r));
    this.rival = this.add.sprite(rp[0].x, rp[0].y, 'rakip_' + this.rivalInfo.id).setOrigin(0.5, 0.85);
    this.rival.wps = rp; this.rival.idx = 1; this.rival.wait = 0;
    this.rivalTag = BO.text(this, 0, 0, this.rivalInfo.kisa, { color: BO.PAL.w, ox: 0.5, oy: 1, stroke: 2, depth: 400 });
    this.tweens.add({ targets: this.rival, scaleY: 1.06, duration: 300, yoyo: true, repeat: -1 });

    // Kamera
    this.cameras.main.setBounds(0, -30, W, this.worldH + 30 + 30);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

    this.buildHud();
    this.updateHud(false);

    // Dokun: yürü
    this.input.on('pointerdown', (p, over) => {
      if (this.paused || this.ended || (over && over.length)) return;
      this.onTap(p.worldX, p.worldY);
    });

    const hint = this.hint = BO.text(this, W / 2, H * 0.42, 'DOKUN: YÜRÜ\nFENERLERE YAKALANMA\nÇALIDA SAKLAN', {
      color: BO.PAL.y, ox: 0.5, oy: 0.5, align: 'center', stroke: 3, depth: 500,
    }).setScrollFactor(0).setVisible(false);

    this.cameras.main.fadeIn(400, 0, 0, 0);
    this.intro();
  }

  // ================= Yardımcılar =================
  tileCenter(c, r) { return { x: c * 12 + 6, y: r * 12 + 6 }; }
  tileAt(x, y) { return { c: Math.floor(x / 12), r: Math.floor(y / 12) }; }
  ch(c, r) { return (r < 0 || r >= this.rows || c < 0 || c >= this.cols) ? '#' : BO.NIGHT_MAP[r][c]; }
  walkable(c, r) { const k = this.ch(c, r); return k !== '#' && k !== 'D'; }
  isWall(x, y) { const t = this.tileAt(x, y); return !this.walkable(t.c, t.r); }

  findPath(fromX, fromY, toC, toR) {
    const s = this.tileAt(fromX, fromY);
    if (!this.walkable(toC, toR)) return null;
    const key = (c, r) => r * this.cols + c;
    const prev = new Map([[key(s.c, s.r), null]]);
    const q = [[s.c, s.r]];
    while (q.length) {
      const [c, r] = q.shift();
      if (c === toC && r === toR) break;
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dc, dr]) => {
        const nc = c + dc, nr = r + dr, k = key(nc, nr);
        if (!prev.has(k) && this.walkable(nc, nr)) { prev.set(k, [c, r]); q.push([nc, nr]); }
      });
    }
    if (!prev.has(key(toC, toR))) return null;
    const out = [];
    let cur = [toC, toR];
    while (cur && !(cur[0] === s.c && cur[1] === s.r)) { out.unshift(this.tileCenter(cur[0], cur[1])); cur = prev.get(key(cur[0], cur[1])); }
    return out;
  }

  nearestWalkable(c, r) {
    for (let d = 0; d <= 2; d++) {
      for (let dr = -d; dr <= d; dr++) for (let dc = -d; dc <= d; dc++) {
        if (this.walkable(c + dc, r + dr)) return { c: c + dc, r: r + dr };
      }
    }
    return null;
  }

  rayLen(x, y, ang, max) {
    const cx = Math.cos(ang), cy = Math.sin(ang);
    for (let t = 2; t < max; t += 2) if (this.isWall(x + cx * t, y + cy * t)) return t;
    return max;
  }

  // ================= HUD =================
  buildHud() {
    const W = this.W, H = this.H, P = BO.PAL;
    const fix = (o) => o.setScrollFactor(0).setDepth(600);
    fix(this.add.rectangle(0, 0, W, 26, 0x1a1c2c, 0.92).setOrigin(0));
    fix(this.add.rectangle(0, 26, W, 1, 0x5d275d).setOrigin(0));
    this.hudSaat = fix(BO.text(this, 4, 4, '', { color: P.L }));
    this.hudKasa = fix(BO.text(this, W - 4, 4, '', { color: P.y, ox: 1 }));
    fix(this.add.image(9, 18, 'goz'));
    fix(this.add.rectangle(17, 15, 60, 6, 0x333c57).setOrigin(0));
    this.hudDet = fix(this.add.rectangle(17, 15, 0, 6, 0xffcd75).setOrigin(0));
    this.hudGizli = fix(BO.text(this, 84, 15, '', { color: P.l }));
    fix(this.add.rectangle(0, 27, W, 12, 0x1a1c2c, 0.8).setOrigin(0));
    this.hudGorev = fix(BO.text(this, W / 2, 29, '', { color: P.w, ox: 0.5 }));
    // hedef okları (hedef ekran dışındayken)
    this.oklar = ['gazete', 'rakip'].map((k) => ({
      k, g: fix(this.add.graphics()),
      t: fix(BO.text(this, 0, 0, k === 'gazete' ? 'GAZETE' : this.rivalInfo.kisa, { color: P.y, ox: 0.5, oy: 0.5, stroke: 2 })),
    }));
    this.eveBtn = BO.button(this, W - 30, H - 14, 52, 14, 'EVE DÖN', {
      fill: 'p', shade: 'k', color: 'w', depth: 600, onClick: () => this.endNight(),
    });
    this.eveBtn.setScrollFactor(0);
  }

  updateArrows() {
    const cam = this.cameras.main, H = this.H, W = this.W;
    this.oklar.forEach((o) => {
      const done = o.k === 'gazete' ? this.gazeteDone : this.rivalDone;
      const hedef = o.k === 'gazete' ? { x: this.doorPos.x, y: this.doorPos.y - 12 } : this.rival;
      const sy = hedef.y - cam.scrollY;
      o.g.clear();
      const ust = sy < 44, alt = sy > H - 24;
      if (done || (!ust && !alt)) { o.t.setVisible(false); return; }
      const x = BO.clamp(hedef.x, 30, W - 30);
      const y = ust ? 46 : H - 34;
      const blink = Math.floor(this.time.now / 300) % 2 === 0;
      o.g.fillStyle(0xffcd75, blink ? 1 : 0.6);
      if (ust) o.g.fillTriangle(x, y - 4, x - 5, y + 2, x + 5, y + 2);
      else o.g.fillTriangle(x, y + 4, x - 5, y - 2, x + 5, y - 2);
      o.t.setVisible(true).setPosition(x, ust ? y + 9 : y - 9);
    });
  }

  updateHud(hidden) {
    this.hudGorev.setText('GAZETE[' + (this.gazeteDone ? 'X' : ' ') + '] RAKİP[' + (this.rivalDone ? 'X' : ' ') + ']');
    this.updateArrows();
    const t = Math.max(0, Math.ceil(this.timeLeft));
    this.hudSaat.setText('GECE ' + Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0'));
    this.hudKasa.setText(BO.tl(BO.state.kasa));
    this.hudDet.width = Math.round(60 * this.det);
    this.hudDet.fillColor = this.det > 0.6 ? 0xb13e53 : 0xffcd75;
    this.hudGizli.setText(hidden ? 'SAKLANDIN' : '');
  }

  // ================= Dokunma =================
  onTap(x, y) {
    const r = this.rival;
    if (!this.rivalDone && Phaser.Math.Distance.Between(x, y, r.x, r.y - 5) < 16) {
      this.target = 'rakip'; this.repath = 0; this.marker(r.x, r.y - 18);
      return;
    }
    const k = BO.NIGHT.kapi;
    if (Math.abs(x - (k[0] * 12 + 6)) < 14 && Math.abs(y - (k[1] * 12 + 6)) < 16) {
      this.target = 'kapi';
      const t = this.tileAt(this.doorPos.x, this.doorPos.y);
      this.path = this.findPath(this.player.x, this.player.y, t.c, t.r) || [];
      this.marker(this.doorPos.x, this.doorPos.y);
      return;
    }
    const t0 = this.tileAt(x, y);
    const t = this.nearestWalkable(t0.c, t0.r);
    if (!t) return;
    this.target = null;
    this.path = this.findPath(this.player.x, this.player.y, t.c, t.r) || [];
    const c = this.tileCenter(t.c, t.r);
    this.marker(c.x, c.y);
  }

  marker(x, y) {
    const m = BO.text(this, x, y, 'X', { color: BO.PAL.l, ox: 0.5, oy: 0.5, depth: 450 });
    this.tweens.add({ targets: m, alpha: 0, scale: 0.4, duration: 500, onComplete: () => m.destroy() });
  }

  // ================= Döngü =================
  update(time, delta) {
    if (this.paused || this.ended) return;
    const dt = Math.min(delta, 50) / 1000;
    this.timeLeft -= dt;
    if (this.timeLeft <= 0) { this.endNight(); return; }

    this.movePlayer(dt);
    this.moveAlong(this.rival, this.rivalDone ? 0 : 11, dt, 0.6);
    this.rivalTag.setPosition(this.rival.x, this.rival.y - 14);

    // Hedefe varış kontrolleri
    const pl = this.player;
    if (this.target === 'rakip' && !this.rivalDone) {
      this.repath -= dt;
      if (this.repath <= 0) {
        this.repath = 0.4;
        const t = this.tileAt(this.rival.x, this.rival.y);
        this.path = this.findPath(pl.x, pl.y, t.c, t.r) || [];
      }
      if (Phaser.Math.Distance.Between(pl.x, pl.y, this.rival.x, this.rival.y) < 16) {
        this.target = null; this.path = [];
        this.startProvoke();
        return;
      }
    }
    if (this.target === 'kapi' && Phaser.Math.Distance.Between(pl.x, pl.y, this.doorPos.x, this.doorPos.y) < 6) {
      this.target = null; this.path = [];
      this.openGazete();
      return;
    }

    // Gizlilik
    const here = this.tileAt(pl.x, pl.y);
    const hidden = 'bc'.includes(this.ch(here.c, here.r));
    const inLight = this.lamps.some((l) => Phaser.Math.Distance.Between(pl.x, pl.y, l.x, l.y + 4) < 22);
    pl.setAlpha(hidden ? 0.5 : 1);

    this.coneG.clear();
    let seen = false;
    this.cops.forEach((c) => {
      this.moveCop(c, dt);
      const range = 46, half = 0.5;
      // fener konisi
      const ox = c.x, oy = c.y - 6, ang = c.ang + c.look;
      const pts = [{ x: ox, y: oy }];
      for (let i = 0; i <= 10; i++) {
        const a = ang - half + (2 * half) * i / 10;
        const L = this.rayLen(ox, oy, a, range);
        pts.push({ x: ox + Math.cos(a) * L, y: oy + Math.sin(a) * L });
      }
      this.coneG.fillStyle(0xd8f4ff, 0.32).fillPoints(pts, true);
      // oyuncuyu görüyor mu?
      const d = Phaser.Math.Distance.Between(ox, oy, pl.x, pl.y - 5);
      const da = Math.abs(Phaser.Math.Angle.Wrap(Phaser.Math.Angle.Between(ox, oy, pl.x, pl.y - 5) - ang));
      const r = inLight ? range + 22 : range;
      let sees = false;
      if ((!hidden || d < 10) && d < r && da < half) {
        sees = this.rayLen(ox, oy, Phaser.Math.Angle.Between(ox, oy, pl.x, pl.y - 5), d) >= d - 1;
      }
      if (!sees && d < 9) sees = true; // dibine kadar girersen fark eder
      c.q.setVisible(sees).setPosition(c.x, c.y - 17);
      if (sees) seen = true;
    });

    this.det = BO.clamp(this.det + (seen ? 1.1 : -0.45) * dt, 0, 1);
    if (this.det >= 1) { this.caught(); return; }

    // derinlik: aşağıdaki önde
    [pl, this.rival].concat(this.cops).forEach((s) => s.setDepth(10 + s.y));
    this.updateHud(hidden);
  }

  movePlayer(dt) {
    const pl = this.player;
    if (!this.path.length) { pl.anims.stop(); pl.setTexture('kilik0'); return; }
    const n = this.path[0];
    const dx = n.x - pl.x, dy = n.y - pl.y, d = Math.hypot(dx, dy), step = 42 * dt;
    if (!pl.anims.isPlaying) pl.play('kilik_yuru');
    if (dx < -0.5) pl.setFlipX(true); else if (dx > 0.5) pl.setFlipX(false);
    if (d <= step) { pl.x = n.x; pl.y = n.y; this.path.shift(); }
    else { pl.x += dx / d * step; pl.y += dy / d * step; }
  }

  moveAlong(s, speed, dt, pause) {
    if (!speed) return;
    if (s.wait > 0) { s.wait -= dt; return; }
    const n = s.wps[s.idx];
    const dx = n.x - s.x, dy = n.y - s.y, d = Math.hypot(dx, dy), step = speed * dt;
    if (d > 0.5) { s.ang = Math.atan2(dy, dx); if (Math.abs(dx) > 0.5) s.setFlipX(dx < 0); }
    if (d <= step) { s.x = n.x; s.y = n.y; s.idx = (s.idx + 1) % s.wps.length; s.wait = pause; }
    else { s.x += dx / d * step; s.y += dy / d * step; }
  }

  moveCop(c, dt) {
    const waiting = c.wait > 0;
    this.moveAlong(c, 16, dt, 1.4);
    // dururken etrafa bakın
    c.look = waiting ? Math.sin(this.time.now / 300) * 0.9 : 0;
    if (waiting && c.anims.isPlaying) c.anims.pause();
    if (!waiting && c.anims.isPaused) c.anims.resume();
  }

  // ================= Diyalog kutusu =================
  openPanel() {
    if (this.hint && this.hint.active) this.hint.destroy();
    this.paused = true;
    this.ui = [];
    const W = this.W, H = this.H;
    const add = (o) => { o.setScrollFactor(0); if (o.depth < 700) o.setDepth(700); this.ui.push(o); return o; };
    this.uiAdd = add;
    add(this.add.rectangle(0, 0, W, H, 0x000000, 0.55).setOrigin(0).setInteractive());
    return add;
  }

  closePanel() {
    (this.ui || []).forEach((o) => o.destroy());
    this.ui = [];
    this.paused = false;
  }

  options(list, top) {
    const add = this.uiAdd;
    const btns = [];
    list.forEach((o, i) => {
      const lines = o.label.split('\n').length;
      const h = lines > 1 ? 22 : 14;
      const b = add(BO.button(this, this.W / 2, top + h / 2, 164, h, o.label, {
        fill: o.fill || 'w', shade: o.shade || 'L', color: o.color || 'k', depth: 710,
        onClick: () => { btns.forEach((x) => x.disableInteractive()); o.onPick(); },
      }));
      btns.push(b);
      top += h + 8;
    });
    return btns;
  }

  // ================= Gazete =================
  openGazete() {
    const add = this.openPanel(), W = this.W, H = this.H, P = BO.PAL, N = BO.NIGHT, S = BO.state;
    const top = Math.round(H * 0.2);
    add(this.add.rectangle(6, top, W - 12, 176, 0xf4f4f4).setOrigin(0));
    add(BO.text(this, W / 2, top + 6, 'GAZETE PATRONU', { color: P.k, ox: 0.5 }));
    add(this.add.rectangle(12, top + 17, W - 24, 1, 0x1a1c2c).setOrigin(0));
    const say = add(BO.text(this, W / 2, top + 24, '', { color: P.r, ox: 0.5, align: 'center', wrap: W - 24 }));
    const close = () => this.closePanel();

    if (this.gazeteDone) {
      say.setText('BUGÜNLÜK YETER.\nYARIN GEL!');
      this.options([{ label: 'TAMAM', onPick: close }], top + 70);
      return;
    }
    if (S.kasa < N.gazeteFiyat) {
      say.setText('PARA YOK MU?\nO ZAMAN HABER\nDE YOK!');
      this.options([{ label: 'TAMAM', onPick: close }], top + 70);
      return;
    }
    say.setText('FİYAT ' + BO.tl(N.gazeteFiyat) + '.\nKİMİN HAKKINDA\nYAZALIM?');
    const opts = BO.RIVALS.map((r) => ({
      label: r.kisa + ' HAKKINDA',
      onPick: () => {
        S.kasa -= N.gazeteFiyat;
        this.gazeteDone = true;
        this.doorMark.setVisible(false);
        this.gazeteCerceve.setVisible(false);
        this.log.push({ tip: 'gazete', id: r.id });
        BO.sfx.coin();
        say.setText('ANLAŞTIK!\nYARIN SABAH\nMANŞETTE!');
        this.time.delayedCall(1300, close);
      },
    }));
    opts.push({ label: 'VAZGEÇ', fill: 'n', shade: 'N', color: 'w', onPick: close });
    this.options(opts, top + 66);
  }

  // ================= Rakibi kışkırt =================
  startProvoke() {
    const add = this.openPanel(), W = this.W, H = this.H, P = BO.PAL, R = this.rivalInfo;
    const top = Math.round(H * 0.12);
    add(this.add.rectangle(6, top, W - 12, H - top - 8, 0x1a1c2c).setOrigin(0).setStrokeStyle(1, 0x5d275d));
    this.portrait = add(this.add.image(30, top + 30, 'rakip_' + R.id).setScale(3));
    add(BO.text(this, 54, top + 8, R.ad, { color: P.w }));
    add(BO.text(this, 54, top + 19, R.parti, { color: P.L, wrap: W - 64, lineSpacing: 2 }));
    this.speech = add(BO.text(this, 54, top + 42, Phaser.Utils.Array.GetRandom(BO.RAKIP_TEPKI.giris), { color: P.y, wrap: W - 62 }));
    add(BO.text(this, 12, top + 70, 'SİNİR', { color: P.r }));
    add(this.add.rectangle(56, top + 71, W - 68, 6, 0x333c57).setOrigin(0));
    this.angerBar = add(this.add.rectangle(56, top + 71, 0, 6, 0xb13e53).setOrigin(0));
    this.anger = 0;
    this.round = 0;
    this.optTop = top + 98;
    this.roundUi = [];
    this.nextRound();
  }

  nextRound() {
    this.roundUi.forEach((o) => o.destroy());
    const R = this.rivalInfo, L = BO.LAFLAR;
    const pick = (a) => Phaser.Utils.Array.GetRandom(a);
    const digerZaaf = pick(BO.RIVALS.filter((r) => r.id !== R.id)).zaaf;
    const list = Phaser.Utils.Array.Shuffle([
      { label: pick(L[R.zaaf]), v: BO.LAF_ETKI.zaaf },
      { label: pick(L.genel), v: BO.LAF_ETKI.genel },
      { label: pick(L[digerZaaf]), v: BO.LAF_ETKI.diger },
    ]);
    this.roundUi = this.options(list.map((o) => ({ label: o.label, onPick: () => this.saySomething(o.v) })), this.optTop);
    const add = this.uiAdd;
    this.roundUi.push(add(BO.text(this, this.W / 2, this.optTop - 12, 'LAF SOK (' + (this.round + 1) + '/3)', { color: BO.PAL.L, ox: 0.5 })));
  }

  saySomething(v) {
    const T = BO.RAKIP_TEPKI, P = BO.PAL;
    v += Phaser.Math.Between(-5, 5);
    this.anger += v;
    this.tweens.add({ targets: this.angerBar, width: Math.round((this.W - 68) * Math.min(1, this.anger / 100)), duration: 300 });
    const tier = v >= 38 ? 'yuksek' : v >= 18 ? 'orta' : 'dusuk';
    this.speech.setText(Phaser.Utils.Array.GetRandom(T[tier]));
    this.speech.setColor(tier === 'yuksek' ? P.r : tier === 'orta' ? P.o : P.L);
    if (tier !== 'dusuk') { BO.sfx.angry(); this.tweens.add({ targets: this.portrait, x: '+=2', duration: 40, yoyo: true, repeat: tier === 'yuksek' ? 6 : 2 }); }
    this.portrait.setTint(this.anger >= 70 ? 0xff7777 : this.anger >= 40 ? 0xffaaaa : 0xffffff);
    this.round++;
    this.time.delayedCall(900, () => {
      if (this.anger >= 100) this.explode();
      else if (this.round >= 3) this.provokeFail();
      else this.nextRound();
    });
  }

  provokeFail() {
    this.roundUi.forEach((o) => o.destroy());
    this.speech.setText('NEYSE, BEN\nGİDİYORUM.').setColor(BO.PAL.L);
    this.time.delayedCall(1300, () => {
      this.closePanel();
      this.rivalLeaves();
    });
  }

  // Gece başında kamera hedefleri gezdirir
  intro() {
    const cam = this.cameras.main, W = this.W, H = this.H;
    this.paused = true;
    cam.stopFollow();
    this.oklar.forEach((o) => { o.g.clear(); o.t.setVisible(false); });
    const yazi = BO.text(this, W / 2, H - 44, '', { color: BO.PAL.y, ox: 0.5, oy: 0.5, align: 'center', stroke: 3, depth: 900 }).setScrollFactor(0);
    const adimlar = [
      { x: this.doorPos.x, y: this.doorPos.y, t: 'GAZETE: PARA VER,\nRAKİBE MANŞET ATSIN!' },
      { x: this.rival.x, y: this.rival.y, t: this.rivalInfo.kisa + ': LAF SOK,\nKIZINCA VİDEOYA ÇEK!' },
      { x: this.player.x, y: this.player.y, t: 'SEN BURADASIN.\nPOLİSLERE YAKALANMA!' },
    ];
    let i = 0, bitti = false;
    const bitir = () => {
      if (bitti) return; bitti = true;
      yazi.destroy(); this.input.off('pointerdown', bitir);
      cam.startFollow(this.player, true, 0.12, 0.12);
      this.paused = false;
      if (this.hint && this.hint.active) {
        this.hint.setVisible(true);
        this.tweens.add({ targets: this.hint, alpha: 0, delay: 2600, duration: 500, onComplete: () => this.hint.destroy() });
      }
    };
    const sonraki = () => {
      if (bitti) return;
      if (i >= adimlar.length) { bitir(); return; }
      const a = adimlar[i++];
      cam.pan(a.x, a.y, 600, 'Sine.easeInOut');
      yazi.setText(a.t);
      this.time.delayedCall(1700, sonraki);
    };
    this.time.delayedCall(300, () => this.input.on('pointerdown', bitir));
    sonraki();
  }

  rivalLeaves() {
    this.rivalDone = true;
    this.tweens.add({ targets: [this.rival, this.rivalTag], alpha: 0, duration: 600 });
  }

  explode() {
    this.roundUi.forEach((o) => o.destroy());
    const t = this.uiAdd(BO.text(this, this.W / 2, this.optTop + 30, 'PATLADI!', { size: 16, color: BO.PAL.r, ox: 0.5, oy: 0.5, stroke: 4, depth: 720 }));
    t.setScale(0.3);
    this.tweens.add({ targets: t, scale: 1, duration: 250, ease: 'Back.easeOut' });
    this.speech.setText('SEN... SEN...\nAAAARGH!!').setColor(BO.PAL.r);
    this.tweens.add({ targets: this.portrait, angle: { from: -8, to: 8 }, duration: 60, yoyo: true, repeat: 10 });
    BO.sfx.alarm();
    const tel = this.uiAdd(BO.text(this, this.W / 2, this.optTop + 54, 'HEMEN TELEFONU\nÇIKAR!', { color: BO.PAL.y, ox: 0.5, align: 'center', depth: 720 }));
    this.time.delayedCall(1600, () => { this.closePanel(); this.phoneGame(); });
  }

  // ================= Telefonla çekim mini oyunu =================
  phoneGame() {
    const add = this.openPanel(), W = this.W, H = this.H, P = BO.PAL, R = this.rivalInfo;
    const cx = W / 2, cy = Math.round(H * 0.45);
    const sw = 92, sh = 140;
    add(this.add.rectangle(cx, cy, sw + 12, sh + 30, 0x1a1c2c).setStrokeStyle(2, 0x566c86));
    add(this.add.rectangle(cx, cy, sw, sh, 0x262b44));
    add(this.add.rectangle(cx, cy - sh / 2 - 8, 20, 3, 0x566c86));
    const rec = add(this.add.circle(cx - sw / 2 + 8, cy - sh / 2 + 8, 3, 0xb13e53));
    this.tweens.add({ targets: rec, alpha: 0, duration: 400, yoyo: true, repeat: -1 });
    add(BO.text(this, cx - sw / 2 + 14, cy - sh / 2 + 4, 'KAYIT', { color: P.w }));
    const counter = add(BO.text(this, cx, cy + sh / 2 - 12, 'ÇEKİM 0/3', { color: P.w, ox: 0.5 }));

    const target = add(this.add.image(cx, cy, 'rakip_' + R.id).setScale(3).setTint(0xff8888));
    // vizör köşeleri
    const g = add(this.add.graphics());
    const fw = 40, fh = 52;
    g.lineStyle(2, 0xf4f4f4, 1);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => {
      const x = cx + sx * fw / 2, y = cy + sy * fh / 2;
      g.lineBetween(x, y, x - sx * 8, y); g.lineBetween(x, y, x, y - sy * 8);
    });
    add(BO.text(this, cx, cy + sh / 2 + 26, 'ADAMI ÇERÇEVEYE\nAL, SONRA ÇEK!', { color: P.y, ox: 0.5, align: 'center' }));

    let shots = 0, pts = 0, t0 = 0, done = false;
    const curse = ['#@!', '%&!!', '$#@!', '!!!'];
    const mover = this.time.addEvent({
      delay: 16, loop: true, callback: () => {
        t0 += 0.016 * (1 + shots * 0.35);
        target.x = cx + Math.sin(t0 * 2.3) * 26 + Math.sin(t0 * 5.1) * 6;
        target.y = cy + Math.sin(t0 * 1.7) * 30 + Math.cos(t0 * 4.3) * 6;
        target.angle = Math.sin(t0 * 20) * 6;
        if (Math.random() < 0.03) {
          const c = add(BO.text(this, target.x + Phaser.Math.Between(-20, 20), target.y - 26, Phaser.Utils.Array.GetRandom(curse), { color: P.r, ox: 0.5, stroke: 2, depth: 730 }));
          this.tweens.add({ targets: c, y: c.y - 10, alpha: 0, duration: 600, onComplete: () => c.destroy() });
        }
      },
    });

    const shoot = () => {
      if (done) return;
      shots++;
      const flash = add(this.add.rectangle(cx, cy, sw, sh, 0xffffff).setDepth(740));
      this.tweens.add({ targets: flash, alpha: 0, duration: 220, onComplete: () => flash.destroy() });
      BO.sfx.click(); BO.sfx.splat();
      const d = Phaser.Math.Distance.Between(target.x, target.y, cx, cy);
      let label, color;
      if (d < 10) { pts += 2; label = 'MÜKEMMEL!'; color = P.l; }
      else if (d < 22) { pts += 1; label = 'İYİ'; color = P.y; }
      else { label = 'BULANIK...'; color = P.L; }
      const f = add(BO.text(this, cx, cy - 10, label, { color, ox: 0.5, oy: 0.5, stroke: 3, depth: 750 }));
      this.tweens.add({ targets: f, y: f.y - 16, alpha: 0, duration: 700, onComplete: () => f.destroy() });
      counter.setText('ÇEKİM ' + shots + '/3');
      if (shots >= 3) { done = true; this.time.delayedCall(700, () => { mover.remove(); this.phoneDone(pts); }); }
    };
    const btn = add(BO.button(this, cx, cy + sh / 2 + 4, 80, 14, 'ÇEK!', { fill: 'r', shade: 'k', color: 'w', depth: 760, onDown: shoot }));
    btn.setScrollFactor(0);
  }

  phoneDone(pts) {
    this.closePanel();
    const add = this.openPanel(), W = this.W, H = this.H, P = BO.PAL, R = this.rivalInfo;
    const kayip = 5 + pts * 3;
    const izlenme = (0.2 + pts * 0.4).toFixed(1).replace('.', ',');
    BO.rakibeDarbe(R.id, kayip);
    this.log.push({ tip: 'video', id: R.id, kayip, izlenme });
    BO.sfx.win();
    const top = Math.round(H * 0.3);
    add(this.add.rectangle(10, top, W - 20, 96, 0xf4f4f4).setOrigin(0));
    add(BO.text(this, W / 2, top + 8, 'VİDEO PAYLAŞILDI!', { color: P.k, ox: 0.5 }));
    add(BO.text(this, W / 2, top + 26, izlenme + ' MİLYON\nİZLENME', { size: 8, color: P.r, ox: 0.5, align: 'center' }));
    add(BO.text(this, W / 2, top + 52, R.kisa + ' İTİBAR -' + kayip, { color: P.b, ox: 0.5 }));
    this.options([{ label: 'DEVAM', fill: 'y', shade: 'o', onPick: () => { this.closePanel(); this.rivalLeaves(); } }], top + 72);
  }

  // ================= Yakalanma / bitiş =================
  caught() {
    if (this.hint && this.hint.active) this.hint.destroy();
    this.paused = true;
    const W = this.W, H = this.H, P = BO.PAL;
    this.log.push({ tip: 'skandal' });
    BO.sfx.lose();
    this.cameras.main.shake(300, 0.02);
    this.cameras.main.flash(250, 255, 255, 255);
    this.player.setTexture('aday0').setAlpha(1);   // kılık düştü!
    const t1 = BO.text(this, W / 2, H * 0.36, 'YAKALANDIN!', { size: 16, color: P.r, ox: 0.5, oy: 0.5, stroke: 4, depth: 800 }).setScrollFactor(0);
    const t2 = BO.text(this, W / 2, H * 0.36 + 20, 'KILIĞIN DÜŞTÜ!', { color: P.y, ox: 0.5, oy: 0.5, stroke: 3, depth: 800 }).setScrollFactor(0);
    t1.setScale(0.3);
    this.tweens.add({ targets: t1, scale: 1, duration: 250, ease: 'Back.easeOut' });
    this.time.delayedCall(2000, () => this.endNight());
  }

  endNight() {
    if (this.ended) return;
    this.ended = true;
    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.time.delayedCall(620, () => this.scene.start('Morning', { log: this.log }));
  }
};

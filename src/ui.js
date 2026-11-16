// Ortak arayüz yardımcıları: yazı, buton, uçan yazı.
window.BO = window.BO || {};

// Yazı tipi ayarlardan seçilir: 'piksel' (Tiny5) ya da 'normal' (Rubik)
BO.font = function () { return BO.ayar && BO.ayar.yazi === 'normal' ? '"RB", Arial, sans-serif' : '"PX", "Courier New", monospace'; };
BO.pikselYazi = function () { return !(BO.ayar && BO.ayar.yazi === 'normal'); };

// Keskin pixel yazı: tarayıcının yazıya eklediği bulanık kenarları temizler.
// Her piksel ya tam dolu ya tam boş olur; konturlu yazıda renkler iki renge yuvarlanır.
BO.PixelText = class extends Phaser.GameObjects.Text {
  updateText() {
    super.updateText();
    if (!this.piksel) return this;   // normal yazı tipinde yumuşak kenarlar kalır
    const c = this.canvas;
    if (!c || !c.width || !c.height) return this;
    const ctx = this.context;
    const img = ctx.getImageData(0, 0, c.width, c.height), d = img.data;
    const fill = Phaser.Display.Color.HexStringToColor(this.style.color || '#ffffff');
    const hasStroke = this.style.strokeThickness > 0;
    const st = hasStroke ? Phaser.Display.Color.HexStringToColor(this.style.stroke) : null;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 110) { d[i + 3] = 0; continue; }
      d[i + 3] = 255;
      if (hasStroke) {
        const df = Math.abs(d[i] - fill.r) + Math.abs(d[i + 1] - fill.g) + Math.abs(d[i + 2] - fill.b);
        const ds = Math.abs(d[i] - st.r) + Math.abs(d[i + 1] - st.g) + Math.abs(d[i + 2] - st.b);
        const k = df <= ds ? fill : st;
        d[i] = k.r; d[i + 1] = k.g; d[i + 2] = k.b;
      } else {
        d[i] = fill.r; d[i + 1] = fill.g; d[i + 2] = fill.b;
      }
    }
    ctx.putImageData(img, 0, 0);
    if (this.renderer && this.renderer.gl) {
      this.frame.source.glTexture = this.renderer.canvasToTexture(c, this.frame.source.glTexture, true);
    }
    return this;
  }
};

BO.text = function (scene, x, y, str, opts) {
  opts = opts || {};
  const t = new BO.PixelText(scene, Math.round(x), Math.round(y), str, {
    fontFamily: BO.font(),
    fontSize: (opts.size || 11) + 'px',
    color: opts.color || BO.PAL.w,
    align: opts.align || 'left',
    lineSpacing: opts.lineSpacing == null ? -1 : opts.lineSpacing,
    resolution: BO.K || 1,
    wordWrap: opts.wrap ? { width: opts.wrap } : undefined,
  });
  t.piksel = BO.pikselYazi();
  if (t.piksel) t.updateText();
  scene.add.existing(t);
  if (opts.stroke) t.setStroke(BO.PAL.k, opts.stroke);
  t.setOrigin(opts.ox == null ? 0 : opts.ox, opts.oy == null ? 0 : opts.oy);
  if (opts.depth != null) t.setDepth(opts.depth);
  return t;
};

// ---------- Renk teması ----------
// Bütün butonlar 5 türden birine girer; böylece her ekranda aynı renk dili kullanılır.
BO.TEMA = {
  ana: { fill: '#ffcd75', shade: '#ef7d57', yazi: '#1a1c2c' },     // ana eylem (sarı)
  ikinci: { fill: '#3b4a70', shade: '#232b45', yazi: '#f4f4f4' },  // diğer eylemler (lacivert)
  tehlike: { fill: '#b13e53', shade: '#5a1f2e', yazi: '#f4f4f4' }, // riskli/silme (kırmızı)
  pasif: { fill: '#2a3048', shade: '#1a1c2c', yazi: '#566c86' },   // kullanılamaz
  kagit: { fill: '#f4f4f4', shade: '#94b0c2', yazi: '#1a1c2c' },   // seçenekler, klavye
  baslik: '#29366f',                                               // pencere/ekran başlık bandı
};
BO.temaSec = function (fill) {
  if (fill === 'y' || fill === 'o') return BO.TEMA.ana;
  if (fill === 'r') return BO.TEMA.tehlike;
  if (fill === 'L') return BO.TEMA.pasif;
  if (fill === 'w') return BO.TEMA.kagit;
  return BO.TEMA.ikinci;
};

// Pixel tarzı buton. onDown: basıldığı an (oyun kontrolleri), onClick: bırakınca (menüler)
BO.button = function (scene, x, y, w, h, label, opts) {
  opts = opts || {};
  const P = BO.PAL;
  const tema = BO.temaSec(opts.fill || 'y');
  const c = scene.add.container(Math.round(x), Math.round(y));
  const g = scene.add.graphics();
  const fill = Phaser.Display.Color.HexStringToColor(tema.fill).color;
  const dark = Phaser.Display.Color.HexStringToColor(tema.shade).color;
  const kk = Phaser.Display.Color.HexStringToColor(P.k).color;
  function paint(pressed) {
    g.clear();
    const oy = pressed ? 2 : 0;
    g.fillStyle(kk, 1).fillRect(-w / 2 - 1, -h / 2 - 1 + oy, w + 2, h + 2 - oy + 2);
    if (!pressed) g.fillStyle(dark, 1).fillRect(-w / 2, -h / 2 + h - 0, w, 2);
    g.fillStyle(fill, 1).fillRect(-w / 2, -h / 2 + oy, w, h);
    g.fillStyle(0xffffff, 0.25).fillRect(-w / 2, -h / 2 + oy, w, 1);
  }
  paint(false);
  c.add(g);
  let inner = null;
  if (label) {
    inner = BO.text(scene, 0, 0, label, { size: opts.size || 11, color: tema.yazi, ox: 0.5, oy: 0.5, align: 'center' });
  } else if (opts.icon) {
    inner = scene.add.image(0, 0, opts.icon);
  }
  if (inner) c.add(inner);
  c.setSize(w + 6, h + 8);
  c.setInteractive({ useHandCursor: true });
  c.on('pointerdown', () => {
    paint(true); if (inner) inner.y = 2;
    if (opts.onDown) opts.onDown();
  });
  const release = (fire) => {
    paint(false); if (inner) inner.y = 0;
    if (fire && opts.onClick) { BO.sfx.click(); opts.onClick(); }
  };
  c.on('pointerup', () => release(true));
  c.on('pointerout', () => release(false));
  c.label = inner;
  c.bw = w; c.bh = h;
  if (opts.depth != null) c.setDepth(opts.depth);
  return c;
};

// Butonu dikkat çekici yap: yazı yerinde kalır, sadece etrafındaki çerçeve parlar.
BO.pulse = function (scene, btn, color) {
  const r = scene.add.rectangle(btn.x, btn.y + 1, btn.bw + 8, btn.bh + 8)
    .setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(BO.PAL[color || 'y']).color)
    .setDepth((btn.depth || 0) - 1).setScrollFactor(btn.scrollFactorX);
  scene.tweens.add({ targets: r, alpha: 0.1, duration: 500, yoyo: true, repeat: -1 });
  btn.once('destroy', () => r.destroy());
  const vis = btn.setVisible.bind(btn);
  btn.setVisible = (v) => { if (r.active) r.setVisible(v); return vis(v); };
  return r;
};

// Yukarı süzülüp kaybolan yazı ("+OY" gibi)
BO.floatText = function (scene, x, y, str, color, opts) {
  opts = opts || {};
  const t = BO.text(scene, x, y, str, { size: opts.size || 11, color: color, ox: 0.5, oy: 0.5, stroke: 2, depth: 50 });
  // ekran dışına taşmasın
  const half = t.width / 2;
  t.x = Math.round(BO.clamp(t.x, half + 2, BO.W - half - 2));
  scene.tweens.add({
    targets: t, y: y - (opts.rise || 18), alpha: 0,
    duration: opts.duration || 900, delay: opts.delay || 0, ease: 'Quad.easeOut',
    onComplete: () => t.destroy(),
  });
  return t;
};

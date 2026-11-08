// Ortak arayüz yardımcıları: yazı, buton, uçan yazı.
window.BO = window.BO || {};

BO.FONT = '"PS2P", "Courier New", monospace';

BO.text = function (scene, x, y, str, opts) {
  opts = opts || {};
  const t = scene.add.text(Math.round(x), Math.round(y), str, {
    fontFamily: BO.FONT,
    fontSize: (opts.size || 8) + 'px',
    color: opts.color || BO.PAL.w,
    align: opts.align || 'left',
    lineSpacing: opts.lineSpacing == null ? 4 : opts.lineSpacing,
    wordWrap: opts.wrap ? { width: opts.wrap } : undefined,
  });
  if (opts.stroke) t.setStroke(BO.PAL.k, opts.stroke);
  t.setOrigin(opts.ox == null ? 0 : opts.ox, opts.oy == null ? 0 : opts.oy);
  if (opts.depth != null) t.setDepth(opts.depth);
  return t;
};

// Pixel tarzı buton. onDown: basıldığı an (oyun kontrolleri), onClick: bırakınca (menüler)
BO.button = function (scene, x, y, w, h, label, opts) {
  opts = opts || {};
  const P = BO.PAL;
  const c = scene.add.container(Math.round(x), Math.round(y));
  const g = scene.add.graphics();
  const fill = Phaser.Display.Color.HexStringToColor(P[opts.fill || 'o']).color;
  const dark = Phaser.Display.Color.HexStringToColor(P[opts.shade || 'r']).color;
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
    inner = BO.text(scene, 0, 0, label, { size: opts.size || 8, color: P[opts.color || 'k'], ox: 0.5, oy: 0.5, align: 'center' });
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
  if (opts.depth != null) c.setDepth(opts.depth);
  return c;
};

// Yukarı süzülüp kaybolan yazı ("+OY" gibi)
BO.floatText = function (scene, x, y, str, color, opts) {
  opts = opts || {};
  const t = BO.text(scene, x, y, str, { size: opts.size || 8, color: color, ox: 0.5, oy: 0.5, stroke: 2, depth: 50 });
  // ekran dışına taşmasın
  const half = t.width / 2;
  t.x = Math.round(BO.clamp(t.x, half + 2, scene.scale.width - half - 2));
  scene.tweens.add({
    targets: t, y: y - (opts.rise || 18), alpha: 0,
    duration: opts.duration || 900, delay: opts.delay || 0, ease: 'Quad.easeOut',
    onComplete: () => t.destroy(),
  });
  return t;
};

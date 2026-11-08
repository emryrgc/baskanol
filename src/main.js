// Oyunu başlatır. Genişlik sabit 180 piksel, yükseklik telefonun oranına göre.
(function () {
  function start() {
    const W = 180;
    const ratio = window.innerHeight / Math.max(1, window.innerWidth);
    const H = Math.round(BO.clamp(W * ratio, 300, 400));
    BO.game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: 'game',
      width: W,
      height: H,
      pixelArt: true,
      roundPixels: true,
      backgroundColor: '#1a1c2c',
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      input: { activePointers: 2 },
      scene: [BO.BootScene, BO.TitleScene, BO.DayScene, BO.SummaryScene],
    });
  }

  // Pixel fontun (Türkçe harfler dahil) yüklenmesini bekle, en fazla 2 sn.
  const fontReady = document.fonts && document.fonts.load
    ? document.fonts.load('8px "PS2P"', 'BAŞKAN İĞÜÇÖ').catch(() => {})
    : Promise.resolve();
  Promise.race([fontReady, new Promise((r) => setTimeout(r, 2000))]).then(start);
})();

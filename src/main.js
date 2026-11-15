// Oyunu başlatır. Genişlik sabit 180 piksel, yükseklik telefonun oranına göre.
(function () {
  function start() {
    // Pikseller eşit görünsün diye ekran TAM SAYI katıyla büyütülür (2x, 3x...)
    const W = 180;
    const zoomFor = (h) => Math.max(1, Math.floor(Math.min(window.innerWidth / W, window.innerHeight / h)));
    const k0 = Math.max(1, Math.floor(Math.min(window.innerWidth / W, window.innerHeight / 300)));
    const H = Math.round(BO.clamp(Math.floor(window.innerHeight / k0), 300, 400));
    BO.game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: 'game',
      width: W,
      height: H,
      pixelArt: true,
      roundPixels: true,
      backgroundColor: '#1a1c2c',
      scale: { mode: Phaser.Scale.NONE, zoom: zoomFor(H), autoCenter: Phaser.Scale.CENTER_BOTH },
      input: { activePointers: 2 },
      scene: [BO.BootScene, BO.TitleScene, BO.HubScene, BO.DayScene, BO.SummaryScene, BO.NightScene, BO.MorningScene,
        BO.SkipScene, BO.PollScene, BO.DebateScene, BO.ElectionScene,
        BO.NameScene, BO.LoadScene, BO.SettingsScene, BO.CreditsScene, BO.ByeScene,
        BO.ShopScene, BO.RallyScene, BO.PosterScene],
    });
    window.addEventListener('resize', () => {
      const k = zoomFor(H);
      if (BO.game.scale.zoom !== k) BO.game.scale.setZoom(k);
    });
  }

  // Pixel fontun (Türkçe harfler dahil) yüklenmesini bekle, en fazla 2 sn.
  const fontReady = document.fonts && document.fonts.load
    ? document.fonts.load('8px "PX"', 'BAŞKAN İĞÜÇÖ').catch(() => {})
    : Promise.resolve();
  Promise.race([fontReady, new Promise((r) => setTimeout(r, 2000))]).then(start);
})();

// Oyunu başlatır. Genişlik sabit 180 piksel, yükseklik telefonun oranına göre.
(function () {
  function start() {
    // Oyun dünyası 180 piksel genişliğinde. Ekran bunun TAM SAYI katı (K) çözünürlükte çizilir:
    // sprite pikselleri eşit boyda kalır, yazılar ise K kat detayla keskin çizilir.
    const W = 180;
    const vw = window.innerWidth, vh = window.innerHeight;
    const Kf = Math.min(vw / W, vh / 300);
    let K, H;
    if (Kf >= 2) {
      // tam sayı katı: pikseller eşit boyda
      K = Math.floor(Kf);
      H = Math.round(BO.clamp(Math.floor(vh / K), 300, 400));
    } else {
      // küçük ekran (ör. uygulama içi pencere): 2x çiz, ekrana sığacak kadar küçült
      K = 2;
      H = Math.round(BO.clamp(W * vh / vw, 300, 400));
    }
    BO.W = W; BO.H = H; BO.K = K;
    // alttaki butonlar ekranın dibine yapışmasın diye boşluk (kısa ekranda daha az)
    BO.ALT = Math.round(BO.clamp(H - 296, 6, 20));

    const sahneler = [BO.BootScene, BO.TitleScene, BO.HubScene, BO.DayScene, BO.SummaryScene, BO.NightScene, BO.MorningScene,
      BO.SkipScene, BO.PollScene, BO.DebateScene, BO.ElectionScene,
      BO.NameScene, BO.IntroScene, BO.LoadScene, BO.SettingsScene, BO.CreditsScene, BO.ByeScene,
      BO.ShopScene, BO.RallyScene, BO.PosterScene];
    // Her sahnenin kamerası K kat yakınlaştırılır (sol üst köşe sabit)
    sahneler.forEach((S) => {
      const orj = S.prototype.create;
      S.prototype.create = function () {
        this.cameras.main.setOrigin(0, 0).setZoom(K).setScroll(0, 0);
        if (orj) return orj.apply(this, arguments);
      };
    });

    BO.game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: 'game',
      width: W * K,
      height: H * K,
      pixelArt: true,
      roundPixels: true,
      backgroundColor: '#1a1c2c',
      // FIT: pencereye sığdırır; max: asla çizim boyutundan büyütmez (pikseller bozulmasın)
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, max: { width: W * K, height: H * K } },
      input: { activePointers: 2 },
      scene: sahneler,
    });
  }

  // Pixel fontun (Türkçe harfler dahil) yüklenmesini bekle, en fazla 2 sn.
  const fontReady = document.fonts && document.fonts.load
    ? Promise.all([document.fonts.load('8px "PX"', 'BAŞKAN İĞÜÇÖ'), document.fonts.load('11px "RB"', 'BAŞKAN İĞÜÇÖ')]).catch(() => {})
    : Promise.resolve();
  Promise.race([fontReady, new Promise((r) => setTimeout(r, 2000))]).then(start);
})();

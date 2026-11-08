# Başkan Ol

Pixel art, dikey ekranlı, komik bir seçim kampanyası oyunu (HTML5 + Phaser 3).

- Oyun tasarımı ve kararlar: [TASARIM.md](TASARIM.md)
- Oynamak için: `index.html` dosyasını bir web sunucusuyla açın, örneğin `python3 -m http.server`
- Tek dosyalık sürüm üretmek için: `python3 tools/build_artifact.py dist/baskan-ol.html`

## Klasörler

| Klasör | İçerik |
|---|---|
| `src/` | Oyun kodu (`scenes/` içinde ekranlar) |
| `src/sprites.js` | Kodla çizilen pixel art grafikler |
| `src/state.js` | Oyun durumu ve denge ayarları (`BO.TUNE`) |
| `assets/fonts/` | Press Start 2P fontu (SIL Open Font License) |
| `lib/` | Phaser 3.80.1 |
| `tools/` | Yardımcı betikler |

// Oyunun kalıcı durumu (günler arasında korunur).
window.BO = window.BO || {};

BO.newGameState = function () {
  return {
    gun: 1,          // kampanya günü (1..60)
    kasa: 10000,     // TL
    itibar: 50,      // 0..100
    oy: 12.0,        // oy oranı %
    erzak: 30,       // fırlatılabilir hediye sayısı
    faz: 'sabah',    // sabah: gündüze çıkılabilir, aksam: geceye çıkılabilir
    rakipler: BO.RIVALS.map((r) => ({ id: r.id, oy: r.oy, itibar: r.itibar })),
    kararsiz: 18,    // kararsız seçmen %
  };
};

BO.rakip = function (id) { return BO.state.rakipler.find((r) => r.id === id); };
BO.rakipBilgi = function (id) { return BO.RIVALS.find((r) => r.id === id); };

// Oy oranlarının toplamı 100 olsun: bizim dışımızdakileri orantılı ayarla
BO.normalizeOy = function () {
  const S = BO.state;
  S.oy = BO.clamp(S.oy, 0, 95);
  const digerleri = S.rakipler.reduce((t, r) => t + r.oy, 0) + S.kararsiz;
  const hedef = 100 - S.oy;
  const k = digerleri > 0 ? hedef / digerleri : 0;
  S.rakipler.forEach((r) => { r.oy *= k; });
  S.kararsiz *= k;
};

// Rakibin itibarı düşer -> oy kaybeder; kaybın bir kısmı bize, kalanı kararsızlara
BO.rakibeDarbe = function (id, itibarKaybi) {
  const S = BO.state, r = BO.rakip(id);
  r.itibar = BO.clamp(r.itibar - itibarKaybi, 0, 100);
  const oyKaybi = Math.min(r.oy - 1, itibarKaybi * 0.12);
  r.oy -= oyKaybi;
  S.oy += oyKaybi * 0.4;
  S.kararsiz += oyKaybi * 0.6;
  return oyKaybi;
};

BO.state = BO.newGameState();

BO.clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

// Para gösterimi: 12500 -> "12.500 TL"
BO.tl = function (n) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' TL';
};

// Ayarlanabilir oyun dengesi değerleri — oynanışı değiştirmek için buraya bak.
BO.TUNE = {
  gunSuresi: 70,          // bir günün toplam süresi (kovalamalar dahil), saniye
  yolHizi: 28,            // dağıtım modunda yol akış hızı (px/sn)
  kacisYolHizi: 150,      // kovalama modunda yol akış hızı
  erzakFiyati: 500,       // 10 erzak kaç TL
  erzakPaketi: 10,
  tepki: { memnun: 0.70, domates: 0.20 },   // kalan oran = kızıp kovalar
  memnunOy: 0.06,         // memnun seçmen başına oy oranı artışı
  memnunItibar: 0.6,
  domatesItibar: -2,
  kovalamaAraligi: [18, 30], // rastgele kovalama zamanlayıcısı (sn)
  kacisSuresi: 15,        // kaç saniye dayanınca kurtulursun
  kazaMesafe: 26,         // çarpınca kovalayan ne kadar yaklaşır
  yakalanmaOy: -0.4,
  yakalanmaItibar: -6,
  yakalanmaErzak: 5,
  firlatmaSuresi: 300,    // hediyenin havada kalma süresi (ms)
  secmenAraligi: [0.45, 0.95], // yeni seçmen gelme aralığı (sn)
};

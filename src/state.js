// Oyunun kalıcı durumu (günler arasında korunur).
window.BO = window.BO || {};

BO.newGameState = function () {
  return {
    gun: 1,          // kampanya günü (1..60)
    kasa: 10000,     // TL
    itibar: 50,      // 0..100
    oy: 12.0,        // oy oranı %
    erzak: 30,       // fırlatılabilir hediye sayısı
  };
};

BO.state = BO.newGameState();

BO.clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

// Para gösterimi: 12500 -> "12.500 TL"
BO.tl = function (n) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' TL';
};

// Ayarlanabilir oyun dengesi değerleri — oynanışı değiştirmek için buraya bak.
BO.TUNE = {
  gunSuresi: 60,          // gündüz bölümü kaç saniye
  yolHizi: 22,            // dağıtım modunda yol akış hızı (px/sn)
  kacisYolHizi: 150,      // kovalama modunda yol akış hızı
  erzakFiyati: 500,       // 10 erzak kaç TL
  erzakPaketi: 10,
  tepki: { memnun: 0.70, domates: 0.20 },   // kalan oran = kızıp kovalar
  memnunOy: 0.06,         // memnun seçmen başına oy oranı artışı
  memnunItibar: 0.6,
  domatesItibar: -2,
  kovalamaAraligi: [16, 30], // rastgele kovalama zamanlayıcısı (sn)
  kacisSuresi: 18,        // kaç saniye dayanınca kurtulursun
  kazaMesafe: 26,         // çarpınca kovalayan ne kadar yaklaşır
  yakalanmaOy: -0.4,
  yakalanmaItibar: -6,
  yakalanmaErzak: 5,
};

// Oyunun kalıcı durumu (günler arasında korunur).
window.BO = window.BO || {};

// ---------- Ayarlar (oyundan bağımsız, cihazda saklanır) ----------
BO.ayar = { ses: true, titresim: true, zorluk: 'normal', yazi: 'normal' };
try { Object.assign(BO.ayar, JSON.parse(localStorage.getItem('bo_ayar') || '{}')); } catch (e) {}
BO.ayarKaydet = function () { try { localStorage.setItem('bo_ayar', JSON.stringify(BO.ayar)); } catch (e) {} };

BO.ZORLUK = {
  kolay: { ad: 'KOLAY', det: 0.7, rakip: 0.7, kaza: 0.7, kasa: 15000 },
  normal: { ad: 'NORMAL', det: 1, rakip: 1, kaza: 1, kasa: 10000 },
  zor: { ad: 'ZOR', det: 1.35, rakip: 1.3, kaza: 1.3, kasa: 7000 },
};
BO.zor = function () { return BO.ZORLUK[BO.ayar.zorluk] || BO.ZORLUK.normal; };

BO.titret = function (ms) {
  if (!BO.ayar.titresim) return;
  try { if (navigator.vibrate) navigator.vibrate(ms || 60); } catch (e) {}
};

// ---------- Dükkân: ekipmanlar ----------
BO.EKIPMAN = [
  { id: 'motor', ad: 'TURBO MOTOR', acik: 'KAÇIŞ KOLAY', fiyat: [3000, 6000, 10000] },
  { id: 'hoparlor', ad: 'DEV HOPARLÖR', acik: 'ÇOK SEÇMEN', fiyat: [2500, 5000, 9000] },
  { id: 'baklava', ad: 'BAKLAVA ERZAK', acik: 'MUTLU SEÇMEN', fiyat: [3000, 6000, 10000] },
  { id: 'biyik', ad: 'PRO TAKMA BIYIK', acik: 'GİZLİLİK +', fiyat: [2500, 5000, 9000] },
  { id: 'ayakkabi', ad: 'SPOR AYAKKABI', acik: 'GECE HIZLI', fiyat: [2000, 4000, 7000] },
];
BO.seviye = function (id) { return (BO.state.ekipman && BO.state.ekipman[id]) || 0; };

// ---------- Görevler (günler ilerledikçe açılır) ----------
BO.GOREVLER = {
  gunduz: [
    { id: 'Day', ad: 'SEÇİM OTOBÜSÜ', kisa: 'SEÇİM OTOBÜSÜ', acik: 'ERZAK DAĞIT, KAÇ!', gun: 1 },
    { id: 'Rally', ad: 'MİTİNG', kisa: 'MİTİNG', acik: 'SLOGAN AT, COŞTUR!', gun: 3 },
  ],
  gece: [
    { id: 'Night', ad: 'GİZLİ OPERASYON', kisa: 'GİZLİ OPERASYON', acik: 'GAZETE VE RAKİP', gun: 1 },
    { id: 'Poster', ad: 'AFİŞ BASKINI', kisa: 'AFİŞ BASKINI', acik: 'AFİŞE BIYIK ÇİZ!', gun: 4 },
  ],
};

BO.ADLAR = ['HASAN BEY', 'FADİME ABLA', 'KAZIM AĞA', 'NURAN HANIM', 'CEVDET USTA', 'HAYRİYE TEYZE', 'RAMİZ DAYI', 'ŞÜKRÜ BEY', 'ZEKİYE HANIM', 'İSMAİL ABİ'];
BO.kisaAd = function () {
  const ad = (BO.state && BO.state.adayAd) || 'BİZ';
  return ad.split(' ')[0].slice(0, 8);
};

BO.newGameState = function () {
  return {
    adayAd: 'ADAY',  // oyuncunun seçtiği aday adı
    ekipman: {},     // dükkândan alınanlar: { motor: 1, ... }
    gun: 1,          // kampanya günü (1..60)
    kasa: BO.zor().kasa, // TL
    itibar: 50,      // 0..100
    oy: 12.0,        // oy oranı %
    erzak: 30,       // fırlatılabilir hediye sayısı
    faz: 'sabah',    // sabah: gündüze çıkılabilir, aksam: geceye çıkılabilir
    rakipler: BO.RIVALS.map((r) => ({ id: r.id, oy: r.oy, itibar: r.itibar })),
    kararsiz: 18,    // kararsız seçmen %
    ozel: {},        // gösterilmiş özel günler (anket/münazara)
    olayGun: 0,      // en son rastgele olay hangi gün soruldu
    sonAnket: null,  // bir önceki anketin sonuçları (karşılaştırma için)
    fonGun: 0,       // dış güç fonu en son hangi gün alındı
    fonRisk: false,  // fon bu gece ortaya çıkabilir mi
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
  gunSuresi: 40,          // otobüs görevinin toplam süresi (kovalamalar dahil), saniye
  yolHizi: 28,            // dağıtım modunda yol akış hızı (px/sn)
  kacisYolHizi: 150,      // kovalama modunda yol akış hızı
  erzakFiyati: 500,       // 10 erzak kaç TL
  erzakPaketi: 10,
  tepki: { memnun: 0.70, domates: 0.20 },   // itibar 50'deki oranlar; itibar arttıkça memnun artar
  memnunOy: 0.06,         // memnun seçmen başına oy oranı artışı
  memnunItibar: 0.6,
  domatesItibar: -2,
  kovalamaAraligi: [8, 14], // rastgele kovalama zamanlayıcısı (sn)
  kacisSuresi: 12,        // kaç saniye dayanınca kurtulursun
  kazaMesafe: 26,         // çarpınca kovalayan ne kadar yaklaşır
  yakalanmaOy: -0.4,
  yakalanmaItibar: -6,
  yakalanmaErzak: 5,
  firlatmaSuresi: 300,    // hediyenin havada kalma süresi (ms)
  secmenAraligi: [0.45, 0.95], // yeni seçmen gelme aralığı (sn)
};

// Oyun içeriği: rakip partiler, laf sokma cümleleri, gece haritası, manşetler.
// Yazıları değiştirmek için kod bilmeye gerek yok — sadece tırnak içindekileri düzenle.
window.BO = window.BO || {};

// ---------- Rakipler (hayali, parodi) ----------
// renk: PAL harfi. zaaf: en çok neye sinirlenir.
BO.RIVALS = [
  { id: 'vedat', ad: 'VAATÇİ VEDAT', kisa: 'VEDAT', parti: 'BOL VAAT PARTİSİ', renk: 'b', oy: 30, itibar: 60, zaaf: 'vaat' },
  { id: 'selin', ad: 'SELFİ SELİN', kisa: 'SELİN', parti: 'IŞILTI PARTİSİ', renk: 'r', oy: 22, itibar: 60, zaaf: 'goruntu' },
  { id: 'ulvi', ad: 'UYKUCU ULVİ', kisa: 'ULVİ', parti: 'YARIN PARTİSİ', renk: 'g', oy: 18, itibar: 60, zaaf: 'tembel' },
];
BO.BIZ = { kisa: 'BİZ', parti: 'BİZİM PARTİ', renk: 'o' };

// ---------- Laf sokma cümleleri ----------
// Her satır en fazla ~19 harf olsun (ekrana sığsın). \n = alt satır.
BO.LAFLAR = {
  vaat: ['METRO SÖZÜN NERDE?', 'VAATLERİN\nBUHAR OLDU!', 'SÖZ VERDİN,\nUNUTTUN!', 'BEDAVA ÇAY\nNE OLDU?'],
  goruntu: ['SAÇIN PERUK MU?', 'FİLTRESİZ\nTANIYAMADIM!', 'SELFİ ÇUBUĞUN\nKIRIK!', 'O RUJ HİÇ\nOLMAMIŞ!'],
  tembel: ['MİTİNGDE UYUDUN!', 'SAAT KAÇTA\nKALKTIN?', 'ESNEYEN BAŞKAN\nOLUR MU?', 'PİJAMAYLA MI\nGELDİN?'],
  genel: ['KRAVATIN ÇOK\nÇİRKİN!', 'ANNEM SANA\nOY VERMEZ!', 'SESİN ÇOK\nCIRTLAK!', 'AYAKKABIN\nTERS!'],
};
BO.LAF_ETKI = { zaaf: 45, genel: 25, diger: 10 }; // sinir barına eklenen puan
BO.RAKIP_TEPKI = {
  yuksek: ['NE DEDİN SEN?!', 'SEN KİMSİN YA!', 'HADİ ORADAN!!'],
  orta: ['HIH! ÇOK KOMİK.', 'BANA MI DEDİN?', 'DİKKAT ET...'],
  dusuk: ['HAHA, GÜZEL\nDENEME.', 'BENİ BUNLA MI\nKIZDIRACAKSIN?', 'ESNEDİM...'],
  giris: ['KİMSİN SEN?\nNE İSTİYORSUN?', 'İMZA MI\nİSTİYORSUN?', 'GECE GECE\nNE İŞİN VAR?'],
};

// ---------- Gece haritası ----------
// 15 sütun x 33 satır, her kare 12 piksel.
// . sokak   # bina   b çalı (saklanılır)   c çöp konteyneri (saklanılır)
// L sokak lambası   D gazete kapısı
BO.NIGHT_MAP = [
  '...............',
  '..L.....L....L.',
  '..####...####..',
  '..####...####..',
  '..####...####..',
  '..####...##D#..',
  '...............',
  '.L....L......L.',
  '..##bb...####..',
  '..#bbb..c####..',
  '..##bb...####..',
  '..####...####..',
  '...............',
  '....L.....L....',
  '..####...#bb#..',
  '..####...#bb#..',
  '..####.c.####..',
  '..####...####..',
  '...............',
  '..L.....L....L.',
  '..###b...####..',
  '..##bb...####..',
  '..####...####..',
  '..####.c.####..',
  '...............',
  '.L.....L.....L.',
  '..####...####..',
  '..####...#bb#..',
  '..####...#bb#..',
  '...............',
  '....L.....L....',
  'c.............c',
  '...............',
];
BO.NIGHT = {
  tile: 12,
  start: [7, 32],               // oyuncunun başladığı kare
  araba: [9, 32],               // bizim park etmiş araba (süs)
  gazeteBlok: [9, 2, 4, 4],     // gazete binası: sütun, satır, genişlik, yükseklik
  kapi: [11, 5],
  polisler: [                   // devriye noktaları (sütun, satır)
    [[0, 7], [14, 7]],
    [[7, 8], [7, 23]],
    [[14, 24], [0, 24]],
  ],
  rakipYolu: [[1, 12], [13, 12], [13, 18], [1, 18]],
  sure: 90,                     // gece kaç saniye
  gazeteFiyat: 2000,
  gazeteEtki: 8,                // rakip itibar kaybı
  skandalItibar: -10,
  skandalOy: -0.6,
};

// ---------- Manşetler ----------
BO.MANSET = {
  gazete: {
    vedat: ["VEDAT'IN VAATLERİ\nKEDİSİNİ BİLE\nİKNA ETMEDİ!", 'VEDAT METRO\nSÖZÜNÜ UNUTTU\nİDDİASI!'],
    selin: ["SELİN'İN\nSELFİLERİNDE\nFİLTRE SKANDALI!", 'SELİN AYNAYA\nBAKMAKTAN\nMİTİNGİ KAÇIRDI!'],
    ulvi: ['ULVİ MİTİNGDE\nUYUYAKALDI\nİDDİASI!', 'ULVİ KAHVALTIYA\nAKŞAM YEDİDE\nKALKIYOR!'],
  },
  video: ['{AD} KAMERAYA\nKÜPLERE BİNDİ!', '{AD} SİNİR\nKRİZİ GEÇİRDİ,\nVİDEO OLAY OLDU!', '{AD} GECE\nYARISI BAĞIRDI,\nTÜRKİYE İZLEDİ!'],
  skandal: ['TAKMA BIYIK\nSKANDALI!', 'KILIK DEĞİŞTİREN\nADAY YAKALANDI!'],
  sakin: ['GECE SAKİN\nGEÇTİ...', 'ŞEHİR UYUDU,\nKAMPANYA\nDİNLENDİ.'],
};

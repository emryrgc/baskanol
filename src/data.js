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

// ---------- Rastgele olaylar (sabahları ana sayfada çıkar) ----------
// etki: kasa, itibar, oy, erzak. Eksi kasa = para harcar.
BO.OLAYLAR = [
  { baslik: 'OTOBÜS BOZULDU!', metin: 'TAMİRCİ PAHALI\nAMA ÇABUK.',
    secenek: [
      { label: 'TAMİR ETTİR\n1.500 TL', etki: { kasa: -1500 }, sonuc: 'OTOBÜS\nPIRIL PIRIL!' },
      { label: 'İTEREK GİT', etki: { itibar: -3, erzak: -5 }, sonuc: 'HERKES GÜLDÜ,\nERZAK DÖKÜLDÜ.' },
    ] },
  { baslik: 'YALAN HABER!', metin: 'RAKİP GAZETE\nHAKKINDA\nUYDURMA YAZDI.',
    secenek: [
      { label: 'YALANLA\n1.000 TL', etki: { kasa: -1000, itibar: -1 }, sonuc: 'ÇOĞU KİŞİ\nİNANMADI.' },
      { label: 'SUS', etki: { itibar: -5 }, sonuc: 'SUSKUNLUK\nİKRARDAN\nGELDİ...' },
    ] },
  { baslik: 'ESNAF BAĞIŞI', metin: 'KÖŞE BAKKALI\nBAĞIŞ YAPMAK\nİSTİYOR.',
    secenek: [
      { label: 'KABUL ET', etki: { kasa: 3000, itibar: -2 }, sonuc: 'KASA DOLDU,\nBİRAZ DEDİKODU\nÇIKTI.' },
      { label: 'REDDET', etki: { itibar: 3 }, sonuc: 'DÜRÜST ADAY\nDEDİLER!' },
    ] },
  { baslik: 'CAPS VİRAL OLDU', metin: 'BOMBOŞ BAKAN\nFOTOĞRAFIN\nHER YERDE!',
    secenek: [
      { label: 'SEN DE PAYLAŞ', etki: { oy: 0.4 }, sonuc: 'ESPRİLİ ADAY\nDEDİLER!' },
      { label: 'SİLDİRMEYE\nÇALIŞ', etki: { itibar: -2 }, sonuc: 'DAHA ÇOK\nYAYILDI...' },
    ] },
  { baslik: 'DÜĞÜN DAVETİ', metin: 'MAHALLEDE\nBÜYÜK DÜĞÜN!',
    secenek: [
      { label: 'GİT, TAKI TAK\n500 TL', etki: { kasa: -500, oy: 0.4, itibar: 2 }, sonuc: 'HALAYI SEN\nÇEKTİN!' },
      { label: 'GİTME', etki: { itibar: -1 }, sonuc: 'TEYZELER\nKÜSTÜ.' },
    ] },
  { baslik: 'KEDİ AĞAÇTA!', metin: 'MAHALLENİN\nKEDİSİ AĞAÇTA\nMAHSUR KALDI.',
    secenek: [
      { label: 'KURTAR!', etki: { itibar: 3, oy: 0.2 }, sonuc: 'KAHRAMAN\nADAY!' },
      { label: 'İTFAİYEYİ ARA', etki: {}, sonuc: 'KEDİ KURTULDU.\nKİMSE FARK\nETMEDİ.' },
    ] },
  { baslik: 'SİMİTÇİ ZAMMI', metin: 'SİMİT FİYATI\nARTTI!',
    secenek: [
      { label: 'STOK YAP\n1.000 TL', etki: { kasa: -1000, erzak: 20 }, sonuc: '+20 ERZAK!' },
      { label: 'BEKLE', etki: {}, sonuc: 'BAKARIZ...' },
    ] },
  { baslik: 'TV DAVETİ', metin: 'SABAH\nPROGRAMINA\nÇAĞIRDILAR.',
    secenek: [
      { label: 'GİT, YEMEK YAP', etki: { oy: 0.5, itibar: 1 }, sonuc: 'MENEMEN\nREKOR KIRDI!' },
      { label: 'GİT, ŞARKI\nSÖYLE', etki: { oy: 0.8 }, sonuc: 'ALKIŞ YAĞDI!',
        risk: { etki: { oy: -0.3, itibar: -2 }, sonuc: 'SESİN ÇATLADI,\nYUHALANDIN!' } },
    ] },
];

// ---------- TV münazarası (30. gün) ----------
// tip: ciddi / populist / saldirgan. iyi: seyircinin en çok sevdiği tip.
BO.MUNAZARA = [
  { soru: 'EKONOMİ NASIL\nDÜZELECEK?', iyi: 'populist', cevap: {
    ciddi: 'ÜRETİMİ\nARTIRACAĞIZ.', populist: 'HERKESE\nBEDAVA ÇAY!', saldirgan: 'RAKİBİM ZAMMI\nÇOK SEVER!' } },
  { soru: 'TRAFİK SORUNU\nNE OLACAK?', iyi: 'ciddi', cevap: {
    ciddi: 'METRO VE\nOTOBÜS HATTI.', populist: 'HERKESE UÇAN\nARABA!', saldirgan: 'RAKİBİM\nKORNAYA BASAR!' } },
  { soru: 'GENÇLER İÇİN\nNE YAPACAKSINIZ?', iyi: 'populist', cevap: {
    ciddi: 'BURS VE İŞ\nİMKANI.', populist: 'HER SOKAĞA\nBEDAVA İNTERNET!', saldirgan: 'RAKİBİM GENÇLERİ\nANLAMAZ!' } },
  { soru: 'RAKİBİNİZE\nSÖZÜNÜZ VAR MI?', iyi: 'saldirgan', cevap: {
    ciddi: 'KENDİSİNE\nBAŞARILAR!', populist: 'ONA DA ÇAY\nISMARLARIM!', saldirgan: 'EVİNE GİTSİN,\nDİNLENSİN!' } },
  { soru: 'SOKAK\nHAYVANLARI?', iyi: 'populist', cevap: {
    ciddi: 'BARINAK\nYAPACAĞIZ.', populist: 'HER KEDİYE\nMAMA KARTI!', saldirgan: 'RAKİBİM\nKEDİDEN KORKAR!' } },
  { soru: 'NEDEN SİZE OY\nVERMELİYİZ?', iyi: 'ciddi', cevap: {
    ciddi: 'ÇÜNKÜ ÇOK\nÇALIŞACAĞIM.', populist: 'SEÇİM GÜNÜ\nSİMİT BEDAVA!', saldirgan: 'ONLAR DAHA\nKÖTÜ DE ONDAN!' } },
];
BO.MUNAZARA_RAKIP = ['BEN DAHA İYİSİNİ\nSÖYLERDİM!', 'BU KONUDA DA\nVAADİM VAR!', 'ŞEY... EVET.\nAYNEN.', 'SORUYU\nDUYAMADIM?', 'BENİM DE BİR\nKUZENİM VAR!'];

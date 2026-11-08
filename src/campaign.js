// 60 günlük kampanya mantığı: gün geçişi, atlama, rakip hamleleri, özel günler, seçim, kayıt.
window.BO = window.BO || {};

BO.SON_GUN = 60;
BO.ANKET_GUNLERI = [10, 20, 40, 50];
BO.MUNAZARA_GUNU = 30;

// O gün özel bir gün mü? (anket / münazara / seçim)
BO.ozelGun = function (gun) {
  if (gun >= BO.SON_GUN) return 'secim';
  if (gun === BO.MUNAZARA_GUNU) return 'munazara';
  if (BO.ANKET_GUNLERI.includes(gun)) return 'anket';
  return null;
};

BO.siradakiOzel = function (gun) {
  for (let g = gun; g <= BO.SON_GUN; g++) {
    const t = BO.ozelGun(g);
    if (t) return { gun: g, tip: t };
  }
  return null;
};

// Her gece yarısı çalışır: rakipler hamle yapar, pasif bağış gelir, gün ilerler.
BO.yeniGun = function () {
  const S = BO.state, log = [];
  const pick = (a) => a[Math.floor(Math.random() * a.length)];

  S.rakipler.forEach((r) => {
    r.itibar = BO.clamp(r.itibar + (60 - r.itibar) * 0.06, 0, 100);   // rakip itibarı yavaşça toparlanır
    const g = S.kararsiz * 0.012 * (r.itibar / 60);                     // kararsızları toplar
    r.oy += g; S.kararsiz -= g;
  });

  const r = Math.random();
  if (r < 0.15) {
    const k = pick(BO.RIVALS);
    S.itibar = BO.clamp(S.itibar - 2, 0, 100);
    log.push({ yazi: k.kisa + ' SENİ ELEŞTİRDİ', etki: 'İTİBAR -2', renk: 'r' });
  } else if (r < 0.25) {
    const [a, b] = Phaser.Utils.Array.Shuffle(BO.RIVALS.slice());
    BO.rakibeDarbe(b.id, 4);
    log.push({ yazi: a.kisa + ' İLE ' + b.kisa + ' KAVGA ETTİ', etki: b.kisa + ' -4', renk: 'l' });
  }

  if (S.itibar >= 50) {
    const bagis = Math.round(S.itibar * 4 / 50) * 50;
    S.kasa += bagis;
  }

  S.gun++;
  S.faz = 'sabah';
  BO.normalizeOy();
  BO.save();
  return log;
};

// Oynanmadan geçen gün: kampanya ekibi idare eder, küçük kazanç
BO.otomatikGun = function () {
  const S = BO.state;
  const gun = S.gun;
  const oyD = (S.itibar - 45) * 0.008 + (Math.random() - 0.5) * 0.2;
  S.oy = Math.max(0, S.oy + oyD);
  const para = Math.round(S.itibar * 8 / 50) * 50;
  S.kasa += para;
  const olaylar = BO.yeniGun();
  return { gun, oyD, para, olaylar };
};

// Seçim sonucu: kararsızlar itibara göre dağılır
BO.secimSonucu = function () {
  const S = BO.state;
  const partiler = [{ id: 'biz', ad: 'BİZ', renk: 'o', oy: S.oy, itibar: S.itibar }]
    .concat(BO.RIVALS.map((r) => {
      const st = BO.rakip(r.id);
      return { id: r.id, ad: r.kisa, renk: r.renk, oy: st.oy, itibar: st.itibar };
    }));
  const w = partiler.map((p) => Math.pow(Math.max(5, p.itibar), 2));
  const tw = w.reduce((a, b) => a + b, 0);
  partiler.forEach((p, i) => { p.son = p.oy + S.kararsiz * w[i] / tw + (Math.random() - 0.5); });
  const top = partiler.reduce((a, p) => a + p.son, 0);
  partiler.forEach((p) => { p.son = p.son * 100 / top; });
  return partiler.sort((a, b) => b.son - a.son);
};

// ---------- Kayıt ----------
BO.save = function () {
  try { localStorage.setItem('bo_kayit', JSON.stringify(BO.state)); } catch (e) {}
};
BO.load = function () {
  try {
    const raw = localStorage.getItem('bo_kayit');
    if (!raw) return null;
    const s = JSON.parse(raw);
    return Object.assign(BO.newGameState(), s);
  } catch (e) { return null; }
};
BO.clearSave = function () {
  try { localStorage.removeItem('bo_kayit'); } catch (e) {}
};

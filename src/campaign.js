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

  // İTİBARIN ETKİSİ: yüksek itibar her gün kararsızları sana çeker, düşük itibar oy kaçırır
  const itibarOy = (S.itibar - 50) * 0.012 + S.kararsiz * 0.012 * (S.itibar / 60);
  S.oy = Math.max(0, S.oy + itibarOy);
  S.kararsiz = Math.max(0, S.kararsiz - Math.max(0, itibarOy));
  log.push({ tip: 'itibar', yazi: 'İTİBARDAN GELEN OY', etki: (itibarOy >= 0 ? '+' : '') + itibarOy.toFixed(1), renk: itibarOy >= 0 ? 'l' : 'r' });

  // Dış güç fonu ortaya çıkabilir
  if (S.fonRisk) {
    S.fonRisk = false;
    if (Math.random() < 0.35) {
      S.itibar = BO.clamp(S.itibar - 6, 0, 100);
      log.push({ yazi: 'DIŞ GÜÇ FONU ORTAYA ÇIKTI!', etki: 'İTİBAR -6', renk: 'r', skandal: true });
    }
  }

  S.rakipler.forEach((r) => {
    r.itibar = BO.clamp(r.itibar + (60 - r.itibar) * 0.06, 0, 100);   // rakip itibarı yavaşça toparlanır
    const g = S.kararsiz * 0.012 * (r.itibar / 60) * BO.zor().rakip;                     // kararsızları toplar
    r.oy += g; S.kararsiz -= g;
  });

  // RAKİP GECE OPERASYONU: seçime yaklaştıkça ve sen yükseldikçe sana daha çok saldırırlar
  const sira = BO.siram();
  const saldiri = (0.25 + S.gun * 0.003 + (sira <= 2 ? 0.15 : 0)) * BO.zor().rakip;
  if (Math.random() < saldiri) {
    const k = pick(BO.RIVALS);
    const op = pick(BO.RAKIP_OPS[k.id]);
    if (S.itibar >= 70 && Math.random() < 0.4) {
      log.push({ yazi: op.yazi, etki: 'KİMSE İNANMADI', renk: 'l', rakipOp: true });
    } else {
      const e = op.etki;
      if (e.itibar) S.itibar = BO.clamp(S.itibar + e.itibar, 0, 100);
      if (e.oy) S.oy = Math.max(0, S.oy + e.oy);
      if (e.erzak) S.erzak = Math.max(0, S.erzak + e.erzak);
      if (e.kasa) S.kasa = Math.max(0, S.kasa + e.kasa);
      log.push({ yazi: op.yazi, etki: BO.etkiYazi(e), renk: 'r', rakipOp: true });
    }
  }
  // rakipler bazen birbirleriyle kavga eder
  if (Math.random() < 0.12) {
    const [a, b] = Phaser.Utils.Array.Shuffle(BO.RIVALS.slice());
    BO.rakibeDarbe(b.id, 4);
    log.push({ yazi: a.kisa + ' İLE ' + b.kisa + ' KAVGA ETTİ', etki: b.kisa + ' -4', renk: 'l' });
  }
  // son dakika bandı için sakla
  S.sonHaberler = log.filter((o) => o.tip !== 'itibar').map((o) => o.yazi + (o.etki === 'KİMSE İNANMADI' ? ' AMA KİMSE İNANMADI' : ''));

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

// Bizim sıramız (1 = birinci)
BO.siram = function () {
  const S = BO.state;
  return 1 + S.rakipler.filter((r) => r.oy > S.oy).length;
};

// Etki nesnesini kısa yazıya çevirir: { itibar: -2 } -> "İTİBAR -2"
BO.etkiYazi = function (e) {
  const p = [];
  if (e.oy) p.push('OY ' + (e.oy > 0 ? '+' : '') + e.oy.toFixed(1));
  if (e.itibar) p.push('İTİBAR ' + (e.itibar > 0 ? '+' : '') + e.itibar);
  if (e.erzak) p.push('ERZAK ' + (e.erzak > 0 ? '+' : '') + e.erzak);
  if (e.kasa) p.push((e.kasa > 0 ? '+' : '') + BO.tl(e.kasa));
  if (e.rakip) p.push(BO.rakipBilgi(e.rakip.id).kisa + ' -' + e.rakip.kayip);
  return p.join(' ') || 'ETKİSİ YOK';
};

// Rastgele bir rakip demeci: rakip sana yakınsa seni hedef alır
BO.rakipDemec = function () {
  const S = BO.state;
  const r = Phaser.Utils.Array.GetRandom(BO.RIVALS);
  const st = BO.rakip(r.id);
  const yakin = S.oy >= st.oy - 4 || Math.random() < 0.25;
  const liste = yakin ? BO.DEMEC[r.id].rakip : BO.DEMEC[r.id].genel;
  return r.kisa + ": '" + Phaser.Utils.Array.GetRandom(liste).replace('{AD}', BO.kisaAd()) + "'";
};

// Sadece gündüz atlanır (akşama geçilir): yarım kazanç
BO.gunduzAtla = function () {
  const S = BO.state;
  const oyD = ((S.itibar - 45) * 0.008 + (Math.random() - 0.5) * 0.2) / 2;
  S.oy = Math.max(0, S.oy + oyD);
  const para = Math.round(S.itibar * 4 / 50) * 50;
  S.kasa += para;
  S.faz = 'aksam';
  BO.normalizeOy();
  BO.save();
  return { oyD, para };
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

// Bugünün görevini oyun seçer (oyuncu seçmez). Yeni açılan görev o gün mutlaka gelir,
// yoksa açık görevlerden rastgele biri; mümkünse dünküyle aynı olmaz.
BO.bugunGorev = function (faz) {
  const S = BO.state;
  if (!S.gorevPlan || S.gorevPlan.gun !== S.gun) S.gorevPlan = { gun: S.gun };
  const acik = BO.GOREVLER[faz].filter((g) => S.gun >= g.gun);
  let g = acik.find((x) => x.id === S.gorevPlan[faz]);
  if (!g) {
    const yeni = acik.find((x) => x.gun === S.gun && x.gun > 1);
    const son = (S.sonGorev || {})[faz];
    const secenek = acik.length > 1 ? acik.filter((x) => x.id !== son) : acik;
    g = yeni || Phaser.Utils.Array.GetRandom(secenek);
    S.gorevPlan[faz] = g.id;
    BO.save();
  }
  return g;
};

// Seçim sonucu: kararsızlar itibara göre dağılır
BO.secimSonucu = function () {
  const S = BO.state;
  const partiler = [{ id: 'biz', ad: BO.kisaAd(), renk: 'o', oy: S.oy, itibar: S.itibar }]
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

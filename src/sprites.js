// Kodla çizilen pixel art. Her sprite ya karakter dizisiyle (harf = renk)
// ya da küçük dikdörtgen çizim komutlarıyla tanımlanır.
// İleride gerçek çizimler gelince burası PNG yüklemeye çevrilebilir.
window.BO = window.BO || {};

// Sweetie 16 paleti + ten renkleri
BO.PAL = {
  k: '#1a1c2c', p: '#5d275d', r: '#b13e53', o: '#ef7d57', y: '#ffcd75',
  l: '#a7f070', g: '#38b764', G: '#257179', B: '#29366f', b: '#3b5dc9',
  c: '#41a6f6', t: '#73eff7', w: '#f4f4f4', L: '#94b0c2', n: '#566c86',
  N: '#333c57', e: '#f0b78f', E: '#c0805a', m: '#8b5a3c',
};

BO.LANE_X = [64, 90, 116];   // 3 şeridin orta noktaları
BO.ROAD = { left: 51, right: 129 };
BO.WALK = { left: [24, 46], right: [134, 156] }; // kaldırımda yürünebilir x aralıkları

(function () {
  const P = BO.PAL;

  function fromRows(scene, key, rows, map) {
    const h = rows.length;
    const w = Math.max.apply(null, rows.map(r => r.length));
    const tex = scene.textures.createCanvas(key, w, h);
    const ctx = tex.getContext();
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < rows[y].length; x++) {
        let ch = rows[y][x];
        if (map && map[ch]) ch = map[ch];
        if (ch === '.' || ch === ' ') continue;
        ctx.fillStyle = P[ch] || ch;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    tex.refresh();
  }

  function draw(scene, key, w, h, fn) {
    const tex = scene.textures.createCanvas(key, w, h);
    const ctx = tex.getContext();
    const r = (x, y, ww, hh, c) => { ctx.fillStyle = P[c] || c; ctx.fillRect(x, y, ww, hh); };
    fn(r, ctx);
    tex.refresh();
  }

  // ---------- Karakterler ----------
  const ADAY = [
    '..kkkkkk..',
    '.kkkkkkkk.',
    '.keeeeeek.',
    '.kekeekek.',
    '.keeeeeek.',
    '.kekkkkek.',
    '..keeeek..',
    '.BBwrrwBB.',
    'BBBwrrwBBB',
    'eBBBrrBBBe',
    '.BBBBBBBB.',
    '.BBB..BBB.',
    '.BB....BB.',
    '.kk....kk.',
  ];
  const ADAY_EL = [
    '..kkkkkk..',
    '.kkkkkkkk.',
    '.keeeeeek.',
    '.kekeekek.',
    '.keeeeeek.',
    '.kekkkkek.',
    '..keeeek.e',
    '.BBwrrwBBB',
    'BBBwrrwBB.',
    'eBBBrrBBB.',
    '.BBBBBBBB.',
    '.BBB..BBB.',
    '.BB....BB.',
    '.kk....kk.',
  ];

  // Seçmen: 9x14 piksel (ilk sürümden ~%15 büyük)
  const SECMEN_UST = [
    '..mmmmm..',
    '.mmmmmmm.',
    '.meeeeem.',
    '.ekeeeke.',
    '.eeeeeee.',
    '..eeEee..',
    '.ggggggg.',
    'eggggggge',
    'e.ggggg.e',
    'e.ggggg.e',
  ];
  const SECMEN_A = SECMEN_UST.concat([
    '..NNNNN..',
    '..NN.NN..',
    '..N...N..',
    '.kk...kk.',
  ]);
  const SECMEN_B = SECMEN_UST.concat([
    '..NNNNN..',
    '.NN...NN.',
    '.N.....N.',
    'kk.....kk',
  ]);
  const SECMEN_MUTLU = [
    'e.mmmmm.e',
    'emmmmmmme',
    'emeeeeeme',
    'gekeeekeg',
    'geeeeeeeg',
    '.geEEEeg.',
    '..ggggg..',
    '.ggggggg.',
    '..ggggg..',
    '..ggggg..',
    '..NNNNN..',
    '..NN.NN..',
    '..N...N..',
    '.kk...kk.',
  ];
  const SECMEN_KIZGIN = [
    '..mmmmm..',
    '.mmmmmmm.',
    '.mkrrrkm.',
    '.rkrrrkr.',
    '.rrrrrrr.',
    '..rkkkr..',
    'eggggggge',
    'eggggggg.',
    '..ggggg..',
    '..ggggg..',
    '..NNNNN..',
    '.NN...NN.',
    '.N.....N.',
    'kk.....kk',
  ];

  // ---------- Küçük nesneler ----------
  const SIMIT = ['.oooo.', 'oyooyo', 'oo..oo', 'oo..oo', 'oyooyo', '.oooo.'];
  const MAKARNA = ['bbbbb', 'bwywb', 'byyyb', 'bwywb', 'bbbbb'];
  const CAY = ['GGGGG', 'GgggG', 'GgwgG', 'GgggG', 'GGGGG'];
  const DOMATES = ['..g..', '.rgr.', 'rrwrr', 'rrrrr', '.rrr.'];
  const KALP = ['.r.r.', 'rrrrr', 'rrrrr', '.rrr.', '..r..'];
  const LEKE = ['.r...r.', 'rrr.rr.', '.rrrrrr', 'rrrrrr.', '.rr.rrr', 'r..r...'];
  const ISARET = ['..k..', '.krk.', '.krk.', '.krk.', '..k..', '.krk.', '..k..'];
  const OK_SOL = ['....k....', '...kw....', '..kwwkkkk', '.kwwwwwwk', 'kwwwwwwwk', '.kwwwwwwk', '..kwwkkkk', '...kw....', '....k....'];
  const OK_SAG = OK_SOL.map(r => r.split('').reverse().join(''));

  BO.makeTextures = function (scene) {
    fromRows(scene, 'aday0', ADAY);
    fromRows(scene, 'aday1', ADAY_EL);
    fromRows(scene, 'secmen0', SECMEN_A);
    fromRows(scene, 'secmen1', SECMEN_B);
    fromRows(scene, 'secmen_mutlu', SECMEN_MUTLU);
    fromRows(scene, 'secmen_kizgin', SECMEN_KIZGIN);
    fromRows(scene, 'simit', SIMIT);
    fromRows(scene, 'makarna', MAKARNA);
    fromRows(scene, 'cay', CAY);
    fromRows(scene, 'domates', DOMATES);
    fromRows(scene, 'kalp', KALP);
    fromRows(scene, 'kalp_bos', KALP, { r: 'n' });
    fromRows(scene, 'leke', LEKE);
    fromRows(scene, 'isaret', ISARET);
    fromRows(scene, 'ok_sol', OK_SOL);
    fromRows(scene, 'ok_sag', OK_SAG);

    // Seçim otobüsü (üstten görünüş, üstü açık), 22x44
    draw(scene, 'otobus', 22, 44, (r) => {
      r(1, 0, 20, 44, 'k');
      r(2, 1, 18, 42, 'o');
      r(3, 2, 16, 5, 'c'); r(3, 2, 16, 1, 't');           // ön cam
      r(2, 8, 18, 1, 'y');                                 // şerit
      r(3, 10, 16, 28, 'N'); r(4, 11, 14, 26, 'n');        // açık güverte
      for (let y = 13; y < 35; y += 5) { r(5, y, 3, 2, 'r'); r(14, y, 3, 2, 'r'); } // koltuklar
      r(2, 39, 18, 1, 'y');
      r(3, 41, 16, 1, 'r');                                // arka stop
      r(0, 5, 1, 7, 'k'); r(21, 5, 1, 7, 'k');             // tekerler
      r(0, 31, 1, 7, 'k'); r(21, 31, 1, 7, 'k');
      r(0, 3, 1, 1, 'L'); r(21, 3, 1, 1, 'L');             // aynalar
      r(10, 38, 2, 5, 'w');                                // bayrak direği gölgesi
    });

    // Kovalayan kamyonet (kızgın seçmenler kasada), 22x34
    draw(scene, 'kamyonet', 22, 34, (r) => {
      r(1, 0, 20, 34, 'k');
      r(2, 1, 18, 32, 'p');
      r(3, 2, 16, 4, 'c'); r(3, 2, 16, 1, 't');
      r(3, 7, 16, 6, 'r');                                 // kabin tavanı
      r(3, 15, 16, 16, 'N');                               // kasa
      r(0, 4, 1, 6, 'k'); r(21, 4, 1, 6, 'k');
      r(0, 24, 1, 6, 'k'); r(21, 24, 1, 6, 'k');
      r(2, 1, 2, 1, 'y'); r(18, 1, 2, 1, 'y');             // farlar
    });

    // Trafik arabaları, 16x28, farklı renkler
    const arabaRenk = { araba_mavi: 'b', araba_sari: 'y', araba_yesil: 'g', araba_beyaz: 'L', araba_kirmizi: 'r' };
    Object.keys(arabaRenk).forEach((key) => {
      const c = arabaRenk[key];
      draw(scene, key, 16, 28, (r) => {
        r(1, 0, 14, 28, 'k');
        r(2, 1, 12, 26, c);
        r(3, 6, 10, 4, 'N'); r(3, 6, 10, 1, 'n');          // ön cam
        r(3, 11, 10, 9, c);                                // tavan
        r(4, 12, 8, 1, 'w');                               // parlama
        r(3, 21, 10, 3, 'N');                              // arka cam
        r(0, 4, 1, 5, 'k'); r(15, 4, 1, 5, 'k');
        r(0, 19, 1, 5, 'k'); r(15, 19, 1, 5, 'k');
        r(2, 26, 2, 1, 'r'); r(12, 26, 2, 1, 'r');         // stop lambası
        r(2, 1, 2, 1, 'y'); r(12, 1, 2, 1, 'y');           // farlar
      });
    });

    // Dolmuş (uzun sarı minibüs), 18x36
    draw(scene, 'dolmus', 18, 36, (r) => {
      r(1, 0, 16, 36, 'k');
      r(2, 1, 14, 34, 'y');
      r(3, 3, 12, 4, 'N');
      r(3, 9, 12, 22, 'y'); r(3, 9, 12, 1, 'w');
      r(7, 17, 4, 3, 'k');                                 // tavan tabelası
      r(0, 5, 1, 6, 'k'); r(17, 5, 1, 6, 'k');
      r(0, 26, 1, 6, 'k'); r(17, 26, 1, 6, 'k');
    });

    // Parti bayrağı (otobüs üstünde dalgalanır), 8x6
    draw(scene, 'bayrak', 9, 7, (r) => {
      r(0, 0, 1, 7, 'k');
      r(1, 0, 8, 5, 'o'); r(3, 1, 3, 3, 'y');
    });

    // Yol + kaldırım + binalar (dikey döşenebilir), 180x96
    draw(scene, 'yol', 180, 96, (r) => {
      const binaRenk = [['p', 'r'], ['G', 'g'], ['B', 'b'], ['m', 'o']];
      for (let i = 0; i < 2; i++) {
        const y0 = i * 48;
        const [s1, s2] = binaRenk[i];
        const [s3, s4] = binaRenk[i + 2];
        // sol bina
        r(0, y0, 20, 48, s1); r(18, y0, 2, 48, 'k');
        r(0, y0, 20, 1, 'k');
        for (let wy = y0 + 5; wy < y0 + 44; wy += 9) { r(4, wy, 4, 5, 'y'); r(11, wy, 4, 5, s2); }
        // sağ bina
        r(160, y0, 20, 48, s3); r(160, y0, 2, 48, 'k');
        r(160, y0, 20, 1, 'k');
        for (let wy = y0 + 5; wy < y0 + 44; wy += 9) { r(165, wy, 4, 5, s4); r(172, wy, 4, 5, 'y'); }
      }
      // kaldırımlar
      r(20, 0, 30, 96, 'L'); r(130, 0, 30, 96, 'L');
      for (let y = 0; y < 96; y += 12) { r(20, y, 30, 1, 'n'); r(130, y, 30, 1, 'n'); }
      r(35, 0, 1, 96, 'n'); r(145, 0, 1, 96, 'n');
      // ağaçlar
      [[24, 20], [24, 68], [151, 44], [151, 92]].forEach(([x, y]) => {
        const yy = y % 96;
        r(x, yy - 3, 6, 7, 'G'); r(x + 1, yy - 4, 4, 9, 'G'); r(x + 1, yy - 2, 3, 3, 'g');
      });
      // bordür
      r(50, 0, 1, 96, 'w'); r(129, 0, 1, 96, 'w');
      // asfalt
      r(51, 0, 78, 96, 'N');
      for (let y = 0; y < 96; y += 16) { r(76, y, 2, 8, 'L'); r(102, y, 2, 8, 'L'); }
      // asfalt dokusu
      for (let i = 0; i < 40; i++) {
        const x = 52 + ((i * 37) % 76), y = (i * 53) % 96;
        r(x, y, 1, 1, 'k');
      }
    });

    // Tek piksel beyaz (UI kutuları için)
    draw(scene, 'px', 1, 1, (r) => r(0, 0, 1, 1, 'w'));

    // Animasyonlar
    scene.anims.create({ key: 'yuru', frames: [{ key: 'secmen0' }, { key: 'secmen1' }], frameRate: 4, repeat: -1 });
    scene.anims.create({ key: 'el_salla', frames: [{ key: 'aday0' }, { key: 'aday1' }], frameRate: 3, repeat: -1 });
  };
})();

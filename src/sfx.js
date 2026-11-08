// Kodla üretilen retro ses efektleri (WebAudio). Dosya gerekmez.
window.BO = window.BO || {};

BO.sfx = (function () {
  let ctx = null;
  let muted = false;
  try { muted = localStorage.getItem('bo_muted') === '1'; } catch (e) {}

  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur, opts) {
    if (muted) return;
    const c = ac(); if (!c) return;
    opts = opts || {};
    const t = c.currentTime + (opts.delay || 0);
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = opts.type || 'square';
    o.frequency.setValueAtTime(freq, t);
    if (opts.to) o.frequency.exponentialRampToValueAtTime(opts.to, t + dur);
    const v = opts.vol == null ? 0.08 : opts.vol;
    g.gain.setValueAtTime(v, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination);
    o.start(t); o.stop(t + dur + 0.02);
  }

  function noise(dur, opts) {
    if (muted) return;
    const c = ac(); if (!c) return;
    opts = opts || {};
    const t = c.currentTime + (opts.delay || 0);
    const len = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = c.createBufferSource();
    src.buffer = buf;
    const f = c.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = opts.freq || 1200;
    const g = c.createGain(); g.gain.value = opts.vol || 0.15;
    src.connect(f).connect(g).connect(c.destination);
    src.start(t);
  }

  return {
    unlock: ac,
    isMuted: () => muted,
    toggle() {
      muted = !muted;
      try { localStorage.setItem('bo_muted', muted ? '1' : '0'); } catch (e) {}
      return muted;
    },
    throw: () => tone(500, 0.12, { to: 900, vol: 0.05 }),
    happy: () => { tone(880, 0.08); tone(1320, 0.12, { delay: 0.08 }); },
    splat: () => noise(0.18, { freq: 900, vol: 0.2 }),
    angry: () => { tone(220, 0.15, { type: 'sawtooth', vol: 0.07 }); tone(180, 0.2, { type: 'sawtooth', vol: 0.07, delay: 0.12 }); },
    alarm: () => { for (let i = 0; i < 4; i++) tone(i % 2 ? 960 : 700, 0.18, { type: 'square', vol: 0.06, delay: i * 0.2 }); },
    lane: () => tone(300, 0.05, { to: 420, vol: 0.04 }),
    crash: () => { noise(0.35, { freq: 600, vol: 0.3 }); tone(120, 0.3, { to: 50, vol: 0.1 }); },
    coin: () => { tone(1200, 0.06, { vol: 0.05 }); tone(1600, 0.1, { vol: 0.05, delay: 0.06 }); },
    win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.14, { delay: i * 0.1, vol: 0.06 })),
    lose: () => [400, 340, 280, 200].forEach((f, i) => tone(f, 0.18, { delay: i * 0.13, vol: 0.06, type: 'triangle' })),
    click: () => tone(660, 0.05, { vol: 0.05 }),
  };
})();

/* Free-floating dotted particles. Ignores the mouse. Always visible (above cards, below nothing). */
(function () {
  if (document.getElementById('bgParticles')) return;
  const st = document.createElement('style');
  st.textContent = '#bgParticles{position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;' +
    'z-index:2147483000!important;pointer-events:none!important;display:block!important;opacity:1!important;visibility:visible!important}';
  document.head.appendChild(st);

  const c = document.createElement('canvas');
  c.id = 'bgParticles';
  // attach to <html> (not <body>) so no parent stacking-context / overflow / transform can hide it
  document.documentElement.appendChild(c);
  const ctx = c.getContext('2d');
  let W = 0, H = 0, dots = [];

  const PALETTE = {
    dark:  ['52,211,153', '96,165,250', '203,213,225'],
    light: ['5,150,105', '37,99,235', '71,85,105']
  };
  const theme = () => document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';

  function build() {
    const d = window.devicePixelRatio || 1;
    W = c.width = Math.round(innerWidth * d); H = c.height = Math.round(innerHeight * d);
    const n = Math.max(40, Math.min(120, Math.round(innerWidth * innerHeight / 14000)));
    dots = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .5 * d, vy: (Math.random() - .5) * .5 * d,
      r: (Math.random() * 1.8 + 1.1) * d,
      k: (Math.random() * 3) | 0,
      a: Math.random() * .4 + .45
    }));
  }
  function tick() {
    ctx.clearRect(0, 0, W, H);
    const pal = PALETTE[theme()];
    for (const p of dots) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < -6) p.x = W + 6; else if (p.x > W + 6) p.x = -6;
      if (p.y < -6) p.y = H + 6; else if (p.y > H + 6) p.y = -6;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283);
      ctx.fillStyle = `rgba(${pal[p.k]},${p.a})`; ctx.fill();
    }
    requestAnimationFrame(tick);
  }
  let t; addEventListener('resize', () => { clearTimeout(t); t = setTimeout(build, 150); });
  build(); tick();
})();

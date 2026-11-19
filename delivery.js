/* Owner-only Delivery Map: customers share a location at checkout; the farm owner sees every order on a live map.
   Needs Leaflet (loaded in index.html). Orders are stored in localStorage ('agri_orders') together with lat/lng. */
const Delivery = {
  OWNERS: ['admin@agrotech.com'],               // <-- only these accounts can see the Delivery Map. Add your own email here.
  FARM: { lat: 28.8955, lng: 76.6066 },         // <-- your farm location (default: Rohtak, Haryana)
  COLORS: { Placed: '#f59e0b', Packed: '#3b82f6', Out: '#8b5cf6', Delivered: '#10b981' },
  map: null, layer: null, line: null, sel: null, seen: null,

  t: k => window.I18N ? I18N.t(k) : k,
  esc: s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
  isOwner() {
    const u = window.Auth?.currentUser;
    if (!u) return false;
    if (window.Auth?.isAdmin && window.Auth.isAdmin()) return true;
    const email = String(u.email || '').toLowerCase();
    const role = String(u.role || '').toLowerCase();
    return this.OWNERS.includes(email) || role.includes('admin') || role.includes('manager');
  },
  orders() { try { return JSON.parse(localStorage.getItem('agri_orders')) || []; } catch (e) { return []; } },
  saveOrders(o) { localStorage.setItem('agri_orders', JSON.stringify(o)); },
  km(a, b, c, d) { const r = x => x * Math.PI / 180, h = Math.sin(r(c - a) / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(r(d - b) / 2) ** 2; return 12742 * Math.asin(Math.sqrt(h)); },
  tiles() { return L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }); },
  pin(color, emoji) { return L.divIcon({ className: '', iconSize: [34, 34], iconAnchor: [17, 32], html: `<div style="width:34px;height:34px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${color};border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center"><span style="transform:rotate(45deg);font-size:15px">${emoji}</span></div>` }); },

  /* ---------- Customer side: ask for delivery location at checkout ---------- */
  ask(cb) {
    if (!window.Market) return cb({});
    const t = this.t, u = window.Auth?.currentUser || {}, e = this.esc;
    Market.modal(`<div class="auth-body" style="padding:1.2rem">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.7rem"><h3 style="margin:0;font-size:1.1rem">📦 ${t('dl_form')}</h3><button class="icon-btn" data-close="1">✕</button></div>
      <input class="form-control" id="dlName" placeholder="${t('dl_name')}" value="${e(u.full_name || '')}" style="margin-bottom:.45rem">
      <input class="form-control" id="dlPhone" type="tel" placeholder="${t('dl_phone')}" value="${e(u.phone || '')}" style="margin-bottom:.45rem">
      <textarea class="form-control" id="dlAddr" rows="2" placeholder="${t('dl_addr')}" style="margin-bottom:.45rem"></textarea>
      <div style="display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:.4rem"><button class="btn btn-secondary btn-sm" id="dlGeo" type="button">${t('dl_useloc')}</button><button class="btn btn-secondary btn-sm" id="dlFind" type="button">${t('dl_find')}</button></div>
      <div style="font-size:.74rem;color:var(--text-muted);margin-bottom:.3rem">${t('dl_pick')} <b id="dlOk" style="color:#10b981"></b></div>
      <div id="dlPickMap" style="height:210px;border-radius:10px;border:1px solid var(--border-color);margin-bottom:.8rem"></div>
      <button class="btn btn-primary" id="dlGo" style="width:100%;padding:.7rem;font-weight:700">${t('dl_confirm')}</button></div>`);
    const $ = id => document.getElementById(id);
    let pos = null, marker = null, map = null;
    if (window.L) {
      map = L.map('dlPickMap').setView([this.FARM.lat, this.FARM.lng], 11); this.tiles().addTo(map);
      setTimeout(() => map.invalidateSize(), 150);
      map.on('click', ev => set(ev.latlng.lat, ev.latlng.lng));
    } else $('dlPickMap').innerHTML = '<p style="padding:1rem;font-size:.8rem">Map library could not load (check internet).</p>';
    const set = (lat, lng, zoom) => {
      pos = { lat: +lat.toFixed(6), lng: +lng.toFixed(6) };
      if (marker) marker.setLatLng([lat, lng]); else marker = L.marker([lat, lng], { icon: this.pin('#ef4444', '🏠') }).addTo(map);
      map.setView([lat, lng], zoom || Math.max(map.getZoom(), 15)); $('dlOk').textContent = t('dl_saved');
    };
    $('dlGeo').onclick = () => {
      if (!navigator.geolocation) return App.toast(t('dl_locfail'), 'error');
      navigator.geolocation.getCurrentPosition(p => set(p.coords.latitude, p.coords.longitude), () => App.toast(t('dl_locfail'), 'error'), { enableHighAccuracy: true, timeout: 12000 });
    };
    $('dlFind').onclick = async () => {
      const q = $('dlAddr').value.trim(); if (!q) return;
      try { const r = await (await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&q=' + encodeURIComponent(q))).json(); if (r[0]) set(+r[0].lat, +r[0].lon, 16); else App.toast(t('dl_locfail'), 'error'); }
      catch (err) { App.toast(t('dl_locfail'), 'error'); }
    };
    $('dlGo').onclick = () => {
      const d = { name: $('dlName').value.trim(), phone: $('dlPhone').value.trim(), address: $('dlAddr').value.trim() };
      if (!d.name) return window.App?.toast('Please enter your full name.', 'error');
      if (!d.address) return window.App?.toast('Please enter your delivery address.', 'error');
      const finalPos = pos || { lat: this.FARM.lat, lng: this.FARM.lng };
      cb({ ...d, ...finalPos });
    };
  },

  /* ---------- Owner side ---------- */
  groups() {
    const g = {};
    this.orders().forEach(o => { const k = o.batch || o.id; (g[k] = g[k] || { key: k, rows: [], ...o }).rows.push(o); });
    return Object.values(g).sort((a, b) => new Date(b.time) - new Date(a.time));
  },
  statusKey(s) { return s === 'Out for Delivery' ? 'Out' : (s || 'Placed'); },

  setup() {
    const nav = document.querySelector('.nav-tabs'), main = document.querySelector('.main-content');
    if (!nav || !main || document.getElementById('tab-delivery')) return;
    const b = document.createElement('button'); b.className = 'nav-tab-btn'; b.dataset.tab = 'tab-delivery'; b.style.display = 'none';
    b.innerHTML = '<span>🚚</span> Delivery Map'; b.onclick = () => window.App.switchTab('tab-delivery'); nav.appendChild(b);
    const p = document.createElement('section'); p.className = 'tab-pane'; p.id = 'tab-delivery'; main.appendChild(p);
    const st = document.createElement('style');
    st.textContent = `.dl-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:.7rem;margin-bottom:1rem}.dl-stat{background:var(--bg-card);border:1px solid var(--border-color);border-radius:12px;padding:.8rem;text-align:center}.dl-stat b{display:block;font-size:1.4rem;color:var(--primary)}.dl-stat span{font-size:.72rem;color:var(--text-muted)}
      .dl-grid{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(280px,1fr);gap:1rem}@media(max-width:900px){.dl-grid{grid-template-columns:1fr}}
      #dlMap{height:520px;border-radius:14px;border:1px solid var(--border-color);z-index:1}.dl-list{max-height:520px;overflow:auto;display:grid;gap:.6rem;align-content:start}
      .dl-card{background:var(--bg-card);border:1px solid var(--border-color);border-radius:12px;padding:.75rem;cursor:pointer;font-size:.8rem}.dl-card.on{border-color:var(--primary);box-shadow:0 0 0 2px rgba(16,185,129,.25)}.dl-card h4{margin:0 0 .2rem;font-size:.9rem}.dl-card .m{color:var(--text-muted)}
      .dl-row{display:flex;gap:.4rem;align-items:center;justify-content:space-between;margin-top:.5rem;flex-wrap:wrap}.dl-card select{font-size:.75rem;padding:.2rem .3rem}.dl-dot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:.3rem}`;
    document.head.appendChild(st);
    // patch tab switching: refresh map when the tab opens
    const sw = App.switchTab.bind(App);
    App.switchTab = id => { sw(id); if (id === 'tab-delivery') this.show(); };
    // re-check owner access whenever login state changes
    const hdr = Auth.updateHeaderProfile.bind(Auth);
    Auth.updateHeaderProfile = () => { hdr(); this.access(); };
    document.addEventListener('langchange', () => { if (this.isOwner()) this.build(true); });
    setInterval(() => this.poll(), 4000);
    addEventListener('storage', () => this.poll());
    this.access();
  },

  access() {
    const ok = this.isOwner(), b = document.querySelector('.nav-tab-btn[data-tab=tab-delivery]'), p = document.getElementById('tab-delivery');
    if (!b || !p) return;
    b.style.display = ok ? '' : 'none';
    if (!ok) { p.innerHTML = ''; this.map = null; if (App.activeTab === 'tab-delivery') App.switchTab('tab-telemetry'); }
    else { this.seen = this.seen ?? this.groups().length; window.I18N?.apply(); }
  },

  poll() {
    if (!this.isOwner()) return;
    const n = this.groups().length;
    if (this.seen !== null && n > this.seen) App.toast(this.t('dl_new'), 'success');
    if (n !== this.seen) { this.seen = n; if (App.activeTab === 'tab-delivery') this.build(true); }
  },

  show() {
    if (!this.isOwner()) return;
    this.build();
    setTimeout(() => this.map?.invalidateSize(), 60);
    setTimeout(() => this.map?.invalidateSize(), 200);
    setTimeout(() => this.map?.invalidateSize(), 500);
  },

  build(keep) {
    const p = document.getElementById('tab-delivery'), t = this.t, e = this.esc, gs = this.groups();
    if (!p) return;
    if (!window.L) { p.innerHTML = '<p style="padding:2rem">Map library could not load. Check your internet connection and reload.</p>'; return; }
    const pending = gs.filter(g => g.status !== 'Delivered').length, rev = gs.reduce((s, g) => s + g.rows.reduce((a, r) => a + (+r.total || 0), 0), 0);
    if (this.map) { this.map.remove(); this.map = null; }
    p.innerHTML = `<div class="mk-head"><div><h2>🚚 ${t('dl_title')}</h2><p>${t('dl_sub')}</p></div></div>
      <div class="dl-stats"><div class="dl-stat"><b>${gs.length}</b><span>${t('dl_orders')}</span></div><div class="dl-stat"><b>${pending}</b><span>${t('dl_pending')}</span></div><div class="dl-stat"><b>₹${rev}</b><span>${t('dl_rev')}</span></div></div>
      <div class="dl-grid"><div id="dlMap"></div><div class="dl-list">${gs.map(g => this.card(g)).join('') || `<p class="mk-meta" style="padding:1rem">${t('dl_none')}</p>`}</div></div>`;
    const map = this.map = L.map('dlMap').setView([this.FARM.lat, this.FARM.lng], 8); this.tiles().addTo(map);
    L.marker([this.FARM.lat, this.FARM.lng], { icon: this.pin('#10b981', '🏡') }).addTo(map).bindPopup(`<b>${t('dl_farm')}</b>`);
    const pts = [[this.FARM.lat, this.FARM.lng]];
    this.mk = {};
    gs.filter(g => g.lat != null).forEach(g => {
      const sk = this.statusKey(g.status), m = L.marker([g.lat, g.lng], { icon: this.pin(this.COLORS[sk] || '#f59e0b', sk === 'Delivered' ? '✓' : '📦') }).addTo(map);
      m.bindPopup(`<b>${e(g.name || g.buyer)}</b><br>${e(g.address || '')}`); m.on('click', () => this.select(g.key)); this.mk[g.key] = m; pts.push([g.lat, g.lng]);
    });
    if (pts.length > 1) map.fitBounds(pts, { padding: [40, 40], maxZoom: 13 });
    p.querySelectorAll('.dl-card').forEach(c => c.onclick = ev => { if (!ev.target.closest('select,a')) this.select(c.dataset.k); });
    p.querySelectorAll('.dl-card select').forEach(s => s.onchange = () => this.status(s.dataset.k, s.value));
    if (keep && this.sel) this.select(this.sel, true);
  },

  card(g) {
    const t = this.t, e = this.esc, sk = this.statusKey(g.status), total = g.rows.reduce((a, r) => a + (+r.total || 0), 0), key = e(g.key);
    const items = g.rows.map(r => `${e(r.crop)} ${e(r.qty)}kg`).join(', ');
    const dist = g.lat != null ? `${this.km(this.FARM.lat, this.FARM.lng, g.lat, g.lng).toFixed(1)} km` : '—';
    const nav = g.lat != null ? `<a class="btn btn-secondary btn-sm" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=${g.lat},${g.lng}">${t('dl_nav')}</a>` : '';
    return `<div class="dl-card ${this.sel == g.key ? 'on' : ''}" data-k="${key}"><h4><span class="dl-dot" style="background:${this.COLORS[sk]}"></span>${e(g.name || g.buyer)}</h4>
      <div class="m">📞 ${g.phone ? `<a href="tel:${e(g.phone)}">${e(g.phone)}</a>` : '—'} · ${new Date(g.time).toLocaleString()}</div>
      <div>${items}</div><div class="m">📍 ${e(g.address || 'No location shared')}</div>
      <div class="dl-row"><span><b>₹${total}</b> · ${t('dl_dist')}: ${dist}</span>${nav}</div>
      <div class="dl-row"><select data-k="${key}"><option value="Placed" ${sk === 'Placed' ? 'selected' : ''}>${t('st_placed')}</option><option value="Packed" ${sk === 'Packed' ? 'selected' : ''}>${t('st_packed')}</option><option value="Out for Delivery" ${sk === 'Out' ? 'selected' : ''}>${t('st_out')}</option><option value="Delivered" ${sk === 'Delivered' ? 'selected' : ''}>${t('st_done')}</option></select></div></div>`;
  },

  select(key, quiet) {
    this.sel = key;
    document.querySelectorAll('#tab-delivery .dl-card').forEach(c => c.classList.toggle('on', c.dataset.k == key));
    const g = this.groups().find(x => x.key == key); if (!g || g.lat == null || !this.map) return;
    if (this.line) this.line.remove();
    this.line = L.polyline([[this.FARM.lat, this.FARM.lng], [g.lat, g.lng]], { color: '#10b981', dashArray: '6 8', weight: 3 }).addTo(this.map);
    if (!quiet) { this.map.fitBounds([[this.FARM.lat, this.FARM.lng], [g.lat, g.lng]], { padding: [60, 60], maxZoom: 14 }); this.mk[key]?.openPopup(); }
  },

  status(key, val) {
    const os = this.orders(); os.forEach(o => { if ((o.batch || o.id) == key) o.status = val; });
    this.saveOrders(os); this.build(true);
  },

  init() { this.setup(); }
};
window.Delivery = Delivery;
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => Delivery.init()); else Delivery.init();

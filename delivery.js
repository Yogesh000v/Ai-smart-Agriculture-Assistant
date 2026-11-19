/* Owner-only Delivery Map: customers share a location at checkout; the farm owner sees every order on a live map.
   Needs Leaflet (loaded in index.html). Orders are stored in localStorage ('agri_orders') together with lat/lng. */
const Delivery = {
  OWNERS: ['yogesh@agrotech.com'],               // <-- only these accounts can see the Delivery Map. Add your own email here.
  FARM: {lat: 28.9931, lng: 77.0151 },         // <-- your farm location (sonipat, Haryana)
  COLORS: { Placed: '#f59e0b', Packed: '#3b82f6', Out: '#8b5cf6', Delivered: '#10b981' },
  map: null, layer: null, line: null, sel: null, seen: null, _repaired: false,

  // Built-in Haryana & major Indian locations + common spelling variants
  KNOWN_PLACES: {
    'charkhi dadri': { lat: 28.5921, lng: 76.2653 },
    'charkhi dari': { lat: 28.5921, lng: 76.2653 },
    'dadri': { lat: 28.5921, lng: 76.2653 },
    '127306': { lat: 28.5921, lng: 76.2653 },
    'sonipat': { lat: 28.9931, lng: 77.0151 },
    'sonepat': { lat: 28.9931, lng: 77.0151 },
    '131001': { lat: 28.9931, lng: 77.0151 },
    'rohtak': { lat: 28.8955, lng: 76.6066 },
    '124001': { lat: 28.8955, lng: 76.6066 },
    'bhiwani': { lat: 28.7975, lng: 76.1322 },
    'hisar': { lat: 29.1492, lng: 75.7217 },
    'jhajjar': { lat: 28.6063, lng: 76.6565 },
    'gurugram': { lat: 28.4595, lng: 77.0266 },
    'gurgaon': { lat: 28.4595, lng: 77.0266 },
    'faridabad': { lat: 28.4089, lng: 77.3178 },
    'karnal': { lat: 29.6857, lng: 76.9905 },
    'panipat': { lat: 29.3909, lng: 76.9635 },
    'ambala': { lat: 30.3782, lng: 76.7767 },
    'jind': { lat: 29.3160, lng: 76.3149 },
    'rewari': { lat: 28.1920, lng: 76.6191 },
    'mahendragarh': { lat: 28.2683, lng: 76.1518 },
    'narnaul': { lat: 28.0444, lng: 76.1083 },
    'sirsa': { lat: 29.5349, lng: 75.0289 },
    'fatehabad': { lat: 29.5152, lng: 75.4555 },
    'kaithal': { lat: 29.8015, lng: 76.3996 },
    'kurukshetra': { lat: 29.9695, lng: 76.8783 },
    'yamunanagar': { lat: 30.1290, lng: 77.2674 },
    'panchkula': { lat: 30.6942, lng: 76.8606 },
    'palwal': { lat: 28.1487, lng: 77.3320 },
    'delhi': { lat: 28.6139, lng: 77.2090 }
  },

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

  /* Smart Geocoder: resolves full address, PIN code, or known Indian cities */
  async geocode(rawAddr) {
    if (!rawAddr) return null;
    const lower = rawAddr.toLowerCase();

    // 1. Check known city/town names & PIN codes first for instant & typo-proof match
    for (const [key, coords] of Object.entries(this.KNOWN_PLACES)) {
      if (lower.includes(key)) {
        return { lat: coords.lat, lng: coords.lng };
      }
    }

    // 2. Clean noise like (143), PIN -, etc. and query OpenStreetMap Nominatim
    const cleaned = rawAddr
      .replace(/\([^)]*\)/g, ' ')
      .replace(/\bpin\s*[-:]?\s*/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    try {
      const r = await (await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&q=' + encodeURIComponent(cleaned))).json();
      if (r && r[0]) return { lat: +r[0].lat, lng: +r[0].lon };
    } catch (e) {}

    // 3. Extract 6-digit Indian PIN code and look up postal district
    const pinMatch = rawAddr.match(/\b([1-9]\d{5})\b/);
    if (pinMatch) {
      const pin = pinMatch[1];
      try {
        const rPin = await (await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&postalcode=' + pin)).json();
        if (rPin && rPin[0]) return { lat: +rPin[0].lat, lng: +rPin[0].lon };
      } catch (e) {}

      try {
        const po = await (await fetch('https://api.postalpincode.in/pincode/' + pin)).json();
        const postOffice = po?.[0]?.PostOffice?.[0];
        if (postOffice) {
          const districtQuery = `${postOffice.District}, ${postOffice.State}, India`;
          const rDist = await (await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&q=' + encodeURIComponent(districtQuery))).json();
          if (rDist && rDist[0]) return { lat: +rDist[0].lat, lng: +rDist[0].lon };
        }
      } catch (e) {}
    }

    return null;
  },

  /* Repair old orders that got stuck on FARM coordinates */
  async repairOldOrders() {
    if (this._repaired) return;
    this._repaired = true;
    const os = this.orders();
    let changed = false;
    for (const o of os) {
      const isDefaultFarm = Math.abs((+o.lat || 0) - this.FARM.lat) < 0.0005 && Math.abs((+o.lng || 0) - this.FARM.lng) < 0.0005;
      if (isDefaultFarm && o.address) {
        const found = await this.geocode(o.address);
        if (found && (Math.abs(found.lat - this.FARM.lat) > 0.001 || Math.abs(found.lng - this.FARM.lng) > 0.001)) {
          o.lat = found.lat;
          o.lng = found.lng;
          changed = true;
        }
      }
    }
    if (changed) {
      this.saveOrders(os);
      if (window.App?.activeTab === 'tab-delivery') this.build(true);
    }
  },

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
    let pos = null, marker = null, map = null, typeTimer = null;
    if (window.L) {
      map = L.map('dlPickMap').setView([this.FARM.lat, this.FARM.lng], 9); this.tiles().addTo(map);
      setTimeout(() => map.invalidateSize(), 150);
      map.on('click', ev => set(ev.latlng.lat, ev.latlng.lng));
    } else $('dlPickMap').innerHTML = '<p style="padding:1rem;font-size:.8rem">Map library could not load (check internet).</p>';
    const set = (lat, lng, zoom) => {
      pos = { lat: +lat.toFixed(6), lng: +lng.toFixed(6) };
      if (map) {
        if (marker) marker.setLatLng([lat, lng]); else marker = L.marker([lat, lng], { icon: this.pin('#ef4444', '🏠') }).addTo(map);
        map.setView([lat, lng], zoom || Math.max(map.getZoom(), 13));
      }
      $('dlOk').textContent = t('dl_saved');
    };
    const findAddress = async (silent) => {
      const q = $('dlAddr').value.trim(); if (!q) return null;
      const found = await this.geocode(q);
      if (found) { set(found.lat, found.lng, 13); return found; }
      if (!silent) App.toast(t('dl_locfail'), 'error');
      return null;
    };
    $('dlAddr').oninput = () => {
      pos = null;
      $('dlOk').textContent = '';
      clearTimeout(typeTimer);
      typeTimer = setTimeout(() => findAddress(true), 750);
    };
    $('dlGeo').onclick = () => {
      if (!navigator.geolocation) return App.toast(t('dl_locfail'), 'error');
      navigator.geolocation.getCurrentPosition(p => set(p.coords.latitude, p.coords.longitude, 15), () => App.toast(t('dl_locfail'), 'error'), { enableHighAccuracy: true, timeout: 12000 });
    };
    $('dlFind').onclick = () => findAddress(false);
    $('dlGo').onclick = async () => {
      const d = { name: $('dlName').value.trim(), phone: $('dlPhone').value.trim(), address: $('dlAddr').value.trim() };
      if (!d.name) return window.App?.toast('Please enter your full name.', 'error');
      if (!d.address) return window.App?.toast('Please enter your delivery address.', 'error');
      if (!pos) {
        $('dlGo').disabled = true;
        await findAddress(true);
        $('dlGo').disabled = false;
      }
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
    const sw = App.switchTab.bind(App);
    App.switchTab = id => { sw(id); if (id === 'tab-delivery') this.show(); };
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
    this.repairOldOrders();
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

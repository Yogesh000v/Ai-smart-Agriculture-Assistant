/* Login activity tracking + admin panel. Works offline (localStorage) and syncs to backend if live. */
const LoginLog = {
  KEY: 'agri_login_log',
  read() { try { return JSON.parse(localStorage.getItem(this.KEY)) || []; } catch (e) { return []; } },
  record(user, method) {
    const entry = {
      time: new Date().toISOString(), name: user.full_name, email: user.email, role: user.role,
      farm: user.farm_name, method, device: navigator.userAgent.replace(/\(.*?\)/, '').slice(0, 60),
      platform: navigator.platform, tz: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
    const log = this.read(); log.unshift(entry);
    localStorage.setItem(this.KEY, JSON.stringify(log.slice(0, 200)));
    if (window.App && App.isBackendLive)
      fetch(`${App.apiBase}/api/auth/login-log`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(entry) }).catch(() => {});
  },
  esc: s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),

  openPanel() {
    let m = document.getElementById('loginLogModal');
    if (!m) { m = document.createElement('div'); m.id = 'loginLogModal'; m.className = 'modal-backdrop'; document.body.appendChild(m);
      m.addEventListener('click', e => { if (e.target === m || e.target.id === 'closeLogBtn') m.style.display = 'none'; }); }
    const log = this.read(), users = [...new Map(log.map(l => [l.email, l])).values()];
    m.innerHTML = `<div class="auth-modal-card" style="max-width:860px;width:94%;grid-template-columns:1fr;">
      <div class="auth-modal-header"><h3>👥 Users & Login Activity</h3><button class="icon-btn" id="closeLogBtn">&times;</button></div>
      <p style="font-size:.8rem;color:var(--text-muted);margin:.5rem 0 1rem">${users.length} unique users · ${log.length} logins (this browser; backend sync keeps the full list)</p>
      <div class="table-responsive" style="max-height:55vh;overflow:auto"><table class="data-table"><thead><tr><th>When</th><th>Name</th><th>Email</th><th>Role</th><th>Farm</th><th>Type</th><th>Device</th></tr></thead><tbody>
      ${log.map(l => `<tr><td>${this.esc(new Date(l.time).toLocaleString())}</td><td>${this.esc(l.name)}</td><td>${this.esc(l.email)}</td><td>${this.esc(l.role)}</td><td>${this.esc(l.farm)}</td><td>${this.esc(l.method)}</td><td>${this.esc(l.device)}</td></tr>`).join('') || '<tr><td colspan="7">No logins yet.</td></tr>'}
      </tbody></table></div></div>`;
    m.style.display = 'flex';
  },

  decorateModal() {
    const card = document.querySelector('.auth-modal-card');
    if (!card || card.querySelector('.auth-hero')) return;
    card.classList.add('auth-split');
    const hero = document.createElement('aside'); hero.className = 'auth-hero';
    hero.innerHTML = `<div class="auth-hero-logo">🌱</div><h2>Smart Agro-Tech</h2>
      <p>Sensors, AI and irrigation, working together on your farm.</p>
      <ul><li>📡 Live soil &amp; climate telemetry</li><li>🔬 Photo diagnosis for any crop</li><li>💧 Automatic smart irrigation</li></ul>
      <small>🔒 Sign-ins are logged (name, email, time, device) for farm security.</small>`;
    card.prepend(hero);
    const body = document.createElement('div'); body.className = 'auth-body';
    [...card.children].filter(c => c !== hero).forEach(c => body.appendChild(c));
    card.appendChild(body);
  },

  init() {
    this.decorateModal();
    const A = window.Auth;
    if (A && typeof A.saveSession === 'function') {
      const origSave = A.saveSession.bind(A);
      A.saveSession = (u, t) => { origSave(u, t); this.record(u, String(t).startsWith('simulated') ? 'offline' : 'backend'); };
    }
    if (A && typeof A.updateHeaderProfile === 'function') {
      const origHdr = A.updateHeaderProfile.bind(A);
      A.updateHeaderProfile = () => {
        origHdr();
        const w = document.getElementById('authHeaderWidget');
        if (w && A.currentUser && /chief|admin/i.test(A.currentUser.role || '')) {
          const b = document.createElement('button'); b.className = 'btn btn-secondary btn-sm'; b.textContent = '👥 Activity'; b.style.marginRight = '.5rem';
          b.onclick = () => this.openPanel(); w.prepend(b);
        }
      };
      A.updateHeaderProfile();
    }
  }
};
window.LoginLog = LoginLog;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => LoginLog.init());
} else {
  LoginLog.init();
}

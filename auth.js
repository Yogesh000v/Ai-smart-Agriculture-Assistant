/**
 * ============================================================================
 * AI Smart Agriculture Assistant - Authentication & User Profile Controller
 * Handles user signup, login, session token persistence, and header widgets.
 * Full Offline & Online Support with Local Storage Account Database.
 * ============================================================================
 */

const Store = {
  mem: {},
  get(k) { try { return localStorage.getItem(k); } catch (e) { return this.mem[k] ?? null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { this.mem[k] = v; } },
  remove(k) { try { localStorage.removeItem(k); } catch (e) { delete this.mem[k]; } }
};

const LocalUsers = {
  KEY: 'agri_registered_users',

  getAll() {
    const defaults = [
      {
        id: 1,
        full_name: "Dr. Ramesh Patel (Admin)",
        email: "admin@agrotech.com",
        password: "AgroPass123!",
        role: "Admin",
        farm_name: "GreenHorizon Smart Agro-Tech Farm",
        phone: "+91 98765 43210",
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        full_name: "Suresh Kumar (Customer / Kisan)",
        email: "kisan@agrotech.com",
        password: "UserPass123!",
        role: "Customer / Buyer",
        farm_name: "Suresh Kisan Farm",
        phone: "+91 91234 56789",
        created_at: new Date().toISOString()
      }
    ];

    try {
      let data = JSON.parse(Store.get(this.KEY));
      if (Array.isArray(data) && data.length > 0) {
        // Ensure default accounts exist
        defaults.forEach(def => {
          if (!data.some(u => u.email.toLowerCase().trim() === def.email.toLowerCase().trim())) {
            data.push(def);
          }
        });
        this.saveAll(data);
        return data;
      }
    } catch (e) {}

    this.saveAll(defaults);
    return defaults;
  },

  saveAll(users) {
    Store.set(this.KEY, JSON.stringify(users));
  },

  register(userData) {
    const users = this.getAll();
    const cleanEmail = userData.email.toLowerCase().trim();

    if (users.some(u => u.email.toLowerCase().trim() === cleanEmail)) {
      return { ok: false, error: "This email is already registered. Please sign in instead." };
    }

    const newUser = {
      id: Date.now(),
      full_name: userData.full_name.trim(),
      email: cleanEmail,
      password: userData.password,
      role: userData.role || "Farmer / Farm Owner",
      farm_name: userData.farm_name ? userData.farm_name.trim() : "My Agricultural Farm",
      phone: userData.phone ? userData.phone.trim() : "",
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    this.saveAll(users);

    const { password: _, ...safeUser } = newUser;
    return { ok: true, user: safeUser };
  },

  login(email, password) {
    const users = this.getAll();
    const cleanEmail = email.toLowerCase().trim();
    const user = users.find(u => u.email.toLowerCase().trim() === cleanEmail);

    if (!user) {
      return { ok: false, error: "No account found with this email. Please register first." };
    }

    if (user.password !== password) {
      return { ok: false, error: "Incorrect password. Please try again." };
    }

    const { password: _, ...safeUser } = user;
    return { ok: true, user: safeUser };
  }
};

const Auth = {
  currentUser: null,
  token: null,

  isAdmin() {
    if (!this.currentUser) return false;
    const r = String(this.currentUser.role || '').toLowerCase();
    const e = String(this.currentUser.email || '').toLowerCase();
    return e === 'admin@agrotech.com' || r === 'admin' || r.includes('admin') || r.includes('manager');
  },

  init() {
    this.loadSession();
    this.bindModalEvents();
    this.bindForms();
  },

  loadSession() {
    const savedUser = Store.get('agri_auth_user');
    const savedToken = Store.get('agri_auth_token');

    if (savedUser && savedToken) {
      try {
        this.currentUser = JSON.parse(savedUser);
        this.token = savedToken;
        this.updateHeaderProfile();
      } catch (e) {
        this.clearSession();
      }
    } else {
      this.updateHeaderProfile();
    }
  },

  saveSession(user, token) {
    this.currentUser = user;
    this.token = token;
    Store.set('agri_auth_user', JSON.stringify(user));
    Store.set('agri_auth_token', token);
    this.updateHeaderProfile();

    if (window.Market && typeof window.Market.onAuthChange === 'function') {
      window.Market.onAuthChange();
    } else if (window.Market && typeof window.Market.render === 'function') {
      window.Market.updateCartBadge();
      window.Market.render();
    }

    if (window.Delivery && typeof window.Delivery.access === 'function') {
      window.Delivery.access();
    }
    if (window.AdminDashboard && typeof window.AdminDashboard.checkAccess === 'function') {
      window.AdminDashboard.checkAccess();
      window.AdminDashboard.render();
    }
  },

  clearSession() {
    this.currentUser = null;
    this.token = null;
    Store.remove('agri_auth_user');
    Store.remove('agri_auth_token');
    this.updateHeaderProfile();

    if (window.Market && typeof window.Market.onAuthChange === 'function') {
      window.Market.onAuthChange();
    } else if (window.Market && typeof window.Market.render === 'function') {
      window.Market.updateCartBadge();
      window.Market.render();
    }

    if (window.Delivery && typeof window.Delivery.access === 'function') {
      window.Delivery.access();
    }
    if (window.AdminDashboard && typeof window.AdminDashboard.checkAccess === 'function') {
      window.AdminDashboard.checkAccess();
    }
  },

  bindModalEvents() {
    const modal = document.getElementById('authModal');
    const openBtn = document.getElementById('openAuthModalBtn');
    const closeBtn = document.getElementById('closeAuthModalBtn');
    const switchLogin = document.getElementById('switchLoginBtn');
    const switchRegister = document.getElementById('switchRegisterBtn');
    const quickDemoBtn = document.getElementById('quickDemoLoginBtn');
    const quickAdminBtn = document.getElementById('quickAdminLoginBtn');
    const quickUserBtn = document.getElementById('quickUserLoginBtn');

    if (openBtn) {
      openBtn.addEventListener('click', () => this.showModal('login'));
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => this.hideModal());
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.hideModal();
      });
    }

    if (switchLogin && switchRegister) {
      switchLogin.addEventListener('click', () => this.toggleTab('login'));
      switchRegister.addEventListener('click', () => this.toggleTab('register'));
    }

    if (quickAdminBtn) {
      quickAdminBtn.addEventListener('click', () => {
        const emailEl = document.getElementById('loginEmail');
        const passEl = document.getElementById('loginPassword');
        if (emailEl) emailEl.value = 'admin@agrotech.com';
        if (passEl) passEl.value = 'AgroPass123!';
        const submitBtn = document.getElementById('submitLoginBtn');
        if (submitBtn) submitBtn.click();
      });
    }

    if (quickUserBtn) {
      quickUserBtn.addEventListener('click', () => {
        const emailEl = document.getElementById('loginEmail');
        const passEl = document.getElementById('loginPassword');
        if (emailEl) emailEl.value = 'kisan@agrotech.com';
        if (passEl) passEl.value = 'UserPass123!';
        const submitBtn = document.getElementById('submitLoginBtn');
        if (submitBtn) submitBtn.click();
      });
    }

    if (quickDemoBtn) {
      quickDemoBtn.addEventListener('click', () => {
        const emailEl = document.getElementById('loginEmail');
        const passEl = document.getElementById('loginPassword');
        if (emailEl) emailEl.value = 'admin@agrotech.com';
        if (passEl) passEl.value = 'AgroPass123!';
        const submitBtn = document.getElementById('submitLoginBtn');
        if (submitBtn) submitBtn.click();
      });
    }
  },

  showModal(tab = 'login') {
    const modal = document.getElementById('authModal');
    if (modal) {
      modal.style.display = 'flex';
      this.toggleTab(tab);
    }
  },

  hideModal() {
    const modal = document.getElementById('authModal');
    if (modal) modal.style.display = 'none';
  },

  toggleTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const regForm = document.getElementById('registerForm');
    const switchLogin = document.getElementById('switchLoginBtn');
    const switchRegister = document.getElementById('switchRegisterBtn');
    const title = document.getElementById('authModalTitle');

    if (tab === 'login') {
      if (loginForm) loginForm.style.display = 'block';
      if (regForm) regForm.style.display = 'none';
      if (switchLogin) switchLogin.classList.add('active');
      if (switchRegister) switchRegister.classList.remove('active');
      if (title) title.textContent = 'Sign In to Smart Agro-Tech';
    } else {
      if (loginForm) loginForm.style.display = 'none';
      if (regForm) regForm.style.display = 'block';
      if (switchLogin) switchLogin.classList.remove('active');
      if (switchRegister) switchRegister.classList.add('active');
      if (title) title.textContent = 'Create Agricultural Account';
    }
  },

  errText(data, fallback) {
    const d = data && data.detail;
    if (typeof d === 'string') return d;
    if (Array.isArray(d) && d[0] && d[0].msg) return d[0].msg;
    return fallback;
  },

  /** POST to the backend. Never throws. reachable=false means "use offline mode". */
  async backendCall(path, body) {
    if (!window.App) return { reachable: false };
    const isLocalApi = /127\.0\.0\.1|localhost/.test(App.apiBase);
    try {
      const res = await fetch(`${App.apiBase}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: window.timeoutSignal ? window.timeoutSignal(isLocalApi ? 6000 : 25000) : undefined
      });
      let data = null;
      try { data = await res.json(); } catch (e) {}
      return { reachable: true, ok: res.ok, status: res.status, data };
    } catch (e) {
      return { reachable: false };
    }
  },

  bindForms() {
    const toast = (m, t) => { if (window.App?.toast) App.toast(m, t); };

    // 1. Login Form Submit
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail')?.value.trim();
        const password = document.getElementById('loginPassword')?.value;
        const submitBtn = document.getElementById('submitLoginBtn');

        if (!email || !password) return toast("Please fill in email and password.", "error");

        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Verifying...'; }

        try {
          // a) Shared backend account (works on every device)
          const r = await this.backendCall('/api/auth/login', { email, password });
          if (r.reachable && r.ok && r.data && r.data.user) {
            this.saveSession(r.data.user, r.data.token || ('backend-token-' + Date.now()));
            this.hideModal();
            return toast(r.data.message || `Welcome back, ${r.data.user.full_name}!`, "success");
          }

          // b) Offline / demo accounts stored in this browser
          const local = LocalUsers.login(email, password);
          if (local.ok) {
            this.saveSession(local.user, 'local-token-' + Date.now());
            this.hideModal();
            return toast(`Welcome back, ${local.user.full_name}!`, "success");
          }

          // c) Failed everywhere - show the most useful message
          let msg = local.error;
          if (r.reachable && [400, 401, 409, 422].includes(r.status)) msg = this.errText(r.data, msg);
          toast(msg, "error");
        } finally {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Sign In'; }
        }
      });
    }

    // 2. Register Form Submit
    const regForm = document.getElementById('registerForm');
    if (regForm) {
      regForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fullName = document.getElementById('regFullName')?.value.trim();
        const email = document.getElementById('regEmail')?.value.trim();
        const phone = document.getElementById('regPhone')?.value.trim() || '';
        const role = document.getElementById('regRole')?.value;
        const farmName = document.getElementById('regFarmName')?.value.trim() || 'GreenHorizon Sector 4';
        const password = document.getElementById('regPassword')?.value;
        const submitBtn = document.getElementById('submitRegisterBtn');

        if (!fullName || !email || !password) return toast("Please fill in all required fields.", "error");
        if (password.length < 6) return toast("Password must be at least 6 characters.", "error");

        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Creating Account...'; }

        try {
          const r = await this.backendCall('/api/auth/signup', {
            full_name: fullName, email, password, role, farm_name: farmName, phone
          });

          if (r.reachable && r.ok && r.data && r.data.user) {
            this.saveSession(r.data.user, r.data.token || ('backend-token-' + Date.now()));
            this.hideModal();
            return toast(r.data.message || `Account created! Welcome, ${fullName}.`, "success");
          }
          // Backend answered with a real validation error (e.g. email already used) - don't create a local duplicate
          if (r.reachable && [400, 409, 422].includes(r.status)) {
            return toast(this.errText(r.data, "Registration failed."), "error");
          }

          // Backend not reachable (or has no auth API) -> register in this browser only
          const result = LocalUsers.register({ full_name: fullName, email, password, role, farm_name: farmName, phone });
          if (result.ok) {
            this.saveSession(result.user, 'local-token-' + Date.now());
            this.hideModal();
            toast(`Account created! Welcome to Smart Agriculture, ${fullName}.`, "success");
          } else {
            toast(result.error, "error");
          }
        } finally {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Create Farm Account'; }
        }
      });
    }
  },

  updateHeaderProfile() {
    const widget = document.getElementById('authHeaderWidget');
    if (!widget) return;

    if (this.currentUser) {
      const isAdmin = this.isAdmin();
      const nameParts = (this.currentUser.full_name || (isAdmin ? 'Admin' : 'Farmer')).trim().split(/\s+/);
      const initials = nameParts.length > 1 
        ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
        : nameParts[0].substring(0, 2).toUpperCase();

      const roleBadge = isAdmin
        ? `<span style="background:#ef4444; color:#fff; font-size:0.62rem; padding:0.12rem 0.4rem; border-radius:4px; font-weight:800; letter-spacing:0.5px;">🛡️ ADMIN</span>`
        : `<span style="background:#10b981; color:#fff; font-size:0.62rem; padding:0.12rem 0.4rem; border-radius:4px; font-weight:700;">👤 USER</span>`;

      const avatarGradient = isAdmin
        ? 'linear-gradient(135deg, #ef4444, #b91c1c)'
        : 'linear-gradient(135deg, #10b981, #047857)';

      const adminItems = isAdmin ? `
        <button class="pmenu-item admin-highlight" id="pmenuAdminBtn" type="button">
          <span class="pmenu-item-left"><span class="pmenu-icon">🛡️</span> <span>Dedicated Admin Dashboard</span></span>
          <span class="pmenu-tag" style="background:rgba(239,68,68,0.2); color:#ef4444;">ADMIN</span>
        </button>
        <button class="pmenu-item admin-highlight" id="pmenuDeliveryBtn" type="button">
          <span class="pmenu-item-left"><span class="pmenu-icon">🚚</span> <span>Live Delivery Map</span></span>
          <span class="pmenu-tag" style="background:rgba(245,158,11,0.2); color:#f59e0b;">GPS</span>
        </button>
      ` : '';

      widget.innerHTML = `
        <div class="profile-dropdown-wrapper" id="profileDropdownWrapper">
          <button class="profile-trigger-btn ${isAdmin ? 'admin-border' : ''}" id="profileTriggerBtn" type="button" aria-haspopup="true" aria-expanded="false" title="Click to open profile menu">
            <div class="profile-avatar-pill" style="background:${avatarGradient};">
              ${initials}
            </div>
            <div class="profile-name-tag">
              <div class="profile-name-text">${this.currentUser.full_name}</div>
              <div class="profile-role-sub">
                ${roleBadge}
              </div>
            </div>
            <span class="profile-chevron">▼</span>
          </button>

          <div class="profile-menu-dropdown" id="profileMenuDropdown" role="menu">
            <div class="pmenu-header ${isAdmin ? 'admin-theme' : ''}">
              <div class="pmenu-avatar-large" style="background:${avatarGradient};">
                ${initials}
              </div>
              <div class="pmenu-user-details">
                <div class="pmenu-name">${this.currentUser.full_name}</div>
                <div class="pmenu-email">${this.currentUser.email}</div>
                <div style="margin-top:2px;">
                  ${roleBadge}
                  ${this.currentUser.phone ? `<span style="font-size:0.68rem; color:var(--text-muted); margin-left:0.35rem;">📞 ${this.currentUser.phone}</span>` : ''}
                </div>
              </div>
            </div>

            <div class="pmenu-body">
              ${adminItems}
              <button class="pmenu-item" id="pmenuMarketBtn" type="button">
                <span class="pmenu-item-left"><span class="pmenu-icon">🛒</span> <span>Farm Marketplace</span></span>
              </button>
              <button class="pmenu-item" id="pmenuOrdersBtn" type="button">
                <span class="pmenu-item-left"><span class="pmenu-icon">📦</span> <span>My Orders & Invoices</span></span>
              </button>
              <button class="pmenu-item" id="pmenuWeatherBtn" type="button">
                <span class="pmenu-item-left"><span class="pmenu-icon">🌤️</span> <span>Live Weather & Irrigation</span></span>
              </button>
              <button class="pmenu-item" id="pmenuDiagnosticsBtn" type="button">
                <span class="pmenu-item-left"><span class="pmenu-icon">🌿</span> <span>AI Disease Diagnostic</span></span>
              </button>
            </div>

            <div class="pmenu-footer">
              <button class="pmenu-logout-btn" id="pmenuLogoutBtn" type="button">
                <span>🚪</span> Sign Out
              </button>
            </div>
          </div>
        </div>
      `;

      // Setup Click / Toggle Handlers
      const wrapper = document.getElementById('profileDropdownWrapper');
      const trigger = document.getElementById('profileTriggerBtn');

      const toggleMenu = (e) => {
        if (e) e.stopPropagation();
        const isOpen = wrapper.classList.contains('open');
        if (isOpen) {
          wrapper.classList.remove('open');
          trigger.setAttribute('aria-expanded', 'false');
        } else {
          wrapper.classList.add('open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      };

      const closeMenu = () => {
        if (wrapper && wrapper.classList.contains('open')) {
          wrapper.classList.remove('open');
          trigger.setAttribute('aria-expanded', 'false');
        }
      };

      if (trigger && wrapper) {
        trigger.onclick = toggleMenu;
      }

      // Close on document outside click
      if (!this._profileDocClickHandler) {
        this._profileDocClickHandler = (e) => {
          const w = document.getElementById('profileDropdownWrapper');
          if (w && !w.contains(e.target)) {
            w.classList.remove('open');
            const t = document.getElementById('profileTriggerBtn');
            if (t) t.setAttribute('aria-expanded', 'false');
          }
        };
        document.addEventListener('click', this._profileDocClickHandler);
      }

      // Close on Escape key
      if (!this._profileDocKeyHandler) {
        this._profileDocKeyHandler = (e) => {
          if (e.key === 'Escape') {
            const w = document.getElementById('profileDropdownWrapper');
            if (w) {
              w.classList.remove('open');
              const t = document.getElementById('profileTriggerBtn');
              if (t) t.setAttribute('aria-expanded', 'false');
            }
          }
        };
        document.addEventListener('keydown', this._profileDocKeyHandler);
      }

      // Menu Action Listeners
      const adminBtn = document.getElementById('pmenuAdminBtn');
      if (adminBtn) {
        adminBtn.onclick = () => {
          closeMenu();
          if (window.App?.switchTab) window.App.switchTab('tab-admin');
        };
      }

      const deliveryBtn = document.getElementById('pmenuDeliveryBtn');
      if (deliveryBtn) {
        deliveryBtn.onclick = () => {
          closeMenu();
          if (window.App?.switchTab) window.App.switchTab('tab-delivery');
        };
      }

      const marketBtn = document.getElementById('pmenuMarketBtn');
      if (marketBtn) {
        marketBtn.onclick = () => {
          closeMenu();
          if (window.App?.switchTab) window.App.switchTab('tab-market');
        };
      }

      const ordersBtn = document.getElementById('pmenuOrdersBtn');
      if (ordersBtn) {
        ordersBtn.onclick = () => {
          closeMenu();
          if (isAdmin) {
            if (window.App?.switchTab) window.App.switchTab('tab-admin');
          } else {
            if (window.App?.switchTab) window.App.switchTab('tab-market');
            const myOrdersEl = document.getElementById('mkMine');
            if (myOrdersEl) myOrdersEl.scrollIntoView({ behavior: 'smooth' });
          }
        };
      }

      const weatherBtn = document.getElementById('pmenuWeatherBtn');
      if (weatherBtn) {
        weatherBtn.onclick = () => {
          closeMenu();
          if (window.App?.switchTab) window.App.switchTab('tab-irrigation');
        };
      }

      const diagBtn = document.getElementById('pmenuDiagnosticsBtn');
      if (diagBtn) {
        diagBtn.onclick = () => {
          closeMenu();
          if (window.App?.switchTab) window.App.switchTab('tab-disease');
        };
      }

      const logoutBtn = document.getElementById('pmenuLogoutBtn');
      if (logoutBtn) {
        logoutBtn.onclick = () => {
          closeMenu();
          this.clearSession();
          if (window.App?.toast) App.toast("Signed out successfully.", "info");
        };
      }
    } else {
      widget.innerHTML = `
        <button class="btn btn-secondary btn-sm" id="openAuthModalBtn" style="gap:0.35rem;">
          👤 Sign In / Register
        </button>
      `;

      const openBtn = document.getElementById('openAuthModalBtn');
      if (openBtn) {
        openBtn.addEventListener('click', () => this.showModal('login'));
      }
    }
  }
};

window.LocalUsers = LocalUsers;
window.Auth = Auth;
document.addEventListener('DOMContentLoaded', () => Auth.init());

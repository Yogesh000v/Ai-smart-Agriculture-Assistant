/**
 * ============================================================================
 * AI Smart Agriculture Assistant - Master Application Controller (JavaScript)
 * Manages tabs, system state, connection detection, simulated fallback, and toasts.
 * ============================================================================
 */

const App = {
  apiBase: 'http://127.0.0.1:8000',
  nodeGatewayBase: 'http://127.0.0.1:5001',
  isBackendLive: false,
  isGatewayLive: false,
  activeTab: 'tab-telemetry',

  init() {
    this.initTabs();
    this.initTheme();
    this.checkConnections();
    
    // Periodically verify connection every 6 seconds
    setInterval(() => this.checkConnections(), 6000);

    console.log("🌾 [AI Smart Agriculture Assistant] initialized successfully.");
  },

  initTabs() {
    const tabs = document.querySelectorAll('.nav-tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const targetId = tab.getAttribute('data-tab');
        this.switchTab(targetId);
      });
    });
  },

  switchTab(tabId) {
    this.activeTab = tabId;

    // Update buttons
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });

    // Update panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.toggle('active', pane.id === tabId);
    });

    // Trigger tab-specific redraws if needed (e.g. Chart.js resize)
    if (tabId === 'tab-telemetry' && window.IoTMonitor) {
      window.IoTMonitor.resizeChart();
    }
    if (tabId === 'tab-market' && window.Market) {
      window.Market.render();
    }
    if (tabId === 'tab-admin' && window.AdminDashboard) {
      window.AdminDashboard.render();
    }
    if (tabId === 'tab-irrigation' && window.LiveWeather) {
      window.LiveWeather.fetchWeather();
    }
    if (tabId === 'tab-delivery' && window.Delivery) {
      window.Delivery.show();
    }
  },

  initTheme() {
    const themeBtn = document.getElementById('themeToggleBtn');
    const savedTheme = localStorage.getItem('agri_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeIcon(savedTheme);

    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('agri_theme', next);
        this.updateThemeIcon(next);
      });
    }
  },

  updateThemeIcon(theme) {
    const btn = document.getElementById('themeToggleBtn');
    if (btn) {
      btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
    }
  },

  async checkConnections() {
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');

    // GitHub Pages (HTTPS) par local 127.0.0.1 check skip karein
    if (window.location.hostname.includes('github.io')) {
      this.isBackendLive = false;
      this.isGatewayLive = false;
      if (statusDot) statusDot.className = 'status-dot simulated';
      if (statusText) statusText.innerHTML = '🟡 Standalone Simulation Mode (Ready)';
      return;
    }

    try {
      const res = await fetch(`${this.apiBase}/api/status`, { signal: AbortSignal.timeout(1800) });
      if (res.ok) {
        this.isBackendLive = true;
        if (statusDot) statusDot.className = 'status-dot';
        if (statusText) statusText.innerHTML = '🟢 Python Backend Live &nbsp;|&nbsp; SQL Connected';
        return;
      }
    } catch (e) {
      // Backend not running
    }

    try {
      const resNode = await fetch(`${this.nodeGatewayBase}/status`, { signal: AbortSignal.timeout(1200) });
      if (resNode.ok) {
        this.isGatewayLive = true;
        if (statusDot) statusDot.className = 'status-dot';
        if (statusText) statusText.innerHTML = '🟢 Node.js Gateway Live &nbsp;|&nbsp; Python Standby';
        return;
      }
    } catch (e) {
      // Gateway not running
    }

    // Fallback Standalone Simulation Mode
    this.isBackendLive = false;
    this.isGatewayLive = false;
    if (statusDot) statusDot.className = 'status-dot simulated';
    if (statusText) statusText.innerHTML = '🟡 Standalone Simulation Mode (Ready)';
  },

  toast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    const icon = type === 'success' ? '✅' : (type === 'error' ? '⚠️' : 'ℹ️');
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
};

window.App = App;
document.addEventListener('DOMContentLoaded', () => App.init());

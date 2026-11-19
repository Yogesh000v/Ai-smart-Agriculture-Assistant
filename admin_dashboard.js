/**
 * ============================================================================
 * AI Smart Agriculture Assistant - Dedicated Admin Dashboard Controller
 * Full Standalone Management Panel for Orders, Produce Inventory, Users,
 * Live Status Tracking, and Instant CSV/Excel Data Exports.
 * ============================================================================
 */

const AdminDashboard = {
  currentFilter: 'All',
  searchQuery: '',

  init() {
    this.bindEvents();
    this.checkAccess();
  },

  checkAccess() {
    const isAdmin = window.Auth?.isAdmin ? window.Auth.isAdmin() : false;
    const adminNavBtn = document.getElementById('navBtnAdmin');
    if (adminNavBtn) {
      adminNavBtn.style.display = isAdmin ? 'inline-flex' : 'none';
    }

    // If non-admin is currently viewing tab-admin, switch them back
    if (!isAdmin && window.App?.activeTab === 'tab-admin') {
      window.App.switchTab('tab-telemetry');
    }
  },

  bindEvents() {
    const root = document.getElementById('tab-admin');
    if (!root) return;

    root.addEventListener('click', (e) => {
      // Export buttons
      if (e.target.closest('#btnExportOrders')) {
        if (window.ExportUtils) ExportUtils.exportOrders();
      }
      else if (e.target.closest('#btnExportProduce')) {
        if (window.ExportUtils) ExportUtils.exportProduce();
      }
      else if (e.target.closest('#btnExportUsers')) {
        if (window.ExportUtils) ExportUtils.exportUsers();
      }
      else if (e.target.closest('#btnAdminLogins')) {
        if (window.LoginLog?.openPanel) LoginLog.openPanel();
      }
      else if (e.target.closest('#btnAdminDeliveryMap')) {
        if (window.App?.switchTab) App.switchTab('tab-delivery');
      }

      // Order Actions
      const delOrderBtn = e.target.closest('[data-adm-del-order]');
      if (delOrderBtn) {
        this.deleteOrder(delOrderBtn.dataset.admDelOrder);
      }

      const receiptBtn = e.target.closest('[data-adm-receipt]');
      if (receiptBtn) {
        const orderId = receiptBtn.dataset.admReceipt;
        const os = window.Market ? Market.orders() : [];
        const target = os.find(x => x.id == orderId);
        if (target && window.ExportUtils) ExportUtils.downloadReceipt(target);
      }

      // Filter tabs
      const filterBtn = e.target.closest('[data-adm-filter]');
      if (filterBtn) {
        this.currentFilter = filterBtn.dataset.admFilter;
        this.render();
      }

      // Produce delete
      const delProdBtn = e.target.closest('[data-adm-del-prod]');
      if (delProdBtn) {
        const prodId = delProdBtn.dataset.admDelProd;
        if (window.Market) {
          Market.save(Market.load().filter(p => p.id != prodId));
          if (window.App?.toast) App.toast("Produce listing removed from catalog.", "info");
          this.render();
        }
      }
    });

    root.addEventListener('change', (e) => {
      const statusSelect = e.target.closest('[data-adm-status]');
      if (statusSelect) {
        this.updateOrderStatus(statusSelect.dataset.admStatus, statusSelect.value);
      }
    });

    root.addEventListener('input', (e) => {
      if (e.target.id === 'adminOrderSearch') {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderOrdersList();
      }
    });
  },

  updateOrderStatus(orderId, newStatus) {
    if (!window.Market) return;
    const os = Market.orders();
    const o = os.find(x => x.id == orderId);
    if (o) {
      o.status = newStatus;
      Market.saveOrders ? Market.saveOrders(os) : localStorage.setItem(Market.O, JSON.stringify(os));
      if (window.App?.toast) App.toast(`Order #${orderId} status updated to "${newStatus}"`, "success");
      this.render();
    }
  },

  deleteOrder(orderId) {
    if (!confirm("Are you sure you want to permanently delete this customer order?")) return;
    if (!window.Market) return;
    let os = Market.orders();
    os = os.filter(x => x.id != orderId);
    localStorage.setItem(Market.O, JSON.stringify(os));
    if (window.App?.toast) App.toast("Order permanently deleted.", "info");
    this.render();
  },

  render() {
    const root = document.getElementById('adminDashboardRoot');
    if (!root) return;

    const isAdmin = window.Auth?.isAdmin ? window.Auth.isAdmin() : false;
    if (!isAdmin) {
      root.innerHTML = `
        <div style="text-align:center; padding:4rem 1rem;">
          <div style="font-size:3rem; margin-bottom:0.5rem;">🔒</div>
          <h3 style="color:#ef4444; margin-bottom:0.5rem;">Admin Access Restricted</h3>
          <p style="color:var(--text-muted); font-size:0.9rem; max-width:450px; margin:0 auto 1.5rem;">
            This master control dashboard is reserved for Farm System Administrators. Please sign in with an Administrator account to proceed.
          </p>
          <button class="btn btn-primary" onclick="window.Auth?.showModal('login')">Sign In as Admin</button>
        </div>
      `;
      return;
    }

    const allOrders = window.Market ? Market.orders() : [];
    const allProduce = window.Market ? Market.load() : [];
    const allUsers = window.LocalUsers ? LocalUsers.getAll() : [];

    const totalRev = allOrders.reduce((sum, o) => sum + (+o.total || 0), 0);
    const pendingCount = allOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
    const u = window.Auth?.currentUser || {};

    root.innerHTML = `
      <!-- 1. Admin Header & Real-time Status -->
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; margin-bottom:1.5rem; background:linear-gradient(135deg, rgba(239,68,68,0.1), rgba(15,23,42,0.6)); border:1px solid rgba(239,68,68,0.3); border-radius:16px; padding:1.2rem 1.5rem;">
        <div>
          <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.3rem;">
            <span style="font-size:2rem;">🛡️</span>
            <div>
              <h2 style="margin:0; font-size:1.4rem; color:var(--text-primary); font-weight:800;">
                Master Agriculture Administration Dashboard
              </h2>
              <div style="font-size:0.78rem; color:var(--text-muted);">
                Centralized hub for customer orders, inventory dispatch, user accounts & analytics
              </div>
            </div>
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:0.8rem; flex-wrap:wrap;">
          <div style="text-align:right;">
            <div style="font-size:0.82rem; font-weight:700; color:var(--text-primary);">Logged in as: ${u.full_name || 'Administrator'}</div>
            <div style="font-size:0.72rem; color:#10b981; font-weight:600;">● System Operational · All Nodes Online</div>
          </div>
          <span style="background:#ef4444; color:white; font-size:0.72rem; font-weight:800; padding:0.25rem 0.6rem; border-radius:6px; letter-spacing:0.5px;">
            ROOT ADMIN
          </span>
        </div>
      </div>

      <!-- 2. KPI Metric Summary Cards -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem; margin-bottom:1.5rem;">
        <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:12px; padding:1rem; text-align:center;">
          <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">📦 Total Orders Placed</div>
          <div style="font-size:1.8rem; font-weight:800; color:var(--primary); margin:0.3rem 0;">${allOrders.length}</div>
          <div style="font-size:0.72rem; color:var(--text-muted);">${pendingCount} awaiting dispatch</div>
        </div>

        <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:12px; padding:1rem; text-align:center;">
          <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">💰 Total Sales Volume</div>
          <div style="font-size:1.8rem; font-weight:800; color:#10b981; margin:0.3rem 0;">₹${totalRev.toLocaleString()}</div>
          <div style="font-size:0.72rem; color:var(--text-muted);">Direct farm-to-consumer revenue</div>
        </div>

        <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:12px; padding:1rem; text-align:center;">
          <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">⏳ Pending Deliveries</div>
          <div style="font-size:1.8rem; font-weight:800; color:#f59e0b; margin:0.3rem 0;">${pendingCount}</div>
          <div style="font-size:0.72rem; color:var(--text-muted);">Active packing / dispatch</div>
        </div>

        <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:12px; padding:1rem; text-align:center;">
          <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">👥 Registered Accounts</div>
          <div style="font-size:1.8rem; font-weight:800; color:#8b5cf6; margin:0.3rem 0;">${allUsers.length}</div>
          <div style="font-size:0.72rem; color:var(--text-muted);">Farmers, Buyers & Staff</div>
        </div>

        <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:12px; padding:1rem; text-align:center;">
          <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">🌾 Live Produce Catalog</div>
          <div style="font-size:1.8rem; font-weight:800; color:#06b6d4; margin:0.3rem 0;">${allProduce.length}</div>
          <div style="font-size:0.72rem; color:var(--text-muted);">Active harvest varieties</div>
        </div>
      </div>

      <!-- 3. Export Options & Quick Actions Toolbar -->
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem; margin-bottom:1.5rem; background:var(--bg-surface); border:1px solid var(--border-color); border-radius:12px; padding:0.85rem 1rem;">
        <div style="display:flex; align-items:center; gap:0.5rem; font-size:0.85rem; font-weight:700; color:var(--text-secondary);">
          <span>📥</span> <b>Data Export & Management:</b>
        </div>
        <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
          <button class="btn btn-secondary btn-sm" id="btnExportOrders" style="font-size:0.78rem; gap:0.35rem; font-weight:700;">
            📥 Export Orders (CSV/Excel)
          </button>
          <button class="btn btn-secondary btn-sm" id="btnExportProduce" style="font-size:0.78rem; gap:0.35rem; font-weight:700;">
            📥 Export Produce Catalog (CSV)
          </button>
          <button class="btn btn-secondary btn-sm" id="btnExportUsers" style="font-size:0.78rem; gap:0.35rem; font-weight:700;">
            📥 Export Users List (CSV)
          </button>
          <button class="btn btn-secondary btn-sm" id="btnAdminLogins" style="font-size:0.78rem; gap:0.35rem;">
            👥 User Logins Activity
          </button>
          <button class="btn btn-primary btn-sm" id="btnAdminDeliveryMap" style="font-size:0.78rem; gap:0.35rem;">
            🚚 Live Delivery Map
          </button>
        </div>
      </div>

      <!-- 4. Customer Orders Management Table & Filter -->
      <div class="card" style="margin-bottom:1.8rem;">
        <div class="card-header" style="flex-wrap:wrap; gap:0.75rem;">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <div class="card-title" style="margin:0;">📦 Customer Orders Master Ledger (${allOrders.length})</div>
          </div>

          <!-- Filter Pills -->
          <div style="display:flex; gap:0.35rem; flex-wrap:wrap;">
            ${['All', 'Placed', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'].map(f => `
              <button class="btn btn-secondary btn-sm ${this.currentFilter === f ? 'btn-primary' : ''}" data-adm-filter="${f}" style="font-size:0.72rem; padding:0.25rem 0.55rem;">
                ${f}
              </button>
            `).join('')}
          </div>
        </div>

        <div style="padding:0.75rem 1rem; border-bottom:1px solid var(--border-color); background:var(--bg-surface);">
          <input type="text" id="adminOrderSearch" class="form-control" placeholder="🔍 Search orders by Customer Name, Email, Phone, Order ID, or Crop..." style="font-size:0.85rem; padding:0.5rem 0.75rem;">
        </div>

        <div id="adminOrdersContainer" style="padding:1rem;">
          <!-- Dynamically filled by renderOrdersList -->
        </div>
      </div>

      <!-- 5. Registered Users Directory & Active Produce Accordion -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(360px, 1fr)); gap:1.2rem;">
        <!-- Registered Users Directory -->
        <div class="card">
          <div class="card-header">
            <div class="card-title" style="margin:0;">👥 Registered Accounts Directory (${allUsers.length})</div>
            <button class="btn btn-secondary btn-sm" onclick="ExportUtils.exportUsers()" style="font-size:0.72rem; padding:0.2rem 0.45rem;">📥 CSV</button>
          </div>
          <div style="max-height:340px; overflow-y:auto; padding:0.75rem;">
            ${allUsers.map(usr => `
              <div style="display:flex; justify-content:space-between; align-items:center; padding:0.6rem; border-bottom:1px solid var(--border-color); font-size:0.82rem;">
                <div>
                  <div style="font-weight:700; color:var(--text-primary);">${usr.full_name}</div>
                  <div style="font-size:0.72rem; color:var(--text-muted);">${usr.email} · ${usr.phone || 'No phone'}</div>
                </div>
                <div style="text-align:right;">
                  <span class="badge" style="font-size:0.68rem; padding:0.15rem 0.45rem; border-radius:4px; background:${String(usr.role || '').toLowerCase().includes('admin') ? '#ef4444' : '#10b981'}; color:white; font-weight:700;">
                    ${usr.role || 'User'}
                  </span>
                  <div style="font-size:0.7rem; color:var(--text-muted); margin-top:0.2rem;">${usr.farm_name || 'Farm'}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Marketplace Produce Quick Inventory -->
        <div class="card">
          <div class="card-header">
            <div class="card-title" style="margin:0;">🌾 Catalog Inventory Quick View (${allProduce.length})</div>
            <button class="btn btn-secondary btn-sm" onclick="ExportUtils.exportProduce()" style="font-size:0.72rem; padding:0.2rem 0.45rem;">📥 CSV</button>
          </div>
          <div style="max-height:340px; overflow-y:auto; padding:0.75rem;">
            ${allProduce.slice(0, 30).map(p => `
              <div style="display:flex; justify-content:space-between; align-items:center; padding:0.5rem; border-bottom:1px solid var(--border-color); font-size:0.8rem;">
                <span>${p.icon || '🌱'} <b>${p.crop}</b> (${p.cat})</span>
                <div style="display:flex; align-items:center; gap:0.6rem;">
                  <span style="font-weight:700; color:var(--primary);">₹${p.price}/kg</span>
                  <span style="color:var(--text-muted); font-size:0.72rem;">${p.qty} kg</span>
                  <button class="icon-btn" data-adm-del-prod="${p.id}" title="Remove Listing" style="color:#ef4444; width:22px; height:22px; font-size:0.75rem;">✕</button>
                </div>
              </div>
            `).join('')}
            ${allProduce.length > 30 ? `<div style="text-align:center; padding:0.5rem; font-size:0.75rem; color:var(--text-muted);">+ ${allProduce.length - 30} more items in full catalog</div>` : ''}
          </div>
        </div>
      </div>
    `;

    this.renderOrdersList();
  },

  renderOrdersList() {
    const container = document.getElementById('adminOrdersContainer');
    if (!container) return;

    let os = window.Market ? Market.orders() : [];

    // Filter by status
    if (this.currentFilter !== 'All') {
      os = os.filter(o => (o.status || 'Placed') === this.currentFilter);
    }

    // Filter by search query
    if (this.searchQuery) {
      const q = this.searchQuery;
      os = os.filter(o => 
        String(o.buyerName || '').toLowerCase().includes(q) ||
        String(o.buyer || '').toLowerCase().includes(q) ||
        String(o.buyerPhone || '').toLowerCase().includes(q) ||
        String(o.buyerAddress || '').toLowerCase().includes(q) ||
        String(o.crop || '').toLowerCase().includes(q) ||
        String(o.id || '').toLowerCase().includes(q)
      );
    }

    if (!os.length) {
      container.innerHTML = `
        <div style="text-align:center; padding:2.5rem 1rem; color:var(--text-muted);">
          <div style="font-size:2.2rem; margin-bottom:0.4rem;">📭</div>
          <div style="font-size:0.95rem; font-weight:700; color:var(--text-primary);">No orders match this criteria</div>
          <div style="font-size:0.78rem;">Try selecting a different filter or clearing search keywords.</div>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="display:grid; gap:0.85rem; max-height:600px; overflow-y:auto; padding-right:0.3rem;">
        ${os.map(o => {
          const st = o.status || 'Placed';
          let stBg = '#f59e0b';
          if (st === 'Packed') stBg = '#3b82f6';
          if (st === 'Out for Delivery') stBg = '#8b5cf6';
          if (st === 'Delivered') stBg = '#10b981';
          if (st === 'Cancelled') stBg = '#ef4444';

          const dt = new Date(o.time || Date.now());
          const rate = o.price || (o.qty ? +(o.total / o.qty).toFixed(2) : 0);

          return `
            <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:12px; padding:1rem; display:flex; justify-content:space-between; align-items:flex-start; gap:1.2rem; flex-wrap:wrap; box-shadow:0 2px 8px rgba(0,0,0,0.06);">
              <div style="flex:1; min-width:260px;">
                <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.4rem; flex-wrap:wrap;">
                  <span style="font-weight:800; font-size:1.05rem; color:var(--text-primary);">${o.icon || '🌾'} ${o.crop}</span>
                  <span style="font-weight:800; font-size:0.9rem; color:var(--primary);">${o.qty} kg</span>
                  <span style="font-size:0.75rem; color:var(--text-muted);">(@ ₹${rate}/kg)</span>
                  <span style="font-size:0.75rem; padding:0.15rem 0.55rem; border-radius:99px; background:${stBg}; color:white; font-weight:700;">
                    ${st}
                  </span>
                  <span style="font-size:0.72rem; color:var(--text-muted);">Order #${o.id}</span>
                </div>

                <div style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:0.35rem;">
                  👤 <b>Customer:</b> <strong style="color:var(--text-primary);">${o.buyerName || 'Valued Customer'}</strong> 
                  (<a href="mailto:${o.buyer}" style="color:var(--primary); text-decoration:none;">${o.buyer || 'No email'}</a>)
                </div>

                <div style="font-size:0.8rem; color:var(--text-muted); display:flex; gap:1rem; flex-wrap:wrap; margin-bottom:0.35rem;">
                  <span>📞 <b>Phone:</b> ${o.buyerPhone || o.phone || '—'}</span>
                  <span>📍 <b>Address:</b> ${o.buyerAddress || o.address || 'Standard Farm Delivery'}</span>
                </div>

                <div style="font-size:0.72rem; color:var(--text-muted);">
                  🕒 <b>Order Placed:</b> ${dt.toLocaleDateString()} at ${dt.toLocaleTimeString()} · Seller: ${o.seller || 'GreenHorizon Farm'}
                </div>
              </div>

              <!-- Controls & Total -->
              <div style="display:flex; flex-direction:column; align-items:flex-end; gap:0.6rem; min-width:160px;">
                <div style="font-size:1.4rem; font-weight:800; color:var(--primary);">₹${o.total}</div>

                <div style="display:flex; align-items:center; gap:0.4rem;">
                  <select class="form-control" data-adm-status="${o.id}" style="padding:0.3rem 0.5rem; font-size:0.75rem; height:auto; cursor:pointer;">
                    <option value="Placed" ${st === 'Placed' ? 'selected' : ''}>⏳ Placed</option>
                    <option value="Packed" ${st === 'Packed' ? 'selected' : ''}>📦 Packed</option>
                    <option value="Out for Delivery" ${st === 'Out for Delivery' ? 'selected' : ''}>🚚 Out for Delivery</option>
                    <option value="Delivered" ${st === 'Delivered' ? 'selected' : ''}>✅ Delivered</option>
                    <option value="Cancelled" ${st === 'Cancelled' ? 'selected' : ''}>❌ Cancelled</option>
                  </select>
                </div>

                <div style="display:flex; align-items:center; gap:0.4rem;">
                  <button class="btn btn-secondary btn-sm" data-adm-receipt="${o.id}" title="Download / Print Invoice" style="font-size:0.75rem; padding:0.25rem 0.55rem; gap:0.3rem;">
                    🧾 Invoice
                  </button>
                  <button class="icon-btn" data-adm-del-order="${o.id}" title="Delete Order" style="color:#ef4444; width:30px; height:30px; font-size:0.85rem;">
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
};

window.AdminDashboard = AdminDashboard;
document.addEventListener('DOMContentLoaded', () => AdminDashboard.init());

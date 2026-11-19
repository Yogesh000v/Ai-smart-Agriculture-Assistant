/**
 * ============================================================================
 * AI Smart Agriculture Assistant - Export & Reporting Utilities
 * Provides Excel-compatible CSV exports with UTF-8 BOM encoding & Receipts.
 * ============================================================================
 */

const ExportUtils = {
  /**
   * Generic CSV Downloader
   * Prepends \uFEFF (UTF-8 BOM) so Microsoft Excel & LibreOffice display
   * UTF-8 characters (like ₹ and Hindi crop names) perfectly.
   */
  downloadCSV(filename, rows) {
    if (!rows || !rows.length) {
      if (window.App?.toast) App.toast("No records available to export.", "info");
      return;
    }

    let csvContent = "";
    if (typeof rows[0] === 'object' && !Array.isArray(rows[0])) {
      const headers = Object.keys(rows[0]);
      csvContent += headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(",") + "\r\n";
      rows.forEach(row => {
        const line = headers.map(h => {
          const val = row[h] == null ? "" : String(row[h]);
          return `"${val.replace(/"/g, '""')}"`;
        }).join(",");
        csvContent += line + "\r\n";
      });
    } else {
      rows.forEach(row => {
        const line = row.map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(",");
        csvContent += line + "\r\n";
      });
    }

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename.endsWith('.csv') ? filename : `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (window.App?.toast) App.toast(`📥 Exported: ${filename}`, "success");
  },

  /**
   * Export All Customer Orders to CSV
   */
  exportOrders(orders, filenamePrefix = 'AgroTech_Orders') {
    const list = orders || (window.Market ? Market.orders() : []);
    if (!list || !list.length) {
      if (window.App?.toast) App.toast("No orders to export.", "info");
      return;
    }

    const data = list.map((o, idx) => {
      const dt = new Date(o.time || Date.now());
      const rate = o.price || (o.qty ? +(o.total / o.qty).toFixed(2) : 0);
      return {
        "Order ID": o.id || (idx + 1),
        "Order Date": dt.toLocaleDateString(),
        "Order Time": dt.toLocaleTimeString(),
        "Customer Name": o.buyerName || o.buyer || "Customer",
        "Customer Email": o.buyer || "",
        "Customer Phone": o.buyerPhone || o.phone || "—",
        "Delivery Address": o.buyerAddress || o.address || "Farm Gate / Local Pickup",
        "Produce Item": o.crop || "",
        "Category": o.cat || "Vegetable / Crop",
        "Quantity (kg)": o.qty || 0,
        "Rate (INR/kg)": rate,
        "Total Amount (INR)": o.total || 0,
        "Order Status": o.status || "Placed",
        "Seller / Farm": o.seller || "GreenHorizon Smart Farm"
      };
    });

    const dateStamp = new Date().toISOString().slice(0, 10);
    this.downloadCSV(`${filenamePrefix}_${dateStamp}.csv`, data);
  },

  /**
   * Export Complete Marketplace Produce Catalog to CSV
   */
  exportProduce(items, filenamePrefix = 'AgroTech_Produce_Catalog') {
    const list = items || (window.Market ? Market.load() : []);
    if (!list || !list.length) {
      if (window.App?.toast) App.toast("No produce inventory to export.", "info");
      return;
    }

    const data = list.map((p, idx) => ({
      "Produce ID": p.id || (idx + 1),
      "Crop Name": p.crop,
      "Category": p.cat,
      "Available Stock (kg)": p.qty,
      "Price (INR/kg)": p.price,
      "Farm Location": p.loc || "Local Farm",
      "Seller / Producer": p.seller || "Farm Collective",
      "Grade / Quality": p.note || "Farm Fresh Certified"
    }));

    const dateStamp = new Date().toISOString().slice(0, 10);
    this.downloadCSV(`${filenamePrefix}_${dateStamp}.csv`, data);
  },

  /**
   * Export All Registered Accounts
   */
  exportUsers(users, filenamePrefix = 'AgroTech_Registered_Users') {
    const list = users || (window.LocalUsers ? LocalUsers.getAll() : []);
    if (!list || !list.length) {
      if (window.App?.toast) App.toast("No registered users to export.", "info");
      return;
    }

    const data = list.map((u, idx) => ({
      "User ID": u.id || (idx + 1),
      "Full Name": u.full_name,
      "Email Address": u.email,
      "Phone Number": u.phone || "—",
      "Account Role": u.role || "Customer / Buyer",
      "Farm / Estate": u.farm_name || "—",
      "Created At": u.created_at ? new Date(u.created_at).toLocaleString() : "—"
    }));

    const dateStamp = new Date().toISOString().slice(0, 10);
    this.downloadCSV(`${filenamePrefix}_${dateStamp}.csv`, data);
  },

  /**
   * Download a single order receipt / invoice (HTML print preview & save)
   */
  downloadReceipt(order) {
    if (!order) return;
    const dt = new Date(order.time || Date.now());
    const rate = order.price || (order.qty ? +(order.total / order.qty).toFixed(2) : 0);

    const win = window.open('', '_blank');
    if (!win) {
      // Popup blocked, fallback to CSV
      this.exportOrders([order], `Receipt_Order_${order.id}`);
      return;
    }

    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order Receipt #${order.id} - AI Smart Agriculture</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 2rem; color: #1e293b; background: #fff; }
          .receipt-box { max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 2rem; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #10b981; padding-bottom: 1rem; margin-bottom: 1.5rem; }
          .title { font-size: 1.3rem; font-weight: 800; color: #047857; margin: 0; }
          .meta { font-size: 0.85rem; color: #64748b; }
          .table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
          .table th { background: #f8fafc; text-align: left; padding: 0.6rem; font-size: 0.8rem; border-bottom: 1px solid #cbd5e1; }
          .table td { padding: 0.75rem 0.6rem; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; }
          .total-row { font-size: 1.2rem; font-weight: 800; color: #10b981; text-align: right; margin-top: 1rem; }
          .badge { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 99px; background: #10b981; color: #fff; font-size: 0.75rem; font-weight: 700; }
          .btn-print { background: #10b981; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; font-weight: 700; cursor: pointer; margin-top: 1.5rem; }
          @media print { .btn-print { display: none; } body { padding: 0; } .receipt-box { border: none; box-shadow: none; } }
        </style>
      </head>
      <body>
        <div class="receipt-box">
          <div class="header">
            <div>
              <h2 class="title">🌱 AI Smart Agriculture Market</h2>
              <div class="meta">Farm-Direct Fresh Produce Invoice & Delivery Pass</div>
            </div>
            <div style="text-align:right;">
              <span class="badge">${order.status || 'Placed'}</span>
              <div class="meta" style="margin-top:0.3rem;">Order #${order.id}</div>
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; margin-bottom:1.5rem;">
            <div>
              <div style="font-size:0.75rem; font-weight:700; color:#64748b; text-transform:uppercase;">Customer Details</div>
              <div style="font-weight:700; font-size:1rem; margin-top:0.2rem;">${order.buyerName || 'Valued Customer'}</div>
              <div style="font-size:0.85rem; color:#475569;">📞 ${order.buyerPhone || '—'}</div>
              <div style="font-size:0.85rem; color:#475569;">✉️ ${order.buyer || '—'}</div>
              <div style="font-size:0.85rem; color:#475569; margin-top:0.3rem;">📍 ${order.buyerAddress || 'Standard Farm Delivery'}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:0.75rem; font-weight:700; color:#64748b; text-transform:uppercase;">Order Information</div>
              <div style="font-size:0.85rem; color:#475569; margin-top:0.2rem;">Date: <b>${dt.toLocaleDateString()}</b></div>
              <div style="font-size:0.85rem; color:#475569;">Time: <b>${dt.toLocaleTimeString()}</b></div>
              <div style="font-size:0.85rem; color:#475569;">Seller: <b>${order.seller || 'GreenHorizon Farm'}</b></div>
              <div style="font-size:0.85rem; color:#10b981; font-weight:700; margin-top:0.3rem;">Payment: COD / Farm-Direct (PAID)</div>
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>Item Description</th>
                <th>Category</th>
                <th style="text-align:center;">Qty</th>
                <th style="text-align:right;">Rate</th>
                <th style="text-align:right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>${order.icon || '🌾'} ${order.crop}</b></td>
                <td>${order.cat || 'Fresh Harvest'}</td>
                <td style="text-align:center;">${order.qty} kg</td>
                <td style="text-align:right;">₹${rate}/kg</td>
                <td style="text-align:right; font-weight:700;">₹${order.total}</td>
              </tr>
            </tbody>
          </table>

          <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #e2e8f0; padding-top:1rem;">
            <div style="font-size:0.8rem; color:#64748b;">
              Direct from farm to fork. No middlemen.<br>
              Thank you for supporting sustainable agriculture!
            </div>
            <div class="total-row">
              Total: ₹${order.total}
            </div>
          </div>

          <div style="text-align:center;">
            <button class="btn-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
          </div>
        </div>
      </body>
      </html>
    `);
    win.document.close();
  }
};

window.ExportUtils = ExportUtils;

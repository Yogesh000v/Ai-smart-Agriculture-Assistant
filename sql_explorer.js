/**
 * ============================================================================
 * AI Smart Agriculture Assistant - SQL Data Analytics & Query Studio (JS)
 * Executes SQL statements on SQLite farm database and renders dynamic data tables.
 * Supports individual template execution and sequential auto-run through all queries.
 * ============================================================================
 */

const SQLExplorer = {
  currentData: [],
  currentCols: [],
  sequenceTimer: null,
  isSequencing: false,
  currentSequenceIndex: 0,

  quickQueries: {
    telemetry: {
      name: "Telemetry Logs (Latest)",
      sql: "SELECT id, node_id, soil_moisture, air_temperature, air_humidity, nitrogen, phosphorus, potassium, soil_ph, timestamp FROM telemetry_logs ORDER BY id DESC LIMIT 10;"
    },
    crops: {
      name: "Crops Reference Catalog",
      sql: "SELECT id, crop_name, category, optimal_temp_min, optimal_temp_max, target_n, target_p, target_k, market_price_per_ton, water_requirement FROM crops_catalog ORDER BY market_price_per_ton DESC;"
    },
    nodes: {
      name: "IoT Hardware Sensor Nodes",
      sql: "SELECT id, zone_name, mcu_model, firmware_version, battery_level, signal_rssi, status, last_ping FROM sensor_nodes;"
    },
    diseases: {
      name: "Disease Pathology Records",
      sql: "SELECT disease_code, disease_name, crop_name, pathogen_type, severity_level FROM disease_registry;"
    },
    irrigation: {
      name: "Irrigation Events Log",
      sql: "SELECT id, zone_id, trigger_type, moisture_before, duration_seconds, liters_consumed, timestamp FROM irrigation_events ORDER BY id DESC;"
    },
    users: {
      name: "User Accounts (Auth)",
      sql: "SELECT id, full_name, email, role, farm_name, phone, created_at FROM users;"
    }
  },

  init() {
    this.bindQuickButtons();
    this.bindRunButton();
    this.bindExportCSV();
    this.bindSequenceButton();

    // Run default query
    this.selectQueryTemplate('telemetry');
  },

  bindQuickButtons() {
    const btns = document.querySelectorAll('.sql-quick-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.stopSequence();
        const key = btn.getAttribute('data-query');
        this.selectQueryTemplate(key);
      });
    });
  },

  bindSequenceButton() {
    const seqBtn = document.getElementById('runAllQueriesBtn');
    if (seqBtn) {
      seqBtn.addEventListener('click', () => {
        if (this.isSequencing) {
          this.stopSequence();
        } else {
          this.startSequence();
        }
      });
    }
  },

  selectQueryTemplate(key) {
    const item = this.quickQueries[key];
    if (!item) return;

    // Update active button state
    document.querySelectorAll('.sql-quick-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-query') === key);
    });

    this.setQuery(item.sql);
    this.runCurrentQuery();
  },

  setQuery(sql) {
    const editor = document.getElementById('sqlQueryInput');
    if (editor) {
      editor.value = sql;
      // Brief glow effect to indicate editor update
      editor.style.borderColor = 'var(--primary)';
      setTimeout(() => { editor.style.borderColor = ''; }, 300);
    }
  },

  bindRunButton() {
    const btn = document.getElementById('runSqlQueryBtn');
    if (btn) {
      btn.addEventListener('click', () => {
        this.stopSequence();
        this.runCurrentQuery();
      });
    }
  },

  bindExportCSV() {
    const btn = document.getElementById('exportCsvBtn');
    if (btn) {
      btn.addEventListener('click', () => {
        if (!this.currentData.length) {
          App.toast("No records available to export.", "warning");
          return;
        }
        this.downloadCSV();
      });
    }
  },

  startSequence() {
    const keys = Object.keys(this.quickQueries);
    this.isSequencing = true;
    this.currentSequenceIndex = 0;

    const seqBtn = document.getElementById('runAllQueriesBtn');
    if (seqBtn) {
      seqBtn.innerHTML = '⏹ Stop Sequence';
      seqBtn.classList.remove('btn-secondary');
      seqBtn.classList.add('btn-accent');
    }

    App.toast("Running all SQL query templates sequentially...", "info");

    const runStep = () => {
      if (!this.isSequencing) return;

      const key = keys[this.currentSequenceIndex];
      this.selectQueryTemplate(key);

      const statsEl = document.getElementById('sqlQueryStats');
      if (statsEl) {
        const stepNum = this.currentSequenceIndex + 1;
        const total = keys.length;
        statsEl.innerHTML += ` &nbsp;|&nbsp; <span style="color:var(--primary); font-weight:700;">[Sequence ${stepNum}/${total}: ${this.quickQueries[key].name}]</span>`;
      }

      this.currentSequenceIndex = (this.currentSequenceIndex + 1) % keys.length;
      this.sequenceTimer = setTimeout(runStep, 3000);
    };

    runStep();
  },

  stopSequence() {
    if (!this.isSequencing) return;
    this.isSequencing = false;
    if (this.sequenceTimer) {
      clearTimeout(this.sequenceTimer);
      this.sequenceTimer = null;
    }
    const seqBtn = document.getElementById('runAllQueriesBtn');
    if (seqBtn) {
      seqBtn.innerHTML = '▶ Run All Sequentially';
      seqBtn.classList.remove('btn-accent');
      seqBtn.classList.add('btn-secondary');
    }
    App.toast("SQL sequential execution stopped.", "info");
  },

  async runCurrentQuery() {
    const editor = document.getElementById('sqlQueryInput');
    const query = editor ? editor.value.trim() : '';
    const statsEl = document.getElementById('sqlQueryStats');
    if (statsEl) statsEl.textContent = 'Executing SQL...';

    const t0 = performance.now();

    try {
      if (App.isBackendLive) {
        const res = await fetch(`${App.apiBase}/api/sql/query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: query, limit: 50 })
        });
        if (res.ok) {
          const data = await res.json();
          const t1 = performance.now();
          this.currentCols = data.columns;
          this.currentData = data.rows;
          this.renderTable(data.columns, data.rows);
          if (statsEl) {
            statsEl.innerHTML = `✓ <strong>${data.row_count} rows</strong> returned in <strong>${(t1 - t0).toFixed(1)} ms</strong> via SQLite`;
          }
          return;
        } else {
          const err = await res.json();
          if (statsEl) statsEl.innerHTML = `<span style="color:#ef4444;">${err.detail}</span>`;
          return;
        }
      }
    } catch (e) {
      // Backend error fallback
    }

    // Client-side SQLite simulation fallback with full dataset coverage
    const t1 = performance.now();
    const fallback = this.simulateSQL(query);
    this.currentCols = fallback.columns;
    this.currentData = fallback.rows;
    this.renderTable(fallback.columns, fallback.rows);
    if (statsEl) {
      statsEl.innerHTML = `✓ <strong>${fallback.rows.length} rows</strong> returned in <strong>${(t1 - t0).toFixed(1)} ms</strong> (Simulated DB)`;
    }
  },

  simulateSQL(query) {
    const q = query.toLowerCase();

    // 1. Crops Catalog
    if (q.includes("crops_catalog")) {
      const cols = ["id", "crop_name", "category", "optimal_temp_min", "optimal_temp_max", "target_n", "target_p", "target_k", "market_price_per_ton", "water_requirement"];
      const rows = [
        { id: 1, crop_name: "Rice (Paddy)", category: "Cereal", optimal_temp_min: 20, optimal_temp_max: 36, target_n: 90, target_p: 42, target_k: 40, market_price_per_ton: 380, water_requirement: "High" },
        { id: 2, crop_name: "Wheat", category: "Cereal", optimal_temp_min: 12, optimal_temp_max: 25, target_n: 105, target_p: 55, target_k: 45, market_price_per_ton: 320, water_requirement: "Medium" },
        { id: 3, crop_name: "Cotton", category: "Cash Crop", optimal_temp_min: 22, optimal_temp_max: 35, target_n: 120, target_p: 60, target_k: 50, market_price_per_ton: 950, water_requirement: "Low-Medium" },
        { id: 4, crop_name: "Tomato", category: "Vegetable", optimal_temp_min: 18, optimal_temp_max: 28, target_n: 100, target_p: 60, target_k: 80, market_price_per_ton: 420, water_requirement: "Medium" },
        { id: 5, crop_name: "Maize (Corn)", category: "Cereal", optimal_temp_min: 18, optimal_temp_max: 32, target_n: 80, target_p: 48, target_k: 40, market_price_per_ton: 260, water_requirement: "Medium" },
        { id: 6, crop_name: "Potato", category: "Tuber", optimal_temp_min: 15, optimal_temp_max: 22, target_n: 110, target_p: 70, target_k: 95, market_price_per_ton: 290, water_requirement: "Medium" },
        { id: 7, crop_name: "Chickpea", category: "Legume", optimal_temp_min: 16, optimal_temp_max: 28, target_n: 40, target_p: 60, target_k: 40, market_price_per_ton: 680, water_requirement: "Low" },
        { id: 8, crop_name: "Coffee", category: "Beverage Crop", optimal_temp_min: 18, optimal_temp_max: 27, target_n: 70, target_p: 45, target_k: 60, market_price_per_ton: 2400, water_requirement: "Medium" }
      ];
      return { columns: cols, rows: rows };
    }

    // 2. Sensor Nodes
    if (q.includes("sensor_nodes")) {
      const cols = ["id", "zone_name", "mcu_model", "firmware_version", "battery_level", "signal_rssi", "status", "last_ping"];
      const rows = [
        { id: "NODE-ESP32-01", zone_name: "Zone 1: Open Crop Field", mcu_model: "ESP32-WROOM-32D", firmware_version: "v2.4.1-C++", battery_level: 96.2, signal_rssi: -58, status: "ONLINE", last_ping: "Just now" },
        { id: "NODE-ESP32-02", zone_name: "Zone 2: Precision Greenhouse", mcu_model: "ESP32-S3-WIFI-BLE", firmware_version: "v2.4.1-C++", battery_level: 91.8, signal_rssi: -64, status: "ONLINE", last_ping: "1 min ago" },
        { id: "NODE-ESP32-03", zone_name: "Zone 3: Drip Orchard", mcu_model: "STM32F401-LoRa", firmware_version: "v1.8.0-C", battery_level: 88.4, signal_rssi: -72, status: "ONLINE", last_ping: "3 mins ago" }
      ];
      return { columns: cols, rows: rows };
    }

    // 3. Disease Registry
    if (q.includes("disease_registry")) {
      const cols = ["disease_code", "disease_name", "crop_name", "pathogen_type", "severity_level"];
      const rows = [
        { disease_code: "TOM-EB-01", disease_name: "Tomato Early Blight", crop_name: "Tomato", pathogen_type: "Fungal (Alternaria solani)", severity_level: "Moderate" },
        { disease_code: "POT-LB-02", disease_name: "Potato Late Blight", crop_name: "Potato", pathogen_type: "Oomycete (Phytophthora infestans)", severity_level: "Critical" },
        { disease_code: "RIC-BL-03", disease_name: "Rice Leaf Blast", crop_name: "Rice", pathogen_type: "Fungal (Magnaporthe oryzae)", severity_level: "Critical" },
        { disease_code: "CRN-NL-04", disease_name: "Corn Northern Leaf Blight", crop_name: "Maize", pathogen_type: "Fungal (Exserohilum turcicum)", severity_level: "Moderate" },
        { disease_code: "APP-SC-05", disease_name: "Apple Scab", crop_name: "Apple", pathogen_type: "Fungal (Venturia inaequalis)", severity_level: "Moderate" },
        { disease_code: "PLT-HL-00", disease_name: "Healthy Plant Specimen", crop_name: "Universal", pathogen_type: "None (Vigorous)", severity_level: "None" }
      ];
      return { columns: cols, rows: rows };
    }

    // 4. Irrigation Events Log
    if (q.includes("irrigation_events")) {
      const cols = ["id", "zone_id", "trigger_type", "moisture_before", "duration_seconds", "liters_consumed", "timestamp"];
      const rows = [
        { id: 101, zone_id: "Zone 1 (Field)", trigger_type: "AI_AUTO_THRESHOLD", moisture_before: 26.5, duration_seconds: 480, liters_consumed: 360.0, timestamp: "Today, 06:30 AM" },
        { id: 102, zone_id: "Zone 2 (Greenhouse)", trigger_type: "MANUAL_WEB_PANEL", moisture_before: 44.0, duration_seconds: 240, liters_consumed: 180.0, timestamp: "Today, 08:15 AM" },
        { id: 103, zone_id: "Zone 1 (Field)", trigger_type: "AI_AUTO_THRESHOLD", moisture_before: 28.2, duration_seconds: 300, liters_consumed: 225.0, timestamp: "Today, 11:00 AM" },
        { id: 104, zone_id: "Zone 3 (Orchard)", trigger_type: "SCHEDULED_EVAPOTRANSPIRATION", moisture_before: 38.0, duration_seconds: 360, liters_consumed: 270.0, timestamp: "Yesterday, 05:45 PM" },
        { id: 105, zone_id: "Zone 2 (Greenhouse)", trigger_type: "AI_AUTO_THRESHOLD", moisture_before: 31.0, duration_seconds: 200, liters_consumed: 150.0, timestamp: "Yesterday, 09:20 PM" }
      ];
      return { columns: cols, rows: rows };
    }

    // 5. Users Accounts
    if (q.includes("users")) {
      const cols = ["id", "full_name", "email", "role", "farm_name", "phone", "created_at"];
      const rows = [
        { id: 1, full_name: "Dr. Ramesh Patel", email: "admin@agrotech.com", role: "Chief Agronomist & Farm Manager", farm_name: "GreenHorizon Smart Agro-Tech Farm", phone: "+91 98765 43210", created_at: "2026-11-10 10:00:00" },
        { id: 2, full_name: "Anand Kumar", email: "farmer@agrotech.com", role: "Field Operations Specialist", farm_name: "GreenHorizon Sector 4", phone: "+91 98123 45678", created_at: "2026-11-11 14:30:00" }
      ];
      return { columns: cols, rows: rows };
    }

    // 6. Default Fallback: Telemetry Logs
    const cols = ["id", "node_id", "soil_moisture", "air_temperature", "air_humidity", "nitrogen", "phosphorus", "potassium", "soil_ph", "timestamp"];
    const rows = [];
    const now = Date.now();
    for (let i = 1; i <= 10; i++) {
      rows.push({
        id: i,
        node_id: "NODE-ESP32-01",
        soil_moisture: +(33.5 - i * 0.35).toFixed(1),
        air_temperature: +(28.2 + (i % 3) * 0.7).toFixed(1),
        air_humidity: +(57.0 - (i % 4) * 1.1).toFixed(1),
        nitrogen: +(76.5 + (i % 2) * 0.8).toFixed(1),
        phosphorus: +(43.8 + (i % 2) * 0.4).toFixed(1),
        potassium: +(39.2 + (i % 2) * 0.5).toFixed(1),
        soil_ph: 6.45,
        timestamp: new Date(now - i * 120000).toLocaleTimeString()
      });
    }
    return { columns: cols, rows: rows };
  },

  renderTable(columns, rows) {
    const head = document.getElementById('sqlTableHead');
    const body = document.getElementById('sqlTableBody');
    if (!head || !body) return;

    if (!columns.length || !rows.length) {
      head.innerHTML = '<tr><th>Result</th></tr>';
      body.innerHTML = '<tr><td style="color:var(--text-muted); text-align:center; padding:1.5rem;">0 matching records found.</td></tr>';
      return;
    }

    head.innerHTML = `<tr>${columns.map(c => `<th>${c}</th>`).join('')}</tr>`;
    body.innerHTML = rows.map(r => `
      <tr>${columns.map(c => `<td>${r[c] !== null && r[c] !== undefined ? r[c] : '<em style="color:#64748b">null</em>'}</td>`).join('')}</tr>
    `).join('');

    // Trigger subtle fade-in animation on table container
    const tableWrap = document.querySelector('.table-responsive');
    if (tableWrap) {
      tableWrap.style.animation = 'none';
      tableWrap.offsetHeight; // trigger reflow
      tableWrap.style.animation = 'fadeIn 0.25s ease-in-out';
    }
  },

  downloadCSV() {
    if (!this.currentCols.length || !this.currentData.length) return;

    let csv = this.currentCols.join(',') + '\n';
    this.currentData.forEach(row => {
      const line = this.currentCols.map(c => {
        let val = row[c] === null || row[c] === undefined ? '' : String(row[c]);
        if (val.includes(',') || val.includes('"')) {
          val = `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      }).join(',');
      csv += line + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agri_data_export_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    App.toast("CSV file exported successfully.", "success");
  }
};

window.SQLExplorer = SQLExplorer;
document.addEventListener('DOMContentLoaded', () => SQLExplorer.init());

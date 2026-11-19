/**
 * ============================================================================
 * AI Smart Agriculture Assistant - Smart Irrigation Controller (JavaScript)
 * Manages solenoid valves, calculates water usage, and runs automated watering logic.
 * ============================================================================
 */

const IrrigationCtrl = {
  valves: {
    1: { id: 1, name: "Zone 1: Open Crop Field", active: false, timer: null, seconds: 0, litersToday: 460 },
    2: { id: 2, name: "Zone 2: Precision Greenhouse", active: false, timer: null, seconds: 0, litersToday: 180 },
    3: { id: 3, name: "Zone 3: Drip Orchard", active: false, timer: null, seconds: 0, litersToday: 290 }
  },
  autoModeEnabled: true,
  thresholdMoisture: 32.0,

  init() {
    this.bindValveSwitches();
    this.bindAutoToggle();
    this.startAutoCheckInterval();
    this.renderWeatherForecast();
  },

  bindValveSwitches() {
    [1, 2, 3].forEach(id => {
      const toggle = document.getElementById(`valveSwitch${id}`);
      if (toggle) {
        toggle.addEventListener('change', (e) => {
          this.setValveState(id, e.target.checked, 'MANUAL_WEB_PANEL');
        });
      }
    });
  },

  bindAutoToggle() {
    const autoSw = document.getElementById('autoIrrigationSwitch');
    if (autoSw) {
      autoSw.addEventListener('change', (e) => {
        this.autoModeEnabled = e.target.checked;
        const statusTag = document.getElementById('autoStatusTag');
        if (statusTag) {
          statusTag.textContent = this.autoModeEnabled ? 'ACTIVE (Threshold 32%)' : 'PAUSED (Manual Only)';
          statusTag.style.color = this.autoModeEnabled ? '#10b981' : '#f59e0b';
        }
        App.toast(`Automated Irrigation System ${this.autoModeEnabled ? 'Armed' : 'Paused'}.`);
      });
    }
  },

  setValveState(id, state, reason = 'MANUAL') {
    const valve = this.valves[id];
    if (!valve) return;

    valve.active = state;
    const card = document.getElementById(`valveCard${id}`);
    const toggle = document.getElementById(`valveSwitch${id}`);
    const statusText = document.getElementById(`valveStatus${id}`);

    if (toggle) toggle.checked = state;
    if (card) card.classList.toggle('active', state);

    if (state) {
      if (statusText) statusText.innerHTML = '<span style="color:#3b82f6; font-weight:700;">● IRRIGATING (Flow: 45 L/min)</span>';
      App.toast(`${valve.name} Valve OPENED [${reason}].`, "info");

      // Start water timer
      if (!valve.timer) {
        valve.timer = setInterval(() => {
          valve.seconds++;
          valve.litersToday += 0.75; // 45L / 60s
          const flowEl = document.getElementById(`valveLiters${id}`);
          if (flowEl) flowEl.textContent = `${Math.round(valve.litersToday)} L`;
        }, 1000);
      }

      // Notify Python backend if available
      if (App.isBackendLive) {
        fetch(`${App.apiBase}/api/irrigation/control`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ zone_id: valve.name, valve_id: id, state: "ON", duration_seconds: 300, trigger_reason: reason })
        }).catch(() => {});
      }
    } else {
      if (statusText) statusText.innerHTML = '<span style="color:var(--text-muted);">● STANDBY (Closed)</span>';
      if (valve.timer) {
        clearInterval(valve.timer);
        valve.timer = null;
      }
      App.toast(`${valve.name} Valve CLOSED.`, "info");

      if (App.isBackendLive) {
        fetch(`${App.apiBase}/api/irrigation/control`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ zone_id: valve.name, valve_id: id, state: "OFF", duration_seconds: 0, trigger_reason: reason })
        }).catch(() => {});
      }
    }
  },

  startAutoCheckInterval() {
    setInterval(() => {
      if (!this.autoModeEnabled) return;
      const currentMoisture = window.IoTMonitor ? window.IoTMonitor.currentTelemetry.soil_moisture : 35.0;

      // If soil moisture drops below threshold and valve is not currently active
      if (currentMoisture < this.thresholdMoisture && !this.valves[1].active) {
        this.setValveState(1, true, 'AI_AUTO_THRESHOLD_CRITICAL');
        App.toast(`🚨 AI Smart Trigger: Soil moisture dropped to ${currentMoisture}%. Zone 1 Valve activated.`, "warning");

        // Automatically shut off after 20 seconds for demo safety
        setTimeout(() => {
          if (this.valves[1].active) {
            this.setValveState(1, false, 'AI_AUTO_COMPLETED');
            if (window.IoTMonitor) {
              window.IoTMonitor.currentTelemetry.soil_moisture = 52.0; // Restored
              window.IoTMonitor.updateGauges(window.IoTMonitor.currentTelemetry);
            }
          }
        }, 20000);
      }
    }, 7000);
  },

  renderWeatherForecast() {
    const days = [
      { day: "Today", temp: "31°C", cond: "Sunny / Dry", rain: "5%", et0: "4.8mm", icon: "☀️" },
      { day: "Tomorrow", temp: "29°C", cond: "Partly Cloudy", rain: "20%", et0: "4.2mm", icon: "⛅" },
      { day: "Thursday", temp: "26°C", cond: "Light Showers", rain: "65%", et0: "2.6mm", icon: "🌦️" },
      { day: "Friday", temp: "27°C", cond: "Scattered Rain", rain: "75%", et0: "2.1mm", icon: "🌧️" },
      { day: "Saturday", temp: "30°C", cond: "Clear Sky", rain: "10%", et0: "4.9mm", icon: "☀️" }
    ];

    const wrap = document.getElementById('weatherForecastGrid');
    if (!wrap) return;

    wrap.innerHTML = days.map(d => `
      <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:8px; padding:0.85rem; text-align:center;">
        <div style="font-size:0.78rem; font-weight:600; color:var(--text-secondary); margin-bottom:0.25rem;">${d.day}</div>
        <div style="font-size:1.6rem; margin-bottom:0.25rem;">${d.icon}</div>
        <div style="font-size:1rem; font-weight:700;">${d.temp}</div>
        <div style="font-size:0.72rem; color:var(--text-muted);">${d.cond}</div>
        <div style="margin-top:0.4rem; padding-top:0.4rem; border-top:1px solid var(--border-color); font-size:0.7rem; color:#3b82f6;">
          Rain: ${d.rain} · ET₀: ${d.et0}
        </div>
      </div>
    `).join('');
  }
};

window.IrrigationCtrl = IrrigationCtrl;
document.addEventListener('DOMContentLoaded', () => IrrigationCtrl.init());

/**
 * ============================================================================
 * AI Smart Agriculture Assistant - IoT Telemetry Monitor (JavaScript)
 * Updates real-time gauges, runs live Chart.js sensor trends, and connects to SSE.
 * ============================================================================
 */

const IoTMonitor = {
  chart: null,
  historyData: {
    labels: [],
    moisture: [],
    temperature: [],
    humidity: []
  },

  currentTelemetry: {
    node_id: "NODE-ESP32-01",
    soil_moisture: 33.4,
    soil_temperature: 24.2,
    air_temperature: 28.5,
    air_humidity: 57.0,
    nitrogen: 78.0,
    phosphorus: 44.0,
    potassium: 40.0,
    soil_ph: 6.45,
    solar_radiation: 810.0,
    rain_index: 0.0,
    battery_level: 96.2,
    timestamp: new Date().toLocaleTimeString()
  },

  init() {
    this.initChart();
    this.seedInitialHistory();
    this.connectTelemetryStream();
    this.updateGauges(this.currentTelemetry);

    // Quick injection button listener
    const pulseBtn = document.getElementById('injectTelemetryBtn');
    if (pulseBtn) {
      pulseBtn.addEventListener('click', () => {
        this.injectSimulatedTick();
        App.toast("Sensor reading refreshed.", "success");
      });
    }
  },

  seedInitialHistory() {
    const now = new Date();
    for (let i = 10; i >= 0; i--) {
      const t = new Date(now.getTime() - i * 60000);
      const timeStr = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      this.historyData.labels.push(timeStr);
      this.historyData.moisture.push(+(36.0 - (10 - i) * 0.28 + (Math.random() * 0.4)).toFixed(1));
      this.historyData.temperature.push(+(27.5 + Math.sin(i / 3) * 1.5).toFixed(1));
      this.historyData.humidity.push(+(55.0 + Math.cos(i / 3) * 3.0).toFixed(1));
    }
    if (this.chart) this.chart.update();
  },

  initChart() {
    const ctx = document.getElementById('telemetryChart');
    if (!ctx || typeof Chart === 'undefined') return;

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.historyData.labels,
        datasets: [
          {
            label: 'Soil Moisture (%)',
            data: this.historyData.moisture,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.35,
            borderWidth: 2,
            yAxisID: 'y'
          },
          {
            label: 'Air Temp (°C)',
            data: this.historyData.temperature,
            borderColor: '#f97316',
            backgroundColor: 'transparent',
            borderDash: [4, 4],
            tension: 0.35,
            borderWidth: 2,
            yAxisID: 'y1'
          },
          {
            label: 'Air Humidity (%)',
            data: this.historyData.humidity,
            borderColor: '#10b981',
            backgroundColor: 'transparent',
            tension: 0.35,
            borderWidth: 1.5,
            yAxisID: 'y'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            labels: { boxWidth: 12, color: '#94a3b8', font: { size: 11 } }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleColor: '#f1f5f9',
            bodyColor: '#cbd5e1'
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#64748b', font: { size: 10 } }
          },
          y: {
            type: 'linear',
            position: 'left',
            min: 0,
            max: 100,
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#64748b', font: { size: 10 }, callback: v => v + '%' }
          },
          y1: {
            type: 'linear',
            position: 'right',
            min: 15,
            max: 45,
            grid: { drawOnChartArea: false },
            ticks: { color: '#f97316', font: { size: 10 }, callback: v => v + '°C' }
          }
        }
      }
    });
  },

  connectTelemetryStream() {
    // 1. Try Node.js SSE Stream
    try {
      const eventSource = new EventSource(`${App.nodeGatewayBase}/api/iot/stream`);
      eventSource.addEventListener('telemetry', (e) => {
        const data = JSON.parse(e.data);
        this.onNewTelemetry(data);
      });
      eventSource.onerror = () => {
        eventSource.close();
        this.fallbackPolling();
      };
    } catch (e) {
      this.fallbackPolling();
    }
  },

  fallbackPolling() {
    // 2. Poll Python FastAPI or simulate ticks
    setInterval(async () => {
      if (App.isBackendLive) {
        try {
          const res = await fetch(`${App.apiBase}/api/sensors/latest`);
          if (res.ok) {
            const data = await res.json();
            this.onNewTelemetry(data);
            return;
          }
        } catch (e) {}
      }
      // Autonomous simulation tick if neither is reachable
      this.injectSimulatedTick();
    }, 3000);
  },

  injectSimulatedTick() {
    const deltaMoist = (Math.random() * 0.3) - 0.2;
    this.currentTelemetry.soil_moisture = Math.max(19.0, Math.min(65.0, +(this.currentTelemetry.soil_moisture + deltaMoist).toFixed(1)));
    this.currentTelemetry.air_temperature = +(28.0 + Math.sin(Date.now() / 25000) * 3.0 + (Math.random() * 0.2)).toFixed(1);
    this.currentTelemetry.air_humidity = Math.max(35.0, Math.min(85.0, +(57.0 - Math.sin(Date.now() / 25000) * 4.0).toFixed(1)));
    this.currentTelemetry.soil_temperature = +(this.currentTelemetry.air_temperature - 3.2).toFixed(1);
    this.currentTelemetry.solar_radiation = Math.max(0.0, +(790.0 + (Math.random() * 20 - 10)).toFixed(0));
    this.currentTelemetry.timestamp = new Date().toLocaleTimeString();

    this.onNewTelemetry(this.currentTelemetry);
  },

  onNewTelemetry(data) {
    this.currentTelemetry = { ...this.currentTelemetry, ...data };
    this.updateGauges(this.currentTelemetry);

    // Update history chart
    if (this.chart) {
      const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      this.historyData.labels.push(timeLabel);
      this.historyData.moisture.push(data.soil_moisture);
      this.historyData.temperature.push(data.air_temperature);
      this.historyData.humidity.push(data.air_humidity);

      if (this.historyData.labels.length > 15) {
        this.historyData.labels.shift();
        this.historyData.moisture.shift();
        this.historyData.temperature.shift();
        this.historyData.humidity.shift();
      }
      this.chart.update('none');
    }
  },

  updateGauges(d) {
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    const setProgress = (id, pct) => {
      const el = document.getElementById(id);
      if (el) el.style.width = Math.min(100, Math.max(0, pct)) + '%';
    };

    setVal('valMoisture', d.soil_moisture);
    setProgress('barMoisture', d.soil_moisture);

    setVal('valTemp', d.air_temperature);
    setProgress('barTemp', (d.air_temperature / 50) * 100);

    setVal('valSoilTemp', d.soil_temperature || (d.air_temperature - 3.2).toFixed(1));
    setVal('valHumidity', d.air_humidity);
    setProgress('barHumidity', d.air_humidity);

    setVal('valNPK', `${Math.round(d.nitrogen || 78)}-${Math.round(d.phosphorus || 44)}-${Math.round(d.potassium || 40)}`);
    setVal('valPH', d.soil_ph ? Number(d.soil_ph).toFixed(1) : '6.5');
    setProgress('barPH', ((d.soil_ph || 6.5) / 14) * 100);

    setVal('valSolar', Math.round(d.solar_radiation || 800));
    setProgress('barSolar', ((d.solar_radiation || 800) / 1200) * 100);

    setVal('valRain', d.rain_index || '0.0');

    // Soil Moisture status text
    const moistStatus = document.getElementById('statusMoisture');
    if (moistStatus) {
      if (d.soil_moisture < 28) {
        moistStatus.innerHTML = '<span style="color:#ef4444;">⚠️ Low Moisture (Irrigate)</span>';
      } else if (d.soil_moisture <= 55) {
        moistStatus.innerHTML = '<span style="color:#10b981;">✓ Optimal Field Capacity</span>';
      } else {
        moistStatus.innerHTML = '<span style="color:#3b82f6;">💧 High Saturation</span>';
      }
    }
  },

  resizeChart() {
    if (this.chart) this.chart.resize();
  }
};

window.IoTMonitor = IoTMonitor;
document.addEventListener('DOMContentLoaded', () => IoTMonitor.init());

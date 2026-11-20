/**
 * ============================================================================
 * AI Smart Agriculture Assistant - Live Agro-Meteorological Weather Service
 * Real-time satellite & ground station weather via Open-Meteo API (Free, No Key).
 * Supports automatic GPS location, global city search, live ET0 & agro-advisory.
 * ============================================================================
 */

const LiveWeather = {
  // Default Station Coordinates: New Delhi / Rohtak Agro Hub
  currentLoc: {
    lat: 28.6139,
    lng: 77.2090,
    name: "New Delhi / NCR Agro Basin",
    isLive: true
  },

  knownCities: {
    delhi: { lat: 28.6139, lng: 77.2090, name: "Delhi NCR Agro Basin" },
    karnal: { lat: 29.6857, lng: 76.9905, name: "Karnal Rice & Wheat Belt, Haryana" },
    rohtak: { lat: 28.8955, lng: 76.6066, name: "Rohtak Agro Hub, Haryana" },
    nashik: { lat: 19.9975, lng: 73.7898, name: "Nashik Onion & Grape Valley, Maharashtra" },
    indore: { lat: 22.7196, lng: 75.8577, name: "Indore Malwa Plateau, MP" },
    jaipur: { lat: 26.9124, lng: 75.7873, name: "Jaipur Semi-Arid Basin, Rajasthan" },
    lucknow: { lat: 26.8467, lng: 80.9462, name: "Lucknow Ganga Alluvial Plain, UP" },
    agra: { lat: 27.1767, lng: 78.0081, name: "Agra Potato Belt, UP" },
    mumbai: { lat: 19.0760, lng: 72.8777, name: "Mumbai Coastal Zone, Maharashtra" },
    bengaluru: { lat: 12.9716, lng: 77.5946, name: "Bengaluru Deccan Plateau, Karnataka" },
    kolkata: { lat: 22.5726, lng: 88.3639, name: "Kolkata Deltaic Region, West Bengal" }
  },

  wmoCodes: {
    0: { label: "Clear Sky", icon: "☀️", advice: "Ideal for spraying & drying crops. Check soil moisture." },
    1: { label: "Mainly Clear", icon: "🌤️", advice: "Good solar radiation. Favorable for photosynthesis." },
    2: { label: "Partly Cloudy", icon: "⛅", advice: "Moderate canopy transpiration. Standard irrigation." },
    3: { label: "Overcast", icon: "☁️", advice: "Low solar insolation. Watch for fungal leaf humidity." },
    45: { label: "Foggy", icon: "🌫️", advice: "High morning moisture. Risk of late blight / downy mildew." },
    48: { label: "Depositing Rime Fog", icon: "🌫️", advice: "Cold moist canopy. Delay foliar chemical sprays." },
    51: { label: "Light Drizzle", icon: "🌦️", advice: "Light surface wetting. Postpone dusting." },
    53: { label: "Moderate Drizzle", icon: "🌦️", advice: "Light drizzle. Pause field spraying operations." },
    55: { label: "Dense Drizzle", icon: "🌧️", advice: "Natural moisture. Turn off automated valves." },
    61: { label: "Slight Rain", icon: "🌧️", advice: "Rain in progress. Natural irrigation active." },
    63: { label: "Moderate Rain", icon: "🌧️", advice: "Sufficient rainfall. Stop automated drip pumps." },
    65: { label: "Heavy Rain", icon: "⛈️", advice: "Ensure field drainage. Avoid fertilizer leaching." },
    80: { label: "Rain Showers", icon: "🌦️", advice: "Intermittent showers. Check drainage channels." },
    81: { label: "Moderate Showers", icon: "🌧️", advice: "Rain showers. Suspend harvesting operations." },
    82: { label: "Violent Showers", icon: "⛈️", advice: "Heavy precipitation alert. Inspect bunds." },
    95: { label: "Thunderstorm", icon: "⚡", advice: "Severe storm alert. Protect polyhouse & nursery." }
  },

  init() {
    this.loadSavedLocation();
    this.bindEvents();
    this.fetchWeather();

    // Auto-refresh live weather every 8 minutes
    setInterval(() => this.fetchWeather(), 8 * 60 * 1000);
  },

  loadSavedLocation() {
    try {
      const saved = JSON.parse(localStorage.getItem('agri_weather_loc'));
      if (saved && saved.lat && saved.lng) {
        this.currentLoc = saved;
      }
    } catch (e) {}
  },

  saveLocation(loc) {
    this.currentLoc = loc;
    localStorage.setItem('agri_weather_loc', JSON.stringify(loc));
  },

  bindEvents() {
    const gpsBtn = document.getElementById('btnWeatherGPS');
    if (gpsBtn) {
      gpsBtn.addEventListener('click', () => this.detectGPSLocation());
    }

    const cityInput = document.getElementById('weatherCityInput');
    const searchBtn = document.getElementById('btnWeatherSearch');
    if (searchBtn && cityInput) {
      searchBtn.addEventListener('click', () => this.searchCity(cityInput.value.trim()));
      cityInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.searchCity(cityInput.value.trim());
      });
    }

    // Quick city buttons
    document.querySelectorAll('[data-city]').forEach(btn => {
      btn.addEventListener('click', () => {
        const cityKey = btn.getAttribute('data-city').toLowerCase();
        if (this.knownCities[cityKey]) {
          this.saveLocation({ ...this.knownCities[cityKey], isLive: true });
          this.fetchWeather();
        }
      });
    });
  },

  detectGPSLocation() {
    if (!navigator.geolocation) {
      if (window.App?.toast) App.toast("Geolocation is not supported by your browser.", "error");
      return;
    }

    if (window.App?.toast) App.toast("📍 Fetching live GPS coordinates from your device...", "info");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = +pos.coords.latitude.toFixed(4);
        const lng = +pos.coords.longitude.toFixed(4);
        this.saveLocation({
          lat,
          lng,
          name: `My Location (${lat}°N, ${lng}°E)`,
          isLive: true
        });
        if (window.App?.toast) App.toast("📍 Live location acquired! Updating forecast...", "success");
        this.fetchWeather();
      },
      (err) => {
        if (window.App?.toast) App.toast("GPS permission denied or unavailable. Using station coordinates.", "warning");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  },

  async searchCity(query) {
    if (!query) return;
    const clean = query.toLowerCase();

    // Check predefined list first
    if (this.knownCities[clean]) {
      this.saveLocation({ ...this.knownCities[clean], isLive: true });
      this.fetchWeather();
      return;
    }

    if (window.App?.toast) App.toast(`🔍 Searching satellite location for "${query}"...`, "info");

    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.results && data.results.length > 0) {
          const r = data.results[0];
          const locName = `${r.name}${r.admin1 ? ', ' + r.admin1 : ''}${r.country ? ' (' + r.country + ')' : ''}`;
          this.saveLocation({
            lat: +r.latitude.toFixed(4),
            lng: +r.longitude.toFixed(4),
            name: locName,
            isLive: true
          });
          if (window.App?.toast) App.toast(`Found location: ${locName}`, "success");
          this.fetchWeather();
          return;
        }
      }
    } catch (e) {
      // Offline fallback
    }

    if (window.App?.toast) App.toast(`Could not find "${query}". Please check spelling.`, "error");
  },

  async fetchWeather() {
    const loc = this.currentLoc;
    const badge = document.getElementById('weatherLiveBadge');
    const stationLabel = document.getElementById('weatherStationLabel');

    if (stationLabel) {
      stationLabel.textContent = `Station: ${loc.name}`;
    }

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,et0_fao_evapotranspiration&timezone=auto`;
      const res = await fetch(url, { signal: (window.timeoutSignal ? window.timeoutSignal(7000) : undefined) });

      if (res.ok) {
        const data = await res.json();
        this.renderLiveWeather(data, true);
        return;
      }
    } catch (e) {
      // Failed to reach Open-Meteo -> Offline fallback
    }

    // Render Offline Simulated Weather
    this.renderSimulatedWeather();
  },

  renderLiveWeather(data, isLive) {
    const cur = data.current || {};
    const daily = data.daily || {};
    const wCode = cur.weather_code != null ? cur.weather_code : (daily.weather_code ? daily.weather_code[0] : 0);
    const wInfo = this.wmoCodes[wCode] || { label: "Fair Weather", icon: "🌤️", advice: "Normal field conditions." };

    const temp = Math.round(cur.temperature_2m ?? 28);
    const feelsLike = Math.round(cur.apparent_temperature ?? temp);
    const humidity = Math.round(cur.relative_humidity_2m ?? 55);
    const wind = Math.round(cur.wind_speed_10m ?? 12);
    const rainProb = daily.precipitation_probability_max ? daily.precipitation_probability_max[0] : 10;
    const et0 = daily.et0_fao_evapotranspiration ? daily.et0_fao_evapotranspiration[0] : 4.2;

    const badge = document.getElementById('weatherLiveBadge');
    if (badge) {
      badge.innerHTML = isLive
        ? `<span class="live-pulse-dot" style="width:7px; height:7px; border-radius:50%; background:#ef4444; display:inline-block; animation:pulse 1.5s infinite;"></span> LIVE SATELLITE`
        : `<span style="width:7px; height:7px; border-radius:50%; background:#f59e0b; display:inline-block;"></span> SIMULATED`;
      badge.style.color = isLive ? '#ef4444' : '#f59e0b';
      badge.style.borderColor = isLive ? 'rgba(239,68,68,0.4)' : 'rgba(245,158,11,0.4)';
    }

    // 1. Render Current Weather Banner
    const banner = document.getElementById('weatherCurrentBanner');
    if (banner) {
      banner.innerHTML = `
        <div style="display:flex; align-items:center; gap:1.2rem;">
          <div style="font-size:3.2rem; line-height:1;">${wInfo.icon}</div>
          <div>
            <div style="display:flex; align-items:baseline; gap:0.5rem;">
              <span style="font-size:2.4rem; font-weight:800; color:var(--text-primary); line-height:1;">${temp}°C</span>
              <span style="font-size:0.85rem; color:var(--text-muted);">Feels like ${feelsLike}°C</span>
            </div>
            <div style="font-size:1.05rem; font-weight:700; color:var(--primary); margin-top:0.2rem;">${wInfo.label}</div>
            <div style="font-size:0.75rem; color:var(--text-secondary); max-width:400px; margin-top:0.25rem;">
              🌱 <b>Agro-Advisory:</b> ${wInfo.advice}
            </div>
          </div>
        </div>

        <div style="display:flex; gap:1.5rem; flex-wrap:wrap; border-left:1px solid var(--border-color); padding-left:1.5rem;">
          <div>
            <div style="font-size:0.72rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Humidity</div>
            <div style="font-size:1.15rem; font-weight:800; color:#3b82f6;">💧 ${humidity}%</div>
            <div style="font-size:0.7rem; color:var(--text-muted);">VPD: Safe</div>
          </div>
          <div>
            <div style="font-size:0.72rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Wind Speed</div>
            <div style="font-size:1.15rem; font-weight:800; color:#10b981;">💨 ${wind} km/h</div>
            <div style="font-size:0.7rem; color:var(--text-muted);">Light Breeze</div>
          </div>
          <div>
            <div style="font-size:0.72rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Rain Chance</div>
            <div style="font-size:1.15rem; font-weight:800; color:#8b5cf6;">🌧️ ${rainProb}%</div>
            <div style="font-size:0.7rem; color:var(--text-muted);">${rainProb > 40 ? 'Rain Likely' : 'Dry Envelope'}</div>
          </div>
          <div>
            <div style="font-size:0.72rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Daily ET₀</div>
            <div style="font-size:1.15rem; font-weight:800; color:#f59e0b;">☀️ ${et0} mm</div>
            <div style="font-size:0.7rem; color:var(--text-muted);">Evapotranspiration</div>
          </div>
        </div>
      `;
    }

    // 2. Render 5-Day Precision Forecast Grid
    const grid = document.getElementById('weatherForecastGrid');
    if (grid && daily.time) {
      const daysCount = Math.min(5, daily.time.length);
      let gridHtml = '';

      for (let i = 0; i < daysCount; i++) {
        const dateStr = daily.time[i];
        const dt = new Date(dateStr);
        const dayName = i === 0 ? "Today" : i === 1 ? "Tomorrow" : dt.toLocaleDateString('en-US', { weekday: 'short' });
        const dateDisplay = dt.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

        const code = daily.weather_code ? daily.weather_code[i] : 0;
        const info = this.wmoCodes[code] || { label: "Fair", icon: "🌤️" };
        const maxT = Math.round(daily.temperature_2m_max[i]);
        const minT = Math.round(daily.temperature_2m_min[i]);
        const prob = daily.precipitation_probability_max ? daily.precipitation_probability_max[i] : 5;
        const dayEt = daily.et0_fao_evapotranspiration ? daily.et0_fao_evapotranspiration[i] : (4.0 + (i * 0.2)).toFixed(1);

        gridHtml += `
          <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:10px; padding:0.9rem; text-align:center; transition:transform 0.2s;" onmouseenter="this.style.transform='translateY(-3px)'" onmouseleave="this.style.transform='none'">
            <div style="font-size:0.82rem; font-weight:700; color:var(--text-primary);">${dayName}</div>
            <div style="font-size:0.72rem; color:var(--text-muted); margin-bottom:0.35rem;">${dateDisplay}</div>
            <div style="font-size:1.8rem; margin:0.3rem 0;">${info.icon}</div>
            <div style="font-size:1.05rem; font-weight:800; color:var(--text-primary);">
              ${maxT}°<span style="font-size:0.8rem; font-weight:500; color:var(--text-muted);"> / ${minT}°</span>
            </div>
            <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:0.2rem; min-height:22px;">${info.label}</div>
            <div style="margin-top:0.5rem; padding-top:0.4rem; border-top:1px dashed var(--border-color); font-size:0.72rem; display:flex; justify-content:space-between; color:var(--text-muted);">
              <span>🌧️ ${prob}%</span>
              <span>☀️ ET: ${dayEt}mm</span>
            </div>
          </div>
        `;
      }
      grid.innerHTML = gridHtml;
    }

    const updatedTag = document.getElementById('weatherLastUpdated');
    if (updatedTag) {
      updatedTag.textContent = `Updated: ${new Date().toLocaleTimeString()} (Auto-refresh: 8m)`;
    }

    // Optional: Synchronize Ambient IoT Telemetry with Live Weather if IoT is in Standalone Mode
    if (window.IoTMonitor && !window.App?.isBackendLive) {
      window.IoTMonitor.currentTelemetry.air_temperature = temp;
      window.IoTMonitor.currentTelemetry.air_humidity = humidity;
      window.IoTMonitor.updateGauges(window.IoTMonitor.currentTelemetry);
    }
  },

  renderSimulatedWeather() {
    const loc = this.currentLoc;
    const simulatedData = {
      current: {
        temperature_2m: 29.5,
        apparent_temperature: 31.0,
        relative_humidity_2m: 54,
        wind_speed_10m: 13,
        weather_code: 1
      },
      daily: {
        time: [
          new Date().toISOString().slice(0, 10),
          new Date(Date.now() + 86400000).toISOString().slice(0, 10),
          new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
          new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
          new Date(Date.now() + 86400000 * 4).toISOString().slice(0, 10)
        ],
        weather_code: [1, 2, 61, 80, 0],
        temperature_2m_max: [31, 30, 27, 28, 31],
        temperature_2m_min: [19, 20, 18, 17, 19],
        precipitation_probability_max: [5, 20, 65, 40, 10],
        et0_fao_evapotranspiration: [4.8, 4.2, 2.6, 3.1, 4.9]
      }
    };
    this.renderLiveWeather(simulatedData, false);
  }
};

window.LiveWeather = LiveWeather;
document.addEventListener('DOMContentLoaded', () => LiveWeather.init());

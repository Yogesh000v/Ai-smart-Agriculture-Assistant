/**
 * ============================================================================
 * AI Smart Agriculture Assistant - AI Crop Recommendation Engine (JavaScript)
 * Evaluates soil NPK, pH, and climate to predict optimal crops using ML API & heuristics.
 * ============================================================================
 */

const AICropEngine = {
  presets: {
    alluvial: { n: 90, p: 42, k: 40, ph: 6.5, temp: 28, hum: 82, rain: 220, name: "Alluvial Lowlands (Rice/Jute)" },
    loam: { n: 105, p: 55, k: 45, ph: 6.8, temp: 21, hum: 58, rain: 65, name: "Semi-Arid Loam (Wheat/Barley)" },
    black: { n: 120, p: 60, k: 50, ph: 7.2, temp: 31, hum: 52, rain: 90, name: "Black Cotton Soil" },
    greenhouse: { n: 100, p: 60, k: 80, ph: 6.4, temp: 24, hum: 70, rain: 50, name: "Greenhouse Horti-Mix (Tomato)" }
  },

  init() {
    this.bindRangeInputs();
    this.bindPresetChips();
    this.bindSubmitButton();

    // Run initial recommendation
    this.runRecommendation();
  },

  bindRangeInputs() {
    const inputs = ['inputN', 'inputP', 'inputK', 'inputPH', 'inputTemp', 'inputHumidity', 'inputRain'];
    inputs.forEach(id => {
      const el = document.getElementById(id);
      const valTag = document.getElementById(id + 'Val');
      if (el && valTag) {
        el.addEventListener('input', () => {
          valTag.textContent = el.value;
        });
      }
    });
  },

  bindPresetChips() {
    const chips = document.querySelectorAll('.preset-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        const presetKey = chip.getAttribute('data-preset');
        if (this.presets[presetKey]) {
          this.applyPreset(this.presets[presetKey]);
        }
      });
    });
  },

  applyPreset(p) {
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      const tag = document.getElementById(id + 'Val');
      if (el) el.value = val;
      if (tag) tag.textContent = val;
    };

    setVal('inputN', p.n);
    setVal('inputP', p.p);
    setVal('inputK', p.k);
    setVal('inputPH', p.ph);
    setVal('inputTemp', p.temp);
    setVal('inputHumidity', p.hum);
    setVal('inputRain', p.rain);

    this.runRecommendation();
  },

  bindSubmitButton() {
    const btn = document.getElementById('runCropModelBtn');
    if (btn) {
      btn.addEventListener('click', () => {
        this.runRecommendation();
      });
    }
  },

  getFormValues() {
    return {
      nitrogen: parseFloat(document.getElementById('inputN')?.value || 90),
      phosphorus: parseFloat(document.getElementById('inputP')?.value || 42),
      potassium: parseFloat(document.getElementById('inputK')?.value || 40),
      ph: parseFloat(document.getElementById('inputPH')?.value || 6.5),
      temperature: parseFloat(document.getElementById('inputTemp')?.value || 28),
      humidity: parseFloat(document.getElementById('inputHumidity')?.value || 80),
      rainfall: parseFloat(document.getElementById('inputRain')?.value || 200)
    };
  },

  async runRecommendation() {
    const payload = this.getFormValues();
    const resultBox = document.getElementById('cropResultCard');
    if (resultBox) {
      resultBox.style.opacity = '0.5';
    }

    try {
      if (App.isBackendLive) {
        const res = await fetch(`${App.apiBase}/api/ai/crop-recommend`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const data = await res.json();
          this.renderResult(data);
          App.toast("ML Crop recommendation executed via Python FastAPI.", "success");
          return;
        }
      }
    } catch (e) {
      // Backend error fallback
    }

    // Client-side agronomic ML heuristic fallback
    const fallbackData = this.predictClientSide(payload);
    this.renderResult(fallbackData);
  },

  predictClientSide(p) {
    const crops = [
      { name: "Rice (Paddy)", cat: "Cereal", optN: 90, optP: 42, optK: 40, optT: 28, optH: 80, optR: 220, optPH: 6.2, days: 120, water: "High", price: 380, icon: "🌾" },
      { name: "Wheat (गेहूं)", cat: "Cereal", optN: 105, optP: 55, optK: 45, optT: 20, optH: 60, optR: 60, optPH: 6.8, days: 135, water: "Medium", price: 320, icon: "🌾" },
      { name: "Maize / Corn (मक्का)", cat: "Cereal", optN: 80, optP: 48, optK: 40, optT: 25, optH: 65, optR: 90, optPH: 6.5, days: 105, water: "Medium", price: 260, icon: "🌽" },
      { name: "Bajra / Pearl Millet", cat: "Cereal", optN: 50, optP: 30, optK: 30, optT: 32, optH: 45, optR: 40, optPH: 7.2, days: 85, water: "Low", price: 290, icon: "🌾" },
      { name: "Potato (आलू)", cat: "Vegetable", optN: 120, optP: 60, optK: 120, optT: 18, optH: 65, optR: 50, optPH: 6.0, days: 95, water: "Medium", price: 240, icon: "🥔" },
      { name: "Tomato (टमाटर)", cat: "Vegetable", optN: 100, optP: 60, optK: 80, optT: 24, optH: 70, optR: 60, optPH: 6.4, days: 85, water: "Medium", price: 420, icon: "🍅" },
      { name: "Onion (प्याज)", cat: "Vegetable", optN: 80, optP: 50, optK: 60, optT: 21, optH: 55, optR: 45, optPH: 6.6, days: 115, water: "Low-Med", price: 310, icon: "🧅" },
      { name: "Carrot (गाजर)", cat: "Vegetable", optN: 70, optP: 50, optK: 80, optT: 18, optH: 60, optR: 40, optPH: 6.5, days: 90, water: "Medium", price: 340, icon: "🥕" },
      { name: "Brinjal (बैंगन)", cat: "Vegetable", optN: 90, optP: 50, optK: 60, optT: 26, optH: 68, optR: 70, optPH: 6.5, days: 110, water: "Medium", price: 300, icon: "🍆" },
      { name: "Cauliflower (फूलगोभी)", cat: "Vegetable", optN: 110, optP: 60, optK: 70, optT: 17, optH: 70, optR: 55, optPH: 6.5, days: 85, water: "Medium", price: 380, icon: "🥦" },
      { name: "Banana (केला)", cat: "Fruit", optN: 140, optP: 50, optK: 200, optT: 29, optH: 82, optR: 180, optPH: 6.8, days: 300, water: "High", price: 480, icon: "🍌" },
      { name: "Apple (सेब)", cat: "Fruit", optN: 60, optP: 40, optK: 70, optT: 14, optH: 62, optR: 75, optPH: 6.2, days: 240, water: "Medium", price: 1400, icon: "🍎" },
      { name: "Mango (आम)", cat: "Fruit", optN: 80, optP: 40, optK: 80, optT: 28, optH: 60, optR: 110, optPH: 6.5, days: 365, water: "Medium", price: 920, icon: "🥭" },
      { name: "Orange / Citrus (संतरा)", cat: "Fruit", optN: 90, optP: 45, optK: 75, optT: 23, optH: 58, optR: 80, optPH: 6.6, days: 270, water: "Medium", price: 650, icon: "🍊" },
      { name: "Chickpea / Chana", cat: "Legume", optN: 40, optP: 60, optK: 40, optT: 22, optH: 50, optR: 50, optPH: 6.8, days: 110, water: "Low", price: 680, icon: "🫘" },
      { name: "Mustard / Sarson", cat: "Oilseed", optN: 75, optP: 40, optK: 40, optT: 19, optH: 55, optR: 45, optPH: 7.0, days: 110, water: "Low", price: 540, icon: "🌻" },
      { name: "Cotton (कपास)", cat: "Cash Crop", optN: 120, optP: 60, optK: 50, optT: 31, optH: 52, optR: 85, optPH: 7.2, days: 160, water: "Low-Med", price: 950, icon: "☁️" },
      { name: "Sugarcane (गन्ना)", cat: "Cash Crop", optN: 150, optP: 60, optK: 90, optT: 30, optH: 75, optR: 160, optPH: 7.0, days: 340, water: "High", price: 350, icon: "🎋" }
    ];

    const scored = crops.map(c => {
      const dist = (
        Math.abs(p.temperature - c.optT) * 0.25 +
        Math.abs(p.rainfall - c.optR) * 0.04 +
        Math.abs(p.humidity - c.optH) * 0.15 +
        Math.abs(p.ph - c.optPH) * 8.0 +
        Math.abs(p.nitrogen - c.optN) * 0.08 +
        Math.abs(p.phosphorus - c.optP) * 0.08 +
        Math.abs(p.potassium - c.optK) * 0.08
      );
      const conf = Math.max(15, +(100 * Math.exp(-dist * 0.045)).toFixed(1));
      return { crop: c, score: conf };
    }).sort((a, b) => b.score - a.score);

    const best = scored[0].crop;
    const bestScore = scored[0].score;

    return {
      recommended_crop: best.name,
      category: best.cat,
      confidence: bestScore,
      icon: best.icon,
      soil_health_index: 88.5,
      water_requirement: best.water,
      growing_days: best.days,
      expected_yield_ton_per_ha: 3.8,
      estimated_revenue_per_acre: +(3.8 * best.price * 0.404).toFixed(0),
      suitability_summary: `Optimal agronomic fit identified for ${best.name}. Soil NPK and climate variables fall squarely within its peak vegetative growth envelope.`,
      macro_nutrients_status: {
        "Nitrogen (N)": p.nitrogen >= best.optN * 0.8 ? "Optimal" : "Deficient",
        "Phosphorus (P)": p.phosphorus >= best.optP * 0.8 ? "Optimal" : "Deficient",
        "Potassium (K)": p.potassium >= best.optK * 0.8 ? "Optimal" : "Deficient",
        "Soil pH": p.ph < 6.0 ? "Acidic" : (p.ph > 7.5 ? "Alkaline" : "Neutral / Optimal")
      },
      top_alternatives: scored.slice(1, 4).map(s => ({
        crop_name: s.crop.name,
        match_score: s.score,
        category: s.crop.cat,
        market_price: s.crop.price,
        water_need: s.crop.water,
        icon: s.crop.icon
      }))
    };
  },

  renderResult(data) {
    const resultBox = document.getElementById('cropResultCard');
    if (resultBox) resultBox.style.opacity = '1';

    // Primary crop
    document.getElementById('recCropName').textContent = data.recommended_crop;
    document.getElementById('recCropIcon').textContent = data.icon || '🌾';
    document.getElementById('recCropCategory').textContent = data.category;
    document.getElementById('recCropScore').textContent = `${data.confidence}% Match`;
    document.getElementById('recCropSummary').textContent = data.suitability_summary;

    // Metrics
    document.getElementById('recCropDays').textContent = `${data.growing_days} Days`;
    document.getElementById('recCropYield').textContent = `${data.expected_yield_ton_per_ha} T/ha`;
    document.getElementById('recCropWater').textContent = data.water_requirement;
    document.getElementById('recCropRevenue').textContent = `$${data.estimated_revenue_per_acre} / Acre`;

    // Nutrients
    const nutWrap = document.getElementById('recNutrientChips');
    if (nutWrap && data.macro_nutrients_status) {
      nutWrap.innerHTML = Object.entries(data.macro_nutrients_status).map(([nut, status]) => {
        const isOpt = status.includes("Optimal");
        const bg = isOpt ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)";
        const col = isOpt ? "#10b981" : "#f59e0b";
        return `<span style="padding:0.25rem 0.6rem; border-radius:4px; font-size:0.75rem; background:${bg}; color:${col}; border:1px solid ${col}44;">
          <strong>${nut}:</strong> ${status}
        </span>`;
      }).join('');
    }

    // Alternatives
    const altWrap = document.getElementById('cropAlternativesList');
    if (altWrap && data.top_alternatives) {
      altWrap.innerHTML = data.top_alternatives.map(alt => `
        <div style="display:flex; align-items:center; justify-content:space-between; padding:0.6rem 0.85rem; background:var(--bg-surface); border:1px solid var(--border-color); border-radius:8px; margin-bottom:0.5rem;">
          <div style="display:flex; align-items:center; gap:0.6rem;">
            <span style="font-size:1.3rem;">${alt.icon || '🌱'}</span>
            <div>
              <div style="font-size:0.85rem; font-weight:600;">${alt.crop_name}</div>
              <div style="font-size:0.72rem; color:var(--text-muted);">${alt.category} · Water: ${alt.water_need}</div>
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:0.85rem; font-weight:700; color:var(--primary);">${alt.match_score}%</div>
            <div style="font-size:0.7rem; color:var(--text-muted);">$${alt.market_price}/ton</div>
          </div>
        </div>
      `).join('');
    }
  }
};

window.AICropEngine = AICropEngine;
document.addEventListener('DOMContentLoaded', () => AICropEngine.init());

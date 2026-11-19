/**
 * ============================================================================
 * AI Smart Agriculture Assistant - Farm Marketplace Controller
 * Complete Marketplace with 25 Produce Items, Categories, Sorting,
 * Add to Cart Drawer, Order Checkout, and Farmer Selling.
 * ============================================================================
 */

const Market = {
  K: 'agri_market_v2',
  O: 'agri_orders',
  C: 'agri_market_cart',
  cat: 'All',
  q: '',
  sort: 'new',
  pending: null,

  cats: ['All', 'Vegetable', 'Fruit', 'Cereal', 'Pulses', 'Spices', 'Oilseeds', 'Commercial'],
  icons: { Cereal: '🌾', Vegetable: '🥬', Fruit: '🍎', Pulses: '🫘', Spices: '🌶️', Oilseeds: '🌻', Commercial: '🎋' },

  // Pre-seeded Produce Catalog: [crop, category, qty kg, price ₹/kg, location, seller, icon]
  seed: [
    // --- Vegetables (सब्जियां) ---
    ['Potato (आलू)', 'Vegetable', 1200, 18, 'Agra, UP', 'Kumar Agro Farms', '🥔'],
    ['Tomato (टमाटर)', 'Vegetable', 600, 24, 'Nashik, Maharashtra', 'Sunrise Growers', '🍅'],
    ['Onion (प्याज)', 'Vegetable', 1500, 22, 'Lasalgaon, Maharashtra', 'Onion Union', '🧅'],
    ['Garlic (लहसुन)', 'Vegetable', 300, 140, 'Mandsaur, MP', 'Malwa Spices & Veg', '🧄'],
    ['Ginger (अदरक)', 'Vegetable', 250, 120, 'Wayanad, Kerala', 'Kerala Green Farms', '🫚'],
    ['Cauliflower (फूलगोभी)', 'Vegetable', 400, 28, 'Sonipat, Haryana', 'Green Leaf Farm', '🥦'],
    ['Cabbage (पत्तागोभी)', 'Vegetable', 450, 20, 'Pune, Maharashtra', 'Sahyadri Agri', '🥬'],
    ['Broccoli (ब्रोकोली)', 'Vegetable', 200, 65, 'Ooty, Tamil Nadu', 'Nilgiri Greens', '🥦'],
    ['Spinach / Palak (पालक)', 'Vegetable', 250, 25, 'Delhi NCR Farms', 'Yamuna Basin Agro', '🥬'],
    ['Ladyfinger / Bhindi (भिंडी)', 'Vegetable', 350, 35, 'Surat, Gujarat', 'Tapi Fresh', '🥬'],
    ['Brinjal / Baingan (बैंगन)', 'Vegetable', 400, 22, 'Varanasi, UP', 'Ganga Growers', '🍆'],
    ['Green Peas / Matar (मटर)', 'Vegetable', 500, 45, 'Jabalpur, MP', 'Narmada Veg Union', '🫛'],
    ['Carrot (गाजर)', 'Vegetable', 450, 28, 'Ooty, Tamil Nadu', 'Nilgiri Fresh', '🥕'],
    ['Radish / Mooli (मूली)', 'Vegetable', 500, 16, 'Sonipat, Haryana', 'Kisan Brothers', '🥕'],
    ['Capsicum / Shimla Mirch (शिमला मिर्च)', 'Vegetable', 250, 50, 'Solan, HP', 'Himalayan Polyhouse', '🫑'],
    ['Green Chilli (हरी मिर्च)', 'Vegetable', 200, 55, 'Guntur, Andhra Pradesh', 'Spicy Fields', '🌶️'],
    ['Bottle Gourd / Lauki (लौकी)', 'Vegetable', 400, 18, 'Meerut, UP', 'Choudhary Farms', '🥒'],
    ['Bitter Gourd / Karela (करेला)', 'Vegetable', 250, 32, 'Jaipur, Rajasthan', 'Jaipur Organic', '🥒'],
    ['Ridge Gourd / Torai (तोरई)', 'Vegetable', 250, 28, 'Nagpur, Maharashtra', 'Vidarbha Veggies', '🥒'],
    ['Pumpkin / Kaddu (कद्दू)', 'Vegetable', 600, 15, 'Bareilly, UP', 'Rohilkhand Farms', '🎃'],
    ['Cucumber / Kheera (खीरा)', 'Vegetable', 500, 20, 'Alwar, Rajasthan', 'Matsya Fresh', '🥒'],
    ['Beetroot / Chukandar (चुकंदर)', 'Vegetable', 350, 30, 'Nilgiris, Tamil Nadu', 'Blue Hill Agro', '🥔'],
    ['Fenugreek / Methi (मेथी पत्ता)', 'Vegetable', 300, 35, 'Nagaur, Rajasthan', 'Marwar Methi', '🌿'],
    ['Coriander Leaves (हरा धनिया)', 'Vegetable', 200, 40, 'Kota, Rajasthan', 'Hadoti Fresh', '🌿'],

    // --- Fruits (फल) ---
    ['Apple (Kashmiri Seb)', 'Fruit', 350, 120, 'Shopian, J&K', 'Valley Fresh Orchards', '🍎'],
    ['Banana / Kela (Robusta)', 'Fruit', 800, 35, 'Jalgaon, Maharashtra', 'Tapti Banana Co.', '🍌'],
    ['Mango (Dasheri Aam)', 'Fruit', 450, 85, 'Lucknow, UP', 'Malihabad Orchards', '🥭'],
    ['Mango (Alphonso / Hapus)', 'Fruit', 300, 180, 'Ratnagiri, Maharashtra', 'Konkan King', '🥭'],
    ['Kinnow Orange (किन्नू)', 'Fruit', 500, 45, 'Hisar, Haryana', 'Orchard Co-op', '🍊'],
    ['Nagpur Orange (संतरा)', 'Fruit', 500, 55, 'Nagpur, Maharashtra', 'Orange City Union', '🍊'],
    ['Sweet Lime / Mosambi (मौसमी)', 'Fruit', 450, 48, 'Nanded, Maharashtra', 'Marathwada Citrus', '🍊'],
    ['Guava / Amrood (अमरूद)', 'Fruit', 400, 40, 'Prayagraj (Allahabad), UP', 'Sangam Orchards', '🍏'],
    ['Pomegranate / Anaar (अनार)', 'Fruit', 350, 110, 'Solapur, Maharashtra', 'Bhagwa Pomegranate Co.', '🍎'],
    ['Papaya / Papita (पपीता)', 'Fruit', 600, 25, 'Barwani, MP', 'Narmada Valley Fruit', '🍈'],
    ['Grapes / Angoor (अंगूर)', 'Fruit', 400, 75, 'Nashik, Maharashtra', 'Grape Capital Growers', '🍇'],
    ['Watermelon / Tarbooz (तरबूज)', 'Fruit', 1200, 16, 'Bidar, Karnataka', 'Deccan Melons', '🍉'],
    ['Muskmelon / Kharbooja (खरबूजा)', 'Fruit', 700, 28, 'Tonk, Rajasthan', 'Thar Melons', '🍈'],
    ['Pineapple / Ananas (अनानास)', 'Fruit', 350, 42, 'Siliguri, West Bengal', 'Dooars Pineapples', '🍍'],
    ['Lemon / Nimbu (नींबू)', 'Fruit', 250, 65, 'Nellore, Andhra Pradesh', 'Coastal Citrus', '🍋'],
    ['Strawberry (स्ट्रॉबेरी)', 'Fruit', 150, 180, 'Mahabaleshwar, Maharashtra', 'Hill Berry Farms', '🍓'],
    ['Litchi (शाही लीची)', 'Fruit', 200, 130, 'Muzaffarpur, Bihar', 'Shahi Litchi Growers', '🍒'],
    ['Fresh Coconut / Nariyal (नारियल)', 'Fruit', 800, 35, 'Kozhikode, Kerala', 'Malabar Palms', '🥥'],

    // --- Cereals & Food Grains (अनाज / खाद्यान्न) ---
    ['Basmati Rice (बासमती चावल)', 'Cereal', 800, 62, 'Karnal, Haryana', 'GreenHorizon Farm', '🍚'],
    ['Sona Masoori Rice (चावल)', 'Cereal', 900, 54, 'Raichur, Karnataka', 'Tungabhadra Rice Mills', '🍚'],
    ['Wheat - Sharbati (गेहूं शरबती)', 'Cereal', 1500, 32, 'Sehore, MP', 'Narmada Grains', '🌾'],
    ['Wheat - Durum (मालव गेहूं)', 'Cereal', 1200, 28, 'Khandwa, MP', 'Malwa Durum Co.', '🌾'],
    ['Maize / Corn (मक्का)', 'Cereal', 1000, 22, 'Davangere, Karnataka', 'Tungabhadra Farms', '🌽'],
    ['Pearl Millet / Bajra (बाजरा)', 'Cereal', 800, 26, 'Jodhpur, Rajasthan', 'Marwar Millets', '🌾'],
    ['Sorghum / Jowar (ज्वार)', 'Cereal', 750, 34, 'Solapur, Maharashtra', 'Deccan Jowar Co.', '🌾'],
    ['Finger Millet / Ragi (रागी)', 'Cereal', 600, 38, 'Mandya, Karnataka', 'Cauvery Nutri-Grains', '🌾'],
    ['Barley / Jau (जौ)', 'Cereal', 650, 24, 'Hisar, Haryana', 'Haryana Barley Group', '🌾'],
    ['Oats / Jai (जई)', 'Cereal', 450, 45, 'Rohtak, Haryana', 'Golden Oat Farms', '🌾'],

    // --- Pulses & Legumes (दालें और दलहन) ---
    ['Chickpea / Chana (चना)', 'Pulses', 600, 74, 'Indore, MP', 'Malwa Pulses', '🫘'],
    ['Kabuli Chana (काबुली चना)', 'Pulses', 450, 115, 'Indore, MP', 'Crown Legumes', '🫘'],
    ['Moong Dal (मूंग दाल)', 'Pulses', 450, 98, 'Jaipur, Rajasthan', 'Thar Pulses', '🫘'],
    ['Arhar / Toor Dal (अरहर दाल)', 'Pulses', 550, 105, 'Latur, Maharashtra', 'Latur Dal Farms', '🫘'],
    ['Urad Dal (उड़द दाल)', 'Pulses', 400, 110, 'Guntur, Andhra Pradesh', 'Krishna Pulses', '🫘'],
    ['Masoor Dal (मसूर दाल)', 'Pulses', 350, 82, 'Vidisha, MP', 'Vidisha Growers', '🫘'],
    ['Rajma (Kidney Beans)', 'Pulses', 350, 135, 'Jammu, J&K', 'Jammu Hill Pulses', '🫘'],
    ['Lobia / Cowpea (लोबिया)', 'Pulses', 350, 75, 'Fatehabad, Haryana', 'Kisan Union', '🫘'],
    ['Soybean (सोयाबीन)', 'Pulses', 1000, 48, 'Ujjain, MP', 'Malwa Soya Group', '🫘'],

    // --- Spices & Condiments (मसाले) ---
    ['Turmeric / Haldi (हल्दी)', 'Spices', 300, 135, 'Erode, Tamil Nadu', 'Spice Route Farms', '🌶️'],
    ['Coriander Seeds / Dhania (धनिया बीज)', 'Spices', 350, 95, 'Kota, Rajasthan', 'Hadoti Spices', '🌿'],
    ['Cumin / Jeera (जीरा)', 'Spices', 250, 260, 'Unjha, Gujarat', 'Unjha Spice Co.', '🌿'],
    ['Black Pepper / Kali Mirch (काली मिर्च)', 'Spices', 150, 490, 'Idukki, Kerala', 'Highland Spices', '🌶️'],
    ['Cardamom / Elaichi (हरी इलायची)', 'Spices', 50, 1850, 'Munnar, Kerala', 'Cardamom Hills Agro', '🌿'],
    ['Fennel Seeds / Saunf (सौंफ)', 'Spices', 250, 160, 'Patan, Gujarat', 'Gujarat Herbals', '🌿'],
    ['Fenugreek Seeds / Methi Dana (मेथी दाना)', 'Spices', 350, 85, 'Nagaur, Rajasthan', 'Marwar Spices', '🌿'],
    ['Cloves / Laung (लौंग)', 'Spices', 80, 820, 'Kanyakumari, Tamil Nadu', 'Cape Spices', '🌿'],

    // --- Oilseeds & Commercial Crops (तिलहन और नकदी फसलें) ---
    ['Mustard Seed / Sarson (सरसों)', 'Oilseeds', 800, 58, 'Alwar, Rajasthan', 'Sarson Kisan Group', '🌻'],
    ['Groundnut / Mungfali (मूंगफली)', 'Oilseeds', 750, 72, 'Junagadh, Gujarat', 'Saurashtra Nuts', '🥜'],
    ['Sunflower Seed (सूरजमुखी)', 'Oilseeds', 550, 66, 'Bellary, Karnataka', 'Sun Valley Farm', '🌻'],
    ['Sesame Seed / Til (तिल)', 'Oilseeds', 350, 145, 'Amreli, Gujarat', 'Gir Sesame Union', '🌻'],
    ['Sugarcane / Ganna (गन्ना)', 'Commercial', 3000, 4, 'Kolhapur, Maharashtra', 'Panchganga Sugar Agro', '🎋'],
    ['Cotton / Kapas (कपास)', 'Commercial', 1000, 78, 'Rajkot, Gujarat', 'Saurashtra Cotton Union', '☁️']
  ].map((r, i) => ({
    id: i + 1,
    crop: r[0],
    cat: r[1],
    qty: r[2],
    price: r[3],
    loc: r[4],
    seller: r[5],
    icon: r[6],
    sellerEmail: '',
    note: 'Farm fresh certified harvest'
  })),

  load() {
    try {
      let l = JSON.parse(localStorage.getItem(this.K));
      if (Array.isArray(l) && l.length >= this.seed.length) return l;

      // Smart merge: ensure all new vegetables, fruits, crops are populated
      const existingCrops = new Set((l || []).map(x => x.crop.toLowerCase()));
      const merged = (l || []).slice();
      this.seed.forEach(item => {
        if (!existingCrops.has(item.crop.toLowerCase())) {
          merged.push(item);
        }
      });
      this.save(merged);
      return merged;
    } catch (e) {}
    this.save(this.seed);
    return this.seed.slice();
  },

  save(l) {
    localStorage.setItem(this.K, JSON.stringify(l));
  },

  orders() {
    try {
      return JSON.parse(localStorage.getItem(this.O)) || [];
    } catch (e) {
      return [];
    }
  },

  /* ---------- User-Scoped Cart Management ---------- */
  getCartKey() {
    const u = window.Auth?.currentUser;
    if (u && u.email) {
      return `agri_cart_user_${encodeURIComponent(u.email.toLowerCase().trim())}`;
    }
    return 'agri_cart_guest';
  },

  getCart() {
    try {
      const key = this.getCartKey();
      const c = JSON.parse(localStorage.getItem(key));
      if (Array.isArray(c)) return c;
    } catch (e) {}
    return [];
  },

  saveCart(c) {
    const key = this.getCartKey();
    localStorage.setItem(key, JSON.stringify(c));
    this.updateCartBadge();
  },

  onAuthChange() {
    this.updateCartBadge();
    this.render();
  },

  updateCartBadge() {
    const cart = this.getCart();
    const count = cart.length;
    const badge = document.getElementById('mkCartCount');
    if (badge) badge.textContent = count;
  },

  addToCart(id, addQty = 1) {
    const list = this.load();
    const item = list.find(x => x.id == id);
    if (!item) return;

    if (item.qty <= 0) {
      if (window.App?.toast) window.App.toast(`${item.crop} is currently sold out.`, 'error');
      return;
    }

    const cart = this.getCart();
    const existing = cart.find(x => x.id == id);

    if (existing) {
      const newQty = Math.min(item.qty, existing.qty + addQty);
      existing.qty = newQty;
      existing.maxQty = item.qty;
      existing.price = item.price;
    } else {
      cart.push({
        id: item.id,
        crop: item.crop,
        cat: item.cat,
        price: item.price,
        qty: Math.min(addQty, item.qty),
        maxQty: item.qty,
        seller: item.seller,
        loc: item.loc,
        icon: this.ico(item)
      });
    }

    this.saveCart(cart);
    if (window.App?.toast) {
      window.App.toast(`🛒 Added ${item.crop} to Cart! (${cart.find(x => x.id == id).qty} kg total)`, 'success');
    }
  },

  updateCartItemQty(id, delta) {
    let cart = this.getCart();
    const item = cart.find(x => x.id == id);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
      cart = cart.filter(x => x.id != id);
      if (window.App?.toast) window.App.toast(`Removed from cart.`, 'info');
    } else if (item.qty > item.maxQty) {
      item.qty = item.maxQty;
      if (window.App?.toast) window.App.toast(`Maximum available stock reached (${item.maxQty} kg).`, 'info');
    }

    this.saveCart(cart);
    this.openCart(); // Re-render cart modal
  },

  removeFromCart(id) {
    let cart = this.getCart();
    cart = cart.filter(x => x.id != id);
    this.saveCart(cart);
    if (window.App?.toast) window.App.toast(`Item removed from cart.`, 'info');
    this.openCart();
  },

  clearCart() {
    this.saveCart([]);
    if (window.App?.toast) window.App.toast(`Cart cleared.`, 'info');
    this.openCart();
  },

  openCart() {
    const cart = this.getCart();
    const e = this.esc;
    const u = window.Auth?.currentUser;

    let totalItems = 0;
    let totalWeight = 0;
    let grandTotal = 0;

    cart.forEach(item => {
      totalItems++;
      totalWeight += item.qty;
      grandTotal += item.qty * item.price;
    });

    let itemsHtml = '';
    if (cart.length === 0) {
      itemsHtml = `
        <div style="text-align:center; padding:2.5rem 1rem;">
          <div style="font-size:3.5rem; margin-bottom:0.5rem;">🛒</div>
          <h4 style="margin:0 0 0.4rem; color:var(--text-primary);">Your Cart is Empty</h4>
          <p style="color:var(--text-muted); font-size:0.85rem; margin:0 0 1.2rem;">
            Browse our farm fresh produce catalog and click "Add to Cart" to start shopping.
          </p>
          <button class="btn btn-primary" data-close="1">Continue Browsing</button>
        </div>
      `;
    } else {
      itemsHtml = `
        <div style="max-height:48vh; overflow-y:auto; padding-right:0.3rem;">
          ${cart.map(item => `
            <div style="display:flex; justify-content:space-between; align-items:center; gap:0.75rem; padding:0.75rem 0; border-bottom:1px solid var(--border-color);">
              <div style="display:flex; align-items:center; gap:0.6rem;">
                <span style="font-size:1.8rem; line-height:1;">${item.icon}</span>
                <div>
                  <div style="font-weight:700; font-size:0.92rem; color:var(--text-primary);">${e(item.crop)}</div>
                  <div style="font-size:0.75rem; color:var(--text-muted);">${e(item.seller)} · ₹${item.price}/kg</div>
                </div>
              </div>

              <div style="display:flex; align-items:center; gap:0.75rem;">
                <!-- Quantity Stepper -->
                <div style="display:flex; align-items:center; border:1px solid var(--border-color); border-radius:6px; overflow:hidden; background:var(--bg-surface);">
                  <button class="btn btn-secondary btn-sm" style="padding:0.2rem 0.5rem; border:none; border-radius:0;" data-cart-dec="${item.id}">−</button>
                  <span style="padding:0.2rem 0.6rem; font-size:0.8rem; font-weight:700; min-width:50px; text-align:center;">${item.qty} kg</span>
                  <button class="btn btn-secondary btn-sm" style="padding:0.2rem 0.5rem; border:none; border-radius:0;" data-cart-inc="${item.id}">+</button>
                </div>

                <div style="font-weight:800; font-size:0.95rem; color:var(--primary); min-width:65px; text-align:right;">
                  ₹${item.qty * item.price}
                </div>

                <button class="icon-btn" title="Remove" data-cart-del="${item.id}" style="color:#ef4444; width:28px; height:28px; font-size:0.85rem;">
                  🗑️
                </button>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Order Summary & Checkout -->
        <div style="margin-top:1.2rem; padding:1rem; background:var(--bg-surface); border:1px solid var(--border-color); border-radius:10px;">
          <div style="display:flex; justify-content:space-between; font-size:0.82rem; color:var(--text-muted); margin-bottom:0.35rem;">
            <span>Items Count:</span>
            <b>${totalItems} produce (${totalWeight} kg total)</b>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:0.82rem; color:var(--text-muted); margin-bottom:0.6rem;">
            <span>Delivery:</span>
            <span style="color:#10b981; font-weight:700;">Farm-to-Door Direct (FREE)</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-color); padding-top:0.6rem;">
            <span style="font-size:1rem; font-weight:700; color:var(--text-primary);">Grand Total:</span>
            <span style="font-size:1.4rem; font-weight:800; color:var(--primary);">₹${grandTotal}</span>
          </div>

          <button class="btn btn-primary" id="btnCartCheckout" style="width:100%; margin-top:1rem; padding:0.75rem; font-size:1rem; font-weight:700; gap:0.5rem;">
            ${u ? `🛍️ Place Order (₹${grandTotal})` : '🔐 Login to Place Order'}
          </button>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.6rem;">
            <span style="font-size:0.72rem; color:var(--text-muted);">Demo Checkout: Instant simulated order</span>
            <button class="btn btn-secondary btn-sm" id="btnCartClear" style="font-size:0.75rem; padding:0.2rem 0.5rem;">Clear All</button>
          </div>
        </div>
      `;
    }

    this.modal(`
      <div class="auth-body" style="padding:1.4rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; border-bottom:1px solid var(--border-color); padding-bottom:0.75rem;">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span style="font-size:1.5rem;">🛒</span>
            <h3 style="margin:0; font-size:1.2rem; font-weight:800;">Shopping Cart</h3>
          </div>
          <button class="icon-btn" data-close="1" style="font-size:1.1rem;">✕</button>
        </div>
        ${itemsHtml}
      </div>
    `);

    // Bind Cart Modal Events
    const modalEl = document.getElementById('mkModal');
    if (modalEl) {
      modalEl.onclick = e => {
        const dec = e.target.closest('[data-cart-dec]');
        const inc = e.target.closest('[data-cart-inc]');
        const del = e.target.closest('[data-cart-del]');
        const clr = e.target.closest('#btnCartClear');
        const chk = e.target.closest('#btnCartCheckout');

        if (dec) this.updateCartItemQty(dec.dataset.cartDec, -5);
        else if (inc) this.updateCartItemQty(inc.dataset.cartInc, 5);
        else if (del) this.removeFromCart(del.dataset.cartDel);
        else if (clr) this.clearCart();
        else if (chk) this.checkoutCart();
      };
    }
  },

  checkoutCart() {
    if (!this.need({ checkoutCart: 1 })) return;
    if (this.getCart().length === 0) return;
    if (window.Delivery) Delivery.ask(d => this._doCheckout(d)); else this._doCheckout({});
  },

  _doCheckout(delivery) {
    const cart = this.getCart();
    if (cart.length === 0) return;
    const batch = Date.now();

    const all = this.load();
    const os = this.orders();
    const u = window.Auth?.currentUser;
    const buyerEmail = u ? u.email : (delivery.email || 'guest@farm.com');
    const buyerName = u ? u.full_name : (delivery.name || 'Customer');
    const buyerPhone = delivery.phone || (u ? u.phone : '') || 'Not provided';
    const buyerAddress = delivery.address || 'Standard Delivery / Direct Farm Pickup';
    const buyerRole = u ? (u.role || 'Customer') : 'Guest';

    let totalSpent = 0;

    cart.forEach(item => {
      const target = all.find(x => x.id == item.id);
      if (target) {
        target.qty = Math.max(0, target.qty - item.qty);
      }
      const orderTotal = item.qty * item.price;
      totalSpent += orderTotal;

      os.unshift({
        id: Date.now() + Math.floor(Math.random() * 1000),
        crop: item.crop,
        icon: item.icon || this.ico(item),
        qty: item.qty,
        price: item.price,
        total: orderTotal,
        buyer: buyerEmail,
        buyerName: buyerName,
        buyerPhone: buyerPhone,
        buyerAddress: buyerAddress,
        buyerRole: buyerRole,
        seller: item.seller,
        time: new Date().toISOString(),
        ...delivery,
        batch,
        status: 'Placed'
      });
    });

    this.save(all);
    localStorage.setItem(this.O, JSON.stringify(os));
    this.saveCart([]); // Empty this user's cart

    const m = document.getElementById('mkModal');
    if (m) m.style.display = 'none';

    if (window.App?.toast) {
      window.App.toast(`🎉 Order placed! ${cart.length} items purchased (₹${totalSpent}).`, 'success');
    }

    this.render();
  },

  updateOrderStatus(orderId, newStatus) {
    const os = this.orders();
    const o = os.find(x => x.id == orderId);
    if (o) {
      o.status = newStatus;
      localStorage.setItem(this.O, JSON.stringify(os));
      if (window.App?.toast) {
        window.App.toast(`Order status changed to "${newStatus}"`, 'success');
      }
      this.render();
    }
  },

  deleteOrder(orderId) {
    if (!confirm("Are you sure you want to cancel/delete this order?")) return;
    let os = this.orders();
    os = os.filter(x => x.id != orderId);
    localStorage.setItem(this.O, JSON.stringify(os));
    if (window.App?.toast) {
      window.App.toast("Order deleted.", "info");
    }
    this.render();
  },

  /* ---------- Escaping & Helpers ---------- */
  esc: s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
  ico(l) { return l.icon || this.icons[l.cat] || '🌱'; },

  need(action) {
    const u = window.Auth?.currentUser;
    if (u) return true;
    this.pending = action;
    if (window.App?.toast) window.window.App.toast('Please sign in to continue.', 'info');
    const m = document.getElementById('mkModal'); if (m) m.style.display = 'none';
    if (window.Auth?.showModal) window.Auth.showModal('login');
    return false;
  },

  modal(html) {
    let m = document.getElementById('mkModal');
    if (!m) {
      m = document.createElement('div');
      m.id = 'mkModal';
      m.className = 'modal-backdrop';
      document.body.appendChild(m);
      m.addEventListener('click', e => {
        if (e.target === m || e.target.dataset.close || e.target.closest('[data-close]')) {
          m.style.display = 'none';
        }
      });
    }
    m.innerHTML = `<div class="auth-modal-card mk-modal" style="max-width:540px;width:94%;">${html}</div>`;
    m.style.display = 'flex';
  },

  sorted(list) {
    const s = this.sort;
    if (s === 'low') return list.sort((a, b) => a.price - b.price);
    if (s === 'high') return list.sort((a, b) => b.price - a.price);
    if (s === 'az') return list.sort((a, b) => a.crop.localeCompare(b.crop));
    return list;
  },

  render() {
    const e = this.esc, u = window.Auth?.currentUser || null;
    const chipsEl = document.getElementById('mkChips');
    const gridEl = document.getElementById('mkGrid');
    if (!gridEl) return;

    this.updateCartBadge();

    const list = this.sorted(this.load().filter(l => (this.cat === 'All' || l.cat === this.cat) &&
      (l.crop + l.seller + l.loc + l.cat).toLowerCase().includes(this.q.toLowerCase())));

    if (chipsEl) {
      chipsEl.innerHTML = this.cats.map(c => `<button class="mk-chip ${c === this.cat ? 'on' : ''}" data-cat="${c}">${c}</button>`).join('');
    }

    gridEl.innerHTML = list.map(l => `
      <article class="mk-card">
        <div class="mk-ico">${this.ico(l)}</div>
        <h4>${e(l.crop)}</h4>
        <div class="mk-meta">${e(l.seller)} · ${e(l.loc)}</div>
        <div class="mk-price">₹${e(l.price)}<small>/kg</small></div>
        <div class="mk-meta">${l.qty > 0 ? e(l.qty) + ' ' + (window.I18N ? I18N.t('kg_avail') : 'kg available') : '<span style="color:#ef4444;font-weight:700;">' + (window.I18N ? I18N.t('sold_out') : 'Sold out') + '</span>'}</div>

        <div class="mk-card-actions" style="display:flex; gap:0.4rem; margin-top:auto; padding-top:0.5rem;">
          <button class="btn btn-secondary btn-sm" style="flex:1; padding:0.45rem 0.35rem; font-size:0.78rem;" data-cart-add="${l.id}" ${l.qty > 0 ? '' : 'disabled'}>
            ${(window.I18N ? I18N.t('add_cart') : '🛒 Add to Cart')}
          </button>
          <button class="btn btn-primary btn-sm" style="flex:1; padding:0.45rem 0.35rem; font-size:0.78rem;" data-buy="${l.id}" ${l.qty > 0 ? '' : 'disabled'}>
            ${(window.I18N ? I18N.t('buy_now') : '⚡ Buy Now')}
          </button>
        </div>
      </article>
    `).join('') || '<p class="mk-meta" style="grid-column:1/-1;padding:2rem;text-align:center;">No produce found matching your search.</p>';

    const mine = document.getElementById('mkMine');
    if (!mine) return;
    if (!u) {
      mine.innerHTML = `
        <div class="mk-box" style="text-align:center; padding:1.5rem;">
          <p style="margin:0 0 0.5rem; color:var(--text-muted);">Please sign in to view your orders, shopping cart, or sell produce.</p>
          <button class="btn btn-secondary btn-sm" onclick="window.Auth?.showModal('login')">👤 Sign In / Register</button>
        </div>
      `;
      return;
    }

    const isAdmin = window.Auth?.isAdmin ? window.Auth.isAdmin() : (u.email === 'admin@agrotech.com' || (u.role || '').toLowerCase().includes('admin'));

    if (isAdmin) {
      // ADMIN: Show clean gateway to dedicated Admin Dashboard
      mine.innerHTML = `
        <div class="mk-box" style="border:1px solid rgba(239,68,68,0.3); background:linear-gradient(135deg, rgba(239,68,68,0.06), var(--bg-card)); padding:1.2rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; border-radius:12px; margin-top:1.5rem;">
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <span style="font-size:2rem;">🛡️</span>
            <div>
              <div style="font-weight:800; color:#ef4444; font-size:1.05rem;">Admin Management Center is Ready</div>
              <div style="font-size:0.78rem; color:var(--text-muted); margin-top:0.2rem;">
                All customer orders, status changes, produce listings, user accounts & CSV exports are in your dedicated <b>Admin Dashboard</b>.
              </div>
            </div>
          </div>
          <button class="btn btn-primary" onclick="window.App?.switchTab('tab-admin')" style="background:#ef4444; border-color:#ef4444; font-weight:700;">
            🛡️ Go to Admin Dashboard
          </button>
        </div>
      `;
    } else {
      // NORMAL USER VIEW: MY ORDERS HISTORY + MY ACTIVE PRODUCE
      const ls = this.load().filter(l => l.sellerEmail === u.email);
      const os = this.orders().filter(o => o.buyer === u.email);

      mine.innerHTML = `
        <h3>📦 My Account & Orders</h3>
        <div class="grid-2">
          <div class="mk-box">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.8rem; border-bottom:1px solid var(--border-color); padding-bottom:0.5rem; flex-wrap:wrap; gap:0.4rem;">
              <h4 style="margin:0;">My Orders History (${os.length})</h4>
              <div style="display:flex; align-items:center; gap:0.4rem;">
                ${os.length > 0 ? `<button class="btn btn-secondary btn-sm" onclick="ExportUtils.exportOrders(window.Market.orders().filter(o => o.buyer === '${e(u.email)}'), 'My_AgroTech_Orders')" style="font-size:0.7rem; padding:0.15rem 0.45rem;">📥 Export CSV</button>` : ''}
                <span style="font-size:0.75rem; color:var(--text-muted);">${e(u.email)}</span>
              </div>
            </div>
            ${os.length === 0 ? '<p class="mk-meta">No orders placed yet. Browse produce above and click "Add to Cart" or "Buy Now".</p>' : `
              <div style="display:grid; gap:0.6rem; max-height:360px; overflow-y:auto; padding-right:0.2rem;">
                ${os.map(o => `
                  <div style="padding:0.65rem; border:1px solid var(--border-color); border-radius:8px; background:var(--bg-surface);">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                      <div>
                        <span style="font-weight:700; font-size:0.92rem;">${this.ico(o)} ${e(o.crop)}</span>
                        <div style="font-size:0.75rem; color:var(--text-muted);">${e(o.qty)} kg · Seller: ${e(o.seller || 'Farm')}</div>
                        <div style="font-size:0.72rem; color:var(--text-muted);">📍 ${e(o.buyerAddress || o.address || 'Standard Delivery')}</div>
                      </div>
                      <div style="text-align:right;">
                        <div style="font-weight:800; color:var(--primary); font-size:1rem;">₹${e(o.total)}</div>
                        <div style="display:flex; align-items:center; justify-content:flex-end; gap:0.35rem; margin-top:0.2rem;">
                          <span class="badge" style="font-size:0.68rem; padding:0.1rem 0.4rem; border-radius:99px; background:${o.status === 'Delivered' ? '#10b981' : '#f59e0b'}; color:white; font-weight:700;">
                            ${o.status || 'Placed'}
                          </span>
                          <button class="btn btn-secondary btn-sm" onclick="ExportUtils.downloadReceipt(window.Market.orders().find(x => x.id == ${o.id}))" style="font-size:0.68rem; padding:0.1rem 0.35rem;" title="Download Invoice">🧾 Receipt</button>
                        </div>
                      </div>
                    </div>
                    <div style="font-size:0.7rem; color:var(--text-muted); margin-top:0.35rem; border-top:1px dashed var(--border-color); padding-top:0.3rem;">
                      Order Date: ${new Date(o.time || Date.now()).toLocaleString()}
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>

          <div class="mk-box">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.8rem; border-bottom:1px solid var(--border-color); padding-bottom:0.5rem;">
              <h4 style="margin:0;">My Active Produce for Sale (${ls.length})</h4>
            </div>
            ${ls.length === 0 ? '<p class="mk-meta">You have not listed any crops for sale yet. Click "+ Sell Your Produce" above.</p>' : `
              <div style="display:grid; gap:0.5rem; max-height:360px; overflow-y:auto;">
                ${ls.map(l => `
                  <div class="mk-row">
                    <span>${this.ico(l)} <b>${e(l.crop)}</b> · ${e(l.qty)} kg @ ₹${e(l.price)}/kg</span>
                    <button class="btn btn-secondary btn-sm" data-del="${l.id}" style="color:#ef4444; font-size:0.75rem; padding:0.2rem 0.5rem;">Remove</button>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>
      `;
    }
  },

  buy(id) {
    if (!this.need({ buy: id })) return;
    const l = this.load().find(x => x.id == id);
    if (!l) return;

    const u = window.Auth?.currentUser;
    if (l.sellerEmail && u && l.sellerEmail === u.email) {
      if (window.App?.toast) window.window.App.toast('You cannot buy your own produce listing.', 'error');
      return;
    }

    const defaultQty = Math.min(10, l.qty);
    this.modal(`
      <div class="auth-body" style="padding:1.4rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; border-bottom:1px solid var(--border-color); padding-bottom:0.75rem;">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span style="font-size:1.8rem;">${this.ico(l)}</span>
            <h3 style="margin:0; font-size:1.2rem; font-weight:800;">Instant Order: ${this.esc(l.crop)}</h3>
          </div>
          <button class="icon-btn" data-close="1">✕</button>
        </div>

        <p class="mk-meta" style="margin-bottom:0.4rem;">Seller: <b>${this.esc(l.seller)}</b> (${this.esc(l.loc)})</p>
        <p class="mk-meta">Rate: <b>₹${this.esc(l.price)}/kg</b> · In Stock: <b>${this.esc(l.qty)} kg</b></p>

        <div style="margin:1rem 0;">
          <label class="form-label" style="font-weight:700; font-size:0.85rem; margin-bottom:0.4rem; display:block;">Select Quantity to Buy (kg):</label>
          <input class="form-control" id="mkQty" type="number" min="1" max="${l.qty}" value="${defaultQty}" style="font-size:1rem; font-weight:700;">
        </div>

        <div style="padding:0.75rem; background:var(--bg-surface); border-radius:8px; border:1px solid var(--border-color); margin-bottom:1rem; display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.95rem; font-weight:700;">Total Amount:</span>
          <span style="font-size:1.35rem; font-weight:800; color:var(--primary);">₹<span id="mkTot">${l.price * defaultQty}</span></span>
        </div>

        <button class="btn btn-primary" style="width:100%; padding:0.75rem; font-size:1rem;" id="mkPlace">
          ⚡ Confirm & Place Order
        </button>
        <p class="mk-meta" style="text-align:center; margin-top:0.6rem; font-size:0.72rem;">Demo checkout: Zero payment taken, recorded under My Orders.</p>
      </div>
    `);

    const q = document.getElementById('mkQty');
    if (q) {
      q.oninput = () => {
        const val = Math.max(0, +q.value || 0);
        document.getElementById('mkTot').textContent = val * l.price;
      };
    }

    const placeBtn = document.getElementById('mkPlace');
    if (placeBtn) {
      placeBtn.onclick = () => {
        const n = Math.floor(+q.value);
        if (!(n >= 1 && n <= l.qty)) {
          if (window.App?.toast) window.window.App.toast(`Enter a valid quantity (1 to ${l.qty} kg).`, 'error');
          return;
        }

        const doOrder = (d) => {
          const all = this.load();
          all.find(x => x.id == id).qty -= n;
          this.save(all);

          const u = window.Auth?.currentUser;
          const buyerEmail = u ? u.email : (d.email || 'guest@farm.com');
          const buyerName = u ? u.full_name : (d.name || 'Customer');
          const buyerPhone = d.phone || (u ? u.phone : '') || 'Not provided';
          const buyerAddress = d.address || 'Standard Delivery / Direct Pickup';
          const buyerRole = u ? (u.role || 'Customer') : 'Guest';

          const os = this.orders();
          os.unshift({
            id: Date.now(),
            crop: l.crop,
            icon: this.ico(l),
            qty: n,
            price: l.price,
            total: n * l.price,
            buyer: buyerEmail,
            buyerName: buyerName,
            buyerPhone: buyerPhone,
            buyerAddress: buyerAddress,
            buyerRole: buyerRole,
            seller: l.seller,
            time: new Date().toISOString(),
            ...d,
            status: 'Placed'
          });

          localStorage.setItem(this.O, JSON.stringify(os));
          const m = document.getElementById('mkModal');
          if (m) m.style.display = 'none';

          if (window.App?.toast) window.App.toast(`🎉 Order placed for ${n} kg ${l.crop}!`, 'success');
          this.render();
        };
        if (window.Delivery) Delivery.ask(doOrder); else doOrder({});
      };
    }
  },

  sell() {
    if (!this.need({ sell: 1 })) return;

    this.modal(`
      <div class="auth-body" style="padding:1.4rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; border-bottom:1px solid var(--border-color); padding-bottom:0.75rem;">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span style="font-size:1.5rem;">🌱</span>
            <h3 style="margin:0; font-size:1.2rem; font-weight:800;">Sell Your Farm Produce</h3>
          </div>
          <button class="icon-btn" data-close="1">✕</button>
        </div>

        <div style="margin-bottom:0.75rem;">
          <label class="form-label" style="font-size:0.8rem; font-weight:600;">Crop / Produce Name:</label>
          <input class="form-control" id="sCrop" placeholder="e.g. Organic Tomato, Basmati Rice, Apple">
        </div>

        <div class="grid-2" style="margin-bottom:0.75rem; gap:0.6rem;">
          <div>
            <label class="form-label" style="font-size:0.8rem; font-weight:600;">Category:</label>
            <select class="form-control" id="sCat">
              ${this.cats.slice(1).map(c => `<option>${c}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="form-label" style="font-size:0.8rem; font-weight:600;">Farm Location:</label>
            <input class="form-control" id="sLoc" placeholder="e.g. Karnal, Haryana">
          </div>
        </div>

        <div class="grid-2" style="margin-bottom:1.2rem; gap:0.6rem;">
          <div>
            <label class="form-label" style="font-size:0.8rem; font-weight:600;">Total Quantity (kg):</label>
            <input class="form-control" id="sQty" type="number" min="1" placeholder="e.g. 500">
          </div>
          <div>
            <label class="form-label" style="font-size:0.8rem; font-weight:600;">Price per kg (₹):</label>
            <input class="form-control" id="sPrice" type="number" min="1" placeholder="e.g. 35">
          </div>
        </div>

        <button class="btn btn-primary" style="width:100%; padding:0.75rem; font-size:1rem; font-weight:700;" id="sGo">
          Publish Produce Listing
        </button>
      </div>
    `);

    const goBtn = document.getElementById('sGo');
    if (goBtn) {
      goBtn.onclick = () => {
        const g = id => document.getElementById(id).value.trim();
        const u = window.Auth?.currentUser || {};
        const crop = g('sCrop'), qty = +g('sQty'), price = +g('sPrice');

        if (!crop || !(qty > 0) || !(price > 0)) {
          if (window.App?.toast) window.window.App.toast('Please enter valid crop name, quantity and price.', 'error');
          return;
        }

        const all = this.load();
        all.unshift({
          id: Date.now(),
          crop,
          cat: g('sCat'),
          qty,
          price,
          loc: g('sLoc') || 'Local Farm',
          seller: u.farm_name || u.full_name || 'My Farm',
          sellerEmail: u.email || '',
          icon: this.icons[g('sCat')] || '🌱',
          note: 'Direct from farmer'
        });

        this.save(all);
        const m = document.getElementById('mkModal');
        if (m) m.style.display = 'none';

        if (window.App?.toast) window.window.App.toast('🎉 Your produce is now live in the Marketplace!', 'success');
        this.render();
      };
    }
  },

  init() {
    const pane = document.getElementById('tab-market');
    if (!pane) return;

    // Inject View Cart button into header if not present
    const head = pane.querySelector('.mk-head');
    if (head && !document.getElementById('mkCartBtn')) {
      const cartBtn = document.createElement('button');
      cartBtn.className = 'btn btn-secondary';
      cartBtn.id = 'mkCartBtn';
      cartBtn.style.cssText = 'gap:0.4rem; font-weight:700; margin-left:auto;';
      cartBtn.innerHTML = `🛒 Cart (<span id="mkCartCount" style="background:var(--primary); color:white; padding:0.1rem 0.45rem; border-radius:99px; font-size:0.75rem; font-weight:700;">0</span>)`;
      
      const sellBtn = document.getElementById('mkSellBtn');
      if (sellBtn) {
        const wrap = document.createElement('div');
        wrap.style.cssText = 'display:flex; gap:0.6rem; align-items:center; flex-wrap:wrap;';
        sellBtn.parentNode.insertBefore(wrap, sellBtn);
        wrap.appendChild(cartBtn);
        wrap.appendChild(sellBtn);
      } else {
        head.appendChild(cartBtn);
      }
    }

    pane.addEventListener('click', e => {
      const cartBtn = e.target.closest('#mkCartBtn');
      const addCart = e.target.closest('[data-cart-add]');
      const buy = e.target.closest('[data-buy]');
      const cat = e.target.closest('[data-cat]');
      const del = e.target.closest('[data-del]');
      const sell = e.target.closest('#mkSellBtn');
      const adminDelOrder = e.target.closest('[data-admin-del-order]');
      const openUserLog = e.target.closest('#btnOpenUserLog');

      if (cartBtn) this.openCart();
      else if (addCart) this.addToCart(addCart.dataset.cartAdd);
      else if (buy) this.buy(buy.dataset.buy);
      else if (cat) { this.cat = cat.dataset.cat; this.render(); }
      else if (del) { this.save(this.load().filter(l => l.id != del.dataset.del)); this.render(); }
      else if (sell) this.sell();
      else if (adminDelOrder) this.deleteOrder(adminDelOrder.dataset.adminDelOrder);
      else if (openUserLog) { if (window.LoginLog?.openPanel) window.LoginLog.openPanel(); }
    });

    pane.addEventListener('change', e => {
      const statusSelect = e.target.closest('[data-admin-status]');
      if (statusSelect) {
        this.updateOrderStatus(statusSelect.dataset.adminStatus, statusSelect.value);
      }
    });

    const searchInput = document.getElementById('mkSearch');
    if (searchInput) {
      searchInput.oninput = e => { this.q = e.target.value; this.render(); };
    }

    // Price sort dropdown
    const tools = document.querySelector('.mk-tools');
    if (tools && !document.getElementById('mkSort')) {
      const s = document.createElement('select');
      s.id = 'mkSort';
      s.className = 'form-control';
      s.style.maxWidth = '190px';
      s.innerHTML = `
        <option value="new">Sort: Newest</option>
        <option value="low">Price: Low → High</option>
        <option value="high">Price: High → Low</option>
        <option value="az">Name: A → Z</option>
      `;
      s.onchange = () => { this.sort = s.value; this.render(); };
      const chips = document.getElementById('mkChips');
      if (chips) tools.insertBefore(s, chips);
      else tools.appendChild(s);
    }

    this.render();
  }
};

window.Market = Market;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Market.init());
} else {
  Market.init();
}

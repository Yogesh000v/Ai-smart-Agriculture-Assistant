/**
- ============================================================================
- AI Smart Agriculture Assistant - Crop Scanner & Plant Disease Diagnostic Lab
- Advanced foliar health analysis, crop classification (Vegetables, Fruits,
- Cereals, Pulses), and precision botanical treatment recovery plans.
- ============================================================================
 */

const CROP_CATALOG = {
  broccoli: {
    name: 'Broccoli',
    icon: '🥦',
    category: 'Vegetable',
    categoryBadge: '🥬 Vegetable · Cruciferous Cole Crop',
    badgeColor: '#10b981',
    family: 'Brassicaceae (Cruciferous / Mustard Family)',
    botanical: 'Brassica oleracea var. italica',
    nature: 'Cool-season vegetable · Edible immature flower head & stalks',
    nutrition: 'Rich in Vitamin C, Vitamin K, Sulforaphane, Dietary Fiber & Folate',
    climate: '15°C – 22°C · Well-drained fertile loam · pH 6.0 – 6.8',
    care: 'Regular shallow irrigation, balanced N-P-K (prevent Boron deficiency to avoid hollow stems).'
  },
  tomato: {
    name: 'Tomato',
    icon: '🍅',
    category: 'Vegetable',
    categoryBadge: '🥬 Vegetable · Solanaceous Fruiting Vegetable',
    badgeColor: '#ef4444',
    family: 'Solanaceae (Nightshade Family)',
    botanical: 'Solanum lycopersicum',
    nature: 'Warm-season tender fruiting vegetable (culinary vegetable, botanical fruit)',
    nutrition: 'High in Lycopene (potent antioxidant), Vitamin C, Potassium & Vitamin A',
    climate: '21°C – 29°C · Deep loamy soil · pH 6.2 – 6.8',
    care: 'Use drip irrigation to prevent early blight and blossom-end rot (adequate Calcium).'
  },
  potato: {
    name: 'Potato',
    icon: '🥔',
    category: 'Vegetable',
    categoryBadge: '🥔 Tuberous Vegetable · Root & Tuber Crop',
    badgeColor: '#f59e0b',
    family: 'Solanaceae (Nightshade Family)',
    botanical: 'Solanum tuberosum',
    nature: 'Starchy edible stem tuber vegetable · Global staple vegetable',
    nutrition: 'Rich in Complex Carbohydrates, Potassium, Vitamin C & Vitamin B6',
    climate: '15°C – 20°C · Loose, sandy-loam well-aerated soil · pH 5.0 – 6.5',
    care: 'Hill up soil around stems to prevent tuber greening (solanine) and late blight.'
  },
  apple: {
    name: 'Apple',
    icon: '🍎',
    category: 'Fruit',
    categoryBadge: '🍎 Fruit · Deciduous Pomaceous Tree Fruit',
    badgeColor: '#e11d48',
    family: 'Rosaceae (Rose Family)',
    botanical: 'Malus domestica',
    nature: 'Perennial temperate tree fruit · Fleshy pome fruit',
    nutrition: 'High in Dietary Fiber (Pectin), Vitamin C, Potassium & Quercetin antioxidants',
    climate: 'Winter chilling hours (<7°C) · Well-drained rich loam · pH 6.0 – 7.0',
    care: 'Annual canopy pruning for sunlight penetration; preventive fungicide spray for scab at bud-break.'
  },
  rice: {
    name: 'Rice (Paddy)',
    icon: '🌾',
    category: 'Cereal Crop',
    categoryBadge: '🌾 Cereal Crop · Major Food Grain Staple',
    badgeColor: '#3b82f6',
    family: 'Poaceae (Gramineae / Grass Family)',
    botanical: 'Oryza sativa',
    nature: 'Primary cereal food grain crop · Staple food for over half the world',
    nutrition: 'Main source of Dietary Carbohydrates, Clean Energy & B-vitamins',
    climate: '20°C – 37°C · Clayey / heavy soils with high water retention · pH 5.5 – 7.0',
    care: 'Maintain 3–5 cm water depth during tillering; avoid excess nitrogen to prevent leaf blast.'
  },
  wheat: {
    name: 'Wheat',
    icon: '🌾',
    category: 'Cereal Crop',
    categoryBadge: '🌾 Cereal Crop · Major Staple Grain',
    badgeColor: '#d97706',
    family: 'Poaceae (Gramineae / Grass Family)',
    botanical: 'Triticum aestivum',
    nature: 'Cool-season staple cereal grass crop (Rabi season food grain)',
    nutrition: 'Rich in Plant Protein (Gluten), Complex Starches, Fiber, Iron & B-complex',
    climate: '14°C – 24°C · Well-drained fertile loams · pH 6.0 – 7.5',
    care: 'Critical irrigation at Crown Root Initiation (CRI) 21 days after sowing.'
  },
  maize: {
    name: 'Maize (Corn)',
    icon: '🌽',
    category: 'Cereal Crop',
    categoryBadge: '🌽 Cereal Crop · Coarse Grain & C4 Crop',
    badgeColor: '#eab308',
    family: 'Poaceae (Gramineae / Grass Family)',
    botanical: 'Zea mays',
    nature: 'Warm-season highly efficient C4 cereal grain & fodder crop',
    nutrition: 'Loaded with Carotenoids (Lutein & Zeaxanthin for eye health), Fiber & Energy',
    climate: '21°C – 30°C · Deep fertile loam with good organic matter · pH 6.0 – 7.2',
    care: 'Heavy nitrogen feeder; ensure good drainage and scout for fall armyworm.'
  },
  cabbage: {
    name: 'Cabbage',
    icon: '🥬',
    category: 'Vegetable',
    categoryBadge: '🥬 Vegetable · Leafy Cole Vegetable',
    badgeColor: '#10b981',
    family: 'Brassicaceae (Cruciferous / Mustard Family)',
    botanical: 'Brassica oleracea var. capitata',
    nature: 'Cool-season vegetable forming dense edible leafy head',
    nutrition: 'Rich in Vitamin C, Vitamin K, Anthocyanins & Glucosinolates',
    climate: '15°C – 20°C · Moisture-retentive loamy soil · pH 6.0 – 6.8',
    care: 'Mulch to preserve uniform soil moisture; rotate crops to prevent clubroot disease.'
  },
  cauliflower: {
    name: 'Cauliflower',
    icon: '🥦',
    category: 'Vegetable',
    categoryBadge: '🥬 Vegetable · Cole Vegetable (Curd)',
    badgeColor: '#10b981',
    family: 'Brassicaceae (Cruciferous / Mustard Family)',
    botanical: 'Brassica oleracea var. botrytis',
    nature: 'Cool-season edible floral curd vegetable',
    nutrition: 'High in Choline, Vitamin C, Vitamin K & Antioxidants',
    climate: '16°C – 20°C · Deep fertile loam · pH 6.0 – 7.0',
    care: 'Tie outer leaves over developing curds (blanching) to maintain spotless white curds.'
  },
  chilli: {
    name: 'Green Chilli',
    icon: '🌶️',
    category: 'Spice / Vegetable',
    categoryBadge: '🌶️ Spice & Vegetable · Pungent Pod Crop',
    badgeColor: '#ef4444',
    family: 'Solanaceae (Nightshade Family)',
    botanical: 'Capsicum annuum',
    nature: 'Warm-season pungent pod used both as fresh vegetable and spice',
    nutrition: 'Extremely rich in Vitamin C (more than oranges), Capsaicin & Beta-carotene',
    climate: '20°C – 32°C · Light well-drained loam · pH 6.5 – 7.5',
    care: 'Avoid excess nitrogen during flowering; control thrips and mites to prevent leaf curl virus.'
  },
  onion: {
    name: 'Onion',
    icon: '🧅',
    category: 'Vegetable',
    categoryBadge: '🧅 Vegetable · Bulb Vegetable & Seasoning',
    badgeColor: '#a855f7',
    family: 'Amaryllidaceae (Alliaceae / Onion Family)',
    botanical: 'Allium cepa',
    nature: 'Biennial grown as annual for underground edible layered bulbs',
    nutrition: 'Packed with Quercetin, Allyl Propyl Disulfide (sulfur compounds) & Prebiotics',
    climate: '13°C – 24°C · Light, friable sandy-loam · pH 6.0 – 6.8',
    care: 'Keep weed-free (shallow roots); stop watering 12 days before harvest for proper bulb curing.'
  },
  carrot: {
    name: 'Carrot',
    icon: '🥕',
    category: 'Vegetable',
    categoryBadge: '🥕 Vegetable · Root Vegetable',
    badgeColor: '#f97316',
    family: 'Apiaceae (Umbelliferae / Carrot Family)',
    botanical: 'Daucus carota subsp. sativus',
    nature: 'Root vegetable grown for its sweet, crisp taproot',
    nutrition: 'Outstanding source of Beta-Carotene (Provitamin A), Lutein & Dietary Fiber',
    climate: '16°C – 20°C · Deep, loose, stone-free sandy soil · pH 6.0 – 6.8',
    care: 'Soil must be loose and free of rocks to prevent forking or crooked taproots.'
  },
  mango: {
    name: 'Mango',
    icon: '🥭',
    category: 'Fruit',
    categoryBadge: '🥭 Fruit · Tropical King of Fruits',
    badgeColor: '#f97316',
    family: 'Anacardiaceae (Cashew Family)',
    botanical: 'Mangifera indica',
    nature: 'Evergreen perennial tropical tree fruit (National fruit of India)',
    nutrition: 'Superb source of Vitamin A, Vitamin C, Folate & Digestive Enzymes (Amylases)',
    climate: '24°C – 32°C · Deep alluvial or rich loamy soil · pH 5.5 – 7.5',
    care: 'Withhold irrigation before flowering to induce profuse flower panicles.'
  },
  banana: {
    name: 'Banana',
    icon: '🍌',
    category: 'Fruit',
    categoryBadge: '🍌 Fruit · Tropical Giant Herbaceous Fruit',
    badgeColor: '#eab308',
    family: 'Musaceae (Banana Family)',
    botanical: 'Musa acuminata / paradisiaca',
    nature: 'Large perennial monocot herb producing edible hanging berry clusters',
    nutrition: 'High in Potassium, Vitamin B6, Vitamin C & Fast-acting Healthy Energy',
    climate: '22°C – 35°C · Heavy feeding soil with high drainage · pH 6.0 – 7.5',
    care: 'Provide heavy Potash (K) fertilizer and wind propping (bamboo poles) for heavy bunches.'
  },
  pulse: {
    name: 'Chickpea / Moong (Pulses)',
    icon: '🫘',
    category: 'Pulse / Legume',
    categoryBadge: '🫘 Pulse · Grain Legume & Nitrogen Fixer',
    badgeColor: '#8b5cf6',
    family: 'Fabaceae (Leguminosae / Bean Family)',
    botanical: 'Cicer arietinum / Vigna radiata',
    nature: 'Food grain pulse crop · Natural soil-enriching nitrogen fixer',
    nutrition: 'High in Plant Protein (22–24%), Complex Fiber, Iron, Folate & Zinc',
    climate: '15°C – 28°C · Well-drained loams with moderate moisture · pH 6.0 – 8.0',
    care: 'Inoculate seed with Rhizobium bio-fertilizer; avoid waterlogged fields.'
  },
  mustard: {
    name: 'Mustard',
    icon: '🌻',
    category: 'Oilseed Crop',
    categoryBadge: '🌻 Oilseed · Winter Cash Crop',
    badgeColor: '#eab308',
    family: 'Brassicaceae (Cruciferous / Mustard Family)',
    botanical: 'Brassica juncea',
    nature: 'Winter oilseed crop grown for edible cooking oil and seeds',
    nutrition: 'Rich in Healthy MUFA (Omega-3/6), Glucosinolates & Antioxidants',
    climate: '15°C – 25°C · Loam to clay-loam soils · pH 6.0 – 7.5',
    care: 'Ensure timely sowing in October; monitor for mustard aphid during flowering.'
  },
  brinjal: {
    name: 'Brinjal / Eggplant (बैंगन)',
    icon: '🍆',
    category: 'Vegetable',
    categoryBadge: '🥬 Vegetable · Solanaceous Fruiting Vegetable',
    badgeColor: '#a855f7',
    family: 'Solanaceae (Nightshade Family)',
    botanical: 'Solanum melongena',
    nature: 'Warm-season tender perennial grown as annual for fleshy edible fruit',
    nutrition: 'Rich in Dietary Fiber, Potassium, Folate & Nasunin antioxidant',
    climate: '22°C – 32°C · Deep rich loam with organic matter · pH 5.5 – 6.8',
    care: 'Prune lower suckers; install pheromone traps for shoot & fruit borer.'
  },
  okra: {
    name: 'Ladyfinger / Okra (भिंडी)',
    icon: '🥬',
    category: 'Vegetable',
    categoryBadge: '🥬 Vegetable · Warm Season Pod Vegetable',
    badgeColor: '#10b981',
    family: 'Malvaceae (Mallow Family)',
    botanical: 'Abelmoschus esculentus',
    nature: 'Warm-season pod vegetable valued for its tender mucilaginous pods',
    nutrition: 'High in Soluble Fiber, Folate, Vitamin C & Vitamin K',
    climate: '24°C – 35°C · Well-drained sandy-loam · pH 6.0 – 7.5',
    care: 'Pick pods every 2–3 days to encourage continuous fruiting; manage whitefly to prevent YVMV.'
  },
  garlic: {
    name: 'Garlic (लहसुन)',
    icon: '🧄',
    category: 'Spice / Vegetable',
    categoryBadge: '🧄 Spice & Vegetable · Compound Bulb',
    badgeColor: '#cbd5e1',
    family: 'Amaryllidaceae (Alliaceae)',
    botanical: 'Allium sativum',
    nature: 'Cool-season bulbous perennial grown as annual for segmented cloves',
    nutrition: 'Potent in Allicin (natural antimicrobial & heart health), Sulfur & Selenium',
    climate: '12°C – 24°C · Light, friable fertile loam · pH 6.0 – 7.0',
    care: 'Plant healthy large cloves tip-up in autumn; withhold water 15 days before digging.'
  },
  ginger: {
    name: 'Ginger (अदरक)',
    icon: '🫚',
    category: 'Spice / Tuber',
    categoryBadge: '🫚 Spice & Herb · Edible Rhizome',
    badgeColor: '#d97706',
    family: 'Zingiberaceae (Ginger Family)',
    botanical: 'Zingiber officinale',
    nature: 'Tropical perennial grown for its aromatic pungent underground rhizomes',
    nutrition: 'Rich in Gingerols & Shogaols (anti-inflammatory, digestive stimulant)',
    climate: '22°C – 32°C with partial shade · Loose humus-rich soil · pH 5.5 – 6.5',
    care: 'Heavy mulching with green leaves; prevent waterlogging to avoid rhizome soft rot.'
  },
  peas: {
    name: 'Green Peas (मटर)',
    icon: '🫛',
    category: 'Vegetable',
    categoryBadge: '🥬 Vegetable · Cool-Season Pod Legume',
    badgeColor: '#10b981',
    family: 'Fabaceae (Leguminosae)',
    botanical: 'Pisum sativum',
    nature: 'Cool-season climbing annual legume bearing sweet green edible seeds in pods',
    nutrition: 'Loaded with Plant Protein, Fiber, Lutein, Vitamin K & Vitamin C',
    climate: '10°C – 18°C · Well-aerated loam · pH 6.0 – 7.5',
    care: 'Provide trellis netting for vine varieties; avoid excessive heat during flowering.'
  },
  spinach: {
    name: 'Spinach / Palak (पालक)',
    icon: '🥬',
    category: 'Vegetable',
    categoryBadge: '🥬 Vegetable · Nutritious Leafy Green',
    badgeColor: '#10b981',
    family: 'Amaranthaceae (Goosefoot Family)',
    botanical: 'Spinacia oleracea',
    nature: 'Cool-season annual grown for its tender, nutrient-dense green leaves',
    nutrition: 'Remarkable source of Non-Heme Iron, Folate, Vitamin K, Vitamin A & Calcium',
    climate: '15°C – 22°C · Nitrogen-rich moisture-retentive loam · pH 6.5 – 7.5',
    care: 'Successive harvesting of outer leaves; keep soil moist to delay bolting.'
  },
  cucumber: {
    name: 'Cucumber (खीरा)',
    icon: '🥒',
    category: 'Vegetable',
    categoryBadge: '🥬 Vegetable · Cucurbitaceous Vine Vegetable',
    badgeColor: '#10b981',
    family: 'Cucurbitaceae (Gourd Family)',
    botanical: 'Cucumis sativus',
    nature: 'Warm-season trailing or climbing vine bearing cylindrical crisp fruits',
    nutrition: '95% Water content, Silica, Potassium, Vitamin K & Antioxidants',
    climate: '22°C – 32°C · Warm, fertile well-drained loam · pH 6.0 – 7.0',
    care: 'Vertical trellising improves fruit straightness; apply drip irrigation to avoid powdery mildew.'
  },
  gourd: {
    name: 'Bottle Gourd / Lauki (लौकी)',
    icon: '🥒',
    category: 'Vegetable',
    categoryBadge: '🥬 Vegetable · Cucurbit Vine Vegetable',
    badgeColor: '#10b981',
    family: 'Cucurbitaceae (Gourd Family)',
    botanical: 'Lagenaria siceraria',
    nature: 'Vigorous annual climbing vine producing long edible green calabash gourds',
    nutrition: 'High Water Content, Dietary Fiber, Cooling Electrolytes & Vitamin C',
    climate: '24°C – 35°C · Sandy-loam rich in compost · pH 6.5 – 7.5',
    care: 'Pinch main vines at 2m to stimulate secondary fruit-bearing female branches (3G cutting).'
  },
  bittergourd: {
    name: 'Bitter Gourd / Karela (करेला)',
    icon: '🥒',
    category: 'Vegetable',
    categoryBadge: '🥬 Vegetable · Medicinal Gourd',
    badgeColor: '#10b981',
    family: 'Cucurbitaceae (Gourd Family)',
    botanical: 'Momordica charantia',
    nature: 'Tropical and subtropical vine bearing ridged, bitter-tasting fruits',
    nutrition: 'Contains Charantin & Polypeptide-p (natural blood sugar regulator) & Vitamin C',
    climate: '24°C – 35°C · Well-drained sandy-loam · pH 6.0 – 7.0',
    care: 'Trellis vines on bower system; spray neem oil to deter fruit flies.'
  },
  capsicum: {
    name: 'Capsicum / Bell Pepper (शिमला मिर्च)',
    icon: '🫑',
    category: 'Vegetable',
    categoryBadge: '🥬 Vegetable · Sweet Bell Pepper',
    badgeColor: '#10b981',
    family: 'Solanaceae (Nightshade Family)',
    botanical: 'Capsicum annuum var. grossum',
    nature: 'Warm-season tender fruiting vegetable producing large, hollow sweet berries',
    nutrition: 'Extraordinary Vitamin C (over 200% daily value), Vitamin A & Zeaxanthin',
    climate: '18°C – 26°C · Fertile loam in polyhouse / open shade · pH 6.0 – 6.8',
    care: 'Stake multi-stem plants; maintain consistent moisture to prevent blossom-end rot.'
  },
  papaya: {
    name: 'Papaya (पपीता)',
    icon: '🍈',
    category: 'Fruit',
    categoryBadge: '🍎 Fruit · Tropical Fast-Bearing Tree Fruit',
    badgeColor: '#f59e0b',
    family: 'Caricaceae (Papaya Family)',
    botanical: 'Carica papaya',
    nature: 'Rapid-growing tropical semi-woody giant herb producing fleshy melon-like fruits',
    nutrition: 'High in Papain enzyme (protein digestion), Vitamin C, Beta-Carotene & Lycopene',
    climate: '22°C – 35°C · High drainage is essential (sensitive to root rot) · pH 6.0 – 7.0',
    care: 'Zero tolerance for waterlogging; maintain 1 male tree per 10 female trees for dioecious types.'
  },
  guava: {
    name: 'Guava (अमरूद)',
    icon: '🍏',
    category: 'Fruit',
    categoryBadge: '🍎 Fruit · Subtropical Vitamin C Superfruit',
    badgeColor: '#10b981',
    family: 'Myrtaceae (Myrtle Family)',
    botanical: 'Psidium guajava',
    nature: 'Hardy evergreen shrub/tree bearing round fragrant fruits with crisp or soft flesh',
    nutrition: '4x More Vitamin C than oranges, High Dietary Fiber & Lycopene',
    climate: '15°C – 35°C · Adaptable to all soils including clay and saline · pH 5.5 – 8.0',
    care: 'Bahar regulation (withholding irrigation to promote high-quality winter crop).'
  },
  pomegranate: {
    name: 'Pomegranate (अनार)',
    icon: '🍎',
    category: 'Fruit',
    categoryBadge: '🍎 Fruit · Arid Drought-Tolerant Superfruit',
    badgeColor: '#ef4444',
    family: 'Lythraceae (Loosestrife Family)',
    botanical: 'Punica granatum',
    nature: 'Deciduous spiny shrub or small tree bearing leathery berries packed with jewel-like arils',
    nutrition: 'Punicalagins & Punicaic Acid (extraordinary heart-healthy antioxidants), Vitamin K',
    climate: '18°C – 38°C · Semi-arid sunny climates with deep loamy soil · pH 6.5 – 7.5',
    care: 'Maintain drip irrigation to prevent fruit cracking during maturation; protect against bacterial blight.'
  },
  grapes: {
    name: 'Grapes (अंगूर)',
    icon: '🍇',
    category: 'Fruit',
    categoryBadge: '🍎 Fruit · Deciduous Berry Vine',
    badgeColor: '#8b5cf6',
    family: 'Vitaceae (Grapevine Family)',
    botanical: 'Vitis vinifera',
    nature: 'Woody perennial climbing vine bearing clusters of succulent berries',
    nutrition: 'Rich in Resveratrol, Anthocyanins, Vitamin K & Copper',
    climate: '15°C – 35°C (Warm dry summer during ripening) · Sandy to gravelly loam · pH 6.5 – 8.0',
    care: 'Bower / Y-trellis training; strict canopy aeration to prevent downy mildew.'
  },
  watermelon: {
    name: 'Watermelon (तरबूज)',
    icon: '🍉',
    category: 'Fruit',
    categoryBadge: '🍎 Fruit · Summer Refreshing Pepo',
    badgeColor: '#ef4444',
    family: 'Cucurbitaceae (Gourd Family)',
    botanical: 'Citrullus lanatus',
    nature: 'Annual scrambling vine bearing giant sweet thirst-quenching fruits',
    nutrition: '92% Water, Rich in Citrulline (amino acid), Lycopene & Vitamin A',
    climate: '25°C – 35°C · Deep, warm sandy riverbed or loamy soil · pH 6.0 – 7.0',
    care: 'Riverbed farming or drip mulch; reduce irrigation 10 days before harvest to build sugars.'
  },
  orange: {
    name: 'Orange / Kinnow (संतरा / किन्नू)',
    icon: '🍊',
    category: 'Fruit',
    categoryBadge: '🍎 Fruit · Evergreen Citrus Tree Fruit',
    badgeColor: '#f97316',
    family: 'Rutaceae (Citrus / Rue Family)',
    botanical: 'Citrus sinensis / Citrus reticulata',
    nature: 'Subtropical evergreen small tree producing juicy segmented hesperidium fruits',
    nutrition: 'High in Vitamin C, Hesperidin flavonoids, Potassium & Folate',
    climate: '18°C – 32°C · Deep, well-drained fertile sandy-loam · pH 6.0 – 7.5',
    care: 'Provide Micronutrient foliar spray (Zinc, Iron, Boron); manage citrus psylla to avoid greening.'
  },
  lemon: {
    name: 'Lemon / Lime (नींबू)',
    icon: '🍋',
    category: 'Fruit',
    categoryBadge: '🍋 Fruit · High Acid Culinary Fruit',
    badgeColor: '#eab308',
    family: 'Rutaceae (Citrus Family)',
    botanical: 'Citrus limon / Citrus aurantiifolia',
    nature: 'Small thorny evergreen citrus tree producing acidic fragrant fruits',
    nutrition: 'Concentrated Citric Acid, Vitamin C, Limonene & Bioflavonoids',
    climate: '18°C – 35°C · Well-drained light loams · pH 6.0 – 7.5',
    care: 'Scout for citrus canker; spray Copper Oxychloride (0.25%) + Streptocycline.'
  },
  sugarcane: {
    name: 'Sugarcane (गन्ना)',
    icon: '🎋',
    category: 'Commercial Crop',
    categoryBadge: '🎋 Commercial Crop · High Biomass Sucrose Grass',
    badgeColor: '#10b981',
    family: 'Poaceae (Gramineae / Grass Family)',
    botanical: 'Saccharum officinarum',
    nature: 'Perennial giant grass cultivated for its sweet juice and sucrose',
    nutrition: 'Natural sucrose energy, Potassium, Magnesium, Iron & Antioxidants',
    climate: '24°C – 38°C · Deep rich fertile loams with high irrigation · pH 6.5 – 7.5',
    care: 'Trash mulching between rows; prevent red rot by treating sets with carbendazim.'
  },
  cotton: {
    name: 'Cotton (कपास)',
    icon: '☁️',
    category: 'Commercial Crop',
    categoryBadge: '☁️ Commercial Crop · Natural Fiber Cash Crop',
    badgeColor: '#64748b',
    family: 'Malvaceae (Mallow Family)',
    botanical: 'Gossypium hirsutum / Gossypium arboreum',
    nature: 'Warm-season shrub grown for fluffy natural cellulose fibers (lint) and seed oil',
    nutrition: 'Major global textile fiber; cotton seed meal rich in plant protein',
    climate: '22°C – 35°C · Deep black cotton soil (Regur) or alluvial loam · pH 6.5 – 8.0',
    care: 'Monitor pink bollworm with pheromone traps; avoid water stress during boll bursting.'
  },
  soybean: {
    name: 'Soybean (सोयाबीन)',
    icon: '🫘',
    category: 'Oilseed Crop',
    categoryBadge: '🫘 Oilseed & Pulse · Golden Protein Bean',
    badgeColor: '#d97706',
    family: 'Fabaceae (Leguminosae)',
    botanical: 'Glycine max',
    nature: 'Annual legume grown as primary source of vegetable oil and complete plant protein',
    nutrition: 'Unmatched 40% Complete Protein, 20% Healthy Oil, Isoflavones & Lecithin',
    climate: '22°C – 32°C · Fertile loams and black cotton soils · pH 6.0 – 7.5',
    care: 'Seed treatment with Bradyrhizobium japonicum; protect against yellow mosaic virus.'
  },
  millet: {
    name: 'Millets / Bajra / Jowar / Ragi (मोटा अनाज)',
    icon: '🌾',
    category: 'Cereal Crop',
    categoryBadge: '🌾 Cereal Crop · Climate-Resilient Nutri-Cereal',
    badgeColor: '#f59e0b',
    family: 'Poaceae (Gramineae / Grass Family)',
    botanical: 'Pennisetum glaucum / Sorghum bicolor / Eleusine coracana',
    nature: 'Highly drought-tolerant, climate-smart coarse grain food & fodder crop',
    nutrition: 'Super-rich in Iron, Calcium (Ragi is #1), Dietary Fiber & Gluten-Free',
    climate: '25°C – 38°C · Thrives in low-rainfall semi-arid poor soils · pH 6.0 – 8.0',
    care: 'Requires minimal water; weed early in first 30 days.'
  },
  unknown: {
    name: 'Crop (not identified)',
    icon: '🌿',
    category: 'Unidentified',
    categoryBadge: '🔍 Not identified yet · choose your crop below',
    badgeColor: '#64748b',
    family: 'Choose the crop to see its family',
    botanical: '—',
    nature: 'The crop could not be identified from the photo alone.',
    nutrition: 'Choose your crop to see its nutritional value.',
    climate: 'Choose your crop to see its climate and soil needs.',
    care: 'Pick your crop from the list on the right for crop-specific advice.'
  }
};

/* Crop guessed from file name / AI text. Returns a CROP_CATALOG key or null. */
const CROP_ALIASES = {
  potato: ['potato', 'potatoes', 'aloo', 'spud', 'batata'],
  tomato: ['tomato', 'tomatoes', 'tamatar'],
  rice: ['rice', 'paddy', 'dhan', 'oryza', 'chawal'],
  wheat: ['wheat', 'gehun', 'gehu'],
  maize: ['maize', 'corn', 'bhutta', 'makka'],
  chilli: ['chilli', 'chili', 'chilly', 'mirch', 'pepper'],
  capsicum: ['capsicum', 'shimlamirch', 'bellpepper', 'bell pepper'],
  onion: ['onion', 'onions', 'pyaz', 'pyaaz'],
  garlic: ['garlic', 'lehsun', 'lahsun'],
  ginger: ['ginger', 'adrak', 'adrakh'],
  carrot: ['carrot', 'carrots', 'gajar'],
  cabbage: ['cabbage', 'patta gobi', 'band gobi'],
  cauliflower: ['cauliflower', 'phool gobi', 'gobi', 'gobhi'],
  broccoli: ['broccoli', 'floret'],
  brinjal: ['brinjal', 'eggplant', 'baingan', 'aubergine'],
  okra: ['okra', 'ladyfinger', 'bhindi', 'gumbo'],
  peas: ['peas', 'pea', 'matar', 'muttar'],
  spinach: ['spinach', 'palak', 'spinacia'],
  cucumber: ['cucumber', 'kheera', 'kakdi'],
  gourd: ['gourd', 'lauki', 'bottlegourd', 'ghiya'],
  bittergourd: ['bittergourd', 'karela', 'bitter melon'],
  apple: ['apple', 'apples', 'seb'],
  mango: ['mango', 'mangoes', 'aam'],
  banana: ['banana', 'bananas', 'kela'],
  papaya: ['papaya', 'papita'],
  guava: ['guava', 'amrood', 'amrud'],
  pomegranate: ['pomegranate', 'anaar', 'anar'],
  grapes: ['grapes', 'grape', 'angoor'],
  watermelon: ['watermelon', 'tarbooz', 'tarbuz'],
  orange: ['orange', 'kinnow', 'santra', 'mosambi'],
  lemon: ['lemon', 'lime', 'nimbu', 'neembu'],
  mustard: ['mustard', 'sarson', 'rapeseed'],
  pulse: ['pulse', 'chickpea', 'chana', 'moong', 'dal', 'lentil', 'bean', 'gram', 'urad', 'toor', 'arhar'],
  soybean: ['soybean', 'soya', 'soy'],
  sugarcane: ['sugarcane', 'ganna'],
  cotton: ['cotton', 'kapas'],
  millet: ['millet', 'bajra', 'jowar', 'ragi']
};

const ScannerPlus = {
  facing: 'environment',
  stream: null,
  currentCropKey: 'tomato',
  lastAnalysis: null,
  scanId: 0,
  objectUrl: null,

  $(id) { return document.getElementById(id); },
  esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); },

  init() {
    this.enhanceUI();
    this.bindEvents();
    this.takeOverLegacyHandlers();
    this.syncSampleCrop('TOM-EB-01');
    window.addEventListener('resize', () => {
      if (this.lastAnalysis && !this.lastAnalysis.none) this.placeBox(this.lastAnalysis, this.lastColor);
    });
  },

  takeOverLegacyHandlers() {
    if (window.AIDiseaseDetect) AIDiseaseDetect.handleFileUpload = f => this.handle(f);
    if (window.AIVision) AIVision.handle = f => this.handle(f);
  },

  enhanceUI() {
    const oldZone = this.$('diseaseDropzone');
    if (!oldZone || this.$('spFile')) return;

    const zone = oldZone.cloneNode(false);
    oldZone.replaceWith(zone);

    zone.insertAdjacentHTML('beforebegin', `
      <input type="file" id="spFile" accept="image/*" style="display:none">
      <input type="file" id="spCam" accept="image/*" capture="environment" style="display:none">
    `);

    zone.className = 'upload-dropzone sp-zone';
    zone.innerHTML = `
      <div style="font-size:2rem;margin-bottom:0.25rem;">📸</div>
      <div style="font-weight:700;font-size:0.95rem;">Scan Crop, Vegetable, Fruit or Foliage</div>
      <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.6rem;">
        Instant Disease Diagnosis · Automatic Crop Classification · Botanical Details
      </div>
      <div class="sp-btns">
        <button class="btn btn-primary" id="spBtnCam" type="button"><span>📷</span> Take Photo</button>
        <button class="btn btn-secondary" id="spBtnUpload" type="button"><span>🖼️</span> Upload from Device</button>
      </div>
      <div style="font-size:0.72rem;color:var(--text-muted);margin-top:0.4rem;">
        Or drag & drop any image here (JPG, PNG, WEBP)
      </div>
    `;

    const diagHeader = document.querySelector('#tab-disease .card:last-child .card-header');
    if (diagHeader && !this.$('spCropBanner')) {
      const banner = document.createElement('div');
      banner.id = 'spCropBanner';
      banner.style.cssText = 'margin:1rem 1rem 0;';
      diagHeader.after(banner);
    }
  },

  bindEvents() {
    const file = this.$('spFile'), cam = this.$('spCam'), zone = this.$('diseaseDropzone');
    if (!file || !cam || !zone) return;

    this.$('spBtnCam').onclick = e => { e.stopPropagation(); this.takePhoto(); };
    this.$('spBtnUpload').onclick = e => { e.stopPropagation(); file.click(); };
    file.onchange = e => this.pick(e);
    cam.onchange = e => this.pick(e);

    zone.onclick = e => { if (!e.target.closest('button')) file.click(); };
    ['dragover', 'dragenter'].forEach(ev => zone.addEventListener(ev, e => { e.preventDefault(); zone.classList.add('drag'); }));
    zone.addEventListener('dragleave', () => zone.classList.remove('drag'));
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('drag');
      const f = e.dataTransfer && e.dataTransfer.files[0];
      if (f) this.handle(f);
    });

    document.querySelectorAll('.sample-leaf-card').forEach(c => c.addEventListener('click', () => {
      this.syncSampleCrop(c.getAttribute('data-code'));
    }));
  },

  syncSampleCrop(code) {
    const map = {
      'TOM-EB-01': 'tomato', 'POT-LB-02': 'potato', 'RIC-BL-03': 'rice',
      'CRN-NL-04': 'maize', 'APP-SC-05': 'apple', 'PLT-HL-00': 'broccoli'
    };
    const key = map[code] || 'tomato';
    this.scanId++;
    this.lastAnalysis = null;
    this.currentCropKey = key;

    const prev = this.$('leafPreviewImg'), ph = this.$('leafPlaceholder'), plan = this.$('spPlan');
    if (prev) { prev.style.display = 'none'; prev.removeAttribute('src'); }
    if (ph) ph.style.display = '';
    if (plan) plan.style.display = 'none';
    this.renderCropInfo(key, '');
  },

  pick(e) {
    const f = e.target.files[0];
    e.target.value = '';
    if (f) this.handle(f);
  },

  takePhoto() {
    const mobile = matchMedia('(pointer:coarse)').matches;
    if (mobile || !(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
      return this.$('spCam').click();
    }
    this.openCamera();
  },

  async openCamera() {
    let m = this.$('spCamModal');
    if (!m) {
      m = document.createElement('div');
      m.id = 'spCamModal';
      m.className = 'modal-backdrop';
      m.innerHTML = `
        <div class="sp-cam">
          <video id="spVid" autoplay playsinline muted></video>
          <div class="sp-cam-bar">
            <button class="btn btn-secondary" id="spSwitch">🔄 Flip</button>
            <button class="btn btn-primary" id="spSnap">📸 Capture</button>
            <button class="btn btn-secondary" id="spClose">✖ Close</button>
          </div>
          <p class="sp-hint">Hold the vegetable/crop leaf 20–30 cm away in bright light, keep steady.</p>
        </div>
      `;
      document.body.appendChild(m);
      this.$('spClose').onclick = () => this.closeCamera();
      this.$('spSwitch').onclick = () => {
        this.facing = this.facing === 'environment' ? 'user' : 'environment';
        this.startStream();
      };
      this.$('spSnap').onclick = () => this.snap();
    }
    m.style.display = 'flex';
    this.startStream();
  },

  async startStream() {
    this.stopStream();
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: this.facing }, width: { ideal: 1280 } },
        audio: false
      });
      this.$('spVid').srcObject = this.stream;
    } catch (err) {
      this.closeCamera();
      if (window.App?.toast) App.toast('Camera not accessible. Please use "Upload from Device" instead.', 'error');
    }
  },

  stopStream() {
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
  },

  closeCamera() {
    this.stopStream();
    const m = this.$('spCamModal');
    if (m) m.style.display = 'none';
  },

  snap() {
    const v = this.$('spVid');
    if (!v.videoWidth) return;
    const c = document.createElement('canvas');
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext('2d').drawImage(v, 0, 0);
    c.toBlob(b => {
      this.closeCamera();
      if (b) this.handle(b);
    }, 'image/jpeg', 0.92);
  },

  /* ---------- Crop identification ---------- */
  cropFromText(text) {
    const t = String(text || '').toLowerCase();
    if (!t) return null;
    for (const key of Object.keys(CROP_ALIASES)) {
      for (const word of CROP_ALIASES[key]) {
        const re = new RegExp('(^|[^a-z])' + word.replace(/\s+/g, '[ _-]?') + '([^a-z]|$)');
        if (re.test(t)) return key;
      }
    }
    return null;
  },

  detectCropType(file, a) {
    const byName = this.cropFromText(file && file.name);
    if (byName) return { key: byName, how: 'filename' };

    if (a && !a.none) {
      const t = a.tone || {};
      const red = t.red || 0, orange = t.orange || 0, yellow = t.yellow || 0;

      if (a.mode === 'produce' || (a.green || 0) < 15) {
        if (red >= 0.35) return { key: 'tomato', how: 'colour' };
        if (orange >= 0.35) return { key: 'carrot', how: 'colour' };
        if (yellow >= 0.45) return { key: 'banana', how: 'colour' };
        return { key: 'potato', how: 'colour' };
      }

      if (a.green >= 50 && a.lesion < 10) return { key: 'broccoli', how: 'colour' };
      if (a.green >= 25 && a.yellow >= 20) return { key: 'rice', how: 'colour' };
    }
    return { key: 'unknown', how: 'none' };
  },

  cropNote(how) {
    return {
      ai: '🤖 Crop identified by the AI vision model.',
      filename: '📄 Crop taken from the file name. Change it if wrong.',
      colour: '🎨 Crop is only a colour-based estimate. Please confirm or change it below.',
      none: '🔍 The crop could not be identified from the photo. Choose your crop below for exact advice.',
      manual: '✋ Crop selected by you.'
    }[how] || '';
  },

  /* ---------- Image handling ---------- */
  loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('decode'));
      img.src = url;
    });
  },

  /** Shrink the photo (phone cameras give 4-12 MB) so it uploads fast on mobile data. */
  async prepareUpload(file, img) {
    try {
      const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
      const MAX = 1024, sc = Math.min(1, MAX / Math.max(iw, ih));
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(iw * sc));
      c.height = Math.max(1, Math.round(ih * sc));
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      const out = c.toDataURL('image/jpeg', 0.85);
      if (out && out.length > 200) return out;
    } catch (e) { /* fall through to raw file */ }
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
  },

  async fromBackend(file, img) {
    const base = (window.App && App.apiBase) ? App.apiBase : 'http://127.0.0.1:8000';
    try {
      const dataUrl = await this.prepareUpload(file, img);
      const r = await fetch(`${base}/api/ai/vision-analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: dataUrl }),
        signal: window.timeoutSignal ? window.timeoutSignal(75000) : undefined
      });
      if (!r.ok) {
        console.warn('[ScannerPlus] Backend AI returned HTTP', r.status);
        return null;
      }
      const j = await r.json();
      return j && (j.condition || j.crop) ? j : null;
    } catch (e) {
      console.warn('[ScannerPlus] Backend AI unavailable, using local fallback:', e);
      return null;
    }
  },

  async handle(file) {
    if (!file) return;
    const toast = (m, t) => { if (window.App?.toast) App.toast(m, t); };

    if (!/^image\//.test(file.type || 'image/jpeg')) return toast('Please choose a valid image file (JPG, PNG, WEBP).', 'error');
    if (file.size > 50 * 1024 * 1024) return toast('Image too large (max 50 MB).', 'error');

    const my = ++this.scanId;
    const url = URL.createObjectURL(file);
    let img;
    try {
      img = await this.loadImage(url);
    } catch (e) {
      URL.revokeObjectURL(url);
      return toast('Could not read this image. Please use JPG, PNG or WEBP.', 'error');
    }
    if (my !== this.scanId) { URL.revokeObjectURL(url); return; }

    const oldUrl = this.objectUrl;
    this.objectUrl = url;
    if (oldUrl) URL.revokeObjectURL(oldUrl);

    const prev = this.$('leafPreviewImg'), ph = this.$('leafPlaceholder'), vp = this.$('scannerViewport');
    if (prev) { prev.src = url; prev.style.display = 'block'; }
    if (ph) ph.style.display = 'none';
    const box = this.$('scanBoundingBox');
    if (box) box.style.display = 'none';
    document.querySelectorAll('.sample-leaf-card').forEach(c => c.classList.remove('active'));
    if (vp) vp.classList.add('scanning');
    const setTxt = (id, t) => { const el = this.$(id); if (el) el.textContent = t; };
    setTxt('diagDiseaseName', 'Scanning your photo…');
    setTxt('diagConfidence', 'Scanning…');
    toast('Scanning photo & identifying crop…', 'info');

    const t0 = performance.now();
    try {
      const analysis = this.analyse(img);
      const ai = await this.fromBackend(file, img);
      const wait = 900 - (performance.now() - t0);
      if (wait > 0) await new Promise(r => setTimeout(r, wait));
      if (my !== this.scanId) return;
      if (!ai) toast('AI server could not be reached, so this is an offline estimate. Please confirm the crop below.', 'info');

      let guess = this.detectCropType(file, analysis);
      const aiKey = ai && ai.crop ? this.cropFromText(ai.crop) : null;
      if (aiKey) guess = { key: aiKey, how: 'ai' };
      else if (ai && ai.crop) guess = { key: 'unknown', how: 'ai' };

      this.currentCropKey = guess.key;
      this.render(analysis, guess.key, { how: guess.how, ai });
    } catch (e) {
      console.error('[ScannerPlus] scan failed', e);
      if (my === this.scanId) {
        this.renderProblem('Scan failed', 'Something went wrong while analysing this photo. Please try another photo.');
        toast('Could not analyse this image. Try another photo.', 'error');
      }
    } finally {
      if (my === this.scanId && vp) vp.classList.remove('scanning');
    }
  },

  rgb2hsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    let h = 0;
    if (d) {
      if (mx === r) h = ((g - b) / d) % 6;
      else if (mx === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
      if (h < 0) h += 360;
    }
    return [h, mx ? d / mx : 0, mx];
  },

  boxOf(mask, w, h) {
    const xs = [], ys = [];
    for (let i = 0; i < mask.length; i++) if (mask[i]) { xs.push(i % w); ys.push((i / w) | 0); }
    if (xs.length < 12) return null;
    xs.sort((a, b) => a - b); ys.sort((a, b) => a - b);
    const q = (arr, p) => arr[Math.min(arr.length - 1, Math.floor(arr.length * p))];
    const x0 = q(xs, 0.04), x1 = q(xs, 0.96), y0 = q(ys, 0.04), y1 = q(ys, 0.96);
    return { x: x0 / w, y: y0 / h, w: Math.max(0.08, (x1 - x0 + 1) / w), h: Math.max(0.08, (y1 - y0 + 1) / h) };
  },

  analyse(img) {
    const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    const S = 180, sc = Math.min(1, S / Math.max(iw, ih));
    const w = Math.max(8, Math.round(iw * sc)), h = Math.max(8, Math.round(ih * sc));
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const x = c.getContext('2d', { willReadFrequently: true });
    x.drawImage(img, 0, 0, w, h);
    const px = x.getImageData(0, 0, w, h).data, N = w * h;

    const H = new Float32Array(N), Sa = new Float32Array(N), V = new Float32Array(N), gray = new Float32Array(N);
    let sumV = 0;
    for (let i = 0; i < N; i++) {
      const r = px[i * 4], g = px[i * 4 + 1], b = px[i * 4 + 2];
      gray[i] = 0.3 * r + 0.59 * g + 0.11 * b;
      const hsv = this.rgb2hsv(r, g, b);
      H[i] = hsv[0]; Sa[i] = hsv[1]; V[i] = hsv[2];
      sumV += hsv[2];
    }

    let m = 0, m2 = 0, n = 0;
    for (let yy = 1; yy < h - 1; yy++) {
      for (let xx = 1; xx < w - 1; xx++) {
        const i = yy * w + xx, l = 4 * gray[i] - gray[i - 1] - gray[i + 1] - gray[i - w] - gray[i + w];
        m += l; m2 += l * l; n++;
      }
    }
    const blur = (m2 / n - (m / n) ** 2) < 25;

    if (sumV / N < 0.12) return { none: true, blur, reason: 'dark' };

    const lmask = new Uint8Array(N);
    let green = 0, yellow = 0, lesion = 0;
    for (let i = 0; i < N; i++) {
      const hh = H[i], s = Sa[i], v = V[i];
      if (s < 0.16 || v < 0.1) continue;
      if (hh >= 70 && hh <= 170 && s >= 0.2) { green++; }
      else if (hh >= 42 && hh < 70 && s >= 0.3 && v >= 0.45) { yellow++; lmask[i] = 1; }
      else if (hh >= 8 && hh < 42 && s >= 0.25 && v < 0.7) { lesion++; lmask[i] = 1; }
      else if (v < 0.22) { lesion++; lmask[i] = 1; }
    }
    const leaf = green + yellow + lesion;
    const greenRatio = green / Math.max(1, green + yellow);
    const isTrueLeaf = (green / N >= 0.04) && (greenRatio >= 0.18) && (leaf / N >= 0.08);

    if (isTrueLeaf) {
      return {
        none: false, mode: 'leaf', blur,
        coverage: leaf / N,
        lesion: (lesion / leaf) * 100,
        yellow: (yellow / leaf) * 100,
        green: (green / leaf) * 100,
        box: this.boxOf(lmask, w, h)
      };
    }

    const sound = new Uint8Array(N);
    let soundTot = 0;
    for (let i = 0; i < N; i++) {
      const hh = H[i];
      if (Sa[i] >= 0.12 && V[i] >= 0.22 && (hh < 75 || hh >= 335)) { sound[i] = 1; soundTot++; }
    }
    if (soundTot / N < 0.05) return { none: true, blur, reason: 'noplant' };

    const R = 14;
    const dil = this.winSum(sound, w, h, R).out;
    const dmask = new Uint8Array(N);
    for (let i = 0; i < N; i++) dmask[i] = dil[i] > 0 ? 1 : 0;
    const er = this.winSum(dmask, w, h, R);
    const clo = new Uint8Array(N);
    for (let i = 0; i < N; i++) clo[i] = er.out[i] === er.area[i] ? 1 : 0;

    const outside = new Uint8Array(N), stack = [];
    const seed = i => { if (!clo[i] && !outside[i]) { outside[i] = 1; stack.push(i); } };
    for (let xx = 0; xx < w; xx++) { seed(xx); seed((h - 1) * w + xx); }
    for (let yy = 0; yy < h; yy++) { seed(yy * w); seed(yy * w + w - 1); }
    while (stack.length) {
      const i = stack.pop(), xx = i % w, yy = (i / w) | 0;
      if (xx > 0) seed(i - 1);
      if (xx < w - 1) seed(i + 1);
      if (yy > 0) seed(i - w);
      if (yy < h - 1) seed(i + w);
    }

    const cand = new Uint8Array(N);
    for (let yy = 1; yy < h - 1; yy++) {
      for (let xx = 1; xx < w - 1; xx++) {
        const i = yy * w + xx;
        const tex = Math.abs(gray[i + 1] - gray[i - 1]) + Math.abs(gray[i + w] - gray[i - w]);
        if (Sa[i] < 0.2 && V[i] >= 0.45 && tex > 14) cand[i] = 1;
      }
    }
    const dens = this.winSum(cand, w, h, 3);

    const x0 = Math.floor(w * 0.15), x1 = Math.ceil(w * 0.85), y0 = Math.floor(h * 0.15), y1 = Math.ceil(h * 0.85);
    const pmask = new Uint8Array(N);
    let cN = 0, silC = 0, rot = 0, mold = 0, soundC = 0;
    for (let yy = y0; yy < y1; yy++) {
      for (let xx = x0; xx < x1; xx++) {
        const i = yy * w + xx;
        cN++;
        if (outside[i]) continue;
        silC++;
        if (sound[i]) { soundC++; continue; }
        if (V[i] < 0.22) { rot++; pmask[i] = 1; }
        else if (cand[i] && dens.out[i] / dens.area[i] >= 0.4) { mold++; pmask[i] = 1; }
      }
    }
    if (silC / cN < 0.06) return { none: true, blur, reason: 'noplant' };

    const tone = { red: 0, orange: 0, yellow: 0, tan: 0 };
    let tn = 0;
    for (let i = 0; i < N; i++) {
      if (!sound[i] || outside[i]) continue;
      const hh = H[i], s = Sa[i], v = V[i];
      tn++;
      if ((hh < 14 || hh >= 340) && s >= 0.5) tone.red++;
      else if (hh >= 14 && hh < 34 && s >= 0.6 && v >= 0.55) tone.orange++;
      else if (hh >= 42 && hh < 70 && s >= 0.5) tone.yellow++;
      else tone.tan++;
    }
    tn = Math.max(1, tn);

    const subj = Math.max(silC, cN * 0.10);
    const rotP = Math.min(100, (rot / subj) * 100), moldP = Math.min(60, (mold / subj) * 100);
    return {
      none: false, mode: 'produce', blur,
      rot: rotP, mold: moldP, sound: Math.min(100, (soundC / subj) * 100),
      spoil: Math.min(100, rotP + moldP),
      tone: { red: tone.red / tn, orange: tone.orange / tn, yellow: tone.yellow / tn, tan: tone.tan / tn },
      box: this.boxOf(pmask, w, h)
    };
  },

  winSum(mask, w, h, r) {
    const W1 = w + 1, I = new Int32Array(W1 * (h + 1));
    for (let y = 0; y < h; y++) {
      let row = 0;
      for (let x = 0; x < w; x++) {
        row += mask[y * w + x];
        I[(y + 1) * W1 + (x + 1)] = I[y * W1 + (x + 1)] + row;
      }
    }
    const out = new Int32Array(w * h), area = new Int32Array(w * h);
    for (let y = 0; y < h; y++) {
      const ya = Math.max(0, y - r), yb = Math.min(h - 1, y + r);
      for (let x = 0; x < w; x++) {
        const xa = Math.max(0, x - r), xb = Math.min(w - 1, x + r);
        out[y * w + x] = I[(yb + 1) * W1 + (xb + 1)] - I[ya * W1 + (xb + 1)] - I[(yb + 1) * W1 + xa] + I[ya * W1 + xa];
        area[y * w + x] = (xb - xa + 1) * (yb - ya + 1);
      }
    }
    return { out, area };
  },

  /* ---------- Diagnosis ---------- */
  tipClimate(c, key) { return key === 'unknown' ? '' : c.climate.split('·')[0].trim(); },
  tipCare(c, key) { return key === 'unknown' ? '' : (c.care.split(';')[0] || ''); },

  diagnose(a, cropInfo, key) {
    const ROOT = ['potato', 'onion', 'carrot'];
    const isRootOrTuber = ROOT.includes(key);
    const hasNoGreen = (a.green || 0) < 15;

    if (a.mode === 'produce' || isRootOrTuber || hasNoGreen) {
      return this.diagnoseProduce(a, cropInfo, key);
    }
    return this.diagnoseLeaf(a, cropInfo, key);
  },

  diagnoseLeaf(a, cropInfo, key) {
    const les = a.lesion, yel = a.yellow;
    const nm = key === 'unknown' ? 'Plant' : cropInfo.name;
    const clim = this.tipClimate(cropInfo, key), care = this.tipCare(cropInfo, key);
    const sev = les >= 20 || yel >= 45 ? 'Severe' : les >= 8 || yel >= 25 ? 'Moderate' : 'Mild';
    const health = Math.max(5, Math.min(100, Math.round(100 - les * 2.4 - yel * 0.7)));
    const base = { health, sev, unit: 'Leaf Health' };

    if (les < 3 && yel < 10) {
      return {
        ...base,
        sev: 'Healthy',
        name: `Healthy ${nm}`,
        path: 'No disease signs or fungal pathogens detected',
        sym: 'Uniform healthy green pigmentation with no necrotic lesions or chlorosis. Foliage cellular turgidity is optimal.',
        organic: 'No chemical spray needed. Spray bio-stimulant (Seaweed extract 2ml/L) or vermiwash (1:10) every 15 days to maintain plant vigor.',
        chemical: 'No chemical fungicide or pesticide required. Maintain standard preventive crop monitoring.',
        prevent: `Maintain optimal soil moisture${clim ? ` (${clim})` : ''} and follow balanced NPK feeding.`,
        steps: [
          `Keep your regular watering schedule${care ? ` (${care})` : ''}.`,
          'Scan a sample leaf every 7-10 days, particularly after rainfall or irrigation cycles.',
          'Ensure field sanitation and remove weeds to prevent pest harboring.',
          'Provide balanced micronutrients (Zinc, Boron) to sustain high yield.'
        ]
      };
    }

    if (yel >= 18 && les < 8) {
      return {
        ...base,
        name: `${nm} Chlorosis (Yellowing)`,
        path: 'Nutrient Deficiency (Nitrogen / Iron) or Over-irrigation',
        sym: 'Progressive leaf yellowing while veins stay green. Caused by impaired root respiration or nitrogen deficiency.',
        organic: 'Apply well-decomposed vermicompost (2 kg/plant) or spray Jeevamrut / fermented seaweed liquid (3ml/L).',
        chemical: 'Foliar spray of 1% Urea (10g/L) for nitrogen boost, or Chelated Ferrous Sulphate (0.5%) for iron chlorosis.',
        prevent: 'Improve soil drainage, test soil N-P-K & pH, avoid continuous water stagnation.',
        steps: [
          'Check soil moisture: if waterlogged, stop irrigation and aerate root zone.',
          'Apply compost or bio-fertilizer around plant drip line.',
          'Spray 1% foliar urea or micronutrient mix in late evening.',
          'Re-scan in 7 days to monitor leaf greening recovery.'
        ]
      };
    }

    return {
      ...base,
      name: `${nm} Foliar Blight / Leaf Spot`,
      path: 'Fungal Pathogen Complex (Alternaria / Cercospora)',
      sym: 'Dark brown concentric necrotic spots with yellow halos across the leaf surface, indicating active spore germination.',
      organic: 'Remove severely spotted foliage. Spray Neem Oil (5ml/L) or Trichoderma viride bio-fungicide (5g/L) every 7 days.',
      chemical: 'Foliar spray of Mancozeb 75% WP (2.5g/L) or Azoxystrobin 23% SC (1ml/L). Follow 10-day spray intervals.',
      prevent: `Use drip irrigation, avoid wetting leaves, maintain proper crop spacing${care ? ` (${care})` : ''}.`,
      steps: [
        'Prune and safely burn infected leaves to arrest spore dissemination.',
        'Disinfect pruning tools with rubbing alcohol between plants.',
        'Apply fungicide spray in late afternoon, covering leaf undersides thoroughly.',
        'Switch to morning drip irrigation to ensure foliage stays dry at night.'
      ]
    };
  },

  diagnoseProduce(a, cropInfo, key) {
    const spoil = a.spoil || 0;
    const sev = spoil >= 15 ? 'Severe' : spoil >= 7 ? 'Moderate' : 'Mild';
    const health = Math.max(5, Math.min(100, Math.round(100 - spoil * 2.2)));
    const base = { health, sev, unit: 'Produce Health' };

    const ROOT = ['potato', 'onion', 'carrot', 'garlic', 'ginger'],
          FRUIT = ['tomato', 'apple', 'mango', 'banana', 'chilli', 'brinjal', 'capsicum', 'cucumber', 'gourd', 'bittergourd', 'papaya', 'guava', 'pomegranate', 'grapes', 'watermelon', 'orange', 'lemon', 'okra', 'peas'],
          GRAIN = ['rice', 'wheat', 'maize', 'pulse', 'mustard', 'soybean', 'millet', 'sugarcane', 'cotton'];
    const kind = ROOT.includes(key) ? 'root' : FRUIT.includes(key) ? 'fruit' : GRAIN.includes(key) ? 'grain' : 'veg';
    const part = { potato: 'Tuber', onion: 'Bulb', garlic: 'Bulb', ginger: 'Rhizome', carrot: 'Root' }[key] || (kind === 'fruit' ? 'Fruit' : kind === 'grain' ? 'Grain / Pod' : 'Vegetable');
    const nm = key === 'unknown' ? 'Produce' : cropInfo.name;
    const label = ((a.mold || 0) >= 3 && (a.rot || 0) >= 5) ? 'Rot with Mould Growth' : (a.mold || 0) >= 3 ? 'Mould / Fungal Growth' : 'Soft Rot / Dark Decay';
    const full = `${nm} ${part ? part + ' ' : ''}${label}`;
    const what = part ? part.toLowerCase() : 'produce';

    if (spoil < 3.5) {
      return {
        ...base, sev: 'Healthy',
        name: `Fresh ${nm}`,
        path: 'No rot, mould or dark decay detected',
        sym: 'Colour looks even and sound. No dark soft patches or grey-white mould detected on the visible surface.',
        organic: 'No treatment needed. Store dry, cool and well ventilated; avoid bruising and moisture on the surface.',
        chemical: 'No chemical treatment required.',
        prevent: 'Handle gently, keep stock dry, and sort out any soft or damaged pieces early.',
        steps: [
          'Keep stored produce in a dark, cool, well-ventilated place.',
          'Check the stock every 5-7 days and remove any soft or damaged piece.',
          'Do not store wet produce; surface-dry it in shade first.',
          'Scan again if you notice dark patches, white fuzz or a sour smell.'
        ]
      };
    }

    const sym = `About ${(a.rot || 0).toFixed(0)}% of the visible surface is dark, decayed tissue and ${(a.mold || 0).toFixed(0)}% has grey-white mould patches. Affected ${what} usually looks soft, sunken, shrivelled or fuzzy.`;
    const unsafe = sev === 'Severe' ? 'Do NOT eat, feed or sell visibly rotten or mouldy produce. ' : '';

    if (kind === 'root') {
      if (key === 'potato') {
        return {
          ...base,
          name: 'Potato Tuber Internal Brown Spot / Necrosis (आलू कंद में अंदरूनी धब्बे)',
          path: 'Physiological Disorder (Calcium & Moisture Stress / High Soil Heat) or Tuber Rot Complex (Fusarium / Alternaria / Late Blight)',
          sym: 'Internal rust-brown to dark necrotic spots, rings, or flecks scattered inside the potato tuber flesh (Internal Brown Spot / Heat Necrosis). Common in potatoes exposed to high soil heat (>28°C) or uneven irrigation during tuber bulking.',
          organic: `${unsafe}Discard tubers with extensive internal dark spots (unfit for seed, table use or processing). For future crops: maintain consistent drip irrigation during tuber bulking, apply straw mulching to keep soil temperature cool, and enrich soil with Gypsum (Calcium).`,
          chemical: 'Foliar or soil application of Calcium Nitrate (15–20 kg/acre) during earthing-up. Treat seed tubers with Mancozeb (2.5 g/L) + Trichoderma viride (5 g/L) before planting or storage.',
          prevent: 'Ensure uniform moisture during tuber initiation; avoid harvesting in hot midday sun; cure tubers at 12–15°C for 10–14 days before cool storage.',
          steps: [
            'Separate and discard tubers showing severe internal dark brown discoloration.',
            'Mildly affected potatoes can have the spots trimmed off for immediate domestic cooking.',
            'Store remaining stock in a dark, well-aerated place at 8–10°C with 85–90% humidity.',
            'In the field, maintain regular watering so soil does not overheat and stress developing tubers.'
          ]
        };
      }

      return {
        ...base, name: full,
        path: 'Storage / tuber rot complex (Fusarium dry rot, Pectobacterium soft rot, late-blight rot, Penicillium or Botrytis mould)',
        sym,
        organic: `${unsafe}Remove every soft, dark or mouldy ${what} now. Dry the healthy ones in shade for 10-14 days, dust lightly with wood ash or dry neem-leaf powder, and keep them dark, cool and airy.`,
        chemical: `For seed ${what}s before storage or sowing: dip for 10 minutes in Mancozeb 75% WP (2.5 g/L) + Carbendazim 50% WP (1 g/L), then shade-dry. If late blight is active in the field, spray Metalaxyl + Mancozeb (2 g/L). Always follow the product label.`,
        prevent: 'Harvest at full maturity on dry days, avoid cuts and bruises, cure properly, store at 85-90% humidity with good airflow, and inspect weekly.',
        steps: [
          `Throw away (bury deep or burn) every soft, dark, sunken or mouldy ${what}. One rotten piece spreads rot to the whole pile.`,
          'Wear gloves. Separate the sound-looking pieces, wash your hands, and disinfect crates, floor and tools (1% bleach or lime wash).',
          'Surface-dry the remaining stock in shade for 10-14 days, then store in a dark, cool, well-ventilated place (potato: 4-10 °C).',
          'Check every 5-7 days and remove new soft or mouldy pieces immediately.',
          'If the rot started in the field, scout the standing crop for late blight and use the Chemical Treatment tab.'
        ]
      };
    }

    if (kind === 'fruit') {
      return {
        ...base, name: full,
        path: 'Post-harvest fruit rot (Botrytis, Penicillium, Colletotrichum, Alternaria) or bacterial soft rot',
        sym,
        organic: `${unsafe}Pick off and destroy rotten fruit. Spray Neem Oil (5 ml/L) or Trichoderma viride (5 g/L) on the remaining fruit and plants.`,
        chemical: 'Spray Copper Oxychloride 50% WP (3 g/L) or Carbendazim 50% WP (1 g/L). Respect the pre-harvest interval on the label.',
        prevent: 'Avoid fruit injuries, keep fruit off wet soil, use drip irrigation, give proper spacing, and harvest on dry days.',
        steps: [
          'Remove and destroy all rotten or mouldy fruit (bury deep or burn, not compost).',
          'Wash hands and sanitise knives, crates and baskets.',
          'Spray the neem or fungicide option from the tabs, covering fruit and foliage.',
          'Harvest in dry weather, sort out damaged fruit, and store in cool, ventilated crates.'
        ]
      };
    }

    if (kind === 'grain') {
      return {
        ...base, name: full,
        path: 'Storage fungi (Aspergillus / Penicillium). Mould can produce toxins such as aflatoxin',
        sym,
        organic: `${unsafe}Separate mouldy grain from clean grain. Re-dry clean grain in the sun to 12% moisture or less and store with dry neem leaves in airtight bins.`,
        chemical: 'There is no chemical cure for mouldy grain. Discard it. For clean stock use only label-approved storage protectants, and have fumigation done by a trained person.',
        prevent: 'Dry grain below 12% moisture before storage, keep bins clean and dry, raise bags off the floor, and check for damp patches after rain.',
        steps: [
          'Separate mouldy or damp grain right away. Do not mix it with clean stock.',
          'Do not use mouldy grain as food or feed. Discard it safely.',
          'Sun-dry the clean grain to 12% moisture or less and clean the storage bins.',
          'Store in airtight, dry containers and check every week.'
        ]
      };
    }

    return {
      ...base, name: full,
      path: 'Bacterial soft rot (Pectobacterium) or fungal rot / mould',
      sym,
      organic: `${unsafe}Remove and destroy rotten pieces. Spray Neem Oil (5 ml/L) or Trichoderma viride (5 g/L) on the remaining crop.`,
      chemical: 'Copper Oxychloride 50% WP (3 g/L) for fungal rot. Bacterial soft rot has no cure once started, so prevention and removal matter most. Follow the label.',
      prevent: 'Avoid water standing on the produce, handle without bruising, keep storage cool and ventilated, and remove rotting pieces early.',
      steps: [
        'Remove and destroy rotten pieces (bury deep or burn).',
        'Wash hands and sanitise tools and crates.',
        'Keep the remaining produce dry, cool and well ventilated.',
        'Inspect every few days and remove any new soft or mouldy piece.'
      ]
    };
  },

  mergeAi(local, ai) {
    const map = { none: 'Healthy', healthy: 'Healthy', low: 'Mild', mild: 'Mild', moderate: 'Moderate', severe: 'Severe', critical: 'Severe', high: 'Severe' };
    const sev = map[String(ai.severity || '').toLowerCase()] || local.sev;
    const steps = [ai.organic, ai.chemical, ai.preventive].filter(Boolean);
    return {
      ...local, sev,
      name: ai.condition || local.name,
      path: ai.cause || ai.category || local.path,
      sym: ai.symptoms || local.sym,
      organic: ai.organic || local.organic,
      chemical: ai.chemical || local.chemical,
      prevent: ai.preventive || local.prevent,
      steps: steps.length ? steps : local.steps,
      fromAi: true
    };
  },

  /* ---------- Rendering ---------- */
  renderCropInfo(cropKey, note) {
    const banner = this.$('spCropBanner');
    if (!banner) return;

    const crop = CROP_CATALOG[cropKey] || CROP_CATALOG.unknown;
    const e = s => this.esc(s);

    const optionsHtml = `<option value="unknown" ${cropKey === 'unknown' ? 'selected' : ''}>🔍 Not sure / select crop</option>` +
      Object.keys(CROP_CATALOG).filter(k => k !== 'unknown' && k !== '_ai_dynamic').map(k => {
        const c = CROP_CATALOG[k];
        return `<option value="${k}" ${k === cropKey ? 'selected' : ''}>${c.icon} ${c.name} (${c.category})</option>`;
      }).join('');

    banner.innerHTML = `
      <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:12px; padding:1rem; margin-bottom:1rem; box-shadow:0 4px 14px rgba(0,0,0,0.15);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; flex-wrap:wrap; border-bottom:1px solid var(--border-color); padding-bottom:0.75rem; margin-bottom:0.75rem;">
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <div style="font-size:2.4rem; line-height:1; padding:0.4rem; background:rgba(16,185,129,0.1); border-radius:10px;">${crop.icon}</div>
            <div>
              <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                <h3 style="margin:0; font-size:1.25rem; font-weight:800; color:var(--text-primary);">${e(crop.name)}</h3>
                <span class="badge-ai" style="background:${crop.badgeColor}22; color:${crop.badgeColor}; border:1px solid ${crop.badgeColor}55; font-size:0.75rem; font-weight:700;">
                  ${crop.categoryBadge}
                </span>
              </div>
              <div style="font-size:0.76rem; color:var(--text-muted); margin-top:0.2rem;">
                Botanical: <i style="color:var(--text-secondary);">${crop.botanical}</i> · Family: <b>${crop.family}</b>
              </div>
            </div>
          </div>

          <div style="text-align:right;">
            <label style="font-size:0.72rem; color:var(--text-muted); display:block; margin-bottom:0.2rem;">Different crop? Change here:</label>
            <select id="spCropSelect" class="form-control" style="font-size:0.8rem; padding:0.25rem 0.5rem; height:auto; max-width:210px; cursor:pointer;">
              ${optionsHtml}
            </select>
          </div>
        </div>
        ${note ? `<div style="font-size:0.74rem; color:var(--text-secondary); margin:-0.2rem 0 0.7rem;">${note}</div>` : ''}

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(210px, 1fr)); gap:0.6rem; font-size:0.78rem;">
          <div style="background:var(--bg-card); padding:0.6rem 0.75rem; border-radius:8px; border:1px solid var(--border-color);">
            <div style="color:var(--primary); font-weight:700; margin-bottom:0.15rem;">🌱 Botanical Type & Nature</div>
            <div style="color:var(--text-secondary); line-height:1.35;">${crop.nature}</div>
          </div>
          <div style="background:var(--bg-card); padding:0.6rem 0.75rem; border-radius:8px; border:1px solid var(--border-color);">
            <div style="color:#f59e0b; font-weight:700; margin-bottom:0.15rem;">🍎 Nutritional / Commercial Value</div>
            <div style="color:var(--text-secondary); line-height:1.35;">${crop.nutrition}</div>
          </div>
          <div style="background:var(--bg-card); padding:0.6rem 0.75rem; border-radius:8px; border:1px solid var(--border-color);">
            <div style="color:#3b82f6; font-weight:700; margin-bottom:0.15rem;">⛅ Climate & Soil Requirements</div>
            <div style="color:var(--text-secondary); line-height:1.35;">${crop.climate}</div>
          </div>
          <div style="background:var(--bg-card); padding:0.6rem 0.75rem; border-radius:8px; border:1px solid var(--border-color);">
            <div style="color:#10b981; font-weight:700; margin-bottom:0.15rem;">💧 Best Cultivation Practices</div>
            <div style="color:var(--text-secondary); line-height:1.35;">${crop.care}</div>
          </div>
        </div>
      </div>
    `;

    const sel = this.$('spCropSelect');
    if (sel) {
      sel.onchange = ev => {
        const newKey = ev.target.value;
        this.currentCropKey = newKey;
        if (this.lastAnalysis) {
          this.render(this.lastAnalysis, newKey, { how: 'manual' });
        } else {
          this.renderCropInfo(newKey, '');
          if (window.App?.toast) App.toast('Upload or take a photo to get a diagnosis for this crop.', 'info');
        }
      };
    }
  },

  placeBox(a, col) {
    const box = this.$('scanBoundingBox'), img = this.$('leafPreviewImg'), vp = this.$('scannerViewport');
    if (!box || !img || !vp) return;
    if (!a || a.none || !a.box || img.style.display === 'none') { box.style.display = 'none'; return; }
    const ir = img.getBoundingClientRect(), vr = vp.getBoundingClientRect();
    if (!ir.width || !ir.height) { box.style.display = 'none'; return; }
    box.style.display = 'block';
    box.style.left = (ir.left - vr.left + a.box.x * ir.width) + 'px';
    box.style.top = (ir.top - vr.top + a.box.y * ir.height) + 'px';
    box.style.width = Math.min(a.box.w, 1 - a.box.x) * ir.width + 'px';
    box.style.height = Math.min(a.box.h, 1 - a.box.y) * ir.height + 'px';
    box.style.borderColor = col || '#34d399';
    box.style.background = (col || '#34d399') + '14';
  },

  getPlanEl() {
    let plan = this.$('spPlan');
    if (!plan) {
      plan = document.createElement('div');
      plan.id = 'spPlan';
      const anchor = this.$('diagPreventive');
      if (anchor && anchor.parentElement) anchor.parentElement.after(plan);
    }
    if (plan) plan.style.display = 'block';
    return plan;
  },

  renderProblem(title, text, steps) {
    const set = (id, t) => { const el = this.$(id); if (el) el.textContent = t; };
    set('diagDiseaseName', title);
    set('diagPathogen', '—');
    set('diagSymptoms', text);
    set('diagOrganic', 'Retake the photo (see tips below) to get a diagnosis.');
    set('diagChemical', 'No treatment can be suggested without a clear photo.');
    set('diagPreventive', 'Use daylight, keep the camera steady 20-30 cm away, and fill the frame with the affected leaf, fruit or tuber.');
    set('diagConfidence', 'Retake Photo');
    const sv = this.$('diagSeverity');
    if (sv) { sv.textContent = 'Unclear'; sv.style.color = '#94a3b8'; sv.style.background = 'rgba(148,163,184,0.15)'; }
    this.placeBox(null);
    const plan = this.getPlanEl();
    if (plan) {
      plan.innerHTML = this.planHtml('📷 How to get a good scan', steps || [
        'Take the photo in bright daylight (no heavy shadow).',
        'Fill the frame with the leaf, fruit or tuber. Keep the affected part in the centre.',
        'Hold steady 20-30 cm away so the photo is sharp.',
        'Use a plain, light background if you can.'
      ], 'bad');
    }
  },

  render(a, cropKey, meta = {}) {
    this.lastAnalysis = a;
    const key = cropKey || this.currentCropKey || 'unknown';
    this.currentCropKey = key;

    if (meta.ai && meta.ai.is_plant_or_food === false) {
      this.renderCropInfo('unknown', '⚠️ No crop, fruit, or vegetable found in this photo.');
      this.renderProblem(
        'Not a crop or produce',
        'This image does not appear to be a crop, fruit, vegetable, or plant leaf. Please upload a clear plant or produce photo.'
      );
      return;
    }

    let cropInfo = { ...(CROP_CATALOG[key] || CROP_CATALOG.unknown) };

    if (meta.ai) {
      if (meta.ai.crop) cropInfo.name = String(meta.ai.crop);
      if (key === 'unknown' || !CROP_CATALOG[key]) {
        cropInfo.icon = meta.ai.icon || '🌱';
        cropInfo.category = meta.ai.category || 'Crop / Produce';
        cropInfo.categoryBadge = meta.ai.categoryBadge || `🌱 ${cropInfo.category}`;
        cropInfo.badgeColor = meta.ai.badgeColor || '#10b981';
        cropInfo.family = meta.ai.family || cropInfo.family;
        cropInfo.botanical = meta.ai.botanical || cropInfo.botanical;
        cropInfo.nature = meta.ai.nature || cropInfo.nature;
        cropInfo.nutrition = meta.ai.nutrition || cropInfo.nutrition;
        cropInfo.climate = meta.ai.climate || cropInfo.climate;
        cropInfo.care = meta.ai.care || cropInfo.care;
      }
    }

    const activeKey = (key === 'unknown' && meta.ai && meta.ai.crop) ? '_ai_dynamic' : key;
    if (activeKey === '_ai_dynamic') {
      CROP_CATALOG._ai_dynamic = cropInfo;
    }

    this.renderCropInfo(activeKey, this.cropNote(meta.how));

    const set = (id, t) => { const el = this.$(id); if (el) el.textContent = t; };
    const cropLine = `${cropInfo.icon} ${cropInfo.name} · [${cropInfo.categoryBadge}]`;
    set('diagCropName', cropLine);

    if (a.none && !meta.ai) {
      const dark = a.reason === 'dark';
      this.renderProblem(
        dark ? 'Photo is too dark' : 'No crop detected in this photo',
        dark ? 'The photo is too dark to analyse.' : 'Could not find enough leaf, fruit or tuber area. The photo may show mostly background.'
      );
      if (window.App?.toast) App.toast('Could not detect a crop in this photo. Please retake it.', 'error');
      return;
    }

    let d = this.diagnose(a, cropInfo, activeKey);
    if (meta.ai) d = this.mergeAi(d, meta.ai);
    const col = { Healthy: '#10b981', Mild: '#10b981', Moderate: '#f59e0b', Severe: '#ef4444' }[d.sev] || '#10b981';

    set('diagDiseaseName', d.name);
    set('diagPathogen', d.path);
    set('diagSymptoms', d.sym);
    set('diagOrganic', d.organic);
    set('diagChemical', d.chemical);
    set('diagPreventive', d.prevent);
    const conf = meta.ai && meta.ai.confidence !== undefined && meta.ai.confidence !== '' ? `${meta.ai.confidence}% Confidence` : (meta.ai ? 'AI Diagnosis' : `${d.unit}: ${d.health}%`);
    set('diagConfidence', conf);

    const sv = this.$('diagSeverity');
    if (sv) {
      sv.textContent = d.sev;
      sv.style.color = col;
      sv.style.background = col + '22';
    }

    this.lastColor = col;
    this.placeBox(d.sev === 'Healthy' ? null : a, col);

    const plan = this.getPlanEl();
    if (plan) {
      const warn = a.blur ? '<p class="sp-warn">⚠️ Photo is slightly blurry; for precision results, hold camera steady in daylight.</p>' : '';
      const metrics = a.none
        ? `AI Vision Confidence: <b>${meta.ai?.confidence || 95}%</b> · Full botanical & disease scan completed`
        : a.mode === 'produce'
          ? `Health score: <b>${d.health}%</b> · Dark decay ${(a.rot || 0).toFixed(0)}% · Mould patches ${(a.mold || 0).toFixed(0)}% · Sound surface ${(a.sound || 0).toFixed(0)}%`
          : `Foliage health score: <b>${d.health}%</b> · Green tissue ${(a.green || 0).toFixed(0)}% · Yellowing ${(a.yellow || 0).toFixed(0)}% · Necrotic lesions ${(a.lesion || 0).toFixed(0)}%`;
      const how = d.fromAi ? 'Gemini Vision AI model' : 'on-device colour & texture analysis';
      const safety = a.mode === 'produce' ? ' Do not eat or sell visibly rotten or mouldy produce.' : '';
      plan.innerHTML = `
        <div class="sp-health" style="margin-top:0.75rem;">
          <div class="sp-bar"><i style="width:${d.health}%;background:${col}"></i></div>
          <small>${metrics}</small>
        </div>
        ${warn}
        ${this.planHtml(d.sev === 'Healthy' ? '✅ Agronomic Best Practices' : (a.mode === 'produce' ? '🩺 Immediate Action Plan' : '🩺 Step-by-Step Remediation Plan'), d.steps.map(s => this.esc(s)), d.sev === 'Healthy' ? 'good' : 'bad')}
        <p class="sp-note">ℹ️ Result from ${how}, not a lab test.${safety} Consult your local Krishi Vigyan Kendra for confirmation.</p>
      `;
    }

    if (window.App?.toast) {
      App.toast(d.sev === 'Healthy' ? `${cropInfo.icon} ${cropInfo.name} looks healthy!` : `${d.name} (${d.sev}) diagnosed.`, d.sev === 'Healthy' ? 'success' : 'info');
    }
  },

  planHtml(title, steps, tone) {
    return `<div class="sp-plan ${tone}"><h4>${title}</h4><ol>${steps.map(s => `<li>${s}</li>`).join('')}</ol></div>`;
  }
};

window.ScannerPlus = ScannerPlus;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ScannerPlus.init());
} else {
  ScannerPlus.init();
}
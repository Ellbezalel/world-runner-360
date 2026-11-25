// ==========================================
// DATA CONFIG: FICTIONAL CITIES, SHOP & MISSIONS
// ==========================================

const CITIES = Array.of(
  { id: 'savanna_gate', name: 'Savanna Gate (Starter)', cost: 0, sky: 0xfdba74, ground: 0xd97706, road: 0x78350f, building: 0xfef3c7, weather: 'none', desc: 'Sunlit clay markets, wooden carts & dusty paths', reward: 'Nomad Tunic' },
  { id: 'eko_harbor', name: 'Eko Harbor', cost: 1200, sky: 0x475569, ground: 0x1e293b, road: 0x0f172a, building: 0xfacc15, weather: 'rain', desc: 'Rain-soaked bridges, yellow transit vans & street stalls', reward: 'Storm Shield' },
  { id: 'zuma_citadel', name: 'Zuma Citadel', cost: 3000, sky: 0x38bdf8, ground: 0x15803d, road: 0x1e293b, building: 0xf8fafc, weather: 'none', desc: 'Grand boulevards, stone arches & checkpoint gates', reward: 'Citadel Guard' },
  { id: 'dune_oasis', name: 'Dune Oasis', cost: 5500, sky: 0xf59e0b, ground: 0xb45309, road: 0x92400e, building: 0xfde68a, weather: 'sand', desc: 'Ancient sandstone walls, spice carts & desert winds', reward: 'Spice Rush' },
  { id: 'mirage_spire', name: 'Mirage Spire', cost: 9000, sky: 0xfde047, ground: 0xeab308, road: 0x334155, building: 0x38bdf8, weather: 'sand', desc: 'Golden glass towers, hypercars & sweeping sandstorms', reward: 'Solar Cloak' },
  { id: 'ironbridge', name: 'Ironbridge Fog', cost: 14000, sky: 0x64748b, ground: 0x334155, road: 0x1e293b, building: 0x991b1b, weather: 'rain', desc: 'Crimson double-deckers, misty clocktowers & drizzle', reward: 'Crown Crest' },
  { id: 'metro_central', name: 'Metro Central', cost: 20000, sky: 0x0284c7, ground: 0x334155, road: 0x0f172a, building: 0x94a3b8, weather: 'none', desc: 'Skyscraper canyons, yellow cabs & steam vents', reward: 'Metro King' },
  { id: 'lumiere_plaza', name: 'Lumière Plaza', cost: 28000, sky: 0xf472b6, ground: 0x475569, road: 0x1e293b, building: 0xfef9c3, weather: 'none', desc: 'Cobblestone boulevards, café patios & sleek scooters', reward: 'Velvet Coat' },
  { id: 'neo_shibuya', name: 'Neo Circuit', cost: 38000, sky: 0x090d16, ground: 0x1e1b4b, road: 0x0f172a, building: 0xec4899, weather: 'neon', desc: 'Hologram avenues, maglev trains & cyber drones', reward: 'Cyber Suit' }
);

const SHOP_ITEMS = {
  outfits: Array.of(
    { id: 'white_agbada', name: 'Classic White Tunic', cost: 0, currency: 'coins', color: 0xffffff, accent: 0x38bdf8 },
    { id: 'senator', name: 'Cobalt Commander', cost: 800, currency: 'coins', color: 0x1e3a8a, accent: 0xfacc15 },
    { id: 'kaftan', name: 'Emerald Nomad', cost: 1800, currency: 'coins', color: 0x059669, accent: 0xffffff },
    { id: 'gold_agbada', name: 'Sovereign Gold Robe', cost: 4000, currency: 'coins', color: 0xfacc15, accent: 0xb45309 },
    { id: 'dubai_prince', name: 'Mirage Royal', cost: 25, currency: 'naira', color: 0xf8fafc, accent: 0xef4444 },
    { id: 'london_gent', name: 'Ironbridge Baron', cost: 40, currency: 'naira', color: 0x334155, accent: 0xdc2626 },
    { id: 'paris_model', name: 'Lumière Trendsetter', cost: 60, currency: 'naira', color: 0xec4899, accent: 0xfef08a },
    { id: 'tokyo_cyber', name: 'Neo Cyber Armor', cost: 85, currency: 'naira', color: 0x06b6d4, accent: 0xa855f7 }
  ),
  shoes: Array.of(
    { id: 'sneakers', name: 'Street Runners', cost: 0, currency: 'coins', color: 0xef4444 },
    { id: 'boots', name: 'Dune Striders', cost: 750, currency: 'coins', color: 0x92400e },
    { id: 'luxury', name: 'Volt Hyper-Kicks', cost: 20, currency: 'naira', color: 0xfacc15 }
  ),
  trails: Array.of(
    { id: 'none', name: 'No Trail', cost: 0, currency: 'coins', color: null },
    { id: 'fire', name: 'Ember Trail', cost: 1200, currency: 'coins', color: 0xf97316 },
    { id: 'lightning', name: 'Volt Spark Trail', cost: 2500, currency: 'coins', color: 0x38bdf8 },
    { id: 'naira', name: 'Emerald Note Trail', cost: 25, currency: 'naira', color: 0x10b981 },
    { id: 'gold', name: 'Gold Dust Trail', cost: 45, currency: 'naira', color: 0xfacc15 }
  )
};

const MISSION_TEMPLATES = Array.of(
  { id: 'dist_360', title: 'Run 500 meters in one run', target: 500, rewardCoins: 120, rewardNaira: 1 },
  { id: 'coins_50', title: 'Collect 100 Coins total', target: 100, rewardCoins: 150, rewardNaira: 1 },
  { id: 'jumps_20', title: 'Jump 30 times', target: 30, rewardCoins: 100, rewardNaira: 1 },
  { id: 'spin_3', title: 'Use 360 Spin 5 times', target: 5, rewardCoins: 200, rewardNaira: 2 }
);

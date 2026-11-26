// ==========================================
// DATA CONFIG: NEON INDUSTRIAL TRACKS & BIKES
// ==========================================

const CITIES = Array.of(
  { id: 'savanna_gate', name: 'Rustworks Yard (Track 1)', raceDist: 750, cost: 0, sky: 0x1e293b, ground: 0x334155, road: 0x0f172a, building: 0x475569, neon: 0xfacc15, weather: 'none', desc: 'Steel scrapyards, hazard ramps & 750m sprint', reward: 'Street BMX' },
  { id: 'eko_harbor', name: 'Neon Dockyard (Track 2)', raceDist: 950, cost: 1200, sky: 0x0f172a, ground: 0x1e293b, road: 0x090d16, building: 0x334155, neon: 0x38bdf8, weather: 'rain', desc: 'Rain-slicked cargo piers, boost pads & 950m circuit', reward: 'Storm Frame' },
  { id: 'zuma_citadel', name: 'Skyrail Viaduct (Track 3)', raceDist: 1150, cost: 3000, sky: 0x1e1b4b, ground: 0x312e81, road: 0x0f172a, building: 0x4338ca, neon: 0xf43f5e, weather: 'none', desc: 'Elevated steel tracks, hover drones & 1,150m race', reward: 'Viaduct Moto' },
  { id: 'dune_oasis', name: 'Foundry Sector 7 (Track 4)', raceDist: 1350, cost: 5500, sky: 0x78350f, ground: 0xb45309, road: 0x451a03, building: 0xd97706, neon: 0xfde047, weather: 'sand', desc: 'Molten smelter bridges, sparks & 1,350m endurance', reward: 'Smelter Scrambler' },
  { id: 'mirage_spire', name: 'Volt Spire Highway (Track 5)', raceDist: 1600, cost: 9000, sky: 0x3b0764, ground: 0x581c87, road: 0x0f172a, building: 0x6b21a8, neon: 0x38bdf8, weather: 'sand', desc: 'High-voltage towers, turbo strips & 1,600m clash', reward: 'Volt Turbo' },
  { id: 'ironbridge', name: 'Ironclad Overpass (Track 6)', raceDist: 1850, cost: 14000, sky: 0x334155, ground: 0x1e293b, road: 0x090d16, building: 0x475569, neon: 0xef4444, weather: 'rain', desc: 'Heavy steel gantries, spike traps & 1,850m gauntlet', reward: 'Ironclad Chopper' },
  { id: 'metro_central', name: 'Gridline Expressway (Track 7)', raceDist: 2100, cost: 20000, sky: 0x0c4a6e, ground: 0x1e293b, road: 0x0f172a, building: 0x0369a1, neon: 0xfacc15, weather: 'none', desc: 'Downtown neon tunnels & 2,100m championship', reward: 'Gridline GP' },
  { id: 'lumiere_plaza', name: 'Chrome Arcade (Track 8)', raceDist: 2400, cost: 28000, sky: 0x4c0519, ground: 0x334155, road: 0x0f172a, building: 0x881337, neon: 0xf472b6, weather: 'none', desc: 'Hologram billboards & 2,400m pro tour', reward: 'Chrome Jet' },
  { id: 'neo_shibuya', name: 'Apex Cyber-Core (Track 9)', raceDist: 2800, cost: 38000, sky: 0x090d16, ground: 0x1e1b4b, road: 0x020617, building: 0x312e81, neon: 0xec4899, weather: 'neon', desc: 'Megacity reactor loop & 2,800m final boss race', reward: 'Apex Hyperbike' }
);

const SHOP_ITEMS = {
  outfits: Array.of(
    { id: 'white_agbada', name: 'Crimson Street BMX', cost: 0, currency: 'coins', color: 0xef4444, accent: 0xfacc15 },
    { id: 'senator', name: 'Cobalt Volt Racer', cost: 800, currency: 'coins', color: 0x2563eb, accent: 0x38bdf8 },
    { id: 'kaftan', name: 'Emerald Trail Moto', cost: 1800, currency: 'coins', color: 0x10b981, accent: 0xfef08a },
    { id: 'gold_agbada', name: 'Sovereign Gold BMX', cost: 4000, currency: 'coins', color: 0xfacc15, accent: 0xffffff },
    { id: 'dubai_prince', name: 'Phantom Carbon Bike', cost: 25, currency: 'naira', color: 0x334155, accent: 0xef4444 },
    { id: 'london_gent', name: 'Crimson Super-Moto', cost: 40, currency: 'naira', color: 0xdc2626, accent: 0x38bdf8 },
    { id: 'paris_model', name: 'Neon Pulse Interceptor', cost: 60, currency: 'naira', color: 0xec4899, accent: 0xfacc15 },
    { id: 'tokyo_cyber', name: 'Cyber-Jet Hyperbike', cost: 85, currency: 'naira', color: 0x06b6d4, accent: 0xa855f7 }
  ),
  shoes: Array.of(
    { id: 'sneakers', name: 'Street Grip Tires', cost: 0, currency: 'coins', color: 0x38bdf8 },
    { id: 'boots', name: 'Off-Road Knobby Rims', cost: 750, currency: 'coins', color: 0xf97316 },
    { id: 'luxury', name: 'Gold Alloy Turbo Rims', cost: 20, currency: 'naira', color: 0xfacc15 }
  ),
  trails: Array.of(
    { id: 'none', name: 'Standard Exhaust', cost: 0, currency: 'coins', color: null },
    { id: 'fire', name: 'Blaze Exhaust Trail', cost: 1200, currency: 'coins', color: 0xf97316 },
    { id: 'lightning', name: 'Ion Blue Jet Trail', cost: 2500, currency: 'coins', color: 0x38bdf8 },
    { id: 'naira', name: 'Emerald Nitro Trail', cost: 25, currency: 'naira', color: 0x10b981 },
    { id: 'gold', name: 'Golden Spark Trail', cost: 45, currency: 'naira', color: 0xfacc15 }
  )
};

const MISSION_TEMPLATES = Array.of(
  { id: 'dist_360', title: 'Race 750 meters in one run', target: 750, rewardCoins: 120, rewardNaira: 1 },
  { id: 'coins_50', title: 'Collect 100 Coins total', target: 100, rewardCoins: 150, rewardNaira: 1 },
  { id: 'jumps_20', title: 'Hit 30 Jumps / Ramps', target: 30, rewardCoins: 100, rewardNaira: 1 },
  { id: 'spin_3', title: 'Do 5 Mid-Air 360 Bike Flips', target: 5, rewardCoins: 200, rewardNaira: 2 }
);

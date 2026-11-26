const STORAGE_KEY = 'world_runner_360_save_v1';
const defaultSave = {
  coins: 50, naira: 2, highScore: 0,
  selectedCity: 'savanna_gate', unlockedCities: ['savanna_gate'],
  equippedOutfit: 'white_agbada', ownedOutfits: ['white_agbada'],
  equippedShoes: 'sneakers', ownedShoes: ['sneakers'],
  equippedTrail: 'none', ownedTrails: ['none'],
  missions: { dist_360: 0, coins_50: 0, jumps_20: 0, spin_3: 0 },
  claimedMissions: []
};
let saveData = Object.assign({}, defaultSave, JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'));
function persistSave() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
  if (typeof updateMenuUI === 'function') updateMenuUI();
}
function trackMission(id, amount, isMax) {
  if (!saveData.missions) saveData.missions = {};
  if (isMax) {
    if (amount > (saveData.missions[id] || 0)) saveData.missions[id] = amount;
  } else {
    saveData.missions[id] = (saveData.missions[id] || 0) + amount;
  }
}

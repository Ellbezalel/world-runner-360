// ==========================================
// STORAGE: LOCAL SAVE & MISSION TRACKING
// ==========================================

const defaultSave = {
  coins: 50,
  naira: 2,
  selectedCity: 'savanna_gate',
  unlockedCities: Array.of('savanna_gate'),
  ownedOutfits: Array.of('white_agbada'),
  equippedOutfit: 'white_agbada',
  ownedShoes: Array.of('sneakers'),
  equippedShoes: 'sneakers',
  ownedTrails: Array.of('none'),
  equippedTrail: 'none',
  highScore: 0,
  missions: { dist_360: 0, coins_50: 0, jumps_20: 0, spin_3: 0 },
  claimedMissions: Array.of()
};

let saveData = JSON.parse(localStorage.getItem('worldRunner360SaveV2')) || defaultSave;

function persistSave() {
  localStorage.setItem('worldRunner360SaveV2', JSON.stringify(saveData));
  if (typeof updateMenuUI === 'function') {
    updateMenuUI();
  }
}

function trackMission(id, amount, isBest) {
  if (saveData.claimedMissions.includes(id)) return;
  if (isBest) {
    saveData.missions[id] = Math.max(saveData.missions[id] || 0, amount);
  } else {
    saveData.missions[id] = (saveData.missions[id] || 0) + amount;
  }
}

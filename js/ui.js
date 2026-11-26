// ==========================================
// UI: MENUS, BIKE GARAGE, TRACKS & RANKS
// ==========================================

function createListCard(title, subtitle1, subtitle2, btnText, btnClass, onClickFn) {
  const div = document.createElement('div');
  div.className = 'list-item';

  const infoDiv = document.createElement('div');
  const h4 = document.createElement('h4');
  h4.textContent = title;
  infoDiv.appendChild(h4);

  if (subtitle1) {
    const p1 = document.createElement('p');
    p1.textContent = subtitle1;
    infoDiv.appendChild(p1);
  }
  if (subtitle2) {
    const p2 = document.createElement('p');
    p2.textContent = subtitle2;
    infoDiv.appendChild(p2);
  }

  const btn = document.createElement('button');
  btn.className = btnClass;
  btn.textContent = btnText;
  if (onClickFn) {
    btn.onclick = onClickFn;
  }

  div.appendChild(infoDiv);
  div.appendChild(btn);
  return div;
}

function updateMenuUI() {
  const coinsEl = document.getElementById('menu-coins');
  const nairaEl = document.getElementById('menu-naira');
  const cityEl = document.getElementById('menu-current-city');
  if (coinsEl) coinsEl.textContent = saveData.coins;
  if (nairaEl) nairaEl.textContent = saveData.naira;
  const city = CITIES.find(c => c.id === saveData.selectedCity) || CITIES.at(0);
  if (cityEl) cityEl.textContent = city.name + ' (' + city.raceDist + 'm)';
}

function renderCities() {
  const list = document.getElementById('cities-list');
  if (!list) return;
  list.innerHTML = '';

  CITIES.forEach(city => {
    const unlocked = saveData.unlockedCities.includes(city.id);
    const selected = saveData.selectedCity === city.id;
    const btnText = selected ? 'Active Track' : unlocked ? 'Race Here' : '🪙 ' + city.cost;
    const btnClass = selected ? 'action-chip equipped' : unlocked ? 'action-chip' : 'action-chip locked';

    const card = createListCard(
      city.name,
      city.desc,
      'Finish Distance: ' + city.raceDist + 'm • Trophy: ' + city.reward,
      btnText,
      btnClass,
      function() {
        if (unlocked) {
          saveData.selectedCity = city.id;
          if (typeof setupCityEnvironment === 'function') setupCityEnvironment(city.id);
          persistSave();
          renderCities();
        } else if (saveData.coins >= city.cost) {
          saveData.coins -= city.cost;
          saveData.unlockedCities.push(city.id);
          saveData.selectedCity = city.id;
          if (typeof setupCityEnvironment === 'function') setupCityEnvironment(city.id);
          if (typeof playSound === 'function') playSound('powerup');
          persistSave();
          renderCities();
        } else {
          alert('Not enough Coins! Watch an ad in the Garage or win races.');
        }
      }
    );
    list.appendChild(card);
  });
}

let activeShopTab = 'outfits';
function renderShop() {
  const list = document.getElementById('shop-list');
  if (!list) return;
  list.innerHTML = '';
  const items = SHOP_ITEMS[activeShopTab];

  items.forEach(item => {
    const ownedKey = activeShopTab === 'outfits' ? 'ownedOutfits' : activeShopTab === 'shoes' ? 'ownedShoes' : 'ownedTrails';
    const eqKey = activeShopTab === 'outfits' ? 'equippedOutfit' : activeShopTab === 'shoes' ? 'equippedShoes' : 'equippedTrail';

    const owned = saveData[ownedKey].includes(item.id);
    const equipped = saveData[eqKey] === item.id;
    const icon = item.currency === 'naira' ? '💵' : '🪙';

    const btnText = equipped ? 'Equipped' : owned ? 'Equip' : icon + ' ' + item.cost;
    const btnClass = equipped ? 'action-chip equipped' : owned ? 'action-chip' : 'action-chip locked';
    const subText = owned ? 'Ready in Bike Garage' : 'Unlock with ' + item.currency.toUpperCase();

    const card = createListCard(
      item.name,
      subText,
      null,
      btnText,
      btnClass,
      function() {
        if (owned) {
          saveData[eqKey] = item.id;
          if (typeof buildPlayerModel === 'function') buildPlayerModel();
          persistSave();
          renderShop();
        } else if (saveData[item.currency] >= item.cost) {
          saveData[item.currency] -= item.cost;
          saveData[ownedKey].push(item.id);
          saveData[eqKey] = item.id;
          if (typeof buildPlayerModel === 'function') buildPlayerModel();
          if (typeof playSound === 'function') playSound('powerup');
          persistSave();
          renderShop();
        } else {
          alert('Not enough ' + item.currency + '!');
        }
      }
    );
    list.appendChild(card);
  });
}

function renderMissions() {
  const list = document.getElementById('missions-list');
  if (!list) return;
  list.innerHTML = '';

  MISSION_TEMPLATES.forEach(m => {
    const progress = Math.min(m.target, saveData.missions[m.id] || 0);
    const claimed = saveData.claimedMissions.includes(m.id);
    const done = progress >= m.target;

    const btnText = claimed ? 'Claimed ✔' : done ? 'Claim!' : progress + '/' + m.target;
    const btnClass = claimed ? 'action-chip equipped' : done ? 'action-chip' : 'action-chip locked';

    const card = createListCard(
      m.title,
      'Reward: 🪙 ' + m.rewardCoins + ' + 💵 ' + m.rewardNaira,
      null,
      btnText,
      btnClass,
      function() {
        if (done && !claimed) {
          saveData.coins += m.rewardCoins;
          saveData.naira += m.rewardNaira;
          saveData.claimedMissions.push(m.id);
          if (typeof playSound === 'function') playSound('powerup');
          persistSave();
          renderMissions();
        }
      }
    );
    list.appendChild(card);
  });
}

function renderLeaderboard(region) {
  const selectedRegion = region || 'World';
  const list = document.getElementById('leaderboard-list');
  if (!list) return;
  list.innerHTML = '';

  const currentTrackObj = CITIES.find(c => c.id === saveData.selectedCity) || CITIES.at(0);
  const cleanTrackName = currentTrackObj.name.split(' (').at(0);

  const samplePlayers = Array.of(
    { name: 'Z-Bot Turbo', city: 'Apex Cyber-Core', pts: 18400 },
    { name: 'Kira Volt', city: 'Neon Dockyard', pts: 15200 },
    { name: 'ViaductAce', city: 'Skyrail Viaduct', pts: 12900 },
    { name: 'You (Ace Rider)', city: cleanTrackName, pts: saveData.highScore },
    { name: 'ScrapDrifter', city: 'Rustworks Yard', pts: 7400 }
  ).sort((a, b) => b.pts - a.pts);

  samplePlayers.forEach((p, idx) => {
    const card = createListCard(
      '#' + (idx + 1) + ' ' + p.name,
      'Division: ' + selectedRegion + ' • Home Track: ' + p.city,
      null,
      p.pts.toLocaleString() + ' pts',
      'action-chip equipped',
      null
    );
    list.appendChild(card);
  });
}

// Wire ALL Menu & Modal Buttons Safely Here
function bindMenuControls() {
  updateMenuUI();

  const playBtn = document.getElementById('btn-play');
  const restartBtn = document.getElementById('btn-restart');
  const homeBtn = document.getElementById('btn-home');
  const reviveNairaBtn = document.getElementById('btn-revive-naira');
  const muteBtn = document.getElementById('btn-mute');
  const spinBtn = document.getElementById('btn-spin-action');

  if (playBtn) {
    playBtn.onclick = function() {
      if (typeof startGame === 'function') startGame();
    };
  }

  if (restartBtn) {
    restartBtn.onclick = function() {
      if (typeof startGame === 'function') startGame();
    };
  }

  if (spinBtn) {
    spinBtn.onclick = function() {
      if (typeof trigger360Spin === 'function') trigger360Spin();
    };
  }

  if (homeBtn) {
    homeBtn.onclick = function() {
      document.getElementById('gameover-menu').classList.add('hidden');
      document.getElementById('main-menu').classList.remove('hidden');
    };
  }

  if (reviveNairaBtn) {
    reviveNairaBtn.onclick = function() {
      if (saveData.naira >= 5) {
        saveData.naira -= 5;
        persistSave();
        if (typeof clearEntities === 'function') clearEntities();
        document.getElementById('gameover-menu').classList.add('hidden');
        document.getElementById('hud').classList.remove('hidden');
        if (typeof isPlaying !== 'undefined') isPlaying = true;
        if (typeof playSound === 'function') playSound('powerup');
      } else {
        alert('You need 5 Naira Notes to continue!');
      }
    };
  }

  if (muteBtn) {
    muteBtn.onclick = function(e) {
      isMuted = !isMuted;
      e.target.textContent = isMuted ? '🔇' : '🔊';
    };
  }

  document.querySelectorAll('.nav-btn[data-modal]').forEach(btn => {
    btn.onclick = function() {
      const modalId = btn.getAttribute('data-modal');
      const modalEl = document.getElementById(modalId);
      if (modalEl) modalEl.classList.remove('hidden');
      if (modalId === 'modal-cities') renderCities();
      if (modalId === 'modal-shop') renderShop();
      if (modalId === 'modal-missions') renderMissions();
      if (modalId === 'modal-leaderboard') renderLeaderboard('World');
    };
  });

  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.onclick = function() {
      const m = btn.closest('.modal');
      if (m) m.classList.add('hidden');
    };
  });

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = function() {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeShopTab = btn.getAttribute('data-tab');
      renderShop();
    };
  });

  document.querySelectorAll('.lb-tab').forEach(btn => {
    btn.onclick = function() {
      document.querySelectorAll('.lb-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderLeaderboard(btn.getAttribute('data-region'));
    };
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bindMenuControls);
} else {
  bindMenuControls();
}

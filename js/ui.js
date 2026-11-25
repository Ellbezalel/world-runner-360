// ==========================================
// UI: MENUS, SHOP, CITIES & LEADERBOARDS
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
  document.getElementById('menu-coins').textContent = saveData.coins;
  document.getElementById('menu-naira').textContent = saveData.naira;
  const city = CITIES.find(c => c.id === saveData.selectedCity) || CITIES.at(0);
  document.getElementById('menu-current-city').textContent = city.name;
}

function renderCities() {
  const list = document.getElementById('cities-list');
  list.innerHTML = '';

  CITIES.forEach(city => {
    const unlocked = saveData.unlockedCities.includes(city.id);
    const selected = saveData.selectedCity === city.id;
    const btnText = selected ? 'Equipped' : unlocked ? 'Select' : '🪙 ' + city.cost;
    const btnClass = selected ? 'action-chip equipped' : unlocked ? 'action-chip' : 'action-chip locked';

    const card = createListCard(
      city.name,
      city.desc,
      'Reward: ' + city.reward,
      btnText,
      btnClass,
      function() {
        if (unlocked) {
          saveData.selectedCity = city.id;
          setupCityEnvironment(city.id);
          persistSave();
          renderCities();
        } else if (saveData.coins >= city.cost) {
          saveData.coins -= city.cost;
          saveData.unlockedCities.push(city.id);
          saveData.selectedCity = city.id;
          setupCityEnvironment(city.id);
          playSound('powerup');
          persistSave();
          renderCities();
        } else {
          alert('Not enough Coins! Watch an ad in the Shop or keep running.');
        }
      }
    );
    list.appendChild(card);
  });
}

let activeShopTab = 'outfits';
function renderShop() {
  const list = document.getElementById('shop-list');
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
    const subText = owned ? 'Unlocked in Wardrobe' : 'Unlock with ' + item.currency.toUpperCase();

    const card = createListCard(
      item.name,
      subText,
      null,
      btnText,
      btnClass,
      function() {
        if (owned) {
          saveData[eqKey] = item.id;
          buildPlayerModel();
          persistSave();
          renderShop();
        } else if (saveData[item.currency] >= item.cost) {
          saveData[item.currency] -= item.cost;
          saveData[ownedKey].push(item.id);
          saveData[eqKey] = item.id;
          buildPlayerModel();
          playSound('powerup');
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
          playSound('powerup');
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
  list.innerHTML = '';

  const samplePlayers = Array.of(
    { name: 'SavannaDash', city: 'Savanna Gate', pts: 18400 },
    { name: 'HarborKing99', city: 'Eko Harbor', pts: 15200 },
    { name: 'CitadelAce', city: 'Zuma Citadel', pts: 12900 },
    { name: 'You (Runner)', city: saveData.selectedCity.replace('_', ' ').toUpperCase(), pts: saveData.highScore },
    { name: 'NeoSprinter', city: 'Neo Circuit', pts: 7400 }
  ).sort((a, b) => b.pts - a.pts);

  samplePlayers.forEach((p, idx) => {
    const card = createListCard(
      '#' + (idx + 1) + ' ' + p.name,
      'Division: ' + selectedRegion + ' • Sector: ' + p.city,
      null,
      p.pts.toLocaleString() + ' pts',
      'action-chip equipped',
      null
    );
    list.appendChild(card);
  });
}

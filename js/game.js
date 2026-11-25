// ==========================================
// GAME ENGINE: THREE.JS 3D & CONTROLS
// ==========================================

const container = document.getElementById('game-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 220);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
dirLight.position.set(12, 24, 15);
scene.add(dirLight);

const LANES = Array.of(-2.6, 0, 2.6);
let roadMesh, groundMesh, sceneryGroup, weatherParticles;
let obstacles = Array.of();
let collectibles = Array.of();
let trailParticles = Array.of();

const playerGroup = new THREE.Group();
let bodyMesh, headMesh, leftLeg, rightLeg, shieldBubble;

function buildPlayerModel() {
  while (playerGroup.children.length > 0) {
    playerGroup.remove(playerGroup.children.at(0));
  }

  const outfit = SHOP_ITEMS.outfits.find(o => o.id === saveData.equippedOutfit) || SHOP_ITEMS.outfits.at(0);
  const shoes = SHOP_ITEMS.shoes.find(s => s.id === saveData.equippedShoes) || SHOP_ITEMS.shoes.at(0);

  const torsoGeo = new THREE.BoxGeometry(0.95, 1.15, 0.6);
  const torsoMat = new THREE.MeshLambertMaterial({ color: outfit.color });
  bodyMesh = new THREE.Mesh(torsoGeo, torsoMat);
  bodyMesh.position.y = 1.15;
  playerGroup.add(bodyMesh);

  const trimGeo = new THREE.BoxGeometry(0.98, 0.25, 0.63);
  const trimMat = new THREE.MeshLambertMaterial({ color: outfit.accent });
  const trimMesh = new THREE.Mesh(trimGeo, trimMat);
  trimMesh.position.y = 1.35;
  playerGroup.add(trimMesh);

  const headGeo = new THREE.BoxGeometry(0.55, 0.55, 0.55);
  const headMat = new THREE.MeshLambertMaterial({ color: 0x5c3a21 });
  headMesh = new THREE.Mesh(headGeo, headMat);
  headMesh.position.y = 2.05;
  playerGroup.add(headMesh);

  const capGeo = new THREE.CylinderGeometry(0.32, 0.34, 0.22, 12);
  const capMat = new THREE.MeshLambertMaterial({ color: outfit.accent });
  const capMesh = new THREE.Mesh(capGeo, capMat);
  capMesh.position.y = 2.38;
  playerGroup.add(capMesh);

  const legGeo = new THREE.BoxGeometry(0.32, 0.65, 0.35);
  const shoeMat = new THREE.MeshLambertMaterial({ color: shoes.color });
  leftLeg = new THREE.Mesh(legGeo, shoeMat);
  leftLeg.position.set(-0.24, 0.32, 0);
  rightLeg = new THREE.Mesh(legGeo, shoeMat);
  rightLeg.position.set(0.24, 0.32, 0);
  playerGroup.add(leftLeg, rightLeg);

  const shieldGeo = new THREE.SphereGeometry(1.55, 16, 16);
  const shieldMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.5 });
  shieldBubble = new THREE.Mesh(shieldGeo, shieldMat);
  shieldBubble.position.y = 1.2;
  shieldBubble.visible = false;
  playerGroup.add(shieldBubble);

  scene.add(playerGroup);
}

function setupCityEnvironment(cityId) {
  const city = CITIES.find(c => c.id === cityId) || CITIES.at(0);
  scene.background = new THREE.Color(city.sky);
  scene.fog = new THREE.Fog(city.sky, 35, 130);

  if (roadMesh) scene.remove(roadMesh);
  if (groundMesh) scene.remove(groundMesh);
  if (sceneryGroup) scene.remove(sceneryGroup);
  if (weatherParticles) scene.remove(weatherParticles);

  roadMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(9.5, 300),
    new THREE.MeshLambertMaterial({ color: city.road })
  );
  roadMesh.rotation.x = -Math.PI / 2;
  roadMesh.position.z = -100;
  scene.add(roadMesh);

  groundMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(160, 300),
    new THREE.MeshLambertMaterial({ color: city.ground })
  );
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.position.set(0, -0.05, -100);
  scene.add(groundMesh);

  sceneryGroup = new THREE.Group();
  for (let i = 0; i < 36; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const h = 4 + Math.random() * 14;
    const bGeo = new THREE.BoxGeometry(4 + Math.random() * 3, h, 5);
    const bMat = new THREE.MeshLambertMaterial({ color: city.building });
    const bMesh = new THREE.Mesh(bGeo, bMat);
    bMesh.position.set(side * (8.5 + Math.random() * 4), h / 2, -i * 8);
    sceneryGroup.add(bMesh);
  }
  scene.add(sceneryGroup);

  if (city.weather !== 'none') {
    const pCount = 350;
    const pGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 30;
      positions[i + 1] = Math.random() * 20;
      positions[i + 2] = -Math.random() * 90;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pColor = city.weather === 'rain' ? 0x93c5fd : city.weather === 'sand' ? 0xfde047 : 0xf472b6;
    weatherParticles = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: pColor, size: 0.25 }));
    scene.add(weatherParticles);
  }
}

let isPlaying = false;
let currentLane = 1;
let velocityY = 0;
let isJumping = false;
let isSliding = false;
let slideTimer = 0;
let spinTimer = 0;

let gameSpeed = 22;
let score = 0;
let distance = 0;
let runCoins = 0;
let runNaira = 0;
let spawnTimer = 0;

let activePowerups = {
  shield: 0,
  suya: 0,
  magnet: 0,
  jollof: 0,
  zobo: false
};

function clearEntities() {
  obstacles.forEach(o => scene.remove(o.mesh));
  collectibles.forEach(c => scene.remove(c.mesh));
  trailParticles.forEach(t => scene.remove(t.mesh));
  obstacles = Array.of();
  collectibles = Array.of();
  trailParticles = Array.of();
}

function createObstacleMesh(cityId, type) {
  const group = new THREE.Group();
  if (type === 'high') {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.1, 0.8), new THREE.MeshLambertMaterial({ color: 0xef4444 }));
    bar.position.y = 1.95;
    const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.5, 0.2), new THREE.MeshLambertMaterial({ color: 0x94a3b8 }));
    p1.position.set(-0.95, 1.25, 0);
    const p2 = p1.clone();
    p2.position.x = 0.95;
    group.add(bar, p1, p2);
    return { mesh: group, kind: 'high' };
  } else if (type === 'bus') {
    const busColor = cityId === 'eko_harbor' || cityId === 'metro_central' ? 0xfacc15 : cityId === 'ironbridge' ? 0xdc2626 : cityId === 'neo_shibuya' ? 0x38bdf8 : 0x10b981;
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.1, 2.4, 5.2), new THREE.MeshLambertMaterial({ color: busColor }));
    body.position.y = 1.25;
    group.add(body);
    if (cityId === 'eko_harbor') {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.35, 5.25), new THREE.MeshLambertMaterial({ color: 0x0f172a }));
      stripe.position.y = 1.25;
      group.add(stripe);
    }
    return { mesh: group, kind: 'bus' };
  } else {
    const color = cityId === 'savanna_gate' ? 0xf8fafc : cityId === 'dune_oasis' ? 0xd97706 : 0xf97316;
    const box = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.0, 1.1), new THREE.MeshLambertMaterial({ color: color }));
    box.position.y = 0.5;
    group.add(box);
    return { mesh: group, kind: 'low' };
  }
}

function spawnRow() {
  const cityId = saveData.selectedCity;
  const zPos = -110;
  const blockedLane = Math.floor(Math.random() * 3);
  const types = Array.of('low', 'high', 'bus');
  const chosenType = types.at(Math.floor(Math.random() * types.length));

  const obs = createObstacleMesh(cityId, chosenType);
  obs.mesh.position.set(LANES.at(blockedLane), 0, zPos);
  scene.add(obs.mesh);
  obstacles.push({ mesh: obs.mesh, kind: obs.kind, lane: blockedLane });

  const freeLanes = Array.of(0, 1, 2).filter(l => l !== blockedLane);
  const coinLane = freeLanes.at(Math.floor(Math.random() * freeLanes.length));

  const roll = Math.random();
  if (roll < 0.08) {
    // Rare Power-Up or Naira Note (8% chance)
    const puTypes = Array.of('shield', 'suya', 'magnet', 'jollof', 'zobo', 'shield', 'suya', 'naira_note');
    const pu = puTypes.at(Math.floor(Math.random() * puTypes.length));
    const puColors = {
      shield: 0x38bdf8,
      suya: 0xf97316,
      magnet: 0xa855f7,
      jollof: 0xef4444,
      zobo: 0xe11d48,
      naira_note: 0x10b981
    };
    const geo = pu === 'naira_note' ? new THREE.BoxGeometry(0.9, 0.5, 0.15) : new THREE.OctahedronGeometry(0.6);
    const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: puColors[pu] }));
    mesh.position.set(LANES.at(coinLane), 1.1, zPos);
    scene.add(mesh);
    collectibles.push({ mesh: mesh, type: pu });
  } else if (roll < 0.62) {
    // Slower coin economy: 2 coins per group, ~54% spawn chance
    for (let i = 0; i < 2; i++) {
      const cGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.15, 14);
      const cMat = new THREE.MeshLambertMaterial({ color: 0xfacc15 });
      const cMesh = new THREE.Mesh(cGeo, cMat);
      cMesh.rotation.x = Math.PI / 2;
      cMesh.position.set(LANES.at(coinLane), 0.9, zPos - i * 3.2);
      scene.add(cMesh);
      collectibles.push({ mesh: cMesh, type: 'coin' });
    }
  }
}

function moveLeft() {
  if (isPlaying && currentLane > 0) currentLane--;
}

function moveRight() {
  if (isPlaying && currentLane < 2) currentLane++;
}

function jump() {
  if (!isPlaying || isJumping) return;
  isJumping = true;
  isSliding = false;
  playerGroup.scale.y = 1;
  velocityY = 14.5;
  playSound('jump');
  trackMission('jumps_20', 1, false);
}

function slide() {
  if (!isPlaying) return;
  isSliding = true;
  slideTimer = 0.65;
  if (isJumping) velocityY = -18;
  playerGroup.scale.y = 0.48;
  playSound('slide');
}

function trigger360Spin() {
  if (!isPlaying || spinTimer > 0) return;
  spinTimer = 0.75;
  playSound('spin');
  trackMission('spin_3', 1, false);

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles.at(i);
    if (Math.abs(obs.mesh.position.z - playerGroup.position.z) < 15) {
scene.remove(obs.mesh);
obstacles.splice(i, 1);
score += 100;
}
}
}
window.addEventListener('keydown', function(e) {
if (e.code === 'ArrowLeft' || e.code === 'KeyA') moveLeft();
if (e.code === 'ArrowRight' || e.code === 'KeyD') moveRight();
if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') jump();
if (e.code === 'ArrowDown' || e.code === 'KeyS') slide();
if (e.code === 'KeyE' || e.code === 'ShiftLeft') trigger360Spin();
});
let touchStartX = 0;
let touchStartY = 0;
let lastTapTime = 0;
window.addEventListener('touchstart', function(e) {
if (e.target.closest('button') || e.target.closest('.overlay')) return;
touchStartX = e.changedTouches.item(0).screenX;
touchStartY = e.changedTouches.item(0).screenY;
const now = Date.now();
if (now - lastTapTime < 280) trigger360Spin();
lastTapTime = now;
}, { passive: true });
window.addEventListener('touchend', function(e) {
if (!isPlaying || e.target.closest('button')) return;
const dx = e.changedTouches.item(0).screenX - touchStartX;
const dy = e.changedTouches.item(0).screenY - touchStartY;
if (Math.abs(dx) < 25 && Math.abs(dy) < 25) return;
if (Math.abs(dx) > Math.abs(dy)) {
if (dx > 0) moveRight();
else moveLeft();
} else {
if (dy < 0) jump();
else slide();
}
}, { passive: true });
document.getElementById('btn-spin-action').addEventListener('click', trigger360Spin);
function startGame() {
buildPlayerModel();
setupCityEnvironment(saveData.selectedCity);
clearEntities();
currentLane = 1;
playerGroup.position.set(0, 0, 0);
playerGroup.rotation.set(0, 0, 0);
playerGroup.scale.set(1, 1, 1);
velocityY = 0;
isJumping = false;
isSliding = false;
spinTimer = 0;
gameSpeed = 22;
score = 0;
distance = 0;
runCoins = 0;
runNaira = 0;
activePowerups = { shield: 0, suya: 0, magnet: 0, jollof: 0, zobo: false };
const cityObj = CITIES.find(c => c.id === saveData.selectedCity) || CITIES.at(0);
document.getElementById('hud-city-badge').textContent = '📍 ' + cityObj.name;
document.getElementById('hud-zobo-badge').classList.add('hidden');
document.getElementById('main-menu').classList.add('hidden');
document.getElementById('gameover-menu').classList.add('hidden');
document.getElementById('hud').classList.remove('hidden');
isPlaying = true;
}
function handleCrash() {
if (activePowerups.zobo) {
activePowerups.zobo = false;
document.getElementById('hud-zobo-badge').classList.add('hidden');
playSound('powerup');
clearEntities();
return;
}
isPlaying = false;
playSound('crash');
saveData.coins += runCoins;
saveData.naira += runNaira;
if (Math.floor(score) > saveData.highScore) saveData.highScore = Math.floor(score);
trackMission('dist_360', Math.floor(distance), true);
persistSave();
const cityObj = CITIES.find(c => c.id === saveData.selectedCity) || CITIES.at(0);
document.getElementById('gameover-city').textContent = 'City: ' + cityObj.name;
document.getElementById('end-score').textContent = Math.floor(score);
document.getElementById('end-dist').textContent = Math.floor(distance) + 'm';
document.getElementById('end-coins').textContent = '+' + runCoins;
document.getElementById('end-naira').textContent = '+' + runNaira;
document.getElementById('hud').classList.add('hidden');
document.getElementById('gameover-menu').classList.remove('hidden');
// Show Interstitial Ad after EVERY race
if (typeof showInterstitialAd === 'function') {
showInterstitialAd();
}
}
function updatePowerupHUD() {
const barContainer = document.getElementById('powerup-bars');
barContainer.innerHTML = '';
const list = Array.of(
{ key: 'shield', label: '🛡️ Storm Shield', max: 5 },
{ key: 'suya', label: '🔥 Spice 2x Boost', max: 8 },
{ key: 'magnet', label: '🧲 Coin Magnet', max: 8 },
{ key: 'jollof', label: '🍲 Turbo Rush', max: 10 }
);
list.forEach(item => {
const val = activePowerups[item.key];
if (val > 0) {
const pct = Math.max(0, Math.min(100, (val / item.max) * 100));
const wrap = document.createElement('div');
wrap.className = 'pu-bar-item';
const title = document.createElement('div');
title.textContent = item.label + ' (' + val.toFixed(1) + 's)';
const prog = document.createElement('div');
prog.className = 'pu-progress';
const fill = document.createElement('div');
fill.className = 'pu-progress-fill';
fill.style.width = pct + '%';
prog.appendChild(fill);
wrap.appendChild(title);
wrap.appendChild(prog);
barContainer.appendChild(wrap);
}
});
}
const clock = new THREE.Clock();
function animate() {
requestAnimationFrame(animate);
const delta = Math.min(clock.getDelta(), 0.05);
if (isPlaying) {
const speedMult = activePowerups.jollof > 0 ? 1.8 : activePowerups.suya > 0 ? 1.45 : 1.0;
const currentSpeed = gameSpeed * speedMult;
gameSpeed = Math.min(46, gameSpeed + delta * 0.35);
distance += currentSpeed * delta * 0.5;
score += currentSpeed * delta * (activePowerups.suya > 0 ? 4 : 2);
const targetX = LANES.at(currentLane);
playerGroup.position.x += (targetX - playerGroup.position.x) * Math.min(1, delta * 14);
if (isJumping) {
playerGroup.position.y += velocityY * delta;
velocityY -= 38 * delta;
if (playerGroup.position.y <= 0) {
playerGroup.position.y = 0;
isJumping = false;
velocityY = 0;
}
}
if (isSliding) {
slideTimer -= delta;
if (slideTimer <= 0) {
isSliding = false;
playerGroup.scale.y = 1;
}
}
if (spinTimer > 0) {
spinTimer -= delta;
playerGroup.rotation.y += delta * 22;
if (spinTimer <= 0) playerGroup.rotation.y = 0;
} else {
const runCycle = Date.now() * 0.015;
leftLeg.rotation.x = Math.sin(runCycle) * 0.6;
rightLeg.rotation.x = -Math.sin(runCycle) * 0.6;
}
Array.of('shield', 'suya', 'magnet', 'jollof').forEach(k => {
if (activePowerups[k] > 0) activePowerups[k] = Math.max(0, activePowerups[k] - delta);
});
shieldBubble.visible = activePowerups.shield > 0 || activePowerups.jollof > 0;
updatePowerupHUD();
const trailObj = SHOP_ITEMS.trails.find(t => t.id === saveData.equippedTrail);
if (trailObj && trailObj.color && Math.random() < 0.5) {
const tMesh = new THREE.Mesh(
new THREE.BoxGeometry(0.25, 0.25, 0.25),
new THREE.MeshBasicMaterial({ color: trailObj.color })
);
tMesh.position.copy(playerGroup.position);
tMesh.position.y += 0.6;
scene.add(tMesh);
trailParticles.push({ mesh: tMesh, life: 0.35 });
}
for (let i = trailParticles.length - 1; i >= 0; i--) {
const tp = trailParticles.at(i);
tp.life -= delta;
tp.mesh.position.z += currentSpeed * delta * 0.4;
tp.mesh.scale.multiplyScalar(0.92);
if (tp.life <= 0) {
scene.remove(tp.mesh);
trailParticles.splice(i, 1);
}
}
sceneryGroup.children.forEach(b => {
b.position.z += currentSpeed * delta;
if (b.position.z > 15) b.position.z -= 280;
});
if (weatherParticles) {
weatherParticles.position.z += currentSpeed * delta * 0.6;
if (weatherParticles.position.z > 30) weatherParticles.position.z = 0;
}
spawnTimer -= delta * currentSpeed;
if (spawnTimer <= 0) {
spawnRow();
spawnTimer = 24;
}
for (let i = obstacles.length - 1; i >= 0; i--) {
const obs = obstacles.at(i);
obs.mesh.position.z += currentSpeed * delta;
const dz = Math.abs(obs.mesh.position.z - playerGroup.position.z);
const dx = Math.abs(obs.mesh.position.x - playerGroup.position.x);
if (dx < 0.95 && dz < 1.35) {
const invincible = activePowerups.shield > 0 || activePowerups.jollof > 0 || spinTimer > 0;
if (invincible) {
scene.remove(obs.mesh);
obstacles.splice(i, 1);
score += 50;
playSound('spin');
continue;
}
const jumpedOverLow = obs.kind === 'low' && playerGroup.position.y > 0.85;
const slidUnderHigh = obs.kind === 'high' && isSliding;
if (!jumpedOverLow && !slidUnderHigh) {
handleCrash();
break;
}
}
if (obs.mesh.position.z > 15) {
scene.remove(obs.mesh);
obstacles.splice(i, 1);
}
}
for (let i = collectibles.length - 1; i >= 0; i--) {
const item = collectibles.at(i);
item.mesh.position.z += currentSpeed * delta;
item.mesh.rotation.y += delta * 3.5;
if (activePowerups.magnet > 0 && item.type === 'coin' && item.mesh.position.z > -35) {
item.mesh.position.x += (playerGroup.position.x - item.mesh.position.x) * delta * 10;
item.mesh.position.y += (playerGroup.position.y + 1 - item.mesh.position.y) * delta * 10;
}
const dz = Math.abs(item.mesh.position.z - playerGroup.position.z);
const dx = Math.abs(item.mesh.position.x - playerGroup.position.x);
if (dx < 1.15 && dz < 1.3) {
if (item.type === 'coin') {
const gained = activePowerups.suya > 0 ? 2 : 1;
runCoins += gained;
score += 15 * gained;
playSound('coin');
trackMission('coins_50', gained, false);
} else if (item.type === 'naira_note') {
runNaira += 1;
playSound('powerup');
} else if (item.type === 'shield') {
activePowerups.shield = 5;
playSound('powerup');
} else if (item.type === 'suya') {
activePowerups.suya = 8;
playSound('powerup');
} else if (item.type === 'magnet') {
activePowerups.magnet = 8;
playSound('powerup');
} else if (item.type === 'jollof') {
activePowerups.jollof = 10;
playSound('powerup');
} else if (item.type === 'zobo') {
activePowerups.zobo = true;
document.getElementById('hud-zobo-badge').classList.remove('hidden');
playSound('powerup');
}
scene.remove(item.mesh);
collectibles.splice(i, 1);
continue;
}
if (item.mesh.position.z > 15) {
scene.remove(item.mesh);
collectibles.splice(i, 1);
}
}
document.getElementById('hud-score').textContent = Math.floor(score);
document.getElementById('hud-dist').textContent = Math.floor(distance) + 'm';
document.getElementById('hud-coins').textContent = saveData.coins + runCoins;
document.getElementById('hud-naira').textContent = saveData.naira + runNaira;
} else {
playerGroup.rotation.y += delta * 0.8;
}
camera.position.set(playerGroup.position.x * 0.45, 5.2, 8.8);
camera.lookAt(playerGroup.position.x * 0.3, 1.8, -12);
renderer.render(scene, camera);
}
// Button Bindings
document.getElementById('btn-play').onclick = startGame;
document.getElementById('btn-restart').onclick = startGame;
document.getElementById('btn-home').onclick = function() {
document.getElementById('gameover-menu').classList.add('hidden');
document.getElementById('main-menu').classList.remove('hidden');
};
document.getElementById('btn-revive-naira').onclick = function() {
if (saveData.naira >= 5) {
saveData.naira -= 5;
persistSave();
clearEntities();
document.getElementById('gameover-menu').classList.add('hidden');
document.getElementById('hud').classList.remove('hidden');
isPlaying = true;
playSound('powerup');
} else {
alert('You need 5 Naira Notes to revive!');
}
};
document.getElementById('btn-mute').onclick = function(e) {
isMuted = !isMuted;
e.target.textContent = isMuted ? '🔇' : '🔊';
};
document.querySelectorAll('.nav-btn[data-modal]').forEach(btn => {
btn.onclick = function() {
const modalId = btn.getAttribute('data-modal');
document.getElementById(modalId).classList.remove('hidden');
if (modalId === 'modal-cities') renderCities();
if (modalId === 'modal-shop') renderShop();
if (modalId === 'modal-missions') renderMissions();
if (modalId === 'modal-leaderboard') renderLeaderboard('World');
};
});
document.querySelectorAll('.close-modal').forEach(btn => {
btn.onclick = function() {
btn.closest('.modal').classList.add('hidden');
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
window.addEventListener('resize', function() {
camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();
renderer.setSize(window.innerWidth, window.innerHeight);
});
// Boot Game
buildPlayerModel();
setupCityEnvironment(saveData.selectedCity);
updateMenuUI();
animate();
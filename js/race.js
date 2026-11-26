if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() { navigator.serviceWorker.register('/sw.js').catch(function() {}); });
}
function triggerInstall() {
  if (window.deferredPWA) {
    window.deferredPWA.prompt();
    window.deferredPWA.userChoice.then(function(c) {
      if (c.outcome === 'accepted') { localStorage.setItem('wr360_installed', 'true'); document.getElementById('install-screen').classList.add('hidden'); }
      window.deferredPWA = null;
    });
  } else { document.getElementById('btn-install-app').textContent = '📲 Tap Browser Menu (⋮) → Install App'; }
}
function skipInstall() { document.getElementById('install-screen').classList.add('hidden'); }
if (localStorage.getItem('wr360_installed') === 'true') document.getElementById('install-screen').classList.add('hidden');
function openPrivacy(e) { if (e) e.preventDefault(); document.getElementById('privacy-modal').classList.remove('hidden'); }
function closePrivacy() { document.getElementById('privacy-modal').classList.add('hidden'); }
function returnHome() { document.getElementById('gameover-menu').classList.add('hidden'); document.getElementById('main-menu').classList.remove('hidden'); }

const TRACKS = Array.of(
  { id: 't1', name: 'Rustworks Yard', dist: 750, cost: 0, sky: 0x1e293b, road: 0x0f172a },
  { id: 't2', name: 'Neon Dockyard', dist: 950, cost: 500, sky: 0x0f172a, road: 0x090d16 },
  { id: 't3', name: 'Skyrail Viaduct', dist: 1200, cost: 1200, sky: 0x1e1b4b, road: 0x0f172a },
  { id: 't4', name: 'Apex Cyber-Core', dist: 1600, cost: 2500, sky: 0x090d16, road: 0x020617 }
);
const BIKES = Array.of(
  { id: 'b1', name: 'Crimson Street BMX', cost: 0, color: 0xef4444 },
  { id: 'b2', name: 'Cobalt Volt Racer', cost: 400, color: 0x2563eb },
  { id: 'b3', name: 'Emerald Trail Moto', cost: 900, color: 0x10b981 },
  { id: 'b4', name: 'Sovereign Gold BMX', cost: 1800, color: 0xfacc15 }
);
let save = Object.assign({ coins: 50, naira: 2, highScore: 0, track: 't1', unlockedTracks: Array.of('t1'), bike: 'b1', ownedBikes: Array.of('b1') }, JSON.parse(localStorage.getItem('wr360_v6') || '{}'));
function saveProgress() {
  localStorage.setItem('wr360_v6', JSON.stringify(save));
  document.getElementById('menu-coins').textContent = save.coins;
  document.getElementById('menu-naira').textContent = save.naira;
  const tr = TRACKS.find(function(t) { return t.id === save.track; }) || TRACKS.at(0);
  document.getElementById('menu-current-city').textContent = tr.name + ' (' + tr.dist + 'm)';
}
saveProgress();

let isMuted = false;
function toggleMute() { isMuted = !isMuted; document.getElementById('btn-mute').textContent = isMuted ? '🔇' : '🔊'; }
function beep(freq) {
  if (isMuted) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)(), o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination); o.frequency.value = freq; g.gain.value = 0.1; o.start(); o.stop(ctx.currentTime + 0.12);
  } catch (e) {}
}

function openAd(cb) {
  const m = document.getElementById('ad-modal'), f = document.getElementById('ad-iframe'), t = document.getElementById('ad-timer-text'), x = document.getElementById('btn-close-ad');
  let s = 5; x.classList.add('hidden'); t.textContent = '⏳ Reward ready in 5s...';
  f.src = 'https://araplhn.org'; m.classList.remove('hidden');
  const iv = setInterval(function() {
    s--;
    if (s > 0) t.textContent = '⏳ Reward ready in ' + s + 's...';
    else { clearInterval(iv); t.textContent = '✅ Tap X to continue'; x.classList.remove('hidden'); }
  }, 1000);
  x.onclick = function() { clearInterval(iv); f.src = 'about:blank'; m.classList.add('hidden'); if (cb) cb(); };
}
function watchAdForCoins() { openAd(function() { save.coins += 50; saveProgress(); beep(880); alert('+50 Coins Added!'); }); }
function watchAdToRevive() { openAd(function() { clearObs(); document.getElementById('gameover-menu').classList.add('hidden'); document.getElementById('hud').classList.remove('hidden'); playing = true; }); }

function closeModals() { document.querySelectorAll('.modal').forEach(function(m) { m.classList.add('hidden'); }); }
function openModal(id) {
  closeModals(); document.getElementById(id).classList.remove('hidden');
  if (id === 'modal-cities') {
    const el = document.getElementById('cities-list'); el.innerHTML = '';
    TRACKS.forEach(function(tr) {
      const unl = save.unlockedTracks.includes(tr.id);
      el.innerHTML += '<div class="list-item"><div><h4>' + tr.name + '</h4><p>' + tr.dist + 'm Sprint</p></div><button class="action-chip" onclick="selectTrack(\'' + tr.id + '\')">' + (save.track === tr.id ? 'Active' : unl ? 'Select' : '🪙 ' + tr.cost) + '</button></div>';
    });
  } else if (id === 'modal-shop') {
    const el = document.getElementById('shop-list'); el.innerHTML = '';
    BIKES.forEach(function(bk) {
      const own = save.ownedBikes.includes(bk.id);
      el.innerHTML += '<div class="list-item"><div><h4>' + bk.name + '</h4></div><button class="action-chip" onclick="selectBike(\'' + bk.id + '\')">' + (save.bike === bk.id ? 'Equipped' : own ? 'Equip' : '🪙 ' + bk.cost) + '</button></div>';
    });
  } else if (id === 'modal-missions') {
    document.getElementById('missions-list').innerHTML = '<div class="list-item"><div><h4>Win 1st Place on any track</h4><p>Reward: +60 Coins per win</p></div><span class="action-chip equipped">Active</span></div>';
  } else if (id === 'modal-leaderboard') {
    document.getElementById('leaderboard-list').innerHTML = '<div class="list-item"><div><h4>#1 You (Ace Rider)</h4><p>Best Score: ' + save.highScore + '</p></div><span class="action-chip equipped">Top</span></div><div class="list-item"><div><h4>#2 Z-Bot Turbo</h4><p>14,200 pts</p></div></div><div class="list-item"><div><h4>#3 Kira Volt</h4><p>11,800 pts</p></div></div>';
  }
}
function selectTrack(id) {
  const tr = TRACKS.find(function(t) { return t.id === id; });
  if (save.unlockedTracks.includes(id)) { save.track = id; saveProgress(); openModal('modal-cities'); }
  else if (save.coins >= tr.cost) { save.coins -= tr.cost; save.unlockedTracks.push(id); save.track = id; saveProgress(); openModal('modal-cities'); }
  else alert('Not enough coins!');
}
function selectBike(id) {
  const bk = BIKES.find(function(b) { return b.id === id; });
  if (save.ownedBikes.includes(id)) { save.bike = id; saveProgress(); openModal('modal-shop'); }
  else if (save.coins >= bk.cost) { save.coins -= bk.cost; save.ownedBikes.push(id); save.bike = id; saveProgress(); openModal('modal-shop'); }
  else alert('Not enough coins!');
}

const LANES = Array.of(-2.5, 0, 2.5);
let scene, camera, renderer, road, player, buildings = Array.of(), obsList = Array.of(), coinList = Array.of(), rivals = Array.of();
let playing = false, lane = 1, vy = 0, jumping = false, sliding = false, slideT = 0, spinT = 0, speed = 24, score = 0, dist = 0, rCoins = 0, spawnT = 0;

function makeBike(bikeColor, jacketColor) {
  const g = new THREE.Group();
  const frame = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.45, 1.5), new THREE.MeshLambertMaterial({ color: bikeColor })); frame.position.y = 0.65;
  const w1 = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.09, 8, 16), new THREE.MeshLambertMaterial({ color: 0x111827 })); w1.rotation.y = Math.PI / 2; w1.position.set(0, 0.4, -0.75);
  const w2 = w1.clone(); w2.position.z = 0.75;
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.65, 0.35), new THREE.MeshLambertMaterial({ color: jacketColor })); body.position.set(0, 1.25, 0.05); body.rotation.x = -0.3;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), new THREE.MeshLambertMaterial({ color: 0xd99b66 })); head.position.set(0, 1.75, -0.1);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshLambertMaterial({ color: 0xf97316 })); cap.position.set(0, 1.8, -0.1);
  g.add(frame, w1, w2, body, head, cap); return g;
}
function clearObs() {
  if (!scene) return;
  obsList.forEach(function(o) { scene.remove(o.m); }); obsList = Array.of();
  coinList.forEach(function(c) { scene.remove(c.m); }); coinList = Array.of();
}
function buildWorld() {
  if (!scene) return;
  const tr = TRACKS.find(function(t) { return t.id === save.track; }) || TRACKS.at(0);
  scene.background = new THREE.Color(tr.sky);
  if (road) scene.remove(road);
  buildings.forEach(function(b) { scene.remove(b); }); buildings = Array.of();
  road = new THREE.Mesh(new THREE.PlaneGeometry(9, 260), new THREE.MeshLambertMaterial({ color: tr.road })); road.rotation.x = -Math.PI / 2; road.position.z = -90; scene.add(road);
  for (let i = 0; i < 30; i++) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(4, 6 + Math.random() * 12, 5), new THREE.MeshLambertMaterial({ color: 0x334155 }));
    b.position.set((i % 2 === 0 ? -1 : 1) * 9.5, 5, -i * 8); scene.add(b); buildings.push(b);
  }
}
function startGame() {
  closeModals(); if (!scene) return;
  buildWorld(); clearObs();
  if (player) scene.remove(player);
  const bk = BIKES.find(function(b) { return b.id === save.bike; }) || BIKES.at(0);
  player = makeBike(bk.color, 0xdc2626); scene.add(player);
  rivals.forEach(function(r) { scene.remove(r.m); }); rivals = Array.of();
  const r1 = makeBike(0x14b8a6, 0x0d9488); r1.position.set(LANES.at(0), 0, -5); scene.add(r1);
  const r2 = makeBike(0x38bdf8, 0xf8fafc); r2.position.set(LANES.at(2), 0, -9); scene.add(r2);
  rivals.push({ m: r1, lane: 0, z: -5, t: 1 }, { m: r2, lane: 2, z: -9, t: 1.4 });
  lane = 1; player.position.set(0, 0, 0); player.scale.set(1, 1, 1); player.rotation.set(0, 0, 0);
  vy = 0; jumping = false; sliding = false; spinT = 0; speed = 24; score = 0; dist = 0; rCoins = 0;
  const tr = TRACKS.find(function(t) { return t.id === save.track; }) || TRACKS.at(0);
  document.getElementById('hud-city-badge').textContent = '🏁 ' + tr.name;
  document.getElementById('main-menu').classList.add('hidden');
document.getElementById('gameover-menu').classList.add('hidden');
document.getElementById('hud').classList.remove('hidden');
playing = true;
}
function trigger360Spin() {
if (!playing || spinT > 0) return;
spinT = 0.7; beep(620);
obsList = obsList.filter(function(o) { if (Math.abs(o.m.position.z) < 14) { scene.remove(o.m); score += 100; return false; } return true; });
}
function doJump() { if (playing && !jumping && player) { jumping = true; sliding = false; player.scale.y = 1; vy = 14.5; beep(420); } }
function doSlide() { if (playing && player) { sliding = true; slideT = 0.65; player.scale.y = 0.5; beep(240); } }
window.addEventListener('keydown', function(e) {
if (e.code === 'ArrowLeft' || e.code === 'KeyA') { if (playing && lane > 0) lane--; }
if (e.code === 'ArrowRight' || e.code === 'KeyD') { if (playing && lane < 2) lane++; }
if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') doJump();
if (e.code === 'ArrowDown' || e.code === 'KeyS') doSlide();
if (e.code === 'KeyE') trigger360Spin();
});
let tx = 0, ty = 0, tapT = 0;
window.addEventListener('touchstart', function(e) {
if (e.target.closest('button') || e.target.closest('.overlay') || e.target.closest('#install-screen')) return;
tx = e.changedTouches.item(0).screenX; ty = e.changedTouches.item(0).screenY;
if (Date.now() - tapT < 280) trigger360Spin(); tapT = Date.now();
}, { passive: true });
window.addEventListener('touchend', function(e) {
if (!playing || e.target.closest('button')) return;
const dx = e.changedTouches.item(0).screenX - tx, dy = e.changedTouches.item(0).screenY - ty;
if (Math.abs(dx) < 25 && Math.abs(dy) < 25) return;
if (Math.abs(dx) > Math.abs(dy)) { if (dx > 0 && lane < 2) lane++; else if (dx < 0 && lane > 0) lane--; }
else { if (dy < 0) doJump(); else doSlide(); }
}, { passive: true });
try {
scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 200);
renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('game-container').appendChild(renderer.domElement);
scene.add(new THREE.AmbientLight(0xffffff, 0.85));
const dl = new THREE.DirectionalLight(0xffffff, 0.9); dl.position.set(10, 20, 15); scene.add(dl);
player = makeBike(0xef4444, 0xdc2626); scene.add(player); buildWorld();
const clock = new THREE.Clock();
function loop() {
requestAnimationFrame(loop);
const dt = Math.min(clock.getDelta(), 0.05);
if (playing) {
const tr = TRACKS.find(function(t) { return t.id === save.track; }) || TRACKS.at(0);
speed = Math.min(44, speed + dt * 0.35); dist += speed * dt * 0.5; score += speed * dt * 2;
player.position.x += (LANES.at(lane) - player.position.x) * Math.min(1, dt * 14);
if (jumping) { player.position.y += vy * dt; vy -= 38 * dt; if (player.position.y <= 0) { player.position.y = 0; jumping = false; } }
if (sliding) { slideT -= dt; if (slideT <= 0) { sliding = false; player.scale.y = 1; } }
if (spinT > 0) { spinT -= dt; player.rotation.y += dt * 20; if (spinT <= 0) player.rotation.y = 0; }
rivals.forEach(function(r) {
r.t -= dt; if (r.t <= 0) { r.t = 1 + Math.random(); r.lane = Math.floor(Math.random() * 3); }
r.z += (Math.random() - 0.52) * 5 * dt; r.z = Math.max(-22, Math.min(4, r.z));
r.m.position.x += (LANES.at(r.lane) - r.m.position.x) * dt * 8; r.m.position.z = r.z;
});
buildings.forEach(function(b) { b.position.z += speed * dt; if (b.position.z > 15) b.position.z -= 240; });
spawnT -= speed * dt;
if (spawnT <= 0) {
spawnT = 24;
const bl = Math.floor(Math.random() * 3), kind = Array.of('low', 'high', 'ramp').at(Math.floor(Math.random() * 3));
const m = new THREE.Mesh(new THREE.BoxGeometry(1.9, kind === 'high' ? 1.1 : 0.85, kind === 'ramp' ? 3 : 0.6), new THREE.MeshLambertMaterial({ color: kind === 'ramp' ? 0xfacc15 : kind === 'high' ? 0xef4444 : 0xf97316 }));
m.position.set(LANES.at(bl), kind === 'high' ? 1.9 : 0.45, -110); scene.add(m); obsList.push({ m: m, kind: kind });
const freeLanes = Array.of(0, 1, 2).filter(function(l) { return l !== bl; });
const cl = freeLanes.at(Math.floor(Math.random() * freeLanes.length));
const cm = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.12, 12), new THREE.MeshLambertMaterial({ color: 0xfacc15 }));
cm.rotation.x = Math.PI / 2; cm.position.set(LANES.at(cl), 0.9, -110); scene.add(cm); coinList.push({ m: cm });
}
for (let i = obsList.length - 1; i >= 0; i--) {
const o = obsList.at(i); o.m.position.z += speed * dt;
if (Math.abs(o.m.position.x - player.position.x) < 0.95 && Math.abs(o.m.position.z) < 1.3) {
if (o.kind === 'ramp') { if (!jumping) { jumping = true; vy = 17.5; score += 75; beep(520); } }
else if (spinT > 0 || (o.kind === 'low' && player.position.y > 0.7) || (o.kind === 'high' && sliding)) {}
else {
playing = false; beep(120); save.coins += rCoins; if (Math.floor(score) > save.highScore) save.highScore = Math.floor(score); saveProgress();
document.getElementById('gameover-title').textContent = '💥 WIPED OUT!'; document.getElementById('end-score').textContent = Math.floor(score);
document.getElementById('end-dist').textContent = Math.floor(dist) + 'm'; document.getElementById('end-coins').textContent = '+' + rCoins;
document.getElementById('hud').classList.add('hidden'); document.getElementById('gameover-menu').classList.remove('hidden'); break;
}
}
if (o.m.position.z > 15) { scene.remove(o.m); obsList.splice(i, 1); }
}
for (let i = coinList.length - 1; i >= 0; i--) {
const c = coinList.at(i); c.m.position.z += speed * dt; c.m.rotation.y += dt * 4;
if (Math.abs(c.m.position.x - player.position.x) < 1.1 && Math.abs(c.m.position.z) < 1.2) { rCoins++; score += 20; beep(880); scene.remove(c.m); coinList.splice(i, 1); continue; }
if (c.m.position.z > 15) { scene.remove(c.m); coinList.splice(i, 1); }
}
if (dist >= tr.dist) {
playing = false; beep(980); rCoins += 60; save.coins += rCoins; saveProgress();
document.getElementById('gameover-title').textContent = '🏆 FINISH LINE VICTORY!'; document.getElementById('end-score').textContent = Math.floor(score);
document.getElementById('end-dist').textContent = Math.floor(dist) + 'm'; document.getElementById('end-coins').textContent = '+' + rCoins;
document.getElementById('hud').classList.add('hidden'); document.getElementById('gameover-menu').classList.remove('hidden');
}
const ahead = rivals.filter(function(r) { return r.z < 0; }).length + 1;
document.getElementById('hud-pos').textContent = ahead === 1 ? '1st/3' : ahead === 2 ? '2nd/3' : '3rd/3';
document.getElementById('hud-score-badge').textContent = 'SCORE: ' + Math.floor(score);
document.getElementById('hud-dist').textContent = Math.floor(dist) + '/' + tr.dist + 'm';
document.getElementById('hud-coins').textContent = save.coins + rCoins;
} else { player.rotation.y += dt * 0.8; }
camera.position.set(player.position.x * 0.45, 5, 8.5); camera.lookAt(player.position.x * 0.3, 1.5, -12); renderer.render(scene, camera);
}
window.addEventListener('resize', function() { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });
loop();
} catch (err) { console.error('3D Init Error:', err); }
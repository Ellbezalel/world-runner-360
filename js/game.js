// ==========================================
// GAME ENGINE: 3D BIKE RACE, AI RIVALS & RAMPS
// ==========================================

const container = document.getElementById('game-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 220);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.78);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.95);
dirLight.position.set(14, 28, 18);
scene.add(dirLight);

const LANES = Array.of(-2.6, 0, 2.6);
let roadMesh, groundMesh, sceneryGroup, roadLinesGroup, weatherParticles, finishArch;
let obstacles = Array.of();
let collectibles = Array.of();
let trailParticles = Array.of();
let aiRivals = Array.of();

const playerGroup = new THREE.Group();
let playerFrontWheel, playerRearWheel, playerJetFlame, shieldBubble;

// Builds a detailed 3D Bike/Moto + Rider (Bound Character or AI Rival)
function createRacerAssembly(opts) {
  const root = new THREE.Group();
  const bikeMat = new THREE.MeshLambertMaterial({ color: opts.bikeColor });
  const rimMat = new THREE.MeshBasicMaterial({ color: opts.rimColor });
  const tireMat = new THREE.MeshLambertMaterial({ color: 0x090d16 });
  const metalMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });

  // Front & Rear Wheels
  function makeWheel(zPos) {
    const wGroup = new THREE.Group();
    wGroup.position.set(0, 0.42, zPos);
    const tire = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.09, 10, 20), tireMat);
    tire.rotation.y = Math.PI / 2;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.03, 8, 16), rimMat);
    rim.rotation.y = Math.PI / 2;
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.18, 10), metalMat);
    hub.rotation.z = Math.PI / 2;
    const spoke1 = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.62, 0.03), metalMat);
    const spoke2 = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.62), metalMat);
    wGroup.add(tire, rim, hub, spoke1, spoke2);
    return wGroup;
  }

  const frontWheel = makeWheel(-0.78);
  const rearWheel = makeWheel(0.78);
  root.add(frontWheel, rearWheel);

  // Bike Frame, Forks, Handlebars & Seat
  const mainBar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.35, 10), bikeMat);
  mainBar.rotation.x = Math.PI / 2.2;
  mainBar.position.set(0, 0.72, 0);

  const downTube = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.95, 10), bikeMat);
  downTube.rotation.x = -Math.PI / 3.2;
  downTube.position.set(0, 0.68, -0.35);

  const fork = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.95, 10), metalMat);
  fork.rotation.x = -0.32;
  fork.position.set(0, 0.85, -0.62);

  const handlebar = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.85, 10), metalMat);
  handlebar.rotation.z = Math.PI / 2;
  handlebar.position.set(0, 1.28, -0.48);

  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.1, 0.42), tireMat);
  seat.position.set(0, 0.95, 0.35);

  root.add(mainBar, downTube, fork, handlebar, seat);

  // Jet / Nitro Exhaust Cone
  const flame = new THREE.Mesh(
    new THREE.ConeGeometry(0.16, 0.65, 10),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  );
  flame.rotation.x = Math.PI / 2;
  flame.position.set(0, 0.65, 1.15);
  root.add(flame);

  // Rider Character
  const jacketMat = new THREE.MeshLambertMaterial({ color: opts.jacketColor });
  const pantsMat = new THREE.MeshLambertMaterial({ color: opts.pantsColor });
  const skinMat = new THREE.MeshLambertMaterial({ color: opts.isBot ? 0xe2e8f0 : 0xd99b66 });
  const hatMat = new THREE.MeshLambertMaterial({ color: opts.hatColor });

  // Torso leaning forward onto handlebars
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.68, 0.34), jacketMat);
  torso.position.set(0, 1.38, 0.08);
  torso.rotation.x = -0.38;
  root.add(torso);

  // Robot Jetpack if Z-Bot
  if (opts.isBot) {
    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.48, 0.24), bikeMat);
    pack.position.set(0, 1.45, 0.32);
    pack.rotation.x = -0.38;
    root.add(pack);
  }

  // Head + Beanie / Visor
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 14, 14), skinMat);
  head.position.set(0, 1.88, -0.14);

  const visor = new THREE.Mesh(
    new THREE.BoxGeometry(0.38, 0.11, 0.16),
    new THREE.MeshBasicMaterial({ color: opts.isBot ? 0x38bdf8 : 0x0f172a })
  );
  visor.position.set(0, 1.89, -0.34);

  const beanie = new THREE.Mesh(new THREE.SphereGeometry(0.26, 14, 10, 0, Math.PI * 2, 0, Math.PI / 1.8), hatMat);
  beanie.position.set(0, 1.94, -0.12);
  beanie.rotation.x = 0.25;

  root.add(head, visor, beanie);

  // Arms gripping handlebars
  [-0.28, 0.28].forEach(xSide => {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.58, 8), jacketMat);
    arm.position.set(xSide, 1.42, -0.24);
    arm.rotation.x = -1.05;
    root.add(arm);

    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.56, 8), pantsMat);
    leg.position.set(xSide * 0.78, 0.86, 0.15);
    leg.rotation.x = 0.35;
    root.add(leg);
  });

  return { group: root, frontWheel: frontWheel, rearWheel: rearWheel, flame: flame };
}

function buildPlayerModel() {
  while (playerGroup.children.length > 0) {
    playerGroup.remove(playerGroup.children.at(0));
  }

  const bike = SHOP_ITEMS.outfits.find(o => o.id === saveData.equippedOutfit) || SHOP_ITEMS.outfits.at(0);
  const rims = SHOP_ITEMS.shoes.find(s => s.id === saveData.equippedShoes) || SHOP_ITEMS.shoes.at(0);

  // Bound to ONE signature character: Red-Jacket Beanie Rider (Ace)
  const assembly = createRacerAssembly({
    bikeColor: bike.color,
    rimColor: rims.color,
    jacketColor: 0xdc2626,
    pantsColor: 0x334155,
    hatColor: 0xf97316,
    isBot: false
  });

  playerFrontWheel = assembly.frontWheel;
  playerRearWheel = assembly.rearWheel;
  playerJetFlame = assembly.flame;
  playerGroup.add(assembly.group);

  // Energy Shield Bubble
  const shieldGeo = new THREE.SphereGeometry(1.55, 18, 18);
  const shieldMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.45 });
  shieldBubble = new THREE.Mesh(shieldGeo, shieldMat);
  shieldBubble.position.y = 1.1;
  shieldBubble.visible = false;
  playerGroup.add(shieldBubble);

  scene.add(playerGroup);
}

function spawnAIRivals() {
  aiRivals.forEach(r => scene.remove(r.group));
  aiRivals = Array.of();

  // Rival 1: Kira on Teal E-Bike
  const kira = createRacerAssembly({
    bikeColor: 0x14b8a6,
    rimColor: 0xfacc15,
    jacketColor: 0x0d9488,
    pantsColor: 0x1e293b,
    hatColor: 0xfacc15,
    isBot: false
  });
  kira.group.position.set(LANES.at(0), 0, -5);
  scene.add(kira.group);
  aiRivals.push({
    name: 'Kira',
    group: kira.group,
    frontWheel: kira.frontWheel,
    rearWheel: kira.rearWheel,
    lane: 0,
    z: -5,
    vy: 0,
    speedOffset: 0.4,
    aiTimer: 1.2
  });

  // Rival 2: Z-Bot on Blue Jet Mini-Moto
  const zbot = createRacerAssembly({
    bikeColor: 0x38bdf8,
    rimColor: 0xf43f5e,
    jacketColor: 0xf8fafc,
    pantsColor: 0x334155,
    hatColor: 0x38bdf8,
    isBot: true
  });
  zbot.group.position.set(LANES.at(2), 0, -9);
  scene.add(zbot.group);
  aiRivals.push({
    name: 'Z-Bot',
    group: zbot.group,
    frontWheel: zbot.frontWheel,
    rearWheel: zbot.rearWheel,
    lane: 2,
    z: -9,
    vy: 0,
    speedOffset: 0.8,
    aiTimer: 0.9
  });
}

function setupCityEnvironment(cityId) {
  const city = CITIES.find(c => c.id === cityId) || CITIES.at(0);
  scene.background = new THREE.Color(city.sky);
  scene.fog = new THREE.Fog(city.sky, 40, 140);

  if (roadMesh) scene.remove(roadMesh);
  if (groundMesh) scene.remove(groundMesh);
  if (sceneryGroup) scene.remove(sceneryGroup);
  if (roadLinesGroup) scene.remove(roadLinesGroup);
  if (weatherParticles) scene.remove(weatherParticles);
  if (finishArch) {
    scene.remove(finishArch);
    finishArch = null;
  }

  // Industrial Steel & Asphalt Track
  roadMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(9.4, 300),
    new THREE.MeshLambertMaterial({ color: city.road })
  );
  roadMesh.rotation.x = -Math.PI / 2;
  roadMesh.position.z = -100;
  scene.add(roadMesh);

  // Hazard-Striped Curbs & Lane Dividers
  roadLinesGroup = new THREE.Group();
  const curbMat = new THREE.MeshLambertMaterial({ color: 0x475569 });
  const leftCurb = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 300), curbMat);
  leftCurb.position.set(-5.3, 0.15, -100);
  const rightCurb = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 300), curbMat);
  rightCurb.position.set(5.3, 0.15, -100);
  roadLinesGroup.add(leftCurb, rightCurb);

  const lineMat = new THREE.MeshBasicMaterial({ color: city.neon });
  for (let z = 10; z > -260; z -= 6) {
    const l1 = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 2.8), lineMat);
    l1.rotation.x = -Math.PI / 2;
    l1.position.set(-1.3, 0.02, z);

    const l2 = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 2.8), lineMat);
    l2.rotation.x = -Math.PI / 2;
    l2.position.set(1.3, 0.02, z);

    roadLinesGroup.add(l1, l2);
  }
  scene.add(roadLinesGroup);

  groundMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(180, 300),
    new THREE.MeshLambertMaterial({ color: city.ground })
  );
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.position.set(0, -0.05, -100);
  scene.add(groundMesh);

  // Industrial Skyline, Gantry Trusses, Neon Signs & Hover Drones
  sceneryGroup = new THREE.Group();
const winMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
const neonMat = new THREE.MeshBasicMaterial({ color: city.neon });
const trussMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
for (let i = 0; i < 36; i++) {
const side = i % 2 === 0 ? -1 : 1;
const propGroup = new THREE.Group();
propGroup.position.z = -i * 8;
const w = 4.5 + Math.random() * 2.5;
const h = 7 + Math.random() * 16;
const d = 5.4;
const bMesh = new THREE.Mesh(
new THREE.BoxGeometry(w, h, d),
new THREE.MeshLambertMaterial({ color: city.building })
);
bMesh.position.set(side * (9.8 + Math.random() * 2.5), h / 2, 0);
propGroup.add(bMesh);
// Glowing Windows
for (let wy = 2.5; wy < h - 1.5; wy += 2.4) {
const win = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.85, d * 0.72), winMat);
win.position.set(bMesh.position.x - side * (w / 2 + 0.02), wy, 0);
propGroup.add(win);
}
// Overhead Industrial Steel Gantries & Neon "BOOST / RUSH" Billboards every 4 blocks
if (i % 4 === 0) {
const pL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 7.5, 0.4), trussMat);
pL.position.set(-5.2, 3.75, 0);
const pR = pL.clone();
pR.position.x = 5.2;
const topBeam = new THREE.Mesh(new THREE.BoxGeometry(11.2, 0.55, 0.55), trussMat);
topBeam.position.set(0, 7.4, 0);
const neonSign = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.95, 0.65), neonMat);
neonSign.position.set(0, 7.4, 0);
propGroup.add(pL, pR, topBeam, neonSign);
}
// Floating Hover Drone along track edge
if (i % 3 === 1) {
const drone = new THREE.Group();
drone.position.set(side * 4.4, 4.2 + (i % 2), 0);
const core = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 10), trussMat);
const eye = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), neonMat);
eye.position.z = 0.28;
const wing = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.06, 0.18), neonMat);
drone.add(core, eye, wing);
propGroup.add(drone);
}
sceneryGroup.add(propGroup);
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
function createFinishLineArch() {
const arch = new THREE.Group();
const postMat = new THREE.MeshLambertMaterial({ color: 0xfacc15 });
const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 6.5, 12), postMat);
p1.position.set(-4.8, 3.25, 0);
const p2 = p1.clone();
p2.position.x = 4.8;
const banner = new THREE.Mesh(
new THREE.BoxGeometry(10.2, 1.4, 0.5),
new THREE.MeshBasicMaterial({ color: 0x10b981 })
);
banner.position.set(0, 6.0, 0);
const lineStrip = new THREE.Mesh(
new THREE.PlaneGeometry(9.2, 1.4),
new THREE.MeshBasicMaterial({ color: 0xf8fafc })
);
lineStrip.rotation.x = -Math.PI / 2;
lineStrip.position.set(0, 0.04, 0);
arch.add(p1, p2, banner, lineStrip);
return arch;
}
let isPlaying = false;
let currentLane = 1;
let velocityY = 0;
let isJumping = false;
let isSliding = false;
let slideTimer = 0;
let spinTimer = 0;
let gameSpeed = 24;
let score = 0;
let distance = 0;
let runCoins = 0;
let runNaira = 0;
let spawnTimer = 0;
let finishSpawned = false;
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
function createObstacleMesh(type) {
const group = new THREE.Group();
if (type === 'ramp') {
// Sloped Yellow & Black Jump Ramp
const rampMat = new THREE.MeshLambertMaterial({ color: 0xfacc15 });
const base = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.95, 3.4), rampMat);
base.position.set(0, 0.35, 0);
base.rotation.x = 0.28;
const stripe = new THREE.Mesh(
new THREE.BoxGeometry(2.14, 0.14, 3.45),
new THREE.MeshBasicMaterial({ color: 0x0f172a })
);
stripe.position.set(0, 0.82, 0);
stripe.rotation.x = 0.28;
group.add(base, stripe);
return { mesh: group, kind: 'ramp' };
} else if (type === 'boost') {
// Glowing Cyan "BOOST ZONE" Floor Pad
const pad = new THREE.Mesh(
new THREE.BoxGeometry(2.1, 0.08, 4.2),
new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
);
pad.position.y = 0.04;
const core = new THREE.Mesh(
new THREE.BoxGeometry(1.3, 0.1, 3.6),
new THREE.MeshBasicMaterial({ color: 0xe0f2fe })
);
core.position.y = 0.05;
group.add(pad, core);
return { mesh: group, kind: 'boost' };
} else if (type === 'spikes') {
// Metallic Floor Spikes (Jump Over)
const plate = new THREE.Mesh(
new THREE.BoxGeometry(2.0,
0.14, 1.4),
new THREE.MeshLambertMaterial({ color: 0x334155 })
);
plate.position.y = 0.07;
group.add(plate);
const spikeMat = new THREE.MeshLambertMaterial({ color: 0xf43f5e });
for (let sx = -0.65; sx <= 0.65; sx += 0.43) {
const cone = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.68, 6), spikeMat);
cone.position.set(sx, 0.42, 0);
group.add(cone);
}
return { mesh: group, kind: 'low' };
} else if (type === 'high') {
// Overhead Laser/Steel Gate (Duck/Slide Under)
const pMat = new THREE.MeshLambertMaterial({ color: 0x475569 });
const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 2.8, 10), pMat);
p1.position.set(-1.05, 1.4, 0);
const p2 = p1.clone();
p2.position.x = 1.05;
const beam = new THREE.Mesh(
new THREE.BoxGeometry(2.3, 0.9, 0.35),
new THREE.MeshLambertMaterial({ color: 0xef4444 })
);
beam.position.y = 2.05;
group.add(p1, p2, beam);
return { mesh: group, kind: 'high' };
} else {
// Striped Orange & White Rush Barrier (Jump Over)
const postMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.95, 8), postMat);
leg1.position.set(-0.85, 0.48, 0);
const leg2 = leg1.clone();
leg2.position.x = 0.85;
const board = new THREE.Mesh(
new THREE.BoxGeometry(1.95, 0.44, 0.18),
new THREE.MeshLambertMaterial({ color: 0xf97316 })
);
board.position.y = 0.72;
const stripe = new THREE.Mesh(
new THREE.BoxGeometry(1.85, 0.15, 0.2),
new THREE.MeshBasicMaterial({ color: 0xf8fafc })
);
stripe.position.y = 0.72;
group.add(leg1, leg2, board, stripe);
return { mesh: group, kind: 'low' };
}
}
function createCollectibleMesh(type) {
const group = new THREE.Group();
if (type === 'coin') {
const outer = new THREE.Mesh(
new THREE.CylinderGeometry(0.45, 0.45, 0.12, 16),
new THREE.MeshLambertMaterial({ color: 0xfacc15 })
);
outer.rotation.x = Math.PI / 2;
const inner = new THREE.Mesh(
new THREE.CylinderGeometry(0.3, 0.3, 0.14, 16),
new THREE.MeshBasicMaterial({ color: 0xfef08a })
);
inner.rotation.x = Math.PI / 2;
group.add(outer, inner);
return group;
}
if (type === 'naira_note') {
const bill = new THREE.Mesh(
new THREE.BoxGeometry(0.95, 0.5, 0.08),
new THREE.MeshLambertMaterial({ color: 0x10b981 })
);
const band = new THREE.Mesh(
new THREE.BoxGeometry(0.25, 0.52, 0.1),
new THREE.MeshBasicMaterial({ color: 0xf8fafc })
);
group.add(bill, band);
return group;
}
if (type === 'shield') {
const ring = new THREE.Mesh(
new THREE.TorusGeometry(0.48, 0.12, 10, 20),
new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
);
const core = new THREE.Mesh(
new THREE.OctahedronGeometry(0.28),
new THREE.MeshBasicMaterial({ color: 0xe0f2fe })
);
group.add(ring, core);
return group;
}
if (type === 'magnet') {
const uShape = new THREE.Mesh(
new THREE.TorusGeometry(0.42, 0.13, 10, 18, Math.PI),
new THREE.MeshLambertMaterial({ color: 0xef4444 })
);
const tip1 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 0.24), new THREE.MeshBasicMaterial({ color: 0xf8fafc }));
tip1.position.set(-0.42, -0.08, 0);
const tip2 = tip1.clone();
tip2.position.x = 0.42;
group.add(uShape, tip1, tip2);
return group;
}
const puColors = { suya: 0xf97316, jollof: 0xef4444, zobo: 0x38bdf8 };
const gem = new THREE.Mesh(
new THREE.OctahedronGeometry(0.52),
new THREE.MeshLambertMaterial({ color: puColors[type] || 0xfacc15 })
);
const halo = new THREE.Mesh(
new THREE.TorusGeometry(0.62, 0.05, 8, 20),
new THREE.MeshBasicMaterial({ color: 0xfef08a })
);
halo.rotation.x = Math.PI / 2;
group.add(gem, halo);
return group;
}
function spawnRow() {
const zPos = -115;
const blockedLane = Math.floor(Math.random() * 3);
const types = Array.of('low', 'spikes', 'high', 'ramp', 'boost');
const chosenType = types.at(Math.floor(Math.random() * types.length));
const obs = createObstacleMesh(chosenType);
obs.mesh.position.set(LANES.at(blockedLane), 0, zPos);
scene.add(obs.mesh);
obstacles.push({ mesh: obs.mesh, kind: obs.kind, lane: blockedLane });
const freeLanes = Array.of(0, 1, 2).filter(l => l !== blockedLane);
const coinLane = freeLanes.at(Math.floor(Math.random() * freeLanes.length));
const roll = Math.random();
if (roll < 0.08) {
const puTypes = Array.of('shield', 'suya', 'magnet', 'jollof', 'zobo', 'shield', 'suya', 'naira_note');
const pu = puTypes.at(Math.floor(Math.random() * puTypes.length));
const mesh = createCollectibleMesh(pu);
mesh.position.set(LANES.at(coinLane), 1.1, zPos);
scene.add(mesh);
collectibles.push({ mesh: mesh, type: pu });
} else if (roll < 0.62) {
for (let i = 0; i < 2; i++) {
const cMesh = createCollectibleMesh('coin');
cMesh.position.set(LANES.at(coinLane), chosenType === 'ramp' ? 2.2 : 0.95, zPos - i * 3.2);
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
playerGroup.scale.y = 0.52;
playSound('slide');
}
function trigger360Spin() {
if (!isPlaying || spinTimer > 0) return;
spinTimer = 0.75;
playSound('spin');
trackMission('spin_3', 1, false);
for (let i = obstacles.length - 1; i >= 0; i--) {
const obs = obstacles.at(i);
if (obs.kind !== 'ramp' && obs.kind !== 'boost' && Math.abs(obs.mesh.position.z - playerGroup.position.z) < 15) {
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
if (e.target.closest('button') || e.target.closest('.overlay') || e.target.closest('#install-screen')) return;
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
function getCurrentRaceRank() {
let rivalsAhead = 0;
aiRivals.forEach(r => {
if (r.z < playerGroup.position.z) rivalsAhead++;
});
return rivalsAhead + 1;
}
function formatRankText(rank) {
return rank === 1 ? '1st/3' : rank === 2 ? '2nd/3' : '3rd/3';
}
function startGame() {
buildPlayerModel();
setupCityEnvironment(saveData.selectedCity);
clearEntities();
spawnAIRivals();
currentLane = 1;
playerGroup.position.set(0, 0, 0);
playerGroup.rotation.set(0, 0, 0);
playerGroup.scale.set(1, 1, 1);
velocityY = 0;
isJumping = false;
isSliding = false;
spinTimer = 0;
finishSpawned = false;
gameSpeed = 24;
score = 0;
distance = 0;
runCoins = 0;
runNaira = 0;
activePowerups = { shield: 0, suya: 0, magnet: 0, jollof: 0, zobo: false };
const cityObj = CITIES.find(c => c.id === saveData.selectedCity) || CITIES.at(0);
document.getElementById('hud-city-badge').textContent = '🏁 ' + cityObj.name;
document.getElementById('hud-zobo-badge').classList.add('hidden');
document.getElementById('btn-revive-ad').classList.remove('hidden');
document.getElementById('btn-revive-naira').classList.remove('hidden');
document.getElementById('main-menu').classList.add('hidden');
document.getElementById('gameover-menu').classList.add('hidden');
document.getElementById('hud').classList.remove('hidden');
isPlaying = true;
}
function handleRaceFinish(rank) {
isPlaying = false;
playSound('powerup');
const prizeCoins = rank === 1 ? 60 : rank === 2 ? 30 : 15;
runCoins += prizeCoins;
score += rank === 1 ? 1000 : rank === 2 ? 500 : 250;
saveData.coins += runCoins;
saveData.naira += runNaira;
if (Math.floor(score) > saveData.highScore) saveData.highScore = Math.floor(score);
trackMission('dist_360', Math.floor(distance), true);
persistSave();
const cityObj = CITIES.find(c => c.id === saveData.selectedCity) || CITIES.at(0);
const placeLabel = rank === 1 ? '🏆 1st PLACE VICTORY!' : rank === 2 ? '🥈 2nd PLACE FINISH!' : '🥉 3rd PLACE FINISH!';
document.getElementById('gameover-title').textContent = placeLabel;
document.getElementById('gameover-city').textContent = 'Track: ' + cityObj.name + ' (+' + prizeCoins + ' Win Bonus)';
document.getElementById('end-score').textContent = Math.floor(score);
document.getElementById('end-dist').textContent = Math.floor(distance) + 'm';
document.getElementById('end-coins').textContent = '+' + runCoins;
document.getElementById('end-naira').textContent = '+' + runNaira;
// Hide revive buttons when race is already finished
document.getElementById('btn-revive-ad').classList.add('hidden');
document.getElementById('btn-revive-naira').classList.add('hidden');
document.getElementById('hud').classList.add('hidden');
document.getElementById('gameover-menu').classList.remove('hidden');
if (typeof showInterstitialAd === 'function') {
showInterstitialAd();
}
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
document.getElementById('gameover-title').textContent = '💥 WIPED OUT!';
document.getElementById('gameover-city').textContent = 'Track: ' + cityObj.name + ' (Pos: ' + formatRankText(getCurrentRaceRank()) + ')';
document.getElementById('end-score').textContent = Math.floor(score);
document.getElementById('end-dist').textContent = Math.floor(distance) + 'm';
document.getElementById('end-coins').textContent = '+' + runCoins;
document.getElementById('end-naira').textContent = '+' + runNaira;
document.getElementById('btn-revive-ad').classList.remove('hidden');
document.getElementById('btn-revive-naira').classList.remove('hidden');
document.getElementById('hud').classList.add('hidden');
document.getElementById('gameover-menu').classList.remove('hidden');
if (typeof showInterstitialAd === 'function') {
showInterstitialAd();
}
}
function updatePowerupHUD() {
const barContainer = document.getElementById('powerup-bars');
barContainer.innerHTML = '';
const list = Array.of(
{ key: 'shield', label: '🛡️ Cyber Shield', max: 5 },
{ key: 'suya', label: '⚡ BOOST ZONE 2x', max: 8 },
{ key: 'magnet', label: '🧲 Coin Magnet', max: 8 },
{ key: 'jollof', label: '🔥 Overdrive Jet', max: 10 }
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
const cityObj = CITIES.find(c => c.id === saveData.selectedCity) || CITIES.at(0);
const speedMult = activePowerups.jollof > 0 ? 1.75 : activePowerups.suya > 0 ? 1.42 : 1.0;
const currentSpeed = gameSpeed * speedMult;
gameSpeed = Math.min(46, gameSpeed + delta * 0.35);
distance += currentSpeed * delta * 0.5;
score += currentSpeed * delta * (activePowerups.suya > 0 ? 4 : 2);
// Spawn Finish Line Arch near end of track
if (!finishSpawned && distance >= cityObj.raceDist - 55) {
finishSpawned = true;
finishArch = createFinishLineArch();
finishArch.position.set(0, 0, -110);
scene.add(finishArch);
}
if (finishArch) {
finishArch.position.z += currentSpeed * delta;
if (finishArch.position.z >= 0) {
handleRaceFinish(getCurrentRaceRank());
return;
}
}
// Player Lane Lean & Wheel Spin
const targetX = LANES.at(currentLane);
playerGroup.position.x += (targetX - playerGroup.position.x) * Math.min(1, delta * 14);
playerGroup.rotation.z = (playerGroup.position.x - targetX) * 0.22;
if (playerFrontWheel && playerRearWheel) {
playerFrontWheel.rotation.x -= currentSpeed * delta * 0.8;
playerRearWheel.rotation.x -= currentSpeed * delta * 0.8;
}
if (playerJetFlame) {
const boostScale = speedMult > 1 ? 1.8 : 0.9 + Math.sin(Date.now() * 0.03) * 0.25;
playerJetFlame.scale.set(1, boostScale, 1);
}
if (isJumping) {
playerGroup.position.y += velocityY * delta;
playerGroup.rotation.x = Math.max(-0.25, Math.min(0.35, velocityY * 0.025));
velocityY -= 38 * delta;
if (playerGroup.position.y <= 0) {
playerGroup.position.y = 0;
playerGroup.rotation.x = 0;
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
}
// Update AI Rivals (Kira & Z-Bot)
aiRivals.forEach(rival => {
rival.aiTimer -= delta;
if (rival.aiTimer <= 0) {
rival.aiTimer = 0.8 + Math.random() * 1.1;
// Dynamic rubber-band speed so rivals stay competitive
rival.speedOffset = (Math.random() - 0.45) * 4.5;
// Switch lanes smartly
const nextLane = Math.floor(Math.random() * 3);
if (nextLane !== currentLane || Math.abs(rival.z) > 4) {
rival.lane = nextLane;
}
}
const rivalSpeed = gameSpeed + rival.speedOffset;
rival.z += (currentSpeed - rivalSpeed) * delta;
rival.z = Math.max(-28, Math.min(8, rival.z));
const rTargetX = LANES.at(rival.lane);
rival.group.position.x += (rTargetX - rival.group.position.x) * Math.min(1, delta * 10);
rival.group.position.z = rival.z;
rival.group.rotation.z = (rival.group.position.x - rTargetX) * 0.2;
rival.frontWheel.rotation.x -= rivalSpeed * delta * 0.8;
rival.rearWheel.rotation.x -= rivalSpeed * delta * 0.8;
// Rival jumps if an obstacle gets close
obstacles.forEach(obs => {
if (obs.lane === rival.lane && Math.abs(obs.mesh.position.z - rival.z) < 4.5 && rival.group.position.y === 0) {
rival.vy = 13.5;
}
});
if (rival.vy !== 0 || rival.group.position.y > 0) {
rival.group.position.y += rival.vy * delta;
rival.vy -= 38 * delta;
if (rival.group.position.y <= 0) {
rival.group.position.y = 0;
rival.vy = 0;
}
}
});
Array.of('shield', 'suya', 'magnet', 'jollof').forEach(k => {
if (activePowerups[k] > 0) activePowerups[k] = Math.max(0, activePowerups[k] - delta);
});
shieldBubble.visible = activePowerups.shield > 0 || activePowerups.jollof > 0;
updatePowerupHUD();
const trailObj = SHOP_ITEMS.trails.find(t => t.id === saveData.equippedTrail);
if (trailObj && trailObj.color && Math.random() < 0.6) {
const tMesh = new THREE.Mesh(
new THREE.SphereGeometry(0.16, 8, 8),
new THREE.MeshBasicMaterial({ color: trailObj.color })
);
tMesh.position.copy(playerGroup.position);
tMesh.position.y += 0.6;
tMesh.position.z += 1.0;
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
if (b.position.z > 15) b.position.z -= 288;
});
roadLinesGroup.children.forEach(line => {
if (line.geometry.type === 'PlaneGeometry') {
line.position.z += currentSpeed * delta;
if (line.position.z > 12) line.position.z -= 270;
}
});
if (weatherParticles) {
weatherParticles.position.z += currentSpeed * delta * 0.6;
if (weatherParticles.position.z > 30) weatherParticles.position.z = 0;
}
spawnTimer -= delta * currentSpeed;
if (spawnTimer <= 0 && !finishSpawned) {
spawnRow();
spawnTimer = 24;
}
for (let i = obstacles.length - 1; i >= 0; i--) {
const obs = obstacles.at(i);
obs.mesh.position.z += currentSpeed * delta;
const dz = Math.abs(obs.mesh.position.z - playerGroup.position.z);
const dx = Math.abs(obs.mesh.position.x - playerGroup.position.x);
if (dx < 0.95 && dz < 1.55) {
if (obs.kind === 'ramp') {
if (!isJumping) {
isJumping = true;
isSliding = false;
playerGroup.scale.y = 1;
velocityY = 17.5;
score += 75;
playSound('jump');
trackMission('jumps_20', 1, false);
}
continue;
}
if (obs.kind === 'boost') {
if (activePowerups.suya < 3.0) {
activePowerups.suya = 3.5;
score += 60;
playSound('powerup');
}
continue;
}
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
document.getElementById('hud-pos').textContent = formatRankText(getCurrentRaceRank());
document.getElementById('hud-score-badge').textContent = 'SCORE: ' + Math.floor(score);
document.getElementById('hud-dist').textContent = Math.floor(distance) + '/' + cityObj.raceDist + 'm';
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
alert('You need 5 Naira Notes to continue!');
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


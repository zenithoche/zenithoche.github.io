import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const canvas = document.getElementById("world");
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  powerPreference: "high-performance"
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050506);
scene.fog = new THREE.FogExp2(0x050506, 0.068);

const camera = new THREE.PerspectiveCamera(37, window.innerWidth / window.innerHeight, 0.1, 60);
camera.position.set(0, 0.1, 7.8);

const world = new THREE.Group();
scene.add(world);

const ambient = new THREE.HemisphereLight(0xe7dfd8, 0x16080d, 1.55);
scene.add(ambient);

const key = new THREE.PointLight(0xe1b2aa, 26, 16, 1.8);
key.position.set(3.2, 2.2, 4.1);
scene.add(key);

const rim = new THREE.PointLight(0x8f3048, 20, 15, 2);
rim.position.set(-3.5, -1.7, -2.5);
scene.add(rim);

const cold = new THREE.PointLight(0xb7c2d6, 8, 12, 2);
cold.position.set(0.5, 4.5, -3);
scene.add(cold);

const petalMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xc7aba8,
  roughness: 0.31,
  metalness: 0.34,
  transmission: 0.08,
  thickness: 0.6,
  clearcoat: 0.62,
  clearcoatRoughness: 0.26,
  emissive: 0x34131c,
  emissiveIntensity: 0.2,
  side: THREE.DoubleSide
});

const petalDarkMaterial = petalMaterial.clone();
petalDarkMaterial.color = new THREE.Color(0x6f4650);
petalDarkMaterial.emissive = new THREE.Color(0x1f0910);

function petalGeometry(scale = 1) {
  const geo = new THREE.SphereGeometry(1, 40, 28);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const t = Math.abs(y);
    const taper = 0.22 + 0.78 * Math.pow(Math.max(0, 1 - t), 0.58);
    pos.setXYZ(i, x * taper * 0.72 * scale, y * 1.48 * scale, z * 0.17 * scale);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

const lotus = new THREE.Group();
world.add(lotus);

const petalSets = [];

function addPetalRing(count, radius, y, tilt, scale, material, phase = 0) {
  const set = [];
  const geo = petalGeometry(scale);
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + phase;
    const pivot = new THREE.Group();
    pivot.rotation.y = a;
    pivot.position.y = y;

    const mesh = new THREE.Mesh(geo, material);
    mesh.position.set(radius, 0, 0);
    mesh.rotation.set(0, 0, Math.PI / 2 - tilt);
    mesh.castShadow = false;
    mesh.receiveShadow = false;

    pivot.add(mesh);
    lotus.add(pivot);

    set.push({ pivot, mesh, a, tilt, radius });
  }
  petalSets.push(set);
}

addPetalRing(12, 1.46, -0.35, 0.30, 0.96, petalDarkMaterial, 0.13);
addPetalRing(10, 1.05, -0.02, 0.62, 0.83, petalMaterial, 0.0);
addPetalRing(8, 0.67, 0.26, 0.92, 0.66, petalMaterial, 0.2);

const core = new THREE.Mesh(
  new THREE.IcosahedronGeometry(0.54, 4),
  new THREE.MeshPhysicalMaterial({
    color: 0xeadbd3,
    roughness: 0.22,
    metalness: 0.18,
    transmission: 0.12,
    clearcoat: 0.8,
    emissive: 0x5b2030,
    emissiveIntensity: 0.35
  })
);
lotus.add(core);

const coreWire = new THREE.Mesh(
  new THREE.IcosahedronGeometry(0.76, 2),
  new THREE.MeshBasicMaterial({
    color: 0xd3aaa3,
    wireframe: true,
    transparent: true,
    opacity: 0.11
  })
);
lotus.add(coreWire);

const ringMaterial = new THREE.MeshBasicMaterial({
  color: 0xd7aaa4,
  transparent: true,
  opacity: 0.17
});

for (const [radius, rotX, rotZ] of [
  [2.35, 1.18, 0.18],
  [2.78, 0.78, -0.68],
  [3.16, 1.42, 0.92]
]) {
  const torus = new THREE.Mesh(
    new THREE.TorusGeometry(radius, 0.008, 8, 180),
    ringMaterial.clone()
  );
  torus.rotation.x = rotX;
  torus.rotation.z = rotZ;
  lotus.add(torus);
}

const starCount = window.innerWidth < 700 ? 480 : 1100;
const starGeo = new THREE.BufferGeometry();
const starPos = new Float32Array(starCount * 3);

for (let i = 0; i < starCount; i++) {
  const radius = 4 + Math.random() * 13;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  starPos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
  starPos[i * 3 + 1] = radius * Math.cos(phi) * 0.7;
  starPos[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
}

starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
const stars = new THREE.Points(
  starGeo,
  new THREE.PointsMaterial({
    color: 0xe8ddd7,
    size: 0.018,
    transparent: true,
    opacity: 0.44,
    depthWrite: false
  })
);
world.add(stars);

const halo = new THREE.Mesh(
  new THREE.TorusGeometry(4.25, 0.018, 8, 220),
  new THREE.MeshBasicMaterial({
    color: 0xa15363,
    transparent: true,
    opacity: 0.12
  })
);
halo.rotation.x = 1.5;
halo.rotation.y = 0.32;
world.add(halo);

let mouseX = 0;
let mouseY = 0;
let targetMouseX = 0;
let targetMouseY = 0;
let scrollProgress = 0;
let activeChapter = 0;
let lastTime = performance.now();

window.addEventListener("pointermove", (event) => {
  targetMouseX = (event.clientX / window.innerWidth - 0.5) * 2;
  targetMouseY = (event.clientY / window.innerHeight - 0.5) * 2;
});

function updateScroll() {
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  scrollProgress = Math.min(1, Math.max(0, window.scrollY / max));
}

window.addEventListener("scroll", updateScroll, { passive: true });
updateScroll();

const chapters = [...document.querySelectorAll(".chapter")];
const chapterDots = [...document.querySelectorAll(".chapter-index span")];

const observer = new IntersectionObserver((entries) => {
  const visible = entries
    .filter(entry => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

  if (!visible.length) return;

  chapters.forEach(ch => ch.classList.remove("is-active"));
  const current = visible[0].target;
  current.classList.add("is-active");
  activeChapter = Number(current.dataset.chapter || 0);

  chapterDots.forEach((dot, i) => {
    dot.classList.toggle("active", i === activeChapter);
  });
}, {
  rootMargin: "-24% 0px -24% 0px",
  threshold: [0.08, 0.22, 0.42, 0.62]
});

chapters.forEach(ch => observer.observe(ch));
chapters[0]?.classList.add("is-active");

function chapterLocalProgress(index) {
  const el = chapters[index];
  if (!el) return 0;
  const rect = el.getBoundingClientRect();
  const total = rect.height + window.innerHeight;
  return Math.min(1, Math.max(0, (window.innerHeight - rect.top) / total));
}

function animate(time) {
  const dt = Math.min(0.05, (time - lastTime) / 1000);
  lastTime = time;

  mouseX += (targetMouseX - mouseX) * 0.035;
  mouseY += (targetMouseY - mouseY) * 0.035;

  const p = scrollProgress;
  const heroP = chapterLocalProgress(0);
  const craftP = chapterLocalProgress(3);

  const cameraAngle = -0.22 + p * Math.PI * 1.72;
  const cameraRadius = 7.7 - Math.sin(p * Math.PI) * 0.85;

  camera.position.x = Math.sin(cameraAngle) * cameraRadius + mouseX * 0.23;
  camera.position.z = Math.cos(cameraAngle) * cameraRadius;
  camera.position.y = 0.25 + Math.sin(p * Math.PI * 3.2) * 0.78 - mouseY * 0.18;

  const focusY =
    activeChapter === 3 ? 0.18 :
    activeChapter === 4 ? -0.15 :
    0;

  camera.lookAt(0, focusY, 0);

  lotus.rotation.y += dt * 0.11;
  lotus.rotation.z = Math.sin(time * 0.00023) * 0.08 + mouseX * 0.035;
  lotus.rotation.x = -0.10 + mouseY * 0.045;
  lotus.position.y = Math.sin(time * 0.00055) * 0.08;

  const chapterPulse = 0.92 + activeChapter * 0.035;
  lotus.scale.lerp(new THREE.Vector3(chapterPulse, chapterPulse, chapterPulse), 0.025);

  petalSets.forEach((set, layerIndex) => {
    set.forEach((item, i) => {
      const wave = Math.sin(time * 0.00075 + i * 0.7 + layerIndex) * 0.05;
      const opening = 0.14 + heroP * 0.16 + Math.sin(craftP * Math.PI) * 0.08;
      item.mesh.rotation.z = Math.PI / 2 - item.tilt - opening - wave;
      item.mesh.position.x = item.radius + Math.sin(time * 0.00045 + i) * 0.025;
    });
  });

  core.rotation.x += dt * 0.16;
  core.rotation.y += dt * 0.22;
  coreWire.rotation.x -= dt * 0.11;
  coreWire.rotation.z += dt * 0.14;

  stars.rotation.y += dt * 0.005;
  stars.rotation.x = mouseY * 0.012;

  halo.rotation.z += dt * 0.028;

  key.position.x = 3.2 + Math.sin(time * 0.00032) * 1.6;
  key.position.y = 2.2 + Math.cos(time * 0.00027) * 0.8;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width, height, false);
}

window.addEventListener("resize", resize);

if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  targetMouseX = 0;
  targetMouseY = 0;
}

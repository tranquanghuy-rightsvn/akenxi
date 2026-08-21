/**
 * Hero 3D — tai nghe Headphone.glb (màu đen, dựng dọc tự nhiên) ở bên phải hero.
 * Trang cuộn bình thường; mô hình chỉ chuyển động/xoay theo tiến độ cuộn cho bắt mắt.
 */

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const canvas = document.getElementById("headphoneCanvas");
const loaderEl = document.getElementById("modelLoader");
const loaderBar = document.getElementById("loaderBar");
const loaderText = document.getElementById("loaderText");

const SPIN_PER_VIEWPORT = Math.PI * 1.15; // góc xoay thêm mỗi lần cuộn hết 1 viewport
const BASE_Y = 0.02; // gần như căn giữa theo chiều dọc — hero giờ là banner rộng, không còn bóng đổ CSS cần chừa chỗ
const BASE_ROT_Y = -Math.PI / 6; // góc mặc định: quay 30° quanh trục thẳng đứng (chiều ngược lại)
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------- Renderer -------------------------------- */

const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
camera.position.set(0, 0, 5);

/* -------------------------- Ánh sáng / môi trường ------------------------- */

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 1.15; // studio sáng, nền trắng

// Ánh sáng trung tính kiểu ảnh sản phẩm: key trên trước, fill dưới trái, rim sau
const key = new THREE.DirectionalLight(0xffffff, 2.4);
key.position.set(2.5, 4.5, 4);
scene.add(key);

const fill = new THREE.DirectionalLight(0xffffff, 1.2);
fill.position.set(-3.5, -2, 3);
scene.add(fill);

const rim = new THREE.DirectionalLight(0xffffff, 1.6);
rim.position.set(-3.5, 2.5, -3.5);
scene.add(rim);

scene.add(new THREE.AmbientLight(0xffffff, 0.55));

/* --------------------------------- Model --------------------------------- */

const pivot = new THREE.Group(); // xoay quanh tâm mô hình
scene.add(pivot);

// Vật liệu đen theo từng bộ phận (tên mesh lấy từ file GLB)
const BLACK_PARTS = [
  { match: /rubber|đệm/i, color: 0x0d0f13, roughness: 0.92, metalness: 0.0 },
  { match: /band|holder|plastic/i, color: 0x191c23, roughness: 0.42, metalness: 0.3 },
];
const DEFAULT_BLACK = { color: 0x22262f, roughness: 0.28, metalness: 0.75 };

function paintBlack(object) {
  object.traverse((child) => {
    if (!child.isMesh || !child.material) return;

    const name = `${child.name} ${child.material.name || ""}`;
    const preset = BLACK_PARTS.find((p) => p.match.test(name)) || DEFAULT_BLACK;

    const mat = child.material.clone();
    mat.color = new THREE.Color(preset.color);
    mat.roughness = preset.roughness;
    mat.metalness = preset.metalness;
    if ("sheen" in mat) mat.sheen = 0;
    if ("transmission" in mat) mat.transmission = 0; // bỏ hiệu ứng trong suốt của bản gốc
    mat.envMapIntensity = 1.15;
    child.material = mat;
  });
}

new GLTFLoader().load(
  "models/Headphone.glb",
  (gltf) => {
    const model = gltf.scene;
    paintBlack(model);

    // Dựng đứng tự nhiên: trục cao của model là Z, quay -90° quanh X để Z -> lên trên
    const stand = new THREE.Group();
    stand.rotation.x = -Math.PI / 2;
    stand.add(model);

    // Chuẩn hoá: căn tâm về gốc toạ độ và scale vừa khung hình
    const box = new THREE.Box3().setFromObject(stand);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const scale = 3.0 / Math.max(size.x, size.y, size.z);

    stand.position.sub(center);
    stand.scale.setScalar(scale);
    stand.position.multiplyScalar(scale);

    pivot.add(stand);
    pivot.rotation.set(0.06, BASE_ROT_Y, 0);

    loaderEl.classList.add("is-hidden");
    resize();
  },
  (event) => {
    if (!event.total) return;
    const pct = Math.round((event.loaded / event.total) * 100);
    loaderBar.style.width = pct + "%";
    loaderText.textContent = `Đang tải mô hình 3D… ${pct}%`;
  },
  () => {
    loaderText.textContent = "Không tải được mô hình 3D.";
    loaderBar.style.width = "100%";
  }
);

/* --------------------------------- Resize -------------------------------- */

function resize() {
  const rect = canvas.getBoundingClientRect();
  const w = rect.width || 1;
  const h = rect.height || 1;

  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  // Canvas nằm trong ô lưới riêng (.hero-brand-model, xem css/style.css) nên luôn có
  // tỉ lệ gần vuông ở mọi kích thước desktop — không cần công thức bù trừ theo tay.
  camera.position.z = camera.aspect < 1 ? 6.2 : 5.1;
  camera.updateProjectionMatrix();
}

window.addEventListener("resize", resize);
resize();

/* --------------------- Cuộn trang => mô hình chuyển động ------------------ */

let scrollY = window.scrollY;

function readScroll() {
  scrollY = window.scrollY;
}

window.addEventListener("scroll", readScroll, { passive: true });
readScroll();

/* -------------------------------- Render loop ----------------------------- */
/* Không còn kéo chuột để xoay thêm — canvas để pointerdown/move/up nổi bọt tự
   nhiên lên #heroSlider, nơi js/hero.js dùng chính các sự kiện đó để đổi
   campaign bằng kéo/vuốt (áp dụng cho mọi kích thước màn hình, không riêng
   mobile). Model vẫn tự xoay theo cuộn trang như cũ. */

const current = { y: BASE_ROT_Y, x: 0.06 };
const clock = new THREE.Clock();

function animate() {
  const t = clock.getElapsedTime();
  const progress = scrollY / Math.max(window.innerHeight, 1); // 1 = đã cuộn 1 viewport

  const targetY = BASE_ROT_Y + progress * SPIN_PER_VIEWPORT;
  const targetX = 0.06 + Math.sin(progress * 1.6) * 0.16;

  // lerp cho mượt, không giật theo từng bước cuộn
  const ease = reduceMotion ? 1 : 0.085;
  current.y += (targetY - current.y) * ease;
  current.x += (targetX - current.x) * ease;

  pivot.rotation.y = current.y;
  pivot.rotation.x = current.x;
  pivot.rotation.z = reduceMotion ? 0 : Math.sin(t * 0.4) * 0.03;
  // nâng nhẹ mô hình để chừa chỗ cho bóng đổ CSS phía dưới
  pivot.position.y = BASE_Y + (reduceMotion ? 0 : Math.sin(t * 0.85) * 0.045);

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

// Chỉ render khi hero còn trong viewport
const hero = document.querySelector(".hero");
if ("IntersectionObserver" in window && hero) {
  new IntersectionObserver(
    ([entry]) => renderer.setAnimationLoop(entry.isIntersecting ? animate : null),
    { threshold: 0 }
  ).observe(hero);
}

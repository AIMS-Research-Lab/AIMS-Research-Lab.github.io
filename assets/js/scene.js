/* =========================================================
   AIMS Research Lab — hero scene (Three.js)
   A sheet of cubes arranged as a "rotating squares" lattice:
   neighbouring cubes counter-rotate, so the whole sheet grows
   in both directions at once (negative Poisson's ratio).
   Floating cubes drift around it.
   Usage: <canvas class="scene-canvas" data-scene="home|page">
   ========================================================= */
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const canvas = document.querySelector("canvas[data-scene]");
if (canvas) init(canvas);

function init(canvas) {
  const host = canvas.parentElement;
  const mode = canvas.dataset.scene === "home" ? "home" : "page";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
  } catch (e) {
    return; // no WebGL — the gradient background still looks fine
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xe6f8f6, 22, 46);
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 26);

  const hemi = new THREE.HemisphereLight(0xf4fffc, 0x2f86de, 1.5);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 2.0);
  key.position.set(6, 10, 12);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x8ff0d4, 1.2);
  rim.position.set(-10, -6, 4);
  scene.add(rim);

  // Light / dark palettes for fog and lighting (cube colours stay the same)
  const THEMES = {
    light: { fog: 0xe6f8f6, sky: 0xf4fffc, ground: 0x2f86de, hemi: 1.5, key: 2.0, rim: 1.2 },
    dark: { fog: 0x071416, sky: 0xbff6ea, ground: 0x0b2e4a, hemi: 1.05, key: 1.6, rim: 1.6 },
  };
  function applyTheme() {
    const t = THEMES[document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light"];
    scene.fog.color.setHex(t.fog);
    hemi.color.setHex(t.sky);
    hemi.groundColor.setHex(t.ground);
    hemi.intensity = t.hemi;
    key.intensity = t.key;
    rim.intensity = t.rim;
  }
  applyTheme();

  const geo = new THREE.BoxGeometry(1, 1, 1);
  const solid = new THREE.MeshStandardMaterial({ roughness: 0.3, metalness: 0.05 });
  const glass = new THREE.MeshStandardMaterial({ roughness: 0.25, metalness: 0.05, transparent: true, opacity: 0.78 });

  const C = [new THREE.Color("#b2f0cb"), new THREE.Color("#5fd6dc"), new THREE.Color("#3a8fe2")];
  const tmpColor = new THREE.Color();
  function gradient(t) {
    t = Math.min(1, Math.max(0, t));
    return t < 0.5 ? tmpColor.copy(C[0]).lerp(C[1], t * 2) : tmpColor.copy(C[1]).lerp(C[2], (t - 0.5) * 2);
  }
  const rand = (a, b) => a + Math.random() * (b - a);

  /* ---- Auxetic sheet ---- */
  const N = mode === "home" ? 9 : 6;
  const sheet = new THREE.InstancedMesh(geo, solid, N * N);
  const sheetGroup = new THREE.Group();
  sheetGroup.add(sheet);
  scene.add(sheetGroup);

  const cells = [];
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const k = cells.length;
      cells.push({
        i: i - (N - 1) / 2,
        j: j - (N - 1) / 2,
        s: (i + j) % 2 ? 1 : -1,
        from: new THREE.Vector3(rand(-18, 18), rand(-14, 14), rand(-14, 6)),
        fromRot: new THREE.Euler(rand(0, 6), rand(0, 6), rand(0, 6)),
        delay: (i + j) / (2 * N) + rand(0, 0.4),
      });
      sheet.setColorAt(k, gradient((i + (N - 1 - j)) / (2 * (N - 1)) + rand(-0.08, 0.08)));
    }
  }

  /* ---- Floating cubes ---- */
  const M = mode === "home" ? 130 : 60;
  const dust = new THREE.InstancedMesh(geo, glass, M);
  const dustGroup = new THREE.Group();
  dustGroup.add(dust);
  scene.add(dustGroup);
  const bits = [];
  for (let k = 0; k < M; k++) {
    const r = Math.random();
    bits.push({
      p: new THREE.Vector3(rand(-20, 20), rand(-13, 13), rand(-16, 5)),
      size: 0.25 + r * r * 0.85,
      rot: new THREE.Vector3(rand(0, 6), rand(0, 6), rand(0, 6)),
      spin: new THREE.Vector3(rand(-0.3, 0.3), rand(-0.3, 0.3), rand(-0.3, 0.3)),
      phase: rand(0, Math.PI * 2),
      amp: rand(0.2, 0.7),
    });
    dust.setColorAt(k, gradient(Math.pow(Math.random(), 1.6)));
  }

  /* ---- Layout ---- */
  const base = new THREE.Euler(-0.55, 0.5, 0.62);
  function layout() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const wide = camera.aspect > 1.1;
    if (mode === "home") {
      sheetGroup.position.set(wide ? 3.4 : 0.5, wide ? -1.4 : -2.2, 0);
      sheetGroup.scale.setScalar(wide ? 1 : 0.7);
    } else {
      sheetGroup.position.set(wide ? 4 + camera.aspect * 2.2 : 2.5, wide ? 1.2 : 3.2, -2);
      sheetGroup.scale.setScalar(wide ? 0.95 : 0.6);
    }
  }

  /* ---- Interaction ---- */
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  window.addEventListener("pointermove", (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  let visible = true;
  new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    if (visible && !reduced) loop();
  }).observe(host);

  const dummy = new THREE.Object3D();
  const ease = (t) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

  function draw(time) {
    // auxetic opening angle (rad); 0 = closed tiling, ~0.6 = wide open
    const theta = reduced ? 0.38 : 0.32 + 0.27 * Math.sin(time * 0.5 - 1.2);
    const d = Math.cos(theta) + Math.sin(theta); // centre spacing of rotating squares

    for (let k = 0; k < cells.length; k++) {
      const c = cells[k];
      const p = reduced ? 1 : ease((time - 0.2 - c.delay) / 1.8);
      const z = Math.sin(time * 0.8 + c.i * 0.45 + c.j * 0.3) * 0.18;
      dummy.position.set(c.i * d, c.j * d, z).lerp(c.from, 1 - p);
      dummy.rotation.set(c.fromRot.x * (1 - p), c.fromRot.y * (1 - p), c.s * theta * p + c.fromRot.z * (1 - p));
      dummy.scale.setScalar(0.95);
      dummy.updateMatrix();
      sheet.setMatrixAt(k, dummy.matrix);
    }
    sheet.instanceMatrix.needsUpdate = true;

    for (let k = 0; k < bits.length; k++) {
      const b = bits[k];
      dummy.position.set(b.p.x, b.p.y + Math.sin(time * 0.6 + b.phase) * b.amp, b.p.z);
      dummy.rotation.set(b.rot.x + b.spin.x * time, b.rot.y + b.spin.y * time, b.rot.z + b.spin.z * time);
      dummy.scale.setScalar(b.size);
      dummy.updateMatrix();
      dust.setMatrixAt(k, dummy.matrix);
    }
    dust.instanceMatrix.needsUpdate = true;

    mouse.sx += (mouse.x - mouse.sx) * 0.04;
    mouse.sy += (mouse.y - mouse.sy) * 0.04;
    const scroll = Math.min(1.5, window.scrollY / Math.max(1, host.clientHeight));
    sheetGroup.rotation.set(
      base.x + mouse.sy * 0.18 - scroll * 0.35,
      base.y + Math.sin(time * 0.12) * 0.3 + mouse.sx * 0.3,
      base.z + scroll * 0.2
    );
    dustGroup.position.set(-mouse.sx * 0.6, mouse.sy * 0.4 + scroll * 5, 0);
    dustGroup.rotation.y = time * 0.015;

    renderer.render(scene, camera);
  }

  let raf = 0;
  const t0 = performance.now();
  function loop() {
    cancelAnimationFrame(raf);
    const tick = (now) => {
      if (!visible) return;
      draw((now - t0) / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }

  layout();
  new ResizeObserver(() => {
    layout();
    if (reduced) draw(0);
  }).observe(host);

  new MutationObserver(() => {
    applyTheme();
    if (reduced) draw(0);
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  if (reduced) draw(0);
  else loop();
  requestAnimationFrame(() => canvas.classList.add("is-ready"));
}

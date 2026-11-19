/* =========================================================
   AIMS Research Lab: background scenes (Three.js)
   ---------------------------------------------------------
   Every page gets its own cube-built animation inspired by
   AI for Science & Engineering. Choose one per page with:

     <canvas class="scene-canvas" data-scene="home|page" data-anim="NAME">

   NAME                 idea
   auxetic  (default)   rotating-squares lattice that grows in both directions
   waves                interference of two sources: a PDE solution field
   orbits               people circling shared ideas on Kepler orbits
   layers               neural-network layers with a signal flowing through
   stream               3D waterfall of a live signal: new data keeps arriving
   flock                agent-based swarm (separation, alignment, cohesion)
   modes                Fourier modes that add up to one signal
   ripple               concentric wavefronts spreading from a source

   data-scene sets placement: "home" = large, hero; "page" = to the right.
   ========================================================= */
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

/* ---------- helpers ---------- */
const rand = (a, b) => a + Math.random() * (b - a);
const clamp01 = (t) => Math.min(1, Math.max(0, t));
const ease = (t) => 1 - Math.pow(1 - clamp01(t), 3);

const PALETTE = [new THREE.Color("#b2f0cb"), new THREE.Color("#5fd6dc"), new THREE.Color("#3a8fe2")];
function gradient(t, out = new THREE.Color()) {
  t = clamp01(t);
  return t < 0.5 ? out.copy(PALETTE[0]).lerp(PALETTE[1], t * 2) : out.copy(PALETTE[1]).lerp(PALETTE[2], (t - 0.5) * 2);
}

function makeCubes(ctx, n) {
  const mesh = new THREE.InstancedMesh(ctx.geo, ctx.solid, n);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const c = new THREE.Color();
  for (let k = 0; k < n; k++) mesh.setColorAt(k, c.set(0xffffff));
  return mesh;
}

/** write one instance transform */
function put(ctx, mesh, k, x, y, z, rx, ry, rz, sx, sy = sx, sz = sx) {
  const d = ctx.dummy;
  d.position.set(x, y, z);
  d.rotation.set(rx, ry, rz);
  d.scale.set(sx, sy, sz);
  d.updateMatrix();
  mesh.setMatrixAt(k, d.matrix);
}

function lines(ctx, positions) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  return new THREE.LineSegments(g, ctx.lineMat);
}

/* =========================================================
   Scene builders: each returns { object, update(time, dt) }
   Objects are ~9 units across, centred on the origin.
   ========================================================= */
const BUILDERS = {
  /* Rotating squares: neighbours counter-rotate, sheet expands in x AND y */
  auxetic(ctx) {
    const N = ctx.mode === "home" ? 9 : 7;
    const mesh = makeCubes(ctx, N * N);
    const cells = [];
    const col = new THREE.Color();
    for (let i = 0; i < N; i++)
      for (let j = 0; j < N; j++) {
        cells.push({
          i: i - (N - 1) / 2, j: j - (N - 1) / 2, s: (i + j) % 2 ? 1 : -1,
          from: new THREE.Vector3(rand(-18, 18), rand(-14, 14), rand(-14, 6)),
          fromRot: new THREE.Euler(rand(0, 6), rand(0, 6), rand(0, 6)),
          delay: (i + j) / (2 * N) + rand(0, 0.4),
        });
        mesh.setColorAt(cells.length - 1, gradient((i + (N - 1 - j)) / (2 * (N - 1)) + rand(-0.08, 0.08), col));
      }
    const g = new THREE.Group();
    g.add(mesh);
    g.rotation.set(-0.55, 0.5, 0.62);
    const P = new THREE.Vector3();
    return {
      object: g,
      update(t) {
        const theta = ctx.reduced ? 0.38 : 0.32 + 0.27 * Math.sin(t * 0.5 - 1.2);
        const d = Math.cos(theta) + Math.sin(theta);
        cells.forEach((c, k) => {
          const p = ctx.reduced ? 1 : ease((t - 0.2 - c.delay) / 1.8);
          P.set(c.i * d, c.j * d, Math.sin(t * 0.8 + c.i * 0.45 + c.j * 0.3) * 0.18).lerp(c.from, 1 - p);
          put(ctx, mesh, k, P.x, P.y, P.z, c.fromRot.x * (1 - p), c.fromRot.y * (1 - p), c.s * theta * p + c.fromRot.z * (1 - p), 0.95);
        });
        mesh.instanceMatrix.needsUpdate = true;
        g.rotation.y = 0.5 + Math.sin(t * 0.12) * 0.3;
      },
    };
  },

  /* Two point sources interfering: a living solution of the wave equation */
  waves(ctx) {
    const G = 17, sp = 0.52, n = G * G;
    const mesh = makeCubes(ctx, n);
    const g = new THREE.Group();
    g.add(mesh);
    g.rotation.set(-1.0, 0, 0.55);
    const src = [[-2.1, -1.6], [2.2, 1.9]];
    const col = new THREE.Color();
    return {
      object: g,
      update(t) {
        let k = 0;
        for (let i = 0; i < G; i++)
          for (let j = 0; j < G; j++, k++) {
            const x = (i - (G - 1) / 2) * sp, y = (j - (G - 1) / 2) * sp;
            let h = 0;
            for (const [sx, sy] of src) {
              const r = Math.hypot(x - sx, y - sy);
              h += Math.sin(2.3 * r - 2.0 * t) / (1 + 0.3 * r);
            }
            put(ctx, mesh, k, x, y, h * 0.75, 0, 0, 0, 0.4, 0.4, 0.4 + Math.abs(h) * 0.35);
            mesh.setColorAt(k, gradient(0.5 + h * 0.38, col));
          }
        mesh.instanceMatrix.needsUpdate = true;
        mesh.instanceColor.needsUpdate = true;
        g.rotation.z = 0.55 + t * 0.04;
      },
    };
  },

  /* Orbits: people circling shared ideas, inner orbits faster (Kepler: ω ∝ r^-1.5) */
  orbits(ctx) {
    const radii = [1.9, 2.7, 3.5, 4.3, 5.1], counts = [4, 6, 8, 10, 12];
    const tilts = [[0.15, 1, 0.1], [-0.75, 1, 0.25], [0.6, 1, -0.55], [-0.25, 1, -0.95], [0.95, 1, 0.4]];
    const orbits = radii.map((r, i) => {
      // tilted orbital plane: orthonormal basis (u, v)
      const n = new THREE.Vector3(...tilts[i]).normalize();
      const u = new THREE.Vector3(1, 0, 0).cross(n).normalize();
      const v = new THREE.Vector3().crossVectors(n, u);
      return { r, u, v, w: 0.9 * Math.pow(r / radii[0], -1.5), count: counts[i], phase: rand(0, 6) };
    });
    const total = counts.reduce((a, b) => a + b, 0);
    const core = 8;
    const mesh = makeCubes(ctx, total + core);
    // faint orbit paths
    const seg = [], SEGS = 96;
    orbits.forEach((o) => {
      for (let s = 0; s < SEGS; s++) {
        const a0 = (s / SEGS) * Math.PI * 2, a1 = ((s + 1) / SEGS) * Math.PI * 2;
        const p0 = o.u.clone().multiplyScalar(Math.cos(a0) * o.r).addScaledVector(o.v, Math.sin(a0) * o.r);
        const p1 = o.u.clone().multiplyScalar(Math.cos(a1) * o.r).addScaledVector(o.v, Math.sin(a1) * o.r);
        seg.push(...p0.toArray(), ...p1.toArray());
      }
    });
    const col = new THREE.Color();
    let k = 0;
    orbits.forEach((o, i) => { for (let j = 0; j < o.count; j++) mesh.setColorAt(k++, gradient(i / (radii.length - 1) + rand(-0.08, 0.08), col)); });
    for (let c = 0; c < core; c++) mesh.setColorAt(total + c, col.copy(ctx.accent));
    const g = new THREE.Group();
    g.add(mesh, lines(ctx, seg));
    const P = new THREE.Vector3();
    return {
      object: g,
      update(t) {
        let k = 0;
        orbits.forEach((o) => {
          for (let j = 0; j < o.count; j++, k++) {
            const a = o.phase + (j / o.count) * Math.PI * 2 + t * o.w * 0.35;
            P.copy(o.u).multiplyScalar(Math.cos(a) * o.r).addScaledVector(o.v, Math.sin(a) * o.r);
            put(ctx, mesh, k, P.x, P.y, P.z, t * 0.6 + j, t * 0.4 + k, 0, 0.36);
          }
        });
        // core: a 2×2×2 block that gently breathes and turns
        const gap = 0.36 + 0.06 * Math.sin(t * 1.2);
        for (let c = 0; c < core; c++) {
          const x = c & 1 ? gap : -gap, y = c & 2 ? gap : -gap, z = c & 4 ? gap : -gap;
          P.set(x, y, z).applyAxisAngle(new THREE.Vector3(0, 1, 0), t * 0.4);
          put(ctx, mesh, total + c, P.x, P.y, P.z, 0, t * 0.4, 0, 0.62);
        }
        mesh.instanceMatrix.needsUpdate = true;
        g.rotation.set(0.75, t * 0.06, 0.15);
      },
      onTheme() {
        for (let c = 0; c < core; c++) mesh.setColorAt(total + c, ctx.accent);
        mesh.instanceColor.needsUpdate = true;
      },
    };
  },

  /* Neural network: layers of units, an activation wave flows left to right */
  layers(ctx) {
    const sizes = [3, 4, 4, 3, 2], gapX = 2.1, gapU = 0.78, L = sizes.length;
    const units = [];
    sizes.forEach((s, l) => {
      for (let a = 0; a < s; a++)
        for (let b = 0; b < s; b++)
          units.push({ l, p: new THREE.Vector3((l - (L - 1) / 2) * gapX, (a - (s - 1) / 2) * gapU, (b - (s - 1) / 2) * gapU), w: rand(0.35, 1), base: gradient(l / (L - 1) + rand(-0.1, 0.1)) });
    });
    const seg = [];
    units.forEach((u) => units.forEach((v) => { if (v.l === u.l + 1) seg.push(...u.p.toArray(), ...v.p.toArray()); }));
    const mesh = makeCubes(ctx, units.length);
    const g = new THREE.Group();
    g.add(mesh, lines(ctx, seg));
    const col = new THREE.Color();
    return {
      object: g,
      update(t) {
        const phase = ((t * 0.9) % (L + 2)) - 1;
        units.forEach((u, k) => {
          const a = ctx.reduced ? 0 : Math.exp(-Math.pow(phase - u.l, 2) * 1.8) * u.w;
          put(ctx, mesh, k, u.p.x, u.p.y, u.p.z, 0, 0, 0, 0.46 * (1 + 0.35 * a));
          mesh.setColorAt(k, col.copy(u.base).lerp(ctx.accent, a * 0.9));
        });
        mesh.instanceMatrix.needsUpdate = true;
        mesh.instanceColor.needsUpdate = true;
        g.rotation.set(0.28, -0.65 + Math.sin(t * 0.2) * 0.25, 0.06);
      },
    };
  },

  /* Streaming data: a 3D waterfall where every new row is a fresh slice of a live signal */
  stream(ctx) {
    const R = 15, C = 22, dx = 0.38, dz = 0.58, speed = 1.3;
    const mesh = makeCubes(ctx, R * C);
    const g = new THREE.Group();
    g.add(mesh);
    const col = new THREE.Color();
    // smooth, evolving "spectrum": two drifting peaks plus a ripple
    const signal = (x, T) => {
      const c1 = 2.4 * Math.sin(T * 0.21), c2 = -2.2 * Math.cos(T * 0.15 + 1.3);
      const a1 = 1.1 + 0.5 * Math.sin(T * 0.37), a2 = 0.8 + 0.4 * Math.cos(T * 0.29);
      return 0.12 + a1 * Math.exp(-((x - c1) ** 2) / 1.1) + a2 * Math.exp(-((x - c2) ** 2) / 0.7) + 0.12 * (1 + Math.sin(x * 2.1 + T * 0.8));
    };
    return {
      object: g,
      update(t) {
        const tt = ctx.reduced ? 4 : t;
        for (let r = 0; r < R; r++) {
          const u = (r + tt * speed) % R;      // 0 = newest (back), R = oldest (front)
          const T = tt * speed - u;            // constant while a row travels: its "timestamp"
          const fade = Math.sin(Math.PI * (u / R));
          for (let c = 0; c < C; c++) {
            const x = (c - (C - 1) / 2) * dx;
            const h = signal(x, T) * 1.6 * (0.35 + 0.65 * fade);
            const k = r * C + c;
            put(ctx, mesh, k, x, h / 2, (u - R / 2) * dz, 0, 0, 0, 0.3 * (0.4 + 0.6 * fade), h, 0.3 * (0.4 + 0.6 * fade));
            mesh.setColorAt(k, gradient(h / 2.6, col));
          }
        }
        mesh.instanceMatrix.needsUpdate = true;
        mesh.instanceColor.needsUpdate = true;
        g.rotation.set(0.5, -0.65 + Math.sin(t * 0.1) * 0.15, 0);
        g.position.y = -1.2;
      },
    };
  },

  /* Flocking: separation, alignment and cohesion produce collective motion */
  flock(ctx) {
    const N = 150, bound = 4.6;
    const forward = new THREE.Vector3(0, 0, 1);
    const boids = Array.from({ length: N }, () => ({
      p: new THREE.Vector3(rand(-3, 3), rand(-2.5, 2.5), rand(-2.5, 2.5)),
      v: new THREE.Vector3(rand(-1, 1), rand(-1, 1), rand(-1, 1)).setLength(rand(1.2, 2)),
      base: gradient(Math.random()),
    }));
    const mesh = makeCubes(ctx, N);
    const g = new THREE.Group();
    g.add(mesh);
    const sep = new THREE.Vector3(), ali = new THREE.Vector3(), coh = new THREE.Vector3(), tmp = new THREE.Vector3(), goal = new THREE.Vector3();
    const col = new THREE.Color(), dir = new THREE.Vector3(), d = ctx.dummy;
    return {
      object: g,
      update(t, dt) {
        const h = ctx.reduced ? 0 : Math.min(dt, 0.05);
        goal.set(Math.sin(t * 0.31) * 2.6, Math.sin(t * 0.47) * 1.6, Math.cos(t * 0.23) * 2.2); // wandering target
        if (h) {
          for (let i = 0; i < N; i++) {
            const b = boids[i];
            sep.set(0, 0, 0); ali.set(0, 0, 0); coh.set(0, 0, 0);
            let n = 0;
            for (let j = 0; j < N; j++) {
              if (i === j) continue;
              const o = boids[j];
              const dist = b.p.distanceTo(o.p);
              if (dist < 2.0) {
                ali.add(o.v); coh.add(o.p); n++;
                if (dist < 0.75) sep.add(tmp.subVectors(b.p, o.p).divideScalar(dist * dist + 0.01));
              }
            }
            if (n) {
              ali.divideScalar(n).sub(b.v).multiplyScalar(0.9);
              coh.divideScalar(n).sub(b.p).multiplyScalar(0.7);
            }
            b.v.addScaledVector(sep, 1.6 * h).addScaledVector(ali, h).addScaledVector(coh, h)
              .addScaledVector(tmp.subVectors(goal, b.p), 0.35 * h);
            if (b.p.length() > bound) b.v.addScaledVector(b.p, -0.8 * h); // soft boundary
            const sp = b.v.length();
            b.v.setLength(Math.min(2.8, Math.max(1.1, sp)));
          }
          boids.forEach((b) => b.p.addScaledVector(b.v, h));
        }
        boids.forEach((b, k) => {
          d.position.copy(b.p);
          d.quaternion.setFromUnitVectors(forward, dir.copy(b.v).normalize());
          d.scale.set(0.2, 0.2, 0.55);
          d.updateMatrix();
          mesh.setMatrixAt(k, d.matrix);
          const speed = clamp01((b.v.length() - 1.1) / 1.7);
          mesh.setColorAt(k, col.copy(b.base).lerp(ctx.accent, speed * 0.5));
        });
        mesh.instanceMatrix.needsUpdate = true;
        mesh.instanceColor.needsUpdate = true;
        g.rotation.set(0.15, t * 0.03, 0);
      },
    };
  },

  /* Fourier modes (back rows) superpose into one signal (front row) */
  modes(ctx) {
    const K = [1, 2, 3, 5], A = [1, 0.55, 0.4, 0.28], cols = 26, dx = 0.34, rows = K.length + 1, dz = 1.15;
    const mesh = makeCubes(ctx, cols * rows);
    const g = new THREE.Group();
    g.add(mesh);
    const col = new THREE.Color();
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) mesh.setColorAt(r * cols + c, r === K.length ? col.copy(ctx.accent) : gradient(r / (rows - 1) * 0.8 + c / cols * 0.2, col));
    return {
      object: g,
      update(t) {
        for (let r = 0; r < rows; r++)
          for (let c = 0; c < cols; c++) {
            const x = (c - (cols - 1) / 2) * dx;
            let y = 0;
            if (r < K.length) y = A[r] * Math.sin(K[r] * x * 0.72 - 1.2 * t + r);
            else for (let m = 0; m < K.length; m++) y += A[m] * Math.sin(K[m] * x * 0.72 - 1.2 * t + m);
            const front = r === K.length;
            put(ctx, mesh, r * cols + c, x, y * (front ? 0.9 : 1.1), (r - (rows - 1) / 2) * dz, 0, 0, Math.atan(y) * 0.3, front ? 0.3 : 0.24);
          }
        mesh.instanceMatrix.needsUpdate = true;
        g.rotation.set(0.4, -0.75 + Math.sin(t * 0.18) * 0.2, 0);
      },
      onTheme() {
        for (let c = 0; c < cols; c++) mesh.setColorAt(K.length * cols + c, ctx.accent);
        mesh.instanceColor.needsUpdate = true;
      },
    };
  },

  /* Concentric wavefronts spreading out from a source */
  ripple(ctx) {
    const R = 7, per = 40, sp = 0.72, maxR = R * sp;
    const mesh = makeCubes(ctx, R * per);
    const g = new THREE.Group();
    g.add(mesh);
    g.rotation.set(-1.0, 0, 0.3);
    const col = new THREE.Color();
    return {
      object: g,
      update(t) {
        for (let i = 0; i < R; i++) {
          const rr = (((i + t * 0.45) % R) * sp) + 0.35;
          const fade = Math.sin(Math.PI * clamp01(rr / (maxR + 0.35)));
          const s = Math.min(0.36, (rr * 2 * Math.PI / per) * 0.55) * (0.25 + 0.75 * fade);
          for (let j = 0; j < per; j++) {
            const a = (j / per) * Math.PI * 2 + i * 0.4;
            put(ctx, mesh, i * per + j, Math.cos(a) * rr, Math.sin(a) * rr, Math.sin(rr * 1.4 - t * 2) * 0.3, 0, 0, a, s);
            mesh.setColorAt(i * per + j, gradient(rr / maxR, col));
          }
        }
        mesh.instanceMatrix.needsUpdate = true;
        mesh.instanceColor.needsUpdate = true;
        g.rotation.z = 0.3 + t * 0.06;
      },
    };
  },
};

/* =========================================================
   Core: renderer, lights, theme, floating cubes, interaction
   ========================================================= */
function init(canvas) {
  const host = canvas.parentElement;
  const mode = canvas.dataset.scene === "home" ? "home" : "page";
  const anim = BUILDERS[canvas.dataset.anim] ? canvas.dataset.anim : "auxetic";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
  } catch (e) {
    return; // no WebGL: the gradient background still looks fine
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xe6f8f6, 22, 46);
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 26);

  const hemi = new THREE.HemisphereLight(0xf4fffc, 0x2f86de, 1.5);
  const key = new THREE.DirectionalLight(0xffffff, 2.0);
  key.position.set(6, 10, 12);
  const rim = new THREE.DirectionalLight(0x8ff0d4, 1.2);
  rim.position.set(-10, -6, 4);
  scene.add(hemi, key, rim);

  const ctx = {
    mode, reduced,
    geo: new THREE.BoxGeometry(1, 1, 1),
    solid: new THREE.MeshStandardMaterial({ roughness: 0.3, metalness: 0.05 }),
    lineMat: new THREE.LineBasicMaterial({ transparent: true, opacity: 0.2, depthWrite: false }),
    accent: new THREE.Color(),
    dummy: new THREE.Object3D(),
  };

  /* ---- theme ---- */
  const THEMES = {
    light: { fog: 0xe6f8f6, sky: 0xf4fffc, ground: 0x2f86de, hemi: 1.5, key: 2.0, rim: 1.2, line: 0x0d1b1e, lineOp: 0.16, accent: 0x2a6fd6 },
    dark: { fog: 0x071416, sky: 0xbff6ea, ground: 0x0b2e4a, hemi: 1.05, key: 1.6, rim: 1.6, line: 0xcfeee8, lineOp: 0.2, accent: 0xd9fff1 },
  };
  let built;
  function applyTheme() {
    const t = THEMES[document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light"];
    scene.fog.color.setHex(t.fog);
    hemi.color.setHex(t.sky);
    hemi.groundColor.setHex(t.ground);
    hemi.intensity = t.hemi;
    key.intensity = t.key;
    rim.intensity = t.rim;
    ctx.lineMat.color.setHex(t.line);
    ctx.lineMat.opacity = t.lineOp;
    ctx.accent.setHex(t.accent);
    if (built && built.onTheme) built.onTheme();
  }
  applyTheme();

  /* ---- page animation ---- */
  built = BUILDERS[anim](ctx);
  const holder = new THREE.Group();
  holder.add(built.object);
  scene.add(holder);

  /* ---- floating cubes ---- */
  const M = mode === "home" ? 130 : 60;
  const glass = new THREE.MeshStandardMaterial({ roughness: 0.25, metalness: 0.05, transparent: true, opacity: 0.78 });
  const dust = new THREE.InstancedMesh(ctx.geo, glass, M);
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

  /* ---- layout ---- */
  function layout() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const wide = camera.aspect > 1.1;
    if (mode === "home") {
      holder.position.set(wide ? 3.4 : 0.5, wide ? -1.4 : -2.2, 0);
      holder.scale.setScalar(wide ? 1 : 0.7);
    } else {
      holder.position.set(wide ? 3.5 + camera.aspect * 2.2 : 2.5, wide ? 1 : 3.2, -2);
      holder.scale.setScalar(wide ? 0.9 : 0.55);
    }
  }

  /* ---- interaction ---- */
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

  function draw(time, dt) {
    built.update(time, dt);

    const d = ctx.dummy;
    for (let k = 0; k < bits.length; k++) {
      const b = bits[k];
      d.position.set(b.p.x, b.p.y + Math.sin(time * 0.6 + b.phase) * b.amp, b.p.z);
      d.rotation.set(b.rot.x + b.spin.x * time, b.rot.y + b.spin.y * time, b.rot.z + b.spin.z * time);
      d.scale.setScalar(b.size);
      d.updateMatrix();
      dust.setMatrixAt(k, d.matrix);
    }
    dust.instanceMatrix.needsUpdate = true;

    mouse.sx += (mouse.x - mouse.sx) * 0.04;
    mouse.sy += (mouse.y - mouse.sy) * 0.04;
    const scroll = Math.min(1.5, window.scrollY / Math.max(1, host.clientHeight));
    holder.rotation.set(mouse.sy * 0.18 - scroll * 0.35, mouse.sx * 0.3, scroll * 0.2);
    dustGroup.position.set(-mouse.sx * 0.6, mouse.sy * 0.4 + scroll * 5, 0);
    dustGroup.rotation.y = time * 0.015;

    renderer.render(scene, camera);
  }

  let raf = 0, last = 0;
  const t0 = performance.now();
  function loop() {
    cancelAnimationFrame(raf);
    last = performance.now();
    const tick = (now) => {
      if (!visible) return;
      // rAF timestamps can precede t0/last slightly: clamp so time never goes negative
      const dt = Math.max(0, (now - last) / 1000);
      last = now;
      draw(Math.max(0, (now - t0) / 1000), dt);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }

  const still = () => draw(4, 0);
  layout();
  new ResizeObserver(() => { layout(); if (reduced) still(); }).observe(host);
  new MutationObserver(() => { applyTheme(); if (reduced) still(); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  if (reduced) still();
  else loop();
  requestAnimationFrame(() => canvas.classList.add("is-ready"));
}

/* ---------- start (after BUILDERS is defined) ---------- */
const sceneCanvas = document.querySelector("canvas[data-scene]");
if (sceneCanvas) init(sceneCanvas);

/* ==========================================================
   Point-cloud scan
   One cloud of points, reshaped per section:
   · hero  – a LiDAR-style sweep of an environment (no figure)
   · work  – one scene per project that shows what it actually does
   The humanoid mesh is only used where a person is genuinely part of
   the project (the boxer BoxBunny senses, visitors Teleco locates, the
   face the companion reads, the dexterous hand).
   ========================================================== */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';

const MODEL_URL = '/assets/models/humanoid_mannequin.glb';
const CYAN = new THREE.Color('#3fe3f8');
const AMBER = new THREE.Color('#ffb547');
const FLOOR = -1;

// Keypoints of the mannequin after normalising it to y ∈ [-1, 1] (measured from
// horizontal slices of the mesh). Model faces +z; "R" is the viewer's right (x > 0).
const KP = {
  head: [0, 0.87, 0.01],
  neck: [0, 0.7, -0.02],
  shL: [-0.21, 0.6, -0.03],
  shR: [0.21, 0.6, -0.03],
  elL: [-0.335, 0.32, -0.01],
  elR: [0.335, 0.32, -0.01],
  wrL: [-0.49, 0.06, 0],
  wrR: [0.49, 0.06, 0],
  pelvis: [0, 0.02, -0.01],
  hipL: [-0.12, -0.02, -0.02],
  hipR: [0.12, -0.02, -0.02],
  knL: [-0.135, -0.45, -0.06],
  knR: [0.135, -0.45, -0.06],
  anL: [-0.16, -0.88, -0.08],
  anR: [0.16, -0.88, -0.08],
};
const BONES = [
  ['head', 'neck'], ['neck', 'shL'], ['neck', 'shR'], ['shL', 'elL'], ['elL', 'wrL'], ['shR', 'elR'], ['elR', 'wrR'],
  ['neck', 'pelvis'], ['pelvis', 'hipL'], ['pelvis', 'hipR'], ['hipL', 'knL'], ['knL', 'anL'], ['hipR', 'knR'], ['knR', 'anR'],
];

const TAU = Math.PI * 2;
const BALANCE_SETTLE_SECONDS = 4.2;
const rnd = (a = 0, b = 1) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const dist3 = (p, i, c) => Math.hypot(p[i] - c[0], p[i + 1] - c[1], p[i + 2] - c[2]);

/* ---------------- shaders ---------------- */
const vertexShader = /* glsl */ `
  attribute vec3 aFrom;
  attribute vec3 aTo;
  attribute vec3 aScatter;
  attribute vec3 aNormal;
  attribute float aHFrom;
  attribute float aHTo;
  attribute float aRand;
  uniform float uMorph;
  uniform float uAssemble;
  uniform float uTime;
  uniform float uScanY;
  uniform float uBandOn;
  uniform float uSweepOn;
  uniform float uSweepA;
  uniform float uWave;
  uniform vec3 uCursor;
  uniform float uCursorOn;
  uniform float uSize;
  uniform float uPR;
  uniform float uTilt;
  uniform vec3 uPivot;
  varying float vH;
  varying float vScan;
  varying float vRim;
  varying float vDepth;

  void main() {
    vec3 p = mix(aFrom, aTo, uMorph);

    // assemble from a scattered cloud, staggered per point
    float a = clamp((uAssemble * 1.6 - aRand * 0.6), 0.0, 1.0);
    a = a * a * (3.0 - 2.0 * a);
    p = mix(aScatter, p, a);

    // scanned floor: a slow swell, plus a glowing bump under the cursor
    float ground = 1.0 - smoothstep(0.0, 0.03, abs(p.y - ${FLOOR.toFixed(1)}));
    p.y += uWave * ground * 0.045 * sin(p.x * 1.3 + uTime * 0.5) * cos(p.z * 1.1 - uTime * 0.38);
    float cd = distance(p.xz, uCursor.xz);
    float bump = exp(-cd * cd * 4.0) * uCursorOn * ground;
    p.y += bump * 0.2;

    // balancing robot: pitch about the wheel axle
    if (uTilt != 0.0) {
      vec2 d = p.yz - uPivot.yz;
      float c = cos(uTilt), s = sin(uTilt);
      p.yz = uPivot.yz + vec2(c * d.x - s * d.y, s * d.x + c * d.y);
    }

    p += aNormal * 0.004 * sin(uTime * 1.7 + aRand * 40.0);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    vec3 n = normalize(normalMatrix * aNormal);
    vRim = 1.0 - abs(n.z);
    vH = mix(aHFrom, aHTo, uMorph);

    float band = exp(-pow((p.y - uScanY) * 10.0, 2.0));
    float ang = atan(p.z, p.x);
    float diff = mod(ang - uSweepA + 3.14159265, 6.2831853) - 3.14159265;
    float beam = exp(-diff * diff * 70.0) + (diff < 0.0 ? exp(diff * 1.8) * 0.45 : 0.0);
    vScan = (band * uBandOn * (1.0 - uSweepOn) + beam * uSweepOn * 0.85) * a + bump * 0.9;
    vDepth = -mv.z;

    float size = uSize * (1.0 + 0.55 * vH + 0.8 * vScan) / -mv.z;
    gl_PointSize = clamp(size, 1.0, 7.0) * uPR;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uCyan;
  uniform vec3 uAmber;
  uniform float uOpacity;
  uniform float uDim;
  uniform float uFog;
  varying float vH;
  varying float vScan;
  varying float vRim;
  varying float vDepth;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float soft = smoothstep(0.5, 0.0, d);

    float body = 0.55 + 0.75 * pow(vRim, 1.2);
    float fog = clamp(1.25 - vDepth * uFog, 0.12, 1.0);
    vec3 col = mix(uCyan * body, uAmber * 1.1, vH);
    col += vec3(0.75, 0.97, 1.0) * vScan * 0.9;
    float alpha = soft * (0.78 + 0.22 * max(vH, vScan)) * fog * uOpacity;
    alpha *= mix(1.0 - uDim, 1.0, clamp(vH * 1.6 + vScan, 0.0, 1.0));
    gl_FragColor = vec4(col * alpha, alpha);
  }
`;

/* ---------------- geometry helpers ---------------- */
async function loadSurface(count) {
  const gltf = await new GLTFLoader().loadAsync(MODEL_URL);
  let mesh = null;
  gltf.scene.updateMatrixWorld(true);
  gltf.scene.traverse((o) => {
    if (!mesh && o.isMesh) mesh = o;
  });
  const geo = mesh.geometry.clone();
  geo.applyMatrix4(mesh.matrixWorld);
  geo.computeBoundingBox();
  const bb = geo.boundingBox;
  const c = new THREE.Vector3();
  bb.getCenter(c);
  const s = 2 / (bb.max.y - bb.min.y);
  geo.translate(-c.x, -c.y, -c.z);
  geo.scale(s, s, s);

  const sampler = new MeshSurfaceSampler(new THREE.Mesh(geo)).build();
  const P = new Float32Array(count * 3);
  const Nrm = new Float32Array(count * 3);
  const v = new THREE.Vector3();
  const n = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    sampler.sample(v, n);
    P.set([v.x, v.y, v.z], i * 3);
    Nrm.set([n.x, n.y, n.z], i * 3);
  }
  return { P, Nrm };
}

/** Writes points sequentially into a position + highlight buffer. */
function writer(N) {
  const pos = new Float32Array(N * 3);
  const h = new Float32Array(N);
  let i = 0;
  return {
    pos,
    h,
    get i() {
      return i;
    },
    left: () => N - i,
    put(x, y, z, hv = 0) {
      if (i >= N) return;
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      h[i] = hv;
      i++;
    },
  };
}

function boxSurface(n, [cx, cy, cz], [sx, sy, sz], put) {
  const areas = [sy * sz, sy * sz, sx * sz, sx * sz, sx * sy, sx * sy];
  const total = areas.reduce((a, b) => a + b, 0);
  for (let k = 0; k < n; k++) {
    let r = Math.random() * total;
    let f = 0;
    while (r > areas[f]) r -= areas[f++];
    const u = rnd(-0.5, 0.5);
    const v = rnd(-0.5, 0.5);
    const s = f % 2 ? 0.5 : -0.5;
    if (f < 2) put(cx + s * sx, cy + u * sy, cz + v * sz);
    else if (f < 4) put(cx + u * sx, cy + s * sy, cz + v * sz);
    else put(cx + u * sx, cy + v * sy, cz + s * sz);
  }
}

function segment(n, a, b, r, put) {
  for (let k = 0; k < n; k++) {
    const t = Math.random();
    put(a[0] + (b[0] - a[0]) * t + rnd(-r, r), a[1] + (b[1] - a[1]) * t + rnd(-r, r), a[2] + (b[2] - a[2]) * t + rnd(-r, r));
  }
}

/** Points along the 12 edges of a box (reads as a clean frame rather than a filled block). */
function boxEdges(n, [cx, cy, cz], [sx, sy, sz], put, jitter = 0.004) {
  const hx = sx / 2;
  const hy = sy / 2;
  const hz = sz / 2;
  const edges = [];
  for (const a of [-1, 1])
    for (const b of [-1, 1]) {
      edges.push([[-hx, a * hy, b * hz], [hx, a * hy, b * hz]]);
      edges.push([[a * hx, -hy, b * hz], [a * hx, hy, b * hz]]);
      edges.push([[a * hx, b * hy, -hz], [a * hx, b * hy, hz]]);
    }
  const lens = edges.map(([p, q]) => Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]));
  const total = lens.reduce((x, y) => x + y, 0);
  for (let k = 0; k < n; k++) {
    let r = Math.random() * total;
    let e = 0;
    while (r > lens[e]) r -= lens[e++];
    const [p, q] = edges[e];
    const t = Math.random();
    put(
      cx + p[0] + (q[0] - p[0]) * t + rnd(-jitter, jitter),
      cy + p[1] + (q[1] - p[1]) * t + rnd(-jitter, jitter),
      cz + p[2] + (q[2] - p[2]) * t + rnd(-jitter, jitter),
    );
  }
}

/** The two-wheeled, two-legged balancing robot: wheel axis along x, drives along z, tyres touch y = -0.6. */
function balanceRobotPoints(n) {
  const out = [];
  const add = (part) => (x, y, z) => out.push([x, y, z, part]);
  const seg = (count, a, b, r, put) => {
    for (let k = 0; k < count; k++) {
      const t = Math.random();
      const th = rnd(0, TAU);
      put(a[0] + (b[0] - a[0]) * t + Math.cos(th) * r, a[1] + (b[1] - a[1]) * t + Math.sin(th) * r, a[2] + (b[2] - a[2]) * t + rnd(-r, r));
    }
  };
  const knob = (count, c, r, put) => {
    for (let k = 0; k < count; k++) {
      const u = rnd(-1, 1);
      const a = rnd(0, TAU);
      put(c[0] + r * Math.sqrt(1 - u * u) * Math.cos(a), c[1] + r * u, c[2] + r * Math.sqrt(1 - u * u) * Math.sin(a));
    }
  };
  // chassis: an edge-traced frame with lightly filled faces (a simplified, simulation-style body)
  boxEdges(Math.floor(n * 0.24), [0, 0.2, 0], [0.56, 0.2, 0.38], add('chassis'));
  boxSurface(Math.floor(n * 0.135), [0, 0.2, 0], [0.56, 0.2, 0.38], add('chassis'));
  // legs: thigh + shin per side, with hip, knee and hub joints
  const legPts = Math.floor(n * 0.16);
  for (const sx of [-1, 1]) {
    const hipF = [sx * 0.3, 0.12, 0.12];
    const hipB = [sx * 0.3, 0.12, -0.12];
    const knee = [sx * 0.33, -0.14, 0.1];
    const hub = [sx * 0.36, -0.43, 0];
    seg(Math.floor(legPts * 0.17), hipF, knee, 0.014, add('leg'));
    seg(Math.floor(legPts * 0.17), knee, hub, 0.014, add('leg'));
    seg(Math.floor(legPts * 0.16), hipB, hub, 0.012, add('leg'));
    [hipF, hipB, knee].forEach((j) => knob(Math.floor(n * 0.006), j, 0.03, add('joint')));
  }
  // wheels: a torus tyre, a hub and six spokes per side
  const wheelPts = Math.floor(n * 0.36);
  for (const sx of [-1, 1]) {
    const cx = sx * 0.4;
    const cy = -0.43;
    for (let k = 0; k < Math.floor(wheelPts * 0.36); k++) {
      const th = rnd(0, TAU);
      const ph = rnd(0, TAU);
      const R = 0.15 + 0.028 * Math.cos(ph);
      add('tyre')(cx + 0.028 * Math.sin(ph), cy + R * Math.cos(th), R * Math.sin(th));
    }
    for (let k = 0; k < Math.floor(wheelPts * 0.06); k++) {
      const th = rnd(0, TAU);
      add('hub')(cx + rnd(-0.01, 0.01), cy + 0.045 * Math.cos(th), 0.045 * Math.sin(th));
    }
    for (let k = 0; k < Math.floor(wheelPts * 0.08); k++) {
      const sp = Math.floor(Math.random() * 6);
      const th = (sp / 6) * TAU;
      const r = rnd(0.045, 0.125);
      add('hub')(cx, cy + r * Math.cos(th), r * Math.sin(th));
    }
  }
  while (out.length < n) boxEdges(1, [0, 0.2, 0], [0.56, 0.2, 0.38], add('chassis'));
  return out.slice(0, n);
}

function makeLines(segments, color, opacity = 0.9) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(segments.flat(2), 3));
  const m = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  m.userData.max = opacity;
  return new THREE.LineSegments(g, m);
}

function makeDots(points, color, size = 0.05, opacity = 1) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(points.flat(), 3));
  const m = new THREE.PointsMaterial({
    color,
    size,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });
  m.userData.max = opacity;
  return new THREE.Points(g, m);
}

function circle(cx, cy, cz, r, seg = 48, plane = 'xy') {
  const out = [];
  for (let i = 0; i < seg; i++) {
    const a0 = (i / seg) * TAU;
    const a1 = ((i + 1) / seg) * TAU;
    const p = (a) =>
      plane === 'xy' ? [cx + r * Math.cos(a), cy + r * Math.sin(a), cz] : [cx + r * Math.cos(a), cy, cz + r * Math.sin(a)];
    out.push([p(a0), p(a1)]);
  }
  return out;
}

/* ---------------- scenes ---------------- */
function buildScenes(P, N) {
  const scenes = {};

  // HERO · a generic LiDAR sweep of a space: rings on the floor, scanned walls and objects,
  // and a humanoid figure standing at the centre
  {
    const w = writer(N);
    // a figure standing at the centre of the scan (same point indices as the mesh samples, so normals match)
    const nFig = Math.floor(N * 0.24);
    const fs = 0.62;
    for (let j = 0; j < nFig; j++) w.put(P[j * 3] * fs, FLOOR + (P[j * 3 + 1] + 1) * fs, P[j * 3 + 2] * fs);
    // obstacles intercept the beams: [angle, distance, half-angle, height]
    const obstacles = [
      [2.3, 2.0, 0.2, 0.55],
      [0.75, 3.1, 0.13, 0.95],
      [4.1, 1.55, 0.24, 0.32],
      [2.75, 2.6, 0.05, 1.5],
      [5.25, 3.6, 0.1, 0.7],
      [3.35, 5.4, 0.55, 1.6],
      [0.15, 5.8, 0.35, 1.6],
    ];
    const rings = [];
    for (let r = 0.5; r < 6.6; r *= 1.062) rings.push(r);
    const weight = rings.reduce((a, r) => a + Math.sqrt(r), 0);
    const left = w.left();
    rings.forEach((r, k) => {
      const count = Math.round((left * Math.sqrt(r)) / weight);
      for (let j = 0; j < count; j++) {
        const th = (j / count) * TAU + k * 0.37 + rnd(-0.004, 0.004);
        let hit = null;
        for (const o of obstacles) {
          let dth = Math.abs(((th - o[0] + Math.PI) % TAU + TAU) % TAU - Math.PI);
          if (dth < o[2] && r > o[1]) {
            hit = o;
            break;
          }
        }
        if (hit) {
          const y = FLOOR + Math.min(hit[3], (r - hit[1]) * 0.3);
          w.put(hit[1] * Math.cos(th), y, hit[1] * Math.sin(th), 0);
        } else {
          const rr = r + rnd(-0.008, 0.008);
          w.put(rr * Math.cos(th), FLOOR, rr * Math.sin(th), 0);
        }
      }
    });
    while (w.left()) {
      const r = rnd(0.5, 8);
      const th = rnd(0, TAU);
      w.put(r * Math.cos(th), FLOOR, r * Math.sin(th));
    }
    scenes.hero = {
      pos: w.pos,
      h: w.h,
      cam: [-0.3, 0.38, 5.3],
      look: [-1.35, -0.92, 0],
      fov: 40,
      yaw: 'spin',
      sweep: true,
      wave: 1,
      cursor: true,
      fog: 0.055,
      opacity: 1,
    };
  }

  // BOXBUNNY · the boxer as the robot sees them: depth voxels + a pose skeleton
  {
    const pos = new Float32Array(N * 3);
    const h = new Float32Array(N);
    const cell = 0.072;
    for (let i = 0; i < N; i++) {
      const k = i * 3;
      const axis = Math.floor(Math.random() * 3);
      const sign = Math.random() < 0.5 ? -1 : 1;
      const o = [rnd(-0.43, 0.43) * cell, rnd(-0.43, 0.43) * cell, rnd(-0.43, 0.43) * cell];
      o[axis] = sign * cell * 0.43;
      pos[k] = Math.round(P[k] / cell) * cell + o[0];
      pos[k + 1] = Math.round(P[k + 1] / cell) * cell + o[1];
      pos[k + 2] = Math.round(P[k + 2] / cell) * cell + o[2];
      h[i] = Math.min(dist3(P, k, KP.wrL), dist3(P, k, KP.wrR)) < 0.16 ? 1 : 0;
    }
    const skel = new THREE.Group();
    skel.add(makeLines(BONES.map(([a, b]) => [KP[a], KP[b]]), CYAN, 0.95));
    skel.add(makeDots(Object.values(KP), AMBER, 0.055));
    scenes.boxbunny = { pos, h, cam: [1.25, 0.25, 4.3], look: [0, 0, 0], fit: [1.45, 2.2], yaw: 0.25, overlay: skel, dim: 0.2, band: true };
  }

  // TELECO · a fixed room camera placing every visitor on a shared SLAM map
  {
    const w = writer(N);
    const W = 0.8;
    const D = 1.15;
    const people = [
      [-0.4, 0.5, 0.36],
      [0.38, 0.05, 0.36],
      [-0.1, -0.62, 0.36],
    ];
    const robot = [0.2, 0.68];
    const obstacles = [
      [-0.55, -0.88, 0.16, 0.1],
      [0.6, -0.4, 0.1, 0.26],
      [-0.66, 0.12, 0.08, 0.16],
    ];
    const nFloor = Math.floor(N * 0.4);
    for (let i = 0; i < nFloor; i++) {
      const r = Math.random();
      let x;
      let z;
      if (r < 0.34) {
        const t = rnd(-1, 1);
        const side = Math.floor(Math.random() * 4);
        x = side < 2 ? t * W : side === 2 ? -W : W;
        z = side < 2 ? (side === 0 ? -D : D) : t * D;
        if (side === 1 && Math.abs(x - 0.45) < 0.15) x -= 0.3; // doorway
      } else if (r < 0.52) {
        const o = obstacles[Math.floor(Math.random() * obstacles.length)];
        x = o[0] + rnd(-1, 1) * o[2];
        z = o[1] + rnd(-1, 1) * o[3];
      } else {
        const onX = Math.random() < 0.5;
        const g = 0.27;
        const a = rnd(-1, 1) * (onX ? W : D);
        const b = Math.round((rnd(-1, 1) * (onX ? D : W)) / g) * g;
        x = onX ? a : b;
        z = onX ? b : a;
      }
      w.put(x, FLOOR + 0.002, z);
    }
    const nPerson = Math.floor(N * 0.17);
    for (const [px, pz, s] of people) {
      for (let j = 0; j < nPerson; j++) {
        const src = ((j * 7919) % N) * 3;
        w.put(px + P[src] * s, FLOOR + (P[src + 1] + 1) * s, pz + P[src + 2] * s);
      }
    }
    const nRobot = Math.floor(N * 0.06);
    for (let j = 0; j < nRobot; j++) {
      const a = rnd(0, TAU);
      const yy = Math.random();
      const r = yy < 0.25 ? 0.13 : yy < 0.85 ? 0.05 : 0.07;
      w.put(robot[0] + Math.cos(a) * r, FLOOR + yy * 0.62, robot[1] + Math.sin(a) * r, 0.35);
    }
    while (w.left()) w.put(rnd(-W, W), FLOOR, rnd(-D, D));
    const g = new THREE.Group();
    const cam = [-W, 0.25, -D];
    const corners = [
      [-0.2, FLOOR, 0.35],
      [W, FLOOR, -0.3],
      [W * 0.4, FLOOR, D],
      [-W * 0.7, FLOOR, D * 0.7],
    ];
    g.add(makeLines(corners.map((c) => [cam, c]), CYAN, 0.35));
    g.add(makeLines(people.map(([x, z]) => [cam, [x, FLOOR + 0.02, z]]), AMBER, 0.45));
    g.add(makeLines(people.flatMap(([x, z]) => circle(x, FLOOR + 0.01, z, 0.11, 32, 'xz')), AMBER, 1));
    g.add(makeDots([cam], CYAN, 0.09));
    g.add(makeDots(people.map(([x, z]) => [x, FLOOR + 0.01, z]), AMBER, 0.07));
    scenes.teleco = { pos: w.pos, h: w.h, cam: [0.2, 2.3, 3.1], look: [0, -0.95, 0], fit: [1.9, 2.3], yaw: 0.12, overlay: g };
  }

  // COMPANION · the face in front of the robot, its mood plotted on valence/arousal axes
  {
    const h = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const y = P[i * 3 + 1];
      h[i] = y > 0.74 ? 1 : y > 0.68 ? 0.4 : 0;
    }
    const g = new THREE.Group();
    const c = [0.33, 0.86, 0.06];
    const r = 0.11;
    g.add(makeLines(circle(c[0], c[1], c[2], r, 64), CYAN, 0.75));
    g.add(
      makeLines(
        [
          [[c[0] - r * 1.25, c[1], c[2]], [c[0] + r * 1.25, c[1], c[2]]],
          [[c[0], c[1] - r * 1.25, c[2]], [c[0], c[1] + r * 1.25, c[2]]],
        ],
        CYAN,
        0.45,
      ),
    );
    const mood = makeDots([[c[0] + 0.05, c[1] + 0.04, c[2]]], AMBER, 0.045);
    mood.userData.orbit = c;
    g.add(mood);
    g.add(makeLines([[[0.1, 0.88, 0.07], [c[0] - r, c[1], c[2]]]], AMBER, 0.4));
    scenes.companion = { pos: P, h, cam: [0.12, 0.86, 1.7], look: [0.12, 0.8, 0], fit: [0.72, 0.6], yaw: 0, overlay: g, dim: 0.72, band: true };
  }

  // RL HAND · a robot hand holding a mug it has just lifted, scanned the way a depth camera would see it:
  // only surfaces facing the camera, and nothing that the mug or the fingers hide
  {
    const cam = [0.62, 0.95, 1.95];
    const tableY = -0.62;
    const R = 0.16; // mug
    const H = 0.34;
    const y0 = tableY + 0.07; // lifted just off the table
    const yc = y0 + H * 0.52;
    const sub = (a2, b2) => [a2[0] - b2[0], a2[1] - b2[1], a2[2] - b2[2]];
    const dot = (a2, b2) => a2[0] * b2[0] + a2[1] * b2[1] + a2[2] * b2[2];
    const cross = (a2, b2) => [a2[1] * b2[2] - a2[2] * b2[1], a2[2] * b2[0] - a2[0] * b2[2], a2[0] * b2[1] - a2[1] * b2[0]];
    const unit = (v) => {
      const l = Math.hypot(...v) || 1;
      return [v[0] / l, v[1] / l, v[2] / l];
    };
    const at = (th, y, r) => [r * Math.cos(th), y, r * Math.sin(th)]; // round the mug axis; θ = π/2 faces the viewer

    // ---- occlusion: does anything solid sit between p and the camera?
    const capsules = []; // [a, b, r] for fingers, thumb, palm
    const segDist = (p1, q1, p2, q2) => {
      // closest distance between segments p1q1 and p2q2
      const d1 = sub(q1, p1);
      const d2 = sub(q2, p2);
      const r = sub(p1, p2);
      const a2 = dot(d1, d1);
      const e = dot(d2, d2);
      const f = dot(d2, r);
      const c = dot(d1, r);
      const bb = dot(d1, d2);
      const den = a2 * e - bb * bb;
      let sN = den > 1e-9 ? clamp((bb * f - c * e) / den, 0, 1) : 0;
      let tN = (bb * sN + f) / e;
      if (tN < 0) {
        tN = 0;
        sN = clamp(-c / a2, 0, 1);
      } else if (tN > 1) {
        tN = 1;
        sN = clamp((bb - c) / a2, 0, 1);
      }
      const c1 = [p1[0] + d1[0] * sN, p1[1] + d1[1] * sN, p1[2] + d1[2] * sN];
      const c2 = [p2[0] + d2[0] * tN, p2[1] + d2[1] * tN, p2[2] + d2[2] * tN];
      return Math.hypot(...sub(c1, c2));
    };
    const hitsMug = (p) => {
      // the mug as a solid cylinder; true if the ray p → camera passes through its wall
      const d = sub(cam, p);
      const qa = d[0] * d[0] + d[2] * d[2];
      const qb = 2 * (p[0] * d[0] + p[2] * d[2]);
      const qc = p[0] * p[0] + p[2] * p[2] - R * R;
      const disc = qb * qb - 4 * qa * qc;
      if (disc <= 0) return false;
      const t1 = (-qb - Math.sqrt(disc)) / (2 * qa);
      if (t1 < 1e-3 || t1 > 1) return false;
      const y = p[1] + d[1] * t1;
      return y > y0 && y < y0 + H;
    };
    const hitsHand = (p, skip = 0.0) => {
      for (const [a2, b2, r] of capsules) if (segDist(p, cam, a2, b2) < r - skip) return true;
      return false;
    };
    const facing = (p, n) => dot(n, sub(cam, p)) > 0;

    const w = writer(N);
    // keep drawing candidates from gen() until `count` of them are visible
    const fill = (count, gen, test) => {
      let got = 0;
      for (let tries = 0; got < count && tries < count * 40; tries++) {
        const [p, n, hv] = gen();
        if (!facing(p, n) || (test && !test(p))) continue;
        w.put(p[0], p[1], p[2], hv);
        got++;
      }
    };

    // ---- the hand (built first so the mug can be tested against it)
    const P0 = 0.3; // knuckle line, front-right of the mug
    const P1 = -0.75; // heel of the hand, back-right
    const Rin = R + 0.012; // palm contact
    const Rout = R + 0.075; // back of the hand
    const fingers = [
      // height above the grip centre, length scale (index on top)
      [0.135, 0.95],
      [0.045, 1.05],
      [-0.045, 1.0],
      [-0.13, 0.82],
    ];
    const fr = 0.023;
    const Rf = R + fr + 0.006;
    // the grip is tilted: knuckles higher at the back, fingers running down across the front
    const slope = 0.075;
    const fingerJoints = fingers.map(([dy, sc], i) => {
      const y = yc + dy;
      const base = P0 - 0.06 * i;
      const th = [base, base + 0.62 * sc, base + 1.08 * sc, base + 1.42 * sc];
      return th.map((t, k) => at(t, y - slope * (t - base) - 0.004 * k, Rf + (k === 0 ? 0.03 : 0)));
    });
    fingerJoints.forEach((js) => {
      for (let k = 0; k < 3; k++) capsules.push([js[k], js[k + 1], fr * (1 - 0.08 * k)]);
    });
    for (let k = 0; k < 6; k++) {
      const t = P1 + ((P0 - P1) * (k + 0.5)) / 6;
      capsules.push([at(t, yc - 0.15, (Rin + Rout) / 2), at(t, yc + 0.16, (Rin + Rout) / 2), (Rout - Rin) / 2]);
    }
    const thumb = [at(P1 + 0.15, yc + 0.02, Rout - 0.01), at(P1 - 0.3, yc + 0.09, R + 0.04), at(P1 - 0.72, yc + 0.13, R + 0.035), at(P1 - 1.0, yc + 0.15, R + 0.032)];
    for (let k = 0; k < 3; k++) capsules.push([thumb[k], thumb[k + 1], 0.031 - 0.003 * k]);

    const capsulePoint = (a2, b2, r) => {
      const d = sub(b2, a2);
      const u = unit(d);
      const v1 = unit(cross(u, Math.abs(u[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]));
      const v2 = cross(u, v1);
      const t = Math.random();
      const th = rnd(0, TAU);
      const n = [v1[0] * Math.cos(th) + v2[0] * Math.sin(th), v1[1] * Math.cos(th) + v2[1] * Math.sin(th), v1[2] * Math.cos(th) + v2[2] * Math.sin(th)];
      return [[a2[0] + d[0] * t + n[0] * r, a2[1] + d[1] * t + n[1] * r, a2[2] + d[2] * t + n[2] * r], n, t];
    };
    const ballPoint = (c, r) => {
      const u = rnd(-1, 1);
      const a2 = rnd(0, TAU);
      const n = [Math.sqrt(1 - u * u) * Math.cos(a2), u, Math.sqrt(1 - u * u) * Math.sin(a2)];
      return [[c[0] + n[0] * r, c[1] + n[1] * r, c[2] + n[2] * r], n];
    };
    // a point on the hand's own capsules is hidden only by the mug or by a *different* part
    const handVisible = (self) => (p) => !hitsMug(p) && !capsules.some((c) => c !== self && segDist(p, cam, c[0], c[1]) < c[2] * 0.92);

    // fingers: three segments each, a joint at every bend, slightly brighter tips
    fingerJoints.forEach((js) => {
      for (let k = 0; k < 3; k++) {
        const cap = capsules.find((c) => c[0] === js[k]);
        const vis = handVisible(cap);
        fill(Math.floor(N * 0.03 * (1 - 0.18 * k)), () => {
          const [p, n] = capsulePoint(js[k], js[k + 1], cap[2]);
          return [p, n, k === 2 ? 0.3 : 0.03];
        }, vis);
        fill(Math.floor(N * 0.0035), () => {
          const [p, n] = ballPoint(js[k], fr * 1.22);
          return [p, n, 0.4];
        }, (p) => !hitsMug(p));
      }
    });
    // thumb, round the back (mostly hidden, peeking out at the edge)
    for (let k = 0; k < 3; k++) {
      const cap = capsules.find((c) => c[0] === thumb[k]);
      fill(Math.floor(N * 0.012), () => {
        const [p, n] = capsulePoint(thumb[k], thumb[k + 1], cap[2]);
        return [p, n, k === 2 ? 0.3 : 0.03];
      }, handVisible(cap));
    }
    // back of the hand: the outer face of a curved pad, its top and bottom edges, and the knuckle ridge
    fill(Math.floor(N * 0.14), () => {
      const r2 = Math.random();
      const th = rnd(P1, P0);
      if (r2 < 0.7) {
        const y = yc + rnd(-0.15, 0.16);
        return [at(th, y, Rout), [Math.cos(th), 0, Math.sin(th)], 0.03];
      }
      const top = r2 < 0.85;
      const rr = rnd(Rin, Rout);
      return [at(th, top ? yc + 0.16 : yc - 0.15, rr), [0, top ? 1 : -1, 0], 0.08];
    }, (p) => !hitsMug(p));
    // wrist joint and forearm, heading back and to the right, rising slightly
    const W = at(P1 - 0.05, yc + 0.005, (Rin + Rout) / 2 + 0.02);
    const dirF = unit([0.8, 0.42, -0.42]);
    const F = [W[0] + dirF[0] * 0.95, W[1] + dirF[1] * 0.95, W[2] + dirF[2] * 0.95];
    fill(Math.floor(N * 0.1), () => {
      const [p, n] = capsulePoint(W, F, 0.085);
      return [p, n, 0];
    }, (p) => !hitsMug(p));
    fill(Math.floor(N * 0.014), () => {
      const [p, n, t] = capsulePoint(W, F, 0.095);
      const q = t < 0.5 ? 0.06 : 0.42; // two joint collars
      const d = sub(F, W);
      return [[W[0] + d[0] * q + n[0] * 0.095, W[1] + d[1] * q + n[1] * 0.095, W[2] + d[2] * q + n[2] * 0.095], n, 1];
    });

    // ---- the mug: outer wall, inner wall seen over the rim, rim, handle, base
    const mugVis = (p) => !hitsHand(p);
    fill(Math.floor(N * 0.045), () => {
      const th = rnd(0, TAU);
      return [at(th, y0 + rnd(0, H), R), [Math.cos(th), 0, Math.sin(th)], 0.7];
    }, mugVis);
    fill(Math.floor(N * 0.02), () => {
      const th = rnd(0, TAU);
      const p = at(th, y0 + H - rnd(0, H * 0.7), R - 0.008);
      return [p, [-Math.cos(th), 0, -Math.sin(th)], 0.55];
    }, (p) => {
      // inside the mug: visible only if the ray clears the rim
      const d = sub(cam, p);
      const qa = d[0] * d[0] + d[2] * d[2];
      const qb = 2 * (p[0] * d[0] + p[2] * d[2]);
      const qc = p[0] * p[0] + p[2] * p[2] - R * R;
      const t2 = (-qb + Math.sqrt(qb * qb - 4 * qa * qc)) / (2 * qa);
      return p[1] + d[1] * t2 > y0 + H;
    });
    fill(Math.floor(N * 0.03), () => {
      const th = rnd(0, TAU);
      return [at(th, y0 + H, R + rnd(-0.006, 0.006)), [0, 1, 0], 1];
    }, mugVis);
    fill(Math.floor(N * 0.022), () => {
      // handle on the far side from the hand: a half torus
      const a2 = rnd(-1.5, 1.5);
      const ph = rnd(0, TAU);
      const c = [-R - 0.05 * Math.cos(a2) - 0.012, y0 + H * 0.52 + 0.085 * Math.sin(a2), 0];
      const n = [-Math.cos(a2) * Math.cos(ph), Math.sin(a2) * Math.cos(ph), Math.sin(ph)];
      return [[c[0] + n[0] * 0.017, c[1] + n[1] * 0.017, c[2] + n[2] * 0.017], n, 1];
    }, (p) => !hitsMug(p) && !hitsHand(p));

    // ---- table: LiDAR scan lines, a soft shadow under the lifted mug, nothing behind the mug
    for (let j = 0; j < Math.floor(N * 0.015); j++) {
      const rr = R * 1.05 * Math.sqrt(Math.random());
      const a2 = rnd(0, TAU);
      w.put(rr * Math.cos(a2), tableY + 0.002, rr * Math.sin(a2), 0.25);
    }
    // rows run straight across the view
    const rows = 10;
    const az = Math.atan2(cam[0], cam[2]);
    const ca = Math.cos(az);
    const sa = Math.sin(az);
    while (w.left()) {
      const edge = Math.random() < 0.18;
      let u = rnd(-0.6, 0.6);
      let v = -0.42 + (Math.floor(Math.random() * rows) / (rows - 1)) * 0.8;
      if (edge) {
        u = Math.random() < 0.5 ? -0.6 : 0.6;
        v = rnd(-0.42, 0.38);
      }
      v += rnd(-0.003, 0.003);
      const p = [0.08 + u * ca + v * sa, tableY, -u * sa + v * ca];
      if (hitsMug(p) || hitsHand(p)) continue;
      w.put(p[0], p[1], p[2], edge ? 0.12 : 0);
    }

    scenes['rl-hand'] = { pos: w.pos, h: w.h, cam, look: [0.1, -0.36, 0.02], fit: [0.8, 0.86], yaw: 0, band: true };
  }

  // LEGGED BALANCE · the wheel-legged robot pitching and recovering over its axle
  {
    const w = writer(N);
    const S = 1.35;
    const oy = -0.05;
    for (const [x, y, z, part] of balanceRobotPoints(Math.floor(N * 0.86))) {
      const hv = part === 'joint' || part === 'cam' ? 1 : part === 'leg' ? 0.35 : 0;
      w.put(x * S, y * S + oy, z * S, hv);
    }
    // a soft ground shadow under the wheels instead of a grid
    const floorY = -0.6 * S + oy;
    while (w.left()) {
      const r = 0.75 * Math.sqrt(Math.random()) * (Math.random() < 0.7 ? 1 : 1.25);
      const a2 = rnd(0, TAU);
      w.put(r * Math.cos(a2) * 1.1, floorY, r * Math.sin(a2) * 0.8);
    }
    const g = new THREE.Group();
    const com = makeDots([[0, 0.2 * S + oy, 0]], AMBER, 0.07);
    com.userData.com = true;
    g.add(com);
    const plumb = [];
    for (let y = 0; y > -1.3; y -= 0.07) plumb.push([[0, y, 0], [0, y - 0.035, 0]]);
    const plumbLine = makeLines(plumb, AMBER, 0.7);
    plumbLine.userData.plumb = true;
    g.add(plumbLine);
    scenes['legged-balance'] = {
      pos: w.pos,
      h: w.h,
      cam: [2.5, 0.85, 3.0],
      look: [0, -0.18, 0],
      fit: [1.55, 1.75],
      yaw: 0,
      overlay: g,
      tilt: true,
      pivot: [0, -0.43 * S + oy, 0],
      com: [0, 0.2 * S + oy, 0],
      floorY,
      band: true,
    };
  }

  // BREAKING BIAS · a conceptual view of benchmark inputs, model layers and responses.
  // Amber highlights a response pattern under examination, not measured model internals.
  {
    const w = writer(N);
    const cols = 7;
    const xs = Array.from({ length: cols }, (_, i) => -0.48 + i * 0.16);
    const focusColumn = 4;
    const layers = [0.46, 0.15, -0.16, -0.47];
    const zs = [-0.24, -0.08, 0.08, 0.24];
    // benchmark inputs: a row of edge-traced cubes
    const nTok = Math.floor(N * 0.1);
    for (let j = 0; j < nTok; j++) {
      const c = j % cols;
      boxEdges(1, [xs[c], 0.86, 0], [0.1, 0.1, 0.1], (x, y, z) => w.put(x, y, z, c === focusColumn ? 1 : 0), 0.003);
    }
    // model layers: an abstract response pattern highlighted through the grid
    const nNode = Math.floor(N * 0.6);
    for (let j = 0; j < nNode; j++) {
      const L = j % layers.length;
      const c = Math.floor(j / layers.length) % cols;
      const zi = Math.floor(j / (layers.length * cols)) % zs.length;
      const spread = Math.abs(c - focusColumn);
      const hit = spread === 0 || (spread === 1 && L >= 2 && zi % 2 === 0);
      const jit = hit ? 0.008 + 0.01 * L : 0;
      const u = rnd(-1, 1);
      const a = rnd(0, TAU);
      const r = 0.024;
      w.put(
        xs[c] + r * Math.sqrt(1 - u * u) * Math.cos(a) + rnd(-jit, jit),
        layers[L] + r * u + rnd(-jit, jit) * 0.5,
        zs[zi] + r * Math.sqrt(1 - u * u) * Math.sin(a) + rnd(-jit, jit),
        hit ? 1 : 0,
      );
    }
    // model responses: aligned rows with a shared pattern highlighted
    const nOut = Math.floor(N * 0.16);
    for (let j = 0; j < nOut; j++) {
      const x = rnd(-0.52, 0.52);
      const slice = Math.floor((x + 0.52) / 0.13);
      const highlighted = slice >= 4 && slice <= 6;
      const row = Math.floor(rnd(0, 3));
      w.put(x, -0.84 - row * 0.05, rnd(-0.008, 0.008), highlighted ? 1 : 0.1);
    }
    // leftovers thicken the layer nodes
    while (w.left()) {
      const L = Math.floor(Math.random() * layers.length);
      const c = Math.floor(Math.random() * cols);
      const zi = Math.floor(Math.random() * zs.length);
      if (c === focusColumn) continue;
      const u = rnd(-1, 1);
      const a = rnd(0, TAU);
      w.put(xs[c] + 0.024 * Math.sqrt(1 - u * u) * Math.cos(a), layers[L] + 0.024 * u, zs[zi] + 0.024 * Math.sqrt(1 - u * u) * Math.sin(a), 0);
    }
    const g = new THREE.Group();
    // faint layer outlines
    const frames = [];
    layers.forEach((y) => {
      const c4 = [[-0.58, y, -0.32], [0.58, y, -0.32], [0.58, y, 0.32], [-0.58, y, 0.32]];
      c4.forEach((p, i) => frames.push([p, c4[(i + 1) % 4]]));
    });
    g.add(makeLines(frames, CYAN, 0.22));
    const path = [[xs[focusColumn], 0.8, 0], ...layers.map((y, L) => [xs[focusColumn] + (L % 2 ? -0.04 : 0.04), y, 0.02]), [xs[focusColumn], -0.82, 0]];
    const seg = [];
    for (let k = 0; k < path.length - 1; k++) seg.push([path[k], path[k + 1]]);
    g.add(makeLines(seg, AMBER, 0.95));
    scenes['breaking-bias'] = { pos: w.pos, h: w.h, cam: [1.0, 0.8, 3.5], look: [0, -0.02, 0], fit: [1.4, 2.25], yaw: 'drift', overlay: g, band: true };
  }

  return scenes;
}

/* ---------------- main ---------------- */
export async function initScan({ canvas, getRect, reducedMotion = false, mobile = false, heroView = null, onReady }) {
  const N = mobile ? 7000 : 14000;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  const PR = Math.min(window.devicePixelRatio || 1, 1.75);
  renderer.setPixelRatio(PR);

  const { P, Nrm } = await loadSurface(N);
  const scenes = buildScenes(P, N);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(46, 1, 0.05, 60);
  const rig = new THREE.Group();
  scene.add(rig);

  const geo = new THREE.BufferGeometry();
  const from = new Float32Array(scenes.hero.pos);
  const to = new Float32Array(scenes.hero.pos);
  const hFrom = new Float32Array(scenes.hero.h);
  const hTo = new Float32Array(scenes.hero.h);
  const scatter = new Float32Array(N * 3);
  const rand = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    // start as a loose haze above the floor, then settle
    scatter[i * 3] = from[i * 3] * rnd(0.6, 1.3);
    scatter[i * 3 + 1] = rnd(-0.6, 2.4);
    scatter[i * 3 + 2] = from[i * 3 + 2] * rnd(0.6, 1.3);
    rand[i] = Math.random();
  }
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
  const aFrom = new THREE.BufferAttribute(from, 3);
  const aTo = new THREE.BufferAttribute(to, 3);
  const aHFrom = new THREE.BufferAttribute(hFrom, 1);
  const aHTo = new THREE.BufferAttribute(hTo, 1);
  geo.setAttribute('aFrom', aFrom);
  geo.setAttribute('aTo', aTo);
  geo.setAttribute('aHFrom', aHFrom);
  geo.setAttribute('aHTo', aHTo);
  geo.setAttribute('aScatter', new THREE.BufferAttribute(scatter, 3));
  geo.setAttribute('aNormal', new THREE.BufferAttribute(Nrm, 3));
  geo.setAttribute('aRand', new THREE.BufferAttribute(rand, 1));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 20);

  const uniforms = {
    uMorph: { value: 1 },
    uAssemble: { value: reducedMotion ? 1 : 0 },
    uTime: { value: 0 },
    uScanY: { value: 2 },
    uBandOn: { value: 0 },
    uSweepOn: { value: 1 },
    uSweepA: { value: 0 },
    uWave: { value: 1 },
    uCursor: { value: new THREE.Vector3(99, FLOOR, 99) },
    uCursorOn: { value: 0 },
    uSize: { value: mobile ? 13 : 12 },
    uPR: { value: PR },
    uTilt: { value: 0 },
    uPivot: { value: new THREE.Vector3() },
    uCyan: { value: CYAN.clone() },
    uAmber: { value: AMBER.clone() },
    uOpacity: { value: 1 },
    uDim: { value: 0 },
    uFog: { value: 0.085 },
  };
  const mat = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  rig.add(new THREE.Points(geo, mat));

  const overlays = [];
  for (const [name, s] of Object.entries(scenes)) {
    if (!s.overlay) continue;
    s.overlay.userData.scene = name;
    rig.add(s.overlay);
    overlays.push(s.overlay);
  }

  /* state */
  let current = 'hero';
  let morphT = 1;
  let assembleT = reducedMotion ? 1 : 0;
  // heroView() may return its own { cam, look, fov } for the hero (the phone layout frames it differently)
  const heroFrame = () => (current === 'hero' && heroView?.()) || scenes.hero;
  const camPos = new THREE.Vector3(...heroFrame().cam);
  const camLook = new THREE.Vector3(...heroFrame().look);
  let yaw = 0;
  let spin = 0;
  let tiltClock = 0;
  const fit = [1.4, 2.2];
  let fovReady = false;

  function setScene(name) {
    if (!scenes[name] || name === current) return;
    const m = easeInOut(clamp(morphT, 0, 1));
    for (let i = 0; i < N * 3; i++) from[i] += (to[i] - from[i]) * m;
    for (let i = 0; i < N; i++) hFrom[i] += (hTo[i] - hFrom[i]) * m;
    to.set(scenes[name].pos);
    hTo.set(scenes[name].h);
    aFrom.needsUpdate = aTo.needsUpdate = aHFrom.needsUpdate = aHTo.needsUpdate = true;
    morphT = reducedMotion ? 1 : 0;
    if (current === 'hero') yaw = (((yaw + Math.PI) % TAU) + TAU) % TAU - Math.PI;
    current = name;
    tiltClock = 0;
    const piv = scenes[name].pivot;
    if (piv) uniforms.uPivot.value.set(...piv);
    wake();
  }

  /* cursor ripple on the hero floor */
  const ray = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -FLOOR);
  const hitV = new THREE.Vector3();
  let cursorAt = -10;
  let lastRect = null;
  window.addEventListener(
    'pointermove',
    (e) => {
      if (!scenes[current].cursor || !lastRect || e.pointerType === 'touch') return;
      const r = lastRect;
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = -((e.clientY - r.top) / r.height) * 2 + 1;
      if (Math.abs(nx) > 1 || Math.abs(ny) > 1) return;
      ray.setFromCamera({ x: nx, y: ny }, camera);
      if (ray.ray.intersectPlane(plane, hitV)) {
        rig.worldToLocal(hitV);
        uniforms.uCursor.value.lerp(hitV, uniforms.uCursorOn.value < 0.05 ? 1 : 0.35);
        cursorAt = clock.elapsedTime;
        wake();
      }
    },
    { passive: true },
  );

  /* sizing */
  const resize = () => renderer.setSize(window.innerWidth, window.innerHeight, false);
  resize();
  window.addEventListener('resize', resize);

  /* loop */
  const clock = new THREE.Clock();
  let running = false;
  let visible = !document.hidden;
  let idleFrames = 0;
  document.addEventListener('visibilitychange', () => {
    visible = !document.hidden;
    if (visible) wake();
  });

  function wake() {
    idleFrames = 0;
    if (!running && visible) {
      running = true;
      clock.getDelta();
      requestAnimationFrame(frame);
    }
  }

  const tmpV = new THREE.Vector3();
  function frame() {
    if (!visible) {
      running = false;
      return;
    }
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    const rect = getRect();
    lastRect = rect;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const onScreen = rect && rect.width > 20 && rect.bottom > 0 && rect.top < vh && rect.right > 0 && rect.left < vw;
    if (!onScreen) {
      renderer.clear();
      if (++idleFrames > 3) {
        running = false;
        return;
      }
      requestAnimationFrame(frame);
      return;
    }
    idleFrames = 0;
    const s = scenes[current];
    const k = 1 - Math.exp(-dt * 2.2);

    // One recovery per scene entry; hold the scan and point shimmer still afterwards too.
    if (s.tilt && !reducedMotion) tiltClock = Math.min(BALANCE_SETTLE_SECONDS, tiltClock + dt);
    const sceneTime = s.tilt ? tiltClock : t;
    const balanceSettled = s.tilt && tiltClock >= BALANCE_SETTLE_SECONDS;

    if (assembleT < 1) assembleT = Math.min(1, assembleT + dt / 2.4);
    if (morphT < 1) morphT = Math.min(1, morphT + dt / 1.1);
    uniforms.uAssemble.value = assembleT;
    uniforms.uMorph.value = easeInOut(morphT);
    uniforms.uTime.value = reducedMotion ? 0 : sceneTime;
    uniforms.uScanY.value = reducedMotion ? 5 : 1.25 - ((sceneTime * 0.55) % 3.2);
    uniforms.uSweepA.value = reducedMotion ? 1 : sceneTime * 1.1;
    uniforms.uSweepOn.value += ((s.sweep ? 1 : 0) - uniforms.uSweepOn.value) * k;
    uniforms.uBandOn.value += ((s.band ? 1 : 0) - uniforms.uBandOn.value) * k;
    uniforms.uWave.value += ((s.wave && !reducedMotion ? 1 : 0) - uniforms.uWave.value) * k;
    const cursorOn = s.cursor && t - cursorAt < 2.5 ? 1 : 0;
    uniforms.uCursorOn.value += (cursorOn - uniforms.uCursorOn.value) * Math.min(1, dt * 4);
    uniforms.uDim.value += ((s.dim ?? 0) - uniforms.uDim.value) * (1 - Math.exp(-dt * 3));
    uniforms.uOpacity.value += ((s.opacity ?? 1) - uniforms.uOpacity.value) * k;
    uniforms.uFog.value += ((s.fog ?? 0.09) - uniforms.uFog.value) * k;

    // yaw per scene
    let targetYaw;
    if (s.yaw === 'spin') {
      spin += reducedMotion ? 0 : dt * 0.035;
      targetYaw = spin;
    } else if (s.yaw === 'drift') targetYaw = reducedMotion ? 0 : Math.sin(t * 0.25) * 0.35;
    else targetYaw = s.yaw;
    if (s.yaw !== 'spin') spin = yaw;
    yaw += (targetYaw - yaw) * (s.yaw === 'spin' ? 1 : 1 - Math.exp(-dt * 2.4));
    rig.rotation.y = yaw;

    // Balancing robot: pitch and recover once, then hold an upright pose.
    let tilt = 0;
    if (s.tilt && !reducedMotion && !balanceSettled) {
      tilt = 0.2 * Math.exp(-1.2 * tiltClock) * Math.sin(5.2 * tiltClock + 0.6);
    }
    if (balanceSettled) uniforms.uTilt.value = 0;
    else uniforms.uTilt.value += (tilt - uniforms.uTilt.value) * Math.min(1, dt * 30);

    // camera
    if (s.fit) {
      fit[0] += (s.fit[0] - fit[0]) * k;
      fit[1] += (s.fit[1] - fit[1]) * k;
    }
    const view = current === 'hero' ? heroFrame() : s;
    camPos.lerp(tmpV.set(...view.cam), k);
    camLook.lerp(tmpV.set(...view.look), k);
    camera.position.copy(camPos);
    camera.lookAt(camLook);

    // overlays fade in for the active scene only
    for (const o of overlays) {
      const on = o.userData.scene === current && morphT > 0.55;
      o.traverse((c) => {
        if (!c.material) return;
        const max = c.material.userData.max ?? 1;
        c.material.opacity += ((on ? max : 0) - c.material.opacity) * Math.min(1, dt * 4);
        if (c.userData.orbit && on) {
          const [cx, cy, cz] = c.userData.orbit;
          const p = c.geometry.attributes.position;
          p.setXYZ(0, cx + 0.07 * Math.cos(t * 0.7), cy + 0.06 * Math.sin(t * 1.1), cz);
          p.needsUpdate = true;
        }
      });
    }
    // centre-of-mass marker rides the pitching robot; the plumb line hangs straight down to the floor
    const lb = scenes['legged-balance'];
    if (lb.overlay) {
      const a = uniforms.uTilt.value;
      const dy = lb.com[1] - lb.pivot[1];
      const cy = lb.pivot[1] + Math.cos(a) * dy;
      const cz = lb.pivot[2] + Math.sin(a) * dy;
      lb.overlay.children.forEach((c) => {
        if (c.userData.com) {
          c.geometry.attributes.position.setXYZ(0, 0, cy, cz);
          c.geometry.attributes.position.needsUpdate = true;
        }
        if (c.userData.plumb) {
          c.position.set(0, cy, cz);
          c.scale.y = (cy - lb.floorY) / 1.3;
        }
      });
    }

    // draw into the target rect of the full-viewport canvas
    renderer.clear();
    renderer.setViewport(rect.left, vh - rect.bottom, rect.width, rect.height);
    camera.aspect = rect.width / rect.height;
    let wantFov = view.fov;
    if (!wantFov) {
      const d = camPos.distanceTo(camLook);
      const half = Math.max(fit[1] / 2, fit[0] / 2 / camera.aspect);
      wantFov = THREE.MathUtils.radToDeg(2 * Math.atan(half / d));
    }
    camera.fov = fovReady ? camera.fov + (wantFov - camera.fov) * k : wantFov;
    fovReady = true;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);

    requestAnimationFrame(frame);
  }

  wake();
  onReady?.({ count: N });

  return {
    setScene,
    wake,
    /** replay the gather-in animation (used when the scan reappears next to the projects) */
    reassemble() {
      if (reducedMotion) return;
      assembleT = 0;
      wake();
    },
    get scene() {
      return current;
    },
  };
}

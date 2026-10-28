import * as THREE from "three";
import { toCreasedNormals } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/*
 * Open Duck Mini v2 replaying a recorded MuJoCo walking rollout (public/robot/duck.*).
 * A sensor scan plane follows the cursor: the screen-space vertical line under the
 * pointer is unprojected into a world plane, parts near it light up in the shader,
 * and the nearest leg joint is read out.
 */

type MeshMeta = { name: string; v: [number, number]; f: [number, number]; u32: boolean };
type Meta = {
  fps: number;
  frames: number;
  treadmillSpeed: number;
  meshes: MeshMeta[];
  geoms: { mesh: number; body: string }[];
  joints: string[];
  offsets: { frames: number; jointFrames: number; angles: number };
};

export type ScanHit = { joint: string; deg: number; x: number; y: number };
export type FrameInfo = { frame: number; frames: number; scanX: number; hit: ScanHit | null; auto: boolean };
export type LabScene = { dispose: () => void };

type Key = { p: number; r: number; theta: number; phi: number; look: [number, number, number]; off: [number, number] };

const KEYS: Key[] = [
  { p: 0, r: 1.42, theta: 0.98, phi: 0.16, look: [0, 0.21, 0], off: [-0.21, 0.03] },
  { p: 0.22, r: 1.36, theta: 1.08, phi: 0.16, look: [0, 0.21, 0], off: [-0.21, 0.03] },
  { p: 1, r: 2.25, theta: 1.95, phi: 0.62, look: [0, 0.12, 0], off: [-0.04, 0.14] },
];

const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function camAt(p: number, portrait: boolean) {
  let i = 0;
  while (i < KEYS.length - 2 && p > KEYS[i + 1].p) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const t = smooth(clamp01((p - a.p) / (b.p - a.p)));
  const k = {
    r: lerp(a.r, b.r, t),
    theta: lerp(a.theta, b.theta, t),
    phi: lerp(a.phi, b.phi, t),
    look: a.look.map((v, j) => lerp(v, b.look[j], t)) as [number, number, number],
    off: [lerp(a.off[0], b.off[0], t), lerp(a.off[1], b.off[1], t)] as [number, number],
  };
  if (portrait) {
    k.r *= 2.15;
    k.off = [0, lerp(-0.31, 0.1, smooth(clamp01(p)))];
  }
  return k;
}

const PALETTE: [RegExp, number][] = [
  [/antenna$/, 0xb8e35c],
  [/tpu/, 0x0f1210],
  [/sheet|spacer|motor/, 0x1b201d],
  [/.*/, 0x2a312c],
];

const PRETTY: Record<string, string> = {
  hip_yaw: "HIP_YAW",
  hip_roll: "HIP_ROLL",
  hip_pitch: "HIP_PITCH",
  knee: "KNEE",
  ankle: "ANKLE",
};

const gridVert = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const gridFrag = /* glsl */ `
  uniform float uOffset;
  uniform float uOpacity;
  uniform vec3 uColor;
  uniform vec3 uScanN;
  uniform vec3 uScanC;
  varying vec3 vWorld;
  float line(vec2 p, float size, float width) {
    vec2 q = p / size;
    vec2 g = abs(fract(q - 0.5) - 0.5) / fwidth(q);
    return 1.0 - min(min(g.x, g.y) / width, 1.0);
  }
  void main() {
    vec2 p = vWorld.xz;
    p.x += uOffset;
    float minor = line(p, 0.05, 1.0);
    float major = line(p, 0.25, 1.3);
    float d = length(vWorld.xz);
    float fade = exp(-d * d * 1.3);
    float scan = 1.0 - smoothstep(0.0, 0.06, abs(dot(uScanN, vWorld - uScanC)));
    float a = (minor * 0.06 + major * 0.26 + (minor + major) * scan * 0.5) * fade * uOpacity;
    gl_FragColor = vec4(uColor, a);
  }
`;

export async function createLabScene(
  canvas: HTMLCanvasElement,
  opts: { getProgress: () => number; onFrame: (info: FrameInfo) => void; reduceMotion: boolean },
): Promise<LabScene> {
  const base = import.meta.env.BASE_URL;
  const [meta, buf] = await Promise.all([
    fetch(`${base}robot/duck.json`).then((r) => r.json() as Promise<Meta>),
    fetch(`${base}robot/duck.bin`).then((r) => r.arrayBuffer()),
  ]);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0b0d0c, 1.5, 4.4);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.25;
  const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 30);

  scene.add(new THREE.HemisphereLight(0xc9e0b0, 0x050605, 0.5));
  const key = new THREE.DirectionalLight(0xffffff, 2.0);
  key.position.set(1.0, 1.8, 1.2);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = key.shadow.camera.bottom = -0.5;
  key.shadow.camera.right = key.shadow.camera.top = 0.5;
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 4;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.01;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xb8e35c, 1.4);
  rim.position.set(-1.4, 0.9, -1.3);
  scene.add(rim);
  const amber = new THREE.DirectionalLight(0xf2a93b, 0.35);
  amber.position.set(0.6, 0.2, -1.2);
  scene.add(amber);

  // shared scan uniforms (same objects in every material)
  const scanU = {
    uScanN: { value: new THREE.Vector3(1, 0, 0) },
    uScanC: { value: new THREE.Vector3(99, 0, 0) },
    uScanColor: { value: new THREE.Color(0xb8e35c) },
    uScanWidth: { value: 0.006 },
  };

  const withScan = <M extends THREE.Material>(m: M, mode: "solid" | "line") => {
    m.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, scanU);
      shader.vertexShader = shader.vertexShader
        .replace("void main() {", "varying vec3 vScanW;\nvoid main() {")
        .replace("#include <project_vertex>", "#include <project_vertex>\nvScanW = (modelMatrix * vec4(transformed, 1.0)).xyz;");
      const band = `
        float sd = abs(dot(uScanN, vScanW - uScanC));
        float band = 1.0 - smoothstep(0.0, uScanWidth, sd);
        float halo = 1.0 - smoothstep(0.0, uScanWidth * 7.0, sd);
      `;
      const apply =
        mode === "solid"
          ? "outgoingLight += uScanColor * (band * 1.6 + halo * 0.18);"
          : "outgoingLight = mix(outgoingLight, uScanColor * 1.8, band); diffuseColor.a = max(diffuseColor.a, band + halo * 0.35);";
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "void main() {",
          "uniform vec3 uScanN;\nuniform vec3 uScanC;\nuniform vec3 uScanColor;\nuniform float uScanWidth;\nvarying vec3 vScanW;\nvoid main() {",
        )
        .replace("#include <opaque_fragment>", `${band}\n${apply}\n#include <opaque_fragment>`);
    };
    m.customProgramCacheKey = () => `scan-${mode}`;
    return m;
  };

  // floor
  const gridMat = new THREE.ShaderMaterial({
    vertexShader: gridVert,
    fragmentShader: gridFrag,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uOffset: { value: 0 },
      uOpacity: { value: 1 },
      uColor: { value: new THREE.Color(0xb8e35c) },
      uScanN: scanU.uScanN,
      uScanC: scanU.uScanC,
    },
  });
  const floorGeo = new THREE.PlaneGeometry(12, 12);
  floorGeo.rotateX(-Math.PI / 2);
  scene.add(new THREE.Mesh(floorGeo, gridMat));
  const shadowGeo = new THREE.PlaneGeometry(3, 3);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadow = new THREE.Mesh(shadowGeo, new THREE.ShadowMaterial({ opacity: 0.6 }));
  shadow.position.y = 0.0005;
  shadow.receiveShadow = true;
  scene.add(shadow);

  const root = new THREE.Group();
  root.rotation.x = -Math.PI / 2; // MuJoCo Z-up → three Y-up
  scene.add(root);

  const geometries = meta.meshes.map((mm) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(buf, mm.v[0], mm.v[1] * 3), 3));
    const idx = mm.u32 ? new Uint32Array(buf, mm.f[0], mm.f[1] * 3) : new Uint16Array(buf, mm.f[0], mm.f[1] * 3);
    g.setIndex(new THREE.BufferAttribute(idx, 1));
    return { solid: toCreasedNormals(g, Math.PI / 5), edges: new THREE.EdgesGeometry(g, 40) };
  });

  const materials = new Map<number, THREE.MeshStandardMaterial>();
  const matFor = (name: string) => {
    const [, color] = PALETTE.find(([re]) => re.test(name))!;
    if (!materials.has(color)) {
      const antenna = color === 0xb8e35c;
      materials.set(
        color,
        withScan(
          new THREE.MeshStandardMaterial({
            color,
            roughness: antenna ? 0.4 : 0.6,
            metalness: antenna ? 0.1 : 0.35,
            emissive: antenna ? 0xb8e35c : 0x000000,
            emissiveIntensity: antenna ? 0.5 : 0,
          }),
          "solid",
        ),
      );
    }
    return materials.get(color)!;
  };
  const edgeMat = withScan(
    new THREE.LineBasicMaterial({
      color: 0xb8e35c,
      transparent: true,
      opacity: 0.32,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
    "line",
  );

  const parts = meta.geoms.map((g) => {
    const mesh = new THREE.Mesh(geometries[g.mesh].solid, matFor(meta.meshes[g.mesh].name));
    mesh.castShadow = true;
    mesh.matrixAutoUpdate = false;
    mesh.add(new THREE.LineSegments(geometries[g.mesh].edges, edgeMat));
    root.add(mesh);
    return mesh;
  });

  // joint frames
  const triadGeo = new THREE.BufferGeometry();
  const L = 0.036;
  triadGeo.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0, L, 0, 0, 0, 0, 0, 0, L, 0, 0, 0, 0, 0, 0, L], 3));
  const Rc = [1, 0.4, 0.36];
  const Gc = [0.72, 0.9, 0.36];
  const Bc = [0.4, 0.62, 1];
  triadGeo.setAttribute("color", new THREE.Float32BufferAttribute([...Rc, ...Rc, ...Gc, ...Gc, ...Bc, ...Bc], 3));
  const triadFaint = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.22, depthTest: false });
  const triadHot = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 1, depthTest: false });
  const triads = meta.joints.map(() => {
    const g = new THREE.LineSegments(triadGeo, triadFaint);
    g.matrixAutoUpdate = false;
    g.renderOrder = 10;
    root.add(g);
    return g;
  });

  const F = meta.frames;
  const NG = meta.geoms.length;
  const NJ = meta.joints.length;
  const frames = new Float32Array(buf, meta.offsets.frames, F * NG * 7);
  const jframes = new Float32Array(buf, meta.offsets.jointFrames, F * NJ * 7);
  const angles = new Float32Array(buf, meta.offsets.angles, F * NJ);
  const jointLabel = meta.joints.map((n) => {
    const [side, ...rest] = n.split("_");
    return `${side === "left" ? "L" : "R"}_${PRETTY[rest.join("_")] ?? rest.join("_").toUpperCase()}`;
  });

  const qa = new THREE.Quaternion();
  const qb = new THREE.Quaternion();
  const pa = new THREE.Vector3();
  const pb = new THREE.Vector3();
  const one = new THREE.Vector3(1, 1, 1);
  const pose = (arr: Float32Array, stride: number, i: number, f0: number, f1: number, a: number, out: THREE.Matrix4) => {
    const o0 = (f0 * stride + i) * 7;
    const o1 = (f1 * stride + i) * 7;
    pa.set(arr[o0], arr[o0 + 1], arr[o0 + 2]).lerp(pb.set(arr[o1], arr[o1 + 1], arr[o1 + 2]), a);
    qa.set(arr[o0 + 4], arr[o0 + 5], arr[o0 + 6], arr[o0 + 3]).slerp(qb.set(arr[o1 + 4], arr[o1 + 5], arr[o1 + 6], arr[o1 + 3]), a);
    out.compose(pa, qa, one);
  };

  let W = 1;
  let H = 1;
  let portrait = false;
  let rect = canvas.getBoundingClientRect();
  const resize = () => {
    rect = canvas.getBoundingClientRect();
    W = Math.max(1, rect.width);
    H = Math.max(1, rect.height);
    portrait = W / H < 0.9;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, portrait ? 1.5 : 1.75));
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  // pointer: fine pointers drive the scan; otherwise it sweeps on its own
  const ptr = { x: 0, y: 0, sx: 0, sy: 0, px: -1, active: false };
  const fine = matchMedia("(pointer: fine)").matches;
  const onPointer = (e: PointerEvent) => {
    ptr.x = (e.clientX / window.innerWidth) * 2 - 1;
    ptr.y = (e.clientY / window.innerHeight) * 2 - 1;
    rect = canvas.getBoundingClientRect();
    const inside = e.clientY >= rect.top && e.clientY <= rect.bottom;
    ptr.active = fine && e.pointerType === "mouse" && inside;
    if (ptr.active) ptr.px = e.clientX - rect.left;
  };
  const onLeave = () => (ptr.active = false);
  window.addEventListener("pointermove", onPointer, { passive: true });
  document.addEventListener("pointerleave", onLeave);

  let t = 0;
  let last = performance.now();
  let floorOffset = 0;
  let scanX = W * 0.7;
  let raf = 0;
  let running = false;
  const m4 = new THREE.Matrix4();
  const v3 = new THREE.Vector3();
  const look = new THREE.Vector3();
  const d1 = new THREE.Vector3();
  const d2 = new THREE.Vector3();
  const screen = new Array(NJ).fill(0).map(() => ({ x: 0, y: 0 }));

  const render = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!opts.reduceMotion) {
      t += dt;
      floorOffset += meta.treadmillSpeed * dt;
    }
    // scroll progress can be NaN before layout is measured; never let it reach the camera
    const raw = opts.getProgress();
    const p = Number.isFinite(raw) ? clamp01(raw) : 0;

    const f = (t * meta.fps) % F;
    const f0 = Math.floor(f);
    const f1 = (f0 + 1) % F;
    const a = f - f0;
    for (let i = 0; i < NG; i++) pose(frames, NG, i, f0, f1, a, parts[i].matrix);
    for (let j = 0; j < NJ; j++) pose(jframes, NJ, j, f0, f1, a, triads[j].matrix);
    gridMat.uniforms.uOffset.value = floorOffset;
    gridMat.uniforms.uOpacity.value = 1 - smooth(clamp01((p - 0.6) / 0.4)) * 0.6;

    ptr.sx += (ptr.x - ptr.sx) * 0.05;
    ptr.sy += (ptr.y - ptr.sy) * 0.05;
    const k = camAt(p, portrait);
    const theta = k.theta + ptr.sx * 0.07;
    const phi = Math.max(0.02, k.phi - ptr.sy * 0.035);
    look.set(...k.look);
    camera.position.set(
      look.x + k.r * Math.cos(phi) * Math.cos(theta),
      look.y + k.r * Math.sin(phi),
      look.z + k.r * Math.cos(phi) * Math.sin(theta),
    );
    camera.lookAt(look);
    camera.setViewOffset(W, H, k.off[0] * W, k.off[1] * H, W, H);
    camera.updateMatrixWorld();
    scene.updateMatrixWorld();

    // project joints, find the robot's screen span for the auto sweep
    let minX = Infinity;
    let maxX = -Infinity;
    for (let j = 0; j < NJ; j++) {
      m4.multiplyMatrices(root.matrixWorld, triads[j].matrix);
      v3.setFromMatrixPosition(m4).project(camera);
      screen[j].x = (v3.x * 0.5 + 0.5) * W;
      screen[j].y = (-v3.y * 0.5 + 0.5) * H;
      minX = Math.min(minX, screen[j].x);
      maxX = Math.max(maxX, screen[j].x);
    }
    const span = Math.max(80, maxX - minX);
    const target = ptr.active
      ? ptr.px
      : (minX + maxX) / 2 + span * 0.9 * (opts.reduceMotion ? 0.2 : Math.sin(now / 1900));
    // the beam eases toward its target, so one bad frame would poison it for good
    if (Number.isFinite(target)) scanX = Number.isFinite(scanX) ? scanX + (target - scanX) * (ptr.active ? 0.22 : 0.08) : target;

    // screen line → world plane through the camera
    const ndc = (scanX / W) * 2 - 1;
    d1.set(ndc, -0.6, 0.5).unproject(camera).sub(camera.position);
    d2.set(ndc, 0.6, 0.5).unproject(camera).sub(camera.position);
    scanU.uScanN.value.crossVectors(d1, d2).normalize();
    scanU.uScanC.value.copy(camera.position);
    scanU.uScanWidth.value = 0.0045 * (k.r / 1.4);

    // nearest joint to the beam
    let best = -1;
    let bestD = Infinity;
    for (let j = 0; j < NJ; j++) {
      const dx = Math.abs(screen[j].x - scanX);
      if (dx < bestD) {
        bestD = dx;
        best = j;
      }
    }
    const hitOn = best >= 0 && bestD < Math.max(26, span * 0.18);
    triads.forEach((tr, j) => (tr.material = hitOn && j === best ? triadHot : triadFaint));
    const hit: ScanHit | null = hitOn
      ? {
          joint: jointLabel[best],
          deg: lerp(angles[f0 * NJ + best], angles[f1 * NJ + best], a),
          x: screen[best].x,
          y: screen[best].y,
        }
      : null;

    opts.onFrame({ frame: f0, frames: F, scanX, hit, auto: !ptr.active });
    renderer.render(scene, camera);
  };

  const loop = (now: number) => {
    render(now);
    raf = requestAnimationFrame(loop);
  };
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !running) {
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    } else if (!e.isIntersecting && running) {
      running = false;
      cancelAnimationFrame(raf);
    }
  });
  io.observe(canvas);
  render(performance.now());

  return {
    dispose: () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("pointerleave", onLeave);
      geometries.forEach((g) => {
        g.solid.dispose();
        g.edges.dispose();
      });
      materials.forEach((m) => m.dispose());
      [edgeMat, triadFaint, triadHot, gridMat].forEach((m) => m.dispose());
      [triadGeo, floorGeo, shadowGeo].forEach((g) => g.dispose());
      scene.environment?.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}

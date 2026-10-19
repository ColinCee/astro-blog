// The 2018 network in 3D: every layer as a slab of its real maps, playing
// through a clip of the game. Drag to orbit, scroll or pinch to zoom; click a
// map to see where on the screen it looks, or a move to see what drove it.
// Data and atlases come from tools/explode.py in the dissertation repo: each
// layer is one PNG with a tile per moment of the clip, maps in a grid inside.
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type Layer = {
  name: string;
  png: string;
  maps: number;
  cols: number;
  rows: number;
  h: number;
  w: number;
  tile_h: number;
  tile_w: number;
  kernel?: number;
  stride?: number;
};
type Net = {
  frames: number;
  actions: string[];
  chosen: string[];
  q: number[][];
  layers: Layer[];
  saliency: string[];
};
type Pick = { kind: "map"; layer: number; map: number } | { kind: "move"; move: number };

const SCALE = 0.02; // world units per atlas pixel
const SPACING = [0, 4.2, 7.6, 10.4, 12.8, 15.2]; // x of each layer, then the moves

// A CSS colour (oklch tokens included) as RGB, by letting a canvas resolve it.
function rgb(css: string): [number, number, number] {
  const c = document.createElement("canvas").getContext("2d")!;
  c.fillStyle = css;
  c.fillRect(0, 0, 1, 1);
  const d = c.getImageData(0, 0, 1, 1).data;
  return [d[0], d[1], d[2]];
}

function pixels(img: HTMLImageElement): ImageData {
  const c = document.createElement("canvas");
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const x = c.getContext("2d")!;
  x.drawImage(img, 0, 0);
  return x.getImageData(0, 0, c.width, c.height);
}

export async function mount(root: HTMLElement) {
  const base = root.dataset.src!;
  const net: Net = await (await fetch(base + "net.json")).json();
  const n = net.frames;
  const style = getComputedStyle(root);
  const accent = rgb(style.getPropertyValue("--accent"));
  const lineCol = rgb(style.getPropertyValue("--faint"));
  const barCol = rgb(style.getPropertyValue("--muted"));
  const moveNames = net.actions.map((a) => a.replace(/^ACTION_/, "").toLowerCase().replace("use", "shoot"));

  const stage = root.querySelector<HTMLElement>(".n3-stage")!;
  const panel = root.querySelector<HTMLElement>(".n3-panel")!;
  const slider = root.querySelector<HTMLInputElement>("input[type=range]")!;
  const playBtn = root.querySelector<HTMLButtonElement>("[data-play]")!;
  const resetBtn = root.querySelector<HTMLButtonElement>("[data-reset]")!;
  slider.max = String(n - 1);
  stage.textContent = "";

  // ---- scene ----
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  stage.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 2, 0.1, 200);
  const home = new THREE.Vector3(-3.2, 4.2, 12.5);
  const target = new THREE.Vector3(7.4, 0, 0);
  camera.position.copy(home);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(target);
  controls.enableDamping = true;
  controls.minDistance = 3;
  controls.maxDistance = 40;
  // On touch screens one finger scrolls the page; two fingers rotate and zoom.
  controls.touches = { ONE: null as unknown as THREE.TOUCH, TWO: THREE.TOUCH.DOLLY_ROTATE };
  renderer.domElement.style.touchAction = "pan-y";

  const loader = new THREE.TextureLoader();
  const load = (png: string) =>
    new Promise<THREE.Texture>((ok) =>
      loader.load(base + png, (t) => {
        t.magFilter = THREE.NearestFilter;
        t.minFilter = THREE.NearestFilter;
        t.generateMipmaps = false;
        t.colorSpace = THREE.SRGBColorSpace;
        t.repeat.set(1, 1 / n);
        ok(t);
      }),
    );
  const textures = await Promise.all(net.layers.map((L) => load(L.png)));
  const images = textures.map((t) => t.image as HTMLImageElement);
  const data = images.map(pixels);
  const salImages = await Promise.all(
    net.saliency.map(
      (png) =>
        new Promise<HTMLImageElement>((ok) => {
          const i = new Image();
          i.onload = () => ok(i);
          i.src = base + png;
        }),
    ),
  );
  const salData = salImages.map(pixels);

  const edgeMat = new THREE.LineBasicMaterial({ color: new THREE.Color(...lineCol.map((v) => v / 255)) });
  const label = (text: string) => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 48;
    const x = c.getContext("2d")!;
    x.fillStyle = `rgb(${lineCol.join(",")})`;
    x.font = "26px JetBrains Mono, monospace";
    x.textAlign = "center";
    x.fillText(text, 128, 32);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true }));
    sp.scale.set(1.6, 0.3, 1);
    return sp;
  };

  // Each layer: a plane facing the flow (the x axis), one tile of its atlas.
  const planes: THREE.Mesh[] = [];
  const corners: THREE.Vector3[][] = [];
  net.layers.forEach((L, i) => {
    const w = L.tile_w * SCALE;
    const h = L.tile_h * SCALE;
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ map: textures[i], side: THREE.DoubleSide }),
    );
    mesh.rotation.y = -Math.PI / 2; // front face towards -x, where the camera starts; tile left edge at -z
    mesh.position.set(SPACING[i], 0, 0);
    mesh.userData.layer = i;
    scene.add(mesh);
    planes.push(mesh);
    const edge = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), edgeMat);
    edge.rotation.y = mesh.rotation.y;
    edge.position.copy(mesh.position);
    scene.add(edge);
    const tag = label(i === 0 ? "input" : L.name);
    tag.position.set(SPACING[i], h / 2 + 0.35, 0);
    scene.add(tag);
    corners.push(
      [
        [-1, -1],
        [-1, 1],
        [1, 1],
        [1, -1],
      ].map(([a, b]) => new THREE.Vector3(SPACING[i], (b * h) / 2, (a * w) / 2)),
    );
  });
  // Faint lines from each layer's corners to the next: the flow.
  const link: number[] = [];
  for (let i = 0; i + 1 < corners.length; i++)
    for (let c = 0; c < 4; c++) link.push(...corners[i][c].toArray(), ...corners[i + 1][c].toArray());
  const lineMat = new THREE.LineBasicMaterial({
    color: new THREE.Color(...lineCol.map((v) => v / 255)),
    transparent: true,
    opacity: 0.5,
  });
  const linkGeo = new THREE.BufferGeometry();
  linkGeo.setAttribute("position", new THREE.Float32BufferAttribute(link, 3));
  scene.add(new THREE.LineSegments(linkGeo, lineMat));

  // The moves: three bars standing on the floor of the last slab.
  const accentCol = new THREE.Color(...accent.map((v) => v / 255));
  const greyCol = new THREE.Color(...barCol.map((v) => v / 255));
  const bars = moveNames.map((_, k) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1, 0.35), new THREE.MeshBasicMaterial({ color: greyCol }));
    m.position.set(SPACING[5], 0, (k - 1) * 0.6);
    m.userData.move = k;
    scene.add(m);
    return m;
  });
  moveNames.forEach((name, k) => {
    const tag = label(name);
    tag.scale.set(1.2, 0.22, 1);
    tag.position.set(SPACING[5], -1.15, (k - 1) * 0.6);
    scene.add(tag);
  });

  // Outline on the picked map.
  const outline = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.PlaneGeometry(1, 1)),
    new THREE.LineBasicMaterial({ color: accentCol }),
  );
  outline.rotation.y = -Math.PI / 2;
  outline.visible = false;
  scene.add(outline);

  // ---- state ----
  let frame = 0;
  let pick: Pick = { kind: "move", move: net.actions.indexOf(net.chosen[0]) };

  const mapRect = (L: Layer, m: number) => {
    const r = Math.floor(m / L.cols);
    const c = m % L.cols;
    return { x: 1 + c * (L.w + 1), y: 1 + r * (L.h + 1) };
  };

  const setFrame = (t: number) => {
    frame = t;
    for (const tex of textures) tex.offset.y = 1 - (t + 1) / n;
    const q = net.q[t];
    const lo = Math.min(...q);
    const span = Math.max(...q) - lo || 1;
    bars.forEach((b, k) => {
      const hgt = 0.25 + (1.6 * (q[k] - lo)) / span;
      b.scale.y = hgt;
      b.position.y = -0.9 + hgt / 2;
      (b.material as THREE.MeshBasicMaterial).color = net.chosen[t] === net.actions[k] ? accentCol : greyCol;
    });
    slider.value = String(t);
    drawPanel();
  };

  const placeOutline = () => {
    if (pick.kind !== "map") {
      outline.visible = false;
      return;
    }
    const L = net.layers[pick.layer];
    const { x, y } = mapRect(L, pick.map);
    const w = L.w * SCALE;
    const h = L.h * SCALE;
    outline.scale.set(w + 0.04, h + 0.04, 1);
    // After the rotation, plane-local x runs along world z.
    const z = (x + L.w / 2) * SCALE - (L.tile_w * SCALE) / 2;
    const yy = (L.tile_h * SCALE) / 2 - (y + L.h / 2) * SCALE;
    outline.position.set(SPACING[pick.layer] - 0.01, yy, z);
    outline.visible = true;
  };

  // ---- panel ----
  const frameCanvas = (zoom: number, src: HTMLImageElement, sx: number, sy: number, w: number, h: number) => {
    const c = document.createElement("canvas");
    c.width = w * zoom;
    c.height = h * zoom;
    const x = c.getContext("2d")!;
    x.imageSmoothingEnabled = false;
    x.drawImage(src, sx, sy, w, h, 0, 0, w * zoom, h * zoom);
    return c;
  };
  const tint = (c: HTMLCanvasElement, heat: Float32Array, w: number, h: number, zoom: number) => {
    const x = c.getContext("2d")!;
    const img = x.getImageData(0, 0, c.width, c.height);
    for (let yy = 0; yy < c.height; yy++)
      for (let xx = 0; xx < c.width; xx++) {
        const a = Math.min(0.85, heat[Math.floor(yy / zoom) * w + Math.floor(xx / zoom)] * 0.9);
        const i = (yy * c.width + xx) * 4;
        for (let k = 0; k < 3; k++) img.data[i + k] = img.data[i + k] * (1 - a) + accent[k] * a;
      }
    x.putImageData(img, 0, 0);
  };
  // Newest input frame of the current moment: tile cell 3 of the 2 × 2 input grid.
  const inputFrame = () => {
    const L = net.layers[0];
    const { x, y } = mapRect(L, 3);
    return { x, y: frame * L.tile_h + y, w: L.w, h: L.h };
  };

  function drawPanel() {
    const zoom = Math.max(2, Math.min(4, Math.floor(panel.clientWidth / 160)));
    const f = inputFrame();
    const screen = frameCanvas(zoom, images[0], f.x, f.y, f.w, f.h);
    const heat = new Float32Array(f.w * f.h);
    let title = "";
    let text = "";
    let extra: HTMLCanvasElement | null = null;
    if (pick.kind === "move") {
      const k = pick.move;
      // Saliency for this move on the newest frame (cell 3 of the 2 × 2 grid).
      const L = net.layers[0];
      const { x, y } = mapRect(L, 3);
      const d = salData[k];
      for (let yy = 0; yy < f.h; yy++)
        for (let xx = 0; xx < f.w; xx++)
          heat[yy * f.w + xx] = d.data[((frame * L.tile_h + y + yy) * d.width + x + xx) * 4] / 252;
      title = `${moveNames[k]}: value ${net.q[frame][k].toFixed(2)}${net.chosen[frame] === net.actions[k] ? ", the move it makes" : ""}`;
      text = "Where on the screen changes this move's value most.";
    } else {
      const L = net.layers[pick.layer];
      const { x, y } = mapRect(L, pick.map);
      const d = data[pick.layer];
      const act: number[] = [];
      for (let yy = 0; yy < L.h; yy++)
        for (let xx = 0; xx < L.w; xx++) act.push(d.data[((frame * L.tile_h + y + yy) * d.width + x + xx) * 4] / 255);
      if (pick.layer === 0) {
        title = `Input frame ${pick.map + 1} of 4`;
        text = "What the network sees: grey, half size. Four frames in a row, so it can tell what is moving.";
        extra = frameCanvas(zoom, images[0], x, frame * L.tile_h + y, L.w, L.h);
      } else if (pick.layer === 4) {
        title = `Hidden unit ${pick.map + 1} of 512: ${act[0] > 0 ? "active" : "silent"}`;
        text = "Each of these sees the whole screen at once, through all three layers. Together they give the three move values.";
      } else {
        // Receptive field: which input pixels each unit of this map sees.
        let reach = 1;
        let jump = 1;
        for (let i = 1; i <= pick.layer; i++) {
          reach += (net.layers[i].kernel! - 1) * jump;
          jump *= net.layers[i].stride!;
        }
        for (let yy = 0; yy < L.h; yy++)
          for (let xx = 0; xx < L.w; xx++) {
            const v = act[yy * L.w + xx];
            if (!v) continue;
            for (let a = yy * jump; a < Math.min(f.h, yy * jump + reach); a++)
              for (let b = xx * jump; b < Math.min(f.w, xx * jump + reach); b++) heat[a * f.w + b] += v;
          }
        const top = Math.max(...heat) || 1;
        for (let i = 0; i < heat.length; i++) heat[i] /= top;
        title = `${L.name}, map ${pick.map + 1} of ${L.maps}`;
        text = `Each of its ${L.h} × ${L.w} units looks at ${reach === 8 ? "an" : "a"} ${reach} × ${reach} patch of the screen and lights up when it finds this map's pattern. Tinted: where it is lit now.`;
        extra = frameCanvas(Math.max(2, Math.floor(60 / L.h)), images[pick.layer], x, frame * L.tile_h + y, L.w, L.h);
      }
    }
    if (pick.kind === "move" || (pick.kind === "map" && pick.layer >= 1 && pick.layer <= 3)) tint(screen, heat, f.w, f.h, zoom);
    panel.replaceChildren();
    const b = document.createElement("b");
    b.textContent = title;
    const p = document.createElement("p");
    p.textContent = text;
    panel.appendChild(b);
    panel.appendChild(p);
    const row = document.createElement("div");
    row.className = "n3-imgs";
    if (extra) row.appendChild(extra);
    if (!(pick.kind === "map" && pick.layer === 0)) row.appendChild(screen);
    panel.appendChild(row);
    placeOutline();
  }

  // ---- picking ----
  const ray = new THREE.Raycaster();
  let down = { x: 0, y: 0 };
  renderer.domElement.addEventListener("pointerdown", (e) => (down = { x: e.clientX, y: e.clientY }));
  renderer.domElement.addEventListener("pointerup", (e) => {
    if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) return; // a drag, not a click
    const r = renderer.domElement.getBoundingClientRect();
    ray.setFromCamera(
      new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1),
      camera,
    );
    const hit = ray.intersectObjects([...planes, ...bars])[0];
    if (!hit) return;
    if (hit.object.userData.move !== undefined) pick = { kind: "move", move: hit.object.userData.move };
    else {
      const li = hit.object.userData.layer as number;
      const L = net.layers[li];
      const px = hit.uv!.x * L.tile_w;
      const py = (1 - hit.uv!.y) * L.tile_h;
      const c = Math.floor((px - 1) / (L.w + 1));
      const rr = Math.floor((py - 1) / (L.h + 1));
      const m = rr * L.cols + c;
      if (c < 0 || rr < 0 || c >= L.cols || m >= L.maps) return;
      pick = { kind: "map", layer: li, map: m };
    }
    drawPanel();
  });

  // ---- playback ----
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let playing = !still;
  let visible = false;
  let timer = 0;
  const sync = () => {
    clearInterval(timer);
    if (playing && visible) timer = window.setInterval(() => setFrame((frame + 1) % n), 400);
    playBtn.textContent = playing ? "Pause" : "Play";
  };
  playBtn.addEventListener("click", () => {
    playing = !playing;
    sync();
  });
  slider.addEventListener("input", () => {
    playing = false;
    sync();
    setFrame(Number(slider.value));
  });
  // The starting view backs off on narrow screens so the whole network fits.
  const homeFor = () => target.clone().add(home.clone().sub(target).multiplyScalar(Math.max(1, 1.78 / camera.aspect)));
  resetBtn.addEventListener("click", () => {
    camera.position.copy(homeFor());
    controls.target.copy(target);
  });

  let first = true;
  const resize = () => {
    const w = stage.clientWidth;
    const h = Math.max(260, Math.round(w * (w < 500 ? 0.7 : 0.56)));
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (first) {
      camera.position.copy(homeFor());
      first = false;
    }
  };
  new ResizeObserver(resize).observe(stage);
  resize();

  let raf = 0;
  const loop = () => {
    controls.update();
    renderer.render(scene, camera);
    raf = requestAnimationFrame(loop);
  };
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    cancelAnimationFrame(raf);
    if (visible) loop();
    sync();
  }).observe(root);

  setFrame(0);
}

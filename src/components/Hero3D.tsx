'use client';
import { useEffect, useRef, useState } from 'react';
import type * as T from 'three';

type ThreeLib = typeof import('three');

function build(THREE: ThreeLib, canvas: HTMLCanvasElement) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.setClearColor(0x000000, 0);

  // Studio-style reflections for the steel
  const pm = new THREE.PMREMGenerator(renderer);
  const env = new THREE.Scene();
  env.background = new THREE.Color(0x0f1a1e);
  const panel = (w: number, h: number, x: number, y: number, z: number, i: number, c = 0xffffff) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(i), side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m);
  };
  panel(9, 6, 0, 8, 3, 4.5); panel(4, 9, -8, 1, 3, 3); panel(4, 9, 8, 1, -2, 2.4, 0xffe2b0);
  panel(12, 3, 0, -2, 8, 1.8); panel(7, 6, 0, 3, -9, 0.9);
  const scene = new THREE.Scene();
  scene.environment = pm.fromScene(env, 0.02).texture;
  const key = new THREE.DirectionalLight(0xfff1d8, 1.3); key.position.set(3, 5, 6); scene.add(key);
  const rim = new THREE.DirectionalLight(0x9fd8ff, 0.9); rim.position.set(-5, 2, -4); scene.add(rim);

  const steel = new THREE.MeshStandardMaterial({ color: 0xcfd6da, metalness: 1, roughness: 0.24, side: THREE.DoubleSide });
  const soft = new THREE.MeshStandardMaterial({ color: 0xc4ccd0, metalness: 1, roughness: 0.4 });
  const copper = new THREE.MeshStandardMaterial({ color: 0xb8683a, metalness: 1, roughness: 0.3, side: THREE.DoubleSide });
  const V = (x: number, y: number) => new THREE.Vector2(x, y);
  const lathe = (pts: [number, number][], mat: T.Material) =>
    new THREE.Mesh(new THREE.LatheGeometry(pts.map(([x, y]) => V(x, y)), 72), mat);

  function kadai() {
    const g = new THREE.Group();
    g.add(lathe([[0, 0], [.5, 0], [.7, .08], [.95, .32], [1.1, .6], [1.14, .64]], steel));
    g.add(lathe([[0, -.006], [.52, -.006], [.72, .086], [.84, .19]].map(([x, y]) => [x * 1.005, y]) as [number, number][], copper));
    [1, -1].forEach((s) => {
      const h = new THREE.Mesh(new THREE.TorusGeometry(.17, .03, 12, 28, Math.PI), steel);
      h.position.set(1.14 * s, .6, 0); h.rotation.z = -s * Math.PI / 2; g.add(h);
    });
    return g;
  }
  function tope() {
    const g = new THREE.Group();
    g.add(lathe([[0, 0], [.62, 0], [.66, .05], [.66, .95], [.78, .97], [.8, 1.02], [.66, 1.03]], steel));
    g.add(lathe([[0, 1.03], [.2, 1.1], [.5, 1.06], [.8, 1.03]], soft));
    const knob = new THREE.Mesh(new THREE.SphereGeometry(.09, 24, 16), steel); knob.position.y = 1.13; g.add(knob);
    g.add(lathe([[0, -.006], [.63, -.006], [.67, .05], [.67, .16]], copper));
    return g;
  }
  function saucepan() {
    const g = new THREE.Group();
    g.add(lathe([[0, 0], [.48, 0], [.5, .04], [.5, .5], [.55, .52], [.5, .53]], steel));
    g.add(lathe([[0, -.006], [.49, -.006], [.51, .04], [.51, .13]], copper));
    const h = new THREE.Mesh(new THREE.CylinderGeometry(.04, .05, 1.3, 16), steel);
    h.rotation.z = Math.PI / 2; h.position.set(1.1, .42, 0); g.add(h);
    return g;
  }

  const model = new THREE.Group();
  const a = kadai(); a.position.set(-.5, -.55, .9); a.scale.setScalar(1.05); model.add(a);
  const b = tope(); b.position.set(1.55, -.6, -.5); b.rotation.y = -.5; model.add(b);
  const c = saucepan(); c.position.set(.2, -.6, -1.3); c.rotation.y = .5; model.add(c);
  model.rotation.x = .4;
  model.updateMatrixWorld(true);

  // Fit the camera to the exact bounding radius
  const box = new THREE.Box3().setFromObject(model), ctr = box.getCenter(new THREE.Vector3());
  let R = 0; const v = new THREE.Vector3();
  model.traverse((o) => {
    const m = o as T.Mesh;
    if (!m.isMesh) return;
    const pos = m.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld).sub(ctr); R = Math.max(R, v.length()); }
  });
  const pivot = new THREE.Group(); model.position.sub(ctr); pivot.add(model); scene.add(pivot);
  const cam = new THREE.PerspectiveCamera(30, 1, .1, 100);

  const pointer = { x: 0, y: 0 };
  const onMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1; pointer.y = ((e.clientY - r.top) / r.height) * 2 - 1;
  };
  canvas.addEventListener('pointermove', onMove);

  const resize = () => {
    const p = canvas.parentElement!, w = p.clientWidth, h = p.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
    const vf = cam.fov * Math.PI / 360, hf = Math.atan(Math.tan(vf) * cam.aspect);
    const d = Math.max(R * .86 / Math.sin(vf), R * .86 / Math.sin(hf));
    cam.position.set(0, 0, d); cam.lookAt(0, 0, 0);
  };
  const ro = new ResizeObserver(resize); ro.observe(canvas.parentElement!); resize();

  let raf = 0, visible = true, last = performance.now();
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
  io.observe(canvas);
  const tick = (t: number) => {
    raf = requestAnimationFrame(tick);
    if (!visible) return;
    const dt = Math.min((t - last) / 1000, .05); last = t;
    const sway = reduced ? 0 : Math.sin(t / 1000 * .45) * .3;
    pivot.rotation.y += (sway + pointer.x * .4 - .3 - pivot.rotation.y) * Math.min(1, dt * 2.5);
    pivot.rotation.x = pointer.y * .1;
    pivot.position.y = reduced ? 0 : Math.sin(t / 1000 * .9) * .05;
    renderer.render(scene, cam);
  };
  raf = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); canvas.removeEventListener('pointermove', onMove);
    scene.traverse((o) => { const m = o as T.Mesh; if (m.isMesh) m.geometry.dispose(); });
    renderer.dispose();
  };
}

export default function Hero3D() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let dead = false; let cleanup = () => {};
    import('three').then((THREE) => {
      if (dead || !ref.current) return;
      try { cleanup = build(THREE, ref.current); } catch { setFailed(true); }
    }).catch(() => setFailed(true));
    return () => { dead = true; cleanup(); };
  }, []);
  if (failed) return null;
  return <canvas ref={ref} className="block size-full" aria-label="3D view of stainless steel cookware" role="img" />;
}

import * as THREE from "./vendor/three.module.min.js";
import { createMasterTimeline, motionMetrics } from "./motion/master-timeline.js";
import { ParticleSystem } from "./webgl/particle-system.js";
import { GoldThreadSystem } from "./webgl/gold-thread-system.js";
import { createPostProcessingState } from "./webgl/post-processing.js";
import { syncDepthWorld } from "./webgl/wave-field.js";
import { detectQuality, getQualityProfile } from "./interaction/performance-mode.js";

const canvas = document.querySelector("#cinematicWebgl");
const debugTimeline = document.querySelector("#debugTimeline");
const query = new URLSearchParams(window.location.search);
const showreelMode = query.get("showreel") === "1";
const debugMode = query.get("debugTimeline") === "1";
const qualityName = detectQuality();
const quality = getQualityProfile(qualityName);

document.body.dataset.quality = qualityName;

let renderer;
let scene;
let camera;
let particleSystem;
let goldThreadSystem;
let controller;
let last = performance.now();
let frames = 0;
let fps = 60;
let fpsTime = performance.now();

if (canvas && window.WebGLRenderingContext) {
  initWebGL();
}

function initWebGL() {
  renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: qualityName !== "low",
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(quality.pixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight, false);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 80);
  camera.position.set(0, 0, 8);

  const post = createPostProcessingState(document.documentElement);
  particleSystem = new ParticleSystem({ scene, profile: quality, canvas });
  goldThreadSystem = new GoldThreadSystem({ scene });
  controller = createMasterTimeline({
    particleSystem,
    goldThreadSystem,
    post,
    onUpdate: updateDebugPanel,
  });

  window.addEventListener("resize", resize, { passive: true });
  requestAnimationFrame(render);

  if (showreelMode) {
    window.setTimeout(() => controller.play(), 950);
  } else {
    document.body.classList.add("cinematic-ready");
    document.documentElement.style.setProperty("--camera-zoom", "1");
    document.documentElement.style.setProperty("--hero-scale-live", "1");
    document.documentElement.style.setProperty("--bg-scale-live", "1");
    document.documentElement.style.setProperty("--thread-intensity", "0.35");
  }
}

function resize() {
  if (!renderer || !camera) return;
  renderer.setPixelRatio(quality.pixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

function render(now) {
  const delta = Math.min(0.05, (now - last) / 1000);
  last = now;
  frames += 1;
  if (now - fpsTime > 500) {
    fps = Math.round(frames * 1000 / (now - fpsTime));
    frames = 0;
    fpsTime = now;
  }
  const cameraState = controller?.cameraState || { x: 0, y: 0, z: 8, rotationY: 0, zoom: 1, particleBrightness: 0.2, thread: 0.2 };
  camera.position.set(cameraState.x, cameraState.y, cameraState.z);
  camera.rotation.y = cameraState.rotationY;
  camera.zoom = cameraState.zoom;
  camera.updateProjectionMatrix();
  particleSystem?.update(delta, now / 1000, cameraState);
  goldThreadSystem?.update(delta, cameraState);
  syncDepthWorld(Number(document.documentElement.style.getPropertyValue("--camera-zoom")) || 0, cameraState);
  renderer?.render(scene, camera);
  requestAnimationFrame(render);
}

function updateDebugPanel(second, sceneState, cameraState) {
  if (!debugTimeline || !debugMode) return;
  const progress = ((second % motionMetrics.duration) / motionMetrics.duration * 100);
  const small = debugTimeline.querySelector("small");
  debugTimeline.querySelector("b").textContent = `${second.toFixed(2)}s`;
  debugTimeline.querySelector("span").textContent = `${sceneState.name} / ${document.body.dataset.activePanel || "home"}`;
  debugTimeline.querySelector("i").style.width = `${progress.toFixed(1)}%`;
  if (small) {
    small.textContent = `CAM ${cameraState.x.toFixed(2)},${cameraState.y.toFixed(2)},${cameraState.z.toFixed(2)} / HERO ${cameraState.heroScale.toFixed(2)} / PARTICLES ${particleSystem?.totalParticles || 0} / ${particleSystem?.mode || "fallback"} / BLOOM ${cameraState.bloom.toFixed(2)} / FPS ${fps} / ${qualityName} / ${progress.toFixed(1)}%`;
  }
}

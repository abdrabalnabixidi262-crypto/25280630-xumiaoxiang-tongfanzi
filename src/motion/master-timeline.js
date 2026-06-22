import { gsap } from "../vendor/gsap.js";
import { Flip } from "../vendor/Flip.js";
import { panelForSecond, phaseForScene, sceneAt } from "./transition-engine.js";

gsap.registerPlugin(Flip);

export const motionMetrics = {
  duration: 35,
  cameraMoves: 12,
  pushIns: 5,
  pullBacks: 3,
  transitionKinds: 9,
  particleBursts: 4,
  cardFlyIns: 3,
};

const states = [
  { time: 0, scene: "scan-launch", camera: { x: -1.8, y: 0, z: 8, rotationY: 0.08, zoom: 0.86 }, heroScale: 0.62, bgScale: 1, particle: "idle", bloom: 0, rgb: 0.002, glitch: 0.6, thread: 0.1 },
  { time: 1.5, scene: "hero-push", camera: { x: -1.2, y: 0.08, z: 5.8, rotationY: 0.05, zoom: 0.92 }, heroScale: 0.68, bgScale: 1.04, particle: "push", bloom: 0.7, rgb: 0.006, glitch: 0.12, thread: 0.35 },
  { time: 5.5, scene: "hero-push", camera: { x: 0, y: -0.05, z: 4.5, rotationY: 0, zoom: 1.12 }, heroScale: 1.12, bgScale: 1.22, particle: "burst", bloom: 0.85, rgb: 0.004, glitch: 0.05, thread: 0.86 },
  { time: 7.0, scene: "closeup-shock", camera: { x: 0.75, y: 0.05, z: 2.05, rotationY: -0.08, zoom: 1.8 }, heroScale: 2.25, bgScale: 1.42, particle: "burst", bloom: 1.2, rgb: 0.014, glitch: 0.72, thread: 1 },
  { time: 8.5, scene: "slice-fold", camera: { x: -0.4, y: 0.2, z: 4.9, rotationY: 0.18, zoom: 0.96 }, heroScale: 0.8, bgScale: 1.18, particle: "push", bloom: 0.6, rgb: 0.01, glitch: 1, thread: 0.7 },
  { time: 11, scene: "profile-card-space", camera: { x: -1.1, y: 0.12, z: 4.2, rotationY: -0.12, zoom: 1.04 }, heroScale: 1, bgScale: 1.12, particle: "idle", bloom: 0.48, rgb: 0.002, glitch: 0.08, thread: 0.8 },
  { time: 15, scene: "gallery-rush", camera: { x: 1.4, y: -0.12, z: 5.1, rotationY: 0.2, zoom: 0.98 }, heroScale: 0.9, bgScale: 1.18, particle: "push", bloom: 0.7, rgb: 0.006, glitch: 0.25, thread: 0.66 },
  { time: 18, scene: "gallery-rush", camera: { x: -1.7, y: 0.05, z: 3.8, rotationY: -0.26, zoom: 1.18 }, heroScale: 1.05, bgScale: 1.28, particle: "burst", bloom: 0.85, rgb: 0.012, glitch: 0.36, thread: 0.9 },
  { time: 21, scene: "journey-tunnel", camera: { x: 0.1, y: 0.14, z: 2.8, rotationY: 0.06, zoom: 1.32 }, heroScale: 1.22, bgScale: 1.45, particle: "journey", bloom: 0.82, rgb: 0.004, glitch: 0.12, thread: 1 },
  { time: 24.5, scene: "product-burst", camera: { x: 1.3, y: -0.08, z: 4.0, rotationY: -0.16, zoom: 1.16 }, heroScale: 0.96, bgScale: 1.25, particle: "burst", bloom: 0.95, rgb: 0.01, glitch: 0.2, thread: 0.9 },
  { time: 29.5, scene: "finale-loop", camera: { x: 0, y: -0.16, z: 3.3, rotationY: 0.04, zoom: 1.24 }, heroScale: 1.5, bgScale: 1.32, particle: "finale", bloom: 1.25, rgb: 0.006, glitch: 0.12, thread: 1 },
  { time: 35, scene: "scan-launch", camera: { x: -1.8, y: 0, z: 8, rotationY: 0.08, zoom: 0.86 }, heroScale: 0.62, bgScale: 1, particle: "idle", bloom: 0.35, rgb: 0.002, glitch: 0.05, thread: 0.25 },
];

export function createMasterTimeline({ particleSystem, goldThreadSystem, post, onUpdate }) {
  let domTracksReady = false;
  const cameraState = {
    x: states[0].camera.x,
    y: states[0].camera.y,
    z: states[0].camera.z,
    rotationY: states[0].camera.rotationY,
    zoom: states[0].camera.zoom,
    heroScale: states[0].heroScale,
    bgScale: states[0].bgScale,
    particleBrightness: 0.2,
    thread: 0.1,
    bloom: 0.35,
    rgb: 0,
    glitch: 0,
    vignette: 0.35,
  };
  const timeline = gsap.timeline({
    paused: true,
    repeat: -1,
    repeatDelay: 0,
    defaults: { ease: "power2.inOut" },
  });

  document.body.classList.add("cinematic-ready");
  gsap.set(".hero-character", { transformOrigin: "52% 58%" });
  gsap.set(".hero-copy", { transformOrigin: "0% 50%" });
  gsap.set(".cinematic-depth-world", { transformOrigin: "50% 50%" });
  gsap.set(".foreground-controller", { transformOrigin: "50% 50%" });

  for (let i = 1; i < states.length; i += 1) {
    const prev = states[i - 1];
    const next = states[i];
    timeline.to(cameraState, {
      duration: next.time - prev.time,
      x: next.camera.x,
      y: next.camera.y,
      z: next.camera.z,
      rotationY: next.camera.rotationY,
      zoom: next.camera.zoom,
      heroScale: next.heroScale,
      bgScale: next.bgScale,
      particleBrightness: next.bloom,
      thread: next.thread,
      bloom: next.bloom,
      rgb: next.rgb,
      glitch: next.glitch,
      ease: i === 3 ? "expo.inOut" : i === 2 ? "power4.out" : i === 5 ? "back.out(1.4)" : "power2.inOut",
      onStart: () => {
        particleSystem.setMode(next.particle);
      },
      onUpdate: () => {
        renderFrame(timeline.time() % motionMetrics.duration, cameraState, { particleSystem, goldThreadSystem, post, onUpdate });
      },
    }, prev.time);
  }

  function ensureDomTracks() {
    if (domTracksReady) return;
    domTracksReady = true;
    addDomTracks(timeline);
  }

  function setTime(second) {
    ensureDomTracks();
    const clamped = ((Number(second) || 0) % motionMetrics.duration + motionMetrics.duration) % motionMetrics.duration;
    timeline.pause(clamped, false);
    renderFrame(clamped, cameraState, { particleSystem, goldThreadSystem, post, onUpdate });
  }

  function play() {
    ensureDomTracks();
    document.body.classList.add("showreel-mode", "cinematic-playing");
    document.body.classList.remove("cinematic-paused", "manual-mode");
    timeline.play();
  }

  function pause(reason = "manual") {
    timeline.pause();
    document.body.classList.remove("cinematic-playing");
    document.body.classList.add("cinematic-paused");
    if (reason === "manual") document.body.classList.add("manual-mode");
  }

  window.__setShowreelTime = setTime;
  window.__pauseShowreel = pause;
  window.__playShowreel = play;
  window.__setQuality = (quality) => {
    document.body.dataset.quality = quality;
  };

  document.querySelectorAll("[data-motion-control]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.motionControl;
      if (action === "auto") play();
      if (action === "pause") pause("manual");
      if (action === "replay") {
        timeline.restart();
        play();
      }
    });
  });

  return { timeline, cameraState, setTime, play, pause };
}

function addDomTracks(timeline) {
  timeline
    .fromTo(".showreel-loader", { autoAlpha: 1, scale: 1.08 }, { autoAlpha: 0, scale: 1, duration: 0.45, ease: "power4.out" }, 1.25)
    .fromTo(".hero-copy", { xPercent: -36, autoAlpha: 0, scale: 0.84 }, { xPercent: 0, autoAlpha: 1, scale: 1, duration: 1.2, ease: "power4.out" }, 1.35)
    .fromTo(".hero-character", { xPercent: 28, yPercent: 4, scale: 0.62, rotation: -2 }, { xPercent: -2, yPercent: 0, scale: 1.12, rotation: 0, duration: 3.8, ease: "expo.inOut" }, 1.5)
    .fromTo(".holo-screens", { autoAlpha: 0, scale: 0.72, xPercent: 18 }, { autoAlpha: 1, scale: 1.08, xPercent: -3, duration: 1.6, ease: "back.out(1.4)" }, 3.1)
    .fromTo(".showreel-closeup", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, ease: "power2.out" }, 5.6)
    .fromTo(".closeup-face", { xPercent: 42, scale: 1.15, filter: "blur(2px)" }, { xPercent: -4, scale: 2.22, filter: "blur(0px)", duration: 2.3, ease: "expo.inOut" }, 5.6)
    .fromTo(".foreground-controller", { xPercent: -130, yPercent: 80, scale: 0.2, rotation: -38, filter: "blur(10px)" }, { xPercent: -8, yPercent: 4, scale: 1.28, rotation: 13, filter: "blur(0px)", duration: 1.7, ease: "power4.out" }, 5.75)
    .to(".foreground-controller", { xPercent: 125, yPercent: -64, rotation: 72, scale: 0.72, filter: "blur(7px)", duration: 1.0, ease: "power3.in" }, 8.25)
    .to(".showreel-closeup", { autoAlpha: 0, duration: 0.45 }, 8.7)
    .fromTo(".transition-bands i", { xPercent: -140, scaleX: 0.4 }, { xPercent: 160, scaleX: 1.5, duration: 1.05, stagger: 0.08, ease: "power4.inOut" }, 8.55)
    .fromTo(".profile-window-stack", { xPercent: 44, rotationY: -24, scale: 0.72, autoAlpha: 0 }, { xPercent: 0, rotationY: 0, scale: 1.06, autoAlpha: 1, duration: 1.15, ease: "back.out(1.4)" }, 11.05)
    .fromTo(".profile-stage .data-card", { y: 120, z: -240, rotationY: -36, autoAlpha: 0 }, { y: 0, z: 0, rotationY: 0, autoAlpha: 1, duration: 1.0, stagger: 0.1, ease: "power4.out" }, 11.35)
    .fromTo(".gallery-track", { xPercent: 38, rotationY: -18, scale: 0.76 }, { xPercent: -46, rotationY: 12, scale: 1.08, duration: 3.4, ease: "expo.inOut" }, 15)
    .fromTo(".journey-depth", { autoAlpha: 0.1, scale: 0.72, z: -420 }, { autoAlpha: 0.9, scale: 1.35, z: 220, duration: 3.6, ease: "power3.inOut" }, 19)
    .fromTo(".project-masonry button", { x: 0, y: 0, z: -260, rotationY: -24, scale: 0.54, autoAlpha: 0 }, { x: (i) => (i - 2) * 46, y: (i) => (i % 2 ? 22 : -28), z: 0, rotationY: (i) => (i - 2) * -8, scale: 1, autoAlpha: 1, duration: 1.2, stagger: { amount: 0.32, from: "center" }, ease: "back.out(1.6)" }, 23.1)
    .fromTo(".application-stack img", { scale: 0.5, rotationY: -42, z: -320, autoAlpha: 0 }, { scale: 1.15, rotationY: 0, z: 160, autoAlpha: 0.92, duration: 1.5, stagger: 0.12, ease: "power4.out" }, 24.2)
    .fromTo(".final-character", { yPercent: 70, scale: 0.55, rotation: -7, autoAlpha: 0 }, { yPercent: -4, scale: 1.16, rotation: 0, autoAlpha: 1, duration: 1.3, ease: "back.out(1.8)" }, 27.7)
    .fromTo(".final-cards button", { x: 0, y: 0, rotation: 0, scale: 0.6, autoAlpha: 0 }, { x: (i) => Math.cos(i / 4 * Math.PI * 2) * 32, y: (i) => Math.sin(i / 4 * Math.PI * 2) * 30, rotation: (i) => (i - 1.5) * 8, scale: 1, autoAlpha: 1, duration: 1.1, stagger: 0.09, ease: "power4.out" }, 28.2)
    .to([".final-cards button", ".final-character"], { z: -520, scale: 0.58, autoAlpha: 0.1, duration: 2.2, ease: "power3.inOut" }, 31.5)
    .to(".hero-copy", { xPercent: 0, autoAlpha: 1, scale: 1, duration: 1.4, ease: "power4.out" }, 33.2)
    .to(".hero-character", { xPercent: 0, scale: 0.9, autoAlpha: 1, duration: 1.4, ease: "power4.out" }, 33.2);
}

function renderFrame(second, cameraState, systems) {
  const { particleSystem, goldThreadSystem, post, onUpdate } = systems;
  const scene = sceneAt(second);
  const panel = panelForSecond(second);
  const phase = phaseForScene(scene.name);
  if (document.body.dataset.activePanel !== panel) {
    window.__setPanelFromCinematic?.(panel, { instant: true });
  }
  document.body.dataset.showPhase = phase;
  document.body.dataset.cinematicScene = scene.name;
  document.body.dataset.transitioning = scene.local < 0.18 || scene.local > 0.86 ? "1" : "0";
  document.documentElement.style.setProperty("--camera-x", cameraState.x.toFixed(3));
  document.documentElement.style.setProperty("--camera-y", cameraState.y.toFixed(3));
  document.documentElement.style.setProperty("--camera-z", cameraState.z.toFixed(3));
  document.documentElement.style.setProperty("--camera-zoom", cameraState.zoom.toFixed(3));
  document.documentElement.style.setProperty("--hero-scale-live", cameraState.heroScale.toFixed(3));
  document.documentElement.style.setProperty("--bg-scale-live", cameraState.bgScale.toFixed(3));
  document.documentElement.style.setProperty("--thread-intensity", cameraState.thread.toFixed(3));
  particleSystem.setMode(particleModeForScene(scene.name));
  goldThreadSystem.setIntensity(cameraState.thread);
  post.apply({
    bloomStrength: cameraState.bloom,
    chromaticAmount: cameraState.rgb,
    glitchStrength: cameraState.glitch,
    vignette: 0.35 + cameraState.bloom * 0.18,
    radialBlur: Math.max(0, cameraState.zoom - 1) * 0.32,
  });
  onUpdate?.(second, scene, cameraState);
}

function particleModeForScene(scene) {
  if (scene === "closeup-shock" || scene === "product-burst") return "burst";
  if (scene === "journey-tunnel") return "journey";
  if (scene === "finale-loop") return "finale";
  if (scene === "hero-push" || scene === "gallery-rush") return "push";
  return "idle";
}

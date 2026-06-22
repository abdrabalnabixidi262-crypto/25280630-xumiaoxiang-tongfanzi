import * as THREE from "../vendor/three.module.min.js";

const modeConfig = {
  idle: { speed: 0.25, bloom: 0.35, visible: 0.55, direction: 0.12 },
  push: { speed: 0.8, bloom: 0.6, visible: 0.75, direction: 0.55 },
  burst: { speed: 2.4, bloom: 1.15, visible: 1, direction: 1.25 },
  journey: { speed: 1.5, bloom: 0.75, visible: 0.9, direction: -0.9 },
  finale: { speed: 2, bloom: 1.25, visible: 1, direction: 0.72 },
};

export const particleModes = ["idle", "push", "burst", "journey", "finale"];

export class ParticleSystem {
  constructor({ scene, profile, canvas }) {
    this.scene = scene;
    this.canvas = canvas;
    this.profile = {
      starCount: 1400,
      sparkCount: 620,
      petalCount: 120,
      threadCount: 220,
      ...profile,
    };
    this.mode = "idle";
    this.modeState = { ...modeConfig.idle };
    this.pointer = new THREE.Vector2(99, 99);
    this.pointerDown = false;
    this.shockwave = 0;
    this.layers = [];
    this.totalParticles = 0;
    this.createLayer("stars", this.profile.starCount, 0.018, [-0.18, 0.1, 0.02], 9, 0.32);
    this.createLayer("sparks", this.profile.sparkCount, 0.032, [1, 0.3, 0.08], 5.4, 0.58);
    this.createLayer("petals", this.profile.petalCount, 0.058, [0.95, 0.12, 0.05], 4.4, 0.78);
    this.createLayer("thread", this.profile.threadCount, 0.026, [1, 0.76, 0.22], 6.2, 0.86);
    this.bindPointer();
  }

  createLayer(name, count, size, color, depth, opacity) {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const random = mulberry32(count * 25280630);
    for (let i = 0; i < count; i += 1) {
      const spread = name === "stars" ? 9.8 : 6.8;
      positions[i * 3] = (random() - 0.5) * spread;
      positions[i * 3 + 1] = (random() - 0.5) * 5.4;
      positions[i * 3 + 2] = -random() * depth;
      seeds[i] = random();
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("seed", new THREE.BufferAttribute(seeds, 1));
    const material = new THREE.PointsMaterial({
      size,
      color: new THREE.Color(...color),
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const points = new THREE.Points(geometry, material);
    points.name = `WebGL ${name} particle layer`;
    this.layers.push({ name, count, positions, seeds, points, material, baseOpacity: opacity });
    this.totalParticles += count;
    this.scene.add(points);
  }

  bindPointer() {
    window.addEventListener("pointermove", (event) => {
      this.pointer.x = event.clientX / window.innerWidth * 2 - 1;
      this.pointer.y = -(event.clientY / window.innerHeight * 2 - 1);
    }, { passive: true });
    window.addEventListener("pointerdown", () => {
      this.pointerDown = true;
      this.shockwave = 1;
    }, { passive: true });
    window.addEventListener("pointerup", () => {
      this.pointerDown = false;
    }, { passive: true });
  }

  setMode(mode) {
    if (!modeConfig[mode]) return;
    this.mode = mode;
  }

  update(delta, elapsed, cameraState) {
    const target = modeConfig[this.mode] || modeConfig.idle;
    for (const key of Object.keys(target)) {
      this.modeState[key] += (target[key] - this.modeState[key]) * Math.min(1, delta * 3.2);
    }
    this.shockwave = Math.max(0, this.shockwave - delta * 1.9);
    const pointerForce = this.pointerDown ? -0.22 : 0.13;

    for (const layer of this.layers) {
      const pos = layer.positions;
      const modeSpeed = this.modeState.speed;
      const layerSpeed = layer.name === "stars" ? 0.18 : layer.name === "sparks" ? 0.52 : layer.name === "petals" ? 0.34 : 0.42;
      for (let i = 0; i < layer.count; i += 1) {
        const index = i * 3;
        const seed = layer.seeds[i];
        const orbit = Math.sin(elapsed * (0.4 + seed) + seed * 20);
        pos[index] += (this.modeState.direction * 0.015 + orbit * 0.003 + cameraState.x * -0.001) * modeSpeed * layerSpeed;
        pos[index + 1] += (Math.cos(elapsed * (0.5 + seed) + seed * 9) * 0.004 + cameraState.y * -0.001) * modeSpeed;
        pos[index + 2] += (layer.name === "thread" ? Math.sin(elapsed + seed * 7) * 0.008 : 0.012 * modeSpeed);
        const dx = pos[index] / 5 - this.pointer.x;
        const dy = pos[index + 1] / 3 - this.pointer.y;
        const d = Math.max(0.08, Math.sqrt(dx * dx + dy * dy));
        if (d < 0.42 || this.shockwave > 0) {
          const sign = this.pointerDown ? -1 : 1;
          pos[index] += sign * dx / d * pointerForce * delta * (1 + this.shockwave * 5);
          pos[index + 1] += sign * dy / d * pointerForce * delta * (1 + this.shockwave * 5);
        }
        if (pos[index] > 5.8) pos[index] = -5.8;
        if (pos[index] < -5.8) pos[index] = 5.8;
        if (pos[index + 1] > 3.4) pos[index + 1] = -3.4;
        if (pos[index + 1] < -3.4) pos[index + 1] = 3.4;
        if (pos[index + 2] > 1.2) pos[index + 2] = -7.6 - seed * 2;
      }
      layer.points.visible = this.modeState.visible > 0.1;
      layer.material.opacity = layer.baseOpacity * this.modeState.visible * (0.85 + cameraState.particleBrightness * 0.35);
      layer.material.size = (layer.name === "petals" ? 0.06 : layer.material.size) * (1 + this.shockwave * 0.2);
      layer.points.geometry.attributes.position.needsUpdate = true;
      layer.points.rotation.z = elapsed * 0.015 * modeSpeed;
      layer.points.position.z = cameraState.z * -0.08;
    }
  }
}

function mulberry32(seed) {
  return function next() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

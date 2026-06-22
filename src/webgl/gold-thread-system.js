import * as THREE from "../vendor/three.module.min.js";

export class GoldThreadSystem {
  constructor({ scene }) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = "HaisiGoldThreadSystem";
    this.material = new THREE.MeshBasicMaterial({
      color: 0xffc34a,
      transparent: true,
      opacity: 0.74,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.headMaterial = new THREE.MeshBasicMaterial({
      color: 0xfff0a4,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.curves = [];
    this.heads = [];
    this.time = 0;
    this.createCurves();
    scene.add(this.group);
  }

  createCurves() {
    const curveDefs = [
      [new THREE.Vector3(-4.8, -1.8, -1.2), new THREE.Vector3(-2.4, 0.8, 0.4), new THREE.Vector3(0.8, -0.3, 0.2), new THREE.Vector3(4.8, 1.6, -0.8)],
      [new THREE.Vector3(-3.8, 1.8, -2.4), new THREE.Vector3(-0.8, 2.6, 0.1), new THREE.Vector3(2.2, -1.6, 0.5), new THREE.Vector3(5.2, 0.4, -1.4)],
      [new THREE.Vector3(2.6, -2.2, -1.6), new THREE.Vector3(4.3, -1.2, 0.8), new THREE.Vector3(5.2, 0.8, -0.4), new THREE.Vector3(3.6, 2.1, -1.2)],
      [new THREE.Vector3(-5.2, 0.2, -1.0), new THREE.Vector3(-3.0, -2.4, 0.8), new THREE.Vector3(1.4, 1.9, 0.5), new THREE.Vector3(5.3, -0.9, -1.0)],
      [new THREE.Vector3(-4.6, 2.0, -2.2), new THREE.Vector3(-1.2, -0.8, 1.1), new THREE.Vector3(2.6, 2.0, -0.2), new THREE.Vector3(5.0, 2.4, -2.0)],
    ];

    for (const points of curveDefs) {
      const curve = new THREE.CatmullRomCurve3(points);
      const geometry = new THREE.TubeGeometry(curve, 96, 0.012, 8, false);
      const mesh = new THREE.Mesh(geometry, this.material.clone());
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.052, 16, 10), this.headMaterial.clone());
      this.curves.push({ curve, mesh });
      this.heads.push(head);
      this.group.add(mesh, head);
    }
  }

  setIntensity(value) {
    this.group.children.forEach((item) => {
      if (item.material) item.material.opacity = item.geometry?.type === "SphereGeometry" ? 0.62 + value * 0.38 : 0.24 + value * 0.64;
    });
    this.group.scale.setScalar(0.9 + value * 0.28);
  }

  update(delta, cameraState) {
    this.time += delta;
    const wave = Math.sin(this.time * 1.4) * 0.08;
    this.group.rotation.z = wave;
    this.group.rotation.y = cameraState.rotationY * 0.6;
    this.group.position.x = cameraState.x * -0.18;
    this.group.position.y = cameraState.y * -0.08;
    this.curves.forEach(({ curve, mesh }, index) => {
      const t = (this.time * (0.08 + index * 0.025) + index * 0.17) % 1;
      const p = curve.getPointAt(t);
      this.heads[index].position.copy(p);
      mesh.material.opacity = 0.26 + Math.sin(this.time * 2 + index) * 0.09 + cameraState.thread * 0.52;
    });
  }
}

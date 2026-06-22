export function syncDepthWorld(progress, cameraState) {
  const world = document.querySelector(".cinematic-depth-world");
  if (!world) return;
  world.style.setProperty("--journey-progress", progress.toFixed(3));
  world.style.setProperty("--camera-x", cameraState.x.toFixed(3));
  world.style.setProperty("--camera-z", cameraState.z.toFixed(3));
}

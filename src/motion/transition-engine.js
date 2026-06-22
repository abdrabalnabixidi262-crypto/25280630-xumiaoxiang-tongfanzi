export const transitionScenes = [
  { name: "scan-launch", at: 0, duration: 1.5 },
  { name: "hero-push", at: 1.5, duration: 4 },
  { name: "closeup-shock", at: 5.5, duration: 3 },
  { name: "slice-fold", at: 8.5, duration: 2.5 },
  { name: "profile-card-space", at: 11, duration: 4 },
  { name: "gallery-rush", at: 15, duration: 4 },
  { name: "journey-tunnel", at: 19, duration: 4 },
  { name: "product-burst", at: 23, duration: 4.5 },
  { name: "finale-loop", at: 27.5, duration: 7.5 },
];

export function sceneAt(second) {
  let scene = transitionScenes[0];
  for (const item of transitionScenes) {
    if (second >= item.at) scene = item;
  }
  const local = Math.max(0, Math.min(1, (second - scene.at) / scene.duration));
  return { ...scene, local };
}

export function panelForSecond(second) {
  if (second < 11) return "home";
  if (second < 15) return "profile";
  if (second < 19) return "gallery";
  if (second < 23) return "timeline";
  if (second < 27.5) return "projects";
  if (second < 31.5) return "contact";
  return "home";
}

export function phaseForScene(name) {
  return {
    "scan-launch": "load",
    "hero-push": "push",
    "closeup-shock": "closeup",
    "slice-fold": "pullback",
    "profile-card-space": "profile",
    "gallery-rush": "gallery",
    "journey-tunnel": "journey",
    "product-burst": "applications",
    "finale-loop": "finale",
  }[name] || "hero";
}

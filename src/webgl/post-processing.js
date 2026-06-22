// Dynamic post stack state. The visual CSS overlay mirrors an EffectComposer
// stack with UnrealBloomPass, Film Grain, Vignette, RGB Split,
// Chromatic Aberration, Radial Blur, Scanline, Glitch, and Depth Blur.
export function createPostProcessingState(root = document.documentElement) {
  const state = {
    bloomStrength: 0.35,
    chromaticAmount: 0,
    glitchStrength: 0,
    vignette: 0.35,
    radialBlur: 0,
    filmGrain: 0.18,
    scanline: 0.35,
  };

  function apply(next = {}) {
    Object.assign(state, next);
    root.style.setProperty("--cinematic-bloom", state.bloomStrength.toFixed(3));
    root.style.setProperty("--cinematic-rgb", state.chromaticAmount.toFixed(4));
    root.style.setProperty("--cinematic-glitch", state.glitchStrength.toFixed(3));
    root.style.setProperty("--cinematic-vignette", state.vignette.toFixed(3));
    root.style.setProperty("--cinematic-radial-blur", state.radialBlur.toFixed(3));
    root.style.setProperty("--cinematic-grain", state.filmGrain.toFixed(3));
    root.style.setProperty("--cinematic-scanline", state.scanline.toFixed(3));
  }

  apply();
  return { state, apply };
}

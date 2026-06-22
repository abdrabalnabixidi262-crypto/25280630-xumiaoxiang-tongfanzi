export function detectQuality(search = window.location.search, viewport = window.innerWidth) {
  const query = new URLSearchParams(search);
  const forced = query.get("quality");
  if (["high", "medium", "low"].includes(forced)) return forced;
  const memory = navigator.deviceMemory || 8;
  const cores = navigator.hardwareConcurrency || 8;
  if (viewport < 720 || memory <= 4 || cores <= 4) return "low";
  if (viewport < 1180 || memory <= 6) return "medium";
  return "high";
}

export const qualityProfiles = {
  high: {
    pixelRatio: Math.min(window.devicePixelRatio || 1, 1.6),
    starCount: 1400,
    sparkCount: 620,
    petalCount: 120,
    threadCount: 220,
    bloom: 1,
    blur: 1,
  },
  medium: {
    pixelRatio: Math.min(window.devicePixelRatio || 1, 1.25),
    starCount: 900,
    sparkCount: 420,
    petalCount: 82,
    threadCount: 160,
    bloom: 0.78,
    blur: 0.7,
  },
  low: {
    pixelRatio: 1,
    starCount: 520,
    sparkCount: 220,
    petalCount: 48,
    threadCount: 92,
    bloom: 0.45,
    blur: 0.35,
  },
};

export function getQualityProfile(name = detectQuality()) {
  return qualityProfiles[name] || qualityProfiles.high;
}

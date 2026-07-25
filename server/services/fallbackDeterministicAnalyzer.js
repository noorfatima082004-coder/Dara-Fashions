/**
 * Skin Tone Analyzer + Color Palette Recommender
 * ---------------------------------------------------------------------------
 * Pipeline: RGB samples -> validation -> outlier rejection -> exposure check
 *           -> LAB conversion -> ITA depth -> hue-angle undertone
 *           -> confidence -> seasonal palette (contrast-tuned, dynamic hex)
 *
 * SCOPE NOTE: This module only analyzes pixel samples you give it. It does
 * not do face detection. Samples come from imageProcessing.sampleFallbackRegions,
 * which takes fixed relative-position crops (center/upper/lower thirds) as a
 * face-detection-free approximation — real per-photo signal, but not a
 * substitute for actual landmark-based sampling.
 */

// ============================================================
// STEP 0: Input validation
// ============================================================

function validateSample(sample, index) {
  if (typeof sample !== "object" || sample === null) {
    throw new TypeError(`Sample at index ${index} must be an object {r,g,b}`);
  }
  const { r, g, b } = sample;
  for (const [key, val] of [["r", r], ["g", g], ["b", b]]) {
    if (typeof val !== "number" || Number.isNaN(val)) {
      throw new TypeError(
        `Sample at index ${index}: "${key}" must be a number, got ${JSON.stringify(val)}`
      );
    }
  }
  if (r < -5 || r > 260 || g < -5 || g > 260 || b < -5 || b > 260) {
    throw new RangeError(
      `Sample at index ${index}: RGB values out of plausible range (0-255): ${JSON.stringify(sample)}`
    );
  }
  return {
    r: Math.min(255, Math.max(0, r)),
    g: Math.min(255, Math.max(0, g)),
    b: Math.min(255, Math.max(0, b)),
  };
}

function validateSamples(samples) {
  if (!Array.isArray(samples) || samples.length === 0) {
    throw new Error("At least one {r,g,b} sample is required");
  }
  return samples.map(validateSample);
}

// ============================================================
// STEP 0b: Outlier rejection (robust to eyebrow/lip/shadow contamination)
// ============================================================
// Median Absolute Deviation (MAD) is used instead of mean/stddev because
// it's itself robust to the outliers we're trying to detect. A modified
// z-score > 3.5 is the standard robust-outlier cutoff (Iglewicz & Hoaglin).

function median(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function rejectOutliers(labSamples) {
  if (labSamples.length < 4) {
    return { kept: labSamples, dropped: [] };
  }
  const medL = median(labSamples.map((s) => s.L));
  const medA = median(labSamples.map((s) => s.A));
  const medB = median(labSamples.map((s) => s.B));

  const dists = labSamples.map((s) => Math.hypot(s.L - medL, s.A - medA, s.B - medB));
  const medDist = median(dists) || 1e-6;

  const kept = [];
  const dropped = [];
  labSamples.forEach((s, i) => {
    const modifiedZ = (0.6745 * dists[i]) / medDist;
    (modifiedZ > 3.5 ? dropped : kept).push({ ...s, index: i, modifiedZ });
  });

  if (kept.length === 0) return { kept: labSamples, dropped: [] };
  return { kept, dropped };
}

// ============================================================
// STEP 1: Image / exposure quality check
// ============================================================

function assessExposure(samples) {
  const brightness = samples.map((s) => (s.r + s.g + s.b) / 3);
  const meanBrightness = brightness.reduce((a, b) => a + b, 0) / brightness.length;
  const variance =
    brightness.reduce((a, b) => a + (b - meanBrightness) ** 2, 0) / brightness.length;
  const stdDev = Math.sqrt(variance);

  const flags = [];
  if (meanBrightness < 40) flags.push("underexposed");
  if (meanBrightness > 235) flags.push("overexposed_or_flash");
  if (stdDev > 45) flags.push("inconsistent_lighting_across_regions");

  const usable = flags.length === 0 || (flags.length === 1 && stdDev <= 45);
  return { meanBrightness, stdDev, flags, usable };
}

// ============================================================
// STEP 2: RGB <-> LAB conversion
// ============================================================

function rgbToLab({ r, g, b }) {
  let [rn, gn, bn] = [r, g, b].map((v) => v / 255);
  [rn, gn, bn] = [rn, gn, bn].map((v) =>
    v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92
  );
  const x = rn * 0.4124 + gn * 0.3576 + bn * 0.1805;
  const y = rn * 0.2126 + gn * 0.7152 + bn * 0.0722;
  const z = rn * 0.0193 + gn * 0.1192 + bn * 0.9505;
  const xn = x / 0.95047, yn = y / 1.0, zn = z / 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const fx = f(xn), fy = f(yn), fz = f(zn);
  return { L: 116 * fy - 16, A: 500 * (fx - fy), B: 200 * (fy - fz) };
}

function averageLab(rawSamples) {
  const labValues = rawSamples.map(rgbToLab);
  const { kept, dropped } = rejectOutliers(labValues);

  const n = kept.length;
  const mean = {
    L: kept.reduce((s, v) => s + v.L, 0) / n,
    A: kept.reduce((s, v) => s + v.A, 0) / n,
    B: kept.reduce((s, v) => s + v.B, 0) / n,
  };
  const spread =
    kept.reduce((s, v) => s + Math.hypot(v.L - mean.L, v.A - mean.A, v.B - mean.B), 0) / n;

  return { ...mean, spread, sampleCount: n, droppedCount: dropped.length, dropped };
}

// ============================================================
// STEP 3: Depth classification via ITA
// ============================================================

const DEFAULT_ITA_BANDS = [
  { max: Infinity, min: 55, label: "fair" },
  { max: 55, min: 41, label: "light" },
  { max: 41, min: 28, label: "wheatish" },
  { max: 28, min: 10, label: "medium" },
  { max: 10, min: -30, label: "deep" },
  { max: -30, min: -Infinity, label: "very_deep" },
];

function computeITA({ L, B }) {
  const safeB = Math.abs(B) < 0.01 ? (B < 0 ? -0.01 : 0.01) : B;
  return Math.atan((L - 50) / safeB) * (180 / Math.PI);
}

function classifyDepth(ita, bands = DEFAULT_ITA_BANDS) {
  for (const band of bands) {
    if (ita <= band.max && ita > band.min) {
      const bandWidth = Math.min(band.max - band.min, 30);
      const distFromEdge = Math.min(ita - band.min, band.max - ita);
      const confidence = Math.max(0.5, Math.min(1, 0.5 + distFromEdge / bandWidth));
      return { depth: band.label, ita, confidence };
    }
  }
  return { depth: "medium", ita, confidence: 0.5 };
}

// ============================================================
// STEP 4: Undertone via hue angle + chroma
// ============================================================

const DEFAULT_UNDERTONE_CUTOFFS = { coolMax: 40, warmMin: 55 };

function classifyUndertone({ A, B }, cutoffs = DEFAULT_UNDERTONE_CUTOFFS) {
  const chroma = Math.hypot(A, B);
  let hue = Math.atan2(B, A) * (180 / Math.PI);
  if (hue < 0) hue += 360;

  let undertone, distanceFromBoundary;
  if (hue >= cutoffs.warmMin) {
    undertone = "warm";
    distanceFromBoundary = hue - cutoffs.warmMin;
  } else if (hue <= cutoffs.coolMax) {
    undertone = "cool";
    distanceFromBoundary = cutoffs.coolMax - hue;
  } else {
    undertone = "neutral";
    distanceFromBoundary = Math.min(hue - cutoffs.coolMax, cutoffs.warmMin - hue);
  }

  const chromaConfidence = Math.min(1, chroma / 20);
  const hueConfidence = Math.min(1, 0.5 + distanceFromBoundary / 30);
  const confidence = Math.round(chromaConfidence * hueConfidence * 100) / 100;

  const neutralLean =
    undertone === "neutral"
      ? hue - (cutoffs.coolMax + cutoffs.warmMin) / 2 > 0
        ? "warm_leaning"
        : "cool_leaning"
      : null;

  return { undertone, hue, chroma, confidence, neutralLean };
}

// ============================================================
// STEP 5: Seasonal classification
// ============================================================

function classifySeason({ undertone, depth, neutralLean, chroma }) {
  const isLight = ["fair", "light", "wheatish"].includes(depth);

  let season;
  if (undertone === "warm") {
    season = isLight ? "spring" : "autumn";
  } else if (undertone === "cool") {
    season = isLight ? "summer" : "winter";
  } else {
    const leansWarm = neutralLean === "warm_leaning";
    const highChroma = chroma > 22;
    if (leansWarm) season = isLight ? "spring" : "autumn";
    else season = isLight ? "summer" : (highChroma ? "winter" : "autumn");
  }

  return {
    season,
    basis: "skin_only_with_hue_lean",
    note: "Estimated without face detection; retake in even natural light for a more reliable read, or wait for the primary AI analysis to succeed.",
  };
}

// ============================================================
// STEP 6: Dynamic, contrast-tuned palette
// ============================================================

function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x) => Math.round(255 * x).toString(16).padStart(2, "0");
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

const SEASON_ANCHORS = {
  spring: { avoidHues: [200, 260], colors: [
    { name: "Peach", hue: 20, sat: 70, light: 75 },
    { name: "Coral", hue: 10, sat: 75, light: 65 },
    { name: "Warm gold", hue: 45, sat: 70, light: 55 },
    { name: "Camel", hue: 35, sat: 45, light: 60 },
    { name: "Grass green", hue: 100, sat: 55, light: 45 },
  ]},
  autumn: { avoidHues: [210, 280], colors: [
    { name: "Mustard", hue: 48, sat: 65, light: 45 },
    { name: "Rust", hue: 18, sat: 65, light: 40 },
    { name: "Olive", hue: 70, sat: 40, light: 35 },
    { name: "Terracotta", hue: 14, sat: 55, light: 50 },
    { name: "Chocolate brown", hue: 25, sat: 40, light: 25 },
  ]},
  summer: { avoidHues: [40, 60], colors: [
    { name: "Powder blue", hue: 200, sat: 45, light: 75 },
    { name: "Lavender", hue: 260, sat: 40, light: 78 },
    { name: "Rose pink", hue: 340, sat: 45, light: 72 },
    { name: "Soft gray", hue: 210, sat: 10, light: 65 },
    { name: "Dusty teal", hue: 180, sat: 30, light: 45 },
  ]},
  winter: { avoidHues: [35, 70], colors: [
    { name: "Royal blue", hue: 225, sat: 75, light: 45 },
    { name: "Fuchsia", hue: 320, sat: 75, light: 50 },
    { name: "Emerald", hue: 150, sat: 65, light: 35 },
    { name: "True red", hue: 355, sat: 75, light: 45 },
    { name: "Black + white contrast", hue: 220, sat: 5, light: 15 },
  ]},
};

function generatePalette(season, { chroma, ita, depthBandRange }) {
  const anchors = SEASON_ANCHORS[season] ?? SEASON_ANCHORS.autumn;

  const satAdjust = Math.max(-12, Math.min(12, (chroma - 25) * 0.6));
  let lightAdjust = 0;
  if (depthBandRange && Number.isFinite(depthBandRange.min) && Number.isFinite(depthBandRange.max)) {
    const span = depthBandRange.max - depthBandRange.min || 1;
    const posInBand = (ita - depthBandRange.min) / span;
    lightAdjust = (posInBand - 0.5) * 10;
  }

  const best = anchors.colors.map((c) => ({
    name: c.name,
    hex: hslToHex(c.hue, Math.max(10, Math.min(90, c.sat + satAdjust)), Math.max(10, Math.min(90, c.light + lightAdjust))),
  }));

  const avoid = anchors.avoidHues.map((h) => ({
    name: `Hues near ${h}° on the color wheel`,
    hex: hslToHex(h, 50, 50),
  }));

  return { best, avoid };
}

// ============================================================
// MAIN ENTRY POINT
// ============================================================

function analyzeSkinTone(rawSamples, options = {}) {
  const samples = validateSamples(rawSamples);
  const quality = assessExposure(samples);

  const lab = averageLab(samples);
  const itaBands = options.itaBands ?? DEFAULT_ITA_BANDS;
  const undertoneCutoffs = options.undertoneCutoffs ?? DEFAULT_UNDERTONE_CUTOFFS;

  const ita = computeITA(lab);
  const { depth, confidence: depthConfidence } = classifyDepth(ita, itaBands);
  const { undertone, hue, chroma, confidence: undertoneConfidence, neutralLean } =
    classifyUndertone(lab, undertoneCutoffs);

  const seasonResult = classifySeason({ undertone, depth, neutralLean, chroma });

  const activeBand = itaBands.find((b) => b.label === depth) ?? {};
  const palette = generatePalette(seasonResult.season, {
    chroma,
    ita,
    depthBandRange: { min: activeBand.min, max: Math.min(activeBand.max, 90) },
  });

  const consistencyPenalty = Math.min(0.3, lab.spread / 100);

  const warnings = [];
  if (!quality.usable) warnings.push(`Image quality flags: ${quality.flags.join(", ")}. Ask user to retake in even, natural light.`);
  if (lab.spread > 15) warnings.push("High variance across sample regions — check for shadows, makeup, or uneven lighting.");

  return {
    undertone,
    undertoneConfidence: Math.max(0.1, Math.round((undertoneConfidence - consistencyPenalty) * 100) / 100),
    depth,
    depthConfidence: Math.max(0.1, Math.round((depthConfidence - consistencyPenalty) * 100) / 100),
    season: seasonResult.season,
    seasonNote: seasonResult.note,
    palette,
    warnings,
  };
}

module.exports = {
  analyzeSkinTone,
  rgbToLab,
  computeITA,
  classifyDepth,
  classifyUndertone,
  classifySeason,
  generatePalette,
};

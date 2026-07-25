const { callGeminiJSON, GeminiError } = require("./geminiClient");
const { prepareImageForGemini, sampleFallbackRegions } = require("./imageProcessing");
const cache = require("./cache");

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

// Enums are enforced TWICE: once in the schema sent to Gemini (so it's
// constrained at generation time), and again in validateProfile() below
// (never trust an external API's output as pre-validated, even with a
// schema — treat responseSchema as a strong hint, not a guarantee).
const UNDERTONES = ["warm", "cool", "neutral"];
const SEASONS = ["spring", "summer", "autumn", "winter"];

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    skinTone: { type: "string" },
    undertone: { type: "string", enum: UNDERTONES },
    season: { type: "string", enum: SEASONS },
    bestColors: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 6 },
    avoidColors: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 },
    confidence: { type: "number" },
  },
  required: ["skinTone", "undertone", "season", "bestColors", "avoidColors", "confidence"],
};

const PROMPT = `You are a professional color/image consultant analyzing a photo for a
personal color analysis feature in a Pakistani fashion app.

Look at the person's face in this photo and assess:
- Overall skin tone description (e.g. "Medium wheatish", "Deep bronze")
- Undertone: exactly one of "warm", "cool", or "neutral"
- Seasonal color category: exactly one of "spring", "summer", "autumn", "winter"
- 3-6 clothing colors that would suit them best (be specific, e.g. "Mustard yellow" not just "yellow")
- 2-4 colors that would generally wash them out or clash
- Your confidence in this assessment, 0-100, based on photo quality (lighting, angle, resolution)

If the photo is too dark, blurry, at a bad angle, or the face is not
clearly visible, still return your best-effort JSON but set confidence
below 40 to reflect that uncertainty honestly.

Respond with ONLY the JSON object, no other text.`;

function validateProfile(raw) {
  const errors = [];
  if (typeof raw?.skinTone !== "string" || !raw.skinTone.trim()) errors.push("skinTone missing/invalid");
  if (!UNDERTONES.includes(raw?.undertone)) errors.push(`undertone must be one of ${UNDERTONES.join(", ")}`);
  if (!SEASONS.includes(raw?.season)) errors.push(`season must be one of ${SEASONS.join(", ")}`);
  if (!Array.isArray(raw?.bestColors) || raw.bestColors.length < 1) errors.push("bestColors missing/empty");
  if (!Array.isArray(raw?.avoidColors)) errors.push("avoidColors missing");
  if (typeof raw?.confidence !== "number" || raw.confidence < 0 || raw.confidence > 100) {
    errors.push("confidence must be a number 0-100");
  }
  return errors;
}

/**
 * Analyze a user's photo for skin tone / undertone / season / palette.
 * Caches the result forever (keyed by userId) since this doesn't change —
 * re-run only if the user explicitly uploads a new photo.
 *
 * @param {string} userId
 * @param {Buffer} imageBuffer - raw uploaded image bytes
 * @param {{ forceRefresh?: boolean }} [opts]
 */
async function analyzeUserProfile(userId, imageBuffer, opts = {}) {
  const cacheKey = `user-profile:${userId}`;

  if (!opts.forceRefresh) {
    const cached = await cache.get(cacheKey);
    if (cached) return { ...cached, source: "cache" };
  }

  // Downscale/re-encode before Gemini sees it — caps the cost of every call
  // regardless of what the client actually uploaded.
  const preparedImage = await prepareImageForGemini(imageBuffer);

  try {
    const raw = await callGeminiJSON({
      model: MODEL,
      prompt: PROMPT,
      image: preparedImage,
      responseSchema: RESPONSE_SCHEMA,
    });

    const errors = validateProfile(raw);
    if (errors.length > 0) {
      throw new GeminiError(`Gemini response failed validation: ${errors.join("; ")}`, {
        retryable: false,
      });
    }

    const profile = { ...raw, source: "gemini", analyzedAt: new Date().toISOString() };
    await cache.set(cacheKey, profile); // no TTL — persists until forceRefresh
    return profile;
  } catch (err) {
    console.error(`[userAnalysis] Gemini analysis failed for user ${userId}:`, err.message);
    const profile = await fallbackToDeterministic(userId, imageBuffer);
    await cache.set(cacheKey, profile);
    return profile;
  }
}

/**
 * Fallback path when Gemini is unavailable (API down, quota exhausted,
 * validation kept failing). Uses the deterministic LAB/ITA module.
 *
 * Samples are drawn from the ACTUAL uploaded photo via
 * imageProcessing.sampleFallbackRegions (fixed relative-position crops as a
 * face-detection-free proxy) — every user gets a result reflecting their own
 * photo, not a shared constant.
 */
async function fallbackToDeterministic(userId, imageBuffer) {
  const { analyzeSkinTone } = require("./fallbackDeterministicAnalyzer");
  try {
    const samples = await sampleFallbackRegions(imageBuffer);
    const result = analyzeSkinTone(samples);

    return {
      skinTone: `${result.depth} skin`,
      undertone: result.undertone,
      season: result.season,
      bestColors: result.palette.best.map((c) => c.name),
      avoidColors: result.palette.avoid.map((c) => c.name),
      confidence: Math.round(result.undertoneConfidence * 100),
      source: "deterministic_fallback",
      analyzedAt: new Date().toISOString(),
      warnings: result.warnings,
    };
  } catch (fallbackErr) {
    console.error(`[userAnalysis] Fallback also failed for user ${userId}:`, fallbackErr.message);
    throw new Error("Skin tone analysis unavailable — both primary and fallback paths failed.");
  }
}

module.exports = { analyzeUserProfile, validateProfile, RESPONSE_SCHEMA };

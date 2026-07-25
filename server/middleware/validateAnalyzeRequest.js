/**
 * Validates the /api/analyze-user request body BEFORE any Gemini spend.
 * A client-supplied mimeType is a claim, not a fact — imageProcessing.js
 * re-verifies the bytes actually decode as an image later, via sharp. This
 * middleware's job is just to reject obviously bad/oversized requests
 * cheaply, before we even touch the (comparatively expensive) image
 * decode/resize step.
 */

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_DECODED_BYTES = 6 * 1024 * 1024; // 6MB

function base64ByteLength(base64) {
  const len = base64.length;
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return (len * 3) / 4 - padding;
}

function validateAnalyzeRequest(req, res, next) {
  const { userId, image } = req.body ?? {};

  if (typeof userId !== "string" || !userId.trim() || userId.length > 200) {
    return res.status(400).json({ error: "userId is required and must be a non-empty string" });
  }

  if (typeof image?.mimeType !== "string" || !ALLOWED_MIME_TYPES.includes(image.mimeType)) {
    return res.status(400).json({
      error: `image.mimeType must be one of: ${ALLOWED_MIME_TYPES.join(", ")}`,
    });
  }

  if (typeof image?.base64Data !== "string" || !image.base64Data.length) {
    return res.status(400).json({ error: "image.base64Data is required" });
  }

  // Cheap length-based size estimate before doing the actual (costlier)
  // Buffer.from decode — rejects grossly oversized payloads fast.
  if (base64ByteLength(image.base64Data) > MAX_DECODED_BYTES) {
    return res.status(413).json({ error: "Image is too large (max 6MB)" });
  }

  next();
}

module.exports = { validateAnalyzeRequest, ALLOWED_MIME_TYPES, MAX_DECODED_BYTES };

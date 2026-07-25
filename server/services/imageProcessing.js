/**
 * Image validation + cost control + fallback-sample extraction, all via
 * `sharp` (a single well-maintained, prebuilt-binary image library).
 *
 * Three jobs, all built on the same decode:
 *   1. Prove the bytes are actually a decodable raster image (a mimetype
 *      string from the client is a claim, not a fact).
 *   2. Downscale/re-encode before it ever reaches Gemini — larger images
 *      cost more tokens, and clients can't be trusted to have compressed
 *      client-side even though the frontend does.
 *   3. Produce real per-photo average-RGB samples for the deterministic
 *      fallback path, replacing what used to be a hardcoded constant.
 */

const sharp = require("sharp");

const MAX_DIMENSION = 1024;
const JPEG_QUALITY = 82;

/**
 * Decodes + validates the image, and returns a Gemini-ready, cost-capped
 * version alongside a sharp instance for further sampling.
 *
 * @param {Buffer} inputBuffer
 * @returns {Promise<{ mimeType: string, base64Data: string, width: number, height: number }>}
 */
async function prepareImageForGemini(inputBuffer) {
  const image = sharp(inputBuffer, { failOn: "error" });
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("File is not a decodable image");
  }

  const resized = await image
    .rotate() // apply EXIF orientation before resizing, then strip metadata
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: JPEG_QUALITY })
    .toBuffer();

  return {
    mimeType: "image/jpeg",
    base64Data: resized.toString("base64"),
    width: metadata.width,
    height: metadata.height,
  };
}

/**
 * Samples average RGB from a few fixed relative regions of the photo as a
 * crude, face-detection-free proxy for cheek/forehead/jaw sampling. This is
 * NOT face detection — it's an approximation that at least reflects the
 * actual uploaded photo (unlike a hardcoded constant), used only on the
 * fallback path when Gemini itself is unavailable.
 *
 * @param {Buffer} inputBuffer
 * @returns {Promise<Array<{ r: number, g: number, b: number }>>}
 */
async function sampleFallbackRegions(inputBuffer) {
  const image = sharp(inputBuffer, { failOn: "error" }).rotate();
  const { width, height } = await image.metadata();
  if (!width || !height) {
    throw new Error("File is not a decodable image");
  }

  // Center, upper-third, and lower-third boxes (each ~20% of the frame's
  // width/height) — a rough stand-in for forehead/cheek/jaw without real
  // landmark detection.
  const boxes = [
    { top: 0.4, left: 0.4 }, // center
    { top: 0.2, left: 0.4 }, // upper third
    { top: 0.6, left: 0.4 }, // lower third
  ];

  const samples = [];
  for (const box of boxes) {
    const boxWidth = Math.max(1, Math.round(width * 0.2));
    const boxHeight = Math.max(1, Math.round(height * 0.2));
    const left = Math.min(width - boxWidth, Math.round(width * box.left));
    const top = Math.min(height - boxHeight, Math.round(height * box.top));

    const { data, info } = await image
      .clone()
      .extract({ left, top, width: boxWidth, height: boxHeight })
      .raw()
      .toBuffer({ resolveWithObject: true });

    let rSum = 0, gSum = 0, bSum = 0;
    const pixelCount = info.width * info.height;
    const channels = info.channels;
    for (let i = 0; i < pixelCount; i++) {
      rSum += data[i * channels];
      gSum += data[i * channels + 1];
      bSum += data[i * channels + 2];
    }
    samples.push({
      r: Math.round(rSum / pixelCount),
      g: Math.round(gSum / pixelCount),
      b: Math.round(bSum / pixelCount),
    });
  }

  return samples;
}

module.exports = { prepareImageForGemini, sampleFallbackRegions, MAX_DIMENSION };

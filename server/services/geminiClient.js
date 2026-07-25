/**
 * Gemini Vision API client — thin wrapper with retries, backoff, and
 * structured-JSON enforcement.
 *
 * Model choice: gemini-2.5-flash by default.
 *   - Free tier available (good for MVP / low traffic).
 *   - Multimodal (accepts images).
 *   - Cheaper than larger models for this workload.
 * Swap GEMINI_MODEL env var to "gemini-2.5-flash-lite" for the even
 * cheaper tier once you've validated output quality is good enough.
 */

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

class GeminiError extends Error {
  constructor(message, { status, retryable, retryAfterMs } = {}) {
    super(message);
    this.name = "GeminiError";
    this.status = status;
    this.retryable = retryable ?? false;
    this.retryAfterMs = retryAfterMs ?? null;
  }
}

function getApiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error(
      "GEMINI_API_KEY is not set. Get a free key at https://aistudio.google.com/apikey and set it in your environment (.env file)."
    );
  }
  return key;
}

/**
 * Calls Gemini's generateContent endpoint with an image + text prompt,
 * requesting a JSON response constrained by responseSchema.
 *
 * @param {Object} params
 * @param {string} params.model - e.g. "gemini-2.5-flash"
 * @param {string} params.prompt - instruction text
 * @param {{ mimeType: string, base64Data: string }} [params.image] - optional image input
 * @param {Object} params.responseSchema - Gemini structured-output schema
 * @param {number} [params.maxRetries=3]
 * @returns {Promise<Object>} parsed JSON response
 */
async function callGeminiJSON({ model, prompt, image, responseSchema, maxRetries = 3 }) {
  const apiKey = getApiKey();
  const url = `${GEMINI_API_BASE}/${model}:generateContent`;

  const parts = [];
  if (image) {
    parts.push({ inline_data: { mime_type: image.mimeType, data: image.base64Data } });
  }
  parts.push({ text: prompt });

  const body = {
    contents: [{ role: "user", parts }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema,
      temperature: 0.2, // low temperature: we want consistent, repeatable classifications, not creative variance
    },
  };

  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Key goes in a header, not the URL, so it never ends up in server
          // access logs, proxy logs, or browser/referrer history.
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify(body),
      });

      if (res.status === 429 || res.status >= 500) {
        const retryAfterHeader = Number(res.headers.get("retry-after"));
        const retryAfterMs = Number.isFinite(retryAfterHeader) && retryAfterHeader > 0
          ? retryAfterHeader * 1000
          : null;
        throw new GeminiError(`Gemini API returned ${res.status}`, {
          status: res.status,
          retryable: true,
          retryAfterMs,
        });
      }

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new GeminiError(`Gemini API error ${res.status}: ${errText}`, {
          status: res.status,
          retryable: false,
        });
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new GeminiError("Gemini response missing expected text content", {
          retryable: true,
        });
      }

      // responseSchema constrains the shape, but always parse defensively —
      // never trust an external API's output as pre-validated.
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new GeminiError("Gemini response was not valid JSON despite responseSchema", {
          retryable: true,
        });
      }

      return parsed;
    } catch (err) {
      lastError = err;
      const retryable = err instanceof GeminiError ? err.retryable : true; // network errors -> retryable
      if (!retryable || attempt === maxRetries) break;

      // Exponential backoff with jitter, but honor a server-provided
      // Retry-After if one was sent — important on the free tier, which has
      // low requests-per-minute limits and returns 429s under light load.
      const exponentialMs = Math.min(1000 * 2 ** attempt, 8000) + Math.random() * 300;
      const backoffMs = err instanceof GeminiError && err.retryAfterMs
        ? Math.max(err.retryAfterMs, exponentialMs)
        : exponentialMs;
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }

  throw lastError;
}

module.exports = { callGeminiJSON, GeminiError };

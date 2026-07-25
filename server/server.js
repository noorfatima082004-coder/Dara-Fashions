require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const analyzeUserRoute = require("./routes/analyzeUser");

const app = express();

// Behind a reverse proxy (Vercel, Render, etc.) so req.ip needs the
// X-Forwarded-For header to reflect the real client — required for the
// rate limiter below to key by actual visitor rather than the proxy's IP.
app.set("trust proxy", 1);

app.use(helmet());

// Only restrict cross-origin access when a specific origin is configured.
// When this API is deployed alongside the frontend on the same domain
// (e.g. as a Vercel serverless function under /api), the browser request
// is same-origin and CORS doesn't come into play at all — forcing a
// mismatched CORS_ORIGIN in that setup would just break same-origin
// requests for no security benefit. Set CORS_ORIGIN only when the backend
// is hosted on its own separate domain from the frontend.
if (process.env.CORS_ORIGIN) {
  app.use(cors({ origin: process.env.CORS_ORIGIN }));
}

// Size cap on the whole body — base64 images inflate ~33% over raw bytes,
// so 8mb comfortably covers the 6MB decoded-image cap enforced in
// middleware/validateAnalyzeRequest.js while still bounding worst-case
// memory use per request.
app.use(express.json({ limit: "8mb" }));

app.use("/api", analyzeUserRoute);

app.get("/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3000;

// Only bind a port when this file is run directly (local dev / a standalone
// host like Render). When required as a module by a serverless wrapper
// (e.g. api/[...all].cjs on Vercel), the platform invokes the exported app
// per-request instead — calling listen() there would be pointless and, on
// a reused warm instance, could throw on a second bind attempt.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Dara AI stylist backend running on port ${PORT}`);
    if (!process.env.GEMINI_API_KEY) {
      console.warn(
        "WARNING: GEMINI_API_KEY not set — all requests will fall back to the deterministic estimator. Get a free key at https://aistudio.google.com/apikey"
      );
    }
  });
}

module.exports = app;

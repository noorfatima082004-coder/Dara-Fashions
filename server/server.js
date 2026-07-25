require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const analyzeUserRoute = require("./routes/analyzeUser");

const app = express();

app.use(helmet());

// Locked to the configured frontend origin — this endpoint can trigger a
// paid API call, so it should not be callable from arbitrary websites via a
// browser. No wildcard "*".
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";
app.use(cors({ origin: corsOrigin }));

// Size cap on the whole body — base64 images inflate ~33% over raw bytes,
// so 8mb comfortably covers the 6MB decoded-image cap enforced in
// middleware/validateAnalyzeRequest.js while still bounding worst-case
// memory use per request.
app.use(express.json({ limit: "8mb" }));

app.use("/api", analyzeUserRoute);

app.get("/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Dara AI stylist backend running on port ${PORT}`);
  if (!process.env.GEMINI_API_KEY) {
    console.warn(
      "WARNING: GEMINI_API_KEY not set — all requests will fall back to the deterministic estimator. Get a free key at https://aistudio.google.com/apikey"
    );
  }
});

module.exports = app;

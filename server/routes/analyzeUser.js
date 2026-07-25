const express = require("express");
const rateLimit = require("express-rate-limit");
const { validateAnalyzeRequest } = require("../middleware/validateAnalyzeRequest");
const { analyzeUserProfile } = require("../services/userAnalysis");

const router = express.Router();

// This is the one endpoint that can trigger a paid Gemini call, so it gets
// its own (tighter) limiter rather than relying on a global one — a
// legitimate user only calls this a handful of times per session (initial
// analysis + occasional retakes).
const analyzeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many analysis requests. Please try again later." },
});

router.post("/analyze-user", analyzeLimiter, validateAnalyzeRequest, async (req, res) => {
  try {
    const { userId, image } = req.body;
    const imageBuffer = Buffer.from(image.base64Data, "base64");

    const profile = await analyzeUserProfile(userId, imageBuffer, {
      forceRefresh: req.query.refresh === "true",
    });

    res.json(profile);
  } catch (err) {
    console.error("[/analyze-user] error:", err);
    const status = err.statusCode || 500;
    res.status(status).json({
      error: status === 400 ? err.message : "Failed to analyze photo. Please try again.",
    });
  }
});

module.exports = router;

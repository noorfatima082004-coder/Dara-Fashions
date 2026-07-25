// Vercel serverless entry point for POST /api/analyze-user. Named to match
// that one route exactly (rather than a [...catch-all]) so there's no
// dependence on Vercel's dynamic-route matching — just a direct file-to-path
// mapping. No route logic lives here, it's all in server/. ".cjs" forces
// CommonJS regardless of the root package.json's "type": "module" (needed
// because server.js and everything it requires is written as CommonJS).
module.exports = require("../server/server.js");

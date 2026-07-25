// Vercel serverless entry point. Catches every request under /api/* and
// hands it to the same Express app used for local dev / a standalone host
// — no route logic lives here, it's all in server/. ".cjs" forces CommonJS
// regardless of the root package.json's "type": "module" (needed because
// server.js and everything it requires is written as CommonJS).
module.exports = require("../server/server.js");

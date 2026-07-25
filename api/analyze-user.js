// Vercel serverless entry point for POST /api/analyze-user.
//
// Plain ".js" (not ".cjs") deliberately: the root package.json declares
// "type": "module", so Vercel's Node builder parses this file as ESM —
// that's unambiguous and matches Vercel's documented auto-detection for
// files under /api, unlike ".cjs" which wasn't picked up as a function at
// all (the build log showed no function build step, only the Vite build).
//
// server/server.js itself stays CommonJS — it lives under server/, which
// has its own package.json with no "type" override, so Node resolves it
// as CommonJS regardless of this file's ESM-ness, and the import below
// gets the usual CJS/ESM interop (module.exports becomes the default
// export).
import app from "../server/server.js";

export default app;

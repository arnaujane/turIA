const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "..", "..", ".env") });

function toBoolean(value, defaultValue) {
  if (value === undefined) {
    return defaultValue;
  }

  return String(value).toLowerCase() === "true";
}

module.exports = {
  port: Number(process.env.PORT || 3000),
  allowedOrigin: process.env.ALLOWED_ORIGIN || "*",
  demoRouteLocale: process.env.DEMO_ROUTE_LOCALE || "es-ES",
  demoUseStaticFallbacks: toBoolean(process.env.DEMO_USE_STATIC_FALLBACKS, true),
  demoEnableMockProgress: toBoolean(process.env.DEMO_ENABLE_MOCK_PROGRESS, true),
  googleCloudUseRealApis: toBoolean(process.env.GOOGLE_CLOUD_USE_REAL_APIS, false),
  googleCloudProjectId: process.env.GOOGLE_CLOUD_PROJECT_ID || "",
  googleCloudRegion: process.env.GOOGLE_CLOUD_REGION || "",
  vertexModel: process.env.VERTEX_MODEL || "gemini-2.0-flash-001",
  ttsVoiceName: process.env.TTS_VOICE_NAME || "es-ES-Neural2-A"
};

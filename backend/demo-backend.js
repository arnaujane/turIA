const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const BASE_URL = process.env.DEMO_BASE_URL || "http://localhost:3000";
const USER_ID = process.env.DEMO_USER_ID || "demo_backend_user_node_001";
const KEEP_SERVER_RUNNING = process.argv.includes("--keep-server-running");

const backendDir = __dirname;
const backendEnvPath = path.join(backendDir, ".env");
const backendEntry = path.join(backendDir, "src", "server.js");
const tempImagePath = path.join(os.tmpdir(), "turia-demo-image.png");

let startedServer = false;
let serverProcess = null;

function logStep(title) {
  console.log(`\n== ${title} ==`);
}

function pretty(value) {
  console.log(JSON.stringify(value, null, 2));
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();

  let parsed;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = text;
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}: ${typeof parsed === "string" ? parsed : JSON.stringify(parsed)}`);
  }

  return parsed;
}

async function waitForHealth(timeoutMs = 25000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      return await fetchJson(`${BASE_URL}/api/health`);
    } catch {
      await sleep(700);
    }
  }

  throw new Error(`El backend no respondio en ${BASE_URL} dentro del tiempo esperado.`);
}

function ensureEnvFile() {
  if (!fs.existsSync(backendEnvPath)) {
    throw new Error("Falta backend/.env. Configura primero el backend.");
  }
}

function createDemoImage() {
  const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wn2vRsAAAAASUVORK5CYII=";
  fs.writeFileSync(tempImagePath, Buffer.from(pngBase64, "base64"));
}

async function ensureBackendRunning() {
  try {
    const health = await fetchJson(`${BASE_URL}/api/health`);
    console.log(`Backend ya estaba levantado en ${BASE_URL}`);
    return health;
  } catch {
    console.log("No habia backend activo. Arrancando uno nuevo...");
  }

  serverProcess = spawn(process.execPath, [backendEntry], {
    cwd: backendDir,
    stdio: "ignore",
    detached: false
  });

  startedServer = true;
  const health = await waitForHealth();
  console.log(`Backend arrancado con PID ${serverProcess.pid}`);
  return health;
}

async function runProcessPhotoDemo() {
  createDemoImage();

  const form = new FormData();
  const fileBuffer = fs.readFileSync(tempImagePath);
  const blob = new Blob([fileBuffer], { type: "image/png" });

  form.append("image", blob, "turia-demo-image.png");
  form.append("currentPointId", "point-1");

  const response = await fetch(`${BASE_URL}/api/process-photo`, {
    method: "POST",
    body: form
  });

  const text = await response.text();
  const parsed = JSON.parse(text);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  return {
    pointId: parsed.pointId,
    placeName: parsed.place?.name,
    detectedPlace: parsed.place?.detectedPlace,
    confidence: parsed.place?.confidence,
    usedFallback: parsed.usedFallback,
    nextPointId: parsed.nextPointId,
    routeStatus: parsed.routeStatus,
    guidePreview:
      parsed.guide?.placeInfo?.length > 140
        ? `${parsed.guide.placeInfo.slice(0, 140)}...`
        : parsed.guide?.placeInfo,
    audioFormat: parsed.audio?.format,
    audioGenerated: parsed.audio?.generated,
    audioKind: parsed.audio?.url?.startsWith("data:") ? "base64-real-or-generated" : "mock-url",
    riddleQuestion: parsed.riddle?.question
  };
}

async function shutdownIfNeeded() {
  if (fs.existsSync(tempImagePath)) {
    fs.unlinkSync(tempImagePath);
  }

  if (startedServer && !KEEP_SERVER_RUNNING && serverProcess) {
    logStep("Apagando backend lanzado por la demo");
    serverProcess.kill();
    console.log(`Proceso ${serverProcess.pid} detenido.`);
  } else if (startedServer && KEEP_SERVER_RUNNING && serverProcess) {
    logStep("Backend mantenido activo");
    console.log(`Proceso ${serverProcess.pid} sigue corriendo.`);
  }
}

async function main() {
  ensureEnvFile();

  logStep("Comprobando backend");
  const health = await ensureBackendRunning();
  console.log(`Health: ok=${health.ok}, service=${health.service}, timestamp=${health.timestamp}`);

  logStep("Leyendo ruta demo");
  const routeResponse = await fetchJson(`${BASE_URL}/api/route`);
  console.log(`Ruta: ${routeResponse.route.name} (${routeResponse.route.id})`);
  console.log(`Puntos: ${routeResponse.points.map((point) => point.name).join(" -> ")}`);

  logStep("Consultando progreso inicial");
  const progressBefore = await fetchJson(`${BASE_URL}/api/progress/${USER_ID}`);
  pretty(progressBefore);

  logStep("Probando respuesta incorrecta");
  const wrongAnswerResponse = await fetchJson(`${BASE_URL}/api/check-answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: USER_ID,
      pointId: "point-1",
      answer: "Pablo Picasso"
    })
  });
  pretty(wrongAnswerResponse);

  logStep("Probando respuesta correcta");
  const correctAnswerResponse = await fetchJson(`${BASE_URL}/api/check-answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: USER_ID,
      pointId: "point-1",
      answer: "Antoni Gaudi"
    })
  });
  pretty(correctAnswerResponse);

  logStep("Consultando progreso tras acierto");
  const progressAfter = await fetchJson(`${BASE_URL}/api/progress/${USER_ID}`);
  pretty(progressAfter);

  logStep("Probando process-photo");
  const processPhotoSummary = await runProcessPhotoDemo();
  pretty(processPhotoSummary);

  logStep("Resumen funcional");
  console.log("1. El backend responde y expone la ruta demo.");
  console.log("2. El progreso mock funciona para leer y actualizar estado.");
  console.log("3. check-answer valida respuestas y desbloquea el siguiente punto.");
  console.log("4. process-photo devuelve lugar, audioguia, audio, enigma y siguiente punto.");
  console.log("5. Si Gemini falla, el backend mantiene el flujo con fallback estable.");
}

main()
  .catch((error) => {
    console.error("\nDemo fallida:");
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await shutdownIfNeeded();
    console.log("\nDemo completada.");
  });

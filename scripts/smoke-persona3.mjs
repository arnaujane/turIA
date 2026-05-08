import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

async function readJson(relativePath) {
  const filePath = path.join(repoRoot, relativePath);
  const content = await readFile(filePath, "utf8");
  return JSON.parse(content);
}

function fail(message) {
  console.error(`Smoke check fallido: ${message}`);
  process.exit(1);
}

async function main() {
  const [route, points, sampleResponses, progress] = await Promise.all([
    readJson("demo-data/route.demo.json"),
    readJson("demo-data/points.demo.json"),
    readJson("demo-data/sample-responses.json"),
    readJson("demo-data/progress.demo.json")
  ]);

  const pointMap = new Map(points.map((point) => [point.id, point]));

  if (!pointMap.has(route.startPointId)) {
    fail(`startPointId "${route.startPointId}" no existe en points.demo.json`);
  }

  const visited = [];
  const seen = new Set();
  let currentId = route.startPointId;

  while (currentId) {
    if (seen.has(currentId)) {
      fail(`se detecto un bucle en la ruta al volver a "${currentId}"`);
    }

    const currentPoint = pointMap.get(currentId);
    if (!currentPoint) {
      fail(`el punto "${currentId}" no existe`);
    }

    seen.add(currentId);
    visited.push(currentId);
    currentId = currentPoint.nextPointId;
  }

  if (visited.length !== points.length) {
    fail(`la ruta solo recorre ${visited.length} puntos de ${points.length}`);
  }

  const visitedOrder = JSON.stringify(visited);
  const declaredOrder = JSON.stringify(route.pointOrder);
  if (visitedOrder !== declaredOrder) {
    fail("el recorrido enlazado por nextPointId no coincide con pointOrder");
  }

  const successResponse = sampleResponses.processPhoto.success;
  const fallbackResponse = sampleResponses.processPhoto.fallback;
  const correctAnswer = sampleResponses.checkAnswer.correct;
  const finalPointAnswer = sampleResponses.checkAnswer.finalPoint;

  if (successResponse.routeStatus !== "in_progress") {
    fail("processPhoto.success debe dejar routeStatus en in_progress");
  }

  const successPoint = pointMap.get(successResponse.pointId);
  if (successPoint.expectedRiddle !== successResponse.riddle.question) {
    fail("processPhoto.success.riddle.question no coincide con expectedRiddle del punto");
  }

  if (successPoint.correctAnswer !== correctAnswer.submittedAnswer) {
    fail("checkAnswer.correct.submittedAnswer no coincide con correctAnswer del punto");
  }

  if (successPoint.nextPointId !== correctAnswer.unlockedPointId) {
    fail("checkAnswer.correct.unlockedPointId no coincide con nextPointId del punto");
  }

  const fallbackPoint = pointMap.get(fallbackResponse.pointId);
  if (fallbackPoint.expectedRiddle !== fallbackResponse.riddle.question) {
    fail("processPhoto.fallback.riddle.question no coincide con expectedRiddle del punto");
  }

  const finalPoint = pointMap.get(finalPointAnswer.pointId);
  if (finalPoint.nextPointId !== null) {
    fail("checkAnswer.finalPoint debe apuntar al ultimo punto real de la ruta");
  }

  if (finalPoint.correctAnswer !== finalPointAnswer.submittedAnswer) {
    fail("checkAnswer.finalPoint.submittedAnswer no coincide con correctAnswer del punto final");
  }

  if (finalPointAnswer.routeStatus !== "completed") {
    fail("checkAnswer.finalPoint debe cerrar la ruta con routeStatus completed");
  }

  if (!progress.unlockedPoints.includes(progress.currentPointId)) {
    fail("progress.demo.json debe incluir currentPointId dentro de unlockedPoints");
  }

  for (const completedPointId of progress.completedChallenges) {
    const pointIndex = route.pointOrder.indexOf(completedPointId);
    const currentIndex = route.pointOrder.indexOf(progress.currentPointId);
    if (pointIndex === -1 || pointIndex >= currentIndex) {
      fail("completedChallenges contiene puntos que no deberian estar completados segun currentPointId");
    }
  }

  if (progress.score < route.scoringRules.photoValidated + route.scoringRules.correctAnswer) {
    fail("progress.demo.json no refleja al menos la puntuacion minima del primer punto resuelto");
  }

  console.log("Smoke check de Persona 3 completado correctamente.");
  console.log(`Orden recorrido: ${visited.join(" -> ")}`);
  console.log(`Estado de progreso demo: ${progress.routeStatus} en ${progress.currentPointId}`);
}

main().catch((error) => {
  fail(error.message);
});

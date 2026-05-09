import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const errors = [];

async function readJson(relativePath) {
  const filePath = path.join(repoRoot, relativePath);
  const content = await readFile(filePath, "utf8");
  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`JSON invalido en ${relativePath}: ${error.message}`);
  }
}

function assert(condition, message) {
  if (!condition) {
    errors.push(message);
  }
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function isObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

async function main() {
  let route;
  let points;
  let sampleResponses;
  let progress;

  try {
    [route, points, sampleResponses, progress] = await Promise.all([
      readJson("demo-data/route.demo.json"),
      readJson("demo-data/points.demo.json"),
      readJson("demo-data/sample-responses.json"),
      readJson("demo-data/progress.demo.json")
    ]);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }

  const routeKeys = [
    "id",
    "name",
    "locale",
    "startPointId",
    "pointOrder",
    "totalPoints",
    "scoringRules"
  ];

  for (const key of routeKeys) {
    assert(key in route, `route.demo.json: falta el campo obligatorio "${key}"`);
  }

  assert(isNonEmptyString(route.id), "route.demo.json: id debe ser string no vacio");
  assert(isNonEmptyString(route.name), "route.demo.json: name debe ser string no vacio");
  assert(isNonEmptyString(route.locale), "route.demo.json: locale debe ser string no vacio");
  assert(isNonEmptyString(route.startPointId), "route.demo.json: startPointId debe ser string no vacio");
  assert(Array.isArray(route.pointOrder), "route.demo.json: pointOrder debe ser un array");
  assert(
    Number.isInteger(route.totalPoints) && route.totalPoints > 0,
    "route.demo.json: totalPoints debe ser entero positivo"
  );
  assert(
    isObject(route.scoringRules),
    "route.demo.json: scoringRules debe ser un objeto"
  );

  const scoringRuleKeys = [
    "photoValidated",
    "correctAnswer",
    "hintPenalty",
    "routeCompletionBonus"
  ];
  for (const key of scoringRuleKeys) {
    assert(
      isFiniteNumber(route.scoringRules?.[key]),
      `route.demo.json: scoringRules.${key} debe ser numerico`
    );
  }

  assert(Array.isArray(points), "points.demo.json: el contenido debe ser un array");
  const pointIds = new Set();

  for (const [index, point] of points.entries()) {
    const label = `points.demo.json[${index}]`;
    const requiredKeys = [
      "id",
      "slug",
      "name",
      "baseDescription",
      "coordinates",
      "testImageRef",
      "expectedRiddle",
      "correctAnswer",
      "nextPointId"
    ];

    for (const key of requiredKeys) {
      assert(key in point, `${label}: falta el campo obligatorio "${key}"`);
    }

    assert(isNonEmptyString(point.id), `${label}: id debe ser string no vacio`);
    assert(isNonEmptyString(point.slug), `${label}: slug debe ser string no vacio`);
    assert(isNonEmptyString(point.name), `${label}: name debe ser string no vacio`);
    assert(
      isNonEmptyString(point.baseDescription),
      `${label}: baseDescription debe ser string no vacio`
    );
    assert(
      isNonEmptyString(point.testImageRef),
      `${label}: testImageRef debe ser string no vacio`
    );
    assert(
      isNonEmptyString(point.expectedRiddle),
      `${label}: expectedRiddle debe ser string no vacio`
    );
    assert(
      isNonEmptyString(point.correctAnswer),
      `${label}: correctAnswer debe ser string no vacio`
    );
    assert(
      point.nextPointId === null || isNonEmptyString(point.nextPointId),
      `${label}: nextPointId debe ser string no vacio o null`
    );
    assert(isObject(point.coordinates), `${label}: coordinates debe ser un objeto`);
    assert(
      isFiniteNumber(point.coordinates?.lat),
      `${label}: coordinates.lat debe ser numerico`
    );
    assert(
      isFiniteNumber(point.coordinates?.lng),
      `${label}: coordinates.lng debe ser numerico`
    );
    assert(!pointIds.has(point.id), `${label}: id duplicado "${point.id}"`);

    pointIds.add(point.id);
  }

  assert(
    route.totalPoints === points.length,
    "route.demo.json: totalPoints debe coincidir con el numero de puntos"
  );
  assert(
    route.pointOrder.length === points.length,
    "route.demo.json: pointOrder debe tener la misma longitud que points.demo.json"
  );
  assert(
    route.pointOrder[0] === route.startPointId,
    "route.demo.json: el primer elemento de pointOrder debe coincidir con startPointId"
  );

  const pointOrderSet = new Set(route.pointOrder);
  assert(
    pointOrderSet.size === route.pointOrder.length,
    "route.demo.json: pointOrder no puede contener IDs duplicados"
  );

  for (const pointId of route.pointOrder) {
    assert(
      pointIds.has(pointId),
      `route.demo.json: pointOrder contiene un punto inexistente "${pointId}"`
    );
  }

  for (const pointId of pointIds) {
    assert(
      pointOrderSet.has(pointId),
      `route.demo.json: falta el punto "${pointId}" dentro de pointOrder`
    );
  }

  for (const point of points) {
    if (point.nextPointId !== null) {
      assert(
        pointIds.has(point.nextPointId),
        `points.demo.json: nextPointId inexistente "${point.nextPointId}" en ${point.id}`
      );
      assert(
        point.nextPointId !== point.id,
        `points.demo.json: ${point.id} no puede apuntarse a si mismo en nextPointId`
      );
    }
  }

  const progressKeys = [
    "userId",
    "currentPointId",
    "score",
    "completedChallenges",
    "unlockedPoints",
    "routeStatus"
  ];
  for (const key of progressKeys) {
    assert(key in progress, `progress.demo.json: falta el campo obligatorio "${key}"`);
  }

  assert(isNonEmptyString(progress.userId), "progress.demo.json: userId debe ser string no vacio");
  assert(
    pointIds.has(progress.currentPointId),
    "progress.demo.json: currentPointId debe existir en points.demo.json"
  );
  assert(
    isFiniteNumber(progress.score) && progress.score >= 0,
    "progress.demo.json: score debe ser numerico y no negativo"
  );
  assert(
    Array.isArray(progress.completedChallenges),
    "progress.demo.json: completedChallenges debe ser un array"
  );
  assert(
    Array.isArray(progress.unlockedPoints),
    "progress.demo.json: unlockedPoints debe ser un array"
  );
  assert(
    ["locked", "in_progress", "completed"].includes(progress.routeStatus),
    "progress.demo.json: routeStatus no es valido"
  );
  assert(
    !("routeId" in progress),
    "progress.demo.json: routeId no debe formar parte del contrato runtime actual"
  );

  for (const pointId of progress.completedChallenges) {
    assert(
      pointIds.has(pointId),
      `progress.demo.json: completedChallenges contiene un punto inexistente "${pointId}"`
    );
  }

  for (const pointId of progress.unlockedPoints) {
    assert(
      pointIds.has(pointId),
      `progress.demo.json: unlockedPoints contiene un punto inexistente "${pointId}"`
    );
  }

  assert(
    progress.unlockedPoints.includes(route.startPointId),
    "progress.demo.json: unlockedPoints debe incluir startPointId"
  );

  assert(
    isObject(sampleResponses),
    "sample-responses.json: debe ser un objeto"
  );
  assert(
    isObject(sampleResponses.processPhoto),
    "sample-responses.json: falta processPhoto"
  );
  assert(
    isObject(sampleResponses.checkAnswer),
    "sample-responses.json: falta checkAnswer"
  );

  const successResponse = sampleResponses.processPhoto?.success;
  const fallbackResponse = sampleResponses.processPhoto?.fallback;
  const errorResponse = sampleResponses.processPhoto?.errors;

  assert(
    isObject(successResponse),
    "sample-responses.json: falta processPhoto.success"
  );
  assert(
    isObject(fallbackResponse),
    "sample-responses.json: falta processPhoto.fallback"
  );
  assert(
    isObject(errorResponse),
    "sample-responses.json: falta processPhoto.errors"
  );

  if (successResponse) {
    assert(
      pointIds.has(successResponse.pointId),
      "sample-responses.json: processPhoto.success.pointId debe existir"
    );
    assert(
      pointIds.has(successResponse.nextPointId),
      "sample-responses.json: processPhoto.success.nextPointId debe existir"
    );
    assert(
      isNonEmptyString(successResponse.requestId),
      "sample-responses.json: processPhoto.success.requestId debe ser string no vacio"
    );
    assert(
      isNonEmptyString(successResponse.detectedPlace),
      "sample-responses.json: processPhoto.success.detectedPlace debe ser string no vacio"
    );
    assert(
      isFiniteNumber(successResponse.confidence),
      "sample-responses.json: processPhoto.success.confidence debe ser numerico"
    );
    assert(
      typeof successResponse.usedFallback === "boolean",
      "sample-responses.json: processPhoto.success.usedFallback debe ser boolean"
    );
    assert(
      isNonEmptyString(successResponse.guideText),
      "sample-responses.json: processPhoto.success.guideText debe ser string no vacio"
    );
    assert(
      isObject(successResponse.audio),
      "sample-responses.json: processPhoto.success.audio debe ser un objeto"
    );
    assert(
      isNonEmptyString(successResponse.audio?.format),
      "sample-responses.json: processPhoto.success.audio.format debe ser string no vacio"
    );
    assert(
      isNonEmptyString(successResponse.audio?.url),
      "sample-responses.json: processPhoto.success.audio.url debe ser string no vacio"
    );
    assert(
      isObject(successResponse.riddle),
      "sample-responses.json: processPhoto.success.riddle debe ser un objeto"
    );
    assert(
      isNonEmptyString(successResponse.riddle?.question),
      "sample-responses.json: processPhoto.success.riddle.question debe ser string no vacio"
    );
    assert(
      Array.isArray(successResponse.riddle?.answerOptions) &&
        successResponse.riddle.answerOptions.length === 3,
      "sample-responses.json: processPhoto.success.riddle.answerOptions debe tener 3 opciones"
    );
    assert(
      isNonEmptyString(successResponse.riddle?.hint),
      "sample-responses.json: processPhoto.success.riddle.hint debe ser string no vacio"
    );
    assert(
      ["locked", "in_progress", "completed"].includes(successResponse.routeStatus),
      "sample-responses.json: processPhoto.success.routeStatus no es valido"
    );
  }

  if (fallbackResponse) {
    assert(
      pointIds.has(fallbackResponse.pointId),
      "sample-responses.json: processPhoto.fallback.pointId debe existir"
    );
    assert(
      isNonEmptyString(fallbackResponse.requestId),
      "sample-responses.json: processPhoto.fallback.requestId debe ser string no vacio"
    );
    assert(
      isNonEmptyString(fallbackResponse.detectedPlace),
      "sample-responses.json: processPhoto.fallback.detectedPlace debe ser string no vacio"
    );
    assert(
      isFiniteNumber(fallbackResponse.confidence),
      "sample-responses.json: processPhoto.fallback.confidence debe ser numerico"
    );
    assert(
      fallbackResponse.usedFallback === true,
      "sample-responses.json: processPhoto.fallback.usedFallback debe ser true"
    );
    assert(
      isNonEmptyString(fallbackResponse.guideText),
      "sample-responses.json: processPhoto.fallback.guideText debe ser string no vacio"
    );
    assert(
      isObject(fallbackResponse.audio),
      "sample-responses.json: processPhoto.fallback.audio debe ser un objeto"
    );
    assert(
      isNonEmptyString(fallbackResponse.audio?.format),
      "sample-responses.json: processPhoto.fallback.audio.format debe ser string no vacio"
    );
    assert(
      isNonEmptyString(fallbackResponse.audio?.url),
      "sample-responses.json: processPhoto.fallback.audio.url debe ser string no vacio"
    );
    assert(
      isObject(fallbackResponse.riddle),
      "sample-responses.json: processPhoto.fallback.riddle debe ser un objeto"
    );
    assert(
      isNonEmptyString(fallbackResponse.riddle?.question),
      "sample-responses.json: processPhoto.fallback.riddle.question debe ser string no vacio"
    );
    assert(
      Array.isArray(fallbackResponse.riddle?.answerOptions) &&
        fallbackResponse.riddle.answerOptions.length === 3,
      "sample-responses.json: processPhoto.fallback.riddle.answerOptions debe tener 3 opciones"
    );
    assert(
      isNonEmptyString(fallbackResponse.riddle?.hint),
      "sample-responses.json: processPhoto.fallback.riddle.hint debe ser string no vacio"
    );
    assert(
      ["locked", "in_progress", "completed"].includes(fallbackResponse.routeStatus),
      "sample-responses.json: processPhoto.fallback.routeStatus no es valido"
    );
  }

  for (const key of ["invalidImage", "placeNotDetected"]) {
    assert(
      isNonEmptyString(errorResponse?.[key]?.code),
      `sample-responses.json: processPhoto.errors.${key}.code debe ser string no vacio`
    );
    assert(
      isNonEmptyString(errorResponse?.[key]?.message),
      `sample-responses.json: processPhoto.errors.${key}.message debe ser string no vacio`
    );
  }

  const answerCases = ["correct", "incorrect", "finalPoint"];
  for (const caseName of answerCases) {
    const answerCase = sampleResponses.checkAnswer?.[caseName];
    assert(
      isObject(answerCase),
      `sample-responses.json: falta checkAnswer.${caseName}`
    );
    assert(
      pointIds.has(answerCase?.pointId),
      `sample-responses.json: checkAnswer.${caseName}.pointId debe existir`
    );
    assert(
      isNonEmptyString(answerCase?.submittedAnswer),
      `sample-responses.json: checkAnswer.${caseName}.submittedAnswer debe ser string no vacio`
    );
    assert(
      typeof answerCase?.isCorrect === "boolean",
      `sample-responses.json: checkAnswer.${caseName}.isCorrect debe ser boolean`
    );
    assert(
      isFiniteNumber(answerCase?.awardedScore),
      `sample-responses.json: checkAnswer.${caseName}.awardedScore debe ser numerico`
    );
    assert(
      answerCase?.unlockedPointId === null || pointIds.has(answerCase?.unlockedPointId),
      `sample-responses.json: checkAnswer.${caseName}.unlockedPointId debe existir o ser null`
    );
    assert(
      ["locked", "in_progress", "completed"].includes(answerCase?.routeStatus),
      `sample-responses.json: checkAnswer.${caseName}.routeStatus no es valido`
    );
    assert(
      isNonEmptyString(answerCase?.feedback),
      `sample-responses.json: checkAnswer.${caseName}.feedback debe ser string no vacio`
    );
  }

  if (successResponse) {
    const successPoint = points.find((point) => point.id === successResponse.pointId);
    assert(
      successPoint?.expectedRiddle === successResponse.riddle?.question,
      "sample-responses.json: processPhoto.success.riddle.question debe coincidir con expectedRiddle"
    );
    assert(
      successResponse.riddle?.answerOptions?.includes(successPoint?.correctAnswer),
      "sample-responses.json: processPhoto.success.riddle.answerOptions debe incluir correctAnswer"
    );
  }

  if (fallbackResponse) {
    const fallbackPoint = points.find((point) => point.id === fallbackResponse.pointId);
    assert(
      fallbackPoint?.expectedRiddle === fallbackResponse.riddle?.question,
      "sample-responses.json: processPhoto.fallback.riddle.question debe coincidir con expectedRiddle"
    );
    assert(
      fallbackResponse.riddle?.answerOptions?.includes(fallbackPoint?.correctAnswer),
      "sample-responses.json: processPhoto.fallback.riddle.answerOptions debe incluir correctAnswer"
    );
  }

  const correctAnswerCase = sampleResponses.checkAnswer?.correct;
  const incorrectAnswerCase = sampleResponses.checkAnswer?.incorrect;
  const finalPointCase = sampleResponses.checkAnswer?.finalPoint;

  if (correctAnswerCase) {
    const point = points.find((candidate) => candidate.id === correctAnswerCase.pointId);
    assert(
      point?.correctAnswer === correctAnswerCase.submittedAnswer,
      "sample-responses.json: checkAnswer.correct.submittedAnswer debe coincidir con correctAnswer"
    );
    assert(
      correctAnswerCase.awardedScore === route.scoringRules.correctAnswer,
      "sample-responses.json: checkAnswer.correct.awardedScore debe reflejar solo correctAnswer activo en runtime"
    );
  }

  if (incorrectAnswerCase) {
    assert(
      incorrectAnswerCase.awardedScore === 0,
      "sample-responses.json: checkAnswer.incorrect.awardedScore debe ser 0"
    );
  }

  if (finalPointCase) {
    const point = points.find((candidate) => candidate.id === finalPointCase.pointId);
    assert(
      point?.correctAnswer === finalPointCase.submittedAnswer,
      "sample-responses.json: checkAnswer.finalPoint.submittedAnswer debe coincidir con correctAnswer"
    );
    assert(
      finalPointCase.awardedScore ===
        route.scoringRules.correctAnswer + route.scoringRules.routeCompletionBonus,
      "sample-responses.json: checkAnswer.finalPoint.awardedScore debe reflejar correctAnswer mas routeCompletionBonus"
    );
  }

  if (errors.length > 0) {
    console.error("Se encontraron errores de validacion:");
    for (const message of errors) {
      console.error(`- ${message}`);
    }
    process.exit(1);
  }

  console.log("Validacion completada correctamente.");
  console.log(`Ruta: ${route.id} (${route.totalPoints} puntos)`);
  console.log(`Puntos validados: ${points.length}`);
}

main();

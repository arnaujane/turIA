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
  let progressSnapshots;

  try {
    [route, points, sampleResponses, progress, progressSnapshots] = await Promise.all([
      readJson("demo-data/route.demo.json"),
      readJson("demo-data/points.demo.json"),
      readJson("demo-data/sample-responses.json"),
      readJson("demo-data/progress.demo.json"),
      readJson("demo-data/progress-snapshots.demo.json")
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
      "city",
      "country",
      "constructionYear",
      "emoji",
      "baseDescription",
      "coordinates",
      "testImageRef",
      "visionAliases",
      "expectedRiddle",
      "answerOptions",
      "correctAnswer",
      "nextPointId"
    ];

    for (const key of requiredKeys) {
      assert(key in point, `${label}: falta el campo obligatorio "${key}"`);
    }

    assert(isNonEmptyString(point.id), `${label}: id debe ser string no vacio`);
    assert(isNonEmptyString(point.slug), `${label}: slug debe ser string no vacio`);
    assert(isNonEmptyString(point.name), `${label}: name debe ser string no vacio`);
    assert(isNonEmptyString(point.city), `${label}: city debe ser string no vacio`);
    assert(isNonEmptyString(point.country), `${label}: country debe ser string no vacio`);
    assert(
      isNonEmptyString(point.constructionYear),
      `${label}: constructionYear debe ser string no vacio`
    );
    assert(isNonEmptyString(point.emoji), `${label}: emoji debe ser string no vacio`);
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
      Array.isArray(point.visionAliases) && point.visionAliases.length > 0,
      `${label}: visionAliases debe ser un array con al menos un alias`
    );
    assert(
      Array.isArray(point.answerOptions) && point.answerOptions.length === 4,
      `${label}: answerOptions debe tener exactamente 4 opciones`
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
    assert(
      point.answerOptions.includes(point.correctAnswer),
      `${label}: answerOptions debe incluir correctAnswer`
    );
    assert(
      new Set(point.answerOptions).size === point.answerOptions.length,
      `${label}: answerOptions no puede tener duplicados`
    );

    for (const alias of point.visionAliases) {
      assert(isNonEmptyString(alias), `${label}: visionAliases contiene un alias vacio`);
    }

    for (const option of point.answerOptions) {
      assert(isNonEmptyString(option), `${label}: answerOptions contiene una opcion vacia`);
    }

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
      isObject(successResponse.place),
      "sample-responses.json: processPhoto.success.place debe ser un objeto"
    );
    assert(
      isNonEmptyString(successResponse.place?.detectedPlace),
      "sample-responses.json: processPhoto.success.place.detectedPlace debe ser string no vacio"
    );
    assert(
      isNonEmptyString(successResponse.place?.name),
      "sample-responses.json: processPhoto.success.place.name debe ser string no vacio"
    );
    assert(
      isFiniteNumber(successResponse.place?.confidence),
      "sample-responses.json: processPhoto.success.place.confidence debe ser numerico"
    );
    assert(
      isObject(successResponse.place?.location),
      "sample-responses.json: processPhoto.success.place.location debe ser un objeto"
    );
    assert(
      isNonEmptyString(successResponse.place?.location?.city),
      "sample-responses.json: processPhoto.success.place.location.city debe ser string no vacio"
    );
    assert(
      isNonEmptyString(successResponse.place?.location?.country),
      "sample-responses.json: processPhoto.success.place.location.country debe ser string no vacio"
    );
    assert(
      isNonEmptyString(successResponse.place?.location?.constructionYear),
      "sample-responses.json: processPhoto.success.place.location.constructionYear debe ser string no vacio"
    );
    assert(
      isNonEmptyString(successResponse.place?.emoji),
      "sample-responses.json: processPhoto.success.place.emoji debe ser string no vacio"
    );
    assert(
      typeof successResponse.usedFallback === "boolean",
      "sample-responses.json: processPhoto.success.usedFallback debe ser boolean"
    );
    assert(
      isObject(successResponse.guide),
      "sample-responses.json: processPhoto.success.guide debe ser un objeto"
    );
    assert(
      isNonEmptyString(successResponse.guide?.placeInfo),
      "sample-responses.json: processPhoto.success.guide.placeInfo debe ser string no vacio"
    );
    assert(
      isNonEmptyString(successResponse.guide?.audioGuideText),
      "sample-responses.json: processPhoto.success.guide.audioGuideText debe ser string no vacio"
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
      typeof successResponse.audio?.generated === "boolean",
      "sample-responses.json: processPhoto.success.audio.generated debe ser boolean"
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
        successResponse.riddle.answerOptions.length === 4,
      "sample-responses.json: processPhoto.success.riddle.answerOptions debe tener 4 opciones"
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
      isObject(fallbackResponse.place),
      "sample-responses.json: processPhoto.fallback.place debe ser un objeto"
    );
    assert(
      isNonEmptyString(fallbackResponse.place?.detectedPlace),
      "sample-responses.json: processPhoto.fallback.place.detectedPlace debe ser string no vacio"
    );
    assert(
      isNonEmptyString(fallbackResponse.place?.name),
      "sample-responses.json: processPhoto.fallback.place.name debe ser string no vacio"
    );
    assert(
      isFiniteNumber(fallbackResponse.place?.confidence),
      "sample-responses.json: processPhoto.fallback.place.confidence debe ser numerico"
    );
    assert(
      isObject(fallbackResponse.place?.location),
      "sample-responses.json: processPhoto.fallback.place.location debe ser un objeto"
    );
    assert(
      isNonEmptyString(fallbackResponse.place?.location?.city),
      "sample-responses.json: processPhoto.fallback.place.location.city debe ser string no vacio"
    );
    assert(
      isNonEmptyString(fallbackResponse.place?.location?.country),
      "sample-responses.json: processPhoto.fallback.place.location.country debe ser string no vacio"
    );
    assert(
      isNonEmptyString(fallbackResponse.place?.location?.constructionYear),
      "sample-responses.json: processPhoto.fallback.place.location.constructionYear debe ser string no vacio"
    );
    assert(
      isNonEmptyString(fallbackResponse.place?.emoji),
      "sample-responses.json: processPhoto.fallback.place.emoji debe ser string no vacio"
    );
    assert(
      fallbackResponse.usedFallback === true,
      "sample-responses.json: processPhoto.fallback.usedFallback debe ser true"
    );
    assert(
      isObject(fallbackResponse.guide),
      "sample-responses.json: processPhoto.fallback.guide debe ser un objeto"
    );
    assert(
      isNonEmptyString(fallbackResponse.guide?.placeInfo),
      "sample-responses.json: processPhoto.fallback.guide.placeInfo debe ser string no vacio"
    );
    assert(
      isNonEmptyString(fallbackResponse.guide?.audioGuideText),
      "sample-responses.json: processPhoto.fallback.guide.audioGuideText debe ser string no vacio"
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
      typeof fallbackResponse.audio?.generated === "boolean",
      "sample-responses.json: processPhoto.fallback.audio.generated debe ser boolean"
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
        fallbackResponse.riddle.answerOptions.length === 4,
      "sample-responses.json: processPhoto.fallback.riddle.answerOptions debe tener 4 opciones"
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

  const debugResponse = sampleResponses.processPhotoDebug?.success;

  assert(
    isObject(sampleResponses.processPhotoDebug),
    "sample-responses.json: falta processPhotoDebug"
  );
  assert(
    isObject(debugResponse),
    "sample-responses.json: falta processPhotoDebug.success"
  );

  if (debugResponse) {
    assert(
      isNonEmptyString(debugResponse.requestId),
      "sample-responses.json: processPhotoDebug.success.requestId debe ser string no vacio"
    );
    assert(
      pointIds.has(debugResponse.matchedPointId),
      "sample-responses.json: processPhotoDebug.success.matchedPointId debe existir"
    );
    assert(
      typeof debugResponse.usedFallback === "boolean",
      "sample-responses.json: processPhotoDebug.success.usedFallback debe ser boolean"
    );
    assert(
      isObject(debugResponse.vision),
      "sample-responses.json: processPhotoDebug.success.vision debe ser un objeto"
    );
    assert(
      isObject(debugResponse.canonicalPlace),
      "sample-responses.json: processPhotoDebug.success.canonicalPlace debe ser un objeto"
    );
    assert(
      isObject(debugResponse.promptInputs),
      "sample-responses.json: processPhotoDebug.success.promptInputs debe ser un objeto"
    );
    assert(
      isObject(debugResponse.promptOutputs),
      "sample-responses.json: processPhotoDebug.success.promptOutputs debe ser un objeto"
    );
    assert(
      isObject(debugResponse.audio),
      "sample-responses.json: processPhotoDebug.success.audio debe ser un objeto"
    );
    assert(
      isObject(debugResponse.frontendResponse),
      "sample-responses.json: processPhotoDebug.success.frontendResponse debe ser un objeto"
    );
    assert(
      isObject(debugResponse.finalProcessPhoto),
      "sample-responses.json: processPhotoDebug.success.finalProcessPhoto debe ser un objeto"
    );

    assert(
      isNonEmptyString(debugResponse.canonicalPlace.name),
      "sample-responses.json: processPhotoDebug.success.canonicalPlace.name debe ser string no vacio"
    );
    assert(
      isNonEmptyString(debugResponse.canonicalPlace.city),
      "sample-responses.json: processPhotoDebug.success.canonicalPlace.city debe ser string no vacio"
    );
    assert(
      isNonEmptyString(debugResponse.canonicalPlace.country),
      "sample-responses.json: processPhotoDebug.success.canonicalPlace.country debe ser string no vacio"
    );
    assert(
      isNonEmptyString(debugResponse.canonicalPlace.constructionYear),
      "sample-responses.json: processPhotoDebug.success.canonicalPlace.constructionYear debe ser string no vacio"
    );
    assert(
      isNonEmptyString(debugResponse.canonicalPlace.emoji),
      "sample-responses.json: processPhotoDebug.success.canonicalPlace.emoji debe ser string no vacio"
    );

    assert(
      isNonEmptyString(debugResponse.promptInputs.guideTemplateFile),
      "sample-responses.json: processPhotoDebug.success.promptInputs.guideTemplateFile debe ser string no vacio"
    );
    assert(
      isNonEmptyString(debugResponse.promptInputs.riddleTemplateFile),
      "sample-responses.json: processPhotoDebug.success.promptInputs.riddleTemplateFile debe ser string no vacio"
    );
    assert(
      isObject(debugResponse.promptInputs.variables),
      "sample-responses.json: processPhotoDebug.success.promptInputs.variables debe ser un objeto"
    );
    assert(
      isObject(debugResponse.promptOutputs.guide),
      "sample-responses.json: processPhotoDebug.success.promptOutputs.guide debe ser un objeto"
    );
    assert(
      isObject(debugResponse.promptOutputs.riddle),
      "sample-responses.json: processPhotoDebug.success.promptOutputs.riddle debe ser un objeto"
    );
    assert(
      isNonEmptyString(debugResponse.promptOutputs.guide.placeInfo),
      "sample-responses.json: processPhotoDebug.success.promptOutputs.guide.placeInfo debe ser string no vacio"
    );
    assert(
      isNonEmptyString(debugResponse.promptOutputs.guide.audioGuideText),
      "sample-responses.json: processPhotoDebug.success.promptOutputs.guide.audioGuideText debe ser string no vacio"
    );
    assert(
      Array.isArray(debugResponse.promptOutputs.riddle.answerOptions) &&
        debugResponse.promptOutputs.riddle.answerOptions.length === 4,
      "sample-responses.json: processPhotoDebug.success.promptOutputs.riddle.answerOptions debe tener 4 opciones"
    );
    assert(
      isNonEmptyString(debugResponse.promptOutputs.riddle.correctAnswer),
      "sample-responses.json: processPhotoDebug.success.promptOutputs.riddle.correctAnswer debe ser string no vacio"
    );
    assert(
      pointIds.has(debugResponse.finalProcessPhoto.pointId),
      "sample-responses.json: processPhotoDebug.success.finalProcessPhoto.pointId debe existir"
    );
    assert(
      pointIds.has(debugResponse.frontendResponse.pointId),
      "sample-responses.json: processPhotoDebug.success.frontendResponse.pointId debe existir"
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

  assert(
    isObject(progressSnapshots),
    "progress-snapshots.demo.json: debe ser un objeto"
  );

  const expectedSnapshotCases = [
    "newUser",
    "afterFirstPoint",
    "midRoute",
    "incorrectAnswer",
    "completedRoute"
  ];

  for (const caseName of expectedSnapshotCases) {
    const snapshot = progressSnapshots?.[caseName];
    assert(
      isObject(snapshot),
      `progress-snapshots.demo.json: falta el caso "${caseName}"`
    );

    if (!isObject(snapshot)) {
      continue;
    }

    const label = `progress-snapshots.demo.json.${caseName}`;

    for (const key of progressKeys) {
      assert(key in snapshot, `${label}: falta el campo obligatorio "${key}"`);
    }

    assert(isNonEmptyString(snapshot.userId), `${label}: userId debe ser string no vacio`);
    assert(
      pointIds.has(snapshot.currentPointId),
      `${label}: currentPointId debe existir en points.demo.json`
    );
    assert(
      isFiniteNumber(snapshot.score) && snapshot.score >= 0,
      `${label}: score debe ser numerico y no negativo`
    );
    assert(
      Array.isArray(snapshot.completedChallenges),
      `${label}: completedChallenges debe ser un array`
    );
    assert(
      Array.isArray(snapshot.unlockedPoints),
      `${label}: unlockedPoints debe ser un array`
    );
    assert(
      ["locked", "in_progress", "completed"].includes(snapshot.routeStatus),
      `${label}: routeStatus no es valido`
    );
    assert(
      !("routeId" in snapshot),
      `${label}: routeId no debe formar parte del contrato runtime actual`
    );

    for (const pointId of snapshot.completedChallenges) {
      assert(
        pointIds.has(pointId),
        `${label}: completedChallenges contiene un punto inexistente "${pointId}"`
      );
    }

    for (const pointId of snapshot.unlockedPoints) {
      assert(
        pointIds.has(pointId),
        `${label}: unlockedPoints contiene un punto inexistente "${pointId}"`
      );
    }

    assert(
      snapshot.unlockedPoints.includes(route.startPointId),
      `${label}: unlockedPoints debe incluir startPointId`
    );
    assert(
      snapshot.unlockedPoints.includes(snapshot.currentPointId),
      `${label}: unlockedPoints debe incluir currentPointId`
    );
    assert(
      new Set(snapshot.completedChallenges).size === snapshot.completedChallenges.length,
      `${label}: completedChallenges no puede tener duplicados`
    );
    assert(
      new Set(snapshot.unlockedPoints).size === snapshot.unlockedPoints.length,
      `${label}: unlockedPoints no puede tener duplicados`
    );

    const currentIndex = route.pointOrder.indexOf(snapshot.currentPointId);
    for (const completedPointId of snapshot.completedChallenges) {
      const pointIndex = route.pointOrder.indexOf(completedPointId);
      assert(
        pointIndex !== -1 && pointIndex <= currentIndex,
        `${label}: completedChallenges contiene puntos fuera de orden respecto a currentPointId`
      );
    }

    const expectedUnlocked = route.pointOrder.slice(0, currentIndex + 1);
    for (const unlockedPointId of expectedUnlocked) {
      assert(
        snapshot.unlockedPoints.includes(unlockedPointId),
        `${label}: falta el desbloqueo esperado de "${unlockedPointId}"`
      );
    }

    const completedCount = snapshot.completedChallenges.length;
    const expectedBaseScore = completedCount * route.scoringRules.correctAnswer;
    const expectedFinalScore =
      expectedBaseScore +
      (snapshot.routeStatus === "completed" ? route.scoringRules.routeCompletionBonus : 0);

    assert(
      snapshot.score === expectedFinalScore,
      `${label}: score no cuadra con las reglas runtime activas`
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
  console.log(`Snapshots runtime validados: ${expectedSnapshotCases.length}`);
}

main();

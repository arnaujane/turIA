const {
  getPointById,
  getPoints,
  getRoute,
  getSampleResponses
} = require("./data-service");
const {
  summarizeVisionForPoint,
  analyzeImageWithVision,
  generateGuideFromPoint,
  generateRiddleFromPoint,
  generateAudioFromText
} = require("./google-cloud.service");
const env = require("../config/env");

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function randomRequestId(prefix) {
  return `${prefix}-${Date.now()}`;
}

function getProcessPhotoFallback(pointId) {
  const sampleResponses = getSampleResponses().processPhoto;

  if (sampleResponses.success.pointId === pointId) {
    return structuredClone(sampleResponses.success);
  }

  if (sampleResponses.fallback.pointId === pointId) {
    return structuredClone(sampleResponses.fallback);
  }

  const point = getPointById(pointId);

  return {
    requestId: randomRequestId("demo-fallback"),
    pointId,
    detectedPlace: point?.name || sampleResponses.fallback.detectedPlace,
    confidence: 0,
    usedFallback: true,
    guideText: point?.baseDescription || sampleResponses.fallback.guideText,
    audio: {
      format: "mp3",
      url: `/mock-audio/${pointId}.mp3`
    },
    riddle: {
      question: point?.expectedRiddle || sampleResponses.fallback.riddle.question,
      answerOptions: buildAnswerOptions(point || getPointById(sampleResponses.fallback.pointId)),
      hint: point ? `Pista breve sobre ${point.name}.` : sampleResponses.fallback.riddle.hint
    },
    nextPointId: point?.nextPointId ?? sampleResponses.fallback.nextPointId,
    routeStatus: point?.nextPointId ? "in_progress" : "completed"
  };
}

function buildAnswerOptions(point) {
  const otherPoints = getPoints()
    .filter((candidate) => candidate.id !== point.id)
    .slice(0, 2)
    .map((candidate) => candidate.correctAnswer);

  return [point.correctAnswer, ...otherPoints];
}

function getExpectedPointId(payload) {
  return payload.mockPointId || payload.expectedPointId || payload.currentPointId || getRoute().startPointId;
}

async function analyzeImage({ file, body }) {
  if (!file) {
    const error = new Error("La imagen recibida no es valida para el flujo de demo.");
    error.status = 400;
    error.code = "INVALID_IMAGE";
    throw error;
  }

  const expectedPointId = getExpectedPointId(body);
  const point = getPointById(expectedPointId);

  if (!point) {
    const error = new Error("No se ha podido detectar un punto de interes con suficiente confianza.");
    error.status = 404;
    error.code = "PLACE_NOT_DETECTED";
    throw error;
  }

  const useFallback = String(body.forceFallback).toLowerCase() === "true";

  if (useFallback && env.demoUseStaticFallbacks) {
    const fallback = getSampleResponses().processPhoto.fallback;
    return {
      requestId: fallback.requestId,
      pointId: fallback.pointId,
      detectedPlace: fallback.detectedPlace,
      confidence: fallback.confidence,
      usedFallback: true,
      visionLabels: ["fallback", fallback.detectedPlace],
      visionOcr: "",
      visionSummary: "Analisis en fallback demo por baja estabilidad o forzado manual."
    };
  }

  let vision = summarizeVisionForPoint(point);

  if (env.googleCloudUseRealApis) {
    vision = await analyzeImageWithVision(file.buffer);
  }

  return {
    requestId: randomRequestId("analyze"),
    pointId: point.id,
    detectedPlace: vision.detectedPlace || point.name,
    confidence: vision.confidence,
    usedFallback: false,
    visionLabels: vision.labels,
    visionOcr: vision.ocrText,
    visionSummary: vision.summary
  };
}

async function generateGuide(payload) {
  const point = getPointById(payload.pointId);

  if (!point) {
    const error = new Error("No se ha encontrado el punto solicitado.");
    error.status = 404;
    error.code = "POINT_NOT_FOUND";
    throw error;
  }

  const answerOptions = buildAnswerOptions(point);

  if (payload.usedFallback && env.demoUseStaticFallbacks) {
    const fallback = getSampleResponses().processPhoto.fallback;
    return {
      pointId: fallback.pointId,
      guideText: fallback.guideText,
      riddle: fallback.riddle,
      nextPointId: fallback.nextPointId,
      routeStatus: fallback.routeStatus,
      usedFallback: true
    };
  }

  try {
    return {
      pointId: point.id,
      guideText: await generateGuideFromPoint(point, payload.visionContext),
      riddle: await generateRiddleFromPoint(point, answerOptions, payload.visionContext),
      nextPointId: point.nextPointId,
      routeStatus: point.nextPointId ? "in_progress" : "completed",
      usedFallback: false
    };
  } catch (error) {
    if (!env.demoUseStaticFallbacks) {
      throw error;
    }

    const fallback = getProcessPhotoFallback(point.id);

    return {
      pointId: fallback.pointId,
      guideText: fallback.guideText,
      riddle: fallback.riddle,
      nextPointId: fallback.nextPointId,
      routeStatus: fallback.routeStatus,
      usedFallback: true,
      generationError: {
        code: error.code || "GENERATION_FALLBACK",
        message: error.message
      }
    };
  }
}

async function generateAudio(payload) {
  const point = getPointById(payload.pointId);

  if (!point) {
    const error = new Error("No se ha encontrado el punto solicitado.");
    error.status = 404;
    error.code = "POINT_NOT_FOUND";
    throw error;
  }

  if (payload.usedFallback && env.demoUseStaticFallbacks) {
    return {
      pointId: payload.pointId,
      audio: getSampleResponses().processPhoto.fallback.audio,
      usedFallback: true
    };
  }

  return {
    pointId: point.id,
    audio: await generateAudioFromText(point.id, payload.guideText),
    usedFallback: false
  };
}

async function processPhoto({ file, body }) {
  const analysis = await analyzeImage({ file, body });
  const guide = await generateGuide({
    pointId: analysis.pointId,
    usedFallback: analysis.usedFallback,
    visionContext: {
      labels: analysis.visionLabels,
      ocrText: analysis.visionOcr,
      summary: analysis.visionSummary
    }
  });
  const audio = await generateAudio({
    pointId: guide.pointId,
    usedFallback: guide.usedFallback,
    guideText: guide.guideText
  });

  return {
    requestId: analysis.requestId,
    pointId: guide.pointId,
    detectedPlace: analysis.detectedPlace,
    confidence: analysis.confidence,
    usedFallback: analysis.usedFallback || guide.usedFallback,
    guideText: guide.guideText,
    audio: audio.audio,
    riddle: guide.riddle,
    nextPointId: guide.nextPointId,
    routeStatus: guide.routeStatus
  };
}

function validateAnswer(pointId, submittedAnswer) {
  const point = getPointById(pointId);

  if (!point) {
    const error = new Error("No se ha encontrado el punto solicitado.");
    error.status = 404;
    error.code = "POINT_NOT_FOUND";
    throw error;
  }

  return normalizeText(submittedAnswer) === normalizeText(point.correctAnswer);
}

module.exports = {
  analyzeImage,
  generateGuide,
  generateAudio,
  processPhoto,
  validateAnswer
};

const {
  getCanonicalPlace,
  getPointById,
  getPoints,
  getRoute,
  getSampleResponses
} = require("./data-service");
const {
  summarizeVisionForPoint,
  analyzeImageWithVision,
  buildPromptInputsForPoint,
  generateGuidePackageFromPoint,
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

function buildAnswerOptions(point) {
  return structuredClone(point.answerOptions || []);
}

function buildRiddleFromPoint(point) {
  return {
    question: point.expectedRiddle,
    answerOptions: buildAnswerOptions(point),
    hint: `Pista breve sobre ${point.name}.`
  };
}

function buildFinalResult({ canonicalPlace, promptOutputs, audio }) {
  const guide = promptOutputs?.guide || {};
  const riddle = promptOutputs?.riddle || {};

  return {
    name: canonicalPlace.name,
    location: {
      city: canonicalPlace.city,
      country: canonicalPlace.country,
      constructionYear: canonicalPlace.constructionYear
    },
    emoji: canonicalPlace.emoji,
    placeInfo: guide.placeInfo,
    audioGuideText: guide.audioGuideText,
    audioGenerated: Boolean(audio?.url),
    audioFormat: audio?.format || null,
    riddle: {
      question: riddle.question,
      answerOptions: riddle.answerOptions || [],
      correctAnswer: riddle.correctAnswer,
      hint: riddle.hint
    }
  };
}

function buildFrontendProcessPhotoResponse({
  analysis,
  guide,
  audio,
  canonicalPlace
}) {
  const guideOutput = guide.promptOutputs?.guide || {};
  const riddleOutput = guide.promptOutputs?.riddle || {};
  const usedFallback = analysis.usedFallback || guide.usedFallback || audio.usedFallback;

  return {
    requestId: analysis.requestId,
    pointId: guide.pointId,
    nextPointId: guide.nextPointId,
    routeStatus: guide.routeStatus,
    usedFallback,
    place: {
      detectedPlace: analysis.detectedPlace,
      name: canonicalPlace.name,
      confidence: analysis.confidence,
      location: {
        city: canonicalPlace.city,
        country: canonicalPlace.country,
        constructionYear: canonicalPlace.constructionYear
      },
      emoji: canonicalPlace.emoji
    },
    guide: {
      placeInfo: guideOutput.placeInfo,
      audioGuideText: guideOutput.audioGuideText
    },
    audio: {
      format: audio.audio?.format || null,
      url: audio.audio?.url || null,
      generated: Boolean(audio.audio?.url)
    },
    riddle: {
      question: riddleOutput.question,
      answerOptions: riddleOutput.answerOptions || [],
      hint: riddleOutput.hint
    }
  };
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
    guideText:
      point?.baseDescription ||
      sampleResponses.fallback.guideText,
    audio: {
      format: "mp3",
      url: `/mock-audio/${pointId}.mp3`
    },
    riddle: point ? buildRiddleFromPoint(point) : sampleResponses.fallback.riddle,
    nextPointId: point?.nextPointId ?? sampleResponses.fallback.nextPointId,
    routeStatus: point?.nextPointId ? "in_progress" : "completed"
  };
}

function getExpectedPointId(payload) {
  return (
    payload.mockPointId ||
    payload.expectedPointId ||
    payload.currentPointId ||
    getRoute().startPointId
  );
}

function resolvePointFromVision(vision, expectedPointId) {
  const expectedPoint = getPointById(expectedPointId);

  if (!env.googleCloudUseRealApis) {
    return expectedPoint;
  }

  const candidates = [
    vision.detectedPlace,
    ...(vision.labels || []),
    vision.ocrText,
    vision.summary
  ]
    .filter(Boolean)
    .map(normalizeText);

  for (const point of getPoints()) {
    const aliases = [
      point.name,
      point.slug.replace(/-/g, " "),
      ...(point.visionAliases || [])
    ].map(normalizeText);

    const isMatch = aliases.some((alias) =>
      candidates.some((candidate) => candidate.includes(alias) || alias.includes(candidate))
    );

    if (isMatch) {
      return point;
    }
  }

  return expectedPoint;
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
      matchedPointId: fallback.pointId,
      detectedPlace: fallback.detectedPlace,
      confidence: fallback.confidence,
      usedFallback: true,
      visionLabels: ["fallback", fallback.detectedPlace],
      visionOcr: "",
      visionSummary: "Analisis en fallback demo por baja estabilidad o forzado manual.",
      vision: {
        detectedPlace: fallback.detectedPlace,
        confidence: fallback.confidence,
        labels: ["fallback", fallback.detectedPlace],
        ocrText: "",
        summary: "Analisis en fallback demo por baja estabilidad o forzado manual."
      }
    };
  }

  let vision = summarizeVisionForPoint(point);

  if (env.googleCloudUseRealApis) {
    vision = await analyzeImageWithVision(file.buffer);
  }

  const resolvedPoint = resolvePointFromVision(vision, point.id);

  return {
    requestId: randomRequestId("analyze"),
    pointId: resolvedPoint.id,
    matchedPointId: resolvedPoint.id,
    detectedPlace: vision.detectedPlace || resolvedPoint.name,
    confidence: vision.confidence,
    usedFallback: false,
    visionLabels: vision.labels,
    visionOcr: vision.ocrText,
    visionSummary: vision.summary,
    vision: {
      detectedPlace: vision.detectedPlace || resolvedPoint.name,
      confidence: vision.confidence,
      labels: vision.labels,
      ocrText: vision.ocrText,
      summary: vision.summary
    }
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

  const canonicalPlace = getCanonicalPlace(point.id);
  const answerOptions = buildAnswerOptions(point);
  const promptInputs =
    payload.promptInputs ||
    buildPromptInputsForPoint({
      point,
      canonicalPlace,
      answerOptions,
      visionContext: payload.visionContext
    });

  if (payload.usedFallback && env.demoUseStaticFallbacks) {
    const fallback = getProcessPhotoFallback(point.id);

    return {
      pointId: fallback.pointId,
      canonicalPlace,
      promptInputs,
      promptOutputs: {
        guide: {
          placeInfo: fallback.guideText,
          audioGuideText: fallback.guideText
        },
        riddle: {
          ...fallback.riddle,
          correctAnswer: point.correctAnswer
        }
      },
      guideText: fallback.guideText,
      riddle: fallback.riddle,
      nextPointId: fallback.nextPointId,
      routeStatus: fallback.routeStatus,
      usedFallback: true
    };
  }

  try {
    const guide = await generateGuidePackageFromPoint(
      point,
      canonicalPlace,
      payload.visionContext,
      promptInputs
    );
    const riddle = await generateRiddleFromPoint(
      point,
      answerOptions,
      payload.visionContext,
      promptInputs
    );

    return {
      pointId: point.id,
      canonicalPlace,
      promptInputs,
      promptOutputs: {
        guide,
        riddle
      },
      guideText: guide.placeInfo,
      riddle: {
        question: riddle.question,
        answerOptions: riddle.answerOptions,
        hint: riddle.hint
      },
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
      canonicalPlace,
      promptInputs,
      promptOutputs: {
        guide: {
          placeInfo: fallback.guideText,
          audioGuideText: fallback.guideText
        },
        riddle: {
          ...fallback.riddle,
          correctAnswer: point.correctAnswer
        }
      },
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
    const fallback = getProcessPhotoFallback(point.id);

    return {
      pointId: payload.pointId,
      audio: fallback.audio,
      usedFallback: true
    };
  }

  try {
    return {
      pointId: point.id,
      audio: await generateAudioFromText(point.id, payload.guideText),
      usedFallback: false
    };
  } catch (error) {
    if (!env.demoUseStaticFallbacks) {
      throw error;
    }

    const fallback = getProcessPhotoFallback(point.id);

    return {
      pointId: point.id,
      audio: fallback.audio,
      usedFallback: true,
      audioError: {
        code: error.code || "TTS_FALLBACK",
        message: error.message
      }
    };
  }
}

async function processPhotoDetailed({ file, body }) {
  const analysis = await analyzeImage({ file, body });
  const point = getPointById(analysis.pointId);
  const canonicalPlace = getCanonicalPlace(point.id);
  const promptInputs = buildPromptInputsForPoint({
    point,
    canonicalPlace,
    answerOptions: buildAnswerOptions(point),
    visionContext: analysis.vision
  });
  const guide = await generateGuide({
    pointId: analysis.pointId,
    usedFallback: analysis.usedFallback,
    visionContext: analysis.vision,
    promptInputs
  });
  const audio = await generateAudio({
    pointId: guide.pointId,
    usedFallback: guide.usedFallback,
    guideText: guide.promptOutputs.guide.audioGuideText
  });

  const finalProcessPhoto = {
    requestId: analysis.requestId,
    pointId: guide.pointId,
    detectedPlace: analysis.detectedPlace,
    confidence: analysis.confidence,
    usedFallback: analysis.usedFallback || guide.usedFallback || audio.usedFallback,
    guideText: guide.guideText,
    audio: audio.audio,
    riddle: guide.riddle,
    nextPointId: guide.nextPointId,
    routeStatus: guide.routeStatus
  };

  const finalResult = buildFinalResult({
    canonicalPlace,
    promptOutputs: guide.promptOutputs,
    audio: audio.audio
  });
  const frontendResponse = buildFrontendProcessPhotoResponse({
    analysis,
    guide,
    audio,
    canonicalPlace
  });

  return {
    requestId: analysis.requestId,
    matchedPointId: analysis.matchedPointId,
    usedFallback: finalProcessPhoto.usedFallback,
    vision: analysis.vision,
    canonicalPlace,
    promptInputs: {
      guideTemplateFile: promptInputs.guideTemplateFile,
      riddleTemplateFile: promptInputs.riddleTemplateFile,
      variables: promptInputs.variables
    },
    promptOutputs: guide.promptOutputs,
    audio: audio.audio,
    frontendResponse,
    finalResult,
    finalProcessPhoto,
    generationError: guide.generationError,
    audioError: audio.audioError
  };
}

async function processPhoto({ file, body }) {
  const result = await processPhotoDetailed({ file, body });
  return result.frontendResponse;
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
  processPhotoDetailed,
  validateAnswer
};

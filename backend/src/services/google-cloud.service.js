const env = require("../config/env");
const { getPointById } = require("./data-service");
const { renderPromptTemplate } = require("./prompt-service");

const GUIDE_PROMPT_FILE = "guide-generation.md";
const RIDDLE_PROMPT_FILE = "riddle-generation.md";

const GUIDE_RESPONSE_SCHEMA = {
  type: "OBJECT",
  required: ["placeInfo", "audioGuideText"],
  properties: {
    placeInfo: {
      type: "STRING"
    },
    audioGuideText: {
      type: "STRING"
    }
  }
};

const RIDDLE_RESPONSE_SCHEMA = {
  type: "OBJECT",
  required: ["question", "answerOptions", "correctAnswer", "hint"],
  properties: {
    question: {
      type: "STRING"
    },
    answerOptions: {
      type: "ARRAY",
      items: {
        type: "STRING"
      }
    },
    correctAnswer: {
      type: "STRING"
    },
    hint: {
      type: "STRING"
    }
  }
};

let visionClient;
let textToSpeechClient;
let generativeModel;

function ensureConfigured() {
  if (!env.googleCloudProjectId || !env.googleCloudRegion) {
    throw new Error(
      "Faltan GOOGLE_CLOUD_PROJECT_ID o GOOGLE_CLOUD_REGION para usar Google Cloud real."
    );
  }
}

function getVisionClient() {
  if (!visionClient) {
    const vision = require("@google-cloud/vision");
    visionClient = new vision.ImageAnnotatorClient();
  }

  return visionClient;
}

function getTextToSpeechClient() {
  if (!textToSpeechClient) {
    const textToSpeech = require("@google-cloud/text-to-speech");
    textToSpeechClient = new textToSpeech.TextToSpeechClient();
  }

  return textToSpeechClient;
}

function getGenerativeModel() {
  if (!generativeModel) {
    const { VertexAI } = require("@google-cloud/vertexai");
    const vertexAI = new VertexAI({
      project: env.googleCloudProjectId,
      location: env.googleCloudRegion
    });

    generativeModel = vertexAI.getGenerativeModel({
      model: env.vertexModel
    });
  }

  return generativeModel;
}

function summarizeVisionForPoint(point) {
  return {
    detectedPlace: point.name,
    confidence: 0.93,
    labels: [point.name, point.city, "Gaudi"],
    ocrText: "",
    summary: `Posible coincidencia con ${point.name} en ${point.city}, ${point.country}.`
  };
}

async function analyzeImageWithVision(buffer) {
  ensureConfigured();

  const client = getVisionClient();
  const [result] = await client.annotateImage({
    image: {
      content: buffer
    },
    features: [
      { type: "LANDMARK_DETECTION", maxResults: 3 },
      { type: "LABEL_DETECTION", maxResults: 5 },
      { type: "TEXT_DETECTION", maxResults: 3 }
    ]
  });

  const landmark = result.landmarkAnnotations?.[0];
  const labels = (result.labelAnnotations || []).slice(0, 5).map((item) => item.description);
  const ocrText = (result.textAnnotations?.[0]?.description || "")
    .split("\n")
    .slice(0, 2)
    .join(" ");

  return {
    detectedPlace: landmark?.description || labels[0] || "",
    confidence: landmark?.score || result.labelAnnotations?.[0]?.score || 0,
    labels,
    ocrText,
    summary: [
      landmark?.description ? `Landmark principal: ${landmark.description}.` : "",
      labels.length ? `Labels: ${labels.join(", ")}.` : "",
      ocrText ? `OCR: ${ocrText}.` : ""
    ]
      .filter(Boolean)
      .join(" ")
  };
}

function extractTextFromVertexResponse(response) {
  const candidate = response?.candidates?.[0];
  const parts = candidate?.content?.parts || [];

  return parts
    .map((part) => part.text || "")
    .join("")
    .trim();
}

function extractJsonObject(text) {
  const trimmed = String(text || "").trim();

  if (!trimmed) {
    return "";
  }

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);

  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

function buildPromptInputsForPoint({ point, canonicalPlace, answerOptions, visionContext = {} }) {
  const nextPointName = point.nextPointId ? getPointById(point.nextPointId)?.name || "" : "";
  const variables = {
    locale: env.demoRouteLocale,
    point_name: point.name,
    city: canonicalPlace.city,
    country: canonicalPlace.country,
    construction_year: canonicalPlace.constructionYear,
    emoji: canonicalPlace.emoji,
    base_description: point.baseDescription,
    correct_answer: point.correctAnswer,
    next_point_name: nextPointName,
    vision_summary: visionContext.summary || "",
    vision_labels: (visionContext.labels || []).join(", "),
    vision_ocr: visionContext.ocrText || "",
    answer_options: answerOptions.join(" | ")
  };

  return {
    guideTemplateFile: GUIDE_PROMPT_FILE,
    riddleTemplateFile: RIDDLE_PROMPT_FILE,
    variables,
    guidePrompt: renderPromptTemplate(GUIDE_PROMPT_FILE, variables),
    riddlePrompt: renderPromptTemplate(RIDDLE_PROMPT_FILE, variables)
  };
}

async function generateStructuredContent(prompt, schema, generationConfig) {
  ensureConfigured();

  const model = getGenerativeModel();
  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
      thinkingConfig: {
        thinkingBudget: 0
      },
      ...generationConfig
    }
  });

  const text = extractTextFromVertexResponse(result.response);

  if (!text) {
    throw new Error("Vertex AI devolvio una respuesta vacia.");
  }

  const jsonText = extractJsonObject(text);

  try {
    return JSON.parse(jsonText);
  } catch (error) {
    const parseError = new Error("Vertex AI devolvio un JSON no parseable.");
    parseError.code = "VERTEX_JSON_PARSE_ERROR";
    parseError.details = {
      rawText: text.slice(0, 1000),
      jsonText: jsonText.slice(0, 1000)
    };
    throw parseError;
  }
}

function buildMockGuidePackage(point, canonicalPlace) {
  const placeInfo = `${canonicalPlace.name}, en ${canonicalPlace.city}, ${canonicalPlace.country}, iniciada en ${canonicalPlace.constructionYear}, resume muy bien la ruta de Gaudi. Su presencia visual, su valor simbolico y el tono accesible de esta parada ayudan a situar al usuario antes del enigma. Es un punto ideal para empezar o continuar la experiencia con contexto claro, ritmo estable y ganas de seguir explorando Barcelona.`;

  return {
    placeInfo,
    audioGuideText: placeInfo
  };
}

async function generateGuidePackageFromPoint(point, canonicalPlace, visionContext = {}, promptInputs) {
  if (!env.googleCloudUseRealApis) {
    return buildMockGuidePackage(point, canonicalPlace);
  }

  const inputs =
    promptInputs ||
    buildPromptInputsForPoint({
      point,
      canonicalPlace,
      answerOptions: point.answerOptions,
      visionContext
    });

  const parsed = await generateStructuredContent(inputs.guidePrompt, GUIDE_RESPONSE_SCHEMA, {
    temperature: 0.2,
    maxOutputTokens: 420
  });

  if (
    !parsed ||
    typeof parsed.placeInfo !== "string" ||
    typeof parsed.audioGuideText !== "string" ||
    !parsed.placeInfo.trim() ||
    !parsed.audioGuideText.trim()
  ) {
    const error = new Error("Vertex AI devolvio una audioguia con contrato invalido.");
    error.code = "VERTEX_GUIDE_CONTRACT_ERROR";
    throw error;
  }

  return {
    placeInfo: parsed.placeInfo.trim(),
    audioGuideText: parsed.audioGuideText.trim()
  };
}

async function generateRiddleFromPoint(point, allowedOptions, visionContext = {}, promptInputs) {
  if (!env.googleCloudUseRealApis) {
    return {
      question: point.expectedRiddle,
      answerOptions: allowedOptions,
      correctAnswer: point.correctAnswer,
      hint: `Pista breve sobre ${point.name}.`
    };
  }

  const inputs =
    promptInputs ||
    buildPromptInputsForPoint({
      point,
      canonicalPlace: {
        city: point.city,
        country: point.country,
        constructionYear: point.constructionYear,
        emoji: point.emoji
      },
      answerOptions: allowedOptions,
      visionContext
    });

  const parsed = await generateStructuredContent(inputs.riddlePrompt, RIDDLE_RESPONSE_SCHEMA, {
    temperature: 0.1,
    maxOutputTokens: 260
  });

  const allowedOptionSet = new Set(allowedOptions);

  if (
    !parsed ||
    typeof parsed.question !== "string" ||
    !Array.isArray(parsed.answerOptions) ||
    parsed.answerOptions.length !== allowedOptions.length ||
    typeof parsed.correctAnswer !== "string" ||
    typeof parsed.hint !== "string"
  ) {
    const contractError = new Error("Vertex AI devolvio un enigma con contrato invalido.");
    contractError.code = "VERTEX_RIDDLE_CONTRACT_ERROR";
    throw contractError;
  }

  if (parsed.correctAnswer !== point.correctAnswer) {
    const answerError = new Error("Vertex AI cambio la respuesta correcta esperada.");
    answerError.code = "VERTEX_RIDDLE_ANSWER_ERROR";
    throw answerError;
  }

  for (const option of parsed.answerOptions) {
    if (!allowedOptionSet.has(option)) {
      const optionsError = new Error("Vertex AI devolvio opciones fuera del contrato permitido.");
      optionsError.code = "VERTEX_RIDDLE_OPTIONS_ERROR";
      throw optionsError;
    }
  }

  return {
    question: parsed.question.trim(),
    answerOptions: parsed.answerOptions,
    correctAnswer: parsed.correctAnswer,
    hint: parsed.hint.trim()
  };
}

async function generateAudioFromText(pointId, guideText) {
  if (!env.googleCloudUseRealApis) {
    return {
      format: "mp3",
      url: `/mock-audio/${pointId}.mp3`
    };
  }

  ensureConfigured();

  const client = getTextToSpeechClient();
  const [response] = await client.synthesizeSpeech({
    input: {
      text: guideText
    },
    voice: {
      languageCode: env.demoRouteLocale,
      name: env.ttsVoiceName
    },
    audioConfig: {
      audioEncoding: "MP3"
    }
  });

  if (!response.audioContent) {
    throw new Error("Text-to-Speech devolvio audio vacio.");
  }

  return {
    format: "mp3",
    url: `data:audio/mp3;base64,${response.audioContent.toString("base64")}`
  };
}

module.exports = {
  summarizeVisionForPoint,
  analyzeImageWithVision,
  buildPromptInputsForPoint,
  generateGuidePackageFromPoint,
  generateRiddleFromPoint,
  generateAudioFromText
};

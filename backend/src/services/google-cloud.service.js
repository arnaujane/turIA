const env = require("../config/env");

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
    labels: [point.name, "Barcelona", "Gaudi"],
    ocrText: "",
    summary: `Posible coincidencia con ${point.name} dentro de la ruta demo de Barcelona.`
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
  const ocrText = (result.textAnnotations?.[0]?.description || "").split("\n").slice(0, 2).join(" ");

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

async function generateGuideFromPoint(point, visionContext = {}) {
  if (!env.googleCloudUseRealApis) {
    return point.baseDescription;
  }

  ensureConfigured();

  const model = getGenerativeModel();
  const prompt = [
    "Eres un asistente de una demo academica de turismo.",
    "Devuelve solo texto plano en espanol, entre 55 y 85 palabras.",
    "No uses markdown.",
    `Lugar: ${point.name}`,
    `Descripcion base: ${point.baseDescription}`,
    `Respuesta correcta asociada al punto: ${point.correctAnswer}`,
    `Resumen Vision: ${visionContext.summary || ""}`,
    `Labels Vision: ${(visionContext.labels || []).join(", ")}`,
    `OCR Vision: ${visionContext.ocrText || ""}`
  ].join("\n");

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 220
    }
  });

  const text = extractTextFromVertexResponse(result.response);

  if (!text) {
    throw new Error("Vertex AI devolvio una audioguia vacia.");
  }

  return text;
}

async function generateRiddleFromPoint(point, options, visionContext = {}) {
  if (!env.googleCloudUseRealApis) {
    return {
      question: point.expectedRiddle,
      answerOptions: options,
      hint: `Pista breve sobre ${point.name}.`
    };
  }

  ensureConfigured();

  const model = getGenerativeModel();
  const prompt = [
    "Genera un enigma para una demo academica de turismo.",
    "Devuelve solo JSON valido sin markdown ni texto extra.",
    'Formato exacto: {"question":"...","answerOptions":["...","...","..."],"correctAnswer":"...","hint":"..."}',
    "Idioma: es-ES.",
    `Lugar: ${point.name}`,
    `Descripcion base: ${point.baseDescription}`,
    `Respuesta correcta obligatoria: ${point.correctAnswer}`,
    `Opciones permitidas y exactas: ${options.join(" | ")}`,
    `Resumen Vision: ${visionContext.summary || ""}`
  ].join("\n");

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 220
    }
  });

  const text = extractTextFromVertexResponse(result.response);
  const jsonText = extractJsonObject(text);
  let parsed;

  try {
    parsed = JSON.parse(jsonText);
  } catch (error) {
    const parseError = new Error("Vertex AI devolvio un enigma no parseable.");
    parseError.code = "VERTEX_RIDDLE_PARSE_ERROR";
    parseError.details = {
      rawText: text.slice(0, 500),
      jsonText: jsonText.slice(0, 500)
    };
    throw parseError;
  }

  if (
    !parsed ||
    typeof parsed.question !== "string" ||
    !Array.isArray(parsed.answerOptions) ||
    parsed.answerOptions.length !== 3 ||
    typeof parsed.hint !== "string"
  ) {
    const contractError = new Error("Vertex AI devolvio un enigma con contrato invalido.");
    contractError.code = "VERTEX_RIDDLE_CONTRACT_ERROR";
    contractError.details = {
      rawText: text.slice(0, 500)
    };
    throw contractError;
  }

  return {
    question: parsed.question,
    answerOptions: parsed.answerOptions,
    hint: parsed.hint
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
  generateGuideFromPoint,
  generateRiddleFromPoint,
  generateAudioFromText
};

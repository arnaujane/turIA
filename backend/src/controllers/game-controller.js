const multer = require("multer");

const {
  analyzeImage,
  generateGuide,
  generateAudio,
  processPhoto,
  validateAnswer
} = require("../services/game-service");
const { applyCorrectAnswer } = require("../services/progress-service");
const { getPointById } = require("../services/data-service");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024
  }
});

const imageUploadMiddleware = upload.single("image");

function healthController(_req, res) {
  res.json({
    ok: true,
    service: "backend",
    timestamp: new Date().toISOString()
  });
}

async function analyzeImageController(req, res, next) {
  try {
    res.json(await analyzeImage({ file: req.file, body: req.body }));
  } catch (error) {
    next(error);
  }
}

async function generateGuideController(req, res, next) {
  try {
    res.json(await generateGuide(req.body));
  } catch (error) {
    next(error);
  }
}

async function generateAudioController(req, res, next) {
  try {
    res.json(await generateAudio(req.body));
  } catch (error) {
    next(error);
  }
}

async function processPhotoController(req, res, next) {
  try {
    res.json(await processPhoto({ file: req.file, body: req.body }));
  } catch (error) {
    next(error);
  }
}

function checkAnswerController(req, res, next) {
  try {
    const { userId, pointId, answer } = req.body;

    if (!pointId || !answer) {
      return res.status(400).json({
        code: "INVALID_REQUEST",
        message: "Los campos pointId y answer son obligatorios."
      });
    }

    const point = getPointById(pointId);
    const isCorrect = validateAnswer(pointId, answer);

    if (!isCorrect) {
      return res.json({
        pointId,
        submittedAnswer: answer,
        isCorrect: false,
        awardedScore: 0,
        unlockedPointId: null,
        routeStatus: "in_progress",
        feedback: "Respuesta incorrecta. Puedes volver a intentarlo o pedir una pista."
      });
    }

    const result = applyCorrectAnswer(userId, pointId);

    return res.json({
      pointId,
      submittedAnswer: answer,
      isCorrect: true,
      awardedScore: result.awardedScore,
      unlockedPointId: result.unlockedPointId,
      routeStatus: result.progress.routeStatus,
      feedback: point.nextPointId
        ? "Respuesta correcta. El siguiente punto queda desbloqueado."
        : "Ruta completada. Se aplica la puntuacion final de cierre."
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  imageUploadMiddleware,
  healthController,
  analyzeImageController,
  generateGuideController,
  generateAudioController,
  processPhotoController,
  checkAnswerController
};

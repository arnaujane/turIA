const express = require("express");

const {
  imageUploadMiddleware,
  healthController,
  analyzeImageController,
  generateGuideController,
  generateAudioController,
  processPhotoController,
  processPhotoDebugController,
  checkAnswerController
} = require("../controllers/game-controller");
const { getRouteController } = require("../controllers/route-controller");
const {
  getProgressController,
  saveProgressController
} = require("../controllers/progress-controller");

const router = express.Router();

router.get("/health", healthController);
router.get("/route", getRouteController);
router.post("/analyze-image", imageUploadMiddleware, analyzeImageController);
router.post("/generate-guide", generateGuideController);
router.post("/generate-audio", generateAudioController);
router.post("/process-photo", imageUploadMiddleware, processPhotoController);
router.post("/process-photo-debug", imageUploadMiddleware, processPhotoDebugController);
router.post("/check-answer", checkAnswerController);
router.get("/progress/:userId", getProgressController);
router.post("/progress", saveProgressController);

module.exports = router;

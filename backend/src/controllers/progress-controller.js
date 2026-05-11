const { getProgress, saveProgress } = require("../services/progress-service");

function getProgressController(req, res) {
  res.json(getProgress(req.params.userId));
}

function saveProgressController(req, res) {
  const {
    userId,
    currentPointId,
    score,
    completedChallenges,
    unlockedPoints,
    routeStatus
  } = req.body;

  if (!userId) {
    return res.status(400).json({
      code: "USER_ID_REQUIRED",
      message: "El campo userId es obligatorio."
    });
  }

  const progress = saveProgress({
    userId,
    currentPointId,
    score,
    completedChallenges,
    unlockedPoints,
    routeStatus
  });

  return res.json(progress);
}

module.exports = {
  getProgressController,
  saveProgressController
};

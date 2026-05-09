const {
  getProgressTemplate,
  getRoute,
  getPointById
} = require("./data-service");
const env = require("../config/env");

const progressStore = new Map();

function clone(value) {
  return structuredClone(value);
}

function ensureUserProgress(userId) {
  const normalizedUserId = userId || getProgressTemplate().userId;

  if (!progressStore.has(normalizedUserId)) {
    const baseProgress = getProgressTemplate();
    baseProgress.userId = normalizedUserId;
    progressStore.set(normalizedUserId, baseProgress);
  }

  return progressStore.get(normalizedUserId);
}

function getProgress(userId) {
  return clone(ensureUserProgress(userId));
}

function saveProgress(payload) {
  const current = ensureUserProgress(payload.userId);
  const sanitizedPayload = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  );
  const nextValue = {
    ...current,
    ...sanitizedPayload
  };

  progressStore.set(nextValue.userId, nextValue);
  return clone(nextValue);
}

function applyCorrectAnswer(userId, pointId) {
  const route = getRoute();
  const point = getPointById(pointId);
  const progress = ensureUserProgress(userId);

  if (!point) {
    return clone(progress);
  }

  const completedChallenges = Array.from(new Set([...progress.completedChallenges, pointId]));
  const unlockedPoints = new Set(progress.unlockedPoints);
  unlockedPoints.add(pointId);

  let routeStatus = "in_progress";
  let currentPointId = point.nextPointId;
  let awardedScore = route.scoringRules.correctAnswer;
  let unlockedPointId = point.nextPointId;

  if (point.nextPointId) {
    unlockedPoints.add(point.nextPointId);
  } else {
    routeStatus = "completed";
    currentPointId = pointId;
    unlockedPointId = null;
    awardedScore += route.scoringRules.routeCompletionBonus;
  }

  const nextProgress = {
    ...progress,
    currentPointId,
    completedChallenges,
    unlockedPoints: Array.from(unlockedPoints),
    routeStatus,
    score: progress.score + awardedScore
  };

  progressStore.set(nextProgress.userId, nextProgress);

  return {
    awardedScore,
    unlockedPointId,
    progress: clone(nextProgress)
  };
}

if (env.demoEnableMockProgress) {
  ensureUserProgress();
}

module.exports = {
  getProgress,
  saveProgress,
  applyCorrectAnswer
};

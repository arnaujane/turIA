const fs = require("fs");
const path = require("path");

const { demoDataDir } = require("../config/paths");

function readJsonFile(filename) {
  const filePath = path.join(demoDataDir, filename);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const route = readJsonFile("route.demo.json");
const points = readJsonFile("points.demo.json");
const sampleResponses = readJsonFile("sample-responses.json");
const progressTemplate = readJsonFile("progress.demo.json");

const pointsById = new Map(points.map((point) => [point.id, point]));
const pointIdsBySlug = new Map(points.map((point) => [point.slug, point.id]));

function buildCanonicalPlace(point) {
  if (!point) {
    return null;
  }

  return {
    name: point.name,
    city: point.city,
    country: point.country,
    constructionYear: point.constructionYear,
    emoji: point.emoji
  };
}

function getRoute() {
  return route;
}

function getPoints() {
  return points;
}

function getPointById(pointId) {
  return pointsById.get(pointId) || null;
}

function getPointBySlug(slug) {
  const pointId = pointIdsBySlug.get(slug);
  return pointId ? getPointById(pointId) : null;
}

function getCanonicalPlace(pointId) {
  return buildCanonicalPlace(getPointById(pointId));
}

function getSampleResponses() {
  return sampleResponses;
}

function getProgressTemplate() {
  return structuredClone(progressTemplate);
}

module.exports = {
  getRoute,
  getPoints,
  getPointById,
  getPointBySlug,
  getCanonicalPlace,
  getSampleResponses,
  getProgressTemplate
};

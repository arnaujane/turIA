const fs = require("fs");
const path = require("path");

const { docsPromptsDir } = require("../config/paths");

const promptCache = new Map();

function extractPromptTemplate(markdown, filename) {
  const match =
    markdown.match(/```text\s*([\s\S]*?)\s*```/i) ||
    markdown.match(/```[\w-]*\s*([\s\S]*?)\s*```/);

  if (!match?.[1]) {
    throw new Error(`No se encontro una plantilla de prompt valida en ${filename}.`);
  }

  return match[1].trim();
}

function loadPromptTemplate(filename) {
  if (!promptCache.has(filename)) {
    const filePath = path.join(docsPromptsDir, filename);
    const markdown = fs.readFileSync(filePath, "utf8");
    promptCache.set(filename, extractPromptTemplate(markdown, filename));
  }

  return promptCache.get(filename);
}

function stringifyPromptValue(value) {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (value === undefined || value === null) {
    return "";
  }

  return String(value);
}

function renderPromptTemplate(filename, variables) {
  const template = loadPromptTemplate(filename);

  return template.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_match, key) =>
    stringifyPromptValue(variables[key])
  );
}

module.exports = {
  loadPromptTemplate,
  renderPromptTemplate
};

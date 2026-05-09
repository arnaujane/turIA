const path = require("path");

const repoRoot = path.resolve(__dirname, "..", "..", "..");

module.exports = {
  repoRoot,
  demoDataDir: path.join(repoRoot, "demo-data"),
  docsPromptsDir: path.join(repoRoot, "docs", "prompts")
};

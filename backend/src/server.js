const app = require("./app");
const env = require("./config/env");

app.listen(env.port, () => {
  console.log(`Mystery Tourist Lens backend escuchando en http://localhost:${env.port}`);
});

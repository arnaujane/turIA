function errorHandler(error, _req, res, _next) {
  const status = error.status || 500;

  res.status(status).json({
    code: error.code || "INTERNAL_ERROR",
    message: error.message || "Se ha producido un error inesperado."
  });
}

module.exports = {
  errorHandler
};

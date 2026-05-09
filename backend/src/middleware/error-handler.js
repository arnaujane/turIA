function errorHandler(error, _req, res, _next) {
  const status = error.status || 500;
  const response = {
    code: error.code || "INTERNAL_ERROR",
    message: error.message || "Se ha producido un error inesperado."
  };

  if (process.env.NODE_ENV !== "production" && error.details) {
    response.details = error.details;
  }

  res.status(status).json(response);
}

module.exports = {
  errorHandler
};

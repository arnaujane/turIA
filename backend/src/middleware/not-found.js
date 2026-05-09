function notFoundHandler(req, res) {
  res.status(404).json({
    code: "NOT_FOUND",
    message: `No existe la ruta ${req.method} ${req.originalUrl}`
  });
}

module.exports = {
  notFoundHandler
};

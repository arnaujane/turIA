const { getRoute, getPoints } = require("../services/data-service");

function getRouteController(_req, res) {
  res.json({
    route: getRoute(),
    points: getPoints()
  });
}

module.exports = {
  getRouteController
};

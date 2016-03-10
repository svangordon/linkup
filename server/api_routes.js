// =====START GLOBAL VAR DECLARATION=====
var //ctrls = require('./controllers.js'),
  fdCtrls = require('./controllers/fdControllers.js'),
  apiRouter = require('express').Router(),
  config = require('./config'),
  db = require('./models')
// =====END GLOBAL VAR DECLARATION
// =======================================
// apiRouter.route('/test')
//   .get(fdCtrls.footballData.test)
//
// // League Routes
// apiRouter.route('/league/fixtures')
//   .get(fdCtrls.footballData.league.fixtures)
//
// // Team Routes : get schedule, get players...
// apiRouter.route('/team/:teamCode')
//   .get(fdCtrls.footballData.team.data)
//
// apiRouter.route('/team/:teamCode/fixtures')
//   .get(fdCtrls.footballData.team.fixtures)
//
//   apiRouter.route('/team/:teamCode/players')
//     .get(fdCtrls.footballData.team.players)

module.exports = apiRouter

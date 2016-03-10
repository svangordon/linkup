// =====START GLOBAL VAR DECLARATION=====
var //ctrls = require('./controllers.js'),
  fdCtrls = require('../controllers/fdControllers.js'),
  apiRouter = require('express').Router(),
  config = require('../config'),
  db = require('../models')
// =====END GLOBAL VAR DECLARATION
// =======================================
apiRouter.route('/test')
  .get(fdCtrls.test)

// League Routes
apiRouter.route('/league/fixtures')
  .get(fdCtrls.league.fixtures)

// Team Routes : get schedule, get players...
apiRouter.route('/team/:teamCode')
  .get(fdCtrls.team.data)

apiRouter.route('/team/:teamCode/fixtures')
  .get(fdCtrls.team.fixtures)

apiRouter.route('/team/:teamCode/players')
    .get(fdCtrls.team.players)

module.exports = apiRouter

// =====START GLOBAL VAR DECLARATION=====
var //ctrls = require('./controllers.js'),
  fdCtrls = require('../controllers/fdControllers.js'),
  fdRouter = require('express').Router(),
  config = require('../config'),
  db = require('../models')
// =====END GLOBAL VAR DECLARATION
// =======================================
fdRouter.route('/test')
  .get(fdCtrls.test)

// League Routes
fdRouter.route('/league/schedule')
  .get(fdCtrls.league.fixtures)

// Team Routes : get schedule, get players...
fdRouter.route('/team/:teamCode')
  .get(fdCtrls.team.data)

fdRouter.route('/team/schedule/:teamCode')
  .get(fdCtrls.team.fixtures)

fdRouter.route('/team/players/:teamCode')
  .get(fdCtrls.team.players)

fdRouter.route('/teams')
  .get(fdCtrls.team.all)

fdRouter.route('/table')
  .get(fdCtrls.table.data)

module.exports = fdRouter

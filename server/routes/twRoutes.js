// =====START GLOBAL VAR DECLARATION=====
var twCtrls = require('../controllers/twControllers.js'),
  apiRouter = require('express').Router(),
  config = require('../config'),
  db = require('../models')
// =====END GLOBAL VAR DECLARATION
// =======================================

apiRouter.route('/test')
  .get(twCtrls.test)

apiRouter.route('/getOne/:id')
  .get(twCtrls.getOne)

apiRouter.route('/search/:team')
  .get(twCtrls.search)

module.exports = apiRouter

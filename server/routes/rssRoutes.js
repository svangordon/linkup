// =====START GLOBAL VAR DECLARATION=====
var rssCtrls = require('../controllers/rssControllers.js'),
  apiRouter = require('express').Router(),
  config = require('../config'),
  db = require('../models'),
// =====END GLOBAL VAR DECLARATION
// =======================================



apiRouter.route('/test')
  .get(twCtrls.test)

module.exports = apiRouter

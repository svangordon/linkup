// =====START GLOBAL VAR DECLARATION=====
var meCtrls = require('../controllers/meControllers.js');
  var meRouter = require('express').Router();
  var config = require('../config');
  var db = require('../models');
// =====END GLOBAL VAR DECLARATION
// =======================================

meRouter.route('/')
  .get(meCtrls.get)

module.exports = meRouter

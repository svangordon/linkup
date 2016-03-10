// =====START GLOBAL VAR DECLARATION=====
var authCtrls = require('../controllers/authControllers.js');
  var authRouter = require('express').Router();
  var config = require('../config');
  var db = require('../models');
// =====END GLOBAL VAR DECLARATION
// =======================================

authRouter.route('/')
  .post(authCtrls.authenticate)

module.exports = authRouter

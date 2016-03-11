// =====START GLOBAL VAR DECLARATION=====
var rssCtrls = require('../controllers/rssControllers.js'),
  rssRouter = require('express').Router(),
  config = require('../config'),
  db = require('../models');
// =====END GLOBAL VAR DECLARATION
// =======================================



rssRouter.route('/test')
  .get(function(req, res) {res.send('test')})

rssRouter.route('/team/:teamName')
  .get(rssCtrls.team)

module.exports = rssRouter

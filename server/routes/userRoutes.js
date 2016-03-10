// =====START GLOBAL VAR DECLARATION=====
var userCtrls = require('../controllers/userControllers.js');
  var userRouter = require('express').Router();
  var config = require('../config');
  var db = require('../models');
// =====END GLOBAL VAR DECLARATION
// =======================================


// userRouter.route('/authenticate')
//   .post(userCtrls.authenticate)

userRouter.use(function(req, res, next) {
  console.log('middleware in use')
  next()
})

userRouter.route('/')
  .post(userCtrls.create)
  .get(userCtrls.all)

userRouter.route('/:userId')
  .get(userCtrls.get)
  .put(userCtrls.update)
  .delete(userCtrls.delete);

module.exports = userRouter

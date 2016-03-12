var db = require('../models'),
  config = require('../config'),
  jwt = require('jsonwebtoken');

module.exports = {
  get: function (req, res) {
    console.log('=========== me/get route hit ===============')
    console.log('req.decoded', req.decoded);
    db.User.findById(req.decoded._id, function (err, me) {
      if (err) console.error(err);
      res.send(me)
    })
    // res.send(req.decoded)
  }
}

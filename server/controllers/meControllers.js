var db = require('../models'),
  config = require('../config');

module.exports = {
  get: function (req, res) {
    console.log('me/get route hit')
    res.send(req.decoded)
  }
}

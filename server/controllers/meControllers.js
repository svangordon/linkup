var db = require('../models'),
  config = require('../config');

module.exports = {
  get: function (req, res) {
    res.send(req.decoded)
  }
}

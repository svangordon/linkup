
var db = require('../models'),
  config = require('../config'),
  request = require('request'),
  moment = require('moment'),
  feedUrls = require('../data/rssfeeds.json'),
  ballboy = require('../services/ballboy.js');

module.exports = {
  team : function (req, res) {
    var feed = feedUrls[req.params.teamName];
    var out = ballboy(feed, res);
    // console.log(feed)
    // res.send(out)
  }
}

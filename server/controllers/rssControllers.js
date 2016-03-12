
var db = require('../models'),
  config = require('../config'),
  request = require('request'),
  moment = require('moment'),
  feedUrls = require('../data/rssfeeds.json'),
  fetchRss = require('../services/ballboy.js')
  util = require('util')
  ;

module.exports = {
  team : function (req, res) {
    console.log('rssControllers req ========== ')
    console.log(req.params);
    var feed = feedUrls[req.params.teamName];
    // remember, ballboy contains the res.send (not for any good reason)
    fetchRss(feed, res);
  }
}

var db = require('../models'),
  config = require('../config'),
  request = require('request'),
  moment = require('moment'),
  Twitter = require('twitter');

// No idea how to get the twitter login etc

var client = new Twitter({
  consumer_key: config.TWITTER_CONSUMER_KEY,
  consumer_secret: config.TWITTER_CONSUMER_SECRET,
  access_token_key: config.TWITTER_ACCESS_KEY,
  access_token_secret: config.TWITTER_ACCESS_SECRET
});

var params = {url: 'https%3A%2F%2Ftwitter.com%Interior%2Fstatus%2F507185938620219395',
  id: 99530515043983360
};

module.exports = {
  test : function (req, res) {
    client.get('statuses/oembed', params,function(err, tweets, response) {
      if (err) console.error(err)
      else res.send(tweets)
    })
  }
}

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

var params = {
  id: 99530515043983360
};

// client.get('search/tweets', {q: 'node.js'}, function(error, tweets, response){
//    console.log(tweets);
// });

url: https://twitter.com/sean_cummings/status/250075927172759552

module.exports = {

  getOne : function (req, res) {
    console.log('getone id', req.params)
    var tpar = {
      // id : 709811083762991100
      // url : 'https%3A%2F%2Ftwitter.com%holmesdaleUSA%2Fstatus%2F709811083762991100'
    }

    client.get('statuses/oembed', req.params, function(err, tweets, response) {
      if (err) console.error('getone error',err)
      else res.send(tweets)
    })
  },

  search : function (req, res) {
    var team = req.params.team;
    console.log('search team ===========', team)
    // TODO: Include search params for other teams (especially before you demo)
    var searchVal = {
      'cry' : '#cpfc'
      , 'thfc' : 'tottenham'
      , 'mufc' : '#manutd'
      , 'afcb' : '#afcb'
      , 'avfc' : 'aston villa #avfc'
      , 'efc'  : 'everton efc'
      , 'watfordfc'  : '#watfordfc'
      , 'lcfc' : 'leicester city'
      , 'sun'  : '#safc'
      , 'ncfc' : '#nufc'
      , 'sfc'  : 'saintsfc'
      , 'afc'  : 'arsenal'
      , 'whu'  : 'west ham'
      , 'lfc'  : '#lfc'
      , 'wba'  : 'west brom'
      , 'mcfc' : '#mcfc'
      , 'swa'  : 'swansea City'
      , 'cfc'  : 'chelsea fc'
    }
    var searchObj = searchVal[team]

    client.get('search/tweets', {q: searchObj}, function(err, tweets, response){
      if (err) console.error(err)
      else res.send(tweets)
    })
  },

  test : function (req, res) {
    client.get('statuses/oembed', params, function(err, tweets, response) {
      if (err) console.error(err)
      else res.send(tweets)
    })
  }

}

// client.stream('statuses/filter', {track: 'javascript'}, function(stream) {
//   stream.on('data', function(tweet) {
//     console.log(tweet.text);
//   });
//
//   stream.on('error', function(error) {
//     throw error;
//   });
// });

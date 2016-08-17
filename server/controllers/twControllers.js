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
    // This is a dictionary for what terms or hashtags we want to search twitter
    // for for the various teams. Some of them kind of suck -- for some you get
    // like a thousand tweets from sketchy SE Asian betting sites and the rest
    // are calling Cesc Fabregas a cunt. So this should become like 'serve tweets'
    // and there should be a service that aggregates the tweets that we want and serves them 
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
      , 'ncfc' : '#ncfc'
      , 'sfc'  : 'saintsfc'
      , 'afc'  : 'arsenal'
      , 'whu'  : 'west ham'
      , 'lfc'  : '#lfc'
      , 'wba'  : 'west brom'
      , 'mcfc' : '#mcfc'
      , 'swa'  : 'swansea City'
      , 'cfc'  : 'chelsea fc'
      , 'nufc' : 'newcastle united'
      , 'scfc' : 'stoke city'
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

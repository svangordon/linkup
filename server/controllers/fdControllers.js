var db = require('../models'),
  config = require('../config'),
  request = require('request'),
  moment = require('moment'),
  teamCode = require('../utilities/teamCode.js')

var urlStem = 'http://api.football-data.org/v1/'
var fdHeaders = {'X-Auth-Token': config.FOOTBALL_DATA_API}
var fdCallback = function(res, err, response, body) {
  if (err) console.error(err);
  res.send(body)
}

module.exports = {
      test: function(req, res) {
        var options = {
          url: 'http://api.football-data.org/v1/fixtures?timeFrame=n1',
          headers: {
            'X-Auth-Token': config.FOOTBALL_DATA_API
          }
        }
        request(options, function(err, response, body) {
          if (err) console.error(err);
          res.send(body)
        })
      },
      // =======================
      // Begin league controller
      // =======================
      league: {
        fixtures: function(req, res) {
          var options = {
            url: 'http://api.football-data.org/v1/soccerseasons/398/fixtures',
            headers: {
              'X-Auth-Token': config.FOOTBALL_DATA_API
            }
          }
          request(options, function(err, response, body) {
            if (err) console.error(err);
            res.send(body)
          })
        }
      },
      // =======================
      // End league controller
      // =======================
      // =======================
      // Begin Team Controller
      // =======================
      team : {
        data : function (req, res) {
          var options = {
            url: urlStem + 'teams/' + teamCode(req.params.teamCode),
            headers: fdHeaders
          }
          request(options, fdCallback.bind(null, res))
        }
        , fixtures: function (req, res) {
          // console.log('req.params', req.params)
          // console.log('fd team fixtures', req.params);
          console.log('fixtures code', req.params.teamCode, teamCode(req.params.teamCode))
          var options = {
            url: urlStem + 'teams/' + teamCode(req.params.teamCode),
            headers: fdHeaders
          }
          request(options, function (err, response, body) {
            if (err) console.error(err);
            options.url = JSON.parse(body)._links.fixtures.href;
            request(options, fdCallback.bind(null, res))
          })
        }
        , players: function (req, res) {
          var options = {
            url: urlStem + 'teams/' + teamCode(req.params.teamCode),
            headers: fdHeaders
          }
          request(options, function (err, response, body) {
            if (err) console.error(err);
            options.url = JSON.parse(body)._links.players.href;
            request(options, fdCallback.bind(null, res))
          })
        }
        , all: function(req, res) {
          var options = {
            url: 'http://api.football-data.org/v1/soccerseasons/398/teams',
            headers: fdHeaders
          }
          request(options, fdCallback.bind(null, res))
        }
        , logos: function (req, res) {
          var options = {
            url: 'http://api.football-data.org/v1/soccerseasons/398/teams',
            headers: fdHeaders
          }
          request(options, function(err, response, body) {
            if (err) console.error(error);
            var out = {}
            body = JSON.parse(body)
            // console.log(body);
            body.teams.forEach(function(cur) { out[cur.name] = cur.crestUrl })
            // console.log(out)
            res.send(out)
          })
        }
      },
      // =======================
      // End team controller
      // =======================
      // =======================
      // Begin Table Controller
      // =======================
      table: {
        data: function (req, res) {
          var options = {
            url: 'http://api.football-data.org/v1/soccerseasons/398/leagueTable',
            headers: fdHeaders
          }
          request(options, function(err, response, body) {
            if (err) console.error(err);
            res.send(body)
          })
        }
      }
      // =======================
      // End Table Controller
      // =======================
}



    // $.ajax({
    //   headers: { 'X-Auth-Token': 'YOUR_TOKEN' },
    //   url: 'http://api.football-data.org/v1/fixtures?timeFrame=n1',
    //   dataType: 'json',
    //   type: 'GET',
    // }).done(function(response) {
    //   // do something with the response, e.g. isolate the id of a linked resource
    //   var regex = /.*?(\d+)$/; // the ? makes the first part non-greedy
    //   var res = regex.exec(response.fixtures[0]._links.awayTeam.href);
    //   var teamId = res[1];
    //   console.log(teamId);
    // });

var db = require('./models'),
  config = require('./config'),
  request = require('request'),
  moment = require('moment');

module.exports = {
    footballData: {
      params: {
        leagueId: 398,
        headers: {
          'X-Auth-Token': config.FOOTBALL_DATA_API
        }
      },
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
      // Being Team Controller
      // =======================
      team : {
        fixtures: function(req, res) {
          var options = {
            url: ''
          }
        }
      }
    }
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

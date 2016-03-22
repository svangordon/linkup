angular.module('dataService', ['userService'])

  .factory('Rss', function($http) {
    var rssFactory = {}

    rssFactory.teamFeed = function (team) {
      console.log('team feed', team)
      return $http.get('/api/rss/team/' + team)
    }

    return rssFactory
  })

  .factory('Schedule', function ($http) {
    var scheduleFactory = {}

    scheduleFactory.team = function(team) {
      return $http.get('/api/fd/team/schedule/' + team)
    }

    return scheduleFactory
  })

// TODO: There should be an api route that turns a shortname ('SWA')
// into a long name ('Swansea City AFC')
  .factory('Table', function ($http, User, Team) {
    var tableFactory = {}

    tableFactory.data = function () {
      return $http.get('/api/fd/table')
    }

    // I thought this would work but it doesn't?
    // $http.get('/api/fd/table')
    //   .then(function (resp) {
    //     tableFactory.table = resp.data
    //     console.log(tableFactory.table)
    //   })

// TODO: I think that this is slowing things down -- it's making everything wait on this ajax call
    function getStanding () {
      User.profile()
        .then(function (resp) {
          return Team.data(resp.data.teamPref)
        })
        .then(function (resp) {
          var teamPref = resp.data
          tableFactory.data()
            .then(function(resp) {
              var table = resp.data.standing
              // console.log(table)
              // var index = -1
              // console.log(teamPref.name, 'team name')
              for (var i = 0; i < table.length; i++) {
                // console.log(table.teamName, teamPref.name)
                if (table[i].teamName === teamPref.name){
                  tableFactory.userStanding = i
                  // console.log(tableFactory.userStanding)
                  break
                }
              }

          })
        })
    }
    getMatchday = function () {
      tableFactory.data()
        .then (function (resp) {
          tableFactory.table = resp.data
          tableFactory.matchday = resp.data.matchday
        })
    }

    getStanding()
    getMatchday()
    // console.log(tableFactory.userStanding)
    return tableFactory
  })

  .factory('Team', function ($http) {
    var teamFactory = {}

    teamFactory.all = function () {
      return $http.get('/api/fd/teams')
    }

    teamFactory.logos = function () {
      return $http.get('/api/fd/teams/logos')
    }

    teamFactory.data = function (team) {
      return $http.get('/api/fd/team/' + team)
    }

    return teamFactory
  })

angular.module('dataService', [])

  .factory('Rss', function($http) {
    var rssFactory = {}

    rssFactory.teamFeed = function (team) {
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

  .factory('Table', function ($http) {
    var tableFactory = {}

    tableFactory.data = function () {
      return $http.get('/api/fd/table')
    }

    return tableFactory
  })

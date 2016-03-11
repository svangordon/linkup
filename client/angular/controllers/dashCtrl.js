angular.module('dashCtrl', ['dataService'])

  .controller('dashController', function () {
    var vm = this;
    vm.dashFrames = [
      {
        id: 'rss',
        name: 'RSS',
        href: 'angular/views/pages/dash/rss.html'
      },
      {
        id: 'schedule',
        name: 'Schedule',
        href: 'angular/views/pages/dash/schedule.html'
      },
      {
        id: 'table',
        name: 'League Table',
        href: 'angular/views/pages/dash/table.html'
      }
    ]
      
    vm.activeFrame = 'rss';
    vm.setActive = function (frame) {
      vm.activeFrame = frame
    }
  })

  .controller('rssController', function (Rss) {
    var vm = this;

    Rss.teamFeed('afc')
      .then(function(resp) {
        console.log('teamfeed resp', resp.data)
        vm.feed = resp.data
      })
  })

  .controller('scheduleController', function (Schedule) {
    var vm = this;

    Schedule.team('afc')
      .then(function(resp) {
        console.log('team sched', resp.data)
        vm.schedule = resp.data
      })
  })

  .controller('tableController', function (Table) {
    var vm = this

    Table.data()
      .then(function(resp) {
        console.log('league table', resp.data)
        vm.table = resp.data
      })
  })

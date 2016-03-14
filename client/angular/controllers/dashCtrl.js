angular.module('dashCtrl', ['dataService','authService','userService'])

  .controller('dashController', function (Auth, User, $anchorScroll, $location, $timeout, Table, Team) {
    var vm = this;

    vm.dashFrames = [
      {
        id: 'news',
        name: 'News',
        href: 'angular/views/pages/dash/rss.html'
      },
      {
        id: 'schedule',
        name: 'Schedule',
        href: 'angular/views/pages/dash/schedule.html'
      },
      {
        id: 'table',
        name: 'Table',
        href: 'angular/views/pages/dash/table.html'
      }
    ]

    // TODO: get this out of the controller, move it to a factory so that multiple
    // controllers have access to this data
    User.profile()
      .then(function(resp) {
        vm.teamPref = resp.data
        Team.data(resp.data.teamPref)
          .then(function(resp) {
            vm.userTeam = resp.data
            var index = -1;
            // vm.table.standing.forEach(function(cur, i) {
            //   console.log(cur.teamName, vm.userTeam.name);
            //   if (cur.teamName === vm.userTeam.name)
            //     vm.tableIndex = i
            // })
          })
        // console.log('teamPref',vm.teamPref)
      })

      // TODO: This should be moved out of the controller, but no time for that now
      Table.data()
      .then(function (resp) {
        vm.table = resp.data
        // console.log('table', vm.table)
      })

      // var initTableScroll = function(){
      //   $timeout(function() {
      //     // $location.hash('row'+Table.userStanding)
      //     // $anchorScroll()
      //     // console.log(Table.userStanding)
      //   }, 1000)
      // }

      // console.log(Table.userStanding)

    vm.activeFrame = vm.activeFrame || 'news';
    vm.setActive = function (frame) {
      vm.activeFrame = frame
      // console.log(frame)
      // TODO: make this fire as part of the ng-enter (or whatever) for the other ctrls
      //  or their elements... okay, so like, it needs both anchor scrolls? not clear why
      // DONE: I think i've gotten it figured out -- it needs to look like this. Good.
      // The problem now is that it's got a ton of ajax calls, that all need to be moved backwards
      if (frame === 'table'){
        $timeout(function() {
          // $location.hash('row'+Table.userStanding)
          $anchorScroll('row' + Table.userStanding)
        }, 0)
        // console.log('bang')
      }
    }
    // $('body').scrollTop(1000)
    // NB: For getting the table scroll to work. timeout to make sure that the ng-repeat is done
    // make
    // aaaaaand it works!
    $timeout(function() {
      // $location.hash('row15')
      // $anchorScroll()
    }, 2000)

  })



  .controller('rssController', function (Rss, User) {
    var vm = this;

    // TODO: I can't find a way to do this in the dash crtl and pass it,
    //     so i'm doing it in each controller :/
    User.profile()
      .then(function(resp) {
        vm.teamPref = resp.data.teamPref
        Rss.teamFeed(vm.teamPref)
          .then(function(resp) {
            // console.log('teamfeed resp', resp.data)
            vm.feed = resp.data
          })
    })
  })

  .controller('scheduleController', function (Schedule, User, Team) {
    var vm = this;
    User.profile()
      .then(function(resp) {
        vm.teamPref = resp.data.teamPref
        Schedule.team(vm.teamPref)
        .then(function(resp) {
          // console.log('team sched', resp.data)
          vm.schedule = resp.data
          // console.log(vm.schedule)
        })
    })
    Team.logos()
    .then(function(resp) {
      vm.logos = resp.data
      // console.log(vm.logos)
    })

  })

  .controller('tableController', function (Table, User, Team, $location) {
    var vm = this
    vm.userTeam = {}
    vm.activeTeam = function (teamName) {
      return teamName === vm.userTeam.name
    }

    User.profile()
      .then(function(resp) {
        vm.teamPref = resp.data.teamPref
        return resp.data.teamPref
    })
      .then(function(resp) {
        return Team.data(resp)
      })
      .then(function(resp){
        vm.userTeam = resp.data
        return vm.userTeam
        console.log('user team',vm.userTeam)
      })
      .then(function (resp) {
        return Table.data()
      })
      .then(function (resp) {
        vm.table = resp.data
        // console.log(vm.table);
        // console.log(vm.table.standing.indexOf(vm.userTeam))
        // ====== this was a waste of time but seemed promising
        // var index = -1;
        // vm.table.standing.forEach(function(cur, i) {
        //   console.log(cur.teamName, vm.userTeam.name);
        //   if (cur.teamName === vm.userTeam.name)
        //     index = i
        // })

      })

    // Table.data()
    // .then(function(resp) {
    //   // console.log('league table', resp.data)
    //   vm.table = resp.data
    // })

  })

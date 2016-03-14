angular.module('dashCtrl', ['dataService','authService','userService'])

  .controller('dashController', function (Auth, User, $anchorScroll, $location) {
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


    User.profile()
      .then(function(resp) {
        vm.teamPref = resp.data
      })

    vm.activeFrame = 'news';
    vm.setActive = function (frame) {
      vm.activeFrame = frame
      console.log(frame)
      // TODO: make this fire as part of the ng-enter (or whatever) for the other ctrls
      //  or their elements
      if (frame === 'table'){
        $location.hash('row15')
        $anchorScroll()
        console.log('bang')
      }
    }
    // $('body').scrollTop(1000)

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

  .controller('tableController', function (Table, User, Team, $location, $anchorScroll) {
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
        $location.hash('row15')
        $anchorScroll()
      })

    // Table.data()
    // .then(function(resp) {
    //   // console.log('league table', resp.data)
    //   vm.table = resp.data
    // })

  })

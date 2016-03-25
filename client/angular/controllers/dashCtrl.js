angular.module('dashCtrl', ['dataService','authService','userService'])

  .controller('dashController', function (Auth, User, $anchorScroll, $location, $timeout, Table, Team) {
    var vm = this;
    vm.onOff = false
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
      },
      {
        id: 'social',
        name: 'Social',
        href: 'angular/views/pages/dash/social.html'
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
      // Table.data()
      // .then(function (resp) {
        vm.table = Table.table
        // console.log('table', vm.table)
      // })

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
          $anchorScroll('row' + Table.userStanding)
        }, 0)
        // console.log('bang')
      } else if (frame === 'schedule') {
        $timeout(function() {
          $anchorScroll.yOffset = 250;
          $anchorScroll('match' + Table.matchday)
        }, 0)
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
    vm.activeCard;

    vm.setActive = function (index) {
      // if they're clicking on the active card, close it
      vm.activeCard = vm.activeCard !== index ? index : null
      // console.log(vm.activeCard)
    }

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

  .controller('scheduleController', function (Schedule, User, Team, Table) {
    var vm = this;
    // vm.table = Table.table
    // vm.matchday = Table.table.matchday
    vm.log = function(val) {console.log(val);}

    vm.setClasses = function(fixture) {
      var out = {
        'played' : false,
        'future' : false,
        'won' : false,
        'lost' : false,
        'draw' : false,
      }
      // TODO: do this elegant (ternary operators, etc)
      var homeGoals = fixture.result.goalsHomeTeam
      var awayGoals = fixture.result.goalsAwayTeam
      var homeName = fixture.homeTeamName
      var awayName = fixture.awayTeamName
      var userGoals;
      var oppGoals;
      // console.log('userteam', vm.userTeam)
      if (vm.userTeam) {
        // console.log(fixture)
        if (vm.userTeam.name === homeName) {
          userGoals = homeGoals
          oppGoals = awayGoals
        } else {
          userGoals = awayGoals
          oppGoals = homeGoals
        }
        // Before this was done w/ the status codes, but those don't seem to mean
        // anything and aren't consistent
        // console.log(homeName, '-', awayName, homeGoals === null)
        out.future = homeGoals === null;
        out.played = !out.future

        if (out.played === true) {
          // console.log('fired')
          // console.log(homeName, '-', awayName, homeGoals, awayGoals, homeGoals === awayGoals )
          if (homeGoals === awayGoals) {
            // console.log('bang')
            out.draw = true
          } else {
            out.won = userGoals > oppGoals
            out.lost = !out.won
          }
        }
      }
      return out
    }


    User.profile()
      .then(function(resp) {
        vm.teamPref = resp.data.teamPref
        Schedule.team(vm.teamPref)
        .then(function(resp) {
          // console.log('team sched', resp.data)
          vm.schedule = resp.data
        })
        .then(function() {
          // TODO: pass full name along with the team pref(this api blows)
          return Team.data(vm.teamPref)
        })
        .then(function (resp) {
          // console.log('team data resp', resp.data)
          vm.userTeam = resp.data
        })
        // vm.matchday = vm.table.matchday
    })
    Team.logos()
    .then(function(resp) {
      vm.logos = resp.data
      // console.log(vm.logos)
    })
    Table.data()
      .then(function(resp) {
        vm.table = resp.data
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
        // This then call is vestigial
        vm.table = Table.table
      })

      vm.offset = function() {
        return $('.league-table').outerWidth()
      }

  })

  .controller('socialController', function (User, Team, Twitter, $sce) {
    var vm = this
    // Twitter.test()
    //   .then(function (resp) {
    //     // console.log(resp.data)
    //     // vm.tweets = $sce.trustAsHtml(resp.data.html)
    //   })
    vm.encodedTweets = []
    User.profile()
      .then(function (resp) {
        return resp.data.teamPref
        // vm.timeline = $sce.trustAsHtml(Twitter.timeline(resp.data.teamPref))
      })
      .then(function (teamPref) {
        return Twitter.search(teamPref)
      })
      .then(function (stream) {
        vm.tweets = stream.data.statuses
        // vm.tweets = vm.tweets.map(cur => cur.id)
        console.log('tweets', vm.tweets)
        return vm.tweets
      })
      .then(function (tweets) {
        // console.log('tweets',tweets)
        // return Twitter.getOne(tweets[0].id_str)
        tweets.forEach(function (cur) {
          Twitter.getOne(cur.id_str)
            .then(function(resp) {
              console.log('getone response', resp.data)
              vm.encodedTweets.push( $sce.trustAsHtml(resp.data.html))
            })
        })
        // console.log('encoded',vm.encodedTweets)
      })
      // .then(function (tweet) {
      //   console.log('tweet', tweet)
      //   vm.tweet = $sce.trustAsHtml(tweet.data.html)
      // })

    // Twitter.timeline()
    //   .then(function (resp) {
    //     console.log(resp)
    //     vm.timeline = $sce.trustAsHtml(resp)
    //   })
  })

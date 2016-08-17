'use strict';

angular.module('linkupRoutes', ['ngRoute'])

// configure our routes
.config(function ($routeProvider, $locationProvider) {
  $routeProvider
  // homepage
  .when('/', {
    templateUrl: '/angular/views/pages/home.html'
    // , controller : 'homeController'
    // , controllerAs : 'home'
  })

  // route for about page
  .when('/about', {
    templateUrl: '/angular/views/pages/about.html'
    // , controller : 'aboutController'
    // , controllerAs : 'about'
  })

  // login route
  .when('/login', {
    templateUrl: '/angular/views/pages/login.html',
    controller: 'mainController',
    controllerAs: 'login'
  }).when('/dash', {
    templateUrl: '/angular/views/pages/dash/dash.html',
    controller: 'dashController',
    controllerAs: 'vm'
  }).when('/signup', {
    templateUrl: '/angular/views/pages/signup.html',
    controller: 'userCreateController',
    controllerAs: 'vm'
  });

  //
  var devMode = false;
  if (!devMode) $locationProvider.html5Mode(true);
});
'use strict';

angular.module('linkupApp', ['linkupRoutes', 'authService', 'userService', 'mainCtrl', 'userCtrl', 'dashCtrl', 'dataService', 'dashFilters', 'socialService']).config(function ($httpProvider) {
  $httpProvider.interceptors.push('AuthInterceptor');
});
'use strict';

angular.module('authService', []).factory('Auth', function ($http, $q, AuthToken) {
  var authFactory = {};

  // login
  authFactory.login = function (username, password) {
    return $http.post('/api/authenticate', {
      username: username,
      password: password
    }).then(function (data) {
      AuthToken.setToken(data.data.token);
      return data.data;
    });
  };

  // logout
  authFactory.logout = function () {
    // clear token
    AuthToken.setToken();
  };

  // check if logged in
  authFactory.isLoggedIn = function () {
    if (AuthToken.getToken()) return true;else return false;
  };

  // get user info
  authFactory.getUser = function () {
    // console.log('getuser fired')
    if (AuthToken.getToken()) return $http.get('/api/me');else return $q.reject({ message: 'User has no token.' });
  };

  return authFactory;
}).factory('AuthToken', function ($window) {
  var authTokenFactory = {};

  // get token from local storage
  authTokenFactory.getToken = function () {
    return $window.localStorage.getItem('token');
  };

  // set or clear token
  authTokenFactory.setToken = function (token) {
    if (token) $window.localStorage.setItem('token', token);else $window.localStorage.removeItem('token');
  };

  return authTokenFactory;
}).factory('AuthInterceptor', function ($q, $location, AuthToken) {
  var interceptorFactory = {};

  // attach token to every request
  interceptorFactory.request = function (config) {
    // console.log('interceptor fired')
    var token = AuthToken.getToken();
    if (token) config.headers['x-access-token'] = token;
    return config;
  };

  // redirect if bad token
  interceptorFactory.responseError = function (response) {
    if (response.status == 403) $location.path('/login');
    return $q.reject(response);
  };
  return interceptorFactory;
});
'use strict';

angular.module('dashFilters', [])
// Cuts the names down to a size that fits in the boxes at the smallest size.
// Couldn't figure out a good way change the text based on viewport, so we always
// use shortened names
.filter('nameTrim', function () {
  return function (name) {
    out = name.replace('West Ham United', 'West Ham').replace('wich Albion', '') // 'West Browich Albion' -> 'West Brow'
    .replace(/(Leicester|Swansea|Stoke|Norwich|Tottenham) City|Hotspur/, '$1') // Drop 'City' or 'Hotspur'
    .replace('Newcastle United', 'Newcastle') // 'Newcastle Utd' would be too long
    .replace('Manchester', 'Man') // -> Shorten Man City / Utd
    .replace('United', 'Utd') // Man Utd
    .replace(/FC|AFC/, '').replace('Palace', 'Pal.') // Crystal palace is just too dang long
    .trim();
    return out;
  };
})

// The RSS text comes through poorly formatted, so we replace any artifacts in the string
.filter('cardTrim', function () {
  return function (text) {
    out = text.replace(/<br>/g, '\n').replace('..', '.');
    return out;
  };
});
'use strict';

angular.module('dataService', ['userService'])

// Handle making the various API calls. The heavy lifting should be moved
// to the server, methinks, and all of these should be looked at. There's a couple
// of places, if memory serves, where the same function makes the same api call
// multiple times, because there's no storing of data. That should be fixed.
// I mean, surely these factories can be stateful -- just have them check if they've
// got an object and if it's fresh, and if so return that, otherwise get it and
// return it. I mean, technically, return a promise either way, but whatever.

.factory('Rss', function ($http) {
  var rssFactory = {};

  rssFactory.teamFeed = function (team) {
    return $http.get('/api/rss/team/' + team);
  };

  return rssFactory;
}).factory('Schedule', function ($http) {
  var scheduleFactory = {};

  scheduleFactory.team = function (team) {
    return $http.get('/api/fd/team/schedule/' + team);
  };

  return scheduleFactory;
})

// TODO: There should be an api route that turns a shortname ('SWA')
// into a long name ('Swansea City AFC')
.factory('Table', function ($http, User, Team) {
  var tableFactory = {};

  tableFactory.data = function () {
    return $http.get('/api/fd/table');
  };

  // I thought this would work but it doesn't?
  // $http.get('/api/fd/table')
  //   .then(function (resp) {
  //     tableFactory.table = resp.data
  //     console.log(tableFactory.table)
  //   })

  // TODO: I think that this is slowing things down -- it's making everything wait on this ajax call
  function getStanding() {
    User.profile().then(function (resp) {
      return Team.data(resp.data.teamPref);
    }).then(function (resp) {
      var teamPref = resp.data;
      tableFactory.data().then(function (resp) {
        var table = resp.data.standing;
        // console.log(table)
        // var index = -1
        // console.log(teamPref.name, 'team name')
        for (var i = 0; i < table.length; i++) {
          // console.log(table.teamName, teamPref.name)
          if (table[i].teamName === teamPref.name) {
            tableFactory.userStanding = i;
            // console.log(tableFactory.userStanding)
            break;
          }
        }
      });
    });
  }
  getMatchday = function getMatchday() {
    tableFactory.data().then(function (resp) {
      tableFactory.table = resp.data;
      tableFactory.matchday = resp.data.matchday;
    });
  };

  getStanding();
  getMatchday();
  // console.log(tableFactory.userStanding)
  return tableFactory;
}).factory('Team', function ($http) {
  var teamFactory = {};

  teamFactory.all = function () {
    return $http.get('/api/fd/teams');
  };

  teamFactory.logos = function () {
    return $http.get('/api/fd/teams/logos');
  };

  teamFactory.data = function (team) {
    return $http.get('/api/fd/team/' + team);
  };

  return teamFactory;
});
'use strict';

// It looks like this was tabbed out but never used
angular.module('signupDirectives', []).directive('myRepeatDirective', function ($timeout) {
  return function (scope, element, attrs) {
    if (scope.$last) {
      console.log('hi');
    }
  };
});
'use strict';

angular.module('socialService', ['dataService'])

// Makes calls to our API, which hits twitter.
// This should be changed to something like 'get tweets'
// And it just throws up a bunch of tweets to show the user,
// and we cache the api calls on the backend

.factory('Twitter', function ($http, Team) {
  var twitterFactory = {};

  twitterFactory.test = function () {
    return $http.get('/api/tw/test');
  };

  twitterFactory.search = function (teamId) {
    return $http.get('/api/tw/search/' + teamId);
  };

  twitterFactory.getOne = function (id) {
    return $http.get('/api/tw/getOne/' + id);
  };

  // twitterFactory.timeline = function (teamCode) {
  //   var hash = teamHash(teamCode)
  //   console.log(hash)
  //   var partOne = '<a class="twitter-timeline" href="https://twitter.com/hashtag/'
  //   var partTwo = '" data-widget-id="709791211947630592">#'
  //   var partThree = "Tweets</a> <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document,'script','twitter-wjs');</script>"
  //
  //   console.log(partOne + hash + partTwo + hash + partThree);
  //
  //   return partOne + hash + partTwo + hash + partThree
  // }

  function teamHash(teamCode) {
    teamCode = teamCode.toLowerCase();
    console.log(teamCode);
    var lookup = {
      'swa': 'SwanseaCity',
      'cry': 'cpfc'
    };
    return lookup[teamCode];
  }

  return twitterFactory;
});
'use strict';

angular.module('userService', ['authService']).factory('User', function ($http, AuthToken, $q) {
  var userFactory = {};

  // get single user
  userFactory.get = function (id) {
    return $http.get('/api/users/' + id);
  };

  // get all users
  userFactory.all = function () {
    return $http.get('/api/users');
  };

  // create user
  userFactory.create = function (userData) {
    return $http.post('/api/users', userData);
  };

  // update user
  userFactory.update = function (id, userData) {
    return $http.put('/api/users/' + id, userData);
  };

  // delete user
  userFactory.delete = function (id) {
    return $http.delete('/api/users/' + id);
  };

  userFactory.profile = function () {
    if (AuthToken.getToken()) return $http.get('/api/me');else return $q.reject({ message: 'User has no token.' });
  };

  userFactory.profile().then(function (resp) {
    // console.log('profile response', resp.data)
  });

  return userFactory;
});
'use strict';

angular.module('dashCtrl', ['dataService', 'authService', 'userService']).controller('dashController', function (Auth, User, $anchorScroll, $location, $timeout, Table, Team) {
  var vm = this;
  vm.onOff = false;
  vm.dashFrames = [{
    id: 'news',
    name: 'News',
    href: 'angular/views/pages/dash/rss.html'
  }, {
    id: 'schedule',
    name: 'Schedule',
    href: 'angular/views/pages/dash/schedule.html'
  }, {
    id: 'table',
    name: 'Table',
    href: 'angular/views/pages/dash/table.html'
  }, {
    id: 'social',
    name: 'Social',
    href: 'angular/views/pages/dash/social.html'
  }];

  // TODO: get this out of the controller, move it to a factory so that multiple
  // controllers have access to this data
  User.profile().then(function (resp) {
    vm.teamPref = resp.data;
    Team.data(resp.data.teamPref).then(function (resp) {
      vm.userTeam = resp.data;
      var index = -1;
      // vm.table.standing.forEach(function(cur, i) {
      //   console.log(cur.teamName, vm.userTeam.name);
      //   if (cur.teamName === vm.userTeam.name)
      //     vm.tableIndex = i
      // })
    });
    // console.log('teamPref',vm.teamPref)
  });

  // TODO: This should be moved out of the controller, but no time for that now
  // Table.data()
  // .then(function (resp) {
  vm.table = Table.table;
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
    vm.activeFrame = frame;
    // console.log(frame)
    // TODO: make this fire as part of the ng-enter (or whatever) for the other ctrls
    //  or their elements... okay, so like, it needs both anchor scrolls? not clear why
    // DONE: I think i've gotten it figured out -- it needs to look like this. Good.
    // The problem now is that it's got a ton of ajax calls, that all need to be moved backwards
    if (frame === 'table') {
      $timeout(function () {
        $anchorScroll('row' + Table.userStanding);
      }, 0);
      // console.log('bang')
    } else if (frame === 'schedule') {
      $timeout(function () {
        $anchorScroll.yOffset = 250;
        $anchorScroll('match' + Table.matchday);
      }, 0);
    }
  };
  // $('body').scrollTop(1000)
  // NB: For getting the table scroll to work. timeout to make sure that the ng-repeat is done
  // make
  // aaaaaand it works!
  // This looks like dead code here?
  // $timeout(function() {
  //   // $location.hash('row15')
  //   // $anchorScroll()
  // }, 2000)
}).controller('rssController', function (Rss, User) {
  var vm = this;
  vm.activeCard;

  vm.setActive = function (index) {
    // if they're clicking on the active card, close it
    vm.activeCard = vm.activeCard !== index ? index : null;
    console.log(vm.activeCard);
  };

  // TODO: I can't find a way to do this in the dash crtl and pass it,
  //     so i'm doing it in each controller :/
  User.profile().then(function (resp) {
    vm.teamPref = resp.data.teamPref;
    Rss.teamFeed(vm.teamPref).then(function (resp) {
      // console.log('teamfeed resp', resp.data)
      vm.feed = resp.data;
    });
  });
}).controller('scheduleController', function (Schedule, User, Team, Table) {
  var vm = this;
  // vm.table = Table.table
  // vm.matchday = Table.table.matchday
  vm.log = function (val) {
    console.log(val);
  };

  vm.setClasses = function (fixture) {
    var out = {
      'played': false,
      'future': false,
      'won': false,
      'lost': false,
      'draw': false
    };
    // TODO: do this elegant
    var homeGoals = fixture.result.goalsHomeTeam;
    var awayGoals = fixture.result.goalsAwayTeam;
    var homeName = fixture.homeTeamName;
    var awayName = fixture.awayTeamName;
    var userGoals;
    var oppGoals;
    // console.log('userteam', vm.userTeam)
    if (vm.userTeam) {
      // console.log(fixture)
      if (vm.userTeam.name === homeName) {
        userGoals = homeGoals;
        oppGoals = awayGoals;
      } else {
        userGoals = awayGoals;
        oppGoals = homeGoals;
      }
      // Before this was done w/ the status codes, but those don't seem to mean
      // anything and aren't consistent
      // console.log(homeName, '-', awayName, homeGoals === null)
      out.future = homeGoals === null;
      out.played = !out.future;

      if (out.played === true) {
        // console.log('fired')
        // console.log(homeName, '-', awayName, homeGoals, awayGoals, homeGoals === awayGoals )
        if (homeGoals === awayGoals) {
          // console.log('bang')
          out.draw = true;
        } else {
          out.won = userGoals > oppGoals;
          out.lost = !out.won;
        }
      }
    }
    return out;
  };

  User.profile().then(function (resp) {
    vm.teamPref = resp.data.teamPref;
    Schedule.team(vm.teamPref).then(function (resp) {
      // console.log('team sched', resp.data)
      vm.schedule = resp.data;
    }).then(function () {
      // TODO: pass full name along with the team pref(this api blows)
      return Team.data(vm.teamPref);
    }).then(function (resp) {
      // console.log('team data resp', resp.data)
      vm.userTeam = resp.data;
    });
    // vm.matchday = vm.table.matchday
  });
  Team.logos().then(function (resp) {
    vm.logos = resp.data;
    // console.log(vm.logos)
  });
  Table.data().then(function (resp) {
    vm.table = resp.data;
  });
}).controller('tableController', function (Table, User, Team, $location) {
  var vm = this;
  vm.userTeam = {};
  vm.activeTeam = function (teamName) {
    return teamName === vm.userTeam.name;
  };

  User.profile().then(function (resp) {
    vm.teamPref = resp.data.teamPref;
    return resp.data.teamPref;
  }).then(function (resp) {
    return Team.data(resp);
  }).then(function (resp) {
    vm.userTeam = resp.data;
    return vm.userTeam;
    console.log('user team', vm.userTeam);
  }).then(function (resp) {
    // This then call is vestigial
    vm.table = Table.table;
  });

  vm.offset = function () {
    return $('.league-table').outerWidth();
  };
}).controller('socialController', function (User, Team, Twitter, $sce) {
  var vm = this;
  Twitter.test().then(function (resp) {
    // console.log(resp.data)
    // vm.tweets = $sce.trustAsHtml(resp.data.html)
  });
  vm.encodedTweets = [];
  User.profile().then(function (resp) {
    return resp.data.teamPref;
    // vm.timeline = $sce.trustAsHtml(Twitter.timeline(resp.data.teamPref))
  }).then(function (teamPref) {
    return Twitter.search(teamPref);
  }).then(function (stream) {
    vm.tweets = stream.data.statuses;
    // vm.tweets = vm.tweets.map(cur => cur.id)
    console.log(vm.tweets);
    return vm.tweets;
  }).then(function (tweets) {
    console.log('tweets', tweets);
    // return Twitter.getOne(tweets[0].id_str)
    tweets.forEach(function (cur) {
      Twitter.getOne(cur.id_str).then(function (resp) {
        // console.log('getone response', resp)
        vm.encodedTweets.push($sce.trustAsHtml(resp.data.html));
      });
    });
    // console.log('encoded',vm.encodedTweets)
  });
  // .then(function (tweet) {
  //   console.log('tweet', tweet)
  //   vm.tweet = $sce.trustAsHtml(tweet.data.html)
  // })

  // Twitter.timeline()
  //   .then(function (resp) {
  //     console.log(resp)
  //     vm.timeline = $sce.trustAsHtml(resp)
  //   })
});
'use strict';

// Controller for the overarching page
angular.module('mainCtrl', []).controller('mainController', function ($rootScope, $location, Auth, User) {

	var vm = this;

	vm.atHome = function () {
		console.log();
		return $location.path() === '/' || $location.path() === '';
	};
	vm.atSignup = function () {
		return $location.path() === '/signup'; //|| $location.path() === ''
	};

	// It's silly to call this all the time, just in case it's needed, but it's late and i'm tired
	// and this needs to get done in very little time.
	// TODO: Make this request logical and efficient (ie, make it only once)
	User.profile().then(function (resp) {
		vm.teamPref = resp.data.teamPref;
	});

	// TODO: move this call to a factory and the urls to the backend
	vm.bUrl = function () {
		// console.log('fired')
		// Turns out pictures look bad behind the dash
		// if ($location.path() === '/dash'){
		// 	return teamDashImg(vm.teamPref)
		// }
		var pics = {
			girl: 'https://c2.staticflickr.com/4/3455/3790590480_4bb5c69495_b.jpg',
			stMarys: 'https://c2.staticflickr.com/2/1560/23792983544_d908975115_z.jpg',
			lights: 'https://c2.staticflickr.com/8/7422/12676772194_3053b3eeed_b.jpg',
			champs: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/West_Stand_Champions.jpg'
		};
		var urls = {

			'/signup': pics.stMarys,
			'/': pics.champs,
			'/dash': '',
			'/about': pics.lights
		};
		if (urls[$location.path()] === undefined) console.error('' + $location.path() + ' background not defined');
		return urls[$location.path()] !== undefined ? urls[$location.path()] : '';
	};

	function teamDashImg(path) {
		path = path.toLowerCase();
		var defaultImg = 'https://c2.staticflickr.com/2/1560/23792983544_d908975115_z.jpg';
		var teams = {
			'afc': 'https://c2.staticflickr.com/8/7422/12676772194_3053b3eeed_b.jpg'
		};
		return teams[path] !== undefined ? teams[path] : defaultImg;
	}

	vm.hideNav = function () {
		console.log('fired');
		$('.button-collapse').sideNav('hide');
	};

	// get info if a person is logged in
	vm.loggedIn = Auth.isLoggedIn();
	if ($location.path() === '/' && vm.loggedIn) $location.path('/dash');

	// check to see if a user is logged in on every request
	$rootScope.$on('$routeChangeStart', function () {
		vm.loggedIn = Auth.isLoggedIn();

		// get user information on page load
		Auth.getUser().then(function (data) {
			vm.user = data.data;
		});
	});

	// For guest login
	vm.guest = function () {
		vm.loginData = {};
		vm.loginData.username = 'guest';
		vm.loginData.password = 'password';
	};

	// function to handle login form
	vm.doLogin = function () {
		vm.processing = true;

		vm.loginData.username = vm.loginData.username.toLowerCase();

		Auth.login(vm.loginData.username, vm.loginData.password).then(function (data) {
			vm.processing = false;

			// if a user successfully logs in, redirect to users page
			if (data.success) $location.path('/dash');else vm.error = data.message;
		});
	};

	// function to handle logging out
	vm.doLogout = function () {
		Auth.logout();
		vm.user = '';

		$location.path('/');
	};
});
'use strict';

angular.module('userCtrl', ['userService']).controller('userController', function (User) {

	var vm = this;

	// set a processing variable to show loading things
	vm.processing = true;

	// grab all the users at page load
	User.all().success(function (data) {

		// when all the users come back, remove the processing variable
		vm.processing = false;

		// bind the users that come back to vm.users
		vm.users = data;
	});

	// function to delete a user
	vm.deleteUser = function (id) {
		vm.processing = true;

		User.delete(id).success(function (data) {

			// get all users to update the table
			// you can also set up your api
			// to return the list of users with the delete call
			User.all().success(function (data) {
				vm.processing = false;
				vm.users = data;
			});
		});
	};
})

// controller applied to user creation page
.controller('userCreateController', function (User, Team, $location, $timeout, Auth, AuthToken, $window) {
	var vm = this;

	// variable to hide/show elements of the view
	// differentiates between create or edit pages
	vm.type = 'create';

	vm.userData = {};

	vm.log = function (val) {
		console.log('log:', val);
	};

	Team.all().then(function (resp) {
		vm.teams = resp.data.teams;

		$timeout(function () {
			$('select').material_select();
		}, 0);
	});

	// function to create a user
	vm.saveUser = function () {
		vm.processing = true;
		vm.message = '';
		var password = vm.userData.password;
		// use the create function in the userService
		User.create(vm.userData).then(function (resp) {
			vm.processing = false;
			vm.userData = {};
			return resp.data;
		}).then(function (user) {
			Auth.login(user.username, password).then(function (data) {
				vm.processing = false;

				// if a user successfully logs in, redirect to users page
				if (data.success) {
					$location.path('/dash');
				}
			});
		});
	};
})

// controller applied to user edit page
.controller('userEditController', function ($routeParams, User) {

	var vm = this;

	// variable to hide/show elements of the view
	// differentiates between create or edit pages
	vm.type = 'edit';

	// get the user data for the user you want to edit
	// $routeParams is the way we grab data from the URL
	User.get($routeParams.user_id).success(function (data) {
		vm.userData = data;
	});

	// function to save the user
	vm.saveUser = function () {
		vm.processing = true;
		vm.message = '';

		// call the userService function to update
		User.update($routeParams.user_id, vm.userData).success(function (data) {
			vm.processing = false;

			// clear the form
			vm.userData = {};
		});
	};
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC1yb3V0ZXMuanMiLCJhcHAuanMiLCJzZXJ2aWNlcy9hdXRoU2VydmljZS5qcyIsInNlcnZpY2VzL2Rhc2hGaWx0ZXJzLmpzIiwic2VydmljZXMvZGF0YVNlcnZpY2UuanMiLCJzZXJ2aWNlcy9zaWdudXBEaXJlY3RpdmVzLmpzIiwic2VydmljZXMvc29jaWFsU2VydmljZS5qcyIsInNlcnZpY2VzL3VzZXJTZXJ2aWNlLmpzIiwiY29udHJvbGxlcnMvZGFzaEN0cmwuanMiLCJjb250cm9sbGVycy9tYWluQ3RybC5qcyIsImNvbnRyb2xsZXJzL3VzZXJDdHJsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsUUFBUSxNQUFSLENBQWUsY0FBZixFQUErQixDQUFDLFNBQUQsQ0FBL0I7O0FBRUU7QUFGRixDQUdHLE1BSEgsQ0FHVSxVQUFTLGNBQVQsRUFBeUIsaUJBQXpCLEVBQTRDO0FBQ2xEO0FBQ0U7QUFERixHQUVHLElBRkgsQ0FFUSxHQUZSLEVBRWE7QUFDVCxpQkFBYztBQUNkO0FBQ0E7QUFIUyxHQUZiOztBQVFFO0FBUkYsR0FTRyxJQVRILENBU1EsUUFUUixFQVNrQjtBQUNkLGlCQUFjO0FBQ2Q7QUFDQTtBQUhjLEdBVGxCOztBQWVFO0FBZkYsR0FnQkcsSUFoQkgsQ0FnQlEsUUFoQlIsRUFnQmtCO0FBQ2QsaUJBQWMsaUNBREE7QUFFWixnQkFBYSxnQkFGRDtBQUdaLGtCQUFlO0FBSEgsR0FoQmxCLEVBc0JHLElBdEJILENBc0JRLE9BdEJSLEVBc0JpQjtBQUNiLGlCQUFhLHFDQURBO0FBRWIsZ0JBQVksZ0JBRkM7QUFHYixrQkFBYztBQUhELEdBdEJqQixFQTRCRyxJQTVCSCxDQTRCUSxTQTVCUixFQTRCbUI7QUFDZixpQkFBYSxrQ0FERTtBQUVmLGdCQUFZLHNCQUZHO0FBR2Ysa0JBQWM7QUFIQyxHQTVCbkI7O0FBa0NFO0FBQ0YsTUFBSSxVQUFVLEtBQWQ7QUFDQSxNQUFJLENBQUMsT0FBTCxFQUFjLGtCQUFrQixTQUFsQixD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R0MsVUFoR0QsQ0FnR1ksb0JBaEdaLEVBZ0drQyxVQUFTLFlBQVQsRUFBdUIsSUFBdkIsRUFBNkI7O0FBRTlELEtBQUksS0FBSyxJQUFUOztBQUVBO0FBQ0E7QUFDQSxJQUFHLElBQUgsR0FBVSxNQUFWOztBQUVBO0FBQ0E7QUFDQSxNQUFLLEdBQUwsQ0FBUyxhQUFhLE9BQXRCLEVBQ0UsT0FERixDQUNVLFVBQVMsSUFBVCxFQUFlO0FBQ3ZCLEtBQUcsUUFBSCxHQUFjLElBQWQ7QUFDQSxFQUhGOztBQUtBO0FBQ0EsSUFBRyxRQUFILEdBQWMsWUFBVztBQUN4QixLQUFHLFVBQUgsR0FBZ0IsSUFBaEI7QUFDQSxLQUFHLE9BQUgsR0FBYSxFQUFiOztBQUVBO0FBQ0EsT0FBSyxNQUFMLENBQVksYUFBYSxPQUF6QixFQUFrQyxHQUFHLFFBQXJDLEVBQ0UsT0FERixDQUNVLFVBQVMsSUFBVCxFQUFlO0FBQ3ZCLE1BQUcsVUFBSCxHQUFnQixLQUFoQjs7QUFFQTtBQUNBLE1BQUcsUUFBSCxHQUFjLEVBQWQ7QUFFQSxHQVBGO0FBUUEsRUFiRDtBQWVBLENBL0hEIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImFuZ3VsYXIubW9kdWxlKCdsaW5rdXBSb3V0ZXMnLCBbJ25nUm91dGUnXSlcblxuICAvLyBjb25maWd1cmUgb3VyIHJvdXRlc1xuICAuY29uZmlnKGZ1bmN0aW9uKCRyb3V0ZVByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlcikge1xuICAgICRyb3V0ZVByb3ZpZGVyXG4gICAgICAvLyBob21lcGFnZVxuICAgICAgLndoZW4oJy8nLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsIDogJy9hbmd1bGFyL3ZpZXdzL3BhZ2VzL2hvbWUuaHRtbCdcbiAgICAgICAgLy8gLCBjb250cm9sbGVyIDogJ2hvbWVDb250cm9sbGVyJ1xuICAgICAgICAvLyAsIGNvbnRyb2xsZXJBcyA6ICdob21lJ1xuICAgICAgfSlcblxuICAgICAgLy8gcm91dGUgZm9yIGFib3V0IHBhZ2VcbiAgICAgIC53aGVuKCcvYWJvdXQnLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsIDogJy9hbmd1bGFyL3ZpZXdzL3BhZ2VzL2Fib3V0Lmh0bWwnXG4gICAgICAgIC8vICwgY29udHJvbGxlciA6ICdhYm91dENvbnRyb2xsZXInXG4gICAgICAgIC8vICwgY29udHJvbGxlckFzIDogJ2Fib3V0J1xuICAgICAgfSlcblxuICAgICAgLy8gbG9naW4gcm91dGVcbiAgICAgIC53aGVuKCcvbG9naW4nLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsIDogJy9hbmd1bGFyL3ZpZXdzL3BhZ2VzL2xvZ2luLmh0bWwnXG4gICAgICAgICwgY29udHJvbGxlciA6ICdtYWluQ29udHJvbGxlcidcbiAgICAgICAgLCBjb250cm9sbGVyQXMgOiAnbG9naW4nXG4gICAgICB9KVxuXG4gICAgICAud2hlbignL2Rhc2gnLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL2FuZ3VsYXIvdmlld3MvcGFnZXMvZGFzaC9kYXNoLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnZGFzaENvbnRyb2xsZXInLFxuICAgICAgICBjb250cm9sbGVyQXM6ICd2bSdcbiAgICAgIH0pXG5cbiAgICAgIC53aGVuKCcvc2lnbnVwJywge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJy9hbmd1bGFyL3ZpZXdzL3BhZ2VzL3NpZ251cC5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ3VzZXJDcmVhdGVDb250cm9sbGVyJyxcbiAgICAgICAgY29udHJvbGxlckFzOiAndm0nXG4gICAgICB9KVxuXG4gICAgICAvL1xuICAgIHZhciBkZXZNb2RlID0gZmFsc2U7XG4gICAgaWYgKCFkZXZNb2RlKSAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUodHJ1ZSlcbiAgfSlcbiIsImFuZ3VsYXIubW9kdWxlKCdsaW5rdXBBcHAnLCBbXG4gICdsaW5rdXBSb3V0ZXMnLFxuICAnYXV0aFNlcnZpY2UnLFxuICAndXNlclNlcnZpY2UnLFxuICAnbWFpbkN0cmwnLFxuICAndXNlckN0cmwnLFxuICAnZGFzaEN0cmwnLFxuICAnZGF0YVNlcnZpY2UnLFxuICAnZGFzaEZpbHRlcnMnLFxuICAnc29jaWFsU2VydmljZSdcblxuXSlcbiAgLmNvbmZpZyhmdW5jdGlvbiAoJGh0dHBQcm92aWRlcikge1xuICAgICRodHRwUHJvdmlkZXIuaW50ZXJjZXB0b3JzLnB1c2goJ0F1dGhJbnRlcmNlcHRvcicpXG4gIH0pXG4iLCJhbmd1bGFyLm1vZHVsZSgnYXV0aFNlcnZpY2UnLCBbXSlcblxuICAuZmFjdG9yeSgnQXV0aCcsIGZ1bmN0aW9uKCRodHRwLCAkcSwgQXV0aFRva2VuKSB7XG4gICAgdmFyIGF1dGhGYWN0b3J5ID0ge31cblxuICAgIC8vIGxvZ2luXG4gICAgYXV0aEZhY3RvcnkubG9naW4gPSBmdW5jdGlvbiAodXNlcm5hbWUsIHBhc3N3b3JkKSB7XG4gICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9hdXRoZW50aWNhdGUnLCB7XG4gICAgICAgIHVzZXJuYW1lOiB1c2VybmFtZSxcbiAgICAgICAgcGFzc3dvcmQ6IHBhc3N3b3JkXG4gICAgICB9KVxuICAgICAgICAudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgQXV0aFRva2VuLnNldFRva2VuKGRhdGEuZGF0YS50b2tlbilcbiAgICAgICAgICByZXR1cm4gZGF0YS5kYXRhXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgLy8gbG9nb3V0XG4gICAgYXV0aEZhY3RvcnkubG9nb3V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgLy8gY2xlYXIgdG9rZW5cbiAgICAgIEF1dGhUb2tlbi5zZXRUb2tlbigpXG4gICAgfVxuXG4gICAgLy8gY2hlY2sgaWYgbG9nZ2VkIGluXG4gICAgYXV0aEZhY3RvcnkuaXNMb2dnZWRJbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChBdXRoVG9rZW4uZ2V0VG9rZW4oKSlcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgLy8gZ2V0IHVzZXIgaW5mb1xuICAgIGF1dGhGYWN0b3J5LmdldFVzZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAvLyBjb25zb2xlLmxvZygnZ2V0dXNlciBmaXJlZCcpXG4gICAgICBpZiAoQXV0aFRva2VuLmdldFRva2VuKCkpXG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvbWUnKVxuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gJHEucmVqZWN0KHttZXNzYWdlOiAnVXNlciBoYXMgbm8gdG9rZW4uJ30pXG4gICAgfVxuXG4gICAgcmV0dXJuIGF1dGhGYWN0b3J5XG5cbiAgfSlcblxuICAuZmFjdG9yeSgnQXV0aFRva2VuJywgZnVuY3Rpb24oJHdpbmRvdykge1xuICAgIHZhciBhdXRoVG9rZW5GYWN0b3J5ID0ge31cblxuICAgIC8vIGdldCB0b2tlbiBmcm9tIGxvY2FsIHN0b3JhZ2VcbiAgICBhdXRoVG9rZW5GYWN0b3J5LmdldFRva2VuID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuICR3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Rva2VuJylcbiAgICB9XG5cbiAgICAvLyBzZXQgb3IgY2xlYXIgdG9rZW5cbiAgICBhdXRoVG9rZW5GYWN0b3J5LnNldFRva2VuID0gZnVuY3Rpb24gKHRva2VuKSB7XG4gICAgICBpZiAodG9rZW4pXG4gICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3Rva2VuJywgdG9rZW4pXG4gICAgICBlbHNlXG4gICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3Rva2VuJylcbiAgICB9XG5cbiAgICByZXR1cm4gYXV0aFRva2VuRmFjdG9yeVxuICB9KVxuXG4gIC5mYWN0b3J5KCdBdXRoSW50ZXJjZXB0b3InLCBmdW5jdGlvbigkcSwgJGxvY2F0aW9uLCBBdXRoVG9rZW4pIHtcbiAgICB2YXIgaW50ZXJjZXB0b3JGYWN0b3J5ID0ge31cblxuICAgIC8vIGF0dGFjaCB0b2tlbiB0byBldmVyeSByZXF1ZXN0XG4gICAgaW50ZXJjZXB0b3JGYWN0b3J5LnJlcXVlc3QgPSBmdW5jdGlvbihjb25maWcpIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdpbnRlcmNlcHRvciBmaXJlZCcpXG4gICAgICB2YXIgdG9rZW4gPSBBdXRoVG9rZW4uZ2V0VG9rZW4oKVxuICAgICAgaWYgKHRva2VuKVxuICAgICAgICBjb25maWcuaGVhZGVyc1sneC1hY2Nlc3MtdG9rZW4nXSA9IHRva2VuXG4gICAgICByZXR1cm4gY29uZmlnXG4gICAgfVxuXG4gICAgLy8gcmVkaXJlY3QgaWYgYmFkIHRva2VuXG4gICAgaW50ZXJjZXB0b3JGYWN0b3J5LnJlc3BvbnNlRXJyb3IgPSBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT0gNDAzKVxuICAgICAgICAkbG9jYXRpb24ucGF0aCgnL2xvZ2luJylcbiAgICAgIHJldHVybiAkcS5yZWplY3QocmVzcG9uc2UpXG4gICAgfVxuICAgIHJldHVybiBpbnRlcmNlcHRvckZhY3RvcnlcbiAgfSlcbiIsImFuZ3VsYXIubW9kdWxlKCdkYXNoRmlsdGVycycsIFtdKVxuICAvLyBDdXRzIHRoZSBuYW1lcyBkb3duIHRvIGEgc2l6ZSB0aGF0IGZpdHMgaW4gdGhlIGJveGVzIGF0IHRoZSBzbWFsbGVzdCBzaXplLlxuICAvLyBDb3VsZG4ndCBmaWd1cmUgb3V0IGEgZ29vZCB3YXkgY2hhbmdlIHRoZSB0ZXh0IGJhc2VkIG9uIHZpZXdwb3J0LCBzbyB3ZSBhbHdheXNcbiAgLy8gdXNlIHNob3J0ZW5lZCBuYW1lc1xuICAuZmlsdGVyKCduYW1lVHJpbScsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgIG91dCA9IG5hbWVcbiAgICAgICAgLnJlcGxhY2UoJ1dlc3QgSGFtIFVuaXRlZCcsICdXZXN0IEhhbScpXG4gICAgICAgIC5yZXBsYWNlKCd3aWNoIEFsYmlvbicsICcnKSAvLyAnV2VzdCBCcm93aWNoIEFsYmlvbicgLT4gJ1dlc3QgQnJvdydcbiAgICAgICAgLnJlcGxhY2UoLyhMZWljZXN0ZXJ8U3dhbnNlYXxTdG9rZXxOb3J3aWNofFRvdHRlbmhhbSkgQ2l0eXxIb3RzcHVyLywgJyQxJykgLy8gRHJvcCAnQ2l0eScgb3IgJ0hvdHNwdXInXG4gICAgICAgIC5yZXBsYWNlKCdOZXdjYXN0bGUgVW5pdGVkJywgJ05ld2Nhc3RsZScpIC8vICdOZXdjYXN0bGUgVXRkJyB3b3VsZCBiZSB0b28gbG9uZ1xuICAgICAgICAucmVwbGFjZSgnTWFuY2hlc3RlcicsICdNYW4nKSAvLyAtPiBTaG9ydGVuIE1hbiBDaXR5IC8gVXRkXG4gICAgICAgIC5yZXBsYWNlKCdVbml0ZWQnLCAnVXRkJykgLy8gTWFuIFV0ZFxuICAgICAgICAucmVwbGFjZSgvRkN8QUZDLywgJycpXG4gICAgICAgIC5yZXBsYWNlKCdQYWxhY2UnLCAnUGFsLicpIC8vIENyeXN0YWwgcGFsYWNlIGlzIGp1c3QgdG9vIGRhbmcgbG9uZ1xuICAgICAgICAudHJpbSgpXG4gICAgICByZXR1cm4gb3V0XG4gICAgfVxuICB9KVxuXG4gIC8vIFRoZSBSU1MgdGV4dCBjb21lcyB0aHJvdWdoIHBvb3JseSBmb3JtYXR0ZWQsIHNvIHdlIHJlcGxhY2UgYW55IGFydGlmYWN0cyBpbiB0aGUgc3RyaW5nXG4gIC5maWx0ZXIoJ2NhcmRUcmltJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAodGV4dCkge1xuICAgICAgb3V0ID0gdGV4dFxuICAgICAgICAucmVwbGFjZSgvPGJyPi9nLCAnXFxuJylcbiAgICAgICAgLnJlcGxhY2UoJy4uJywgJy4nKVxuICAgICAgcmV0dXJuIG91dFxuICAgIH1cbiAgfSlcbiIsImFuZ3VsYXIubW9kdWxlKCdkYXRhU2VydmljZScsIFsndXNlclNlcnZpY2UnXSlcblxuICAvLyBIYW5kbGUgbWFraW5nIHRoZSB2YXJpb3VzIEFQSSBjYWxscy4gVGhlIGhlYXZ5IGxpZnRpbmcgc2hvdWxkIGJlIG1vdmVkXG4gIC8vIHRvIHRoZSBzZXJ2ZXIsIG1ldGhpbmtzLCBhbmQgYWxsIG9mIHRoZXNlIHNob3VsZCBiZSBsb29rZWQgYXQuIFRoZXJlJ3MgYSBjb3VwbGVcbiAgLy8gb2YgcGxhY2VzLCBpZiBtZW1vcnkgc2VydmVzLCB3aGVyZSB0aGUgc2FtZSBmdW5jdGlvbiBtYWtlcyB0aGUgc2FtZSBhcGkgY2FsbFxuICAvLyBtdWx0aXBsZSB0aW1lcywgYmVjYXVzZSB0aGVyZSdzIG5vIHN0b3Jpbmcgb2YgZGF0YS4gVGhhdCBzaG91bGQgYmUgZml4ZWQuXG4gIC8vIEkgbWVhbiwgc3VyZWx5IHRoZXNlIGZhY3RvcmllcyBjYW4gYmUgc3RhdGVmdWwgLS0ganVzdCBoYXZlIHRoZW0gY2hlY2sgaWYgdGhleSd2ZVxuICAvLyBnb3QgYW4gb2JqZWN0IGFuZCBpZiBpdCdzIGZyZXNoLCBhbmQgaWYgc28gcmV0dXJuIHRoYXQsIG90aGVyd2lzZSBnZXQgaXQgYW5kXG4gIC8vIHJldHVybiBpdC4gSSBtZWFuLCB0ZWNobmljYWxseSwgcmV0dXJuIGEgcHJvbWlzZSBlaXRoZXIgd2F5LCBidXQgd2hhdGV2ZXIuXG5cbiAgLmZhY3RvcnkoJ1JzcycsIGZ1bmN0aW9uKCRodHRwKSB7XG4gICAgdmFyIHJzc0ZhY3RvcnkgPSB7fVxuXG4gICAgcnNzRmFjdG9yeS50ZWFtRmVlZCA9IGZ1bmN0aW9uICh0ZWFtKSB7XG4gICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL3Jzcy90ZWFtLycgKyB0ZWFtKVxuICAgIH1cblxuICAgIHJldHVybiByc3NGYWN0b3J5XG4gIH0pXG5cbiAgLmZhY3RvcnkoJ1NjaGVkdWxlJywgZnVuY3Rpb24gKCRodHRwKSB7XG4gICAgdmFyIHNjaGVkdWxlRmFjdG9yeSA9IHt9XG5cbiAgICBzY2hlZHVsZUZhY3RvcnkudGVhbSA9IGZ1bmN0aW9uKHRlYW0pIHtcbiAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvZmQvdGVhbS9zY2hlZHVsZS8nICsgdGVhbSlcbiAgICB9XG5cbiAgICByZXR1cm4gc2NoZWR1bGVGYWN0b3J5XG4gIH0pXG5cbi8vIFRPRE86IFRoZXJlIHNob3VsZCBiZSBhbiBhcGkgcm91dGUgdGhhdCB0dXJucyBhIHNob3J0bmFtZSAoJ1NXQScpXG4vLyBpbnRvIGEgbG9uZyBuYW1lICgnU3dhbnNlYSBDaXR5IEFGQycpXG4gIC5mYWN0b3J5KCdUYWJsZScsIGZ1bmN0aW9uICgkaHR0cCwgVXNlciwgVGVhbSkge1xuICAgIHZhciB0YWJsZUZhY3RvcnkgPSB7fVxuXG4gICAgdGFibGVGYWN0b3J5LmRhdGEgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2ZkL3RhYmxlJylcbiAgICB9XG5cbiAgICAvLyBJIHRob3VnaHQgdGhpcyB3b3VsZCB3b3JrIGJ1dCBpdCBkb2Vzbid0P1xuICAgIC8vICRodHRwLmdldCgnL2FwaS9mZC90YWJsZScpXG4gICAgLy8gICAudGhlbihmdW5jdGlvbiAocmVzcCkge1xuICAgIC8vICAgICB0YWJsZUZhY3RvcnkudGFibGUgPSByZXNwLmRhdGFcbiAgICAvLyAgICAgY29uc29sZS5sb2codGFibGVGYWN0b3J5LnRhYmxlKVxuICAgIC8vICAgfSlcblxuLy8gVE9ETzogSSB0aGluayB0aGF0IHRoaXMgaXMgc2xvd2luZyB0aGluZ3MgZG93biAtLSBpdCdzIG1ha2luZyBldmVyeXRoaW5nIHdhaXQgb24gdGhpcyBhamF4IGNhbGxcbiAgICBmdW5jdGlvbiBnZXRTdGFuZGluZyAoKSB7XG4gICAgICBVc2VyLnByb2ZpbGUoKVxuICAgICAgICAudGhlbihmdW5jdGlvbiAocmVzcCkge1xuICAgICAgICAgIHJldHVybiBUZWFtLmRhdGEocmVzcC5kYXRhLnRlYW1QcmVmKVxuICAgICAgICB9KVxuICAgICAgICAudGhlbihmdW5jdGlvbiAocmVzcCkge1xuICAgICAgICAgIHZhciB0ZWFtUHJlZiA9IHJlc3AuZGF0YVxuICAgICAgICAgIHRhYmxlRmFjdG9yeS5kYXRhKClcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3ApIHtcbiAgICAgICAgICAgICAgdmFyIHRhYmxlID0gcmVzcC5kYXRhLnN0YW5kaW5nXG4gICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRhYmxlKVxuICAgICAgICAgICAgICAvLyB2YXIgaW5kZXggPSAtMVxuICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh0ZWFtUHJlZi5uYW1lLCAndGVhbSBuYW1lJylcbiAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0YWJsZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRhYmxlLnRlYW1OYW1lLCB0ZWFtUHJlZi5uYW1lKVxuICAgICAgICAgICAgICAgIGlmICh0YWJsZVtpXS50ZWFtTmFtZSA9PT0gdGVhbVByZWYubmFtZSl7XG4gICAgICAgICAgICAgICAgICB0YWJsZUZhY3RvcnkudXNlclN0YW5kaW5nID0gaVxuICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2codGFibGVGYWN0b3J5LnVzZXJTdGFuZGluZylcbiAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgIH1cbiAgICBnZXRNYXRjaGRheSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRhYmxlRmFjdG9yeS5kYXRhKClcbiAgICAgICAgLnRoZW4gKGZ1bmN0aW9uIChyZXNwKSB7XG4gICAgICAgICAgdGFibGVGYWN0b3J5LnRhYmxlID0gcmVzcC5kYXRhXG4gICAgICAgICAgdGFibGVGYWN0b3J5Lm1hdGNoZGF5ID0gcmVzcC5kYXRhLm1hdGNoZGF5XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgZ2V0U3RhbmRpbmcoKVxuICAgIGdldE1hdGNoZGF5KClcbiAgICAvLyBjb25zb2xlLmxvZyh0YWJsZUZhY3RvcnkudXNlclN0YW5kaW5nKVxuICAgIHJldHVybiB0YWJsZUZhY3RvcnlcbiAgfSlcblxuICAuZmFjdG9yeSgnVGVhbScsIGZ1bmN0aW9uICgkaHR0cCkge1xuICAgIHZhciB0ZWFtRmFjdG9yeSA9IHt9XG5cbiAgICB0ZWFtRmFjdG9yeS5hbGwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2ZkL3RlYW1zJylcbiAgICB9XG5cbiAgICB0ZWFtRmFjdG9yeS5sb2dvcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvZmQvdGVhbXMvbG9nb3MnKVxuICAgIH1cblxuICAgIHRlYW1GYWN0b3J5LmRhdGEgPSBmdW5jdGlvbiAodGVhbSkge1xuICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9mZC90ZWFtLycgKyB0ZWFtKVxuICAgIH1cblxuICAgIHJldHVybiB0ZWFtRmFjdG9yeVxuICB9KVxuIiwiLy8gSXQgbG9va3MgbGlrZSB0aGlzIHdhcyB0YWJiZWQgb3V0IGJ1dCBuZXZlciB1c2VkXG5hbmd1bGFyLm1vZHVsZSgnc2lnbnVwRGlyZWN0aXZlcycsIFtdKVxuLmRpcmVjdGl2ZSgnbXlSZXBlYXREaXJlY3RpdmUnLCBmdW5jdGlvbigkdGltZW91dCkge1xuICByZXR1cm4gZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgaWYgKHNjb3BlLiRsYXN0KXtcbiAgICAgIGNvbnNvbGUubG9nKCdoaScpXG4gICAgfVxuICB9O1xufSlcbiIsImFuZ3VsYXIubW9kdWxlKCdzb2NpYWxTZXJ2aWNlJywgWydkYXRhU2VydmljZSddKVxuXG4gIC8vIE1ha2VzIGNhbGxzIHRvIG91ciBBUEksIHdoaWNoIGhpdHMgdHdpdHRlci5cbiAgLy8gVGhpcyBzaG91bGQgYmUgY2hhbmdlZCB0byBzb21ldGhpbmcgbGlrZSAnZ2V0IHR3ZWV0cydcbiAgLy8gQW5kIGl0IGp1c3QgdGhyb3dzIHVwIGEgYnVuY2ggb2YgdHdlZXRzIHRvIHNob3cgdGhlIHVzZXIsXG4gIC8vIGFuZCB3ZSBjYWNoZSB0aGUgYXBpIGNhbGxzIG9uIHRoZSBiYWNrZW5kXG5cbiAgLmZhY3RvcnkoJ1R3aXR0ZXInLCBmdW5jdGlvbiAoJGh0dHAsIFRlYW0pIHtcbiAgICB2YXIgdHdpdHRlckZhY3RvcnkgPSB7fVxuXG4gICAgdHdpdHRlckZhY3RvcnkudGVzdCA9IGZ1bmN0aW9uICgpe1xuICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS90dy90ZXN0JylcbiAgICB9XG5cbiAgICB0d2l0dGVyRmFjdG9yeS5zZWFyY2ggPSBmdW5jdGlvbiAodGVhbUlkKSB7XG4gICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL3R3L3NlYXJjaC8nICsgdGVhbUlkKVxuICAgIH1cblxuICAgIHR3aXR0ZXJGYWN0b3J5LmdldE9uZSA9IGZ1bmN0aW9uIChpZCkge1xuICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS90dy9nZXRPbmUvJyArIGlkKVxuICAgIH1cblxuICAgIC8vIHR3aXR0ZXJGYWN0b3J5LnRpbWVsaW5lID0gZnVuY3Rpb24gKHRlYW1Db2RlKSB7XG4gICAgLy8gICB2YXIgaGFzaCA9IHRlYW1IYXNoKHRlYW1Db2RlKVxuICAgIC8vICAgY29uc29sZS5sb2coaGFzaClcbiAgICAvLyAgIHZhciBwYXJ0T25lID0gJzxhIGNsYXNzPVwidHdpdHRlci10aW1lbGluZVwiIGhyZWY9XCJodHRwczovL3R3aXR0ZXIuY29tL2hhc2h0YWcvJ1xuICAgIC8vICAgdmFyIHBhcnRUd28gPSAnXCIgZGF0YS13aWRnZXQtaWQ9XCI3MDk3OTEyMTE5NDc2MzA1OTJcIj4jJ1xuICAgIC8vICAgdmFyIHBhcnRUaHJlZSA9IFwiVHdlZXRzPC9hPiA8c2NyaXB0PiFmdW5jdGlvbihkLHMsaWQpe3ZhciBqcyxmanM9ZC5nZXRFbGVtZW50c0J5VGFnTmFtZShzKVswXSxwPS9eaHR0cDovLnRlc3QoZC5sb2NhdGlvbik/J2h0dHAnOidodHRwcyc7aWYoIWQuZ2V0RWxlbWVudEJ5SWQoaWQpKXtqcz1kLmNyZWF0ZUVsZW1lbnQocyk7anMuaWQ9aWQ7anMuc3JjPXArJzovL3BsYXRmb3JtLnR3aXR0ZXIuY29tL3dpZGdldHMuanMnO2Zqcy5wYXJlbnROb2RlLmluc2VydEJlZm9yZShqcyxmanMpO319KGRvY3VtZW50LCdzY3JpcHQnLCd0d2l0dGVyLXdqcycpOzwvc2NyaXB0PlwiXG4gICAgLy9cbiAgICAvLyAgIGNvbnNvbGUubG9nKHBhcnRPbmUgKyBoYXNoICsgcGFydFR3byArIGhhc2ggKyBwYXJ0VGhyZWUpO1xuICAgIC8vXG4gICAgLy8gICByZXR1cm4gcGFydE9uZSArIGhhc2ggKyBwYXJ0VHdvICsgaGFzaCArIHBhcnRUaHJlZVxuICAgIC8vIH1cblxuICAgIGZ1bmN0aW9uIHRlYW1IYXNoICh0ZWFtQ29kZSkge1xuICAgICAgdGVhbUNvZGUgPSB0ZWFtQ29kZS50b0xvd2VyQ2FzZSgpXG4gICAgICBjb25zb2xlLmxvZyh0ZWFtQ29kZSlcbiAgICAgIHZhciBsb29rdXAgPSB7XG4gICAgICAgICdzd2EnIDogJ1N3YW5zZWFDaXR5JyxcbiAgICAgICAgJ2NyeScgOiAnY3BmYydcbiAgICAgIH1cbiAgICAgIHJldHVybiBsb29rdXBbdGVhbUNvZGVdXG4gICAgfVxuXG4gICAgcmV0dXJuIHR3aXR0ZXJGYWN0b3J5XG4gIH0pXG4iLCJhbmd1bGFyLm1vZHVsZSgndXNlclNlcnZpY2UnLCBbJ2F1dGhTZXJ2aWNlJ10pXG5cbiAgLmZhY3RvcnkoJ1VzZXInLCBmdW5jdGlvbigkaHR0cCwgQXV0aFRva2VuLCAkcSl7XG4gICAgdmFyIHVzZXJGYWN0b3J5ID0ge31cblxuICAgIC8vIGdldCBzaW5nbGUgdXNlclxuICAgIHVzZXJGYWN0b3J5LmdldCA9IGZ1bmN0aW9uIChpZCkge1xuICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS91c2Vycy8nICsgaWQpXG4gICAgfVxuXG4gICAgLy8gZ2V0IGFsbCB1c2Vyc1xuICAgIHVzZXJGYWN0b3J5LmFsbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvdXNlcnMnKVxuICAgIH1cblxuICAgIC8vIGNyZWF0ZSB1c2VyXG4gICAgdXNlckZhY3RvcnkuY3JlYXRlID0gZnVuY3Rpb24gKHVzZXJEYXRhKSB7XG4gICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS91c2VycycsIHVzZXJEYXRhKVxuICAgIH1cblxuICAgIC8vIHVwZGF0ZSB1c2VyXG4gICAgdXNlckZhY3RvcnkudXBkYXRlID0gZnVuY3Rpb24gKGlkLCB1c2VyRGF0YSkge1xuICAgICAgcmV0dXJuICRodHRwLnB1dCgnL2FwaS91c2Vycy8nICsgaWQsIHVzZXJEYXRhKVxuICAgIH1cblxuICAgIC8vIGRlbGV0ZSB1c2VyXG4gICAgdXNlckZhY3RvcnkuZGVsZXRlID0gZnVuY3Rpb24gKGlkKSB7XG4gICAgICByZXR1cm4gJGh0dHAuZGVsZXRlKCcvYXBpL3VzZXJzLycgKyBpZClcbiAgICB9XG5cbiAgICB1c2VyRmFjdG9yeS5wcm9maWxlID0gZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKEF1dGhUb2tlbi5nZXRUb2tlbigpKVxuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL21lJylcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuICRxLnJlamVjdCh7bWVzc2FnZTogJ1VzZXIgaGFzIG5vIHRva2VuLid9KVxuICAgIH1cblxuICAgIHVzZXJGYWN0b3J5LnByb2ZpbGUoKVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdwcm9maWxlIHJlc3BvbnNlJywgcmVzcC5kYXRhKVxuICAgICAgfSlcblxuICAgIHJldHVybiB1c2VyRmFjdG9yeVxuICB9KVxuIiwiYW5ndWxhci5tb2R1bGUoJ2Rhc2hDdHJsJywgWydkYXRhU2VydmljZScsJ2F1dGhTZXJ2aWNlJywndXNlclNlcnZpY2UnXSlcblxuICAuY29udHJvbGxlcignZGFzaENvbnRyb2xsZXInLCBmdW5jdGlvbiAoQXV0aCwgVXNlciwgJGFuY2hvclNjcm9sbCwgJGxvY2F0aW9uLCAkdGltZW91dCwgVGFibGUsIFRlYW0pIHtcbiAgICB2YXIgdm0gPSB0aGlzO1xuICAgIHZtLm9uT2ZmID0gZmFsc2VcbiAgICB2bS5kYXNoRnJhbWVzID0gW1xuICAgICAge1xuICAgICAgICBpZDogJ25ld3MnLFxuICAgICAgICBuYW1lOiAnTmV3cycsXG4gICAgICAgIGhyZWY6ICdhbmd1bGFyL3ZpZXdzL3BhZ2VzL2Rhc2gvcnNzLmh0bWwnXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBpZDogJ3NjaGVkdWxlJyxcbiAgICAgICAgbmFtZTogJ1NjaGVkdWxlJyxcbiAgICAgICAgaHJlZjogJ2FuZ3VsYXIvdmlld3MvcGFnZXMvZGFzaC9zY2hlZHVsZS5odG1sJ1xuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgaWQ6ICd0YWJsZScsXG4gICAgICAgIG5hbWU6ICdUYWJsZScsXG4gICAgICAgIGhyZWY6ICdhbmd1bGFyL3ZpZXdzL3BhZ2VzL2Rhc2gvdGFibGUuaHRtbCdcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGlkOiAnc29jaWFsJyxcbiAgICAgICAgbmFtZTogJ1NvY2lhbCcsXG4gICAgICAgIGhyZWY6ICdhbmd1bGFyL3ZpZXdzL3BhZ2VzL2Rhc2gvc29jaWFsLmh0bWwnXG4gICAgICB9XG4gICAgXVxuXG4gICAgLy8gVE9ETzogZ2V0IHRoaXMgb3V0IG9mIHRoZSBjb250cm9sbGVyLCBtb3ZlIGl0IHRvIGEgZmFjdG9yeSBzbyB0aGF0IG11bHRpcGxlXG4gICAgLy8gY29udHJvbGxlcnMgaGF2ZSBhY2Nlc3MgdG8gdGhpcyBkYXRhXG4gICAgVXNlci5wcm9maWxlKClcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3ApIHtcbiAgICAgICAgdm0udGVhbVByZWYgPSByZXNwLmRhdGFcbiAgICAgICAgVGVhbS5kYXRhKHJlc3AuZGF0YS50ZWFtUHJlZilcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXNwKSB7XG4gICAgICAgICAgICB2bS51c2VyVGVhbSA9IHJlc3AuZGF0YVxuICAgICAgICAgICAgdmFyIGluZGV4ID0gLTE7XG4gICAgICAgICAgICAvLyB2bS50YWJsZS5zdGFuZGluZy5mb3JFYWNoKGZ1bmN0aW9uKGN1ciwgaSkge1xuICAgICAgICAgICAgLy8gICBjb25zb2xlLmxvZyhjdXIudGVhbU5hbWUsIHZtLnVzZXJUZWFtLm5hbWUpO1xuICAgICAgICAgICAgLy8gICBpZiAoY3VyLnRlYW1OYW1lID09PSB2bS51c2VyVGVhbS5uYW1lKVxuICAgICAgICAgICAgLy8gICAgIHZtLnRhYmxlSW5kZXggPSBpXG4gICAgICAgICAgICAvLyB9KVxuICAgICAgICAgIH0pXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCd0ZWFtUHJlZicsdm0udGVhbVByZWYpXG4gICAgICB9KVxuXG4gICAgICAvLyBUT0RPOiBUaGlzIHNob3VsZCBiZSBtb3ZlZCBvdXQgb2YgdGhlIGNvbnRyb2xsZXIsIGJ1dCBubyB0aW1lIGZvciB0aGF0IG5vd1xuICAgICAgLy8gVGFibGUuZGF0YSgpXG4gICAgICAvLyAudGhlbihmdW5jdGlvbiAocmVzcCkge1xuICAgICAgICB2bS50YWJsZSA9IFRhYmxlLnRhYmxlXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCd0YWJsZScsIHZtLnRhYmxlKVxuICAgICAgLy8gfSlcblxuICAgICAgLy8gdmFyIGluaXRUYWJsZVNjcm9sbCA9IGZ1bmN0aW9uKCl7XG4gICAgICAvLyAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgLy8gICAgIC8vICRsb2NhdGlvbi5oYXNoKCdyb3cnK1RhYmxlLnVzZXJTdGFuZGluZylcbiAgICAgIC8vICAgICAvLyAkYW5jaG9yU2Nyb2xsKClcbiAgICAgIC8vICAgICAvLyBjb25zb2xlLmxvZyhUYWJsZS51c2VyU3RhbmRpbmcpXG4gICAgICAvLyAgIH0sIDEwMDApXG4gICAgICAvLyB9XG5cbiAgICAgIC8vIGNvbnNvbGUubG9nKFRhYmxlLnVzZXJTdGFuZGluZylcblxuICAgIHZtLmFjdGl2ZUZyYW1lID0gdm0uYWN0aXZlRnJhbWUgfHwgJ25ld3MnO1xuICAgIHZtLnNldEFjdGl2ZSA9IGZ1bmN0aW9uIChmcmFtZSkge1xuICAgICAgdm0uYWN0aXZlRnJhbWUgPSBmcmFtZVxuICAgICAgLy8gY29uc29sZS5sb2coZnJhbWUpXG4gICAgICAvLyBUT0RPOiBtYWtlIHRoaXMgZmlyZSBhcyBwYXJ0IG9mIHRoZSBuZy1lbnRlciAob3Igd2hhdGV2ZXIpIGZvciB0aGUgb3RoZXIgY3RybHNcbiAgICAgIC8vICBvciB0aGVpciBlbGVtZW50cy4uLiBva2F5LCBzbyBsaWtlLCBpdCBuZWVkcyBib3RoIGFuY2hvciBzY3JvbGxzPyBub3QgY2xlYXIgd2h5XG4gICAgICAvLyBET05FOiBJIHRoaW5rIGkndmUgZ290dGVuIGl0IGZpZ3VyZWQgb3V0IC0tIGl0IG5lZWRzIHRvIGxvb2sgbGlrZSB0aGlzLiBHb29kLlxuICAgICAgLy8gVGhlIHByb2JsZW0gbm93IGlzIHRoYXQgaXQncyBnb3QgYSB0b24gb2YgYWpheCBjYWxscywgdGhhdCBhbGwgbmVlZCB0byBiZSBtb3ZlZCBiYWNrd2FyZHNcbiAgICAgIGlmIChmcmFtZSA9PT0gJ3RhYmxlJyl7XG4gICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICRhbmNob3JTY3JvbGwoJ3JvdycgKyBUYWJsZS51c2VyU3RhbmRpbmcpXG4gICAgICAgIH0sIDApXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdiYW5nJylcbiAgICAgIH0gZWxzZSBpZiAoZnJhbWUgPT09ICdzY2hlZHVsZScpIHtcbiAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgJGFuY2hvclNjcm9sbC55T2Zmc2V0ID0gMjUwO1xuICAgICAgICAgICRhbmNob3JTY3JvbGwoJ21hdGNoJyArIFRhYmxlLm1hdGNoZGF5KVxuICAgICAgICB9LCAwKVxuICAgICAgfVxuICAgIH1cbiAgICAvLyAkKCdib2R5Jykuc2Nyb2xsVG9wKDEwMDApXG4gICAgLy8gTkI6IEZvciBnZXR0aW5nIHRoZSB0YWJsZSBzY3JvbGwgdG8gd29yay4gdGltZW91dCB0byBtYWtlIHN1cmUgdGhhdCB0aGUgbmctcmVwZWF0IGlzIGRvbmVcbiAgICAvLyBtYWtlXG4gICAgLy8gYWFhYWFhbmQgaXQgd29ya3MhXG4gICAgLy8gVGhpcyBsb29rcyBsaWtlIGRlYWQgY29kZSBoZXJlP1xuICAgIC8vICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgIC8vICAgLy8gJGxvY2F0aW9uLmhhc2goJ3JvdzE1JylcbiAgICAvLyAgIC8vICRhbmNob3JTY3JvbGwoKVxuICAgIC8vIH0sIDIwMDApXG5cbiAgfSlcblxuXG5cbiAgLmNvbnRyb2xsZXIoJ3Jzc0NvbnRyb2xsZXInLCBmdW5jdGlvbiAoUnNzLCBVc2VyKSB7XG4gICAgdmFyIHZtID0gdGhpcztcbiAgICB2bS5hY3RpdmVDYXJkO1xuXG4gICAgdm0uc2V0QWN0aXZlID0gZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICAvLyBpZiB0aGV5J3JlIGNsaWNraW5nIG9uIHRoZSBhY3RpdmUgY2FyZCwgY2xvc2UgaXRcbiAgICAgIHZtLmFjdGl2ZUNhcmQgPSB2bS5hY3RpdmVDYXJkICE9PSBpbmRleCA/IGluZGV4IDogbnVsbFxuICAgICAgY29uc29sZS5sb2codm0uYWN0aXZlQ2FyZClcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBJIGNhbid0IGZpbmQgYSB3YXkgdG8gZG8gdGhpcyBpbiB0aGUgZGFzaCBjcnRsIGFuZCBwYXNzIGl0LFxuICAgIC8vICAgICBzbyBpJ20gZG9pbmcgaXQgaW4gZWFjaCBjb250cm9sbGVyIDovXG4gICAgVXNlci5wcm9maWxlKClcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3ApIHtcbiAgICAgICAgdm0udGVhbVByZWYgPSByZXNwLmRhdGEudGVhbVByZWZcbiAgICAgICAgUnNzLnRlYW1GZWVkKHZtLnRlYW1QcmVmKVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3ApIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCd0ZWFtZmVlZCByZXNwJywgcmVzcC5kYXRhKVxuICAgICAgICAgICAgdm0uZmVlZCA9IHJlc3AuZGF0YVxuICAgICAgICAgIH0pXG4gICAgfSlcbiAgfSlcblxuICAuY29udHJvbGxlcignc2NoZWR1bGVDb250cm9sbGVyJywgZnVuY3Rpb24gKFNjaGVkdWxlLCBVc2VyLCBUZWFtLCBUYWJsZSkge1xuICAgIHZhciB2bSA9IHRoaXM7XG4gICAgLy8gdm0udGFibGUgPSBUYWJsZS50YWJsZVxuICAgIC8vIHZtLm1hdGNoZGF5ID0gVGFibGUudGFibGUubWF0Y2hkYXlcbiAgICB2bS5sb2cgPSBmdW5jdGlvbih2YWwpIHtjb25zb2xlLmxvZyh2YWwpO31cblxuICAgIHZtLnNldENsYXNzZXMgPSBmdW5jdGlvbihmaXh0dXJlKSB7XG4gICAgICB2YXIgb3V0ID0ge1xuICAgICAgICAncGxheWVkJyA6IGZhbHNlLFxuICAgICAgICAnZnV0dXJlJyA6IGZhbHNlLFxuICAgICAgICAnd29uJyA6IGZhbHNlLFxuICAgICAgICAnbG9zdCcgOiBmYWxzZSxcbiAgICAgICAgJ2RyYXcnIDogZmFsc2UsXG4gICAgICB9XG4gICAgICAvLyBUT0RPOiBkbyB0aGlzIGVsZWdhbnRcbiAgICAgIHZhciBob21lR29hbHMgPSBmaXh0dXJlLnJlc3VsdC5nb2Fsc0hvbWVUZWFtXG4gICAgICB2YXIgYXdheUdvYWxzID0gZml4dHVyZS5yZXN1bHQuZ29hbHNBd2F5VGVhbVxuICAgICAgdmFyIGhvbWVOYW1lID0gZml4dHVyZS5ob21lVGVhbU5hbWVcbiAgICAgIHZhciBhd2F5TmFtZSA9IGZpeHR1cmUuYXdheVRlYW1OYW1lXG4gICAgICB2YXIgdXNlckdvYWxzO1xuICAgICAgdmFyIG9wcEdvYWxzO1xuICAgICAgLy8gY29uc29sZS5sb2coJ3VzZXJ0ZWFtJywgdm0udXNlclRlYW0pXG4gICAgICBpZiAodm0udXNlclRlYW0pIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coZml4dHVyZSlcbiAgICAgICAgaWYgKHZtLnVzZXJUZWFtLm5hbWUgPT09IGhvbWVOYW1lKSB7XG4gICAgICAgICAgdXNlckdvYWxzID0gaG9tZUdvYWxzXG4gICAgICAgICAgb3BwR29hbHMgPSBhd2F5R29hbHNcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB1c2VyR29hbHMgPSBhd2F5R29hbHNcbiAgICAgICAgICBvcHBHb2FscyA9IGhvbWVHb2Fsc1xuICAgICAgICB9XG4gICAgICAgIC8vIEJlZm9yZSB0aGlzIHdhcyBkb25lIHcvIHRoZSBzdGF0dXMgY29kZXMsIGJ1dCB0aG9zZSBkb24ndCBzZWVtIHRvIG1lYW5cbiAgICAgICAgLy8gYW55dGhpbmcgYW5kIGFyZW4ndCBjb25zaXN0ZW50XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGhvbWVOYW1lLCAnLScsIGF3YXlOYW1lLCBob21lR29hbHMgPT09IG51bGwpXG4gICAgICAgIG91dC5mdXR1cmUgPSBob21lR29hbHMgPT09IG51bGw7XG4gICAgICAgIG91dC5wbGF5ZWQgPSAhb3V0LmZ1dHVyZVxuXG4gICAgICAgIGlmIChvdXQucGxheWVkID09PSB0cnVlKSB7XG4gICAgICAgICAgLy8gY29uc29sZS5sb2coJ2ZpcmVkJylcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZyhob21lTmFtZSwgJy0nLCBhd2F5TmFtZSwgaG9tZUdvYWxzLCBhd2F5R29hbHMsIGhvbWVHb2FscyA9PT0gYXdheUdvYWxzIClcbiAgICAgICAgICBpZiAoaG9tZUdvYWxzID09PSBhd2F5R29hbHMpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdiYW5nJylcbiAgICAgICAgICAgIG91dC5kcmF3ID0gdHJ1ZVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvdXQud29uID0gdXNlckdvYWxzID4gb3BwR29hbHNcbiAgICAgICAgICAgIG91dC5sb3N0ID0gIW91dC53b25cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBvdXRcbiAgICB9XG5cblxuICAgIFVzZXIucHJvZmlsZSgpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXNwKSB7XG4gICAgICAgIHZtLnRlYW1QcmVmID0gcmVzcC5kYXRhLnRlYW1QcmVmXG4gICAgICAgIFNjaGVkdWxlLnRlYW0odm0udGVhbVByZWYpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3ApIHtcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZygndGVhbSBzY2hlZCcsIHJlc3AuZGF0YSlcbiAgICAgICAgICB2bS5zY2hlZHVsZSA9IHJlc3AuZGF0YVxuICAgICAgICB9KVxuICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAvLyBUT0RPOiBwYXNzIGZ1bGwgbmFtZSBhbG9uZyB3aXRoIHRoZSB0ZWFtIHByZWYodGhpcyBhcGkgYmxvd3MpXG4gICAgICAgICAgcmV0dXJuIFRlYW0uZGF0YSh2bS50ZWFtUHJlZilcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3ApIHtcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZygndGVhbSBkYXRhIHJlc3AnLCByZXNwLmRhdGEpXG4gICAgICAgICAgdm0udXNlclRlYW0gPSByZXNwLmRhdGFcbiAgICAgICAgfSlcbiAgICAgICAgLy8gdm0ubWF0Y2hkYXkgPSB2bS50YWJsZS5tYXRjaGRheVxuICAgIH0pXG4gICAgVGVhbS5sb2dvcygpXG4gICAgLnRoZW4oZnVuY3Rpb24ocmVzcCkge1xuICAgICAgdm0ubG9nb3MgPSByZXNwLmRhdGFcbiAgICAgIC8vIGNvbnNvbGUubG9nKHZtLmxvZ29zKVxuICAgIH0pXG4gICAgVGFibGUuZGF0YSgpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXNwKSB7XG4gICAgICAgIHZtLnRhYmxlID0gcmVzcC5kYXRhXG4gICAgICB9KVxuXG4gIH0pXG5cbiAgLmNvbnRyb2xsZXIoJ3RhYmxlQ29udHJvbGxlcicsIGZ1bmN0aW9uIChUYWJsZSwgVXNlciwgVGVhbSwgJGxvY2F0aW9uKSB7XG4gICAgdmFyIHZtID0gdGhpc1xuICAgIHZtLnVzZXJUZWFtID0ge31cbiAgICB2bS5hY3RpdmVUZWFtID0gZnVuY3Rpb24gKHRlYW1OYW1lKSB7XG4gICAgICByZXR1cm4gdGVhbU5hbWUgPT09IHZtLnVzZXJUZWFtLm5hbWVcbiAgICB9XG5cbiAgICBVc2VyLnByb2ZpbGUoKVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcCkge1xuICAgICAgICB2bS50ZWFtUHJlZiA9IHJlc3AuZGF0YS50ZWFtUHJlZlxuICAgICAgICByZXR1cm4gcmVzcC5kYXRhLnRlYW1QcmVmXG4gICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3ApIHtcbiAgICAgICAgcmV0dXJuIFRlYW0uZGF0YShyZXNwKVxuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICB2bS51c2VyVGVhbSA9IHJlc3AuZGF0YVxuICAgICAgICByZXR1cm4gdm0udXNlclRlYW1cbiAgICAgICAgY29uc29sZS5sb2coJ3VzZXIgdGVhbScsdm0udXNlclRlYW0pXG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3ApIHtcbiAgICAgICAgLy8gVGhpcyB0aGVuIGNhbGwgaXMgdmVzdGlnaWFsXG4gICAgICAgIHZtLnRhYmxlID0gVGFibGUudGFibGVcbiAgICAgIH0pXG5cbiAgICAgIHZtLm9mZnNldCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gJCgnLmxlYWd1ZS10YWJsZScpLm91dGVyV2lkdGgoKVxuICAgICAgfVxuXG4gIH0pXG5cbiAgLmNvbnRyb2xsZXIoJ3NvY2lhbENvbnRyb2xsZXInLCBmdW5jdGlvbiAoVXNlciwgVGVhbSwgVHdpdHRlciwgJHNjZSkge1xuICAgIHZhciB2bSA9IHRoaXNcbiAgICBUd2l0dGVyLnRlc3QoKVxuICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3ApIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2cocmVzcC5kYXRhKVxuICAgICAgICAvLyB2bS50d2VldHMgPSAkc2NlLnRydXN0QXNIdG1sKHJlc3AuZGF0YS5odG1sKVxuICAgICAgfSlcbiAgICB2bS5lbmNvZGVkVHdlZXRzID0gW11cbiAgICBVc2VyLnByb2ZpbGUoKVxuICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3ApIHtcbiAgICAgICAgcmV0dXJuIHJlc3AuZGF0YS50ZWFtUHJlZlxuICAgICAgICAvLyB2bS50aW1lbGluZSA9ICRzY2UudHJ1c3RBc0h0bWwoVHdpdHRlci50aW1lbGluZShyZXNwLmRhdGEudGVhbVByZWYpKVxuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uICh0ZWFtUHJlZikge1xuICAgICAgICByZXR1cm4gVHdpdHRlci5zZWFyY2godGVhbVByZWYpXG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24gKHN0cmVhbSkge1xuICAgICAgICB2bS50d2VldHMgPSBzdHJlYW0uZGF0YS5zdGF0dXNlc1xuICAgICAgICAvLyB2bS50d2VldHMgPSB2bS50d2VldHMubWFwKGN1ciA9PiBjdXIuaWQpXG4gICAgICAgIGNvbnNvbGUubG9nKHZtLnR3ZWV0cylcbiAgICAgICAgcmV0dXJuIHZtLnR3ZWV0c1xuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uICh0d2VldHMpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ3R3ZWV0cycsdHdlZXRzKVxuICAgICAgICAvLyByZXR1cm4gVHdpdHRlci5nZXRPbmUodHdlZXRzWzBdLmlkX3N0cilcbiAgICAgICAgdHdlZXRzLmZvckVhY2goZnVuY3Rpb24gKGN1cikge1xuICAgICAgICAgIFR3aXR0ZXIuZ2V0T25lKGN1ci5pZF9zdHIpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXNwKSB7XG4gICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdnZXRvbmUgcmVzcG9uc2UnLCByZXNwKVxuICAgICAgICAgICAgICB2bS5lbmNvZGVkVHdlZXRzLnB1c2goICRzY2UudHJ1c3RBc0h0bWwocmVzcC5kYXRhLmh0bWwpKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ2VuY29kZWQnLHZtLmVuY29kZWRUd2VldHMpXG4gICAgICB9KVxuICAgICAgLy8gLnRoZW4oZnVuY3Rpb24gKHR3ZWV0KSB7XG4gICAgICAvLyAgIGNvbnNvbGUubG9nKCd0d2VldCcsIHR3ZWV0KVxuICAgICAgLy8gICB2bS50d2VldCA9ICRzY2UudHJ1c3RBc0h0bWwodHdlZXQuZGF0YS5odG1sKVxuICAgICAgLy8gfSlcblxuICAgIC8vIFR3aXR0ZXIudGltZWxpbmUoKVxuICAgIC8vICAgLnRoZW4oZnVuY3Rpb24gKHJlc3ApIHtcbiAgICAvLyAgICAgY29uc29sZS5sb2cocmVzcClcbiAgICAvLyAgICAgdm0udGltZWxpbmUgPSAkc2NlLnRydXN0QXNIdG1sKHJlc3ApXG4gICAgLy8gICB9KVxuICB9KVxuIiwiLy8gQ29udHJvbGxlciBmb3IgdGhlIG92ZXJhcmNoaW5nIHBhZ2VcbmFuZ3VsYXIubW9kdWxlKCdtYWluQ3RybCcsIFtdKVxuXG4uY29udHJvbGxlcignbWFpbkNvbnRyb2xsZXInLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkbG9jYXRpb24sIEF1dGgsIFVzZXIpIHtcblxuXHR2YXIgdm0gPSB0aGlzO1xuXG5cdHZtLmF0SG9tZSA9IGZ1bmN0aW9uICgpIHtcblx0XHRjb25zb2xlLmxvZygpXG5cdFx0cmV0dXJuICRsb2NhdGlvbi5wYXRoKCkgPT09ICcvJyB8fCAkbG9jYXRpb24ucGF0aCgpID09PSAnJ1xuXHR9XG5cdHZtLmF0U2lnbnVwID0gZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiAkbG9jYXRpb24ucGF0aCgpID09PSAnL3NpZ251cCcgLy98fCAkbG9jYXRpb24ucGF0aCgpID09PSAnJ1xuXHR9XG5cbi8vIEl0J3Mgc2lsbHkgdG8gY2FsbCB0aGlzIGFsbCB0aGUgdGltZSwganVzdCBpbiBjYXNlIGl0J3MgbmVlZGVkLCBidXQgaXQncyBsYXRlIGFuZCBpJ20gdGlyZWRcbi8vIGFuZCB0aGlzIG5lZWRzIHRvIGdldCBkb25lIGluIHZlcnkgbGl0dGxlIHRpbWUuXG4vLyBUT0RPOiBNYWtlIHRoaXMgcmVxdWVzdCBsb2dpY2FsIGFuZCBlZmZpY2llbnQgKGllLCBtYWtlIGl0IG9ubHkgb25jZSlcblx0VXNlci5wcm9maWxlKClcblx0XHQudGhlbihmdW5jdGlvbihyZXNwKSB7XG5cdFx0XHR2bS50ZWFtUHJlZiA9IHJlc3AuZGF0YS50ZWFtUHJlZlxuXHR9KVxuXG4vLyBUT0RPOiBtb3ZlIHRoaXMgY2FsbCB0byBhIGZhY3RvcnkgYW5kIHRoZSB1cmxzIHRvIHRoZSBiYWNrZW5kXG5cdHZtLmJVcmwgPSBmdW5jdGlvbiAoKSB7XG5cdFx0Ly8gY29uc29sZS5sb2coJ2ZpcmVkJylcblx0XHQvLyBUdXJucyBvdXQgcGljdHVyZXMgbG9vayBiYWQgYmVoaW5kIHRoZSBkYXNoXG5cdFx0Ly8gaWYgKCRsb2NhdGlvbi5wYXRoKCkgPT09ICcvZGFzaCcpe1xuXHRcdC8vIFx0cmV0dXJuIHRlYW1EYXNoSW1nKHZtLnRlYW1QcmVmKVxuXHRcdC8vIH1cblx0XHR2YXIgcGljcyA9IHtcblx0XHRcdGdpcmw6ICdodHRwczovL2MyLnN0YXRpY2ZsaWNrci5jb20vNC8zNDU1LzM3OTA1OTA0ODBfNGJiNWM2OTQ5NV9iLmpwZycsXG5cdFx0XHRzdE1hcnlzIDogJ2h0dHBzOi8vYzIuc3RhdGljZmxpY2tyLmNvbS8yLzE1NjAvMjM3OTI5ODM1NDRfZDkwODk3NTExNV96LmpwZycsXG5cdFx0XHRsaWdodHMgOiAnaHR0cHM6Ly9jMi5zdGF0aWNmbGlja3IuY29tLzgvNzQyMi8xMjY3Njc3MjE5NF8zMDUzYjNlZWVkX2IuanBnJyxcblx0XHRcdGNoYW1wcyA6ICdodHRwczovL3VwbG9hZC53aWtpbWVkaWEub3JnL3dpa2lwZWRpYS9jb21tb25zLzMvM2EvV2VzdF9TdGFuZF9DaGFtcGlvbnMuanBnJ1xuXHRcdH1cblx0XHR2YXIgdXJscyA9IHtcblxuXHRcdFx0Jy9zaWdudXAnOnBpY3Muc3RNYXJ5cyxcblx0XHRcdCcvJyA6IHBpY3MuY2hhbXBzLFxuXHRcdFx0Jy9kYXNoJyA6ICcnLFxuXHRcdFx0Jy9hYm91dCcgOiBwaWNzLmxpZ2h0c1xuXHRcdH1cblx0XHRpZiAodXJsc1skbG9jYXRpb24ucGF0aCgpXSA9PT0gdW5kZWZpbmVkKVxuXHRcdFx0Y29uc29sZS5lcnJvcignJysgJGxvY2F0aW9uLnBhdGgoKSArJyBiYWNrZ3JvdW5kIG5vdCBkZWZpbmVkJyk7XG5cdFx0cmV0dXJuIHVybHNbJGxvY2F0aW9uLnBhdGgoKV0gIT09IHVuZGVmaW5lZCA/IHVybHNbJGxvY2F0aW9uLnBhdGgoKV0gOiAnJ1xuXHR9XG5cblx0ZnVuY3Rpb24gdGVhbURhc2hJbWcgKHBhdGgpIHtcblx0XHRwYXRoID0gcGF0aC50b0xvd2VyQ2FzZSgpXG5cdFx0dmFyIGRlZmF1bHRJbWcgPSAnaHR0cHM6Ly9jMi5zdGF0aWNmbGlja3IuY29tLzIvMTU2MC8yMzc5Mjk4MzU0NF9kOTA4OTc1MTE1X3ouanBnJ1xuXHRcdHZhciB0ZWFtcyA9IHtcblx0XHRcdCdhZmMnIDogJ2h0dHBzOi8vYzIuc3RhdGljZmxpY2tyLmNvbS84Lzc0MjIvMTI2NzY3NzIxOTRfMzA1M2IzZWVlZF9iLmpwZydcblx0XHR9XG5cdFx0cmV0dXJuIHRlYW1zW3BhdGhdICE9PSB1bmRlZmluZWQgPyB0ZWFtc1twYXRoXSA6IGRlZmF1bHRJbWdcblx0fVxuXG5cdHZtLmhpZGVOYXYgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBjb25zb2xlLmxvZygnZmlyZWQnKVxuICAgICAgJCgnLmJ1dHRvbi1jb2xsYXBzZScpLnNpZGVOYXYoJ2hpZGUnKVxuICAgIH1cblxuXHQvLyBnZXQgaW5mbyBpZiBhIHBlcnNvbiBpcyBsb2dnZWQgaW5cblx0dm0ubG9nZ2VkSW4gPSBBdXRoLmlzTG9nZ2VkSW4oKTtcblx0aWYgKCRsb2NhdGlvbi5wYXRoKCkgPT09ICcvJyAmJiB2bS5sb2dnZWRJbilcblx0XHQkbG9jYXRpb24ucGF0aCgnL2Rhc2gnKVxuXG5cdC8vIGNoZWNrIHRvIHNlZSBpZiBhIHVzZXIgaXMgbG9nZ2VkIGluIG9uIGV2ZXJ5IHJlcXVlc3Rcblx0JHJvb3RTY29wZS4kb24oJyRyb3V0ZUNoYW5nZVN0YXJ0JywgZnVuY3Rpb24oKSB7XG5cdFx0dm0ubG9nZ2VkSW4gPSBBdXRoLmlzTG9nZ2VkSW4oKTtcblxuXHRcdC8vIGdldCB1c2VyIGluZm9ybWF0aW9uIG9uIHBhZ2UgbG9hZFxuXHRcdEF1dGguZ2V0VXNlcigpXG5cdFx0XHQudGhlbihmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHRcdHZtLnVzZXIgPSBkYXRhLmRhdGE7XG5cdFx0XHR9KVxuXHR9KTtcblxuXHQvLyBGb3IgZ3Vlc3QgbG9naW5cblx0dm0uZ3Vlc3QgPSBmdW5jdGlvbigpIHtcblx0XHR2bS5sb2dpbkRhdGEgPSB7fVxuXHRcdHZtLmxvZ2luRGF0YS51c2VybmFtZSA9ICdndWVzdCdcblx0XHR2bS5sb2dpbkRhdGEucGFzc3dvcmQgPSAncGFzc3dvcmQnXG5cdH1cblxuXHQvLyBmdW5jdGlvbiB0byBoYW5kbGUgbG9naW4gZm9ybVxuXHR2bS5kb0xvZ2luID0gZnVuY3Rpb24oKSB7XG5cdFx0dm0ucHJvY2Vzc2luZyA9IHRydWU7XG5cblx0XHR2bS5sb2dpbkRhdGEudXNlcm5hbWUgPSB2bS5sb2dpbkRhdGEudXNlcm5hbWUudG9Mb3dlckNhc2UoKVxuXG5cdFx0QXV0aC5sb2dpbih2bS5sb2dpbkRhdGEudXNlcm5hbWUsIHZtLmxvZ2luRGF0YS5wYXNzd29yZClcblx0XHRcdC50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcblx0XHRcdFx0dm0ucHJvY2Vzc2luZyA9IGZhbHNlO1xuXG5cdFx0XHRcdC8vIGlmIGEgdXNlciBzdWNjZXNzZnVsbHkgbG9ncyBpbiwgcmVkaXJlY3QgdG8gdXNlcnMgcGFnZVxuXHRcdFx0XHRpZiAoZGF0YS5zdWNjZXNzKVxuXHRcdFx0XHRcdCRsb2NhdGlvbi5wYXRoKCcvZGFzaCcpO1xuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0dm0uZXJyb3IgPSBkYXRhLm1lc3NhZ2U7XG5cblx0XHRcdH0pO1xuXHR9O1xuXG5cdC8vIGZ1bmN0aW9uIHRvIGhhbmRsZSBsb2dnaW5nIG91dFxuXHR2bS5kb0xvZ291dCA9IGZ1bmN0aW9uKCkge1xuXHRcdEF1dGgubG9nb3V0KCk7XG5cdFx0dm0udXNlciA9ICcnO1xuXG5cdFx0JGxvY2F0aW9uLnBhdGgoJy8nKTtcblx0fTtcblxuXG59KTtcbiIsImFuZ3VsYXIubW9kdWxlKCd1c2VyQ3RybCcsIFsndXNlclNlcnZpY2UnXSlcblxuLmNvbnRyb2xsZXIoJ3VzZXJDb250cm9sbGVyJywgZnVuY3Rpb24oVXNlcikge1xuXG5cdHZhciB2bSA9IHRoaXM7XG5cblx0Ly8gc2V0IGEgcHJvY2Vzc2luZyB2YXJpYWJsZSB0byBzaG93IGxvYWRpbmcgdGhpbmdzXG5cdHZtLnByb2Nlc3NpbmcgPSB0cnVlO1xuXG5cdC8vIGdyYWIgYWxsIHRoZSB1c2VycyBhdCBwYWdlIGxvYWRcblx0VXNlci5hbGwoKVxuXHRcdC5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEpIHtcblxuXHRcdFx0Ly8gd2hlbiBhbGwgdGhlIHVzZXJzIGNvbWUgYmFjaywgcmVtb3ZlIHRoZSBwcm9jZXNzaW5nIHZhcmlhYmxlXG5cdFx0XHR2bS5wcm9jZXNzaW5nID0gZmFsc2U7XG5cblx0XHRcdC8vIGJpbmQgdGhlIHVzZXJzIHRoYXQgY29tZSBiYWNrIHRvIHZtLnVzZXJzXG5cdFx0XHR2bS51c2VycyA9IGRhdGE7XG5cdFx0fSk7XG5cblx0Ly8gZnVuY3Rpb24gdG8gZGVsZXRlIGEgdXNlclxuXHR2bS5kZWxldGVVc2VyID0gZnVuY3Rpb24oaWQpIHtcblx0XHR2bS5wcm9jZXNzaW5nID0gdHJ1ZTtcblxuXHRcdFVzZXIuZGVsZXRlKGlkKVxuXHRcdFx0LnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSkge1xuXG5cdFx0XHRcdC8vIGdldCBhbGwgdXNlcnMgdG8gdXBkYXRlIHRoZSB0YWJsZVxuXHRcdFx0XHQvLyB5b3UgY2FuIGFsc28gc2V0IHVwIHlvdXIgYXBpXG5cdFx0XHRcdC8vIHRvIHJldHVybiB0aGUgbGlzdCBvZiB1c2VycyB3aXRoIHRoZSBkZWxldGUgY2FsbFxuXHRcdFx0XHRVc2VyLmFsbCgpXG5cdFx0XHRcdFx0LnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSkge1xuXHRcdFx0XHRcdFx0dm0ucHJvY2Vzc2luZyA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0dm0udXNlcnMgPSBkYXRhO1xuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHR9KTtcblx0fTtcblxufSlcblxuLy8gY29udHJvbGxlciBhcHBsaWVkIHRvIHVzZXIgY3JlYXRpb24gcGFnZVxuLmNvbnRyb2xsZXIoJ3VzZXJDcmVhdGVDb250cm9sbGVyJywgZnVuY3Rpb24oVXNlciwgVGVhbSwgJGxvY2F0aW9uLCAkdGltZW91dCwgQXV0aCwgQXV0aFRva2VuLCAkd2luZG93KSB7XG5cdHZhciB2bSA9IHRoaXM7XG5cblx0Ly8gdmFyaWFibGUgdG8gaGlkZS9zaG93IGVsZW1lbnRzIG9mIHRoZSB2aWV3XG5cdC8vIGRpZmZlcmVudGlhdGVzIGJldHdlZW4gY3JlYXRlIG9yIGVkaXQgcGFnZXNcblx0dm0udHlwZSA9ICdjcmVhdGUnO1xuXG5cdHZtLnVzZXJEYXRhID0geyAgfVxuXG5cdHZtLmxvZyA9IGZ1bmN0aW9uICh2YWwpIHtjb25zb2xlLmxvZygnbG9nOicsdmFsKTt9XG5cblx0VGVhbS5hbGwoKVxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlc3ApIHtcblx0XHRcdHZtLnRlYW1zID0gcmVzcC5kYXRhLnRlYW1zXG5cblx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAkKCdzZWxlY3QnKS5tYXRlcmlhbF9zZWxlY3QoKVxuICAgICAgfSwgMClcblxuXHRcdH0pXG5cblx0Ly8gZnVuY3Rpb24gdG8gY3JlYXRlIGEgdXNlclxuXHR2bS5zYXZlVXNlciA9IGZ1bmN0aW9uKCkge1xuXHRcdHZtLnByb2Nlc3NpbmcgPSB0cnVlO1xuXHRcdHZtLm1lc3NhZ2UgPSAnJztcblx0XHR2YXIgcGFzc3dvcmQgPSB2bS51c2VyRGF0YS5wYXNzd29yZFxuXHRcdC8vIHVzZSB0aGUgY3JlYXRlIGZ1bmN0aW9uIGluIHRoZSB1c2VyU2VydmljZVxuXHRcdFVzZXIuY3JlYXRlKHZtLnVzZXJEYXRhKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24ocmVzcCkge1xuXHRcdFx0XHR2bS5wcm9jZXNzaW5nID0gZmFsc2U7XG5cdFx0XHRcdHZtLnVzZXJEYXRhID0geyAgfVxuXHRcdFx0XHRyZXR1cm4gcmVzcC5kYXRhXG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcblx0XHRcdFx0QXV0aC5sb2dpbih1c2VyLnVzZXJuYW1lLCBwYXNzd29yZClcblx0XHRcdFx0XHQudGhlbihmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHRcdFx0XHR2bS5wcm9jZXNzaW5nID0gZmFsc2U7XG5cblx0XHRcdFx0XHRcdC8vIGlmIGEgdXNlciBzdWNjZXNzZnVsbHkgbG9ncyBpbiwgcmVkaXJlY3QgdG8gdXNlcnMgcGFnZVxuXHRcdFx0XHRcdFx0aWYgKGRhdGEuc3VjY2Vzcyl7XG5cdFx0XHRcdFx0XHRcdCRsb2NhdGlvbi5wYXRoKCcvZGFzaCcpO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdH0pXG5cblxuXG5cdH07XG5cbn0pXG5cbi8vIGNvbnRyb2xsZXIgYXBwbGllZCB0byB1c2VyIGVkaXQgcGFnZVxuLmNvbnRyb2xsZXIoJ3VzZXJFZGl0Q29udHJvbGxlcicsIGZ1bmN0aW9uKCRyb3V0ZVBhcmFtcywgVXNlcikge1xuXG5cdHZhciB2bSA9IHRoaXM7XG5cblx0Ly8gdmFyaWFibGUgdG8gaGlkZS9zaG93IGVsZW1lbnRzIG9mIHRoZSB2aWV3XG5cdC8vIGRpZmZlcmVudGlhdGVzIGJldHdlZW4gY3JlYXRlIG9yIGVkaXQgcGFnZXNcblx0dm0udHlwZSA9ICdlZGl0JztcblxuXHQvLyBnZXQgdGhlIHVzZXIgZGF0YSBmb3IgdGhlIHVzZXIgeW91IHdhbnQgdG8gZWRpdFxuXHQvLyAkcm91dGVQYXJhbXMgaXMgdGhlIHdheSB3ZSBncmFiIGRhdGEgZnJvbSB0aGUgVVJMXG5cdFVzZXIuZ2V0KCRyb3V0ZVBhcmFtcy51c2VyX2lkKVxuXHRcdC5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEpIHtcblx0XHRcdHZtLnVzZXJEYXRhID0gZGF0YTtcblx0XHR9KTtcblxuXHQvLyBmdW5jdGlvbiB0byBzYXZlIHRoZSB1c2VyXG5cdHZtLnNhdmVVc2VyID0gZnVuY3Rpb24oKSB7XG5cdFx0dm0ucHJvY2Vzc2luZyA9IHRydWU7XG5cdFx0dm0ubWVzc2FnZSA9ICcnO1xuXG5cdFx0Ly8gY2FsbCB0aGUgdXNlclNlcnZpY2UgZnVuY3Rpb24gdG8gdXBkYXRlXG5cdFx0VXNlci51cGRhdGUoJHJvdXRlUGFyYW1zLnVzZXJfaWQsIHZtLnVzZXJEYXRhKVxuXHRcdFx0LnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSkge1xuXHRcdFx0XHR2bS5wcm9jZXNzaW5nID0gZmFsc2U7XG5cblx0XHRcdFx0Ly8gY2xlYXIgdGhlIGZvcm1cblx0XHRcdFx0dm0udXNlckRhdGEgPSB7fTtcblxuXHRcdFx0fSk7XG5cdH07XG5cbn0pO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9

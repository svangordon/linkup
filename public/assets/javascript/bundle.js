'use strict';

angular.module('linkupRoutes', ['ngRoute'])

// configure our routes
.config(function ($routeProvider, $locationProvider) {
  $routeProvider
  // homepage
  .when('/', {
    templateUrl: 'public/html/pages/home.html'
    // , controller : 'homeController'
    // , controllerAs : 'home'
  })

  // route for about page
  .when('/about', {
    templateUrl: 'public/html/pages/about.html'
    // , controller : 'aboutController'
    // , controllerAs : 'about'
  })

  // login route
  .when('/login', {
    templateUrl: 'public/html/pages/login.html',
    controller: 'mainController',
    controllerAs: 'login'
  }).when('/dash', {
    templateUrl: 'public/html/pages/dash/dash.html',
    controller: 'dashController',
    controllerAs: 'vm'
  }).when('/signup', {
    templateUrl: 'public/html/pages/signup.html',
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

angular.module('dashCtrl', ['dataService', 'authService', 'userService']).controller('dashController', function (Auth, User, $anchorScroll, $location, $timeout, Table, Team) {
  var vm = this;
  vm.onOff = false;
  vm.dashFrames = [{
    id: 'news',
    name: 'News',
    href: 'public/html/views/pages/dash/rss.html'
  }, {
    id: 'schedule',
    name: 'Schedule',
    href: 'public/html/views/pages/dash/schedule.html'
  }, {
    id: 'table',
    name: 'Table',
    href: 'public/html/views/pages/dash/table.html'
  }, {
    id: 'social',
    name: 'Social',
    href: 'public/html/views/pages/dash/social.html'
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC1yb3V0ZXMuanMiLCJhcHAuanMiLCJjb250cm9sbGVycy9kYXNoQ3RybC5qcyIsImNvbnRyb2xsZXJzL21haW5DdHJsLmpzIiwiY29udHJvbGxlcnMvdXNlckN0cmwuanMiLCJzZXJ2aWNlcy9hdXRoU2VydmljZS5qcyIsInNlcnZpY2VzL2Rhc2hGaWx0ZXJzLmpzIiwic2VydmljZXMvZGF0YVNlcnZpY2UuanMiLCJzZXJ2aWNlcy9zaWdudXBEaXJlY3RpdmVzLmpzIiwic2VydmljZXMvc29jaWFsU2VydmljZS5qcyIsInNlcnZpY2VzL3VzZXJTZXJ2aWNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsUUFBUSxNQUFSLENBQWUsY0FBZixFQUErQixDQUFDLFNBQUQsQ0FBL0I7O0FBRUU7QUFGRixDQUdHLE1BSEgsQ0FHVSxVQUFTLGNBQVQsRUFBeUIsaUJBQXpCLEVBQTRDO0FBQ2xEO0FBQ0U7QUFERixHQUVHLElBRkgsQ0FFUSxHQUZSLEVBRWE7QUFDVCxpQkFBYztBQUNkO0FBQ0E7QUFIUyxHQUZiOztBQVFFO0FBUkYsR0FTRyxJQVRILENBU1EsUUFUUixFQVNrQjtBQUNkLGlCQUFjO0FBQ2Q7QUFDQTtBQUhjLEdBVGxCOztBQWVFO0FBZkYsR0FnQkcsSUFoQkgsQ0FnQlEsUUFoQlIsRUFnQmtCO0FBQ2QsaUJBQWMsOEJBREE7QUFFWixnQkFBYSxnQkFGRDtBQUdaLGtCQUFlO0FBSEgsR0FoQmxCLEVBc0JHLElBdEJILENBc0JRLE9BdEJSLEVBc0JpQjtBQUNiLGlCQUFhLGtDQURBO0FBRWIsZ0JBQVksZ0JBRkM7QUFHYixrQkFBYztBQUhELEdBdEJqQixFQTRCRyxJQTVCSCxDQTRCUSxTQTVCUixFQTRCbUI7QUFDZixpQkFBYSwrQkFERTtBQUVmLGdCQUFZLHNCQUZHO0FBR2Ysa0JBQWM7QUFIQyxHQTVCbkI7O0FBa0NFO0FBQ0YsTUFBSSxVQUFVLEtBQWQ7QUFDQSxNQUFJLENBQUMsT0FBTCxFQUFjLGtCQUFrQixTQUFsQixD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QixRQUF6QixDQUFQO0FBQ0QsR0FGRDs7QUFJQTtBQUNBLGNBQVksTUFBWixHQUFxQixVQUFVLEVBQVYsRUFBYyxRQUFkLEVBQXdCO0FBQzNDLFdBQU8sTUFBTSxHQUFOLENBQVUsZ0JBQWdCLEVBQTFCLEVBQThCLFFBQTlCLENBQVA7QUFDRCxHQUZEOztBQUlBO0FBQ0EsY0FBWSxNQUFaLEdBQXFCLFVBQVUsRUFBVixFQUFjO0FBQ2pDLFdBQU8sTUFBTSxNQUFOLENBQWEsZ0JBQWdCLEVBQTdCLENBQVA7QUFDRCxHQUZEOztBQUlBLGNBQVksT0FBWixHQUFzQixZQUFZO0FBQ2hDLFFBQUksVUFBVSxRQUFWLEVBQUosRUFDRSxPQUFPLE1BQU0sR0FBTixDQUFVLFNBQVYsQ0FBUCxDQURGLEtBR0UsT0FBTyxHQUFHLE1BQUgsQ0FBVSxFQUFDLFNBQVMsb0JBQVYsRUFBVixDQUFQO0FBQ0gsR0FMRDs7QUFPQSxjQUFZLE9BQVosR0FDRyxJQURILENBQ1EsVUFBUyxJQUFULEVBQWM7QUFDbEI7QUFDRCxHQUhIOztBQUtBLFNBQU8sV0FBUDtBQUNELENBM0NIIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImFuZ3VsYXIubW9kdWxlKCdsaW5rdXBSb3V0ZXMnLCBbJ25nUm91dGUnXSlcblxuICAvLyBjb25maWd1cmUgb3VyIHJvdXRlc1xuICAuY29uZmlnKGZ1bmN0aW9uKCRyb3V0ZVByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlcikge1xuICAgICRyb3V0ZVByb3ZpZGVyXG4gICAgICAvLyBob21lcGFnZVxuICAgICAgLndoZW4oJy8nLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsIDogJ3B1YmxpYy9odG1sL3BhZ2VzL2hvbWUuaHRtbCdcbiAgICAgICAgLy8gLCBjb250cm9sbGVyIDogJ2hvbWVDb250cm9sbGVyJ1xuICAgICAgICAvLyAsIGNvbnRyb2xsZXJBcyA6ICdob21lJ1xuICAgICAgfSlcblxuICAgICAgLy8gcm91dGUgZm9yIGFib3V0IHBhZ2VcbiAgICAgIC53aGVuKCcvYWJvdXQnLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsIDogJ3B1YmxpYy9odG1sL3BhZ2VzL2Fib3V0Lmh0bWwnXG4gICAgICAgIC8vICwgY29udHJvbGxlciA6ICdhYm91dENvbnRyb2xsZXInXG4gICAgICAgIC8vICwgY29udHJvbGxlckFzIDogJ2Fib3V0J1xuICAgICAgfSlcblxuICAgICAgLy8gbG9naW4gcm91dGVcbiAgICAgIC53aGVuKCcvbG9naW4nLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsIDogJ3B1YmxpYy9odG1sL3BhZ2VzL2xvZ2luLmh0bWwnXG4gICAgICAgICwgY29udHJvbGxlciA6ICdtYWluQ29udHJvbGxlcidcbiAgICAgICAgLCBjb250cm9sbGVyQXMgOiAnbG9naW4nXG4gICAgICB9KVxuXG4gICAgICAud2hlbignL2Rhc2gnLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAncHVibGljL2h0bWwvcGFnZXMvZGFzaC9kYXNoLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnZGFzaENvbnRyb2xsZXInLFxuICAgICAgICBjb250cm9sbGVyQXM6ICd2bSdcbiAgICAgIH0pXG5cbiAgICAgIC53aGVuKCcvc2lnbnVwJywge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ3B1YmxpYy9odG1sL3BhZ2VzL3NpZ251cC5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ3VzZXJDcmVhdGVDb250cm9sbGVyJyxcbiAgICAgICAgY29udHJvbGxlckFzOiAndm0nXG4gICAgICB9KVxuXG4gICAgICAvL1xuICAgIHZhciBkZXZNb2RlID0gZmFsc2U7XG4gICAgaWYgKCFkZXZNb2RlKSAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUodHJ1ZSlcbiAgfSlcbiIsImFuZ3VsYXIubW9kdWxlKCdsaW5rdXBBcHAnLCBbXG4gICdsaW5rdXBSb3V0ZXMnLFxuICAnYXV0aFNlcnZpY2UnLFxuICAndXNlclNlcnZpY2UnLFxuICAnbWFpbkN0cmwnLFxuICAndXNlckN0cmwnLFxuICAnZGFzaEN0cmwnLFxuICAnZGF0YVNlcnZpY2UnLFxuICAnZGFzaEZpbHRlcnMnLFxuICAnc29jaWFsU2VydmljZSdcblxuXSlcbiAgLmNvbmZpZyhmdW5jdGlvbiAoJGh0dHBQcm92aWRlcikge1xuICAgICRodHRwUHJvdmlkZXIuaW50ZXJjZXB0b3JzLnB1c2goJ0F1dGhJbnRlcmNlcHRvcicpXG4gIH0pXG4iLCJhbmd1bGFyLm1vZHVsZSgnZGFzaEN0cmwnLCBbJ2RhdGFTZXJ2aWNlJywnYXV0aFNlcnZpY2UnLCd1c2VyU2VydmljZSddKVxuXG4gIC5jb250cm9sbGVyKCdkYXNoQ29udHJvbGxlcicsIGZ1bmN0aW9uIChBdXRoLCBVc2VyLCAkYW5jaG9yU2Nyb2xsLCAkbG9jYXRpb24sICR0aW1lb3V0LCBUYWJsZSwgVGVhbSkge1xuICAgIHZhciB2bSA9IHRoaXM7XG4gICAgdm0ub25PZmYgPSBmYWxzZVxuICAgIHZtLmRhc2hGcmFtZXMgPSBbXG4gICAgICB7XG4gICAgICAgIGlkOiAnbmV3cycsXG4gICAgICAgIG5hbWU6ICdOZXdzJyxcbiAgICAgICAgaHJlZjogJ3B1YmxpYy9odG1sL3ZpZXdzL3BhZ2VzL2Rhc2gvcnNzLmh0bWwnXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBpZDogJ3NjaGVkdWxlJyxcbiAgICAgICAgbmFtZTogJ1NjaGVkdWxlJyxcbiAgICAgICAgaHJlZjogJ3B1YmxpYy9odG1sL3ZpZXdzL3BhZ2VzL2Rhc2gvc2NoZWR1bGUuaHRtbCdcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGlkOiAndGFibGUnLFxuICAgICAgICBuYW1lOiAnVGFibGUnLFxuICAgICAgICBocmVmOiAncHVibGljL2h0bWwvdmlld3MvcGFnZXMvZGFzaC90YWJsZS5odG1sJ1xuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgaWQ6ICdzb2NpYWwnLFxuICAgICAgICBuYW1lOiAnU29jaWFsJyxcbiAgICAgICAgaHJlZjogJ3B1YmxpYy9odG1sL3ZpZXdzL3BhZ2VzL2Rhc2gvc29jaWFsLmh0bWwnXG4gICAgICB9XG4gICAgXVxuXG4gICAgLy8gVE9ETzogZ2V0IHRoaXMgb3V0IG9mIHRoZSBjb250cm9sbGVyLCBtb3ZlIGl0IHRvIGEgZmFjdG9yeSBzbyB0aGF0IG11bHRpcGxlXG4gICAgLy8gY29udHJvbGxlcnMgaGF2ZSBhY2Nlc3MgdG8gdGhpcyBkYXRhXG4gICAgVXNlci5wcm9maWxlKClcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3ApIHtcbiAgICAgICAgdm0udGVhbVByZWYgPSByZXNwLmRhdGFcbiAgICAgICAgVGVhbS5kYXRhKHJlc3AuZGF0YS50ZWFtUHJlZilcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXNwKSB7XG4gICAgICAgICAgICB2bS51c2VyVGVhbSA9IHJlc3AuZGF0YVxuICAgICAgICAgICAgdmFyIGluZGV4ID0gLTE7XG4gICAgICAgICAgICAvLyB2bS50YWJsZS5zdGFuZGluZy5mb3JFYWNoKGZ1bmN0aW9uKGN1ciwgaSkge1xuICAgICAgICAgICAgLy8gICBjb25zb2xlLmxvZyhjdXIudGVhbU5hbWUsIHZtLnVzZXJUZWFtLm5hbWUpO1xuICAgICAgICAgICAgLy8gICBpZiAoY3VyLnRlYW1OYW1lID09PSB2bS51c2VyVGVhbS5uYW1lKVxuICAgICAgICAgICAgLy8gICAgIHZtLnRhYmxlSW5kZXggPSBpXG4gICAgICAgICAgICAvLyB9KVxuICAgICAgICAgIH0pXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCd0ZWFtUHJlZicsdm0udGVhbVByZWYpXG4gICAgICB9KVxuXG4gICAgICAvLyBUT0RPOiBUaGlzIHNob3VsZCBiZSBtb3ZlZCBvdXQgb2YgdGhlIGNvbnRyb2xsZXIsIGJ1dCBubyB0aW1lIGZvciB0aGF0IG5vd1xuICAgICAgLy8gVGFibGUuZGF0YSgpXG4gICAgICAvLyAudGhlbihmdW5jdGlvbiAocmVzcCkge1xuICAgICAgICB2bS50YWJsZSA9IFRhYmxlLnRhYmxlXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCd0YWJsZScsIHZtLnRhYmxlKVxuICAgICAgLy8gfSlcblxuICAgICAgLy8gdmFyIGluaXRUYWJsZVNjcm9sbCA9IGZ1bmN0aW9uKCl7XG4gICAgICAvLyAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgLy8gICAgIC8vICRsb2NhdGlvbi5oYXNoKCdyb3cnK1RhYmxlLnVzZXJTdGFuZGluZylcbiAgICAgIC8vICAgICAvLyAkYW5jaG9yU2Nyb2xsKClcbiAgICAgIC8vICAgICAvLyBjb25zb2xlLmxvZyhUYWJsZS51c2VyU3RhbmRpbmcpXG4gICAgICAvLyAgIH0sIDEwMDApXG4gICAgICAvLyB9XG5cbiAgICAgIC8vIGNvbnNvbGUubG9nKFRhYmxlLnVzZXJTdGFuZGluZylcblxuICAgIHZtLmFjdGl2ZUZyYW1lID0gdm0uYWN0aXZlRnJhbWUgfHwgJ25ld3MnO1xuICAgIHZtLnNldEFjdGl2ZSA9IGZ1bmN0aW9uIChmcmFtZSkge1xuICAgICAgdm0uYWN0aXZlRnJhbWUgPSBmcmFtZVxuICAgICAgLy8gY29uc29sZS5sb2coZnJhbWUpXG4gICAgICAvLyBUT0RPOiBtYWtlIHRoaXMgZmlyZSBhcyBwYXJ0IG9mIHRoZSBuZy1lbnRlciAob3Igd2hhdGV2ZXIpIGZvciB0aGUgb3RoZXIgY3RybHNcbiAgICAgIC8vICBvciB0aGVpciBlbGVtZW50cy4uLiBva2F5LCBzbyBsaWtlLCBpdCBuZWVkcyBib3RoIGFuY2hvciBzY3JvbGxzPyBub3QgY2xlYXIgd2h5XG4gICAgICAvLyBET05FOiBJIHRoaW5rIGkndmUgZ290dGVuIGl0IGZpZ3VyZWQgb3V0IC0tIGl0IG5lZWRzIHRvIGxvb2sgbGlrZSB0aGlzLiBHb29kLlxuICAgICAgLy8gVGhlIHByb2JsZW0gbm93IGlzIHRoYXQgaXQncyBnb3QgYSB0b24gb2YgYWpheCBjYWxscywgdGhhdCBhbGwgbmVlZCB0byBiZSBtb3ZlZCBiYWNrd2FyZHNcbiAgICAgIGlmIChmcmFtZSA9PT0gJ3RhYmxlJyl7XG4gICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICRhbmNob3JTY3JvbGwoJ3JvdycgKyBUYWJsZS51c2VyU3RhbmRpbmcpXG4gICAgICAgIH0sIDApXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdiYW5nJylcbiAgICAgIH0gZWxzZSBpZiAoZnJhbWUgPT09ICdzY2hlZHVsZScpIHtcbiAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgJGFuY2hvclNjcm9sbC55T2Zmc2V0ID0gMjUwO1xuICAgICAgICAgICRhbmNob3JTY3JvbGwoJ21hdGNoJyArIFRhYmxlLm1hdGNoZGF5KVxuICAgICAgICB9LCAwKVxuICAgICAgfVxuICAgIH1cbiAgICAvLyAkKCdib2R5Jykuc2Nyb2xsVG9wKDEwMDApXG4gICAgLy8gTkI6IEZvciBnZXR0aW5nIHRoZSB0YWJsZSBzY3JvbGwgdG8gd29yay4gdGltZW91dCB0byBtYWtlIHN1cmUgdGhhdCB0aGUgbmctcmVwZWF0IGlzIGRvbmVcbiAgICAvLyBtYWtlXG4gICAgLy8gYWFhYWFhbmQgaXQgd29ya3MhXG4gICAgLy8gVGhpcyBsb29rcyBsaWtlIGRlYWQgY29kZSBoZXJlP1xuICAgIC8vICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgIC8vICAgLy8gJGxvY2F0aW9uLmhhc2goJ3JvdzE1JylcbiAgICAvLyAgIC8vICRhbmNob3JTY3JvbGwoKVxuICAgIC8vIH0sIDIwMDApXG5cbiAgfSlcblxuXG5cbiAgLmNvbnRyb2xsZXIoJ3Jzc0NvbnRyb2xsZXInLCBmdW5jdGlvbiAoUnNzLCBVc2VyKSB7XG4gICAgdmFyIHZtID0gdGhpcztcbiAgICB2bS5hY3RpdmVDYXJkO1xuXG4gICAgdm0uc2V0QWN0aXZlID0gZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICAvLyBpZiB0aGV5J3JlIGNsaWNraW5nIG9uIHRoZSBhY3RpdmUgY2FyZCwgY2xvc2UgaXRcbiAgICAgIHZtLmFjdGl2ZUNhcmQgPSB2bS5hY3RpdmVDYXJkICE9PSBpbmRleCA/IGluZGV4IDogbnVsbFxuICAgICAgY29uc29sZS5sb2codm0uYWN0aXZlQ2FyZClcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBJIGNhbid0IGZpbmQgYSB3YXkgdG8gZG8gdGhpcyBpbiB0aGUgZGFzaCBjcnRsIGFuZCBwYXNzIGl0LFxuICAgIC8vICAgICBzbyBpJ20gZG9pbmcgaXQgaW4gZWFjaCBjb250cm9sbGVyIDovXG4gICAgVXNlci5wcm9maWxlKClcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3ApIHtcbiAgICAgICAgdm0udGVhbVByZWYgPSByZXNwLmRhdGEudGVhbVByZWZcbiAgICAgICAgUnNzLnRlYW1GZWVkKHZtLnRlYW1QcmVmKVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3ApIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCd0ZWFtZmVlZCByZXNwJywgcmVzcC5kYXRhKVxuICAgICAgICAgICAgdm0uZmVlZCA9IHJlc3AuZGF0YVxuICAgICAgICAgIH0pXG4gICAgfSlcbiAgfSlcblxuICAuY29udHJvbGxlcignc2NoZWR1bGVDb250cm9sbGVyJywgZnVuY3Rpb24gKFNjaGVkdWxlLCBVc2VyLCBUZWFtLCBUYWJsZSkge1xuICAgIHZhciB2bSA9IHRoaXM7XG4gICAgLy8gdm0udGFibGUgPSBUYWJsZS50YWJsZVxuICAgIC8vIHZtLm1hdGNoZGF5ID0gVGFibGUudGFibGUubWF0Y2hkYXlcbiAgICB2bS5sb2cgPSBmdW5jdGlvbih2YWwpIHtjb25zb2xlLmxvZyh2YWwpO31cblxuICAgIHZtLnNldENsYXNzZXMgPSBmdW5jdGlvbihmaXh0dXJlKSB7XG4gICAgICB2YXIgb3V0ID0ge1xuICAgICAgICAncGxheWVkJyA6IGZhbHNlLFxuICAgICAgICAnZnV0dXJlJyA6IGZhbHNlLFxuICAgICAgICAnd29uJyA6IGZhbHNlLFxuICAgICAgICAnbG9zdCcgOiBmYWxzZSxcbiAgICAgICAgJ2RyYXcnIDogZmFsc2UsXG4gICAgICB9XG4gICAgICAvLyBUT0RPOiBkbyB0aGlzIGVsZWdhbnRcbiAgICAgIHZhciBob21lR29hbHMgPSBmaXh0dXJlLnJlc3VsdC5nb2Fsc0hvbWVUZWFtXG4gICAgICB2YXIgYXdheUdvYWxzID0gZml4dHVyZS5yZXN1bHQuZ29hbHNBd2F5VGVhbVxuICAgICAgdmFyIGhvbWVOYW1lID0gZml4dHVyZS5ob21lVGVhbU5hbWVcbiAgICAgIHZhciBhd2F5TmFtZSA9IGZpeHR1cmUuYXdheVRlYW1OYW1lXG4gICAgICB2YXIgdXNlckdvYWxzO1xuICAgICAgdmFyIG9wcEdvYWxzO1xuICAgICAgLy8gY29uc29sZS5sb2coJ3VzZXJ0ZWFtJywgdm0udXNlclRlYW0pXG4gICAgICBpZiAodm0udXNlclRlYW0pIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coZml4dHVyZSlcbiAgICAgICAgaWYgKHZtLnVzZXJUZWFtLm5hbWUgPT09IGhvbWVOYW1lKSB7XG4gICAgICAgICAgdXNlckdvYWxzID0gaG9tZUdvYWxzXG4gICAgICAgICAgb3BwR29hbHMgPSBhd2F5R29hbHNcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB1c2VyR29hbHMgPSBhd2F5R29hbHNcbiAgICAgICAgICBvcHBHb2FscyA9IGhvbWVHb2Fsc1xuICAgICAgICB9XG4gICAgICAgIC8vIEJlZm9yZSB0aGlzIHdhcyBkb25lIHcvIHRoZSBzdGF0dXMgY29kZXMsIGJ1dCB0aG9zZSBkb24ndCBzZWVtIHRvIG1lYW5cbiAgICAgICAgLy8gYW55dGhpbmcgYW5kIGFyZW4ndCBjb25zaXN0ZW50XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGhvbWVOYW1lLCAnLScsIGF3YXlOYW1lLCBob21lR29hbHMgPT09IG51bGwpXG4gICAgICAgIG91dC5mdXR1cmUgPSBob21lR29hbHMgPT09IG51bGw7XG4gICAgICAgIG91dC5wbGF5ZWQgPSAhb3V0LmZ1dHVyZVxuXG4gICAgICAgIGlmIChvdXQucGxheWVkID09PSB0cnVlKSB7XG4gICAgICAgICAgLy8gY29uc29sZS5sb2coJ2ZpcmVkJylcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZyhob21lTmFtZSwgJy0nLCBhd2F5TmFtZSwgaG9tZUdvYWxzLCBhd2F5R29hbHMsIGhvbWVHb2FscyA9PT0gYXdheUdvYWxzIClcbiAgICAgICAgICBpZiAoaG9tZUdvYWxzID09PSBhd2F5R29hbHMpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdiYW5nJylcbiAgICAgICAgICAgIG91dC5kcmF3ID0gdHJ1ZVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvdXQud29uID0gdXNlckdvYWxzID4gb3BwR29hbHNcbiAgICAgICAgICAgIG91dC5sb3N0ID0gIW91dC53b25cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBvdXRcbiAgICB9XG5cblxuICAgIFVzZXIucHJvZmlsZSgpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXNwKSB7XG4gICAgICAgIHZtLnRlYW1QcmVmID0gcmVzcC5kYXRhLnRlYW1QcmVmXG4gICAgICAgIFNjaGVkdWxlLnRlYW0odm0udGVhbVByZWYpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3ApIHtcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZygndGVhbSBzY2hlZCcsIHJlc3AuZGF0YSlcbiAgICAgICAgICB2bS5zY2hlZHVsZSA9IHJlc3AuZGF0YVxuICAgICAgICB9KVxuICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAvLyBUT0RPOiBwYXNzIGZ1bGwgbmFtZSBhbG9uZyB3aXRoIHRoZSB0ZWFtIHByZWYodGhpcyBhcGkgYmxvd3MpXG4gICAgICAgICAgcmV0dXJuIFRlYW0uZGF0YSh2bS50ZWFtUHJlZilcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3ApIHtcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZygndGVhbSBkYXRhIHJlc3AnLCByZXNwLmRhdGEpXG4gICAgICAgICAgdm0udXNlclRlYW0gPSByZXNwLmRhdGFcbiAgICAgICAgfSlcbiAgICAgICAgLy8gdm0ubWF0Y2hkYXkgPSB2bS50YWJsZS5tYXRjaGRheVxuICAgIH0pXG4gICAgVGVhbS5sb2dvcygpXG4gICAgLnRoZW4oZnVuY3Rpb24ocmVzcCkge1xuICAgICAgdm0ubG9nb3MgPSByZXNwLmRhdGFcbiAgICAgIC8vIGNvbnNvbGUubG9nKHZtLmxvZ29zKVxuICAgIH0pXG4gICAgVGFibGUuZGF0YSgpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXNwKSB7XG4gICAgICAgIHZtLnRhYmxlID0gcmVzcC5kYXRhXG4gICAgICB9KVxuXG4gIH0pXG5cbiAgLmNvbnRyb2xsZXIoJ3RhYmxlQ29udHJvbGxlcicsIGZ1bmN0aW9uIChUYWJsZSwgVXNlciwgVGVhbSwgJGxvY2F0aW9uKSB7XG4gICAgdmFyIHZtID0gdGhpc1xuICAgIHZtLnVzZXJUZWFtID0ge31cbiAgICB2bS5hY3RpdmVUZWFtID0gZnVuY3Rpb24gKHRlYW1OYW1lKSB7XG4gICAgICByZXR1cm4gdGVhbU5hbWUgPT09IHZtLnVzZXJUZWFtLm5hbWVcbiAgICB9XG5cbiAgICBVc2VyLnByb2ZpbGUoKVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcCkge1xuICAgICAgICB2bS50ZWFtUHJlZiA9IHJlc3AuZGF0YS50ZWFtUHJlZlxuICAgICAgICByZXR1cm4gcmVzcC5kYXRhLnRlYW1QcmVmXG4gICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3ApIHtcbiAgICAgICAgcmV0dXJuIFRlYW0uZGF0YShyZXNwKVxuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICB2bS51c2VyVGVhbSA9IHJlc3AuZGF0YVxuICAgICAgICByZXR1cm4gdm0udXNlclRlYW1cbiAgICAgICAgY29uc29sZS5sb2coJ3VzZXIgdGVhbScsdm0udXNlclRlYW0pXG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3ApIHtcbiAgICAgICAgLy8gVGhpcyB0aGVuIGNhbGwgaXMgdmVzdGlnaWFsXG4gICAgICAgIHZtLnRhYmxlID0gVGFibGUudGFibGVcbiAgICAgIH0pXG5cbiAgICAgIHZtLm9mZnNldCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gJCgnLmxlYWd1ZS10YWJsZScpLm91dGVyV2lkdGgoKVxuICAgICAgfVxuXG4gIH0pXG5cbiAgLmNvbnRyb2xsZXIoJ3NvY2lhbENvbnRyb2xsZXInLCBmdW5jdGlvbiAoVXNlciwgVGVhbSwgVHdpdHRlciwgJHNjZSkge1xuICAgIHZhciB2bSA9IHRoaXNcbiAgICBUd2l0dGVyLnRlc3QoKVxuICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3ApIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2cocmVzcC5kYXRhKVxuICAgICAgICAvLyB2bS50d2VldHMgPSAkc2NlLnRydXN0QXNIdG1sKHJlc3AuZGF0YS5odG1sKVxuICAgICAgfSlcbiAgICB2bS5lbmNvZGVkVHdlZXRzID0gW11cbiAgICBVc2VyLnByb2ZpbGUoKVxuICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3ApIHtcbiAgICAgICAgcmV0dXJuIHJlc3AuZGF0YS50ZWFtUHJlZlxuICAgICAgICAvLyB2bS50aW1lbGluZSA9ICRzY2UudHJ1c3RBc0h0bWwoVHdpdHRlci50aW1lbGluZShyZXNwLmRhdGEudGVhbVByZWYpKVxuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uICh0ZWFtUHJlZikge1xuICAgICAgICByZXR1cm4gVHdpdHRlci5zZWFyY2godGVhbVByZWYpXG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24gKHN0cmVhbSkge1xuICAgICAgICB2bS50d2VldHMgPSBzdHJlYW0uZGF0YS5zdGF0dXNlc1xuICAgICAgICAvLyB2bS50d2VldHMgPSB2bS50d2VldHMubWFwKGN1ciA9PiBjdXIuaWQpXG4gICAgICAgIGNvbnNvbGUubG9nKHZtLnR3ZWV0cylcbiAgICAgICAgcmV0dXJuIHZtLnR3ZWV0c1xuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uICh0d2VldHMpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ3R3ZWV0cycsdHdlZXRzKVxuICAgICAgICAvLyByZXR1cm4gVHdpdHRlci5nZXRPbmUodHdlZXRzWzBdLmlkX3N0cilcbiAgICAgICAgdHdlZXRzLmZvckVhY2goZnVuY3Rpb24gKGN1cikge1xuICAgICAgICAgIFR3aXR0ZXIuZ2V0T25lKGN1ci5pZF9zdHIpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXNwKSB7XG4gICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdnZXRvbmUgcmVzcG9uc2UnLCByZXNwKVxuICAgICAgICAgICAgICB2bS5lbmNvZGVkVHdlZXRzLnB1c2goICRzY2UudHJ1c3RBc0h0bWwocmVzcC5kYXRhLmh0bWwpKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ2VuY29kZWQnLHZtLmVuY29kZWRUd2VldHMpXG4gICAgICB9KVxuICAgICAgLy8gLnRoZW4oZnVuY3Rpb24gKHR3ZWV0KSB7XG4gICAgICAvLyAgIGNvbnNvbGUubG9nKCd0d2VldCcsIHR3ZWV0KVxuICAgICAgLy8gICB2bS50d2VldCA9ICRzY2UudHJ1c3RBc0h0bWwodHdlZXQuZGF0YS5odG1sKVxuICAgICAgLy8gfSlcblxuICAgIC8vIFR3aXR0ZXIudGltZWxpbmUoKVxuICAgIC8vICAgLnRoZW4oZnVuY3Rpb24gKHJlc3ApIHtcbiAgICAvLyAgICAgY29uc29sZS5sb2cocmVzcClcbiAgICAvLyAgICAgdm0udGltZWxpbmUgPSAkc2NlLnRydXN0QXNIdG1sKHJlc3ApXG4gICAgLy8gICB9KVxuICB9KVxuIiwiLy8gQ29udHJvbGxlciBmb3IgdGhlIG92ZXJhcmNoaW5nIHBhZ2VcbmFuZ3VsYXIubW9kdWxlKCdtYWluQ3RybCcsIFtdKVxuXG4uY29udHJvbGxlcignbWFpbkNvbnRyb2xsZXInLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkbG9jYXRpb24sIEF1dGgsIFVzZXIpIHtcblxuXHR2YXIgdm0gPSB0aGlzO1xuXG5cdHZtLmF0SG9tZSA9IGZ1bmN0aW9uICgpIHtcblx0XHRjb25zb2xlLmxvZygpXG5cdFx0cmV0dXJuICRsb2NhdGlvbi5wYXRoKCkgPT09ICcvJyB8fCAkbG9jYXRpb24ucGF0aCgpID09PSAnJ1xuXHR9XG5cdHZtLmF0U2lnbnVwID0gZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiAkbG9jYXRpb24ucGF0aCgpID09PSAnL3NpZ251cCcgLy98fCAkbG9jYXRpb24ucGF0aCgpID09PSAnJ1xuXHR9XG5cbi8vIEl0J3Mgc2lsbHkgdG8gY2FsbCB0aGlzIGFsbCB0aGUgdGltZSwganVzdCBpbiBjYXNlIGl0J3MgbmVlZGVkLCBidXQgaXQncyBsYXRlIGFuZCBpJ20gdGlyZWRcbi8vIGFuZCB0aGlzIG5lZWRzIHRvIGdldCBkb25lIGluIHZlcnkgbGl0dGxlIHRpbWUuXG4vLyBUT0RPOiBNYWtlIHRoaXMgcmVxdWVzdCBsb2dpY2FsIGFuZCBlZmZpY2llbnQgKGllLCBtYWtlIGl0IG9ubHkgb25jZSlcblx0VXNlci5wcm9maWxlKClcblx0XHQudGhlbihmdW5jdGlvbihyZXNwKSB7XG5cdFx0XHR2bS50ZWFtUHJlZiA9IHJlc3AuZGF0YS50ZWFtUHJlZlxuXHR9KVxuXG4vLyBUT0RPOiBtb3ZlIHRoaXMgY2FsbCB0byBhIGZhY3RvcnkgYW5kIHRoZSB1cmxzIHRvIHRoZSBiYWNrZW5kXG5cdHZtLmJVcmwgPSBmdW5jdGlvbiAoKSB7XG5cdFx0Ly8gY29uc29sZS5sb2coJ2ZpcmVkJylcblx0XHQvLyBUdXJucyBvdXQgcGljdHVyZXMgbG9vayBiYWQgYmVoaW5kIHRoZSBkYXNoXG5cdFx0Ly8gaWYgKCRsb2NhdGlvbi5wYXRoKCkgPT09ICcvZGFzaCcpe1xuXHRcdC8vIFx0cmV0dXJuIHRlYW1EYXNoSW1nKHZtLnRlYW1QcmVmKVxuXHRcdC8vIH1cblx0XHR2YXIgcGljcyA9IHtcblx0XHRcdGdpcmw6ICdodHRwczovL2MyLnN0YXRpY2ZsaWNrci5jb20vNC8zNDU1LzM3OTA1OTA0ODBfNGJiNWM2OTQ5NV9iLmpwZycsXG5cdFx0XHRzdE1hcnlzIDogJ2h0dHBzOi8vYzIuc3RhdGljZmxpY2tyLmNvbS8yLzE1NjAvMjM3OTI5ODM1NDRfZDkwODk3NTExNV96LmpwZycsXG5cdFx0XHRsaWdodHMgOiAnaHR0cHM6Ly9jMi5zdGF0aWNmbGlja3IuY29tLzgvNzQyMi8xMjY3Njc3MjE5NF8zMDUzYjNlZWVkX2IuanBnJyxcblx0XHRcdGNoYW1wcyA6ICdodHRwczovL3VwbG9hZC53aWtpbWVkaWEub3JnL3dpa2lwZWRpYS9jb21tb25zLzMvM2EvV2VzdF9TdGFuZF9DaGFtcGlvbnMuanBnJ1xuXHRcdH1cblx0XHR2YXIgdXJscyA9IHtcblxuXHRcdFx0Jy9zaWdudXAnOnBpY3Muc3RNYXJ5cyxcblx0XHRcdCcvJyA6IHBpY3MuY2hhbXBzLFxuXHRcdFx0Jy9kYXNoJyA6ICcnLFxuXHRcdFx0Jy9hYm91dCcgOiBwaWNzLmxpZ2h0c1xuXHRcdH1cblx0XHRpZiAodXJsc1skbG9jYXRpb24ucGF0aCgpXSA9PT0gdW5kZWZpbmVkKVxuXHRcdFx0Y29uc29sZS5lcnJvcignJysgJGxvY2F0aW9uLnBhdGgoKSArJyBiYWNrZ3JvdW5kIG5vdCBkZWZpbmVkJyk7XG5cdFx0cmV0dXJuIHVybHNbJGxvY2F0aW9uLnBhdGgoKV0gIT09IHVuZGVmaW5lZCA/IHVybHNbJGxvY2F0aW9uLnBhdGgoKV0gOiAnJ1xuXHR9XG5cblx0ZnVuY3Rpb24gdGVhbURhc2hJbWcgKHBhdGgpIHtcblx0XHRwYXRoID0gcGF0aC50b0xvd2VyQ2FzZSgpXG5cdFx0dmFyIGRlZmF1bHRJbWcgPSAnaHR0cHM6Ly9jMi5zdGF0aWNmbGlja3IuY29tLzIvMTU2MC8yMzc5Mjk4MzU0NF9kOTA4OTc1MTE1X3ouanBnJ1xuXHRcdHZhciB0ZWFtcyA9IHtcblx0XHRcdCdhZmMnIDogJ2h0dHBzOi8vYzIuc3RhdGljZmxpY2tyLmNvbS84Lzc0MjIvMTI2NzY3NzIxOTRfMzA1M2IzZWVlZF9iLmpwZydcblx0XHR9XG5cdFx0cmV0dXJuIHRlYW1zW3BhdGhdICE9PSB1bmRlZmluZWQgPyB0ZWFtc1twYXRoXSA6IGRlZmF1bHRJbWdcblx0fVxuXG5cdHZtLmhpZGVOYXYgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBjb25zb2xlLmxvZygnZmlyZWQnKVxuICAgICAgJCgnLmJ1dHRvbi1jb2xsYXBzZScpLnNpZGVOYXYoJ2hpZGUnKVxuICAgIH1cblxuXHQvLyBnZXQgaW5mbyBpZiBhIHBlcnNvbiBpcyBsb2dnZWQgaW5cblx0dm0ubG9nZ2VkSW4gPSBBdXRoLmlzTG9nZ2VkSW4oKTtcblx0aWYgKCRsb2NhdGlvbi5wYXRoKCkgPT09ICcvJyAmJiB2bS5sb2dnZWRJbilcblx0XHQkbG9jYXRpb24ucGF0aCgnL2Rhc2gnKVxuXG5cdC8vIGNoZWNrIHRvIHNlZSBpZiBhIHVzZXIgaXMgbG9nZ2VkIGluIG9uIGV2ZXJ5IHJlcXVlc3Rcblx0JHJvb3RTY29wZS4kb24oJyRyb3V0ZUNoYW5nZVN0YXJ0JywgZnVuY3Rpb24oKSB7XG5cdFx0dm0ubG9nZ2VkSW4gPSBBdXRoLmlzTG9nZ2VkSW4oKTtcblxuXHRcdC8vIGdldCB1c2VyIGluZm9ybWF0aW9uIG9uIHBhZ2UgbG9hZFxuXHRcdEF1dGguZ2V0VXNlcigpXG5cdFx0XHQudGhlbihmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHRcdHZtLnVzZXIgPSBkYXRhLmRhdGE7XG5cdFx0XHR9KVxuXHR9KTtcblxuXHQvLyBGb3IgZ3Vlc3QgbG9naW5cblx0dm0uZ3Vlc3QgPSBmdW5jdGlvbigpIHtcblx0XHR2bS5sb2dpbkRhdGEgPSB7fVxuXHRcdHZtLmxvZ2luRGF0YS51c2VybmFtZSA9ICdndWVzdCdcblx0XHR2bS5sb2dpbkRhdGEucGFzc3dvcmQgPSAncGFzc3dvcmQnXG5cdH1cblxuXHQvLyBmdW5jdGlvbiB0byBoYW5kbGUgbG9naW4gZm9ybVxuXHR2bS5kb0xvZ2luID0gZnVuY3Rpb24oKSB7XG5cdFx0dm0ucHJvY2Vzc2luZyA9IHRydWU7XG5cblx0XHR2bS5sb2dpbkRhdGEudXNlcm5hbWUgPSB2bS5sb2dpbkRhdGEudXNlcm5hbWUudG9Mb3dlckNhc2UoKVxuXG5cdFx0QXV0aC5sb2dpbih2bS5sb2dpbkRhdGEudXNlcm5hbWUsIHZtLmxvZ2luRGF0YS5wYXNzd29yZClcblx0XHRcdC50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcblx0XHRcdFx0dm0ucHJvY2Vzc2luZyA9IGZhbHNlO1xuXG5cdFx0XHRcdC8vIGlmIGEgdXNlciBzdWNjZXNzZnVsbHkgbG9ncyBpbiwgcmVkaXJlY3QgdG8gdXNlcnMgcGFnZVxuXHRcdFx0XHRpZiAoZGF0YS5zdWNjZXNzKVxuXHRcdFx0XHRcdCRsb2NhdGlvbi5wYXRoKCcvZGFzaCcpO1xuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0dm0uZXJyb3IgPSBkYXRhLm1lc3NhZ2U7XG5cblx0XHRcdH0pO1xuXHR9O1xuXG5cdC8vIGZ1bmN0aW9uIHRvIGhhbmRsZSBsb2dnaW5nIG91dFxuXHR2bS5kb0xvZ291dCA9IGZ1bmN0aW9uKCkge1xuXHRcdEF1dGgubG9nb3V0KCk7XG5cdFx0dm0udXNlciA9ICcnO1xuXG5cdFx0JGxvY2F0aW9uLnBhdGgoJy8nKTtcblx0fTtcblxuXG59KTtcbiIsImFuZ3VsYXIubW9kdWxlKCd1c2VyQ3RybCcsIFsndXNlclNlcnZpY2UnXSlcblxuLmNvbnRyb2xsZXIoJ3VzZXJDb250cm9sbGVyJywgZnVuY3Rpb24oVXNlcikge1xuXG5cdHZhciB2bSA9IHRoaXM7XG5cblx0Ly8gc2V0IGEgcHJvY2Vzc2luZyB2YXJpYWJsZSB0byBzaG93IGxvYWRpbmcgdGhpbmdzXG5cdHZtLnByb2Nlc3NpbmcgPSB0cnVlO1xuXG5cdC8vIGdyYWIgYWxsIHRoZSB1c2VycyBhdCBwYWdlIGxvYWRcblx0VXNlci5hbGwoKVxuXHRcdC5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEpIHtcblxuXHRcdFx0Ly8gd2hlbiBhbGwgdGhlIHVzZXJzIGNvbWUgYmFjaywgcmVtb3ZlIHRoZSBwcm9jZXNzaW5nIHZhcmlhYmxlXG5cdFx0XHR2bS5wcm9jZXNzaW5nID0gZmFsc2U7XG5cblx0XHRcdC8vIGJpbmQgdGhlIHVzZXJzIHRoYXQgY29tZSBiYWNrIHRvIHZtLnVzZXJzXG5cdFx0XHR2bS51c2VycyA9IGRhdGE7XG5cdFx0fSk7XG5cblx0Ly8gZnVuY3Rpb24gdG8gZGVsZXRlIGEgdXNlclxuXHR2bS5kZWxldGVVc2VyID0gZnVuY3Rpb24oaWQpIHtcblx0XHR2bS5wcm9jZXNzaW5nID0gdHJ1ZTtcblxuXHRcdFVzZXIuZGVsZXRlKGlkKVxuXHRcdFx0LnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSkge1xuXG5cdFx0XHRcdC8vIGdldCBhbGwgdXNlcnMgdG8gdXBkYXRlIHRoZSB0YWJsZVxuXHRcdFx0XHQvLyB5b3UgY2FuIGFsc28gc2V0IHVwIHlvdXIgYXBpXG5cdFx0XHRcdC8vIHRvIHJldHVybiB0aGUgbGlzdCBvZiB1c2VycyB3aXRoIHRoZSBkZWxldGUgY2FsbFxuXHRcdFx0XHRVc2VyLmFsbCgpXG5cdFx0XHRcdFx0LnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSkge1xuXHRcdFx0XHRcdFx0dm0ucHJvY2Vzc2luZyA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0dm0udXNlcnMgPSBkYXRhO1xuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHR9KTtcblx0fTtcblxufSlcblxuLy8gY29udHJvbGxlciBhcHBsaWVkIHRvIHVzZXIgY3JlYXRpb24gcGFnZVxuLmNvbnRyb2xsZXIoJ3VzZXJDcmVhdGVDb250cm9sbGVyJywgZnVuY3Rpb24oVXNlciwgVGVhbSwgJGxvY2F0aW9uLCAkdGltZW91dCwgQXV0aCwgQXV0aFRva2VuLCAkd2luZG93KSB7XG5cdHZhciB2bSA9IHRoaXM7XG5cblx0Ly8gdmFyaWFibGUgdG8gaGlkZS9zaG93IGVsZW1lbnRzIG9mIHRoZSB2aWV3XG5cdC8vIGRpZmZlcmVudGlhdGVzIGJldHdlZW4gY3JlYXRlIG9yIGVkaXQgcGFnZXNcblx0dm0udHlwZSA9ICdjcmVhdGUnO1xuXG5cdHZtLnVzZXJEYXRhID0geyAgfVxuXG5cdHZtLmxvZyA9IGZ1bmN0aW9uICh2YWwpIHtjb25zb2xlLmxvZygnbG9nOicsdmFsKTt9XG5cblx0VGVhbS5hbGwoKVxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlc3ApIHtcblx0XHRcdHZtLnRlYW1zID0gcmVzcC5kYXRhLnRlYW1zXG5cblx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAkKCdzZWxlY3QnKS5tYXRlcmlhbF9zZWxlY3QoKVxuICAgICAgfSwgMClcblxuXHRcdH0pXG5cblx0Ly8gZnVuY3Rpb24gdG8gY3JlYXRlIGEgdXNlclxuXHR2bS5zYXZlVXNlciA9IGZ1bmN0aW9uKCkge1xuXHRcdHZtLnByb2Nlc3NpbmcgPSB0cnVlO1xuXHRcdHZtLm1lc3NhZ2UgPSAnJztcblx0XHR2YXIgcGFzc3dvcmQgPSB2bS51c2VyRGF0YS5wYXNzd29yZFxuXHRcdC8vIHVzZSB0aGUgY3JlYXRlIGZ1bmN0aW9uIGluIHRoZSB1c2VyU2VydmljZVxuXHRcdFVzZXIuY3JlYXRlKHZtLnVzZXJEYXRhKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24ocmVzcCkge1xuXHRcdFx0XHR2bS5wcm9jZXNzaW5nID0gZmFsc2U7XG5cdFx0XHRcdHZtLnVzZXJEYXRhID0geyAgfVxuXHRcdFx0XHRyZXR1cm4gcmVzcC5kYXRhXG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcblx0XHRcdFx0QXV0aC5sb2dpbih1c2VyLnVzZXJuYW1lLCBwYXNzd29yZClcblx0XHRcdFx0XHQudGhlbihmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHRcdFx0XHR2bS5wcm9jZXNzaW5nID0gZmFsc2U7XG5cblx0XHRcdFx0XHRcdC8vIGlmIGEgdXNlciBzdWNjZXNzZnVsbHkgbG9ncyBpbiwgcmVkaXJlY3QgdG8gdXNlcnMgcGFnZVxuXHRcdFx0XHRcdFx0aWYgKGRhdGEuc3VjY2Vzcyl7XG5cdFx0XHRcdFx0XHRcdCRsb2NhdGlvbi5wYXRoKCcvZGFzaCcpO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdH0pXG5cblxuXG5cdH07XG5cbn0pXG5cbi8vIGNvbnRyb2xsZXIgYXBwbGllZCB0byB1c2VyIGVkaXQgcGFnZVxuLmNvbnRyb2xsZXIoJ3VzZXJFZGl0Q29udHJvbGxlcicsIGZ1bmN0aW9uKCRyb3V0ZVBhcmFtcywgVXNlcikge1xuXG5cdHZhciB2bSA9IHRoaXM7XG5cblx0Ly8gdmFyaWFibGUgdG8gaGlkZS9zaG93IGVsZW1lbnRzIG9mIHRoZSB2aWV3XG5cdC8vIGRpZmZlcmVudGlhdGVzIGJldHdlZW4gY3JlYXRlIG9yIGVkaXQgcGFnZXNcblx0dm0udHlwZSA9ICdlZGl0JztcblxuXHQvLyBnZXQgdGhlIHVzZXIgZGF0YSBmb3IgdGhlIHVzZXIgeW91IHdhbnQgdG8gZWRpdFxuXHQvLyAkcm91dGVQYXJhbXMgaXMgdGhlIHdheSB3ZSBncmFiIGRhdGEgZnJvbSB0aGUgVVJMXG5cdFVzZXIuZ2V0KCRyb3V0ZVBhcmFtcy51c2VyX2lkKVxuXHRcdC5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEpIHtcblx0XHRcdHZtLnVzZXJEYXRhID0gZGF0YTtcblx0XHR9KTtcblxuXHQvLyBmdW5jdGlvbiB0byBzYXZlIHRoZSB1c2VyXG5cdHZtLnNhdmVVc2VyID0gZnVuY3Rpb24oKSB7XG5cdFx0dm0ucHJvY2Vzc2luZyA9IHRydWU7XG5cdFx0dm0ubWVzc2FnZSA9ICcnO1xuXG5cdFx0Ly8gY2FsbCB0aGUgdXNlclNlcnZpY2UgZnVuY3Rpb24gdG8gdXBkYXRlXG5cdFx0VXNlci51cGRhdGUoJHJvdXRlUGFyYW1zLnVzZXJfaWQsIHZtLnVzZXJEYXRhKVxuXHRcdFx0LnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSkge1xuXHRcdFx0XHR2bS5wcm9jZXNzaW5nID0gZmFsc2U7XG5cblx0XHRcdFx0Ly8gY2xlYXIgdGhlIGZvcm1cblx0XHRcdFx0dm0udXNlckRhdGEgPSB7fTtcblxuXHRcdFx0fSk7XG5cdH07XG5cbn0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2F1dGhTZXJ2aWNlJywgW10pXG5cbiAgLmZhY3RvcnkoJ0F1dGgnLCBmdW5jdGlvbigkaHR0cCwgJHEsIEF1dGhUb2tlbikge1xuICAgIHZhciBhdXRoRmFjdG9yeSA9IHt9XG5cbiAgICAvLyBsb2dpblxuICAgIGF1dGhGYWN0b3J5LmxvZ2luID0gZnVuY3Rpb24gKHVzZXJuYW1lLCBwYXNzd29yZCkge1xuICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9hcGkvYXV0aGVudGljYXRlJywge1xuICAgICAgICB1c2VybmFtZTogdXNlcm5hbWUsXG4gICAgICAgIHBhc3N3b3JkOiBwYXNzd29yZFxuICAgICAgfSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIEF1dGhUb2tlbi5zZXRUb2tlbihkYXRhLmRhdGEudG9rZW4pXG4gICAgICAgICAgcmV0dXJuIGRhdGEuZGF0YVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIC8vIGxvZ291dFxuICAgIGF1dGhGYWN0b3J5LmxvZ291dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vIGNsZWFyIHRva2VuXG4gICAgICBBdXRoVG9rZW4uc2V0VG9rZW4oKVxuICAgIH1cblxuICAgIC8vIGNoZWNrIGlmIGxvZ2dlZCBpblxuICAgIGF1dGhGYWN0b3J5LmlzTG9nZ2VkSW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoQXV0aFRva2VuLmdldFRva2VuKCkpXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICBlbHNlXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIC8vIGdldCB1c2VyIGluZm9cbiAgICBhdXRoRmFjdG9yeS5nZXRVc2VyID0gZnVuY3Rpb24gKCkge1xuICAgICAgLy8gY29uc29sZS5sb2coJ2dldHVzZXIgZmlyZWQnKVxuICAgICAgaWYgKEF1dGhUb2tlbi5nZXRUb2tlbigpKVxuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL21lJylcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuICRxLnJlamVjdCh7bWVzc2FnZTogJ1VzZXIgaGFzIG5vIHRva2VuLid9KVxuICAgIH1cblxuICAgIHJldHVybiBhdXRoRmFjdG9yeVxuXG4gIH0pXG5cbiAgLmZhY3RvcnkoJ0F1dGhUb2tlbicsIGZ1bmN0aW9uKCR3aW5kb3cpIHtcbiAgICB2YXIgYXV0aFRva2VuRmFjdG9yeSA9IHt9XG5cbiAgICAvLyBnZXQgdG9rZW4gZnJvbSBsb2NhbCBzdG9yYWdlXG4gICAgYXV0aFRva2VuRmFjdG9yeS5nZXRUb2tlbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiAkd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0b2tlbicpXG4gICAgfVxuXG4gICAgLy8gc2V0IG9yIGNsZWFyIHRva2VuXG4gICAgYXV0aFRva2VuRmFjdG9yeS5zZXRUb2tlbiA9IGZ1bmN0aW9uICh0b2tlbikge1xuICAgICAgaWYgKHRva2VuKVxuICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKCd0b2tlbicsIHRva2VuKVxuICAgICAgZWxzZVxuICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCd0b2tlbicpXG4gICAgfVxuXG4gICAgcmV0dXJuIGF1dGhUb2tlbkZhY3RvcnlcbiAgfSlcblxuICAuZmFjdG9yeSgnQXV0aEludGVyY2VwdG9yJywgZnVuY3Rpb24oJHEsICRsb2NhdGlvbiwgQXV0aFRva2VuKSB7XG4gICAgdmFyIGludGVyY2VwdG9yRmFjdG9yeSA9IHt9XG5cbiAgICAvLyBhdHRhY2ggdG9rZW4gdG8gZXZlcnkgcmVxdWVzdFxuICAgIGludGVyY2VwdG9yRmFjdG9yeS5yZXF1ZXN0ID0gZnVuY3Rpb24oY29uZmlnKSB7XG4gICAgICAvLyBjb25zb2xlLmxvZygnaW50ZXJjZXB0b3IgZmlyZWQnKVxuICAgICAgdmFyIHRva2VuID0gQXV0aFRva2VuLmdldFRva2VuKClcbiAgICAgIGlmICh0b2tlbilcbiAgICAgICAgY29uZmlnLmhlYWRlcnNbJ3gtYWNjZXNzLXRva2VuJ10gPSB0b2tlblxuICAgICAgcmV0dXJuIGNvbmZpZ1xuICAgIH1cblxuICAgIC8vIHJlZGlyZWN0IGlmIGJhZCB0b2tlblxuICAgIGludGVyY2VwdG9yRmFjdG9yeS5yZXNwb25zZUVycm9yID0gZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID09IDQwMylcbiAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy9sb2dpbicpXG4gICAgICByZXR1cm4gJHEucmVqZWN0KHJlc3BvbnNlKVxuICAgIH1cbiAgICByZXR1cm4gaW50ZXJjZXB0b3JGYWN0b3J5XG4gIH0pXG4iLCJhbmd1bGFyLm1vZHVsZSgnZGFzaEZpbHRlcnMnLCBbXSlcbiAgLy8gQ3V0cyB0aGUgbmFtZXMgZG93biB0byBhIHNpemUgdGhhdCBmaXRzIGluIHRoZSBib3hlcyBhdCB0aGUgc21hbGxlc3Qgc2l6ZS5cbiAgLy8gQ291bGRuJ3QgZmlndXJlIG91dCBhIGdvb2Qgd2F5IGNoYW5nZSB0aGUgdGV4dCBiYXNlZCBvbiB2aWV3cG9ydCwgc28gd2UgYWx3YXlzXG4gIC8vIHVzZSBzaG9ydGVuZWQgbmFtZXNcbiAgLmZpbHRlcignbmFtZVRyaW0nLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICBvdXQgPSBuYW1lXG4gICAgICAgIC5yZXBsYWNlKCdXZXN0IEhhbSBVbml0ZWQnLCAnV2VzdCBIYW0nKVxuICAgICAgICAucmVwbGFjZSgnd2ljaCBBbGJpb24nLCAnJykgLy8gJ1dlc3QgQnJvd2ljaCBBbGJpb24nIC0+ICdXZXN0IEJyb3cnXG4gICAgICAgIC5yZXBsYWNlKC8oTGVpY2VzdGVyfFN3YW5zZWF8U3Rva2V8Tm9yd2ljaHxUb3R0ZW5oYW0pIENpdHl8SG90c3B1ci8sICckMScpIC8vIERyb3AgJ0NpdHknIG9yICdIb3RzcHVyJ1xuICAgICAgICAucmVwbGFjZSgnTmV3Y2FzdGxlIFVuaXRlZCcsICdOZXdjYXN0bGUnKSAvLyAnTmV3Y2FzdGxlIFV0ZCcgd291bGQgYmUgdG9vIGxvbmdcbiAgICAgICAgLnJlcGxhY2UoJ01hbmNoZXN0ZXInLCAnTWFuJykgLy8gLT4gU2hvcnRlbiBNYW4gQ2l0eSAvIFV0ZFxuICAgICAgICAucmVwbGFjZSgnVW5pdGVkJywgJ1V0ZCcpIC8vIE1hbiBVdGRcbiAgICAgICAgLnJlcGxhY2UoL0ZDfEFGQy8sICcnKVxuICAgICAgICAucmVwbGFjZSgnUGFsYWNlJywgJ1BhbC4nKSAvLyBDcnlzdGFsIHBhbGFjZSBpcyBqdXN0IHRvbyBkYW5nIGxvbmdcbiAgICAgICAgLnRyaW0oKVxuICAgICAgcmV0dXJuIG91dFxuICAgIH1cbiAgfSlcblxuICAvLyBUaGUgUlNTIHRleHQgY29tZXMgdGhyb3VnaCBwb29ybHkgZm9ybWF0dGVkLCBzbyB3ZSByZXBsYWNlIGFueSBhcnRpZmFjdHMgaW4gdGhlIHN0cmluZ1xuICAuZmlsdGVyKCdjYXJkVHJpbScsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRleHQpIHtcbiAgICAgIG91dCA9IHRleHRcbiAgICAgICAgLnJlcGxhY2UoLzxicj4vZywgJ1xcbicpXG4gICAgICAgIC5yZXBsYWNlKCcuLicsICcuJylcbiAgICAgIHJldHVybiBvdXRcbiAgICB9XG4gIH0pXG4iLCJhbmd1bGFyLm1vZHVsZSgnZGF0YVNlcnZpY2UnLCBbJ3VzZXJTZXJ2aWNlJ10pXG5cbiAgLy8gSGFuZGxlIG1ha2luZyB0aGUgdmFyaW91cyBBUEkgY2FsbHMuIFRoZSBoZWF2eSBsaWZ0aW5nIHNob3VsZCBiZSBtb3ZlZFxuICAvLyB0byB0aGUgc2VydmVyLCBtZXRoaW5rcywgYW5kIGFsbCBvZiB0aGVzZSBzaG91bGQgYmUgbG9va2VkIGF0LiBUaGVyZSdzIGEgY291cGxlXG4gIC8vIG9mIHBsYWNlcywgaWYgbWVtb3J5IHNlcnZlcywgd2hlcmUgdGhlIHNhbWUgZnVuY3Rpb24gbWFrZXMgdGhlIHNhbWUgYXBpIGNhbGxcbiAgLy8gbXVsdGlwbGUgdGltZXMsIGJlY2F1c2UgdGhlcmUncyBubyBzdG9yaW5nIG9mIGRhdGEuIFRoYXQgc2hvdWxkIGJlIGZpeGVkLlxuICAvLyBJIG1lYW4sIHN1cmVseSB0aGVzZSBmYWN0b3JpZXMgY2FuIGJlIHN0YXRlZnVsIC0tIGp1c3QgaGF2ZSB0aGVtIGNoZWNrIGlmIHRoZXkndmVcbiAgLy8gZ290IGFuIG9iamVjdCBhbmQgaWYgaXQncyBmcmVzaCwgYW5kIGlmIHNvIHJldHVybiB0aGF0LCBvdGhlcndpc2UgZ2V0IGl0IGFuZFxuICAvLyByZXR1cm4gaXQuIEkgbWVhbiwgdGVjaG5pY2FsbHksIHJldHVybiBhIHByb21pc2UgZWl0aGVyIHdheSwgYnV0IHdoYXRldmVyLlxuXG4gIC5mYWN0b3J5KCdSc3MnLCBmdW5jdGlvbigkaHR0cCkge1xuICAgIHZhciByc3NGYWN0b3J5ID0ge31cblxuICAgIHJzc0ZhY3RvcnkudGVhbUZlZWQgPSBmdW5jdGlvbiAodGVhbSkge1xuICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9yc3MvdGVhbS8nICsgdGVhbSlcbiAgICB9XG5cbiAgICByZXR1cm4gcnNzRmFjdG9yeVxuICB9KVxuXG4gIC5mYWN0b3J5KCdTY2hlZHVsZScsIGZ1bmN0aW9uICgkaHR0cCkge1xuICAgIHZhciBzY2hlZHVsZUZhY3RvcnkgPSB7fVxuXG4gICAgc2NoZWR1bGVGYWN0b3J5LnRlYW0gPSBmdW5jdGlvbih0ZWFtKSB7XG4gICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2ZkL3RlYW0vc2NoZWR1bGUvJyArIHRlYW0pXG4gICAgfVxuXG4gICAgcmV0dXJuIHNjaGVkdWxlRmFjdG9yeVxuICB9KVxuXG4vLyBUT0RPOiBUaGVyZSBzaG91bGQgYmUgYW4gYXBpIHJvdXRlIHRoYXQgdHVybnMgYSBzaG9ydG5hbWUgKCdTV0EnKVxuLy8gaW50byBhIGxvbmcgbmFtZSAoJ1N3YW5zZWEgQ2l0eSBBRkMnKVxuICAuZmFjdG9yeSgnVGFibGUnLCBmdW5jdGlvbiAoJGh0dHAsIFVzZXIsIFRlYW0pIHtcbiAgICB2YXIgdGFibGVGYWN0b3J5ID0ge31cblxuICAgIHRhYmxlRmFjdG9yeS5kYXRhID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9mZC90YWJsZScpXG4gICAgfVxuXG4gICAgLy8gSSB0aG91Z2h0IHRoaXMgd291bGQgd29yayBidXQgaXQgZG9lc24ndD9cbiAgICAvLyAkaHR0cC5nZXQoJy9hcGkvZmQvdGFibGUnKVxuICAgIC8vICAgLnRoZW4oZnVuY3Rpb24gKHJlc3ApIHtcbiAgICAvLyAgICAgdGFibGVGYWN0b3J5LnRhYmxlID0gcmVzcC5kYXRhXG4gICAgLy8gICAgIGNvbnNvbGUubG9nKHRhYmxlRmFjdG9yeS50YWJsZSlcbiAgICAvLyAgIH0pXG5cbi8vIFRPRE86IEkgdGhpbmsgdGhhdCB0aGlzIGlzIHNsb3dpbmcgdGhpbmdzIGRvd24gLS0gaXQncyBtYWtpbmcgZXZlcnl0aGluZyB3YWl0IG9uIHRoaXMgYWpheCBjYWxsXG4gICAgZnVuY3Rpb24gZ2V0U3RhbmRpbmcgKCkge1xuICAgICAgVXNlci5wcm9maWxlKClcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3ApIHtcbiAgICAgICAgICByZXR1cm4gVGVhbS5kYXRhKHJlc3AuZGF0YS50ZWFtUHJlZilcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3ApIHtcbiAgICAgICAgICB2YXIgdGVhbVByZWYgPSByZXNwLmRhdGFcbiAgICAgICAgICB0YWJsZUZhY3RvcnkuZGF0YSgpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXNwKSB7XG4gICAgICAgICAgICAgIHZhciB0YWJsZSA9IHJlc3AuZGF0YS5zdGFuZGluZ1xuICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh0YWJsZSlcbiAgICAgICAgICAgICAgLy8gdmFyIGluZGV4ID0gLTFcbiAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2codGVhbVByZWYubmFtZSwgJ3RlYW0gbmFtZScpXG4gICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGFibGUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh0YWJsZS50ZWFtTmFtZSwgdGVhbVByZWYubmFtZSlcbiAgICAgICAgICAgICAgICBpZiAodGFibGVbaV0udGVhbU5hbWUgPT09IHRlYW1QcmVmLm5hbWUpe1xuICAgICAgICAgICAgICAgICAgdGFibGVGYWN0b3J5LnVzZXJTdGFuZGluZyA9IGlcbiAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRhYmxlRmFjdG9yeS51c2VyU3RhbmRpbmcpXG4gICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICB9XG4gICAgZ2V0TWF0Y2hkYXkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB0YWJsZUZhY3RvcnkuZGF0YSgpXG4gICAgICAgIC50aGVuIChmdW5jdGlvbiAocmVzcCkge1xuICAgICAgICAgIHRhYmxlRmFjdG9yeS50YWJsZSA9IHJlc3AuZGF0YVxuICAgICAgICAgIHRhYmxlRmFjdG9yeS5tYXRjaGRheSA9IHJlc3AuZGF0YS5tYXRjaGRheVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIGdldFN0YW5kaW5nKClcbiAgICBnZXRNYXRjaGRheSgpXG4gICAgLy8gY29uc29sZS5sb2codGFibGVGYWN0b3J5LnVzZXJTdGFuZGluZylcbiAgICByZXR1cm4gdGFibGVGYWN0b3J5XG4gIH0pXG5cbiAgLmZhY3RvcnkoJ1RlYW0nLCBmdW5jdGlvbiAoJGh0dHApIHtcbiAgICB2YXIgdGVhbUZhY3RvcnkgPSB7fVxuXG4gICAgdGVhbUZhY3RvcnkuYWxsID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9mZC90ZWFtcycpXG4gICAgfVxuXG4gICAgdGVhbUZhY3RvcnkubG9nb3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2ZkL3RlYW1zL2xvZ29zJylcbiAgICB9XG5cbiAgICB0ZWFtRmFjdG9yeS5kYXRhID0gZnVuY3Rpb24gKHRlYW0pIHtcbiAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvZmQvdGVhbS8nICsgdGVhbSlcbiAgICB9XG5cbiAgICByZXR1cm4gdGVhbUZhY3RvcnlcbiAgfSlcbiIsIi8vIEl0IGxvb2tzIGxpa2UgdGhpcyB3YXMgdGFiYmVkIG91dCBidXQgbmV2ZXIgdXNlZFxuYW5ndWxhci5tb2R1bGUoJ3NpZ251cERpcmVjdGl2ZXMnLCBbXSlcbi5kaXJlY3RpdmUoJ215UmVwZWF0RGlyZWN0aXZlJywgZnVuY3Rpb24oJHRpbWVvdXQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgIGlmIChzY29wZS4kbGFzdCl7XG4gICAgICBjb25zb2xlLmxvZygnaGknKVxuICAgIH1cbiAgfTtcbn0pXG4iLCJhbmd1bGFyLm1vZHVsZSgnc29jaWFsU2VydmljZScsIFsnZGF0YVNlcnZpY2UnXSlcblxuICAvLyBNYWtlcyBjYWxscyB0byBvdXIgQVBJLCB3aGljaCBoaXRzIHR3aXR0ZXIuXG4gIC8vIFRoaXMgc2hvdWxkIGJlIGNoYW5nZWQgdG8gc29tZXRoaW5nIGxpa2UgJ2dldCB0d2VldHMnXG4gIC8vIEFuZCBpdCBqdXN0IHRocm93cyB1cCBhIGJ1bmNoIG9mIHR3ZWV0cyB0byBzaG93IHRoZSB1c2VyLFxuICAvLyBhbmQgd2UgY2FjaGUgdGhlIGFwaSBjYWxscyBvbiB0aGUgYmFja2VuZFxuXG4gIC5mYWN0b3J5KCdUd2l0dGVyJywgZnVuY3Rpb24gKCRodHRwLCBUZWFtKSB7XG4gICAgdmFyIHR3aXR0ZXJGYWN0b3J5ID0ge31cblxuICAgIHR3aXR0ZXJGYWN0b3J5LnRlc3QgPSBmdW5jdGlvbiAoKXtcbiAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvdHcvdGVzdCcpXG4gICAgfVxuXG4gICAgdHdpdHRlckZhY3Rvcnkuc2VhcmNoID0gZnVuY3Rpb24gKHRlYW1JZCkge1xuICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS90dy9zZWFyY2gvJyArIHRlYW1JZClcbiAgICB9XG5cbiAgICB0d2l0dGVyRmFjdG9yeS5nZXRPbmUgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvdHcvZ2V0T25lLycgKyBpZClcbiAgICB9XG5cbiAgICAvLyB0d2l0dGVyRmFjdG9yeS50aW1lbGluZSA9IGZ1bmN0aW9uICh0ZWFtQ29kZSkge1xuICAgIC8vICAgdmFyIGhhc2ggPSB0ZWFtSGFzaCh0ZWFtQ29kZSlcbiAgICAvLyAgIGNvbnNvbGUubG9nKGhhc2gpXG4gICAgLy8gICB2YXIgcGFydE9uZSA9ICc8YSBjbGFzcz1cInR3aXR0ZXItdGltZWxpbmVcIiBocmVmPVwiaHR0cHM6Ly90d2l0dGVyLmNvbS9oYXNodGFnLydcbiAgICAvLyAgIHZhciBwYXJ0VHdvID0gJ1wiIGRhdGEtd2lkZ2V0LWlkPVwiNzA5NzkxMjExOTQ3NjMwNTkyXCI+IydcbiAgICAvLyAgIHZhciBwYXJ0VGhyZWUgPSBcIlR3ZWV0czwvYT4gPHNjcmlwdD4hZnVuY3Rpb24oZCxzLGlkKXt2YXIganMsZmpzPWQuZ2V0RWxlbWVudHNCeVRhZ05hbWUocylbMF0scD0vXmh0dHA6Ly50ZXN0KGQubG9jYXRpb24pPydodHRwJzonaHR0cHMnO2lmKCFkLmdldEVsZW1lbnRCeUlkKGlkKSl7anM9ZC5jcmVhdGVFbGVtZW50KHMpO2pzLmlkPWlkO2pzLnNyYz1wKyc6Ly9wbGF0Zm9ybS50d2l0dGVyLmNvbS93aWRnZXRzLmpzJztmanMucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoanMsZmpzKTt9fShkb2N1bWVudCwnc2NyaXB0JywndHdpdHRlci13anMnKTs8L3NjcmlwdD5cIlxuICAgIC8vXG4gICAgLy8gICBjb25zb2xlLmxvZyhwYXJ0T25lICsgaGFzaCArIHBhcnRUd28gKyBoYXNoICsgcGFydFRocmVlKTtcbiAgICAvL1xuICAgIC8vICAgcmV0dXJuIHBhcnRPbmUgKyBoYXNoICsgcGFydFR3byArIGhhc2ggKyBwYXJ0VGhyZWVcbiAgICAvLyB9XG5cbiAgICBmdW5jdGlvbiB0ZWFtSGFzaCAodGVhbUNvZGUpIHtcbiAgICAgIHRlYW1Db2RlID0gdGVhbUNvZGUudG9Mb3dlckNhc2UoKVxuICAgICAgY29uc29sZS5sb2codGVhbUNvZGUpXG4gICAgICB2YXIgbG9va3VwID0ge1xuICAgICAgICAnc3dhJyA6ICdTd2Fuc2VhQ2l0eScsXG4gICAgICAgICdjcnknIDogJ2NwZmMnXG4gICAgICB9XG4gICAgICByZXR1cm4gbG9va3VwW3RlYW1Db2RlXVxuICAgIH1cblxuICAgIHJldHVybiB0d2l0dGVyRmFjdG9yeVxuICB9KVxuIiwiYW5ndWxhci5tb2R1bGUoJ3VzZXJTZXJ2aWNlJywgWydhdXRoU2VydmljZSddKVxuXG4gIC5mYWN0b3J5KCdVc2VyJywgZnVuY3Rpb24oJGh0dHAsIEF1dGhUb2tlbiwgJHEpe1xuICAgIHZhciB1c2VyRmFjdG9yeSA9IHt9XG5cbiAgICAvLyBnZXQgc2luZ2xlIHVzZXJcbiAgICB1c2VyRmFjdG9yeS5nZXQgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvdXNlcnMvJyArIGlkKVxuICAgIH1cblxuICAgIC8vIGdldCBhbGwgdXNlcnNcbiAgICB1c2VyRmFjdG9yeS5hbGwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL3VzZXJzJylcbiAgICB9XG5cbiAgICAvLyBjcmVhdGUgdXNlclxuICAgIHVzZXJGYWN0b3J5LmNyZWF0ZSA9IGZ1bmN0aW9uICh1c2VyRGF0YSkge1xuICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9hcGkvdXNlcnMnLCB1c2VyRGF0YSlcbiAgICB9XG5cbiAgICAvLyB1cGRhdGUgdXNlclxuICAgIHVzZXJGYWN0b3J5LnVwZGF0ZSA9IGZ1bmN0aW9uIChpZCwgdXNlckRhdGEpIHtcbiAgICAgIHJldHVybiAkaHR0cC5wdXQoJy9hcGkvdXNlcnMvJyArIGlkLCB1c2VyRGF0YSlcbiAgICB9XG5cbiAgICAvLyBkZWxldGUgdXNlclxuICAgIHVzZXJGYWN0b3J5LmRlbGV0ZSA9IGZ1bmN0aW9uIChpZCkge1xuICAgICAgcmV0dXJuICRodHRwLmRlbGV0ZSgnL2FwaS91c2Vycy8nICsgaWQpXG4gICAgfVxuXG4gICAgdXNlckZhY3RvcnkucHJvZmlsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChBdXRoVG9rZW4uZ2V0VG9rZW4oKSlcbiAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9tZScpXG4gICAgICBlbHNlXG4gICAgICAgIHJldHVybiAkcS5yZWplY3Qoe21lc3NhZ2U6ICdVc2VyIGhhcyBubyB0b2tlbi4nfSlcbiAgICB9XG5cbiAgICB1c2VyRmFjdG9yeS5wcm9maWxlKClcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAvLyBjb25zb2xlLmxvZygncHJvZmlsZSByZXNwb25zZScsIHJlc3AuZGF0YSlcbiAgICAgIH0pXG5cbiAgICByZXR1cm4gdXNlckZhY3RvcnlcbiAgfSlcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==

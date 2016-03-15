// Controller for the overarching page
angular.module('mainCtrl', [])

.controller('mainController', function($rootScope, $location, Auth, User) {

	var vm = this;

	vm.atHome = function () {
		console.log()
		return $location.path() === '/' || $location.path() === ''
	}
	vm.atSignup = function () {
		return $location.path() === '/signup' //|| $location.path() === ''
	}

// It's silly to call this all the time, just in case it's needed, but it's late and i'm tired
// and this needs to get done in very little time.
	User.profile()
		.then(function(resp) {
			vm.teamPref = resp.data.teamPref
	})

// TODO: move this call to a factory and the urls to the backend
	vm.bUrl = function () {
		// console.log('fired')
		// Turns out pictures look bad behind the dash
		// if ($location.path() === '/dash'){
		// 	return teamDashImg(vm.teamPref)
		// }
		var pics = {
			girl: 'https://c2.staticflickr.com/4/3455/3790590480_4bb5c69495_b.jpg',
			stMarys : 'https://c2.staticflickr.com/2/1560/23792983544_d908975115_z.jpg',
			lights : 'https://c2.staticflickr.com/8/7422/12676772194_3053b3eeed_b.jpg',
			champs : 'https://upload.wikimedia.org/wikipedia/commons/3/3a/West_Stand_Champions.jpg'
		}
		var urls = {

			'/signup':pics.stMarys,
			'/' : pics.champs,
			'/dash' : ''
			'/about' : pics.lights
		}
		if (urls[$location.path()] === undefined)
			console.error(''+ $location.path() +' background not defined');
		return urls[$location.path()] !== undefined ? urls[$location.path()] : ''
	}

	function teamDashImg (path) {
		path = path.toLowerCase()
		var defaultImg = 'https://c2.staticflickr.com/2/1560/23792983544_d908975115_z.jpg'
		var teams = {
			'afc' : 'https://c2.staticflickr.com/8/7422/12676772194_3053b3eeed_b.jpg'
		}
		return teams[path] !== undefined ? teams[path] : defaultImg
	}

	vm.hideNav = function () {
      console.log('fired')
      $('.button-collapse').sideNav('hide')
    }

	// get info if a person is logged in
	vm.loggedIn = Auth.isLoggedIn();
	if ($location.path() === '/' && vm.loggedIn)
		$location.path('/dash')

	// check to see if a user is logged in on every request
	$rootScope.$on('$routeChangeStart', function() {
		vm.loggedIn = Auth.isLoggedIn();

		// get user information on page load
		Auth.getUser()
			.then(function(data) {
				vm.user = data.data;
			})
	});

	// function to handle login form
	vm.doLogin = function() {
		vm.processing = true;

		// clear the error
		vm.error = '';

		Auth.login(vm.loginData.username, vm.loginData.password)
			.then(function(data) {
				vm.processing = false;

				// if a user successfully logs in, redirect to users page
				if (data.success)
					$location.path('/dash');
				else
					vm.error = data.message;

			});
	};

	// function to handle logging out
	vm.doLogout = function() {
		Auth.logout();
		vm.user = '';

		$location.path('/');
	};


});

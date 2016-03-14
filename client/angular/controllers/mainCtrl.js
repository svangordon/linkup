// Controller for the overarching page
angular.module('mainCtrl', [])

.controller('mainController', function($rootScope, $location, Auth) {

	var vm = this;
	vm.atHome = function () {
		console.log()
		return $location.path() === '/' || $location.path() === ''
	}
	vm.atSignup = function () {
		console.log('at signup fired')
		return $location.path() === '/signup' //|| $location.path() === ''
	}

	console.log('right place')
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

		$location.path('/login');
	};


});

angular.module('userCtrl', ['userService'])

.controller('userController', function(User) {

	var vm = this;

	// set a processing variable to show loading things
	vm.processing = true;

	// grab all the users at page load
	User.all()
		.success(function(data) {

			// when all the users come back, remove the processing variable
			vm.processing = false;

			// bind the users that come back to vm.users
			vm.users = data;
		});

	// function to delete a user
	vm.deleteUser = function(id) {
		vm.processing = true;

		User.delete(id)
			.success(function(data) {

				// get all users to update the table
				// you can also set up your api
				// to return the list of users with the delete call
				User.all()
					.success(function(data) {
						vm.processing = false;
						vm.users = data;
					});

			});
	};

})

// controller applied to user creation page
.controller('userCreateController', function(User, Team, $location, $timeout, Auth, AuthToken, $window) {
	var vm = this;

	// variable to hide/show elements of the view
	// differentiates between create or edit pages
	vm.type = 'create';

	vm.userData = {  }

	vm.log = function (val) {console.log('log:',val);}

	Team.all()
		.then(function(resp) {
			vm.teams = resp.data.teams

			$timeout(function() {
        $('select').material_select()
      }, 0)

		})

	// function to create a user
	vm.saveUser = function() {
		vm.processing = true;
		vm.message = '';
		var password = vm.userData.password
		// use the create function in the userService
		User.create(vm.userData)
			.then(function(resp) {
				vm.processing = false;
				vm.userData = {  }
				return resp.data
			})
			.then(function (user) {
				Auth.login(user.username, password)
					.then(function(data) {
						vm.processing = false;

						// if a user successfully logs in, redirect to users page
						if (data.success){
							$location.path('/dash');
						}

					});

			})



	};

})

// controller applied to user edit page
.controller('userEditController', function($routeParams, User) {

	var vm = this;

	// variable to hide/show elements of the view
	// differentiates between create or edit pages
	vm.type = 'edit';

	// get the user data for the user you want to edit
	// $routeParams is the way we grab data from the URL
	User.get($routeParams.user_id)
		.success(function(data) {
			vm.userData = data;
		});

	// function to save the user
	vm.saveUser = function() {
		vm.processing = true;
		vm.message = '';

		// call the userService function to update
		User.update($routeParams.user_id, vm.userData)
			.success(function(data) {
				vm.processing = false;

				// clear the form
				vm.userData = {};

			});
	};

});

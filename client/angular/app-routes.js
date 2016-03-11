angular.module('linkupRoutes', ['ngRoute'])

  // configure our routes
  .config(function($routeProvider, $locationProvider) {
    $routeProvider
      // homepage
      .when('/', {
        templateUrl : '/angular/views/pages/home.html'
        // , controller : 'homeController'
        // , controllerAs : 'home'
      })

      // route for about page
      .when('/about', {
        templateUrl : '/angular/views/pages/about.html'
        // , controller : 'aboutController'
        // , controllerAs : 'about'
      })

      // login route
      .when('/login', {
        templateUrl : '/angular/views/pages/login.html'
        , controller : 'mainController'
        , controllerAs : 'login'
      })

      // show all users
  		.when('/users', {
  			templateUrl: '/angular/views/pages/users.html',
  			controller: 'userController',
  			controllerAs: 'user'
  		})

      .when('/dash', {
        templateUrl: '/angular/views/pages/dash/dash.html'
      })

      //

      $locationProvider.html5Mode(true)
  })

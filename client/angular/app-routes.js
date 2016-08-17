angular.module('linkupRoutes', ['ngRoute'])

  // configure our routes
  .config(function($routeProvider, $locationProvider) {
    $routeProvider
      // homepage
      .when('/', {
        templateUrl : 'public/html/pages/home.html'
        // , controller : 'homeController'
        // , controllerAs : 'home'
      })

      // route for about page
      .when('/about', {
        templateUrl : 'public/html/pages/about.html'
        // , controller : 'aboutController'
        // , controllerAs : 'about'
      })

      // login route
      .when('/login', {
        templateUrl : 'public/html/pages/login.html'
        , controller : 'mainController'
        , controllerAs : 'login'
      })

      .when('/dash', {
        templateUrl: 'public/html/pages/dash/dash.html',
        controller: 'dashController',
        controllerAs: 'vm'
      })

      .when('/signup', {
        templateUrl: 'public/html/pages/signup.html',
        controller: 'userCreateController',
        controllerAs: 'vm'
      })

      //
    var devMode = false;
    if (!devMode) $locationProvider.html5Mode(true)
  })

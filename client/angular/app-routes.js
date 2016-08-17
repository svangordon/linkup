angular.module('linkupRoutes', ['ngRoute'])

  // configure our routes
  .config(function($routeProvider, $locationProvider) {
    $routeProvider
      // homepage
      .when('/', {
        templateUrl : 'html/pages/home.html'
        // , controller : 'homeController'
        // , controllerAs : 'home'
      })

      // route for about page
      .when('/about', {
        templateUrl : 'html/pages/about.html'
        // , controller : 'aboutController'
        // , controllerAs : 'about'
      })

      // login route
      .when('/login', {
        templateUrl : 'html/pages/login.html'
        , controller : 'mainController'
        , controllerAs : 'login'
      })

      .when('/dash', {
        templateUrl: 'html/pages/dash/dash.html',
        controller: 'dashController',
        controllerAs: 'vm'
      })

      .when('/signup', {
        templateUrl: 'html/pages/signup.html',
        controller: 'userCreateController',
        controllerAs: 'vm'
      })

      //
    var devMode = false;
    if (!devMode) $locationProvider.html5Mode(true)
  })

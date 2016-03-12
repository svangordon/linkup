angular.module('linkupApp', [
  'linkupRoutes',
  'authService',
  'userService',
  'mainCtrl',
  'userCtrl',
  'dashCtrl',
  'dataService',
  'signupDirectives'


])
  .config(function ($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor')
  })

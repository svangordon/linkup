angular.module('linkupApp', [
  'linkupRoutes',
  'authService',
  'userService',
  'mainCtrl',
  'userCtrl',
  'dashCtrl',
  'dataService'


])
  .config(function ($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor')
  })

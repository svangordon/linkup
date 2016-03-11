angular.module('linkupApp', [
  'linkupRoutes',
  'authService',
  'userService',
  'mainCtrl',
  'userCtrl'


])
  .config(function ($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor')
  })

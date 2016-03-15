angular.module('linkupApp', [
  'linkupRoutes',
  'authService',
  'userService',
  'mainCtrl',
  'userCtrl',
  'dashCtrl',
  'dataService',
  'dashFilters',
  'socialService'

])
  .config(function ($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor')
  })

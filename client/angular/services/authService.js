angular.module('authService', [])

  .factory('Auth', function($http, $q, AuthToken) {
    var authFactory = {}

    // login
    authFactory.login = function (username, password) {
      return $http.post('/api/authenticate', {
        username: username,
        password: password
      })
        .then(function(data) {
          AuthToken.setToken(data.data.token)
          return data.data
        })
    }

    // logout
    authFactory.logout = function () {
      // clear token
      AuthToken.setToken()
    }

    // check if logged in
    authFactory.isLoggedIn = function () {
      if (AuthToken.getToken())
        return true
      else
        return false
    }

    // get user info
    authFactory.getUser = function () {
      if (AuthToken.getToken())
        return $http.get('/api/me')
      else
        return $q.reject({message: 'User has no token.'})
    }

    return authFactory

  })

  .factory('AuthToken', function($window) {
    var authTokenFactory = {}

    // get token from local storage
    authTokenFactory.getToken = function () {
      return $window.localStorage.getItem('token')
    }

    // set or clear token
    authTokenFactory.setToken = function (token) {
      if (token)
        $window.localStorage.setItem('token', token)
      else
        $window.localStorage.removeItem('token')
    }

    return authTokenFactory
  })

  .factory('AuthInterceptor', function($q, $location, AuthToken) {
    var interceptorFactory = {}

    // attach token to every request
    interceptorFactory.request = function(config) {
      console.log('interceptor fired')
      var token = AuthToken.getToken()
      if (token)
        config.headers['x-access-token'] = token
      return config
    }

    // redirect if bad token
    interceptorFactory.responseError = function (response) {
      if (response.status == 403)
        $location.path('/login')
      return $q.reject(response)
    }
    return interceptorFactory
  })

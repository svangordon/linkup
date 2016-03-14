angular.module('userService', ['authService'])

  .factory('User', function($http, AuthToken, $q){
    var userFactory = {}

    // get single user
    userFactory.get = function (id) {
      return $http.get('/api/users/' + id)
    }

    // get all users
    userFactory.all = function () {
      return $http.get('/api/users')
    }

    // create user
    userFactory.create = function (userData) {
      return $http.post('/api/users', userData)
    }

    // update user
    userFactory.update = function (id, userData) {
      return $http.put('/api/users/' + id, userData)
    }

    // delete user
    userFactory.delete = function (id) {
      return $http.delete('/api/users/' + id)
    }

    userFactory.profile = function () {
      if (AuthToken.getToken())
        return $http.get('/api/me')
      else
        return $q.reject({message: 'User has no token.'})
    }

    userFactory.profile()
      .then(function(resp){
        console.log('profile response', resp.data)
      })

    return userFactory
  })

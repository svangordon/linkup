angular.module('userService', [])

  .factory('User', function($http){
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
      console.log('userfac ud', userData);
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

    return userFactory
  })

angular.module('socialService', ['dataService'])

  .factory('Twitter', function ($http, Team) {
    var twitterFactory = {}

    twitterFactory.test = function (){
      return $http.get('/api/tw/test')
    }

    twitterFactory.search = function (teamId) {
      return $http.get('/api/tw/search/' + teamId)
    }

    twitterFactory.getOne = function (id) {
      return $http.get('/api/tw/getOne/' + id)
    }

    // twitterFactory.timeline = function (teamCode) {
    //   var hash = teamHash(teamCode)
    //   console.log(hash)
    //   var partOne = '<a class="twitter-timeline" href="https://twitter.com/hashtag/'
    //   var partTwo = '" data-widget-id="709791211947630592">#'
    //   var partThree = "Tweets</a> <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document,'script','twitter-wjs');</script>"
    //
    //   console.log(partOne + hash + partTwo + hash + partThree);
    //
    //   return partOne + hash + partTwo + hash + partThree
    // }

    // function teamHash (teamCode) {
    //   teamCode = teamCode.toLowerCase()
    //   console.log(teamCode)
    //   var lookup = {
    //     'swa' : 'SwanseaCity',
    //     'cry' : 'cpfc'
    //   }
    //   return lookup[teamCode]
    // }

    return twitterFactory
  })

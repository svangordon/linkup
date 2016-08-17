// It looks like this was tabbed out but never used
angular.module('signupDirectives', [])
.directive('myRepeatDirective', function($timeout) {
  return function(scope, element, attrs) {
    if (scope.$last){
      console.log('hi')
    }
  };
})

angular.module('signupDirectives', [])
.directive('myRepeatDirective', function($timeout) {
  return function(scope, element, attrs) {
    if (scope.$last){
      // $timeout(function() {
      //   $('select').material_select()
      // }, 0)
      // window.alert(element);
    }
  };
})

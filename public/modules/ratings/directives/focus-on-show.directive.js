(function() {
  'use strict';
  angular.module('ratings')
  .directive('focusOnShow', focusOnShow);

  function focusOnShow($timeout) {
    return function(scope, element, attrs) {
       scope.$watch(attrs.focusOnShow, function (newValue) {
//            console.log('preview changed!')
            $timeout(function() {
                var myValue = newValue && element[0].focus();
                return myValue;
            });
         },true);
      };
    }
})();

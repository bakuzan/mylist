(function() {
  'use strict';
  angular.module('core')
  .directive('malSearch', malSearch);
  malSearch.$inject = ['MalService', '$timeout'];

  function malSearch(MalService, $timeout) {
      return {
          restrict: 'A',
          require: 'ngModel',
          scope: {
            model: '=ngModel',
            type: '@malSearch'
          },
          link: function (scope, element, attrs) {

            function searchMal(type, searchString) {
              MalService.search(type, searchString).then(function (result) {
                console.log('search directive result: ', result);
              });
            }

            var timeoutPromise;
            var delayInMs = 2000;
            scope.$watch('model', function(newValue) {
              if(newValue !== undefined && newValue.length > 3) {
                $timeout.cancel(timeoutPromise);  //does nothing, if timeout alrdy done
                timeoutPromise = $timeout(function() {
                     searchMal(scope.type, newValue);
                }, delayInMs);
              }
            });

          }
      };
  }

})();

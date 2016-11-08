(function() {
  'use strict';
  angular.module('core')
  .directive('malSearch', malSearch);
  malSearch.$inject = ['MalService', '$timeout'];

  function malSearch(MalService, $timeout) {
      return {
          restrict: 'A',
          replace: true,
          scope: {
            type: '@malSearch'
          },
          controllerAs: 'malSearchCtrl',
          bindToController: true,
          templateUrl: '/modules/core/templates/mal-search.html',
          controller: function ($scope) {

            function searchMal(type, searchString) {
              MalService.search(type, searchString).then(function (result) {
                console.log('search directive result: ', result);
                $scope.searchResults = result.data; //something like this?
              });
            }

            var timeoutPromise;
            var delayInMs = 2000;
            $scope.$watch('searchString', function(newValue) {
              if(newValue !== undefined && newValue.length > 3) {
                $timeout.cancel(timeoutPromise);  //does nothing, if timeout alrdy done
                timeoutPromise = $timeout(function() {
                     searchMal($scope.type, newValue);
                }, delayInMs);
              }
            });

          }
      };
  }

})();

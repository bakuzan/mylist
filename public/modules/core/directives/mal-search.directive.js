(function() {
  'use strict';
  angular.module('core')
  .directive('malSearch', malSearch);
  malSearch.$inject = ['MalService'];

  function malSearch(MalService) {
      return {
          restrict: 'A',
          require: 'ngModel',
          scope: {
            model: '=ngModel'
          },
          link: function (scope, element, attrs) {

            function searchMalAnime(searchString) {
              MalService.search('anime', searchString).then(function(result) {
                console.log('anime search: ', result);
              });
            }

            scope.$watch('model', function(newValue) {
              if(newValue !== undefined && newValue.length > 3) {
                searchMalAnime(newValue);
              }
            });

          }
      };
  }

})();

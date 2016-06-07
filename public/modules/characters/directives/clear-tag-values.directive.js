(function() {
  'use strict';
  angular.module('characters')
  .directive('clearTagValues', clearTagValues);

  function clearTagValues() {
      return function (scope, element, attrs) {
          element.bind('click', function(event) {
  //            console.log('clear tags');
              scope.$apply(function() {
                  scope.filterConfig.searchTags = '';
                  scope.filterConfig.characterTags = '';
                  scope.filterConfig.tagsForFilter = [];
              });
          });
      };
  }

})();

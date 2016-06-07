(function() {
  'use strict';
  angular.module('animeitems')
  .directive('listFilters', listFilters);

  function listFilters() {
      return {
          restrict: 'EA',
          replace: true,
          scope: {
              filterConfig: '=',
              items: '=',
              page: '='
          },
          templateUrl: '/modules/animeitems/templates/list-filters.html',
          link: function(scope, elem, attrs) {
              scope.filterConfig.searchTags = '';
              scope.passTag = function(tag) {
                if (scope.filterConfig.searchTags.indexOf(tag) === -1) {
                    scope.filterConfig.searchTags += tag + ',';
                    scope.filterConfig.tagsForFilter = scope.filterConfig.searchTags.substring(0, scope.filterConfig.searchTags.length - 1).split(',');
                }
              };
              //rating 'tooltip' function
              scope.hoveringOver = function(value) {
                scope.filterConfig.ratingActions.overStar = value;
                scope.filterConfig.ratingActions.percent = 100 * (value / scope.filterConfig.ratingActions.maxRating);
              };

              scope.itemsAvailable = function() {
                scope.filterConfig.getItemsAvailable();
              };

              scope.collapseFilters = function() {
                scope.filterConfig.expandFilters = false;
              };

          }

      };
  }

})();

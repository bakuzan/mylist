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
            type: '=malSearch',
            selectItem: '=malSearchSelect',
            searchString: '=malSearchModel',
            options: '=malSearchOptions'
          },
          controllerAs: 'malSearchCtrl',
          bindToController: true,
          templateUrl: '/modules/core/templates/mal-search.html',
          controller: function ($scope) {
            var self = this;

            self.hasSearchResults = false;
            self.processItem = processItem;
            self.searchResults = [];
            self.selectedItem = null;
            console.log('mal search scope: ', $scope);
            function processItem(item) {
              console.log('processItem :', item);
              self.selectItem(item);
              self.selectedItem = item;
            }

            function searchMal(type, searchString) {
              MalService.search(type, searchString).then(function (result) {
                console.log('search directive result: ', result);
                self.searchResults = result;
                self.hasSearchResults = true;
              });
            }

            var timeoutPromise;
            var delayInMs = 2000;
            $scope.$watch('malSearchCtrl.searchString', function(newValue) {
              if(newValue !== undefined && newValue.length > 2) {
                $timeout.cancel(timeoutPromise);  //does nothing, if timeout alrdy done
                timeoutPromise = $timeout(function() {
                     searchMal(self.type, newValue);
                }, delayInMs);
              }
            });

          }
      };
  }

})();

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
            var self = this,
                timeoutPromise,
                delayInMs = 2000;

            self.displayActions = false;
            self.displaySelectedItemActions = displaySelectedItemActions;
            self.hasFocus = false;
            self.hasSearchResults = false;
            self.processItem = processItem;
            self.searchResults = [];
            self.selectedItem = null;
            self.selectedItemActions = [
              {
                displayText: 'Remove selected',
                action: function() {
                  self.processItem(null);
                  self.searchString = undefined;
                  self.displayActions = false;
                }
              },
              {
                displayText: 'Display raw json',
                action: function() {
                  self.displayRawJson = true;
                }
              }
            ];
            self.toggleSearchDropdownOnFocus = toggleSearchDropdownOnFocus;

            console.log('mal search scope: ', $scope);

            function processItem(item) {
              self.selectItem(item);
              self.selectedItem = item;
            }

            function displaySelectedItemActions() {
              self.displayActions = true;
            }

            function searchMal(type, searchString) {
              MalService.search(type, searchString).then(function (result) {
                self.searchResults = result;
                self.hasSearchResults = true;
              });
            }

            function toggleSearchDropdownOnFocus(event) {
              $timeout(function() {
                self.hasFocus = event.type === 'focus';
              }, 500);
            }

            $scope.$watch('malSearchCtrl.searchString', function(newValue) {
              self.hasFocus = true;
              if(newValue !== undefined && newValue.length > 2 && self.selectedItem === null) {
                $timeout.cancel(timeoutPromise);
                timeoutPromise = $timeout(function() {
                     searchMal(self.type, newValue);
                }, delayInMs);
              }
            });

            $scope.$watch('malSearchCtrl.displayActions', function(nv) {
              if(nv !== undefined) {
                console.log(nv, $scope);
              }
            });

          }
      };
  }

})();

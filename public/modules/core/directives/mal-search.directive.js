(function() {
  'use strict';
  angular.module('core')
  .directive('malSearch', malSearch);
  malSearch.$inject = ['MalService', '$timeout', 'spinnerService'];

  function malSearch(MalService, $timeout, spinnerService) {
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
          controller: function($scope) {
            var self = this,
                timeoutPromise,
                delayInMs = 2000;

            self.displayActions = false;
            self.displaySelectedItemActions = displaySelectedItemActions;
            self.handleSearchString = handleSearchString;
            self.hasFocus = false;
            self.hasSearchResults = false;
            self.processItem = processItem;
            self.searchResults = [];
            self.selectedItem = null;
            self.selectedItemActions = [
              {
                displayText: 'Remove selected',
                action: () => {
                  self.processItem(null);
                  self.searchString = undefined;
                  self.displayActions = false;
                }
              },
              {
                displayText: 'Display raw json',
                action: () => {
                  self.displayRawJson = true;
                }
              }
            ];
            self.spinner = `mal-search-${self.options.name}`;
            self.toggleSearchDropdownOnFocus = toggleSearchDropdownOnFocus;

            function processItem(item) {
              self.selectItem(item);
              self.selectedItem = item;
            }

            function displaySelectedItemActions() {
              self.displayActions = true;
            }

            function searchMal(type, searchString) {
              MalService.search(type, searchString).then(result => {
                self.searchResults = result;
                self.hasSearchResults = true;
                spinnerService.hide(self.spinner);
              });
            }

            function toggleSearchDropdownOnFocus(event) {
              $timeout(() => {
                self.hasFocus = event.type === 'focus';
              }, 500);
            }

            function handleSearchString(event) {
              console.log(`handle : `, event);
              self.hasFocus = true;
              if(self.searchString !== undefined && self.searchString.length > 2 && self.selectedItem === null && !self.options.disabled) {
                $timeout.cancel(timeoutPromise);
                spinnerService.show(self.spinner);
                timeoutPromise = $timeout(() => {
                  searchMal(self.type, self.searchString);
                }, delayInMs);
              }
            }

            // $scope.$watch('malSearchCtrl.searchString', function(newValue) {
            //   self.hasFocus = true;
            //   if(newValue !== undefined && newValue.length > 2 && self.selectedItem === null && !self.options.disabled) {
            //     $timeout.cancel(timeoutPromise);
            //     timeoutPromise = $timeout(function() {
            //          searchMal(self.type, newValue);
            //     }, delayInMs);
            //   }
            // });

            $scope.$watch('malSearchCtrl.displayActions', newValue => {
              if(newValue !== undefined && !newValue) {
                self.displayRawJson = newValue;
              }
            });

          }
      };
  }

})();

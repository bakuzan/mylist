(function() {
  'use strict';
  angular.module('statistics')
  .directive('tabContainer', tabContainer);

  function tabContainer() {
    return {
        restrict: 'A',
        transclude: true,
        replace: true,
        scope: {
            model: '=ngModel'
        },
        templateUrl: '/modules/statistics/templates/tab-container.html',
        require: '?ngModel',
        bindToController: true,
        controllerAs: 'tabContainer',
        controller: function($scope) {
            var self = this;
            self.tabs = [];
            self.currentTab = undefined;
            self.listShift = 0;

            self.addTab = function addTab(tab) {
                self.tabs.push(tab);

                if(self.tabs.length === 1) {
                    tab.active = true;
                }
            };

            self.disable = function(disabledTab) {
                if(disabledTab.active) {
                    angular.forEach(self.tabs, function(tab) {
                        if(!tab.disabled) {
                            self.select(tab);
                            return;
                        }
                    });
                }
            };

            self.select = function(selectedTab) {
                if(!selectedTab.disabled) {
                    angular.forEach(self.tabs, function(tab) {
                        if(tab.active && tab !== selectedTab) {
                          tab.active = false;
                        }
                    });
                    selectedTab.active = true;
                    self.currentTab = ($scope.tabContainer.model === undefined) ? undefined : selectedTab.heading;
                }
            };

            self.shiftTabs = function(direction) {
                switch(direction) {
                    case 'origin':
//                        console.log(self.listShift, (self.listShift - 100));
                        if ((self.listShift + 100) > 0) {
                            self.listShift = 0;
                        } else {
                            self.listShift += 100;
                        }
                        break;

                    case 'offset':
                        if ((self.listShift - 100) < ($scope.elWidth - $scope.ulWidth)) {
                            self.listShift = $scope.elWidth - $scope.ulWidth;
                        } else {
                            self.listShift -= 100;
                        }
                        break;
                }
            };

        },
        link: function(scope, element, attrs, model) {
            var el = element[0],
                ul = el.children[0].children[0];
            scope.elWidth = el.offsetWidth;
            scope.ulWidth = ul.offsetWidth;

            scope.$watch('tabContainer.currentTab', function(newValue) {
                if (newValue !== undefined && model.$viewValue !== undefined) {
                    model.$setViewValue(newValue);
                }
            });

            scope.$watch(
                function () {
                    return {
                        width: el.offsetWidth,
                    };
                }, function () {
                    scope.elWidth = el.offsetWidth;
                }, true
            );

            scope.$watch(
                function () {
                    return {
                        width: ul.offsetWidth,
                    };
                }, function () {
                    scope.ulWidth = ul.offsetWidth;
                }, true
            );

            scope.$watch('tabContainer.listShift', function(newValue) {
                if(newValue !== undefined) {
                    var shift = (newValue === 0) ? '' : 'px';
                    ul.style.left = newValue + shift;
                }
            });

        }
    };
  }

})();

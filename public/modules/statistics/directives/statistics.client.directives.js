'use strict';

angular.module('statistics')
.directive('tabContainer', function () {
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
})
.directive('tabView', function () {
    return {
        restrict: 'A',
        transclude: true,
        replace: true,
        template: '<div class="tab-view" role="tabpanel" ng-show="active" ng-transclude></div>',
        require: '^tabContainer',
        scope: {
            heading: '@',
            disabled: '='
        },
        link: function (scope, element, attrs, tabContainerCtrl) {
            scope.active = false;
            tabContainerCtrl.addTab(scope);
            
            scope.$watch('disabled', function(newValue) {
                if(newValue !== undefined) {
                    if(newValue) {
                        console.log(scope.heading, newValue);
                        tabContainerCtrl.disable(scope);
                    }
                }
            });
        }
    };
})
.directive('detectFlood', ['$timeout', function($timeout) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var el = element[0];
            
            function overflowCheck() {
                if (el.scrollWidth > el.offsetWidth) {
                    el.classList.add('flooded');
                } else {
                    el.classList.remove('flooded');
                }
            }
            overflowCheck();
            
            scope.$watch(
                function () {
                    return {
                        width: el.offsetWidth,
                    };
                }, function () {
//                    console.log('detect flood?');
                        overflowCheck();
                }, true
            );
            
        }
    };
}])
.directive('percentageBarContainer', function() {
  return {
      restrict: 'A',
      replace: true,
      transclude: true,
      bindToController: true,
      template: '<div class="relative" style="height: 20px;" ng-transclude></div>',
      controllerAs: 'percentageBarContainer',
      controller: function($scope) {
          
      }
  };
})
.directive('percentageBar', function() {
    return {
        restrict: 'A',
        replace: true,
        scope: {
            type: '@?',
            percentage: '@',
            colour: '@?',
            display: '@?'
        },
        require: '^percentageBarContainer',
        templateUrl: '/modules/statistics/templates/percentage-bar.html',
        link: function(scope, element, attrs, percentageBarContainerCtrl) {

        }
    };
});
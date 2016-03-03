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
            
            self.select = function(selectedTab) {
                angular.forEach(self.tabs, function(tab) {
                    if(tab.active && tab !== selectedTab) {
                      tab.active = false;
                    }
                });
                selectedTab.active = true;
                self.currentTab = ($scope.tabContainer.model === undefined) ? undefined : selectedTab.heading;
            };
            
            self.shiftTabs = function(direction) {
                switch(direction) {
                    case 'origin':
                        console.log(self.listShift, (self.listShift - 100));
                        self.listShift += ((self.listShift + 100) > 0) ? 0 : 100;
                        break;
                        
                    case 'offset':
                        self.listShift -= 100;
                        break;
                }
            };
            
        },
        link: function(scope, element, attrs, model) {
            var el = element[0],
                ul = el.children[0];
            
            scope.$watch('tabContainer.currentTab', function(newValue) {
                if (newValue !== undefined && model.$viewValue !== undefined) {
                    model.$setViewValue(newValue);
                }
            });
            
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
            heading: '@'
        },
        link: function (scope, element, attrs, tabContainerCtrl) {
            scope.active = false;
            tabContainerCtrl.addTab(scope);
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
                        width: element.width(),
                    };
                }, function () {
                    $timeout(function () {
                        overflowCheck();
                    }, 250);
                }, true
            );
            
        }
    };
}]);
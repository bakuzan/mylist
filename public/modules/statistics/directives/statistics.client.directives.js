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
            console.log($scope);
            var self = this;
            self.tabs = [];
            self.currentTab = undefined;
            
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
        },
        link: function(scope, element, attrs, model) {
            scope.$watchCollection('tabContainer.currentTab', function(newValue) {
                if (newValue !== undefined && model.$viewValue !== undefined) {
                    model.$setViewValue(newValue);
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
});
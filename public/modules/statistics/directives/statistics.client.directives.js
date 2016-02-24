'use strict';

angular.module('statistics')
.directive('tabContainer', function () {
    return {
        restrict: 'A',
        transclude: true,
        replace: true,
        scope: {},
        templateUrl: '/modules/statistics/templates/tab-container.html',
        bindToController: true,
        controllerAs: 'tabcontainer',
        controller: function() {
            var self = this;
            self.tabs = [];
            
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
            };
        }
    };
})
.directive('tabView', function () {
    return {
        restrict: 'A',
        transclude: true,
        replace: true,
        template: '<div role="tabpanel" ng-show="active" ng-transclude></div>',
        require: '^tabcontainer',
        scope: {
            heading: '@'
        },
        link: function (scope, element, attrs, tabcontainerCtrl) {
            console.log(tabcontainerCtrl);
            scope.active = false;
            tabcontainerCtrl.addTab(scope);
        }
    };
});
'use strict';

angular.module('statistics')
.directive('tabCollection', ['ListService', 'NotificationFactory', function (ListService, NotificationFactory) {
    return {
        restrict: 'A',
        transclude: true,
        scope: {},
        templateUrl: '/modules/statistics/templates/tab-collection.html',
        bindToController: true,
        controllerAs: 'tabcollection',
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
}])
.directive('tabView', ['ListService', 'NotificationFactory', function (ListService, NotificationFactory) {
    return {
        restrict: 'A',
        transclude: true,
        template: '<div role="tabpanel" ng-show="active" ng-transclude></div>',
        require: '^tabcollection',
        scope: {
            heading: '@'
        },
        link: function (scope, element, attrs, tabCollectionCtrl) {
            scope.active = false;
            tabCollectionCtrl.addTab(scope);
        }
    };
}]);
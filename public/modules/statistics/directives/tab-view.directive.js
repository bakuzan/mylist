(function() {
  'use strict';
  angular.module('statistics')
  .directive('tabView', tabView);

  function tabView() {
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
  }

})();

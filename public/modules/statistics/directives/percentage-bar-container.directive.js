(function() {
  'use strict';
  angular.module('statistics')
  .directive('percentageBarContainer', percentageBarContainer);

  function percentageBarContainer() {
    return {
        restrict: 'A',
        replace: true,
        scope: {
          border: '@?'
        },
        transclude: true,
        bindToController: true,
        template: '<div class="relative {{percentageBarContainer.border}}" style="height: 20px;" ng-transclude></div>',
        controllerAs: 'percentageBarContainer',
        controller: function($scope) {

        }
    };
  }

})();

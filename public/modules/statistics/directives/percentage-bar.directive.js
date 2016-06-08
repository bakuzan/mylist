(function() {
  'use strict';
  angular.module('statistics')
  .directive('percentageBar', percentageBar);

  function percentageBar() {
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
  }

})();

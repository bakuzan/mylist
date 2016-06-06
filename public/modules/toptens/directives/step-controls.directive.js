(function() {
  'use strict';
  angular.module('toptens')
  .directive('stepControls', stepControls);
    function stepControls() {
       return {
           restrict: 'A',
           replace: true,
           transclude: true,
           template: '<div class="step-controls step-button-group padding-5" ng-transclude>' +
                      '</div>'
       };
    }

})();

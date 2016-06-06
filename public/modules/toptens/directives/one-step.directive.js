(function() {
  'use strict';
  angular.module('toptens')
  .directive('oneStep', oneStep);

  function oneStep() {
    return {
        restrict: 'A',
        replace: true,
        transclude: true,
        scope: {},
        require: '^steps',
        templateUrl: '/modules/toptens/templates/step.html',
        link: function(scope, elm, attrs, stepsController) {
            scope.active = false;
            scope.stepNumber = elm.index() + 1;
            stepsController.register(scope);
        }
    };
  }

})();

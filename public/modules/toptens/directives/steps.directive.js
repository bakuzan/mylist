(function() {
  'use strict';
  angular.module('toptens')
  .directive('steps', steps);
  function steps() {
    return {
        restrict: 'A',
        transclude: true,
        scope: {
            stepConfig: '='
        },
        template: '<div class="steps" ng-transclude>' +
                  '</div>',
        bindToController: true,
        controllerAs: 'steps',
        controller: function($scope) {
            var self = this;

            self.register = register;
            self.steps = [];

            function register(step) {
                self.steps.push(step);
                if(step.stepNumber === 1) {
                    step.active = true;
                }
            }
        },
        link: function(scope, element, attrs, stepsController) {
          scope.$watch('steps.stepConfig.currentStep', function(newValue) {
              if (newValue !== undefined) {
                console.log('steps: ', newValue);
                  angular.forEach(stepsController.steps, function(step) {
                      if(step.stepNumber !== newValue) {
                          step.active = false;
                      } else {
                          step.active = true;
                      }
                  });
              }
          });
        }
    };
  }

})();

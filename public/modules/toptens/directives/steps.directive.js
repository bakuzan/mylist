(function() {
  'use strict';
  angular.module('toptens')
  .directive('steps', steps);
  function steps() {
    return {
        restrict: 'A',
        replace: true,
        transclude: true,
        scope: {
            stepConfig: '='
        },
        template:
        `<div class="steps">
          <ng-transclude></ng-transclude>
          <div step-controls>
           </div>
         </div>`,
        bindToController: true,
        controllerAs: 'steps',
        controller: function($scope) {
            var self = this;
            console.log('steps: ', self);
            self.catchFunctions = catchFunctions;
            self.catchFunctions();
            self.register = register;
            self.steps = [];

            function register(step) {
                self.steps.push(step);
                if(step.stepNumber === 1) {
                    step.active = true;
                }
            }

            function catchFunctions() {
              if(!self.stepConfig.takeStep) self.stepConfig.takeStep = takeStep;
              if(!self.stepConfig.backStep) self.stepConfig.backStep = backStep;
            }

            function takeStep() {
              self.stepConfig.currentStep += 1;
            }

            function backStep() {
              self.stepConfig.currentStep -= 1;
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

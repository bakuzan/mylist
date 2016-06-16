(function() {
  'use strict';
  angular.module('toptens')
  .directive('stepControls', stepControls);
    function stepControls() {
       return {
           restrict: 'A',
           replace: true,
           transclude: true,
           require: '^steps',
           template:
           `<div class="step-controls step-button-group">
                <md-button class="md-primary"
                        ng-click="steps.stepConfig.cancel()" ng-show="steps.stepConfig.currentStep === 1">CANCEL</md-button>
                <md-button class="md-primary"
                        ng-click="steps.stepConfig.backStep(steps.stepConfig.currentStep)" ng-show="steps.stepConfig.currentStep > 1">BACK</md-button>
                <md-button class="md-primary"
                        ng-click="steps.stepConfig.takeStep(steps.stepConfig.currentStep)" ng-show="steps.stepConfig.currentStep < steps.steps.length">NEXT</md-button>
                <md-button class="md-primary"
                        ng-click="steps.stepConfig.submit()" ng-show="steps.stepConfig.currentStep === steps.steps.length"
                        ng-disabled="scheduleForm.$invalid">SUBMIT</md-button>
            </div>`
       };
    }

})();

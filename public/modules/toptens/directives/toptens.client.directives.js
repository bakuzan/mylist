'use strict';

angular.module('toptens')
.directive('steps', function() {
    return {
        restrict: 'A',
        replace: true,
        transclude: true,
        template: '<div class="steps" ng-transclude>' +
                  '</div>'
    };
})
.directive('step', function() {
  return {
      restrict: 'A',
      replace: true,
      transclude: true,
      scope: {
          stepConfig: '='
      },
      templateUrl: '/modules/toptens/templates/step.html',
      link: function(scope, elm, attrs) {
          scope.stepNumber = elm.index() + 1;
          scope.$watch('stepConfig.currentStep', function(newValue) {
              if (newValue !== undefined) {
                  var element = document.getElementById('step-'+scope.stepNumber);
                  if (scope.stepNumber === scope.stepConfig.currentStep) {
                      element.classList.remove('step-transition');
                      element.classList.remove('step-out');
                      element.style.zIndex = 2;
                      element.classList.add('step-transition');
                      element.classList.add('step-in');
                  } else {
                      element.classList.remove('step-transition');
                      element.classList.remove('step-in');
                      element.style.zIndex = 1;
                      element.classList.add('step-transition');
                      element.classList.add('step-out');
                  }
              }
          });
      }
  };  
})
.directive('stepControls', function() {
   return {
       restrict: 'A',
       replace: true,
       transclude: true,
       template: '<div class="step-controls form-group step-button-group padding-5" ng-transclude>' +
                  '</div>'
   };
});
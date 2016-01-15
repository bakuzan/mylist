'use strict';

angular.module('toptens')
.directive('step', function() {
  return {
      restrict: 'A',
      replace: true,
      transclude: true,
      scope: {
          current: '@',
          number: '@'
      },
      template: '<div class="step" ng-style="{\'z-index\': {{current}} === {{number}} ? 2 : 1 }" ng-class="({{current}} === {{number}}) ? \'step-transition step-in\' : \'step-transition step-out\'"> ' + 
              '<div class="step-inner-container">' +  
                  '<ng-transclude></ng-transclude>' + 
              ' </div>' + 
           '</div>'
      
  };
    
});
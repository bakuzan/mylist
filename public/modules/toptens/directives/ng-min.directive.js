(function() {
  'use strict';
  angular.module('toptens')
  .directive('ngMin', ngMin);

  function ngMin() {
      return {
          restrict: 'A',
          require: 'ngModel',
          link: function(scope, elem, attr, ctrl) {
              scope.$watch(attr.ngMin, function(){
                  if (ctrl.$isDirty) ctrl.$setViewValue(ctrl.$viewValue);
              });

              var isEmpty = function(value) {
                 return angular.isUndefined(value) || value === '' || value === null;
              };

              var minValidator = function(value) {
                var min = scope.$eval(attr.ngMin) || 0;
                if (!isEmpty(value) && value < min) {
                  ctrl.$setValidity('ngMin', false);
                  return undefined;
                } else {
                  ctrl.$setValidity('ngMin', true);
                  return value;
                }
              };

              ctrl.$parsers.push(minValidator);
              ctrl.$formatters.push(minValidator);
          }
      };
  }

})();

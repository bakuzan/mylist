(function() {
  'use strict';
  angular.module('toptens')
  .directive('ngMax', ngMax);

  function ngMax() {
      return {
          restrict: 'A',
          require: 'ngModel',
          link: function(scope, elem, attr, ctrl) {

              scope.$watch(attr.ngMax, function(){
                  if (ctrl.$isDirty) ctrl.$setViewValue(ctrl.$viewValue);
              });

              var isEmpty = function(value) {
                 return angular.isUndefined(value) || value === '' || value === null;
              };

              var maxValidator = function(value) {
                var max = scope.$eval(attr.ngMax) || Infinity;
                if (!isEmpty(value) && value > max) {
                  ctrl.$setValidity('ngMax', false);
                  return undefined;
                } else {
                  ctrl.$setValidity('ngMax', true);
                  return value;
                }
              };

              ctrl.$parsers.push(maxValidator);
              ctrl.$formatters.push(maxValidator);
          }
      };
  }

})();

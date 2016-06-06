(function() {
  'use strict';
  angular.module('toptens')
  .directive('ngMax', ngMax);

  function ngMax() {
      return {
          restrict: 'A',
          require: 'ngModel',
          link: function(scope, elem, attr, ctrl) {
            var isEmpty = isEmpty,
                maxValidator = maxValidator;

              scope.$watch(attr.ngMax, function(){
                  if (ctrl.$isDirty) ctrl.$setViewValue(ctrl.$viewValue);
              });

              function isEmpty(value) {
                 return angular.isUndefined(value) || value === '' || value === null;
              }

              function maxValidator(value) {
                var max = scope.$eval(attr.ngMax) || Infinity;
                if (!isEmpty(value) && value > max) {
                  ctrl.$setValidity('ngMax', false);
                  return undefined;
                } else {
                  ctrl.$setValidity('ngMax', true);
                  return value;
                }
              }

              ctrl.$parsers.push(maxValidator);
              ctrl.$formatters.push(maxValidator);
          }
      };
  }

})();

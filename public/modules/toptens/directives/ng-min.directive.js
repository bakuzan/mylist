(function() {
  'use strict';
  angular.module('toptens')
  .directive('ngMin', ngMin);

  function ngMin() {
      return {
          restrict: 'A',
          require: 'ngModel',
          link: function(scope, elem, attr, ctrl) {
            var isEmpty = isEmpty,
                minValidator = minValidator;

              scope.$watch(attr.ngMin, function(){
                  if (ctrl.$isDirty) ctrl.$setViewValue(ctrl.$viewValue);
              });

              function isEmpty(value) {
                 return angular.isUndefined(value) || value === '' || value === null;
              }

              function minValidator(value) {
                var min = scope.$eval(attr.ngMin) || 0;
                if (!isEmpty(value) && value < min) {
                  ctrl.$setValidity('ngMin', false);
                  return undefined;
                } else {
                  ctrl.$setValidity('ngMin', true);
                  return value;
                }
              }

              ctrl.$parsers.push(minValidator);
              ctrl.$formatters.push(minValidator);
          }
      };
  }

})();

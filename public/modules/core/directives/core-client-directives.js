'use strict';

angular.module('core').directive('myProgress', function() {
  return function(scope, element, attrs) {
      scope.$watch(attrs.myProgress, function(val) {
          var type = 'checklist-progress';
          element.html('<div class="' + type + '" style="width: ' + val + '%;height: 100%"></div>');
      });
  };
})
.directive('anywhereButHere', function ($document, $window) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.data('thing', true);

            /** On click, check what you clicked and whether you can ignore it.
             *    Based on checks false the ng-show of the anywhere-but-here element.
             */
            angular.element($document[0].body).on('click', function (e) {
                var inThing = angular.element(e.target).inheritedData('thing'),
                    ignore = angular.element(e.target).attr('ignore-here');
                if (!inThing && !ignore) {
                    scope.$apply(function () {
                        scope[attrs.ngShow] = false;
                    });
                }
            });
        }
    };
})
.directive('formatDate', function(){
  return {
   require: 'ngModel',
    link: function(scope, elem, attr, modelCtrl) {
      modelCtrl.$formatters.push(function(modelValue){
        return (modelValue === null) ? null : new Date(modelValue);
      });
    }
  };
})
.directive('loadingSpinner', function(spinnerService) {
    return {
        restrict: 'A',
        transclude: true,
        replace: true,
        templateUrl: '/modules/core/templates/loading-spinner.html',
        scope: {
            name: '@'
        },
        bindToController: 'loadingSpinner',
        controller: function ($scope) {
            $scope.active = false;
            var api = {
                name: $scope.name,
                show: function () {
                    $scope.active = true;
                },
                hide: function () {
                    $scope.active = false;
                },
                toggle: function () {
                    $scope.active = !$scope.active;
                }
            };
            spinnerService._register(api);
            console.log('loader ' + $scope.name, api);
            $scope.$on('$destroy', function () {
                console.log('captured $destroy event');
                spinnerService._unregister($scope.name);
            });
        }
    };
}); 
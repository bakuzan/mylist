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
.directive('loadingSpinner', ['$http', 'spinnerService', function($http, spinnerService) {
    return {
        restrict: 'A',
        transclude: true,
        replace: true,
        templateUrl: '/modules/core/templates/loading-spinner.html',
        scope: {
            name: '@',
            size: '@?'
        },
        bindToController: 'loadingSpinner',
        controller: function ($scope) {
            $scope.active = false;
//            $scope.isLoading = function () {
//                return $http.pendingRequests.length > 0;
//            };
            
//            $scope.$watch($scope.isLoading, function (v) {
//                if ($scope.size === 'fullscreen') {
//                    if(v) {
//                        $scope.active = true;
//                    } else {
//                        $scope.active = false;
//                    }
//                }
//            });
            
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
            $scope.$on('$destroy', function () {
                spinnerService._unregister($scope.name);
            });
        }
    };
}]); 
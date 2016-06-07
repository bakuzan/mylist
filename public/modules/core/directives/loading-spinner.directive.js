(function() {
  'use strict';
  angular.module('core')
  .directive('loadingSpinner', loadingSpinner);
  loadingSpinner.$inject = ['$http', 'spinnerService'];

   function spinnerService($http, spinnerService) {
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
  }

})();

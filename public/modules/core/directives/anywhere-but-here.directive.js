(function() {
  'use strict';
  angular.module('core')
  .directive('anywhereButHere', anywhereButHere);
  anywhereButHere.$inject = ['$compile'];

  function anywhereButHere($compile) {
      return {
          restrict: 'A',
          scope: {
            showBackdrop: '=ngShow'
          },
          link: function (scope, element, attrs) {
            var body = document.body,
                backdrop = angular.element('<div id="anywhere-but-here-backdrop" ng-show="showBackdrop" ng-click="triggerAnywhereButHere()"></div>')[0];
            body.appendChild(backdrop);
            $compile(backdrop)(scope);

            scope.triggerAnywhereButHere = function() {
              scope.showBackdrop = false;
            };
          }
      };
  }

})();

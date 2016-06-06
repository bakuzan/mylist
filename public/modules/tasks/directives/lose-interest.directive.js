(function() {
  'use strict';
  angular.module('tasks')
  .directive('loseInterest', loseInterest);

   function loseInterest($document, $window) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.data('interesting', true);
            /** On click, check what you clicked and whether you can ignore it.
             *    Based on checks false the ng-show of the anywhere-but-here element.
             */
            angular.element($document[0].body).on('click', function (e) {
                var interesting = angular.element(e.target).inheritedData('interesting'),
                    elm = angular.element(e.target)[0].tagName,
                    alsoInteresting = (elm === 'A') || (elm === 'I');
                    //console.log(elm);
                if (!interesting && !alsoInteresting) {
                    scope.$apply(function () {
                        scope.collapseFilters();
                    });
                }
            });
        }
    };
  }

})();

(function() {
  'use strict';
  angular.module('statistics')
  .directive('detectFlood', detectFlood);
  detectFlood.$inject = ['$timeout'];

  function detectFlood($timeout) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var el = element[0];

            function overflowCheck() {
                if (el.scrollWidth > el.offsetWidth) {
                    el.classList.add('flooded');
                } else {
                    el.classList.remove('flooded');
                }
            }
            overflowCheck();

            scope.$watch(
                function () {
                    return {
                        width: el.offsetWidth,
                    };
                }, function () {
//                    console.log('detect flood?');
                        overflowCheck();
                }, true
            );

        }
    };
  }

})();

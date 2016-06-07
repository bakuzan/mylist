(function() {
  'use strict';
  angular.module('characters')
  .directive('disableNgAnimate', disableNgAnimate);
  disableNgAnimate.$inject = ['$animate'];

  function disableNgAnimate($animate) {
    return {
      restrict: 'A',
      link: function(scope, element) {
        $animate.enabled(false, element);
      }
    };
  }

})();

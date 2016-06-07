(function() {
  'use strict';
  angular.module('animeitems')
  .directive('swOnplay', swOnplay);

  function swOnplay() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var el = element[0];
        el.addEventListener('play', function() {
          scope.$apply(attrs.swOnplay);
        });
      }
    };
  }

})();

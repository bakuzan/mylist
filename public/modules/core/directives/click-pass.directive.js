(function() {
  'use strict';
  angular.module('core')
  .directive('clickPass', clickPass);
  clickPass.$inject = ['$timeout'];

   function clickPass($timeout) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        element.bind('click', function(event) {
          $timeout(function() {
            event.stopPropagation();
            document.getElementById(attrs.clickPass).click();
          }, 0);
        });
      }
    };
  }

})();

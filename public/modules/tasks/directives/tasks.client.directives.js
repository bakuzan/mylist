(function() {
  'use strict';
  angular.module('tasks')
  .directive('passClick', passClick);

  function passClick() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        element.bind('click', function(event) {
          var passTo = document.getElementById(attrs.passClick);
          passTo.focus();
          passTo.click();
        });
      }
    };
  }

})();

(function() {
  'use strict';
  angular.module('tasks')
  .directive('shadowModel', shadowModel);

   function shadowModel() {
    return {
      scope: true,
      link: function(scope, el, att) {
        console.log('shadow: ', scope);
        scope[att.shadow] = angular.copy(scope[att.shadow]);
      }
    };
  }

})();

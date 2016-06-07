(function() {
  'use strict';
  angular.module('animeitems')
  .filter('startFrom', startFrom);

   function startFrom() {
      return function(input, start) {
          if (input !== undefined) {
              start = +start; //parse to int
              return input.slice(start);
          }
      };
  }

})();

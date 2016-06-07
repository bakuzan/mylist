(function() {
  'use strict';
  angular.module('core')
  .filter('dateSuffix', dateSuffix);

   function dateSuffix($filter) {
    var suffixes = ['th', 'st', 'nd', 'rd'];
    return function(input) {
      if(input !== undefined){
          var dtfilter = $filter('date')(input, 'MMMM d'),
              day = parseInt(dtfilter.slice(-2)),
              relevantDigits = (day < 30) ? day % 20 : day % 30,
              suffix = (relevantDigits <= 3) ? suffixes[relevantDigits] : suffixes[0],
              dateArray = dtfilter.split(' '),
              month = dateArray[0];
          return dateArray[1] + suffix + ' ' + month + ' ' + $filter('date')(input, 'yyyy');
      }
    };
  }

})();

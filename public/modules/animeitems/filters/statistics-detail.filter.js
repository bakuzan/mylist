(function() {
  'use strict';
  angular.module('animeitems')
  .filter('statisticsDetailFilter',statisticsDetailFilter);
   statisticsDetailFilter.$inject = ['$filter'];

   function statisticsDetailFilter($filter) {
      return function(array, type, year, division) {
          var filter = (division === '')   ? 'summaryYear' :
                       (type === 'months') ? 'endedMonth'  :
                                             'season'      ,
              filterPart = (division === '') ? type : division;
          return $filter(filter)(array, year, filterPart);
      };
  }

})();

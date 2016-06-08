(function() {
  'use strict';
  angular.module('history')
  .filter('historySeparator', historySeparator);
  historySeparator.$inject = ['HistoryService', 'moment'];

  function historySeparator(HistoryService, moment) {
    return function(array, level, timeframe) {
        var itemDate,
            attr = (level === 'group') ? 'latest' : 'date';
        if (array !== undefined) {
            return array.filter(function(item) {
                itemDate = moment(item[attr]).startOf('day');
                return HistoryService.filterItemHistory(timeframe.toLowerCase(), itemDate) ? item : false;
            });
        }
    };
  }

})();

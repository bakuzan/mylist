'use strict';

//History service used to communicate Animeitems REST endpoints
angular.module('history').service('HistoryService', ['moment', function(moment) {

    this.buildHistoryList = function(items) {
        var itemHistory = [], today = moment(new Date());
        angular.forEach(items, function(item) {
            angular.forEach(item.meta.history, function(history) {
                var cutoff = moment(history.date),
                    diff = today.diff(cutoff, 'days');
                console.log(diff);
                if (diff < 28) {
                    itemHistory.push({ date: history.date, value: history.value, title: item.title, id: item._id });
                }
            });
        });
//        console.log(itemHistory);
        return itemHistory;
    };

}]);
'use strict';

//History service used to communicate Animeitems REST endpoints
angular.module('history').service('HistoryService', function() {

    this.buildHistoryList = function(items) {
        var itemHistory = [];
        angular.forEach(items, function(item) {
            angular.forEach(item.meta.history, function(history) {
                itemHistory.push({ date: history.date, value: history.value, title: item.title, id: item._id });
            });
        });
        console.log(itemHistory);
        return itemHistory;
    };

});
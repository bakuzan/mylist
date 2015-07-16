'use strict';

//History service used to communicate Animeitems REST endpoints
angular.module('history').service('HistoryService', function() {

    this.buildHistoryList = function(items) {
        var itemHistory = [];
        console.log(items);
        angular.forEach(items, function(item) {
            console.log(item);
            angular.forEach(item.meta.history, function(history) {
                console.log(history);
//                if (history._id) {
                    itemHistory.push(history);
//                } else {
//                    history._id = item._id;
//                    history.title = item.title;
//                    itemHistory.push(history);
//                }
            });
        });
        console.log(itemHistory);
        return itemHistory;
    };

});
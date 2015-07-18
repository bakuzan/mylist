'use strict';

//History service used to communicate Animeitems REST endpoints
angular.module('history').service('HistoryService', ['moment', function(moment) {

    this.buildHistoryList = function(items) {
        var itemHistory = [], today = moment(new Date());
        angular.forEach(items, function(item) {
            angular.forEach(item.meta.history, function(history) {
                var cutoff = moment(history.date),
                    diff = today.diff(cutoff, 'days');
//                console.log(diff);
                if (diff < 28) {
                    itemHistory.push({ date: history.date, value: history.value, title: item.title, id: item._id });
                }
            });
        });
//        console.log(itemHistory);
        return itemHistory;
    };
    
    this.buildGroups = function(items) {
        var groupBuilder = {
                    today: [],
                    yesterday: [],
                    thisWeek: [],
                    lastWeek: [],
                    twoWeek: [],
                    threeWeek: []
                },
            groupCheck = [];
            angular.forEach(items, function(item) {
                var today = moment(new Date()),
                    itemDate = moment(item.date),
                    diff = today.diff(itemDate, 'days');
                    
                if ((diff === 0) && groupBuilder.today.length === 0) {
                    groupBuilder.today.push(item);
                } else if ((diff === 1) && groupBuilder.yesterday.length === 0) {
                    groupBuilder.yesterday.push(item);
                } else if ((1 < diff < 7) && groupBuilder.thisWeek.length === 0) {
                    groupBuilder.thisWeek.push(item);
                } else if ((6 < diff < 14) && groupBuilder.lastWeek.length === 0) {
                    groupBuilder.lastWeek.push(item);
                } else if ((13 < diff < 21) && groupBuilder.twoWeek.length === 0) {
                    groupBuilder.twoWeek.push(item);
                } else if ((20 < diff < 28) && groupBuilder.threeWeek.length === 0) {
                    groupBuilder.threeWeek.push(item);
                } 
            });
        console.log(groupBuilder);
        return groupBuilder;
    };

}]);
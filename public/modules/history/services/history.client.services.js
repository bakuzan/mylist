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
    
    /** function to display relative time.
     *  Using diff cause fromNow will create conflicts between
     *  the item date and the 'group date'.
     */
    this.happenedWhen = function(when) {
//          console.log(latest, updated);
        var today = moment(new Date()), thisDate = moment(when),
            diff = today.diff(thisDate, 'days');
                
        //for 0 and 1 day(s) ago use the special term.
        if (diff===0) {
            return 'Today';
        } else if (diff===1) {
            return 'Yesterday';
        } else {
            return diff + ' days ago.';
        }
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
                    
                if (diff === 0) {
                    if (groupBuilder.today.length === 0) {
                        groupBuilder.today.push(item);
                    }
                } else if (diff === 1) {
                    if (groupBuilder.yesterday.length === 0) {
                        groupBuilder.yesterday.push(item);
                    }
                } else if (1 < diff && diff < 7) {
                    if (groupBuilder.thisWeek.length === 0) {
                        groupBuilder.thisWeek.push(item);
                    }
                } else if (6 < diff && diff < 14) {
                    if (groupBuilder.lastWeek.length === 0) {
                        groupBuilder.lastWeek.push(item);
                    }
                } else if (13 < diff && diff < 21) {
                    if (groupBuilder.twoWeek.length === 0) {
                        groupBuilder.twoWeek.push(item);
                    }
                } else if (20 < diff && diff < 28) {
                    if (groupBuilder.threeWeek.length === 0) {
                        groupBuilder.threeWeek.push(item);
                    }
                } 
            });
//        console.log(groupBuilder);
        return groupBuilder;
    };
    
    this.getGroupHeaders = function(groupBuilder, item) {
        if (groupBuilder!==undefined) {
            if (groupBuilder.today.indexOf(item) > -1) {
                return 'Today';
            } else if (groupBuilder.yesterday.indexOf(item) > -1) {
                return 'Yesterday';
            } else if (groupBuilder.thisWeek.indexOf(item) > -1) {
                return 'This week';
            } else if (groupBuilder.lastWeek.indexOf(item) > -1) {
                return 'Last week';
            } else if (groupBuilder.twoWeek.indexOf(item) > -1) {
                return 'Two weeks ago';
            } else if (groupBuilder.threeWeek.indexOf(item) > -1) {
                return 'Three weeks ago';
            } else {
                return null;
            }
        } else {
            return null;
        }
    };

}]);
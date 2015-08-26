'use strict';

//History service used to communicate Animeitems REST endpoints
angular.module('history').service('HistoryService', ['moment', function(moment) {

    this.buildHistoryList = function(items) {
        var itemHistory = [], today = moment(new Date()).startOf('day');
        angular.forEach(items, function(item) {
            angular.forEach(item.meta.history, function(history) {
                var cutoff = moment(history.date).startOf('day'),
                    diff = today.diff(cutoff, 'days');
//                console.log(diff);
                if (diff < 29) {
                    itemHistory.push({ date: history.date, value: history.value, title: item.title, id: item._id });
                }
            });
        });
//        console.log(itemHistory);
        return itemHistory;
    };
    
    /** function to display relative time.
     *  Using diff because fromNow will create conflicts between
     *  the item date and the 'group date'.
     */
    this.happenedWhen = function(when) {
//          console.log(latest, updated);
        var today = moment(new Date()).startOf('day'), thisDate = moment(when).startOf('day'),
            diff = today.diff(thisDate, 'days');
                
        //for 0 and 1 day(s) ago use the special term.
        if (diff < 2) {
            return moment(when).calendar();
        } else {
            return moment(when).format('LLLL');
        }
    };
    
    // getting mondays and sundays for this, last, two and three weeks ago.
    this.getEndsOfWeek = function() {
        var self = this, endsOfWeek = [], thisMonday = self.weekBeginning(), thisSunday = self.weekEnding();
        endsOfWeek = { 
            mondays: [ thisMonday, self.getSetDaysAgo(thisMonday, 7), self.getSetDaysAgo(thisMonday, 14), self.getSetDaysAgo(thisMonday, 21), self.getSetDaysAgo(thisMonday, 28) ],
            sundays: [ thisSunday, self.getSetDaysAgo(thisSunday, 7), self.getSetDaysAgo(thisSunday, 14), self.getSetDaysAgo(thisSunday, 21), self.getSetDaysAgo(thisSunday, 28) ]
        };
        return endsOfWeek;        
    };
    //get 'daysAgo' days ago from 'thisEnd' date.
    this.getSetDaysAgo = function(thisEnd, daysAgo) {
        var newDate = moment(thisEnd).subtract(daysAgo, 'days');
        return newDate;
    };
    //get 'this' monday.
    this.weekBeginning = function() {
        var date = new Date(),
            day = date.getDay(),
            diff = date.getDate() - day + (day === 0 ? -6:1),
            temp = new Date(),
            wkBeg = new Date(temp.setDate(diff));
        return moment(wkBeg.toISOString()).startOf('day');
    };
    //get 'this' sunday.
    this.weekEnding = function() {
        var date = new Date(),
            day = date.getDay(),
            diff = date.getDate() - day + (day === 0 ? 0:7),
            temp = new Date(),
            wkEnd = new Date(temp.setDate(diff));
        return moment(wkEnd.toISOString()).endOf('day');
    };
    this.buildGroups = function(items) {
        var groupBuilder = {
                    today: [],
                    yesterday: [],
                    thisWeek: [],
                    lastWeek: [],
                    twoWeek: [],
                    threeWeek: [],
                    fourWeek: []
                },
            groupCheck = [], self = this, endsOfWeek = self.getEndsOfWeek(), mondays = endsOfWeek.mondays, sundays = endsOfWeek.sundays;
//            console.log(mondays, sundays);
            angular.forEach(items, function(item) {
                var today = moment(new Date()).startOf('day'),
                    itemDate = moment(item.date).startOf('day'),
                    diff = today.diff(itemDate, 'days');
                    
                if (diff === 0) {
                    if (groupBuilder.today.length === 0) {
                        groupBuilder.today.push(item);
                        groupBuilder.today.count = 1;
                    } else {
                        groupBuilder.today.count++;
                    }
                } else if (diff === 1) {
                    if (groupBuilder.yesterday.length === 0) {
                        groupBuilder.yesterday.push(item);
                        groupBuilder.yesterday.count = 1;
                    } else {
                        groupBuilder.yesterday.count++;
                    }
                } else if (mondays[0] <= itemDate && itemDate <= sundays[0]) {
                    if (groupBuilder.thisWeek.length === 0) {
                        groupBuilder.thisWeek.push(item);
                        groupBuilder.thisWeek.count = 1;
                    } else {
                        groupBuilder.thisWeek.count++;
                    }
                } else if (mondays[1] <= itemDate && itemDate <= sundays[1]) {
                    if (groupBuilder.lastWeek.length === 0) {
                        groupBuilder.lastWeek.push(item);
                        groupBuilder.lastWeek.count = 1;
                    } else {
                        groupBuilder.lastWeek.count++;
                    }
                } else if (mondays[2] <= itemDate && itemDate <= sundays[2]) {
                    if (groupBuilder.twoWeek.length === 0) {
                        groupBuilder.twoWeek.push(item);
                        groupBuilder.twoWeek.count = 1;
                    } else {
                        groupBuilder.twoWeek.count++;
                    }
                } else if (mondays[3] <= itemDate && itemDate <= sundays[3]) {
                    if (groupBuilder.threeWeek.length === 0) {
                        groupBuilder.threeWeek.push(item);
                        groupBuilder.threeWeek.count = 1;
                    } else {
                        groupBuilder.threeWeek.count++;
                    }
                } else if (mondays[4] <= itemDate && itemDate <= sundays[4]) {
                    if (groupBuilder.fourWeek.length === 0) {
                        groupBuilder.fourWeek.push(item);
                        groupBuilder.fourWeek.count = 1;
                    } else {
                        groupBuilder.fourWeek.count++;
                    }
                }
            });
//        console.log(groupBuilder);
        return groupBuilder;
    };
    
    this.getGroupHeaders = function(groupBuilder, item) {
        if (groupBuilder!==undefined) {
            if (groupBuilder.today.indexOf(item) > -1) {
                return 'Today (' + groupBuilder.today.count + ')';
            } else if (groupBuilder.yesterday.indexOf(item) > -1) {
                return 'Yesterday (' + groupBuilder.yesterday.count + ')';
            } else if (groupBuilder.thisWeek.indexOf(item) > -1) {
                return 'This week (' + groupBuilder.thisWeek.count + ')';
            } else if (groupBuilder.lastWeek.indexOf(item) > -1) {
                return 'Last week (' + groupBuilder.lastWeek.count + ')';
            } else if (groupBuilder.twoWeek.indexOf(item) > -1) {
                return 'Two weeks ago (' + groupBuilder.twoWeek.count + ')';
            } else if (groupBuilder.threeWeek.indexOf(item) > -1) {
                return 'Three weeks ago (' + groupBuilder.threeWeek.count + ')';
            } else if (groupBuilder.fourWeek.indexOf(item) > -1) {
                return 'Four weeks ago (' + groupBuilder.fourWeek.count + ')';
            } else {
                return null;
            }
        } else {
            return null;
        }
    };

}]);
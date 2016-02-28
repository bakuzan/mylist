'use strict';

//History service used to communicate Animeitems REST endpoints
angular.module('history')
.factory('AnimeHistory', ['$resource',
        function($resource) {
            return $resource('history/anime/:latest', { latest: '@_latest' }, { update: { method: 'PUT' } });
        }
    ])
.factory('MangaHistory', ['$resource',
        function($resource) {
            return $resource('history/manga/:latest', { latest: '@_latest' }, { update: { method: 'PUT' } });
        }
    ])
.service('HistoryService', ['moment', '$q', function(moment, $q) {

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
        if (diff === 0) {
            return 'Today at ' + moment(when).format('HH:mm');
        } else if (diff === 1) {
            return 'Yesterday at ' + moment(when).format('HH:mm');
        } else {
            return diff + ' days ago at ' + moment(when).format('HH:mm');
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
            var self = this,
                groupInner = { titles:[], items:[], count: 0 },
                groupBuilder = { today: groupInner, yesterday: groupInner, thisWeek: groupInner,
                                lastWeek: groupInner, twoWeek: groupInner, threeWeek: groupInner, fourWeek: groupInner },
                groupCheck = [], endsOfWeek = self.getEndsOfWeek(), mondays = endsOfWeek.mondays, sundays = endsOfWeek.sundays;
//            console.log(mondays, sundays);
            angular.forEach(items, function(item) {
                var today = moment(new Date()).startOf('day'),
                    itemDate = moment(item.date).startOf('day'),
                    diff = today.diff(itemDate, 'days');
                    
                if (diff === 0) {
                    groupBuilder.today.items.push(item);
                    groupBuilder.today.count = groupBuilder.today.items.length;
                } else if (diff === 1) {
                    groupBuilder.yesterday.items.push(item);
                    groupBuilder.yesterday.count = groupBuilder.yesterday.items.length;
                } else if (mondays[0] <= itemDate && itemDate <= sundays[0]) {
                    groupBuilder.thisWeek.items.push(item);
                    groupBuilder.thisWeek.count = groupBuilder.thisWeek.items.length;
                } else if (mondays[1] <= itemDate && itemDate <= sundays[1]) {
                    groupBuilder.lastWeek.items.push(item);
                    groupBuilder.lastWeek.count = groupBuilder.lastWeek.items.length;
                } else if (mondays[2] <= itemDate && itemDate <= sundays[2]) {
                    groupBuilder.twoWeek.items.push(item);
                    groupBuilder.twoWeek.count = groupBuilder.twoWeek.items.length;
                } else if (mondays[3] <= itemDate && itemDate <= sundays[3]) {
                    groupBuilder.threeWeek.items.push(item);
                    groupBuilder.threeWeek.count = groupBuilder.threeWeek.items.length;
                } else if (mondays[4] <= itemDate && itemDate <= sundays[4]) {
                    groupBuilder.fourWeek.items.push(item);
                    groupBuilder.fourWeek.count = groupBuilder.fourWeek.items.length;
                }
            });
        console.log('group builder: ', groupBuilder);
        var promise = self.groupedTitles(groupBuilder);
        console.log('promise: ', promise);
        promise.then(function(result) {
            console.log('promise result: ', result);
            return result;
        }, function(reason) {
            console.log('group title error: ', reason);
        });
    };
    
    this.groupedTitles = function(groupBuilder) {
        return $q(function(resolve, reject) {
            angular.forEach(groupBuilder, function(timeGroup) {
                var titleItem,
                    length = timeGroup.items.length;
                for(var i = 0; i < length; i++) {
                    if (i === 0) {
                        titleItem = { name: timeGroup.items[i].name, count: 1 };
                    } else if (timeGroup.items[i - 1].name !== timeGroup.items[i].name) {
                        if (titleItem !== undefined) {
                            timeGroup.titles.push(titleItem);
                        }
                        titleItem = { name: timeGroup.items[i].name, count: 1 };
                    } else if (timeGroup.items[i - 1].name === timeGroup.items[i].name) {
                        titleItem.count++;
                    }
                }
            });
            resolve(groupBuilder);
        });
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
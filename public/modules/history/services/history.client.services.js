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
    
    //Variables that require the above functions;
    this.today = moment(new Date()).startOf('day');
    this.endsOfWeek = this.getEndsOfWeek();
    this.mondays = this.endsOfWeek.mondays;
    this.sundays = this.endsOfWeek.sundays;

    this.buildHistoryList = function(items) {
        var deferred = $q.defer(),
            self = this,
            promise = self.extractHistory(items).then(function(result) {
//                console.log('extract history: ', result);
                result.sort(function (a, b) {
                    var dateA = a.date,
                        dateB = b.date;
                    if(dateA > dateB) return -1;
                    if(dateA < dateB) return 1;
                    if(dateA === dateB) return 0;
                });
                return self.groupItemHistory(result);
            }).then(function(result) {
//                console.log('grouped', result);
                deferred.resolve(result);
            });
        return deferred.promise;
    };
    
    this.extractHistory = function(items) {
        var deferred = $q.defer(),
            itemHistory = [], today = moment(new Date()).startOf('day');
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
        deferred.resolve(itemHistory);
        return deferred.promise;
    };
    
    this.groupItemHistory = function(itemHistory) {
        var deferred = $q.defer(),
            index, prevItem, item, group,
            length = itemHistory.length,
            groupedHistory = [];
        for(var i = 0; i < length; i++) {
            item = itemHistory[i];
            if (i === 0) {
                groupedHistory.push({
                    title: item.title,
                    items: [],
                    count: 1,
                    latest: item.date,
                    oldest: item.date
                });
                groupedHistory[0].items.push(item);
            } else if (i !== 0) {
                prevItem = itemHistory[i - 1];
                index = groupedHistory.length - 1;
                if (prevItem.title === item.title) {
                    groupedHistory[index].items.push(item);
                    groupedHistory[index].count++;
                    groupedHistory[index].oldest = item.date;
                } else if (prevItem.title !== item.title) {
                    group = {
                        title: item.title,
                        items: [],
                        count: 1,
                        latest: item.date,
                        oldest: item.date
                    };
                    group.items.push(item);
                    groupedHistory.push(group);
                }
            }
        }
        deferred.resolve(groupedHistory);
        return deferred.promise;
    };
    
    this.filterItemHistory = function(timeframe, itemDate) {
        var self = this,
            diff = self.today.diff(itemDate, 'days');
        switch(timeframe) {
            case 'today':
                return diff === 0;
                
            case 'yesterday':
                return diff === 1;
                
            case 'this week':
                return self.mondays[0] <= itemDate && itemDate <= self.sundays[0];
                
            case 'last week':
                return self.mondays[1] <= itemDate && itemDate <= self.sundays[1];
                
            case 'two weeks ago':
                return self.mondays[2] <= itemDate && itemDate <= self.sundays[2];
            
            case 'three weeks ago':
                return self.mondays[3] <= itemDate && itemDate <= self.sundays[3];
                
            case 'four weeks ago':
                return self.mondays[4] <= itemDate && itemDate <= self.sundays[4];
        }
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

}]);
'use strict';

//Animeitems service used to communicate Animeitems REST endpoints
angular.module('animeitems').factory('Animeitems', ['$resource',
	function($resource) {
		return $resource('animeitems/:animeitemId', { animeitemId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
])
.service('fileUpload', ['$http', function ($http) {
    this.uploadFileToUrl = function(file, uploadUrl){
        var fd = new FormData();
        fd.append('file', file);
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .success(function(response){
            alert('File Uploaded!');
        })
        .error(function(err){
            alert('File Upload Failed: ' + err.message);
        });
    };
}])
.service('ListService', function() {
    
        //show a loading gif if text doesn't exist.
        this.loader = function(text) {
            if (text) {
                return false; //hide loader when value exists.
            }
            return true;
        };
        
        //get number of pages for list.
        this.numberOfPages = function(showingCount, pageSize, currentPage) {
            var pageCount = Math.ceil(showingCount/pageSize);
            //reset number of pages to be the final page if the number of pages
            //becomes less than the one you are on.
            if (currentPage + 1 >= pageCount && pageCount !== 0) {
                currentPage = pageCount-1;
            }
            if (pageCount!==0 && currentPage < 0) {
                currentPage = 0;
            }
            var pagingDetails = { currentPage: currentPage, pageCount: pageCount };
            return pagingDetails;
        };
    
        this.addTag = function(tagArray, newTag) {
            if (newTag!=='' && newTag!==undefined) {
                var i = 0, alreadyAdded = false;
                if (tagArray.length > 0) {
                    while(i < tagArray.length) {
                        if (tagArray[i].text === newTag) {
                            alreadyAdded = true;
                        }
                        i++;
                    }
                    //if not in array add it.
                    if (alreadyAdded === false) {
                        tagArray.push({ text: newTag });
                    }
                } else {
                    tagArray.push({ text: newTag });
                }
            }
            return tagArray;
        };
    
        this.concatenateTagArrays = function(itemTags, tagArray) {
            if (itemTags.length > 0) {
                var i = 0, alreadyAdded = false;
                while(i < tagArray.length) {
                    for(var j = 0; j < itemTags.length; j++) {
                        if (itemTags[j].text === tagArray[i].text) {
                            alreadyAdded = true;
                        }
                    }
                    //add if isn't already in the array.
                    if (alreadyAdded === false) {
                        itemTags.push(tagArray[i]);
                    }
                    i++;
                    alreadyAdded = false;
                }
                console.log(itemTags);
                return itemTags;
            } else {
                //if there are no tags for item, then just return the new tags.
                return tagArray;
            }
        };
    
})
.service('ItemService', ['moment', '$filter', function(moment, $filter) {
        
        //add history entry to item.
        this.itemHistory = function(item, updateHistory, type) {
            //populate the history of when each part was 'checked' off.
            if (item.meta.history.length !== 0) {
                var latestHistory = item.meta.history[item.meta.history.length - 1].value;
                var length = type === 'anime' ? item.episodes - latestHistory : item.chapters - latestHistory;
                if (length > 0 && (type === 'anime' ? item.reWatching === false : item.reReading === false)) {
                    for(var i = 1; i <= length; i++) {
                        item.meta.history.push({ date: Date.now(), value: latestHistory + i });
                    }
                }
            } else {
                if (updateHistory && (type === 'anime' ? item.reWatching === false : item.reReading === false)) {
                    item.meta.history.push({ date: Date.now(), value: (type === 'anime' ? item.episodes : item.chapters) });
                }
            }
            
            return item;
        };
    
        //function to display relative time - using latest or updated date.
        this.latestDate = function(latest, updated) {
            //latest date display format.
//          console.log(latest, updated);
            var today = moment(new Date()), latestDate, diff;
            if (latest.substring(0,10)===updated.substring(0,10)) {
                 latestDate = moment(updated);
                 diff = latestDate.fromNow();
                
                if (diff==='a day ago') {
                    return 'Yesterday';
                } else {
                    return diff + '.';
                }
            } else {
                 latestDate = moment(latest);
                 diff = today.diff(latestDate, 'days');
                
                //for 0 and 1 day(s) ago use the special term.
                if (diff===0) {
                    return 'Today';
                } else if (diff===1) {
                    return 'Yesterday';
                } else {
                    return diff + ' days ago.';
                }
            }
        };
        
        //function to calculate the weighted mean ratings for the genre tags.
        this.ratingsWeighted = function(ratings, listAverage) {
            var values = [], weights = [], total = 0, count = 0, someValue = 50; //someValue to augment weighted average.
            
            /**
             *  create array (weights) with key(rating) and value(weight).
             *  uses values as a control.
             */
            for (var i=0; i < ratings.length; i++) {
                if (ratings[i]!==0) {
                    if (ratings[i] in values) {
                        weights[ratings[i]]++;
                    } else {
                        values.push(ratings[i]);
                        weights[ratings[i]] = 1;
                    }
                }
            }
//            console.log(values,weights);
            /**
             *  using the key(rating) multiply by the value(weight).
             *  calculated weighted total and count.
             */
            for (var k in weights){
                if (typeof weights[k] !== 'function') {
                    total += k * weights[k];
                    count += weights[k];
                }
            }

            /**
             *  count = number of ratings for it. total/count = average rating for tag.
             *  someValue = random-number, listAverage = average rating for all tags.
             */
            return count > 1 ? (count / (count + someValue)) * (total / count) + (someValue / (count + someValue)) * listAverage : 0;
            
        };
    
        // 'sub-function' of the completeBy... functions.
        this.endingYears = function(items) {
            var itemYears = $filter('unique')(items, 'end.substring(0,4)'); //get unqiue years as items.
            itemYears = $filter('orderBy')(itemYears, '-end.substring(0,4)'); //order desc.
            return itemYears;
        };
    
        //complete by month stats
        this.completeByMonth = function(items) {
            var self = this,
            months = [
                { number: '01', text: 'January', count: 0 },
                { number: '02', text: 'February', count: 0 },
                { number: '03', text: 'March', count: 0 },
                { number: '04', text: 'April', count: 0 },
                { number: '05', text: 'May', count: 0 },
                { number: '06', text: 'June', count: 0 },
                { number: '07', text: 'July', count: 0 },
                { number: '08', text: 'August', count: 0 },
                { number: '09', text: 'September', count: 0 },
                { number: '10', text: 'October', count: 0 },
                { number: '11', text: 'November', count: 0 },
                { number: '12', text: 'December', count: 0 }
            ],
            i = 0, j = 0, completeByMonth = [], itemYears = self.endingYears(items);
            
            
            while(i < itemYears.length) {
                //chuck the null end date. push the year part of the other end dates with months array.
                if (itemYears[i].end !== undefined && itemYears[i].end !== null) {
                    completeByMonth.push({ year: itemYears[i].end.substring(0,4), months: months });
                }
                i++; //increment
            }
            
            //iterate throught the years
            while(j < completeByMonth.length) {
                var year = completeByMonth[j], k = 0;
                //iterate through the months for year.
                while(k < year.months.length) {
                    year.months[k].count = $filter('endedMonth')(items, year.year, year.months[k].number).length; //filter items on year and month.
                    console.log(year.year, year.months[k].text, 'count', year.months[k].count);
                    k++; //increment
                }
                console.log(year);
                j++; //increment
            }
            
            console.log('completeByMonth', completeByMonth);
            return completeByMonth;
        };
    
        //complete by season stats.
        this.completeBySeason = function(items) {
            var self = this,
            seasons = [
                { number: '03', text: 'Winter', count: 0 },
                { number: '06', text: 'Spring', count: 0 },
                { number: '09', text: 'Summer', count: 0 },
                { number: '12', text: 'Fall', count: 0 }
            ], 
            i = 0, j = 0, completeBySeason = [], itemYears = self.endingYears(items);
            
            while(i < itemYears.length) {
                //chuck the null end date. push the year part of the other end dates with seasons array.
                if (itemYears[i].end !== undefined && itemYears[i].end !== null) {
                    completeBySeason.push({ year: itemYears[i].end.substring(0,4), seasons: seasons });
                }
                i++; //increment
            }
            
            //iterate throught the years
            while(j < completeBySeason.length) {
                var year = completeBySeason[j], k = 0;
                //iterate through the seasons for year.
                while(k < year.seasons.length) {
                    year.seasons[k].count = $filter('endedSeason')(items, year.year, year.seasons[k].number).length; //filter items on year and season.
                    console.log(year.year, year.seasons[k].text, 'count', year.seasons[k].count);
                    k++; //increment
                }
                console.log(year);
                j++; //increment
            }
            
            console.log('completeBySeason', completeBySeason);
            return completeBySeason;
        };
        
}]);



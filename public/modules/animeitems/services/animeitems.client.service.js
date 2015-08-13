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
        this.loader = function(value) {
            if (value) {
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
        
        //returns the options for the various filters in list pages.
        this.getSelectListOptions = function(controller) {
            var selectListOptions = [];
            if (controller !== 'character') {
                selectListOptions.status = [ { v: '', n: 'All' }, { v: false, n: 'Ongoing' }, { v: true, n: 'Completed' } ];
                if (controller === 'animeitem') {
                    selectListOptions.sortOptions = [ { v: 'title', n: 'Title' },{ v: 'episodes', n: 'Episodes' },{ v: 'start', n: 'Start date' },
                                                      { v: 'end', n: 'End date' },{ v: ['latest', 'meta.updated'], n: 'Latest' },{ v: 'rating', n: 'Rating' } 
                                                    ];
                    selectListOptions.media = [ { v: '', n: 'All' }, { v: false, n: 'Online' }, { v: true, n: 'Disc' } ];
                    selectListOptions.repeating = [ { v: '', n: 'All' }, { v: false, n: 'Not Re-watching' }, { v: true, n: 'Re-watching' } ];
                } else if (controller === 'mangaitem') {
                    selectListOptions.sortOptions = [ { v: 'title', n: 'Title' },{ v: 'chapters', n: 'Chapters' },{ v: 'volumes', n: 'Volumes' },{ v: 'start', n: 'Start date' },
                                                      { v: 'end', n: 'End date' },{ v: ['latest', 'meta.updated'], n: 'Latest' },{ v: 'rating', n: 'Rating' } 
                                                    ];
                    selectListOptions.media = [ { v: '', n: 'All' }, { v: false, n: 'Online' }, { v: true, n: 'Hardcopy' } ];
                    selectListOptions.repeating = [ { v: '', n: 'All' }, { v: false, n: 'Not Re-reading' }, { v: true, n: 'Re-reading' } ];
                }
            } else if (controller === 'character') {
                selectListOptions.sortOptions = [ { v: 'name', n: 'Name' }, { v: 'anime.title', n: 'Anime' }, { v: 'manga.title', n: 'Manga' }, { v: 'voice', n: 'Voice' }  ];
                selectListOptions.media = [ { v: '', n: '-- choose media type --' }, { v: 'none', n: 'None' }, { v: 'anime', n: 'Anime-only' }, { v: 'manga', n: 'Manga-only' }, { v: 'both', n: 'Both' } ];
            }
            return selectListOptions;
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
//                console.log(itemTags);
                return itemTags;
            } else {
                //if there are no tags for item, then just return the new tags.
                return tagArray;
            }
        };
    
        //check to see if there are items with no tags.
        this.checkForTagless = function(items) {
            var areTagless = false;
            angular.forEach(items, function(item) { 
                if (item.tags.length === 0) {
                    areTagless = true;
                }
            });
            return areTagless;
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
                        item.meta.history.push({ date: Date.now(), value: latestHistory + i, title: item.title, id: item._id });
                    }
                }
            } else {
                if (updateHistory && (type === 'anime' ? item.reWatching === false : item.reReading === false)) {
                    item.meta.history.push({ date: Date.now(), value: (type === 'anime' ? item.episodes : item.chapters), title: item.title, id: item._id });
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
    
        //build statistics item overview details.
        this.buildOverview = function(items) {
            var overview = { 
                ongoing: $filter('filter')(items, {status: false }).length, 
                completed: $filter('filter')(items, {status: true }).length
            };
//            console.log('overview ' , overview);
            return overview;
        };
    
        //calculate which month has the most anime completed in it.
        this.maxCompleteMonth = function(items) {
            var modeMap = {}, maxCount = 0;
            for(var i = 0; i < items.length; i++) {
                if (items[i].end!==undefined && items[i].end!==null) {
                    var end = items[i].end.substring(0,7);
                    if(modeMap[end] === null || modeMap[end] === undefined) {
                        modeMap[end] = 1;
                    } else {
                        modeMap[end]++;
                    }
                    if(modeMap[end] > maxCount) {
                        maxCount = modeMap[end];
                    }
                }
            }
            return maxCount;
        };
    
        //calculate the rating values - max rated count and average rating.
        this.getRatingValues = function(items) {
            var tempRating = 0,
                maxRatedCount = 0,
                averageRating = 0;
            angular.forEach(items, function(item) {
                if (item.rating !== 0) {
                    tempRating += item.rating;
                    maxRatedCount++;
                }
            });
            averageRating = tempRating / maxRatedCount;
            var values = {
                maxRatedCount: maxRatedCount,
                averageRating: averageRating
            };
//            console.log('values', values);
            return values;
        };
    
        //calculate which month has the most anime completed in it.
        this.maxTagCount = function(items) {
            var modeMap = {}, maxCount = 0;
            angular.forEach(items, function(item) {
                angular.forEach(item.tags, function(tag) {
                    var text = tag.text;
                    if(modeMap[text] === null || modeMap[text] === undefined) {
                        modeMap[text] = 1;
                    } else {
                        modeMap[text]++;
                    }
                    if(modeMap[text] > maxCount) {
                        maxCount = modeMap[text];
                    }
                });
            });
            return maxCount;
        };
    
        //build stat tags including counts, averages etc.
        this.buildStatTags = function(items, maxTagCount, averageItemRating) {
            var self = this, add = true, statTags = [], checkedRating;
            //is tag in array?
            angular.forEach(items, function(item) { 
                angular.forEach(item.tags, function(tag) {
                    for(var i=0; i < statTags.length; i++) {
                        if (statTags[i].tag===tag.text) {
                            add = false;
                            statTags[i].count += 1;
                            statTags[i].ratedCount += item.rating === 0 ? 0 : 1;
                            statTags[i].ratings.push(item.rating);
                            statTags[i].ratingAdded += item.rating;
                            statTags[i].ratingAvg = statTags[i].ratingAdded === 0 ? 0 : statTags[i].ratingAdded / statTags[i].ratedCount;
                            statTags[i].ratingWeighted = self.ratingsWeighted(statTags[i].ratings, maxTagCount, averageItemRating);
                        }            
                    }
                    // add if not in
                    if (add===true) {
                        checkedRating = item.rating === 0 ? 0 : 1;
                        statTags.push({ tag: tag.text, count: 1, ratedCount: checkedRating, ratings: [item.rating], ratingAdded: item.rating, ratingAvg: item.rating, ratingWeighted: 0 });
                    }
                    add = true; //reset add status.
                }); 
//                    console.log(statTags);
            });
            return statTags;
        };
        
        //function to calculate the weighted mean ratings for the genre tags.
        this.ratingsWeighted = function(ratings, maxTagCount, listAverage) {
            var values = [], weights = [], unratedCount = 0, tagMeanScore = 0, total = 0, count = 0, weight = 0, value = 0;
            /**
             *  create array (weights) with key(rating).
             */
            for (var i=0; i < ratings.length; i++) {
                if (ratings[i] in values) {
                    weights[ratings[i]]++;
                } else {
                    values.push(ratings[i]);
                    weights[ratings[i]] = 1;
                }
            }
            /**
             *  using the key(rating) multiply by the value(weight).
             *  calculated weighted total and count.
             */
            for (var k in weights){
                if (typeof weights[k] !== 'function') {
                    if (!isNaN(weights[k])) {
                        total += k * weights[k];
                        count += weights[k];
                    }
                }
                if (k === 0) {
                    unratedCount = weights[k];
                }
            }

            /**
             *  count = number of ratings for it. total/count = average rating for tag.
             */
            tagMeanScore = total / count;
            tagMeanScore = tagMeanScore * count + listAverage * unratedCount;
            tagMeanScore = tagMeanScore / count;
            weight = count / maxTagCount;
            weight = 1 - weight;
            value = listAverage + (tagMeanScore - listAverage) * weight;
//            console.log('weights', weights, 'values', values);
//            console.log('tagMean', tagMeanScore);
//            console.log('weight', weight);
//            console.log('value', value);
            return value;
        };
    
        //builds counts for number of items given for each rating.
        this.buildRatingsDistribution = function(items, maxCount) {
            var possibleValues = [10,9,8,7,6,5,4,3,2,1,0], ratingsDistribution = [], i = possibleValues.length;
            while(i--) {
                var count = $filter('filter')(items, { rating: i }, true).length;
                ratingsDistribution.push({ number: i === 0 ? '-' : i,  
                                           text: i === 0 ? count + ' entries unrated.' : count + ' entries rated ' + i, 
                                           count: count,
                                           percentage: ((count / maxCount) * 100).toFixed(2)
                                         });
            }
//            console.log('RD: ', ratingsDistribution);
            return ratingsDistribution;
        };
    
        // 'sub-function' of the completeBy... functions.
        this.endingYears = function(items) {
            var itemYears = $filter('unique')(items, 'end.substring(0,4)'); //get unqiue years as items.
            itemYears = $filter('orderBy')(itemYears, '-end.substring(0,4)'); //order desc.
            return itemYears;
        };
    
        //complete by month stats
        this.completeByMonth = function(items) {
            var self = this, completeByMonth = [], itemYears = self.endingYears(items), i = itemYears.length;
            //build comlpeteByMonths object.
            while(i--) {
                //chuck the null end date. push the year part of the other end dates with months array.
                if (itemYears[i].end !== undefined && itemYears[i].end !== null) {
                    completeByMonth.push({ year: itemYears[i].end.substring(0,4),
                                          months: [
                { number: '01', text: 'January', count: $filter('endedMonth')(items, itemYears[i].end.substring(0,4), '01').length  },
                { number: '02', text: 'February', count: $filter('endedMonth')(items, itemYears[i].end.substring(0,4), '02').length },
                { number: '03', text: 'March', count: $filter('endedMonth')(items, itemYears[i].end.substring(0,4), '03').length },
                { number: '04', text: 'April', count: $filter('endedMonth')(items, itemYears[i].end.substring(0,4), '04').length },
                { number: '05', text: 'May', count: $filter('endedMonth')(items, itemYears[i].end.substring(0,4), '05').length },
                { number: '06', text: 'June', count: $filter('endedMonth')(items, itemYears[i].end.substring(0,4), '06').length },
                { number: '07', text: 'July', count: $filter('endedMonth')(items, itemYears[i].end.substring(0,4), '07').length },
                { number: '08', text: 'August', count: $filter('endedMonth')(items, itemYears[i].end.substring(0,4), '08').length },
                { number: '09', text: 'September', count: $filter('endedMonth')(items, itemYears[i].end.substring(0,4), '09').length },
                { number: '10', text: 'October', count: $filter('endedMonth')(items, itemYears[i].end.substring(0,4), '10').length },
                { number: '11', text: 'November', count: $filter('endedMonth')(items, itemYears[i].end.substring(0,4), '11').length },
                { number: '12', text: 'December', count: $filter('endedMonth')(items, itemYears[i].end.substring(0,4), '12').length }
            ] });
                }
            }

//            console.log('completeByMonth', completeByMonth);
            return completeByMonth;
        };
    
        //complete by season stats.
        this.completeBySeason = function(items) {
            var self = this, completeBySeason = [], itemYears = self.endingYears(items), i = itemYears.length;
            //build completeBySeason object.
            while(i--) {
                //chuck the null end date. push the year part of the other end dates with seasons array.
                if (itemYears[i].end !== undefined && itemYears[i].end !== null) {
                    completeBySeason.push({ year: itemYears[i].end.substring(0,4),
                                            seasons: [
                { number: '03', text: 'Winter', count: $filter('endedSeason')(items, itemYears[i].end.substring(0,4), '03').length },
                { number: '06', text: 'Spring', count: $filter('endedSeason')(items, itemYears[i].end.substring(0,4), '06').length },
                { number: '09', text: 'Summer', count: $filter('endedSeason')(items, itemYears[i].end.substring(0,4), '09').length },
                { number: '12', text: 'Fall', count: $filter('endedSeason')(items, itemYears[i].end.substring(0,4), '12').length }
            ] });
                }
            }
            
//            console.log('completeBySeason', completeBySeason);
            return completeBySeason;
        };
        
}]);



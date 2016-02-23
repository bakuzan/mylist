'use strict';

//Animeitems service used to communicate Animeitems REST endpoints
angular.module('animeitems').factory('Animeitems', ['$resource',
	function($resource) {
		return $resource('animeitems/:animeitemId', { animeitemId: '@_id' }, { update: { method: 'PUT' } });
	}
])
.factory('AnimeFactory', ['Animeitems', 'ListService', 'ItemService', 'NotificationFactory', '$location', function(Animeitems, ListService, ItemService, NotificationFactory, $location) {
    return {
        update: function(item, tagArray, updateHistory, imgPath) {
            var animeitem = item;
            console.log(animeitem);
            //dropdown passes whole object, if-statements for lazy fix - setting them to _id.
            if (item.manga!==null && item.manga!==undefined) {
                animeitem.manga = item.manga._id;
            }
            
            if (tagArray!==undefined) {
                animeitem.tags = ListService.concatenateTagArrays(animeitem.tags, tagArray);
            }
            
            //update the item history.
            animeitem = ItemService.itemHistory(animeitem, updateHistory, 'anime');
            
            if (imgPath!==undefined && imgPath!==null && imgPath!=='') {
                animeitem.image = imgPath;
            }
            //console.log($scope.imgPath);
            //console.log(animeitem.image);
            
            //handle end date
            if (animeitem.episodes === animeitem.finalEpisode && animeitem.finalEpisode!==0) {
                if (animeitem.end===undefined || animeitem.end === null) {
                    animeitem.end = animeitem.latest.substring(0,10);
//                    console.log(animeitem.end);
                }
            } else if (animeitem.reWatching === false) {
                //in the event the 'complete-ness' of an entry needs to be undone.
                //this will undo the end date.
                animeitem.end = null;
//                console.log(animeitem.end);
            }
            
            //handle status: completed.
            if(animeitem.end!==undefined && animeitem.end!==null) {
                animeitem.status = true;
                animeitem.onHold = false;
            } else {
                //if no end date, not complete.
                animeitem.status = false;
            }
            
            //handle re-reading, re-read count.
            if (animeitem.reWatching===true && animeitem.episodes===animeitem.finalEpisode) {
                animeitem.reWatchCount += 1;
                animeitem.reWatching = false;
            }

			animeitem.$update(function() {
				if (window.location.href.indexOf('tasks') === -1) $location.path('animeitems');

			    NotificationFactory.success('Saved!', 'Anime was saved successfully');
			}, function(errorResponse) {
				var error = errorResponse.data.message;
                NotificationFactory.error('Error!', errorResponse.data.message);
			});
        }
    };
}])
.service('fileUpload', ['$http', 'NotificationFactory', function ($http, NotificationFactory) {
    this.uploadFileToUrl = function(file, uploadUrl){
        var fd = new FormData();
        fd.append('file', file);
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .success(function(response){
            NotificationFactory.success('Uploaded!', 'Image was saved successfully');
        })
        .error(function(err){
            NotificationFactory.popup('Woops!', 'Something went wrong! \n' + err, 'error');
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
    
        this.stringReverse = function(string) {
            return string.split('').reverse().join('');
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
    
        //find index of object with given attr.
        this.findWithAttr = function(array, attr, value) {
            if (array !== undefined) {
                for(var i = 0; i < array.length; i += 1) {
                    if(array[i][attr] === value) {
                        return i;
                    }
                }   
            }
            return -1;
        };
    
        this.manipulateString = function(string, transform, onlyFirst) {
            switch(transform.toLowerCase()) {
                case 'lower':
                    if (onlyFirst)  return string.charAt(0).toLowerCase() + string.slice(1);
                    if (!onlyFirst) return string.toLowerCase();
                    break;
                case 'upper':
                    if (onlyFirst) return string.charAt(0).toUpperCase() + string.slice(1);
                    if (!onlyFirst) return string.toUpperCase();
                    break;
                default:
                    return string.toLowerCase();
            }
        };
        
        //returns the options for the various filters in list pages.
        this.getSelectListOptions = function(controller) {
            var self = this, selectListOptions = [];
            if (controller !== 'character' && controller !== 'topten') {
                selectListOptions.status = [ { v: '', n: 'All' }, { v: false, n: 'Ongoing' }, { v: true, n: 'Completed' } ];
                selectListOptions.searchName = 'title';
                if (controller === 'animeitem') {
                    selectListOptions.onHold = [ { v: '', n: 'All' }, { v: false, n: 'Ongoing' }, { v: true, n: 'On Hold' } ];
                    selectListOptions.sortOptions = [ { v: 'title', n: 'Title' },{ v: 'episodes', n: 'Episodes' },{ v: 'start', n: 'Start date' },
                                                      { v: 'end', n: 'End date' },{ v: ['latest', 'meta.updated'], n: 'Latest' },{ v: 'rating', n: 'Rating' } 
                                                    ];
                    selectListOptions.sortOption = self.findWithAttr(selectListOptions.sortOptions, 'n', 'Latest');
                    selectListOptions.media = [ { v: '', n: 'All' }, { v: false, n: 'Online' }, { v: true, n: 'Disc' } ];
                    selectListOptions.mediaType = 'disc';
                    selectListOptions.repeating = [ { v: '', n: 'All' }, { v: false, n: 'Not Re-watching' }, { v: true, n: 'Re-watching' } ];
                    selectListOptions.repeatType = 'reWatching';
                } else if (controller === 'mangaitem') {
                    selectListOptions.sortOptions = [ { v: 'title', n: 'Title' },{ v: 'chapters', n: 'Chapters' },{ v: 'volumes', n: 'Volumes' },{ v: 'start', n: 'Start date' },
                                                      { v: 'end', n: 'End date' },{ v: ['latest', 'meta.updated'], n: 'Latest' },{ v: 'rating', n: 'Rating' } 
                                                    ];
                    selectListOptions.sortOption = self.findWithAttr(selectListOptions.sortOptions, 'n', 'Latest');
                    selectListOptions.media = [ { v: '', n: 'All' }, { v: false, n: 'Online' }, { v: true, n: 'Hardcopy' } ];
                    selectListOptions.mediaType = 'hardcopy';
                    selectListOptions.repeating = [ { v: '', n: 'All' }, { v: false, n: 'Not Re-reading' }, { v: true, n: 'Re-reading' } ];
                    selectListOptions.repeatType = 'reReading';
                }
            } else {
                if (controller === 'character') {
                    selectListOptions.sortOptions = [ { v: 'name', n: 'Name' }, { v: 'anime.title', n: 'Anime' }, { v: 'manga.title', n: 'Manga' }, { v: 'voice', n: 'Voice' }  ];
                    selectListOptions.media = [ 
                        { v: '', n: '-- choose media type --' }, { v: 'none', n: 'None' }, { v: 'anime', n: 'Anime-only' }, { v: 'manga', n: 'Manga-only' }, { v: 'both', n: 'Both' } 
                    ];
                } else if (controller === 'topten') {
                    selectListOptions.sortOptions = [ { v: 'name', n: 'Name' } ];
                    selectListOptions.media = [ { v: '', n: 'All' }, { v: 'anime', n: 'Anime' }, { v: 'manga', n: 'Manga' }, { v: 'character', n: 'Character' } ];
                    selectListOptions.mediaType = 'type';
                }
                selectListOptions.searchName = 'name';
                selectListOptions.sortOption = self.findWithAttr(selectListOptions.sortOptions, 'n', 'Name');
            }
//            console.log(selectListOptions); 
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
    
        this.getCommonArrays = function(controller) {
            var commonArrays = {},
                itemTypes = [
                    { name: 'anime' },
                    { name: 'manga' },
                    { name: 'character' }
                ],
                seasons = [ 
                    { number: '03', text: 'Winter' },
                    { number: '06', text: 'Spring' },
                    { number: '09', text: 'Summer' },
                    { number: '12', text: 'Fall' }
                ],
                months = [
                    { number: '01', text: 'January' },
                    { number: '02', text: 'February' },
                    { number: '03', text: 'March' },
                    { number: '04', text: 'April' },
                    { number: '05', text: 'May' },
                    { number: '06', text: 'June' },
                    { number: '07', text: 'July' },
                    { number: '08', text: 'August' },
                    { number: '09', text: 'September' },
                    { number: '10', text: 'October' },
                    { number: '11', text: 'November' },
                    { number: '12', text: 'December' }
                ],
                categories = [
                    {name: 'Watch'},
                    {name: 'Read'},
                    {name: 'Play'},
                    {name: 'Other'}
                ],
                days = [
                    {name: 'Any'},
                    {name: 'Monday'},
                    {name: 'Tuesday'},
                    {name: 'Wednesday'},
                    {name: 'Thursday'},
                    {name: 'Friday'},
                    {name: 'Saturday'},
                    {name: 'Sunday'}
                ],
                summaryFunctions = [
                    { name: 'Average' },
                    { name: 'Highest' },
                    { name: 'Lowest' },
                    { name: 'Mode' }
                ];
            commonArrays = { months: months, seasons: seasons, categories: categories, days: days, summaryFunctions: summaryFunctions, itemTypes: itemTypes };
            return commonArrays;
        };
    
})
.service('ItemService', ['moment', '$filter', 'ListService', function(moment, $filter, ListService) {
    
        //Using the date, returns the season.
        this.convertDateToSeason = function(date) {
            var season = '', year = date.getFullYear(), month = date.getMonth() + 1, commonArrays = ListService.getCommonArrays(),
                i = commonArrays.seasons.length;
//            console.log('convert: ', year, month);
            while(i--) {
                if (month > Number(commonArrays.seasons[i].number) && season === '') {
                    season = { season: commonArrays.seasons[i+1].text, year: year };
                }
                //catch winter.
                if (i === 0 && season === '') {
                    season = { season: commonArrays.seasons[i].text, year: year };
                }
            }
//            console.log('to: ', season);
            return season;
        };
        
        //add history entry to item.
        this.itemHistory = function(item, updateHistory, type) {
            console.log('item history: ', item, item.meta);
            //populate the history of when each part was 'checked' off.
            if (item.meta.history.length !== 0) {
                var latestHistory = item.meta.history[item.meta.history.length - 1].value,
                    length = type === 'anime' ? item.episodes - latestHistory : item.chapters - latestHistory;
                if (length > 0 && (type === 'anime' ? item.reWatching === false : item.reReading === false)) {
                    for(var i = 1; i <= length; i++) {
                        item.meta.history.push({ 
                            date: Date.now(), 
                            value: latestHistory + i, 
                            rating: 0,
                            title: item.title, 
                            id: item._id 
                        });
                    }
                }
            } else {
                if (updateHistory && (type === 'anime' ? item.reWatching === false : item.reReading === false)) {
                    item.meta.history.push({ 
                        date: Date.now(), 
                        value: (type === 'anime' ? item.episodes : item.chapters), 
                        rating: 0,
                        title: item.title, 
                        id: item._id 
                    });
                }
            }
            return item;
        };
        
        //remove an entry from an items history.
        this.deleteHistory = function(item, history) {
            var temp = [];
            angular.forEach(item.meta.history, function(past) {
                if (past.value !== history.value) {
                    temp.push(past);
                }
            });
            item.meta.history = temp;
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
                    return 'Yesterday at ' + latestDate.format('HH:mm');
                } else if (diff.indexOf('days') > -1) {
                    return diff + ' at ' + latestDate.format('HH:mm');
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
        this.buildStatTags = function(items, averageItemRating) {
            var self = this, add = true, statTags = [], checkedRating, maxTagCount = self.maxTagCount(items);
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
        this.buildRatingsDistribution = function(items) {
            var maxCount = items.length, possibleValues = [10,9,8,7,6,5,4,3,2,1,0], ratingsDistribution = [], i = possibleValues.length;
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
            var self = this, monthDetails = {}, completeByMonth = [], maxCompleteMonth = 0, itemYears = self.endingYears(items), i = itemYears.length;
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
                                          ]
                                         });
                }
            }
            maxCompleteMonth = self.maxCompleteMonth(items);
            monthDetails = { months: completeByMonth, max: maxCompleteMonth };

//            console.log('completeByMonth', completeByMonth);
            return monthDetails;
        };
    
        //complete by season stats.
        this.completeBySeason = function(items) {
            var self = this, seasonDetails = {}, completeBySeason = [], maxCompleteSeason = 0, itemYears = self.endingYears(items), i = itemYears.length;
            //build completeBySeason object.
            while(i--) {
                //chuck the null end date. push the year part of the other end dates with seasons array.
                if (itemYears[i].end !== undefined && itemYears[i].end !== null) {
                    completeBySeason.push({ year: itemYears[i].end.substring(0,4),
                                            seasons: [
                                                        { number: '03', text: 'Winter', count: $filter('season')(items, itemYears[i].end.substring(0,4), 'Winter').length },
                                                        { number: '06', text: 'Spring', count: $filter('season')(items, itemYears[i].end.substring(0,4), 'Spring').length },
                                                        { number: '09', text: 'Summer', count: $filter('season')(items, itemYears[i].end.substring(0,4), 'Summer').length },
                                                        { number: '12', text: 'Fall', count: $filter('season')(items, itemYears[i].end.substring(0,4), 'Fall').length }
                                            ]
                                          });
                }
            }
            //find maximum complete in a season.
            angular.forEach(completeBySeason, function(item) {
                var i = item.seasons.length;
                while(i--) {
                    if (item.seasons[i].count > maxCompleteSeason) {
                        maxCompleteSeason = item.seasons[i].count;
                    }
                }
            });
            seasonDetails = { seasons: completeBySeason, max: maxCompleteSeason };
//            console.log('completeBySeason', seasonDetails);
            return seasonDetails;
        };
        
        //Temporary function to generate the season data for pre-exisiting items in db.
        this.setSeason = function(items, year, season) {
            var self = this, array = $filter('endedSeason')(items, year, season);
            angular.forEach(array, function(item) {
                console.log(item.title);
                item.season = self.convertDateToSeason(new Date(item.start));
            });
            return array;
        };
        
}]);
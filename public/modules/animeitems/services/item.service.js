(function() {
	'use strict';
	angular.module('animeitems')
	.service('ItemService', ItemService);
	ItemService.$inject = ['moment', '$filter', 'ListService'];

	function ItemService(moment, $filter, ListService) {
		var obj = {
			buildOverview: buildOverview,
			buildRatingsDistribution: buildRatingsDistribution,
			buildStatTags: buildStatTags,
			completeByMonth: completeByMonth,
			completeBySeason: completeBySeason,
			convertDateToSeason: convertDateToSeason,
			deleteHistory: deleteHistory,
			endingYears: endingYears,
			getRatingValues: getRatingValues,
			itemHistory: itemHistory,
			itemRevisits: itemRevisits,
			latestDate: latestDate,
			maxCompleteMonth: maxCompleteMonth,
			maxTagCount: maxTagCount,
			ratingsWeighted: ratingsWeighted,
			setSeason: setSeason
		};
		return obj;

	        //Using the date, returns the season.
	        function convertDateToSeason(date) {
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
	        }

	        //add history entry to item.
	        function itemHistory(item, updateHistory, type, episodeRating) {
	//            console.log('item history: ', item, item.meta);
	            //populate the history of when each part was 'checked' off.
	            if (item.meta.history.length !== 0) {
	                var latestHistory = item.meta.history[item.meta.history.length - 1].value,
	                    length = type === 'anime' ? item.episodes - latestHistory : item.chapters - latestHistory;
	                if (length > 0 && (type === 'anime' ? item.reWatching === false : item.reReading === false)) {
	                    for(var i = 1; i <= length; i++) {
	                        item.meta.history.push({
	                            date: Date.now(),
	                            value: latestHistory + i,
	                            rating: episodeRating || 0,
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
	                        rating: episodeRating || 0,
	                        title: item.title,
	                        id: item._id
	                    });
	                }
	            }
	            return item;
	        }

	        //remove an entry from an items history.
	        function deleteHistory(item, history) {
	            var temp = [];
	            angular.forEach(item.meta.history, function(past) {
	                if (past.value !== history.value) {
	                    temp.push(past);
	                }
	            });
	            item.meta.history = temp;
	            return item;
	        }

					function itemRevisits(item, type) {
						var anime = { count: 'reWatchCount', currentPart: 'episodes', finalPart: 'finalEpisode' },
								manga = { count: 'reReadCount',  currentPart: 'chapters', finalPart: 'finalChapter' },
								repeating = type === 'anime' ? anime : manga,
								index = ListService.findWithAttr(item.meta.revisits, 'value', item[repeating.count] + 1);
						if(index === -1) {
							item.meta.revisits.push({
								id: item.id,
								title: item.title,
								value: item[repeating.count] + 1,
								rating: 0,
								start: item.latest,
								end: item[repeating.currentPart] === item[repeating.finalPart] ? item.latest : null
							});
						} else if(index > -1 && item[repeating.currentPart] === item[repeating.finalPart]) {
							item.meta.revisits[index].end = item.latest;
						}
						return item;
					}

	        //function to display relative time - using latest or updated date.
	        function latestDate(latest, updated) {
	            //latest date display format.
	//          console.log(latest, updated);
	            var today = moment(new Date()), displayDate, diff;

	            if (moment(latest).toISOString().substring(0,10)===moment(updated).toISOString().substring(0,10)) {
	                 displayDate = moment(updated);
	                 diff = displayDate.fromNow();

	                if (diff==='a day ago') {
	                    return 'Yesterday at ' + displayDate.format('HH:mm');
	                } else if (diff.indexOf('days') > -1) {
	                    return diff + ' at ' + displayDate.format('HH:mm');
	                } else {
	                    return diff + '.';
	                }
	            } else {
	                 displayDate = moment(latest);
	                 diff = today.diff(displayDate, 'days');

	                //for 0 and 1 day(s) ago use the special term.
	                if (diff===0) {
	                    return 'Today';
	                } else if (diff===1) {
	                    return 'Yesterday';
	                } else {
	                    return diff + ' days ago.';
	                }
	            }
	        }

	        //build statistics item overview details.
	        function buildOverview(items) {
	            var overview = {
	                ongoing: $filter('filter')(items, {status: false }).length,
	                completed: $filter('filter')(items, {status: true }).length
	            };
	//            console.log('overview ' , overview);
	            return overview;
	        }

	        //calculate which month has the most anime completed in it.
	        function maxCompleteMonth(items) {
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
	        }

	        //calculate the rating values - max rated count and average rating.
	        function getRatingValues(items) {
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
	        }

	        //calculate which month has the most anime completed in it.
	        function maxTagCount(items) {
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
	        }

	        //build stat tags including counts, averages etc.
	        function buildStatTags(items, averageItemRating) {
	            var add = true, statTags = [], checkedRating, maxTagCount = obj.maxTagCount(items), itemCount = items.length;
	            //is tag in array?
	            angular.forEach(items, function(item) {
	                angular.forEach(item.tags, function(tag) {
	                    for(var i=0, len = statTags.length; i < len; i++) {
	                        if (statTags[i].tag===tag.text) {
	                            add = false;
	                            statTags[i].count += 1;
	                            statTags[i].ratedCount += item.rating === 0 ? 0 : 1;
	                            statTags[i].ratings.push(item.rating);
	                            statTags[i].ratingAdded += item.rating;
	                            statTags[i].ratingAvg = statTags[i].ratingAdded === 0 ? 0 : statTags[i].ratingAdded / statTags[i].ratedCount;
	                            statTags[i].ratingWeighted = obj.ratingsWeighted(statTags[i].ratings);
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
	        }

	        //function to calculate the weighted mean ratings for the genre tags.
	        function ratingsWeighted(ratings) {
	            var values = [], weights = [], unratedCount = 0, total = 0, count = 0;
	            /**
	             *  create array (weights) with key(rating).
	             */
	            for (var i=0, len = ratings.length; i < len; i++) {
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
							/* Weighted average.
							 * total = (nth_rating_value * number_of_that_value + ...)
							 * count = number of ratings.
							 */
	            return total / count;
	        }

	        //builds counts for number of items given for each rating.
	        function buildRatingsDistribution(items) {
	            var maxCount = items.length, possibleValues = [10,9,8,7,6,5,4,3,2,1,0], ratingsDistribution = [], i = possibleValues.length;
	            while(i--) {
	                var count = $filter('filter')(items, { rating: i }, true).length;
	                ratingsDistribution.push({ number: i === 0 ? '-' : i,
	                                           text: i === 0 ? count + ' entries unrated.' : count + ' entries rated ' + i,
																						 colour: i > 6 		 ? '#449d44' :
																						 				 7 > i && i > 3 ? '#31b0d5' :
																										 i !== 0 ? '#c9302c' :
																										 					 '#000000',
	                                           count: count,
	                                           percentage: ((count / maxCount) * 100).toFixed(2)
	                                         });
	            }
	//            console.log('RD: ', ratingsDistribution);
	            return ratingsDistribution;
	        }

	        // 'sub-function' of the completeBy... functions.
	        function endingYears(items) {
	            var years = [],
									itemYears = $filter('unique')(items, 'end.substring(0,4)'); //get unqiue years as items.
	            		itemYears = $filter('orderBy')(itemYears, '-end.substring(0,4)'); //order desc.
							angular.forEach(itemYears, function(item) {
								if(item.end !== undefined && item.end !== null) {
									years.push({ year: item.end.substring(0,4) });
								}
							});
	            return years;
	        }

	        //complete by month stats
	        function completeByMonth(items) {
	            var monthDetails = {}, completeByMonthItems = [], maxCompleteMonth = 0, itemYears = obj.endingYears(items), i = itemYears.length;
	            //build comlpeteByMonths object.
	            while(i--) {
	                //chuck the null end date. push the year part of the other end dates with months array.
	                if (itemYears[i].year !== undefined && itemYears[i].year !== null) {
	                    completeByMonthItems.push({ year: itemYears[i].year,
	                                          months: [
	                                                    { number: '01', text: 'January', count: $filter('endedMonth')(items, itemYears[i].year, '01').length  },
	                                                    { number: '02', text: 'February', count: $filter('endedMonth')(items, itemYears[i].year, '02').length },
	                                                    { number: '03', text: 'March', count: $filter('endedMonth')(items, itemYears[i].year, '03').length },
	                                                    { number: '04', text: 'April', count: $filter('endedMonth')(items, itemYears[i].year, '04').length },
	                                                    { number: '05', text: 'May', count: $filter('endedMonth')(items, itemYears[i].year, '05').length },
	                                                    { number: '06', text: 'June', count: $filter('endedMonth')(items, itemYears[i].year, '06').length },
	                                                    { number: '07', text: 'July', count: $filter('endedMonth')(items, itemYears[i].year, '07').length },
	                                                    { number: '08', text: 'August', count: $filter('endedMonth')(items, itemYears[i].year, '08').length },
	                                                    { number: '09', text: 'September', count: $filter('endedMonth')(items, itemYears[i].year, '09').length },
	                                                    { number: '10', text: 'October', count: $filter('endedMonth')(items, itemYears[i].year, '10').length },
	                                                    { number: '11', text: 'November', count: $filter('endedMonth')(items, itemYears[i].year, '11').length },
	                                                    { number: '12', text: 'December', count: $filter('endedMonth')(items, itemYears[i].year, '12').length }
	                                          ]
	                                         });
	                }
	            }
	            maxCompleteMonth = obj.maxCompleteMonth(items);
	            monthDetails = { months: completeByMonthItems, max: maxCompleteMonth };

	//            console.log('completeByMonthItems', completeByMonthItems);
	            return monthDetails;
	        }

	        //complete by season stats.
	        function completeBySeason(items) {
	            var seasonDetails = {}, completeBySeasonItems = [], maxCompleteSeason = 0, itemYears = obj.endingYears(items), i = itemYears.length;
	            //build completeBySeasonItems object.
	            while(i--) {
	                //chuck the null end date. push the year part of the other end dates with seasons array.
	                if (itemYears[i].year !== undefined && itemYears[i].year !== null) {
	                    completeBySeasonItems.push({ year: itemYears[i].year,
	                                            seasons: [
	                                                        { number: '03', text: 'Winter', count: $filter('season')(items, itemYears[i].year, 'Winter').length },
	                                                        { number: '06', text: 'Spring', count: $filter('season')(items, itemYears[i].year, 'Spring').length },
	                                                        { number: '09', text: 'Summer', count: $filter('season')(items, itemYears[i].year, 'Summer').length },
	                                                        { number: '12', text: 'Fall', count: $filter('season')(items, itemYears[i].year, 'Fall').length }
	                                            ]
	                                          });
	                }
	            }
	            //find maximum complete in a season.
	            angular.forEach(completeBySeasonItems, function(item) {
	                var i = item.seasons.length;
	                while(i--) {
	                    if (item.seasons[i].count > maxCompleteSeason) {
	                        maxCompleteSeason = item.seasons[i].count;
	                    }
	                }
	            });
	            seasonDetails = { seasons: completeBySeasonItems, max: maxCompleteSeason };
	//            console.log('completeBySeasonItems', seasonDetails);
	            return seasonDetails;
	        }

	        //Temporary function to generate the season data for pre-exisiting items in db.
	        function setSeason(items, year, season) {
	            var array = $filter('endedSeason')(items, year, season);
	            angular.forEach(array, function(item) {
	                console.log(item.title);
	                item.season = obj.convertDateToSeason(new Date(item.start));
	            });
	            return array;
	        }

	}

})();

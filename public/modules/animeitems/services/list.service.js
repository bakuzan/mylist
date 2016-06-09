(function() {
	'use strict';
	angular.module('animeitems')
	.service('ListService', ListService);
	ListService.$inject = ['moment', '$q'];

	function ListService(moment, $q) {
		var service = {
			checkForTagless: checkForTagless,
			concatenateTagArrays: concatenateTagArrays,
			findWithAttr: findWithAttr,
			getCommonArrays: getCommonArrays,
			getSelectListOptions: getSelectListOptions,
			groupItemsByProperties: groupItemsByProperties,
			loader: loader,
			manipulateString: manipulateString,
			numberOfPages: numberOfPages,
			stringReverse: stringReverse,
			weekEndingForDate: weekEndingForDate
		};
		return service;

	        //show a loading gif if text doesn't exist.
	        function loader(value) {
	            if (value) {
	                return false; //hide loader when value exists.
	            }
	            return true;
	        }

	        function stringReverse(string) {
	            return string.split('').reverse().join('');
	        }

	        //get number of pages for list.
	        function numberOfPages(showingCount, pageSize, currentPage) {
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
	        }

	        //find index of object with given attr.
	        function findWithAttr(array, attr, value) {
	            if (array !== undefined) {
	                for(var i = 0; i < array.length; i += 1) {
	                    if(array[i][attr] === value) {
	                        return i;
	                    }
	                }
	            }
	            return -1;
	        }

					/** Splitting array into multiple arrays by grouping by attributes.
					 */
					 function groupItemsByProperties(array, groupProperties) {
						 return $q(function (resolve, reject) {
								 var groupedArrays = groupBy(array, function (item) {
										 return getGroupProperties(item, groupProperties);
								 });
								 resolve(groupedArrays);
						 });
					 }
					 //Retrieve the item values for grouping by
					 function getGroupProperties(item, groups) {
							 var array = [];
							 angular.forEach(groups, function (group) {
									 array.push(item[group]);
							 });
							 return array;
					 }
					 //Group the items into arrays using the values.
					 function groupBy(array, f) {
							 var groups = {};
							 array.forEach(function (o) {
									 var group = JSON.stringify(f(o));
									 groups[group] = groups[group] || [];
									 groups[group].push(o);
							 });
							 return Object.keys(groups).map(function (group) {
									 return groups[group];
							 });
					 }

	        function manipulateString(string, transform, onlyFirst) {
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
	        }

					function weekEndingForDate(convertToSunday) {
			        var date = new Date(convertToSunday),
			            day = date.getDay(),
			            diff = date.getDate() - day + (day === 0 ? 0:7),
			            temp = new Date(convertToSunday),
			            wkEnd = new Date(temp.setDate(diff));
			        return moment(wkEnd.toISOString()).endOf('day');
			    }

	        //returns the options for the various filters in list pages.
	        function getSelectListOptions(controller) {
	            var selectListOptions = [];
	            if (controller !== 'character' && controller !== 'topten') {
	                selectListOptions.status = [ { v: '', n: 'All' }, { v: false, n: 'Ongoing' }, { v: true, n: 'Completed' } ];
	                selectListOptions.searchName = 'title';
	                if (controller === 'animeitem') {
	                    selectListOptions.onHold = [ { v: '', n: 'All' }, { v: false, n: 'Ongoing' }, { v: true, n: 'On Hold' } ];
	                    selectListOptions.sortOptions = [ { v: 'title', n: 'Title' },{ v: 'episodes', n: 'Episodes' },{ v: 'start', n: 'Start date' },
	                                                      { v: 'end', n: 'End date' },{ v: ['latest', 'meta.updated'], n: 'Latest' },{ v: 'rating', n: 'Rating' }
	                                                    ];
	                    selectListOptions.sortOption = service.findWithAttr(selectListOptions.sortOptions, 'n', 'Latest');
	                    selectListOptions.media = [ { v: '', n: 'All' }, { v: false, n: 'Online' }, { v: true, n: 'Disc' } ];
	                    selectListOptions.mediaType = 'disc';
	                    selectListOptions.repeating = [ { v: '', n: 'All' }, { v: false, n: 'Not Re-watching' }, { v: true, n: 'Re-watching' } ];
	                    selectListOptions.repeatType = 'reWatching';
	                } else if (controller === 'mangaitem') {
	                    selectListOptions.sortOptions = [ { v: 'title', n: 'Title' },{ v: 'chapters', n: 'Chapters' },{ v: 'volumes', n: 'Volumes' },{ v: 'start', n: 'Start date' },
	                                                      { v: 'end', n: 'End date' },{ v: ['latest', 'meta.updated'], n: 'Latest' },{ v: 'rating', n: 'Rating' }
	                                                    ];
	                    selectListOptions.sortOption = service.findWithAttr(selectListOptions.sortOptions, 'n', 'Latest');
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
	                selectListOptions.sortOption = service.findWithAttr(selectListOptions.sortOptions, 'n', 'Name');
	            }
	//            console.log(selectListOptions);
	            return selectListOptions;
	        }

	        function concatenateTagArrays(itemTags, tagArray) {
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
	        }

	        //check to see if there are items with no tags.
	        function checkForTagless(items) {
	            var areTagless = false;
	            angular.forEach(items, function(item) {
	                if (item.tags.length === 0) {
	                    areTagless = true;
	                }
	            });
	            return areTagless;
	        }

	        function getCommonArrays(controller) {
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
	        }

	}

})();

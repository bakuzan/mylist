'use strict';

// Mangaitems controller
angular.module('mangaitems').controller('MangaitemsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Mangaitems', 'Animeitems', 'fileUpload', '$sce', '$window', 'moment',
	function($scope, $stateParams, $location, Authentication, Mangaitems, Animeitems, fileUpload, $sce, $window, moment) {
		$scope.authentication = Authentication;
        
        // If user is not signed in then redirect back to signin.
		if (!$scope.authentication.user) $location.path('/signin');
        
        //paging controls for the list view.
        $scope.currentPage = 0;
        $scope.pageSize = 10;
        $scope.numberOfPages = function(value){
            var numPages = Math.ceil(value/$scope.pageSize);
            
            //reset number of pages to be the final page if the number of pages
            //becomes less than the one you are on.
            if ($scope.currentPage + 1 > numPages) {
                $scope.currentPage = numPages-1;
            }
            if (numPages!==0 && $scope.currentPage < 0) {
                $scope.currentPage = 0;
            }
            return numPages;
        };
        
        $scope.itemUpdate = new Date().toISOString().substring(0,10); //today's date as 'yyyy-MM-dd'
        $scope.view = 'list'; //dynamic page title.
        $scope.isList = true; //list view as default.
        $scope.maxMangaCount = 0; //number of anime.
        $scope.maxMangaRatedCount = 0; //number of anime with a rating i.e not 0.
        $scope.averageMangaRating = 0; //average rating for anime.
        $scope.maxCompleteMonth = 0; //used to find the max number of ends in 1 month.
        $scope.showDetail = false; //show month detail.
        $scope.statTagSortType = 'tag'; //stat tag sort
        $scope.statTagSortReverse = false; //stat tag sort direction.
//        $scope.sortType = 'latest'; //default sort type
        $scope.sortOptions = [
            { v: 'title', n: 'Title' },{ v: 'chapters', n: 'Chapters' },{ v: 'volumes', n: 'Volumes' },{ v: 'start', n: 'Start date' },
            { v: 'end', n: 'End date' },{ v: ['latest', 'meta.updated'], n: 'Latest' },{ v: 'rating', n: 'Rating' }
        ];
	    $scope.sortReverse = true; // default sort order
        $scope.finalNumbers = false; //default show status of final number fields in edit view.
        $scope.ratingLevel = undefined; //default rating selection
        $scope.maxRating = 10; //maximum rating
        $scope.imgExtension = ''; //image path extension.
        $scope.imgPath = ''; //image path
        $scope.tagArray = []; // holding tags pre-submit
        $scope.tagArrayRemove = [];
        $scope.usedTags = []; //for typeahead array.
        $scope.statTags = []; //for stat table.
        $scope.areTagless = false; //are any items tagless
        $scope.taglessItem = false; //filter variable for showing tagless items.

        //allow retreival of local resource
        $scope.trustAsResourceUrl = function(url) {
            return $sce.trustAsResourceUrl(url);
        };
        
        $scope.searchTags = '';
        $scope.passTag = function(tag) {
            if ($scope.searchTags.indexOf(tag) === -1) {
                $scope.searchTags += tag + ',';
            }
        };
        $scope.clearTagValues = function() {
            $scope.searchTags = '';
            $scope.tagsForFilter = [];
        };
        $scope.deleteSearchTag = function(tag) {
            $scope.searchTags = $scope.searchTags.replace(tag + ',', '');
            
            var index = $scope.tagsForFilter.indexOf(tag);
            $scope.tagsForFilter.splice(index, 1);
        };
        
        //for adding/removing tags.
        $scope.addTag = function () {
//            console.log($scope.newTag);
            if ($scope.newTag!=='' && $scope.newTag!==undefined) {
                $scope.tagArray.push({ text: $scope.newTag });
            }
            $scope.newTag = '';
        };
        $scope.deleteTag = function(text) {
        
            var removal = $window.confirm('Are you sure you want to delete this tag?');
            if (removal) {
                var deletingItem = $scope.tagArray;
                $scope.tagArray = [];

                //update the complete task.
                angular.forEach(deletingItem, function(tag) {
                    if (tag.text !== text) {
                        $scope.tagArray.push(tag);
                    }
                });
            }
        };
        //remove existing tag.
        $scope.removeTag = function(tag) {
            var removal = $window.confirm('Are you sure you want to delete this tag?');
            if (removal) {
                var index = $scope.mangaitem.tags.indexOf(tag);
                $scope.mangaitem.tags.splice(index, 1);
            }
        };
        
        //special tag filter
        $scope.tagFilter = function(item) {
            var found = false;
            var i = 0;
            var tagsToSearch = [];
            
            //if tagless is checked return tagless and nothing else.
            if ($scope.taglessItem===true) {
                if (item.tags.length===0) {
                    return item;
                }
            } else {
                if ($scope.searchTags===undefined || $scope.searchTags==='') {
                    return true;
                } else {
                    //get tags that are being looked for
                    //                var tagsForFilter = $scope.characterTags.split(',');
                    $scope.tagsForFilter = $scope.searchTags.substring(0, $scope.searchTags.length - 1).split(',');
                    //                console.log($scope.tagsForFilter);
                
                    //get tags of items to filter
                    angular.forEach(item.tags, function(tag) {
                        tagsToSearch.push(tag.text);
                    });
                
                    //filter: check in 'query' is in tags.
                    for(i = 0; i < $scope.tagsForFilter.length; i++) {
                        if (tagsToSearch.indexOf($scope.tagsForFilter[i]) !== -1) {
                            found = true;
                        } else {
                            return false;
                        }
                    }
                    return found;
                }
            }
        };
        
        $scope.months = [
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
        ];
        
        //ended stat month filter
        $scope.endedMonth = function(year, month){
            return function(item) {
                if (item.end!==undefined) {
                    if (item.end.substring(0,4)===year) {
                        if (item.end.substr(5,2)===month) {
                            return item;
                        }
                    }
                }
            };
        };
        
        //show month detail.
        $scope.monthDetail = function(year, month) {
//            console.log(year+'-'+month);
            //if the one already selected is clicked, hide the detail.
            if ($scope.detailYear===year && $scope.detailMonth===month) {
                    $scope.showDetail = !$scope.showDetail;
            } else {
                $scope.detailYear = year;
                $scope.detailMonth = month;
                //get month name also, cause why not.
                angular.forEach($scope.months, function(mmm) {
                    if ($scope.detailMonth===mmm.number) {
                        $scope.detailMonthName = mmm.text;
                    }
                });
                $scope.showDetail = true;
            }
        };
        
        $scope.$watchCollection('mangaitems', function() {
            if ($scope.mangaitems!==undefined) {
//                console.log($scope.mangaitems);
                $scope.maxMangaCount = $scope.mangaitems.length;
                var tempRating = 0;
                angular.forEach($scope.mangaitems, function(manga) {
                    if (manga.rating!==0) {
                        tempRating += manga.rating;
                        $scope.maxMangaRatedCount++;
                    }
                });
                $scope.averageMangaRating = tempRating / $scope.maxMangaRatedCount;
                var modeMap = {};
                var maxCount = 0;
                for(var i = 0; i < $scope.mangaitems.length; i++) {
    	           if ($scope.mangaitems[i].end!==undefined) {
                        var end = $scope.mangaitems[i].end.substring(0,7);

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
//                console.log(modeMap);
//                console.log(maxCount);
                $scope.maxCompleteMonth = maxCount;
                
                var add = true;
                //is tag in array?
                angular.forEach($scope.mangaitems, function(manga) { 
                    if (manga.tags.length===0) {
                        $scope.areTagless = true;
                    }
                    angular.forEach(manga.tags, function(tag) {
                        for(var i=0; i < $scope.statTags.length; i++) {
                            if ($scope.statTags[i].tag===tag.text) {
                                add = false;
                                    $scope.statTags[i].count += 1; 
                                    $scope.statTags[i].ratingAdded += manga.rating;
                                    $scope.statTags[i].ratingAvg = $scope.statTags[i].ratingAdded / $scope.statTags[i].count;
                            }
                        }
                        // add if not in
                        if (add===true) {
                            $scope.statTags.push({ tag: tag.text, count: 1, ratingAdded: manga.rating, ratingAvg: manga.rating });
                        }
                        add = true; //reset add status.
                    });
//                    console.log($scope.statTags);
                });
            }
        });
        
        //rating 'tooltip' function
        $scope.hoveringOver = function(value) {
            $scope.overStar = value;
            $scope.percent = 100 * (value / $scope.maxRating);
        };
        
        //filter for rating stars
        $scope.ratingFilter = function(item) {
            if (item.rating===$scope.ratingLevel) {
                return item;
            } else if ($scope.ratingLevel===undefined) {
                return item;
            }
        };
        
        // Create new Mangaitem
		$scope.create = function() {
            
            var mangaitem = new Mangaitems();
            //Handle situation if objects not selected.
			if (this.anime!==undefined && this.anime!==null) {
                // Create new Mangaitem object
			     mangaitem = new Mangaitems ({
				    title: this.title,
                    chapters: this.chapters,
                    volumes: this.volumes,
                    start: this.start,
                    latest: this.latest,
                    finalChapter: this.finalChapter,
                    finalVolume: this.finalVolume,
                    hardcopy: this.hardcopy,
                    anime: this.anime._id,
                    tags: $scope.tagArray,
                    user: this.user
			     });
            } else {
                // Create new Mangaitem object
			     mangaitem = new Mangaitems ({
				    title: this.title,
                    chapters: this.chapters,
                    volumes: this.volumes,
                    start: this.start,
                    latest: this.latest,
                    finalChapter: this.finalChapter,
                    finalVolume: this.finalVolume,
                    hardcopy: this.hardcopy,
                    anime: this.anime,
                    tags: $scope.tagArray,
                    user: this.user
			     });
            }

			// Redirect after save
			mangaitem.$save(function(response) {
				$location.path('/mangaitems/' + response._id);

				// Clear form fields
				$scope.title = '';
                $scope.chapters = '';
                $scope.volumes = '';
                $scope.start = '';
                $scope.latest = '';
                $scope.status = '';
                $scope.tags = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Mangaitem
		$scope.remove = function(mangaitem) {
            //are you sure option...
            var removal = $window.confirm('Are you sure you want to delete this item?');
            if (removal) {
			 if ( mangaitem ) { 
				mangaitem.$remove();

				for (var i in $scope.mangaitems) {
					if ($scope.mangaitems [i] === mangaitem) {
						$scope.mangaitems.splice(i, 1);
					}
				}
			 } else {
				$scope.mangaitem.$remove(function() {
					$location.path('/mangaitems');
				});
			 }
            }
		};

		// Update existing Mangaitem
		$scope.update = function() {
			var mangaitem = $scope.mangaitem;
            //dropdown passes whole object, if-statements for lazy fix - setting them to _id.
            if ($scope.mangaitem.anime!==null && $scope.mangaitem.anime!==undefined) {
                mangaitem.anime = $scope.mangaitem.anime._id;
            }
            
            if ($scope.tagArray!==undefined) {
                var temp = mangaitem.tags ;
                mangaitem.tags = temp.concat($scope.tagArray);
            }
            
            if ($scope.imgPath!==undefined && $scope.imgPath!==null && $scope.imgPath!=='') {
                mangaitem.image = $scope.imgPath;
            }
            //console.log($scope.imgPath);
            //console.log(mangaitem.image);
            
            //handle end date
            if (mangaitem.chapters===mangaitem.finalChapter && mangaitem.volumes===mangaitem.finalVolume) {
                if (mangaitem.end===undefined) {
                    mangaitem.end = mangaitem.latest.substring(0,10);
                    //console.log(animeitem.end);
                }
            }
            
            //handle status: completed.
            if(mangaitem.end!==undefined) {
                mangaitem.status = true;
            } else {
                mangaitem.status = false;
            }
            
            //handle re-reading, re-read count.
            if (mangaitem.reReading===true && mangaitem.chapters===mangaitem.finalChapter && mangaitem.volumes===mangaitem.finalVolume) {
                mangaitem.reReadCount += 1;
                mangaitem.reReading = false;
            }

			mangaitem.$update(function() {
				$location.path('/mangaitems');
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
            
		};

		// Find a list of Mangaitems
		$scope.find = function() {
			$scope.mangaitems = Mangaitems.query();
            //console.log($scope.mangaitems);
		};

		// Find existing Mangaitem
		$scope.findOne = function() {
			$scope.mangaitem = Mangaitems.get({ 
				mangaitemId: $stateParams.mangaitemId
			});
//            console.log($scope.mangaitem);
		};
        
        // Find a list of Animeitems for dropdowns.
		$scope.findAnime = function() {
			$scope.animeitems = Animeitems.query();
		};
        
        //image upload
        $scope.uploadFile = function(){
            var file = $scope.myFile;
            $scope.imgPath = '/modules/mangaitems/img/' + file.name;
            console.log('file is ' + JSON.stringify(file));
            var uploadUrl = '/fileUpload';
            fileUpload.uploadFileToUrl(file, uploadUrl);
        };
        
        //latest date display format.
        $scope.latestDate = function(latest, updated) {
//          console.log(latest, updated);
            var today = moment(new Date());
            if (latest.substring(0,10)===updated.substring(0,10)) {
//                var latestDate = moment(updated);
//                var diff = today.diff(latestDate, 'minutes');
                return updated;
            } else {
                var latestDate = moment(latest);
                var diff = today.diff(latestDate, 'days');
                
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
	}
]);

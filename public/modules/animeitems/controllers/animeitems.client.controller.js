'use strict';

// Animeitems controller
angular.module('animeitems').controller('AnimeitemsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Animeitems', 'Mangaitems', 'fileUpload', '$sce', '$window', 'ItemService', 'ListService',
	function($scope, $stateParams, $location, Authentication, Animeitems, Mangaitems, fileUpload, $sce, $window, ItemService, ListService) {
		$scope.authentication = Authentication;
        
        // If user is not signed in then redirect back to signin.
		if (!$scope.authentication.user) $location.path('/signin');
        
        $scope.whichController = 'animeitem';
        //paging controls for the list view.
        $scope.currentPage = 0;
        $scope.pageSize = 10;
        $scope.pageCount = 0;
        $scope.$watch('showingCount', function() {
            var pagingDetails = ListService.numberOfPages($scope.showingCount, $scope.pageSize, $scope.currentPage);
            $scope.currentPage = pagingDetails.currentPage;
            $scope.pageCount = pagingDetails.pageCount;
        });
        
        //today's date as 'yyyy-MM-dd' for the auto-pop of 'latest' in edit page.
        $scope.itemUpdate = new Date().toISOString().substring(0,10);
        $scope.view = 'list'; //dynamic page title.
        $scope.historicalView = 'month'; //default historical view in stats.
        $scope.isList = true; //list view as default.
        $scope.viewItemHistory = false; //default stat of item history popout.
        $scope.maxAnimeCount = 0; //number of anime.
        $scope.maxAnimeRatedCount = 0; //number of anime with a rating i.e not 0.
        $scope.averageAnimeRating = 0; //average rating for anime.
        $scope.maxCompleteMonth = 0; //used to find the max number of ends in 1 month.
        $scope.showDetail = false; //show month detail.
        $scope.statTagSortType = 'count'; //stat tag sort
        $scope.statTagSortReverse = true; //stat tag sort direction.
//        $scope.sortType = ['latest', 'meta.updated']; //default sort type
        $scope.sortOptions = [
            { v: 'title', n: 'Title' },{ v: 'episodes', n: 'Episodes' },{ v: 'start', n: 'Start date' },
            { v: 'end', n: 'End date' },{ v: ['latest', 'meta.updated'], n: 'Latest' },{ v: 'rating', n: 'Rating' }
        ];
	    $scope.sortReverse = true; // default sort order
        $scope.finalNumbers = false; //default show status of final number fields in edit view.
        $scope.ratingLevel = undefined; //default rating filter
        $scope.maxRating = 10; //maximum rating
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
                $scope.tagsForFilter = $scope.searchTags.substring(0, $scope.searchTags.length - 1).split(',');
            }
        };
        //for adding/removing tags.
        $scope.addTag = function () {
//            console.log($scope.newTag);
            if ($scope.newTag!=='' && $scope.newTag!==undefined) {
                $scope.tagArray.push({ text: $scope.newTag });
            }
            $scope.newTag = '';
        };
        
        $scope.seasons = [
            { number: '03', text: 'Winter' },
            { number: '06', text: 'Spring' },
            { number: '09', text: 'Summer' },
            { number: '12', text: 'Fall' }
        ];
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
        
        //show season detail.
        $scope.seasonDetail = function(year, month) {
//            console.log(year+'-'+month);
            //if the one already selected is clicked, hide the detail.
            if ($scope.detailSeasonYear===year && $scope.detailSeason===month) {
                    $scope.showSeasonDetail = !$scope.showSeasonDetail;
                    $scope.showDetail = false;
            } else {
                $scope.detailSeasonYear = year;
                $scope.detailSeason = month;
                //get month name also, cause why not.
                angular.forEach($scope.seasons, function(mmm) {
                    if ($scope.detailSeason===mmm.number) {
                        $scope.detailSeasonName = mmm.text;
                    }
                });
                $scope.showSeasonDetail = true;
                $scope.showDetail = false;
            }
        };
        
//        //show month detail.
        $scope.monthDetail = function(year, month) {
//            console.log(year+'-'+month);
            //if the one already selected is clicked, hide the detail.
            if ($scope.detailYear===year && $scope.detailMonth===month) {
                    $scope.showDetail = !$scope.showDetail;
                    $scope.showSeasonDetail = false;
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
                $scope.showSeasonDetail = false;
            }
        };
        
        $scope.$watchCollection('animeitems', function() {
            if ($scope.animeitems!==undefined) {
//                console.log($scope.animeitems);
                $scope.maxAnimeCount = $scope.animeitems.length;
                var tempRating = 0;
                angular.forEach($scope.animeitems, function(anime) {
                    if (anime.rating!==0) {
                        tempRating += anime.rating;
                        $scope.maxAnimeRatedCount++;
                    }
                });
                $scope.averageAnimeRating = tempRating / $scope.maxAnimeRatedCount;
                var modeMap = {};
                var maxCount = 0;
                for(var i = 0; i < $scope.animeitems.length; i++) {
    	           if ($scope.animeitems[i].end!==undefined && $scope.animeitems[i].end!==null) {
                        var end = $scope.animeitems[i].end.substring(0,7);

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
                var checkedRating;
                //is tag in array?
                angular.forEach($scope.animeitems, function(anime) { 
                    if (anime.tags.length===0) {
                        $scope.areTagless = true;
                    }
                    angular.forEach(anime.tags, function(tag) {
                        for(var i=0; i < $scope.statTags.length; i++) {
                            if ($scope.statTags[i].tag===tag.text) {
                                add = false;
                                    $scope.statTags[i].count += 1;
                                    $scope.statTags[i].ratedCount += anime.rating === 0 ? 0 : 1;
                                    $scope.statTags[i].ratings.push(anime.rating);
                                    $scope.statTags[i].ratingAdded += anime.rating;
                                    $scope.statTags[i].ratingAvg = $scope.statTags[i].ratingAdded === 0 ? 0 : $scope.statTags[i].ratingAdded / $scope.statTags[i].ratedCount;
                                    $scope.statTags[i].ratingWeighted = ItemService.ratingsWeighted($scope.statTags[i].ratings, $scope.averageAnimeRating);
                            }
                                    
                        }
                        // add if not in
                        if (add===true) {
                            checkedRating = anime.rating === 0 ? 0 : 1;
                            $scope.statTags.push({ tag: tag.text, count: 1, ratedCount: checkedRating, ratings: [anime.rating], ratingAdded: anime.rating, ratingAvg: anime.rating, ratingWeighted: ItemService.ratingsWeighted([anime.rating], $scope.averageAnimeRating) });
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

		// Create new Animeitem
		$scope.create = function() {
			// Create new Animeitem object
            var animeitem = new Animeitems();
            if (this.manga!==undefined && this.manga!==null) {
                animeitem = new Animeitems ({
				    title: this.title,
                    episodes: this.episodes,
                    start: this.start,
                    latest: this.latest,
                    finalEpisode: this.finalEpisode,
                    disc: this.disc,
                    manga: this.manga._id,
                    tags: $scope.tagArray,
                    user: this.user
			     });
            } else {
                animeitem = new Animeitems ({
				    title: this.title,
                    episodes: this.episodes,
                    start: this.start,
                    latest: this.latest,
                    finalEpisode: this.finalEpisode,
                    disc: this.disc,
                    manga: this.manga,
                    tags: $scope.tagArray,
                    user: this.user
			    });
            }


			// Redirect after save
			animeitem.$save(function(response) {
				$location.path('/animeitems/' + response._id);

				// Clear form fields
								// Clear form fields
				$scope.title = '';
                $scope.episodes = '';
                $scope.start = '';
                $scope.latest = '';
                $scope.status = '';
                $scope.tags = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Animeitem
		$scope.remove = function(animeitem) {
            //are you sure option...
            var removal = $window.confirm('Are you sure you want to delete this item?');
            if (removal) {
			 if ( animeitem ) { 
				animeitem.$remove();

				for (var i in $scope.animeitems) {
					if ($scope.animeitems [i] === animeitem) {
						$scope.animeitems.splice(i, 1);
					}
				}
			 } else {
				$scope.animeitem.$remove(function() {
					$location.path('animeitems');
				});
			 }
            }
		};

		// Update existing Animeitem
		$scope.update = function() {
			var animeitem = $scope.animeitem;
//            console.log(animeitem);
            //dropdown passes whole object, if-statements for lazy fix - setting them to _id.
            if ($scope.animeitem.manga!==null && $scope.animeitem.manga!==undefined) {
                animeitem.manga = $scope.animeitem.manga._id;
            }
            
            if ($scope.tagArray!==undefined) {
                var temp = animeitem.tags ;
                animeitem.tags = temp.concat($scope.tagArray);
            }
            
            //update the item history.
            animeitem = ItemService.itemHistory(animeitem, $scope.updateHistory, 'anime');
            
            if ($scope.imgPath!==undefined && $scope.imgPath!==null && $scope.imgPath!=='') {
                animeitem.image = $scope.imgPath;
            }
            //console.log($scope.imgPath);
            //console.log(animeitem.image);
            
            //handle end date
            if (animeitem.episodes===animeitem.finalEpisode && animeitem.finalEpisode!==0) {
                if (animeitem.end===undefined) {
                    animeitem.end = animeitem.latest.substring(0,10);
//                    console.log(animeitem.end);
                }
            } else {
                //in the event the 'complete-ness' of an entry needs to be undone.
                //this will undo the end date.
                animeitem.end = null;
//                console.log(animeitem.end);
            }
            
            //handle status: completed.
            if(animeitem.end!==undefined && animeitem.end!==null) {
                animeitem.status = true;
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
				$location.path('animeitems');
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Animeitems
		$scope.find = function() {
			$scope.animeitems = Animeitems.query();
//            console.log($scope.animeitems);
		};

		// Find existing Animeitem
		$scope.findOne = function() {
			$scope.animeitem = Animeitems.get({ 
				animeitemId: $stateParams.animeitemId
			});
//            console.log($scope.animeitem);
		};
        
        // Find list of mangaitems for dropdown.
        $scope.findManga = function() {
            $scope.mangaitems = Mangaitems.query();
        };
        
        //image upload
        $scope.uploadFile = function(){
            $scope.imgPath = '/modules/animeitems/img/' + $scope.myFile.name;
            fileUpload.uploadFileToUrl($scope.myFile, '/fileUploadAnime');
        };

        //latest date display format.
        $scope.latestDate = function(latest, updated) {
            return ItemService.latestDate(latest, updated);
        };
	}
]);
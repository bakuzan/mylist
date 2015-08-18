'use strict';

// Animeitems controller
angular.module('animeitems').controller('AnimeitemsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Animeitems', 'Mangaitems', 'fileUpload', '$sce', '$window', 'ItemService', 'ListService',
	function($scope, $stateParams, $location, Authentication, Animeitems, Mangaitems, fileUpload, $sce, $window, ItemService, ListService) {
		$scope.authentication = Authentication;
        
        // If user is not signed in then redirect back to signin.
		if (!$scope.authentication.user) $location.path('/signin');
        
        $scope.whichController = 'animeitem';
        $scope.isLoading = true;
        //paging controls for the list view.
        $scope.currentPage = 0;
        $scope.pageSize = 10;
        $scope.pageCount = 0;
        $scope.$watch('showingCount', function() {
            var pagingDetails = ListService.numberOfPages($scope.showingCount, $scope.pageSize, $scope.currentPage);
            $scope.currentPage = pagingDetails.currentPage;
            $scope.pageCount = pagingDetails.pageCount;
        });
        
        /** today's date as 'yyyy-MM-dd' for the auto-pop of 'latest' in edit page.
         *      AND episode/start/latest auto-pop in create.
         */
        $scope.itemUpdate = new Date().toISOString().substring(0,10);
        $scope.start = $scope.itemUpdate;
        $scope.latest = $scope.itemUpdate;
        $scope.episodes = 0;
        $scope.viewItemHistory = false; //default stat of item history popout.
        $scope.selectListOptions = ListService.getSelectListOptions($scope.whichController);
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
            $scope.tagArray = ListService.addTag($scope.tagArray, $scope.newTag);
            $scope.newTag = '';
        };
        
        $scope.$watchCollection('animeitems', function() {
            if ($scope.animeitems!==undefined) {
//                console.log($scope.animeitems);
                
                $scope.areTagless = ListService.checkForTagless($scope.animeitems);
                var maxTagCount = ItemService.maxTagCount($scope.animeitems);
                $scope.statTags = ItemService.buildStatTags($scope.animeitems, maxTagCount, 0);
                
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
                animeitem.tags = ListService.concatenateTagArrays(animeitem.tags, $scope.tagArray);
            }
            
            //update the item history.
            animeitem = ItemService.itemHistory(animeitem, $scope.updateHistory, 'anime');
            
            if ($scope.imgPath!==undefined && $scope.imgPath!==null && $scope.imgPath!=='') {
                animeitem.image = $scope.imgPath;
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
                console.log(animeitem.end);
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
        $scope.tickOff = function(item) {
            item.episodes += 1;
            item.latest = $scope.itemUpdate;
            $scope.animeitem = item;
            $scope.update();
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
        
        $scope.loading = function(value) {
            $scope.isLoading = ListService.loader(value);
        };
        
	}
]);
'use strict';

// Animeitems controller
angular.module('animeitems').controller('AnimeitemsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Animeitems', 'Mangaitems', 'fileUpload', '$sce', '$window', 'ItemService', 'ListService', 'NotificationFactory',
	function($scope, $stateParams, $location, Authentication, Animeitems, Mangaitems, fileUpload, $sce, $window, ItemService, ListService, NotificationFactory) {
		$scope.authentication = Authentication;
        
        // If user is not signed in then redirect back to signin.
		if (!$scope.authentication.user) $location.path('/signin');
        
        $scope.whichController = 'animeitem';
        $scope.isLoading = true;
        //paging variables.
        $scope.pageConfig = {
            currentPage: 0,
            pageSize: 10
        };
        $scope.filterConfig = {
            ongoingList: true,
            showingCount: 0,
            sortType: '',
            sortReverse: true,
            ratingLevel: undefined,
            ratingActions: {
                maxRating: 10,
                percent: undefined,
                overStar: null
            },
            search: {},
            searchTags: '',
            tagsForFilter: [],
            taglessItem: false,
            areTagless: false,
            selectListOptions: ListService.getSelectListOptions($scope.whichController),
            statTags: ItemService.buildStatTags($scope.animeitems, 0)
        };
        
        /** today's date as 'yyyy-MM-dd' for the auto-pop of 'latest' in edit page.
         *      AND episode/start/latest auto-pop in create.
         */
        $scope.itemUpdate = new Date().toISOString().substring(0,10);
        $scope.start = $scope.itemUpdate;
        $scope.latest = $scope.itemUpdate;
        $scope.episodes = 0;
        $scope.viewItemHistory = false; //default stat of item history popout.
        $scope.finalNumbers = false; //default show status of final number fields in edit view.
        $scope.imgPath = ''; //image path
        $scope.tagArray = []; // holding tags pre-submit
        $scope.tagArrayRemove = [];
        $scope.usedTags = []; //for typeahead array.
        
        //allow retreival of local resource
        $scope.trustAsResourceUrl = function(url) {
            return $sce.trustAsResourceUrl(url);
        };
        
        //for adding/removing tags.
        $scope.addTag = function () {
//            console.log($scope.newTag);
            $scope.tagArray = ListService.addTag($scope.tagArray, $scope.newTag);
            $scope.newTag = '';
        };
        
        $scope.$watchCollection('animeitems', function() {
            if ($scope.animeitems!==undefined) {
                console.log($scope.animeitems);
                $scope.filterConfig.areTagless = ListService.checkForTagless($scope.animeitems);
                $scope.filterConfig.statTags = ItemService.buildStatTags($scope.animeitems, 0);
            }
//            console.log($scope.animeitems);
        });

		// Create new Animeitem
		$scope.create = function() {
			// Create new Animeitem object
            var animeitem = new Animeitems();
            animeitem = new Animeitems ({
                title: this.title,
                episodes: this.episodes,
                start: this.start,
                latest: this.latest,
                finalEpisode: this.finalEpisode,
                season: this.season === true ? ItemService.convertDateToSeason(new Date(this.start)) : '',
                disc: this.disc,
                manga: this.manga!==undefined && this.manga!==null ? this.manga._id : this.manga,
                tags: $scope.tagArray,
                user: this.user
             });

			// Redirect after save
			animeitem.$save(function(response) {
				$location.path('/animeitems/' + response._id);
                NotificationFactory.success('Saved!', 'Anime was saved successfully');
				// Clear form fields
				$scope.title = '';
                $scope.episodes = '';
                $scope.start = '';
                $scope.latest = '';
                $scope.status = '';
                $scope.tags = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
                NotificationFactory.error('Error!', errorResponse.data.message);
			});
		};

		// Remove existing Animeitem
		$scope.remove = function(animeitem) {
             //are you sure option...
            NotificationFactory.confirmation(function() {
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
                NotificationFactory.warning('Deleted!', 'Anime was successfully deleted.');
            });
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
				$location.path('animeitems');
			    NotificationFactory.success('Saved!', 'Anime was saved successfully');
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
                NotificationFactory.error('Error!', errorResponse.data.message);
			});
		};
        $scope.tickOff = function(item) {
            item.episodes += 1;
            item.latest = $scope.itemUpdate; //update latest.
            $scope.updateHistory = true; //add to history.
            $scope.animeitem = item;
            $scope.update();
        };
        
        // Find a list of Animeitems
        $scope.find = function() {
            $scope.animeitems = Animeitems.query();
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
        
        $scope.deleteHistory = function(item, history) {
            //are you sure option...
            NotificationFactory.confirmation(function() {
                $scope.animeitem = ItemService.deleteHistory(item, history);
                $scope.update();
            });
        };
        
		/** Find a list of Animeitems for values:
         *  (0) returns only ongoing series. (1) returns all series.
         */
		function getAnime(value) {
            console.log('getting', $scope.filterConfig.ongoingList);
			$scope.animeitems = Animeitems.query({
                status: value
            });
		}
        
        //Set defaults on requery and "neutralise" the other search variable.
        $scope.itemsAvailable = function() {
            $scope.animeitems = undefined;
            if ($scope.filterConfig.ongoingList === true) {
                $scope.filterConfig.search.onHold = false;
                $scope.filterConfig.search.status = '';
                getAnime(0);
            } else {
                $scope.filterConfig.search.onHold = '';
                $scope.filterConfig.search.status = false;
                getAnime(1);
            }
        };
        
	}
]);
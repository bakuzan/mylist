'use strict';

// Animeitems controller
angular.module('animeitems').controller('AnimeitemsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Animeitems', 'Mangaitems', 'fileUpload', '$sce', '$window', 'ItemService', 'ListService', 'NotificationFactory', 'AnimeFactory', 'spinnerService', 'TagService',
	function($scope, $stateParams, $location, Authentication, Animeitems, Mangaitems, fileUpload, $sce, $window, ItemService, ListService, NotificationFactory, AnimeFactory, spinnerService, TagService) {
		var ctrl = this;
		ctrl.authentication = Authentication;
    ctrl.whichController = 'animeitem';
    //paging variables.
    ctrl.pageConfig = {
        currentPage: 0,
        pageSize: 10
    };
    ctrl.filterConfig = {
        ongoingList: true,
        showingCount: 0,
        expandFilters: false,
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
        selectListOptions: ListService.getSelectListOptions(ctrl.whichController),
        statTags: [],
        commonArrays: ListService.getCommonArrays()
    };

    /** today's date as 'yyyy-MM-dd' for the auto-pop of 'latest' in edit page.
     *      AND episode/start/latest auto-pop in create.
     */
    ctrl.itemUpdate = new Date();
    ctrl.start = ctrl.itemUpdate;
    ctrl.latest = ctrl.itemUpdate;
    ctrl.episodes = 0;
    ctrl.viewItemHistory = false; //default stat of item history popout.
    ctrl.finalNumbers = false; //default show status of final number fields in edit view.
    ctrl.imgPath = ''; //image path
    ctrl.tagArray = []; // holding tags pre-submit
    ctrl.tagArrayRemove = [];
    ctrl.usedTags = []; //for typeahead array.

    //allow retreival of local resource
    ctrl.trustAsResourceUrl = function(url) {
        return $sce.trustAsResourceUrl(url);
    };
    //For adding new tags.
    ctrl.addTag = function () {
			TagService.addTag(ctrl.tagArray, ctrl.newTag);
      ctrl.newTag = '';
    };
		//Drop tag for new tags.
		ctrl.dropTag = function(text) {
			TagService.dropTag(ctrl.tagArray, text);
		};
		//Drop tag for animeitem tags.
		ctrl.removeTag = function(text) {
			TagService.dropTag(ctrl.animeitem.tags, text);
		};

		// Create new Animeitem
		ctrl.create = function() {
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
                tags: ctrl.tagArray,
                user: this.user
             });

			// Redirect after save
			animeitem.$save(function(response) {
				$location.path('/animeitems/' + response._id);
				NotificationFactory.success('Saved!', 'Anime was saved successfully');
			}, function(errorResponse) {
				ctrl.error = errorResponse.data.message;
        NotificationFactory.error('Error!', errorResponse.data.message);
			});
		};

		// Remove existing Animeitem
		ctrl.remove = function(animeitem) {
	     //are you sure option...
	    NotificationFactory.confirmation(function() {
	        if ( animeitem ) {
	          animeitem.$remove();

	          for (var i in ctrl.animeitems) {
	            if (ctrl.animeitems [i] === animeitem) {
	            	ctrl.animeitems.splice(i, 1);
	            }
	          }
	        } else {
						ctrl.animeitem.$remove(function() {
	          	$location.path('animeitems');
						});
	        }
	        NotificationFactory.warning('Deleted!', 'Anime was successfully deleted.');
	    });
		};

		// Update existing Animeitem
		ctrl.update = function() {
			var animeitem = ctrl.animeitem;
			ctrl.animeitem = undefined;
      AnimeFactory.update(animeitem, ctrl.tagArray, ctrl.updateHistory, ctrl.imgPath);
		};
    ctrl.tickOff = function(item) {
        item.episodes += 1;
        item.latest = new Date(); //update latest.
        ctrl.updateHistory = true; //add to history.
        ctrl.animeitem = item;
        ctrl.update();
    };

    // Find a list of Animeitems
    ctrl.find = function() {
        Animeitems.query().$promise.then(function(result) {
					ctrl.animeitems = result;
					ctrl.filterConfig.statTags = ItemService.buildStatTags(result, 0);
				});
    };

		// Find existing Animeitem
		ctrl.findOne = function() {
	    Animeitems.get({ animeitemId: $stateParams.animeitemId }).$promise.then(function(result) {
	        ctrl.animeitem = result;
	   			console.log(ctrl.animeitem);
	    });
		};

    // Find list of mangaitems for dropdown.
    ctrl.findManga = function() {
        ctrl.mangaitems = Mangaitems.query();
    };

    //image upload
    ctrl.uploadFile = function(){
        ctrl.imgPath = '/modules/animeitems/img/' + ctrl.myFile.name;
        fileUpload.uploadFileToUrl(ctrl.myFile, '/fileUploadAnime');
    };

    //latest date display format.
    ctrl.latestDate = function(latest, updated) {
        return ItemService.latestDate(latest, updated);
    };

    ctrl.deleteHistory = function(item, history) {
        //are you sure option...
        NotificationFactory.confirmation(function() {
            ctrl.animeitem = ItemService.deleteHistory(item, history);
            ctrl.update();
        });
    };

		/** Find a list of Animeitems for values:
         *  (0) returns only ongoing series. (1) returns all series.
         */
		function getAnime(value) {
	    spinnerService.loading('anime', Animeitems.query({ status: value }).$promise.then(function(result) {
	        ctrl.animeitems = result;
					ctrl.filterConfig.areTagless = ListService.checkForTagless(result);
					ctrl.filterConfig.statTags = ItemService.buildStatTags(result, 0);
	    }));
		}

    //Set defaults on requery and "neutralise" the other search variable.
    ctrl.filterConfig.getItemsAvailable = function() {
        ctrl.animeitems = undefined;
        if (ctrl.filterConfig.ongoingList === true) {
            ctrl.filterConfig.search.onHold = false;
            ctrl.filterConfig.search.status = '';
            getAnime(0);
        } else {
            ctrl.filterConfig.search.onHold = '';
            ctrl.filterConfig.search.status = false;
            getAnime(1);
        }
    };

	}
]);

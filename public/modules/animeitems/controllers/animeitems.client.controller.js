(function() {
	'use strict';
	angular.module('animeitems')
	.controller('AnimeitemsController', AnimeitemsController);
	AnimeitemsController.$inject = ['$scope', '$stateParams', '$location', 'Authentication', 'Animeitems', 'Mangaitems', 'fileUpload', '$sce', '$window', 'ItemService', 'ListService', 'NotificationFactory', 'AnimeFactory', 'spinnerService', 'TagService'];

	function AnimeitemsController($scope, $stateParams, $location, Authentication, Animeitems, Mangaitems, fileUpload, $sce, $window, ItemService, ListService, NotificationFactory, AnimeFactory, spinnerService, TagService) {
		var ctrl = this;

		ctrl.addTag = addTag;
		ctrl.authentication = Authentication;
		ctrl.create = create;
		ctrl.deleteHistory = deleteHistory;
		ctrl.dropTag = dropTag;
    ctrl.episodes = 0;
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
        selectListOptions: {},
        statTags: [],
        commonArrays: ListService.getCommonArrays(),
				getItemsAvailable: getItemsAvailable
    };
    ctrl.finalNumbers = false; //default show status of final number fields in edit view.
		ctrl.find = find;
		ctrl.findOne = findOne;
		ctrl.findManga = findManga;
    ctrl.imgPath = ''; //image path
		ctrl.itemUpdate = new Date(); // today's date as 'yyyy-MM-dd' for the auto-pop of 'latest' in edit page.
		ctrl.latest = ctrl.itemUpdate;
		ctrl.latestDate = latestDate;
		ctrl.pageConfig = {
				currentPage: 0,
				pageSize: 10
		};
		ctrl.remove = remove;
		ctrl.removeTag = removeTag;
		ctrl.start = ctrl.itemUpdate;
    ctrl.tagArray = []; // holding tags pre-submit
    ctrl.tagArrayRemove = [];
		ctrl.tickOff = tickOff;
		ctrl.trustAsResourceUrl = trustAsResourceUrl;
		ctrl.update = update;
		ctrl.uploadFile = uploadFile;
    ctrl.usedTags = []; //for typeahead array.
		ctrl.viewItemHistory = false; //default stat of item history popout.
		ctrl.whichController = 'animeitem';

		ctrl.filterConfig.selectListOptions = ListService.getSelectListOptions(ctrl.whichController);

    //allow retreival of local resource
    function trustAsResourceUrl(url) {
        return $sce.trustAsResourceUrl(url);
    }
    //For adding new tags.
    function addTag() {
			TagService.addTag(ctrl.tagArray, ctrl.newTag);
      ctrl.newTag = '';
    }
		//Drop tag for new tags.
		function dropTag(text) {
			TagService.dropTag(ctrl.tagArray, text);
		}
		//Drop tag for animeitem tags.
		function removeTag(text) {
			TagService.dropTag(ctrl.animeitem.tags, text);
		}

		// Create new Animeitem
		function create() {
			// Create new Animeitem object
            var animeitem = new Animeitems();
            animeitem = new Animeitems ({
                title: ctrl.title,
                episodes: ctrl.episodes,
                start: ctrl.start,
                latest: ctrl.latest,
                finalEpisode: ctrl.finalEpisode,
                season: ctrl.season === true ? ItemService.convertDateToSeason(new Date(ctrl.start)) : '',
                disc: ctrl.disc,
                manga: ctrl.manga!==undefined && ctrl.manga!==null ? ctrl.manga._id : ctrl.manga,
                tags: ctrl.tagArray,
                user: ctrl.user
             });

			// Redirect after save
			animeitem.$save(function(response) {
				$location.path('/animeitems/' + response._id);
				NotificationFactory.success('Saved!', 'Anime was saved successfully');
			}, function(errorResponse) {
				ctrl.error = errorResponse.data.message;
        NotificationFactory.error('Error!', errorResponse.data.message);
			});
		}

		// Remove existing Animeitem
		function remove(animeitem) {
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
		}

		// Update existing Animeitem
		function update() {
			var animeitem = ctrl.animeitem;
			ctrl.animeitem = undefined;
      AnimeFactory.update(animeitem, ctrl.tagArray, ctrl.updateHistory, ctrl.imgPath);
		}

    function tickOff(item) {
        item.episodes += 1;
        item.latest = new Date(); //update latest.
        ctrl.updateHistory = true; //add to history.
        ctrl.animeitem = item;
        ctrl.update();
    }

    // Find a list of Animeitems
    function find() {
        Animeitems.query().$promise.then(function(result) {
					ctrl.animeitems = result;
					ctrl.filterConfig.statTags = ItemService.buildStatTags(result, 0);
				});
    }

		// Find existing Animeitem
		function findOne() {
	    Animeitems.get({ animeitemId: $stateParams.animeitemId }).$promise.then(function(result) {
	        ctrl.animeitem = result;
	   			console.log(ctrl.animeitem);
	    });
		}

    // Find list of mangaitems for dropdown.
    function findManga() {
        ctrl.mangaitems = Mangaitems.query();
    }

    //image upload
    function uploadFile(){
        ctrl.imgPath = '/modules/animeitems/img/' + ctrl.myFile.name;
        fileUpload.uploadFileToUrl(ctrl.myFile, '/fileUploadAnime');
    }

    //latest date display format.
    function latestDate(latest, updated) {
        return ItemService.latestDate(latest, updated);
    }

    function deleteHistory(item, history) {
        //are you sure option...
        NotificationFactory.confirmation(function() {
            ctrl.animeitem = ItemService.deleteHistory(item, history);
            ctrl.update();
        });
    }

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
    function getItemsAvailable() {
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
    }

	}

})();

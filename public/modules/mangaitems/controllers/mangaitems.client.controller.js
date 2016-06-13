(function() {
	'use strict';
	angular.module('mangaitems').controller('MangaitemsController', MangaitemsController);
	MangaitemsController.$inject = ['$scope', '$stateParams', '$location', 'Authentication', 'Mangaitems', 'Animeitems', 'fileUpload', '$sce', '$window', 'ItemService', 'ListService', 'NotificationFactory', 'MangaFactory', 'spinnerService', 'TagService', '$uibModal'];

	function MangaitemsController($scope, $stateParams, $location, Authentication, Mangaitems, Animeitems, fileUpload, $sce, $window, ItemService, ListService, NotificationFactory, MangaFactory, spinnerService, TagService, $uibModal) {
		var ctrl = this;

		ctrl.addTag = addTag;
		ctrl.authentication = Authentication;
		ctrl.chapters = 0;
		ctrl.create = create;
		ctrl.dropTag = dropTag;
    ctrl.filterConfig = {
        showingCount: 0,
        sortType: '',
        sortReverse: true,
        ratingLevel: undefined,
        ratingActions: {
            maxRating: 10,
            percent: undefined,
            overStar: null
        },
        searchTags: '',
        tagsForFilter: [],
        taglessItem: false,
        areTagless: false,
        selectListOptions: {},
        statTags: [],
				viewItem: ''
    };
		ctrl.finalNumbers = false; //default show status of final number fields in edit view.
		ctrl.find = find;
		ctrl.findAnime = findAnime;
		ctrl.findOne = findOne;
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
		ctrl.viewItemHistory = viewItemHistory;
		ctrl.volumes = 0;
		ctrl.whichController = 'mangaitem';

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
			TagService.dropTag(ctrl.mangaitem.tags, text);
		}

    // Create new Mangaitem
		function create() {

            var mangaitem = new Mangaitems();
            //Handle situation if objects not selected.
                // Create new Mangaitem object
			     mangaitem = new Mangaitems ({
				    title: ctrl.title,
                    chapters: ctrl.chapters,
                    volumes: ctrl.volumes,
                    start: ctrl.start,
                    latest: ctrl.latest,
                    finalChapter: ctrl.finalChapter,
                    finalVolume: ctrl.finalVolume,
                    hardcopy: ctrl.hardcopy,
                    anime: ctrl.anime!==undefined && ctrl.anime!==null ? ctrl.anime._id : ctrl.anime,
                    tags: ctrl.tagArray,
                    user: ctrl.user
			     });

			// Redirect after save
			mangaitem.$save(function(response) {
				$location.path('/mangaitems/' + response._id);
				NotificationFactory.success('Saved!', 'Manga was saved successfully');

			}, function(errorResponse) {
				ctrl.error = errorResponse.data.message;
                NotificationFactory.error('Error!', errorResponse.data.message);
			});
		}

		// Remove existing Mangaitem
		function remove(mangaitem) {
            //are you sure option...
            NotificationFactory.confirmation(function() {
                if ( mangaitem ) {
                    mangaitem.$remove();

                    for (var i in ctrl.mangaitems) {
                        if (ctrl.mangaitems [i] === mangaitem) {
                            ctrl.mangaitems.splice(i, 1);
                        }
                    }
                } else {
                    ctrl.mangaitem.$remove(function() {
                        $location.path('/mangaitems');
                    });
                }
                NotificationFactory.warning('Deleted!', 'Manga was successfully deleted.');
            });
		}

		// Update existing Mangaitem
		function update() {
			var mangaitem = ctrl.mangaitem;
            ctrl.mangaitem = undefined;
            MangaFactory.update(mangaitem, ctrl.tagArray, ctrl.updateHistory, ctrl.imgPath);
		}

		function tickOff(item) {
        item.chapters += 1;
        item.latest = new Date(); //update latest.
        ctrl.updateHistory = true; //add to history.
        ctrl.mangaitem = item;
        ctrl.update();
    }

		// Find a list of Mangaitems
		function find() {
			ctrl.filterConfig.selectListOptions = ListService.getSelectListOptions(ctrl.whichController);
      spinnerService.loading('manga', Mangaitems.query().$promise.then(function(result) {
          ctrl.mangaitems = result;
					ctrl.filterConfig.areTagless = ListService.checkForTagless(result);
					ctrl.filterConfig.statTags = ItemService.buildStatTags(result, 0);
      }));
		}

		// Find existing Mangaitem
		function findOne() {
	    Mangaitems.get({ mangaitemId: $stateParams.mangaitemId }).$promise.then(function(result) {
	        ctrl.mangaitem = result;
	        //            console.log(ctrl.mangaitem);
	    });
		}

    // Find a list of Animeitems for dropdowns.
		function findAnime() {
			ctrl.animeitems = Animeitems.query();
		}

    //image upload
    function uploadFile(){
        ctrl.imgPath = '/modules/mangaitems/img/' + ctrl.myFile.name;
        fileUpload.uploadFileToUrl(ctrl.myFile, '/fileUpload');
    }

    //latest date display format.
    function latestDate(latest, updated) {
        return ItemService.latestDate(latest, updated);
    }

		function viewItemHistory() {
			var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: '/modules/history/views/item-history.html',
        controller: 'ViewHistoryController as viewHistory',
        size: 'lg',
				resolve: {
					data: function () {
						return { viewItem: ctrl.filterConfig.viewItem, type: 'manga' };
					}
				}
      }).result.then(function(result) {
        console.log('closed history: ', result, ctrl.filterConfig.viewItem.meta);
				if (result) {
					ctrl.mangaitem = ctrl.filterConfig.viewItem;
					ctrl.update();
				}
      });
		}

	}

})();

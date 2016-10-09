(function() {
	'use strict';
	angular.module('mangaitems').controller('MangaitemsController', MangaitemsController);
	MangaitemsController.$inject = ['$scope', '$stateParams', '$location', 'Authentication', 'Mangaitems', 'Animeitems', '$sce', 'ItemService', 'ListService', 'NotificationFactory', 'MangaFactory', 'spinnerService', '$mdDialog'];

	function MangaitemsController($scope, $stateParams, $location, Authentication, Mangaitems, Animeitems, $sce, ItemService, ListService, NotificationFactory, MangaFactory, spinnerService, $mdDialog) {
		var ctrl = this;

		ctrl.authentication = Authentication;
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
				commonArrays: ListService.getCommonArrays(),
				viewItem: ''
    };
		ctrl.find = find;
		ctrl.findOne = findOne;
		ctrl.latestDate = latestDate;
    ctrl.pageConfig = {
        currentPage: 0,
        pageSize: 10
    };
		ctrl.remove = remove;
		ctrl.tickOff = tickOff;
		ctrl.trustAsResourceUrl = trustAsResourceUrl;
		ctrl.update = update;
		ctrl.usedTags = []; //for typeahead array.
		ctrl.viewItemHistory = viewItemHistory;
		ctrl.whichController = 'mangaitem';

		ctrl.filterConfig.selectListOptions = ListService.getSelectListOptions(ctrl.whichController);

    //allow retreival of local resource
    function trustAsResourceUrl(url) {
        return $sce.trustAsResourceUrl(url);
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
			MangaFactory.update(mangaitem, ctrl.tagArray, ctrl.config.updateHistory, ctrl.imgPath);
		}

		function tickOff(item) {
        item.chapters += 1;
        item.latest = new Date(); //update latest.
        ctrl.updateHistory = true; //add to history.
        ctrl.mangaitem = item;
        ctrl.update();
    }

    //latest date display format.
    function latestDate(latest, updated) {
        return ItemService.latestDate(latest, updated);
    }

		function viewItemHistory(ev) {
			var modalInstance = $mdDialog.show({
				bindToController: true,
				controller: 'ViewHistoryController',
				controllerAs: 'viewHistory',
				templateUrl: '/modules/history/views/item-history.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				clickOutsideToClose: true,
				fullscreen: false,
				locals: {
					viewItem: ctrl.filterConfig.viewItem,
					type: 'manga'
				}
			}).then(function(result) {
				if (result) {
					ctrl.mangaitem = ctrl.filterConfig.viewItem;
					ctrl.update();
				}
			});
		}

		// Find existing Mangaitem
		function findOne() {
	    Mangaitems.get({ mangaitemId: $stateParams.mangaitemId }).$promise.then(function(result) {
	        ctrl.mangaitem = result;
	    });
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

	}

})();

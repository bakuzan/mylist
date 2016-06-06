'use strict';

// Mangaitems controller
angular.module('mangaitems').controller('MangaitemsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Mangaitems', 'Animeitems', 'fileUpload', '$sce', '$window', 'ItemService', 'ListService', 'NotificationFactory', 'MangaFactory', 'spinnerService', 'TagService',
	function($scope, $stateParams, $location, Authentication, Mangaitems, Animeitems, fileUpload, $sce, $window, ItemService, ListService, NotificationFactory, MangaFactory, spinnerService, TagService) {
		var ctrl = this;
		ctrl.authentication = Authentication;

        ctrl.whichController = 'mangaitem';
        //paging variables.
        ctrl.pageConfig = {
            currentPage: 0,
            pageSize: 10
        };
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
            selectListOptions: ListService.getSelectListOptions(ctrl.whichController),
            statTags: []
        };

        /** today's date as 'yyyy-MM-dd' for the auto-pop of 'latest' in edit page.
         *      AND chapter/volume/start/latest auto-pop in create.
         */
        ctrl.itemUpdate = new Date();
        ctrl.start = ctrl.itemUpdate;
        ctrl.latest = ctrl.itemUpdate;
        ctrl.chapters = 0;
        ctrl.volumes = 0;
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
					TagService.dropTag(ctrl.mangaitem.tags, text);
				};


        // Create new Mangaitem
		ctrl.create = function() {

            var mangaitem = new Mangaitems();
            //Handle situation if objects not selected.
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
                    anime: this.anime!==undefined && this.anime!==null ? this.anime._id : this.anime,
                    tags: ctrl.tagArray,
                    user: this.user
			     });

			// Redirect after save
			mangaitem.$save(function(response) {
				$location.path('/mangaitems/' + response._id);
				NotificationFactory.success('Saved!', 'Manga was saved successfully');

			}, function(errorResponse) {
				ctrl.error = errorResponse.data.message;
                NotificationFactory.error('Error!', errorResponse.data.message);
			});
		};

		// Remove existing Mangaitem
		ctrl.remove = function(mangaitem) {
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
		};

		// Update existing Mangaitem
		ctrl.update = function() {
			var mangaitem = ctrl.mangaitem;
            ctrl.mangaitem = undefined;
            MangaFactory.update(mangaitem, ctrl.tagArray, ctrl.updateHistory, ctrl.imgPath);
		};
        ctrl.tickOff = function(item) {
            item.chapters += 1;
            item.latest = new Date(); //update latest.
            ctrl.updateHistory = true; //add to history.
            ctrl.mangaitem = item;
            ctrl.update();
        };

		// Find a list of Mangaitems
		ctrl.find = function() {
            spinnerService.loading('manga', Mangaitems.query().$promise.then(function(result) {
                ctrl.mangaitems = result;
								ctrl.filterConfig.areTagless = ListService.checkForTagless(result);
								ctrl.filterConfig.statTags = ItemService.buildStatTags(result, 0);
            }));
		};

		// Find existing Mangaitem
		ctrl.findOne = function() {
            Mangaitems.get({ mangaitemId: $stateParams.mangaitemId }).$promise.then(function(result) {
                ctrl.mangaitem = result;
                //            console.log(ctrl.mangaitem);
            });
		};

        // Find a list of Animeitems for dropdowns.
		ctrl.findAnime = function() {
			ctrl.animeitems = Animeitems.query();
		};

        //image upload
        ctrl.uploadFile = function(){
            ctrl.imgPath = '/modules/mangaitems/img/' + ctrl.myFile.name;
            fileUpload.uploadFileToUrl(ctrl.myFile, '/fileUpload');
        };

        //latest date display format.
        ctrl.latestDate = function(latest, updated) {
            return ItemService.latestDate(latest, updated);
        };

        ctrl.deleteHistory = function(item, history) {
            //are you sure option...
           NotificationFactory.confirmation(function() {
                ctrl.mangaitem = ItemService.deleteHistory(item, history);
                ctrl.update();
            });
        };
	}
]);

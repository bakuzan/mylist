(function() {
	'use strict';
	angular.module('animeitems')
	.controller('CreateAnimeController', CreateAnimeController);
	CreateAnimeController.$inject = ['$scope', '$stateParams', '$location', 'Authentication', 'Animeitems', 'Mangaitems', 'fileUpload', '$sce', '$window', 'ItemService', 'ListService', 'NotificationFactory', 'AnimeFactory', 'spinnerService', 'TagService'];

	function CreateAnimeController($scope, $stateParams, $location, Authentication, Animeitems, Mangaitems, fileUpload, $sce, $window, ItemService, ListService, NotificationFactory, AnimeFactory, spinnerService, TagService) {
		var ctrl = this,
        animeitemId = $stateParams.animeitemId;

		ctrl.addedEpisodes = addedEpisodes;
		ctrl.addTag = addTag;
		ctrl.animeitem = {};
		ctrl.authentication = Authentication;
    ctrl.config = {
      title: 'Create',
			updateHistory: false,
      ratingActions: {
          maxRating: 10,
          percent: undefined,
          overStar: null
      },
      statTags: [],
      commonArrays: ListService.getCommonArrays()
    };
		ctrl.create = create;
		ctrl.dropTag = dropTag;
    ctrl.finalNumbers = false; //default show status of final number fields in edit view.
		ctrl.find = find;
		ctrl.findOne = findOne;
		ctrl.findManga = findManga;
    ctrl.imgPath = ''; //image path
		ctrl.itemUpdate = new Date(); // today's date as 'yyyy-MM-dd' for the auto-pop of 'latest' in edit page.
    ctrl.init = init;
		ctrl.removeTag = removeTag;
		ctrl.sections = {
			showAdditional: false,
			showCompletion: false,
			showItemTags: false
		};
		ctrl.setInSeason = setInSeason;
		ctrl.submit = submit;
    ctrl.tagArray = []; // holding tags pre-submit
    ctrl.tagArrayRemove = [];
		ctrl.update = update;
		ctrl.uploadFile = uploadFile;
    ctrl.usedTags = []; //for typeahead array.

    function init() {
      ctrl.config.isCreate = animeitemId === undefined;
      if(ctrl.config.isCreate) {
				ctrl.animeitem.episodes = 0;
				ctrl.animeitem.start = ctrl.itemUpdate;
				ctrl.animeitem.latest = ctrl.itemUpdate;
			} else if(!ctrl.config.isCreate) {
        ctrl.config.title = 'Edit';
        ctrl.findOne();
      }
      ctrl.find();
      ctrl.findManga();
    }
    ctrl.init();

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

		function addedEpisodes() {
			ctrl.animeitem.latest = ctrl.itemUpdate;
			ctrl.config.updateHistory = true;
			if(ctrl.animeitem.episodes === ctrl.animeitem.finalEpisode && ctrl.animeitem.finalEpisode !== 0 && ctrl.animeitem.reWatching === false) {
				ctrl.animeitem.end = ctrl.itemUpdate;
			}
			if(ctrl.animeitem.episodes > ctrl.animeitem.finalEpisode && ctrl.animeitem.finalEpisode !== 0) {
				ctrl.animeitem.episodes = ctrl.animeitem.finalEpisode;
			}
		}

		function setInSeason() {
			if(ctrl.animeitem.season.season === null) {
				 ctrl.animeitem.season.year = null;
			 } else {
				 ctrl.animeitem.season.year = ctrl.animeitem.start.substring(0,4);
			 }
		}

		// Create new Animeitem
		function create() {
			// Create new Animeitem object
      var animeitem = new Animeitems();
      animeitem = new Animeitems ({
          title: ctrl.animeitem.title,
          episodes: ctrl.animeitem.episodes,
          start: ctrl.animeitem.start,
          latest: ctrl.animeitem.latest,
          finalEpisode: ctrl.animeitem.finalEpisode,
					image: ctrl.imgPath,
          season: ctrl.season === true ? ItemService.convertDateToSeason(new Date(ctrl.animeitem.start)) : '',
          disc: ctrl.animeitem.disc,
          manga: ctrl.animeitem.manga!==undefined && ctrl.animeitem.manga!==null ? ctrl.animeitem.manga._id : ctrl.animeitem.manga,
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

		// Update existing Animeitem
		function update() {
			var animeitem = ctrl.animeitem;
			ctrl.animeitem = undefined;
      AnimeFactory.update(animeitem, ctrl.tagArray, ctrl.config.updateHistory, ctrl.imgPath);
		}

		function submit() {
			if(ctrl.config.isCreate) ctrl.create();
			if(!ctrl.config.isCreate) ctrl.update();
		}

    // Find a list of Animeitems
    function find() {
        Animeitems.query().$promise.then(function(result) {
					ctrl.animeitems = result;
						ctrl.config.statTags = ItemService.buildStatTags(result, 0);
				});
    }

		// Find existing Animeitem
		function findOne() {
	    Animeitems.get({ animeitemId: animeitemId }).$promise.then(function(result) {
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

	}

})();

(function() {
	'use strict';
	angular.module('animeitems')
	.controller('CreateAnimeController', CreateAnimeController);
	CreateAnimeController.$inject = ['$scope', '$stateParams', '$location', 'Authentication', 'Animeitems', 'Mangaitems', 'fileUpload', '$sce', '$window', 'ItemService', 'ListService', 'NotificationFactory', 'AnimeFactory', 'spinnerService', 'TagService'];

	function CreateAnimeController($scope, $stateParams, $location, Authentication, Animeitems, Mangaitems, fileUpload, $sce, $window, ItemService, ListService, NotificationFactory, AnimeFactory, spinnerService, TagService) {
		var ctrl = this,
        animeitemId = $stateParams.animeitemId;

		ctrl.addTag = addTag;
		ctrl.authentication = Authentication;
    ctrl.config = {
      title: 'Create',
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
    ctrl.episodes = 0;
    ctrl.finalNumbers = false; //default show status of final number fields in edit view.
		ctrl.findOne = findOne;
		ctrl.findManga = findManga;
    ctrl.imgPath = ''; //image path
		ctrl.itemUpdate = new Date(); // today's date as 'yyyy-MM-dd' for the auto-pop of 'latest' in edit page.
    ctrl.init = init;
		ctrl.latest = ctrl.itemUpdate;
		ctrl.removeTag = removeTag;
		ctrl.start = ctrl.itemUpdate;
    ctrl.tagArray = []; // holding tags pre-submit
    ctrl.tagArrayRemove = [];
		ctrl.update = update;
		ctrl.uploadFile = uploadFile;
    ctrl.usedTags = []; //for typeahead array.

    function init() {
      ctrl.config.isCreate = animeitemId === undefined;
      if(!ctrl.config.isCreate) {
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

		// Update existing Animeitem
		function update() {
			var animeitem = ctrl.animeitem;
			ctrl.animeitem = undefined;
      AnimeFactory.update(animeitem, ctrl.tagArray, ctrl.updateHistory, ctrl.imgPath);
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


	}

})();

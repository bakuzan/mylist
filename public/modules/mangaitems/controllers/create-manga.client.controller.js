(function() {
	'use strict';
	angular.module('mangaitems')
	.controller('CreateMangaController', CreateMangaController);
	CreateMangaController.$inject = ['$scope', '$stateParams', '$location', 'Authentication', 'Animeitems', 'Mangaitems', 'fileUpload', '$sce', '$window', 'ItemService', 'ListService', 'NotificationFactory', 'MangaFactory', 'spinnerService', 'TagService', 'Enums'];

	function CreateMangaController($scope, $stateParams, $location, Authentication, Animeitems, Mangaitems, fileUpload, $sce, $window, ItemService, ListService, NotificationFactory, MangaFactory, spinnerService, TagService, Enums) {
		var ctrl = this,
        mangaitemId = $stateParams.mangaitemId;

		ctrl.addedChapters = addedChapters;
    ctrl.addedVolumes = addedVolumes;
		ctrl.addTag = addTag;
		ctrl.mangaitem = {};
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
      commonArrays: ListService.getCommonArrays(),
			malSearchType: 'manga'
    };
		ctrl.create = create;
		ctrl.dropTag = dropTag;
    ctrl.finalNumbers = false; //default show status of final number fields in edit view.
		ctrl.find = find;
		ctrl.findOne = findOne;
		ctrl.findAnime = findAnime;
    ctrl.imgPath = ''; //image path
		ctrl.itemUpdate = new Date(); // today's date as 'yyyy-MM-dd' for the auto-pop of 'latest' in edit page.
    ctrl.init = init;
		ctrl.malSearchOptions = {
			placeholder: 'Title',
			name: 'title',
			required: true,
			autocomplete: 'off',
			disabled: true
		};
		ctrl.removeTag = removeTag;
		ctrl.sections = {
			showAdditional: false,
			showCompletion: false,
			showItemTags: false
		};
		ctrl.selectMalEntry = selectMalEntry;
		ctrl.submit = submit;
    ctrl.tagArray = []; // holding tags pre-submit
    ctrl.tagArrayRemove = [];
		ctrl.update = update;
		ctrl.uploadFile = uploadFile;
    ctrl.usedTags = []; //for typeahead array.

    function init() {
      ctrl.config.isCreate = mangaitemId === undefined;
      if(ctrl.config.isCreate) {
				ctrl.mangaitem.episodes = 0;
				ctrl.mangaitem.start = ctrl.itemUpdate;
				ctrl.mangaitem.latest = ctrl.itemUpdate;
				ctrl.malSearchOptions.disabled = false;
			} else if(!ctrl.config.isCreate) {
        ctrl.config.title = 'Edit';
        ctrl.findOne();
      }
      ctrl.find();
      ctrl.findAnime();
    }
    ctrl.init();

		function selectMalEntry(malEntry) {
			if(malEntry) {
				ctrl.mangaitem.title = malEntry.title;
				ctrl.mangaitem.finalChapter = malEntry.chapters;
				ctrl.imgPath = malEntry.image;
				ctrl.mangaitem.mal = {
					id: malEntry.id
				};
			} else {
				ctrl.mangaitem.finalChapter = 0;
				ctrl.mangaitem.mal = undefined;
			}
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
		//Drop tag for tags.
		function removeTag(text) {
			TagService.dropTag(ctrl.mangaitem.tags, text);
		}

		function addedChapters() {
			ctrl.mangaitem.latest = ctrl.itemUpdate;
			ctrl.config.updateHistory = true;
      if (ctrl.mangaitem.chapters === ctrl.mangaitem.finalChapter && ctrl.mangaitem.finalChapter !== 0 && ctrl.mangaitem.reReading === false) {
        ctrl.mangaitem.end = ctrl.itemUpdate;
      }
      if (ctrl.mangaitem.chapters > ctrl.mangaitem.finalChapter && ctrl.mangaitem.finalChapter !== 0) {
        ctrl.mangaitem.chapters = ctrl.mangaitem.finalChapter;
      }
		}

    function addedVolumes() {
      if (ctrl.mangaitem.volumes > ctrl.mangaitem.finalVolume && ctrl.mangaitem.finalVolume !== 0) {
        ctrl.mangaitem.volumes = ctrl.mangaitem.finalVolume;
      }
    }

    // Create new Mangaitem
    function create() {

      var mangaitem = new Mangaitems();
      //Handle situation if objects not selected.
      // Create new Mangaitem object
     mangaitem = new Mangaitems ({
      title: ctrl.mangaitem.title,
      chapters: ctrl.mangaitem.chapters,
      volumes: ctrl.mangaitem.volumes,
      start: ctrl.mangaitem.start,
      latest: ctrl.mangaitem.latest,
      finalChapter: ctrl.mangaitem.finalChapter,
      finalVolume: ctrl.mangaitem.finalVolume,
      image: ctrl.imgPath,
      hardcopy: ctrl.mangaitem.hardcopy,
      anime: ctrl.mangaitem.anime !== undefined && ctrl.mangaitem.anime !== null ? ctrl.mangaitem.anime._id : ctrl.mangaitem.anime,
      tags: ctrl.tagArray,
      mal: ctrl.mangaitem.mal,
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

    // Update existing Mangaitem
    function update() {
      var mangaitem = ctrl.mangaitem;
      ctrl.mangaitem = undefined;
      MangaFactory.update(mangaitem, ctrl.tagArray, ctrl.config.updateHistory, ctrl.imgPath);
    }

		function submit() {
			if(ctrl.config.isCreate) ctrl.create();
			if(!ctrl.config.isCreate) ctrl.update();
		}

    // Find a list of Mangaitems
		function find() {
      Mangaitems.query().$promise.then(function(result) {
          ctrl.mangaitems = result;
					ctrl.config.statTags = ItemService.buildStatTags(result, 0);
      });
		}

		// Find existing Animeitem
		function findOne() {
	    spinnerService.loading('editManga', Mangaitems.get({ mangaitemId: $stateParams.mangaitemId }).$promise.then(function(result) {
          ctrl.mangaitem = result;
					ctrl.malSearchOptions.disabled = (ctrl.mangaitem.mal && ctrl.mangaitem.mal.id > 0) || false;
	    }));
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

	}

})();

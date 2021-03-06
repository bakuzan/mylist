(function() {
	'use strict';
	angular.module('characters')
	.controller('CharactersController', CharactersController);
	CharactersController.$inject = ['$scope', '$stateParams', '$location', 'Authentication', 'Characters', 'Animeitems', 'Mangaitems', 'fileUpload', '$sce', '$window', 'ListService', 'CharacterService', 'NotificationFactory', 'spinnerService', 'TagService'];

	function CharactersController($scope, $stateParams, $location, Authentication, Characters, Animeitems, Mangaitems, fileUpload, $sce, $window, ListService, CharacterService, NotificationFactory, spinnerService, TagService) {
		var ctrl = this;

		ctrl.addTag = addTag;
		ctrl.authentication = Authentication;
		ctrl.create = create;
		ctrl.dropTag = dropTag;
    ctrl.filterConfig = {
			isList: 'list', //show list? or slider.
      showingCount: 0,
      sortType: '',
      sortReverse: false,
      searchTags: '',
      media: '',
      seriesFilter: '',
      tagsForFilter: [],
      taglessItem: false,
      areTagless: false,
      selectListOptions: {},
      statTags: [],
      voiceActors: [],
      series: []
    };
		ctrl.find = find;
		ctrl.findAnime = findAnime;
		ctrl.findManga = findManga;
		ctrl.findOne = findOne;
		ctrl.findOneAnime = findOneAnime;
		ctrl.findOneManga = findOneManga;
    ctrl.imgPath = ''; //image path
		ctrl.maxItemCount = 0; //number of characters.
		ctrl.pageConfig = {
				currentPage: 0,
				pageSize: 10
		};
		ctrl.remove = remove;
		ctrl.removeTag = removeTag;
    ctrl.tagArray = []; // holding tags pre-submit
    ctrl.tagArrayRemove = [];
		ctrl.trustAsResourceUrl = trustAsResourceUrl;
		ctrl.update = update;
		ctrl.uploadFile = uploadFile;
    ctrl.usedTags = []; //for typeahead array.
		ctrl.whichController = 'character';


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

		// Create new Character
		function create() {
	    //console.log(ctrl.tagArray);
	    var character = new Characters();
			// Create new Character object
			character = new Characters ({
				name: ctrl.name,
      	image: ctrl.imgPath,
        anime: ctrl.anime!==undefined && ctrl.anime!==null ? ctrl.anime._id : ctrl.anime,
        manga: ctrl.manga!==undefined && ctrl.manga!==null ? ctrl.manga._id : ctrl.manga,
        voice: ctrl.voice,
        tags: ctrl.tagArray,
        user: ctrl.user
			});

			// Redirect after save
			character.$save(function(response) {
				$location.path('characters/' + response._id);
        NotificationFactory.success('Saved!', 'Character was saved successfully');
			}, function(errorResponse) {
				ctrl.error = errorResponse.data.message;
				NotificationFactory.error('Error!', errorResponse.data.message);
			});
		}

		// Remove existing Character
		function remove(character) {
      //are you sure option...
	    NotificationFactory.confirmation(function() {
	        if ( character ) {
	          character.$remove();
	          for (var i in ctrl.characters) {
	            if (ctrl.characters [i] === character) {
	                ctrl.characters.splice(i, 1);
	            }
	          }
	        } else {
	          ctrl.character.$remove(function() {
							$location.path('characters');
	          });
	        }
	        NotificationFactory.warning('Deleted!', 'Character was successfully deleted.');
	    });
		}

		// Update existing Character
		function update() {
			var character = ctrl.character;
      //dropdown passes whole object, if-statements for lazy fix - setting them to _id.
      if (ctrl.character.manga!==null && ctrl.character.manga!==undefined) {
          character.manga = ctrl.character.manga._id;
      }
//            console.log(ctrl.character.anime);
      if (ctrl.character.anime!==null && ctrl.character.anime!==undefined) {
          character.anime = ctrl.character.anime._id;
      }

      if (ctrl.tagArray!==undefined) {
          character.tags = ListService.concatenateTagArrays(character.tags, ctrl.tagArray);
      }

      if (ctrl.imgPath!==undefined && ctrl.imgPath!==null && ctrl.imgPath!=='') {
          character.image = ctrl.imgPath;
      }

			character.$update(function() {
				$location.path('characters');
				NotificationFactory.success('Saved!', 'Character was saved successfully');
			}, function(errorResponse) {
				ctrl.error = errorResponse.data.message;
        NotificationFactory.error('Error!', errorResponse.data.message);
			});
		}

		// Find a list of Characters
		function find() {
			ctrl.filterConfig.selectListOptions = ListService.getSelectListOptions(ctrl.whichController);
			spinnerService.loading('characters', Characters.query().$promise.then(function(result) {
				ctrl.characters = result;
				ctrl.filterConfig.areTagless = ListService.checkForTagless(result);
				ctrl.filterConfig.statTags = CharacterService.buildCharacterTags(result);
				ctrl.filterConfig.voiceActors = CharacterService.buildVoiceActors(result);
				ctrl.filterConfig.series = CharacterService.buildSeriesList(result);
				console.log('find characters: ', ctrl.characters, ctrl.filterConfig);
			}));
		}

		// Find existing Character
		function findOne() {
			ctrl.character = Characters.get({
				characterId: $stateParams.characterId
			});
		}

    // Find a list of Animeitems
		function findAnime() {
			ctrl.animeitems = Animeitems.query();
		}

    // Find existing Animeitem
		function findOneAnime(anime) {
			ctrl.animeitem = Animeitems.get({
				animeitemId: anime
			});
		}

    // Find a list of Mangaitems
		function findManga() {
			ctrl.mangaitems = Mangaitems.query();
		}

    // Find existing Animeitem
		function findOneManga(manga) {
			ctrl.mangaitem = Mangaitems.get({
				mangaitemId: manga
			});
		}

    //image upload
    function uploadFile(){
        ctrl.imgPath = '/modules/characters/img/' + ctrl.myFile.name;
        fileUpload.uploadFileToUrl(ctrl.myFile, '/fileUploadCharacter');
    }

	}

})();

'use strict';

// Characters controller
angular.module('characters').controller('CharactersController', ['$scope', '$stateParams', '$location', 'Authentication', 'Characters', 'Animeitems', 'Mangaitems', 'fileUpload', '$sce', '$window', 'ListService', 'CharacterService', 'NotificationFactory', 'spinnerService', 'TagService',
	function($scope, $stateParams, $location, Authentication, Characters, Animeitems, Mangaitems, fileUpload, $sce, $window, ListService, CharacterService, NotificationFactory, spinnerService, TagService) {
		var ctrl = this;
		ctrl.authentication = Authentication;
		ctrl.whichController = 'character';
    //paging variables.
    ctrl.pageConfig = {
        currentPage: 0,
        pageSize: 10
    };
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
      selectListOptions: ListService.getSelectListOptions(ctrl.whichController),
      statTags: [],
      voiceActors: [],
      series: []
    };
    ctrl.maxItemCount = 0; //number of characters.
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

		// Create new Character
		ctrl.create = function() {
	    //console.log(ctrl.tagArray);
	    var character = new Characters();
			// Create new Character object
			character = new Characters ({
				name: this.name,
      	image: ctrl.imgPath,
        anime: this.anime!==undefined && this.anime!==null ? this.anime._id : this.anime,
        manga: this.manga!==undefined && this.manga!==null ? this.manga._id : this.manga,
        voice: this.voice,
        tags: ctrl.tagArray,
        user: this.user
			});

			// Redirect after save
			character.$save(function(response) {
				$location.path('characters/' + response._id);
        NotificationFactory.success('Saved!', 'Character was saved successfully');
			}, function(errorResponse) {
				ctrl.error = errorResponse.data.message;
				NotificationFactory.error('Error!', errorResponse.data.message);
			});
		};

		// Remove existing Character
		ctrl.remove = function(character) {
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
		};

		// Update existing Character
		ctrl.update = function() {
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
		};

		// Find a list of Characters
		ctrl.find = function() {
			spinnerService.loading('characters', Characters.query().$promise.then(function(result) {
				ctrl.characters = result;
				ctrl.filterConfig.areTagless = ListService.checkForTagless(result);
				ctrl.filterConfig.statTags = CharacterService.buildCharacterTags(result);
				ctrl.filterConfig.voiceActors = CharacterService.buildVoiceActors(result);
				ctrl.filterConfig.series = CharacterService.buildSeriesList(result);
				console.log('find characters: ', ctrl.characters, ctrl.filterConfig);
			}));
		};

		// Find existing Character
		ctrl.findOne = function() {
			ctrl.character = Characters.get({
				characterId: $stateParams.characterId
			});
		};

    // Find a list of Animeitems
		ctrl.findAnime = function() {
			ctrl.animeitems = Animeitems.query();
		};

    // Find existing Animeitem
		ctrl.findOneAnime = function(anime) {
			ctrl.animeitem = Animeitems.get({
				animeitemId: anime
			});
		};

    // Find a list of Mangaitems
		ctrl.findManga = function() {
			ctrl.mangaitems = Mangaitems.query();
		};

    // Find existing Animeitem
		ctrl.findOneManga = function(manga) {
			ctrl.mangaitem = Mangaitems.get({
				mangaitemId: manga
			});
		};

    //image upload
    ctrl.uploadFile = function(){
        ctrl.imgPath = '/modules/characters/img/' + ctrl.myFile.name;
        fileUpload.uploadFileToUrl(ctrl.myFile, '/fileUploadCharacter');
    };

	}
]);

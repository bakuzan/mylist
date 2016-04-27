'use strict';

// Characters controller
angular.module('characters').controller('CharactersController', ['$scope', '$stateParams', '$location', 'Authentication', 'Characters', 'Animeitems', 'Mangaitems', 'fileUpload', '$sce', '$window', 'ListService', 'CharacterService', 'NotificationFactory', 'spinnerService',
	function($scope, $stateParams, $location, Authentication, Characters, Animeitems, Mangaitems, fileUpload, $sce, $window, ListService, CharacterService, NotificationFactory, spinnerService) {
		$scope.authentication = Authentication;

        // If user is not signed in then redirect back to signin.
		if (!$scope.authentication.user) $location.path('/signin');

        $scope.whichController = 'character';
        //paging variables.
        $scope.pageConfig = {
            currentPage: 0,
            pageSize: 10
        };
        $scope.filterConfig = {
            showingCount: 0,
            sortType: '',
            sortReverse: false,
            searchTags: '',
            media: '',
            seriesFilter: '',
            tagsForFilter: [],
            taglessItem: false,
            areTagless: false,
            selectListOptions: ListService.getSelectListOptions($scope.whichController),
            statTags: [],
            voiceActors: [],
            series: []
        };
        $scope.isList = 'list'; //show list? or slider.
        $scope.maxItemCount = 0; //number of characters.
        $scope.imgPath = ''; //image path
        $scope.tagArray = []; // holding tags pre-submit
        $scope.tagArrayRemove = [];
        $scope.usedTags = []; //for typeahead array.

        //allow retreival of local resource
        $scope.trustAsResourceUrl = function(url) {
            return $sce.trustAsResourceUrl(url);
        };

        //for adding/removing tags.
        $scope.addTag = function () {
//            console.log($scope.newTag);
            $scope.tagArray = ListService.addTag($scope.tagArray, $scope.newTag);
            $scope.newTag = '';
        };

		// Create new Character
		$scope.create = function() {
            //console.log($scope.tagArray);
            var character = new Characters();
             // Create new Character object
			 character = new Characters ({
				name: this.name,
                image: $scope.imgPath,
                anime: this.anime!==undefined && this.anime!==null ? this.anime._id : this.anime,
                manga: this.manga!==undefined && this.manga!==null ? this.manga._id : this.manga,
                voice: this.voice,
                tags: $scope.tagArray,
                user: this.user
			 });

			// Redirect after save
			character.$save(function(response) {
				$location.path('characters/' + response._id);
                NotificationFactory.success('Saved!', 'Character was saved successfully');
				// Clear form fields
				$scope.name = '';
                $scope.image = '';
                $scope.voice = '';
                $scope.tags = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
                NotificationFactory.error('Error!', errorResponse.data.message);
			});
		};

		// Remove existing Character
		$scope.remove = function(character) {
            //are you sure option...
            NotificationFactory.confirmation(function() {
                if ( character ) {
                    character.$remove();

                    for (var i in $scope.characters) {
                        if ($scope.characters [i] === character) {
                            $scope.characters.splice(i, 1);
                        }
                    }
                } else {
                    $scope.character.$remove(function() {
                        $location.path('characters');
                    });
                }
                NotificationFactory.warning('Deleted!', 'Character was successfully deleted.');
            });
		};

		// Update existing Character
		$scope.update = function() {
			var character = $scope.character;
            //dropdown passes whole object, if-statements for lazy fix - setting them to _id.
            if ($scope.character.manga!==null && $scope.character.manga!==undefined) {
                character.manga = $scope.character.manga._id;
            }
//            console.log($scope.character.anime);
            if ($scope.character.anime!==null && $scope.character.anime!==undefined) {
                character.anime = $scope.character.anime._id;
            }

            if ($scope.tagArray!==undefined) {
                character.tags = ListService.concatenateTagArrays(character.tags, $scope.tagArray);
            }

            if ($scope.imgPath!==undefined && $scope.imgPath!==null && $scope.imgPath!=='') {
                character.image = $scope.imgPath;
            }

			character.$update(function() {
				$location.path('characters');
                NotificationFactory.success('Saved!', 'Character was saved successfully');
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
                NotificationFactory.error('Error!', errorResponse.data.message);
			});
		};

		// Find a list of Characters
		$scope.find = function() {
			spinnerService.loading('characters', Characters.query().$promise.then(function(result) {
				$scope.characters = result;
				$scope.filterConfig.areTagless = ListService.checkForTagless(result);
				$scope.filterConfig.statTags = CharacterService.buildCharacterTags(result);
				$scope.filterConfig.voiceActors = CharacterService.buildVoiceActors(result);
				$scope.filterConfig.series = CharacterService.buildSeriesList(result);
				console.log('find characters: ', $scope.characters, $scope.filterConfig);
			}));
		};

		// Find existing Character
		$scope.findOne = function() {
			$scope.character = Characters.get({
				characterId: $stateParams.characterId
			});
//            console.log($scope.character);
		};

        // Find a list of Animeitems
		$scope.findAnime = function() {
			$scope.animeitems = Animeitems.query();
		};

        // Find existing Animeitem
		$scope.findOneAnime = function(anime) {
            //console.log(anime);
			$scope.animeitem = Animeitems.get({
				animeitemId: anime
			});
		};

        // Find a list of Mangaitems
		$scope.findManga = function() {
			$scope.mangaitems = Mangaitems.query();
		};

        // Find existing Animeitem
		$scope.findOneManga = function(manga) {
			$scope.mangaitem = Mangaitems.get({
				mangaitemId: manga
			});
		};

        //image upload
        $scope.uploadFile = function(){
            $scope.imgPath = '/modules/characters/img/' + $scope.myFile.name;
            fileUpload.uploadFileToUrl($scope.myFile, '/fileUploadCharacter');
        };

	}
]);

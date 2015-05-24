'use strict';

// Characters controller
angular.module('characters').controller('CharactersController', ['$scope', '$stateParams', '$location', 'Authentication', 'Characters', 'Animeitems', 'Mangaitems', 'fileUpload', '$sce', '$window',
	function($scope, $stateParams, $location, Authentication, Characters, Animeitems, Mangaitems, fileUpload, $sce, $window) {
		$scope.authentication = Authentication;
        
        // If user is not signed in then redirect back to signin.
		if (!$scope.authentication.user) $location.path('/signin');
        
        $scope.isList = true; //show list? or carousel.
        $scope.myInterval = 2500; //carousel timer.
        $scope.sortType = 'name'; //default sort type
	    $scope.sortReverse = false; // default sort order
        $scope.imgPath = ''; //image path
        //$scope.newTag = ''; //for adding tags.
        $scope.tagArray = []; // holding tags pre-submit
        $scope.tagArrayRemove = [];
        $scope.usedTags = []; //for typeahead array.
        $scope.voiceActors = []; //for typeahead array.

        //allow retreival of local resource
        $scope.trustAsResourceUrl = function(url) {
            return $sce.trustAsResourceUrl(url);
        };
        
        /**
         * tag splitter for mulitple values in typeahead search.
         *
//        //for splitting tags in the typeahead.
//        $scope.tagSplitter = function(viewValue) {
//            if (viewValue.indexOf(',') > -1) {
//                var lastTag = viewValue.substring(viewValue.lastIndexOf(',') + 1);
////                console.log(lastTag);
//                angular.forEach($scope.usedTags, function(used) {
//                    $scope.usedTags.push(lastTag + used);
//                });
//                console.log($scope.usedTags);
//            } else {
//                var tempTags = $scope.usedTags;
//                $scope.usedTags = [];
//                angular.forEach(tempTags, function(used) {
//                    if (used.indexOf(',') === -1) {
//                        $scope.usedTags.push(used);
//                    }
//                });
//            }
//        };
*/
        
        $scope.searchTags = '';
        $scope.passTag = function(tag) {
            if ($scope.searchTags.indexOf(tag) === -1) {
                $scope.searchTags += tag + ',';
            }
        };
        $scope.clearTagValues = function() {
            $scope.searchTags = '';
            $scope.tagsForFilter = [];
        };
        $scope.deleteSearchTag = function(tag) {
            $scope.searchTags = $scope.searchTags.replace(tag + ',', '');
            
            var index = $scope.tagsForFilter.indexOf(tag);
            $scope.tagsForFilter.splice(index, 1);
        };
        
        //for adding/removing tags.
        $scope.addTag = function () {
                $scope.tagArray.push({ text: $scope.newTag });
                $scope.newTag = '';
        };
        $scope.deleteTag = function(text) {
        
            var removal = $window.confirm('Are you sure you want to delete this tag?');
            if (removal) {
                var deletingItem = $scope.tagArray;
                $scope.tagArray = [];

                //update the complete task.
                angular.forEach(deletingItem, function(tag) {
                    if (tag.text !== text) {
                        $scope.tagArray.push(tag);
                    }
                });
            }
        };
        //remove existing tag.
        $scope.removeTag = function(tag) {
            var removal = $window.confirm('Are you sure you want to delete this tag?');
            if (removal) {
                var index = $scope.character.tags.indexOf(tag);
                $scope.character.tags.splice(index, 1);
            }
        };
        
        //special tag filter
        $scope.tagFilter = function(item) {
            var found = false;
            var i = 0;
            var tagsToSearch = [];
            if ($scope.searchTags===undefined || $scope.searchTags==='') {
                return true;
            } else {
                //get tags that are being looked for
//                var tagsForFilter = $scope.characterTags.split(',');
                $scope.tagsForFilter = $scope.searchTags.substring(0, $scope.searchTags.length - 1).split(',');
//                console.log($scope.tagsForFilter);
                
                //get tags of items to filter
                angular.forEach(item.tags, function(tag) {
                    tagsToSearch.push(tag.text);
                });
                
                //filter: check in 'query' is in tags.
                for(i = 0; i < $scope.tagsForFilter.length; i++) {
                    
                    if (tagsToSearch.indexOf($scope.tagsForFilter[i]) !== -1) {
                        found = true;
                    } else {
                        return false;
                    }
                }
                return found;
            }
        };
        
        //special media filter
        $scope.mediaFilter = function(item) {
            if ($scope.media==='anime') {
                if (item.anime!==null && item.manga===null) {
                    return true;
                }
                return false;
            } else if ($scope.media==='manga') {
                if (item.manga!==null && item.anime===null) {
                    return true;
                }
                return false;
            } else if ($scope.media==='both') {
                if (item.anime!==null && item.manga!==null) {
                    return true;
                }
                return false;
            } else {
                return true;
            }
        };
        
		// Create new Character
		$scope.create = function() {
            //console.log($scope.tagArray);
            var character = new Characters();
            //Handle situation if objects not selected.
			if (this.anime!==undefined && this.manga!==undefined && this.anime!==null && this.manga!==null) {
             // Create new Character object
			 character = new Characters ({
				name: this.name,
                image: $scope.imgPath,
                anime: this.anime._id,
                manga: this.manga._id,
                voice: this.voice,
                tags: $scope.tagArray,
                user: this.user
			 });
            } else if (this.anime!==undefined && this.anime!==null) {
             character = new Characters ({
				name: this.name,
                image: $scope.imgPath,
                anime: this.anime._id,
                manga: this.manga,
                voice: this.voice,
                tags: $scope.tagArray,
                user: this.user
			 });
            } else if (this.manga!==undefined && this.manga!==null) {
             character = new Characters ({
				name: this.name,
                image: $scope.imgPath,
                anime: this.anime,
                manga: this.manga._id,
                voice: this.voice,
                tags: $scope.tagArray,
                user: this.user
			 });
            } else {
             character = new Characters ({
				name: this.name,
                image: $scope.imgPath,
                anime: this.anime,
                manga: this.manga,
                voice: this.voice,
                tags: $scope.tagArray,
                user: this.user
			 });
            }
            
			// Redirect after save
			character.$save(function(response) {
				$location.path('characters/' + response._id);

				// Clear form fields
				$scope.name = '';
                $scope.image = '';
                $scope.voice = '';
                $scope.tags = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Character
		$scope.remove = function(character) {
            var removal = $window.confirm('Are you sure you want to delete this item?');
            if (removal) {
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
            }
		};

		// Update existing Character
		$scope.update = function() {
			var character = $scope.character;
            //dropdown passes whole object, if-statements for lazy fix - setting them to _id.
            if ($scope.character.manga!==null && $scope.character.manga!==undefined) {
                character.manga = $scope.character.manga._id;
            }
            console.log($scope.character.anime);
            if ($scope.character.anime!==null && $scope.character.anime!==undefined) {
                character.anime = $scope.character.anime._id;
            }
            
            if ($scope.tagArray!==undefined) {
                var temp = character.tags ;
                character.tags = temp.concat($scope.tagArray);
            }
            
            if ($scope.imgPath!==undefined && $scope.imgPath!==null && $scope.imgPath!=='') {
                character.image = $scope.imgPath;
            }
            
            
			character.$update(function() {
				$location.path('characters/' + character._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Characters
		$scope.find = function() {
			$scope.characters = Characters.query();
            //console.log($scope.characters);
		};
        
        //builds an array of unique tag names for the typeahead.
        $scope.createUsedTags = function(text) {
            var add = true;
            //is tag in array?
            for(var i=0; i < $scope.usedTags.length; i++) {
                if ($scope.usedTags[i]===text) {
                    add = false;
                }
            }
            //add if not in.
            if (add===true) {
                $scope.usedTags.push(text);
            }
        };
        
        //builds an array of unique voices for the typeahead.
        $scope.createVoices = function(voice) {
            var add = true;
            //is tag in array?
            for(var i=0; i < $scope.voiceActors.length; i++) {
                if ($scope.voiceActors[i]===voice) {
                    add = false;
                }
            }
            //add if not in.
            if (add===true) {
                $scope.voiceActors.push(voice);
            }
        };

		// Find existing Character
		$scope.findOne = function() {
			$scope.character = Characters.get({ 
				characterId: $stateParams.characterId
			});
            //console.log($scope.character);
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
        
        
        // Image upload
        $scope.uploadFile = function(){
            var file = $scope.myFile;
            $scope.imgPath = '/modules/characters/img/' + file.name;
            console.log('file is ' + JSON.stringify(file));
            var uploadUrl = '/fileUploadCharacter';
            fileUpload.uploadFileToUrl(file, uploadUrl);
        };
	}
]);
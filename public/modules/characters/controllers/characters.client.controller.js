'use strict';

// Characters controller
angular.module('characters').controller('CharactersController', ['$scope', '$stateParams', '$location', 'Authentication', 'Characters', 'Animeitems', 'Mangaitems', 'fileUpload', '$sce', '$window',
	function($scope, $stateParams, $location, Authentication, Characters, Animeitems, Mangaitems, fileUpload, $sce, $window) {
		$scope.authentication = Authentication;
        
        // If user is not signed in then redirect back to signin.
		if (!$scope.authentication.user) $location.path('/signin');
        
        $scope.whichController = 'character';
        //paging controls for the list view.
        $scope.currentPage = 0;
        $scope.pageSize = 10;
        $scope.numberOfPages = function(value){
            var numPages = Math.ceil(value/$scope.pageSize);
            
            //reset number of pages to be the final page if the number of pages
            //becomes less than the one you are on.
            if ($scope.currentPage + 1 > numPages) {
                $scope.currentPage = numPages-1;
            }
            if (numPages!==0 && $scope.currentPage < 0) {
                $scope.currentPage = 0;
            }
            $scope.pageCount = numPages;
            return numPages;
        };
        
        $scope.isList = 'list'; //show list? or carousel.
        $scope.maxItemCount = 0; //number of characters.
        $scope.statTagSortType = 'count'; //stat tag sort
        $scope.statTagSortReverse = true; //stat tag sort direction.
        $scope.statTagDetailSortType = 'count'; //stat tag detail sort
        $scope.statTagDetailSortReverse = true; //stat tag detail sort direction.
        $scope.statSeriesSortType = 'count'; //stat series sort
        $scope.statSeriesSortReverse = true; //stat series sort direction.
        $scope.myInterval = 2500; //carousel timer.
        $scope.sortType = 'name'; //default sort type
	    $scope.sortReverse = false; // default sort order
        $scope.imgPath = ''; //image path
        //$scope.newTag = ''; //for adding tags.
        $scope.tagArray = []; // holding tags pre-submit
        $scope.tagArrayRemove = [];
        $scope.usedTags = []; //for typeahead array.
        $scope.voiceActors = []; //for typeahead array.
        $scope.statTags = []; //for tag statistics;
        $scope.showTagDetail = false; //visibility of detail for tags.
        $scope.statSearch = ''; //filter value for tag detail.
        $scope.statSeries = []; //for series statistics;
        $scope.showSeriesDetail = false; //visibility of series drilldown.
        $scope.seriesSearch = ''; //for filtering series values.
        $scope.areTagless = false; //are any items tagless
        $scope.taglessItem = false; //filter variable for showing tagless items.
        $scope.male = 0; //gender count for pb.
        $scope.female = 0; //gender count for pb.
        $scope.nosex = 0; //no gender count for pb.

        //allow retreival of local resource
        $scope.trustAsResourceUrl = function(url) {
            return $sce.trustAsResourceUrl(url);
        };
        
        $scope.$watchCollection('characters', function() {
            if ($scope.characters!==undefined) {
//                console.log($scope.characters);
                $scope.maxItemCount = $scope.characters.length;
                var add = true;
                //is tag in array?
                angular.forEach($scope.characters, function(item) {
                    if (item.tags.length===0) {
                        $scope.areTagless = true;
                    }
                    angular.forEach(item.tags, function(tag) {
                        for(var i=0; i < $scope.statTags.length; i++) {
                            if ($scope.statTags[i].tag===tag.text) {
                                add = false;
                                $scope.statTags[i].count += 1; 
                            }
                        }
                        // add if not in
                        if (add===true) {
                            $scope.statTags.push({ tag: tag.text, count: 1 });
                        }
                        add = true; //reset add status.
                    });
//                    console.log($scope.statTags);
                });
                //get series counts.
                angular.forEach($scope.characters, function(item) {
                    for(var i=0; i < $scope.statSeries.length; i++) {
                        if (item.anime!==null) {
                            if ($scope.statSeries[i].name===item.anime.title) {
                                add = false;
                                $scope.statSeries[i].count += 1; 
                            }
                        } else if (item.manga!==null) {
                            if ($scope.statSeries[i].name===item.manga.title) {
                                add = false;
                                $scope.statSeries[i].count += 1; 
                            }
                        }
                    }
                    // add if not in
                    if (add===true) {
                        if (item.anime!==null) {
                            $scope.statSeries.push({ name: item.anime.title, count: 1 });
                        } else if (item.manga!==null) {
                            $scope.statSeries.push({ name: item.manga.title, count: 1 });
                        }
                    }
                    add = true; //reset add status.
                });
//                    console.log($scope.statSeries);
                //get gender counts.
                angular.forEach($scope.statTags, function(stat) {
                    if (stat.tag==='male') {
                        $scope.male = stat.count;
                    } else if (stat.tag==='female') {
                        $scope.female = stat.count;
                    }
                });
                $scope.nosex = $scope.maxItemCount - $scope.male - $scope.female;
                //is voice actor in array?
                angular.forEach($scope.characters, function(item) { 
                        for(var i=0; i < $scope.voiceActors.length; i++) {
                            if ($scope.voiceActors[i]===item.voice) {
                                add = false; 
                            }
                        }
                        // add if not in
                        if (add===true) {
                            $scope.voiceActors.push(item.voice);
                        }
                        add = true; //reset add status.
                });
            }
        });
        
        $scope.searchTags = '';
        $scope.passTag = function(tag) {
            if ($scope.searchTags.indexOf(tag) === -1) {
                $scope.searchTags += tag + ',';
                $scope.tagsForFilter = $scope.searchTags.substring(0, $scope.searchTags.length - 1).split(',');
            }
        };
        //for adding/removing tags.
        $scope.addTag = function () {
            if ($scope.newTag!=='' && $scope.newTag!==undefined) {
                $scope.tagArray.push({ text: $scope.newTag });
                $scope.newTag = '';
            }
        };
        
        //show stat tag detail.
        $scope.tagDetail = function(name) {
            if ($scope.detailTagName===name) {
                $scope.statSearch = '';
                $scope.showTagDetail = false;
                $scope.detailTagName = '';
                $scope.isEqual = false;
            } else {
                $scope.statSearch = name;
                $scope.detailTagName = name;
                $scope.isEqual = true;
                $scope.showTagDetail = true;
                $scope.tagDetailCollection = [];
                $scope.tagDetailResult = [];
                var add = true;
                angular.forEach($scope.characters, function(item){
                    for(var i=0; i < item.tags.length; i++) {
                        if (item.tags[i].text===name) {
                            $scope.tagDetailCollection.push(item.tags);
                        }
                    }
                });
//                console.log($scope.tagDetailCollection);
                angular.forEach($scope.tagDetailCollection, function(item) {
                    angular.forEach(item, function(tem) {
//                        console.log(tem);
                        for(var i=0; i < $scope.tagDetailResult.length; i++) {
                            //if exists and not the search value - increment the count.
                            if ($scope.tagDetailResult[i].name===tem.text && tem.text!==name) {
                                add = false;
                                $scope.tagDetailResult[i].count += 1; 
                            }
                        }
                        //add in if true and not the tag we searched on.
                        if (add===true && tem.text!==name) {
                            $scope.tagDetailResult.push({ name: tem.text, count: 1 });
                        }
                        add = true;
                    });
//                    console.log($scope.tagDetailResult);
                });
            }
        };
        
        //show stat series detail.
        $scope.seriesDetail = function(name) {
            if ($scope.detailSeriesName===name) {
                $scope.seriesSearch = '';
                $scope.showSeriesDetail = false;
                $scope.detailSeriesName = '';
            } else {
                $scope.seriesSearch = name;
                $scope.detailSeriesName = name;
                $scope.showSeriesDetail = true;
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
				$location.path('characters');
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Characters
		$scope.find = function() {
			$scope.characters = Characters.query();
            //console.log($scope.characters);
		};

		// Find existing Character
		$scope.findOne = function() {
			$scope.character = Characters.get({ 
				characterId: $stateParams.characterId
			});
            console.log($scope.character);
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
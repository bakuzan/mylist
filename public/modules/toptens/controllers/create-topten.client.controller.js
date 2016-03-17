'use strict';

// Toptens controller
angular.module('toptens').controller('CreateToptenController', ['$scope', '$stateParams', '$location', 'Authentication', 'Toptens', 'ListService', 'Animeitems', 'Mangaitems', 'Characters', 'NotificationFactory', 'CharacterService',
	function($scope, $stateParams, $location, Authentication, Toptens, ListService, Animeitems, Mangaitems, Characters, NotificationFactory, CharacterService) {
		$scope.authentication = Authentication;
        
        $scope.stepConfig = {
            steps: [1,2,3,4,5,6,7,8,9,10],
            stepHeaders: [
                { text: 'Select attributes' },
                { text: 'Set conditions' },
                { text: 'Populate list' }
            ],
            currentStep: 1,
            stepCount: 3,
            listGen: {
                itemsCached: [],
                items: [],
                displayList: [],
                seriesList: [],
                typeDisplay: '',
                toptenItem: '',
                seriesLimit: '',
                tagLimit: '',
                series: [],
                tags: []
            },
            limitMin: 0
        };
        var toptenCopy = {
            name: '',
            description: '',
            type: '',
            isFavourite: false,
            isRanked: false,
            animeList: [],
            mangaList: [],
            characterList: [],
            conditions: {
                limit: null,
                series: [],
                tags: []
            }
        };
        $scope.topten = {};
        angular.copy(toptenCopy, $scope.topten);
        $scope.commonArrays = ListService.getCommonArrays();
        $scope.isCreate = true;
        $scope.imgSize = {
            height: '50px',
            width: '100px'
        };

		// Create new Topten
		$scope.create = function() {
            console.log($scope.topten, this.topten);
			// Create new Topten object
            var topten = new Toptens();
			topten = new Toptens ({
				name: this.topten.name,
                description: this.topten.description,
                type: this.topten.type,
                isFavourite: this.topten.isFavourite,
                isRanked: this.topten.isRanked,
                animeList: this.topten.animeList.length > 0 ? this.topten.animeList : null,
                characterList: this.topten.characterList.length > 0 ? this.topten.characterList : null,
                mangaList: this.topten.mangaList.length > 0 ? this.topten.mangaList : null,
                conditions: {
                    limit: this.topten.conditions.limit,
                    series: this.topten.conditions.series,
                    tags: this.topten.conditions.tags
                }
			});

			// Redirect after save
			topten.$save(function(response) {
				$location.path('toptens/' + response._id);
                NotificationFactory.success('Saved!', 'New List was successfully saved!');
				// Clear form fields
				angular.copy(toptenCopy, $scope.topten);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
                NotificationFactory.error('Error!', 'Something went wrong!');
			});
		};
        
		// Update existing Topten
		$scope.update = function() {
			var topten = $scope.topten;

			topten.$update(function() {
				$location.path('toptens/' + topten._id);
                NotificationFactory.success('Updated!', 'List update was successful!');
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
                NotificationFactory.error('Error!', 'Something went wrong!');
			});
		};
        
        function typeSetItemPopulate() {
            var type = ListService.manipulateString($scope.topten.type, 'upper', true);
            switch(type) {
                case 'Anime':
                    Animeitems.query().$promise.then(function(result) {
                        $scope.stepConfig.listGen.items = result;
                        $scope.stepConfig.listGen.typeDisplay = 'title';
                        $scope.stepConfig.listGen.tags = CharacterService.buildCharacterTags(result);
                    });
                    break;
                case 'Manga':
                    Mangaitems.query().$promise.then(function(result) {
                        $scope.stepConfig.listGen.items = result;
                        $scope.stepConfig.listGen.typeDisplay = 'title';
                        $scope.stepConfig.listGen.tags = CharacterService.buildCharacterTags(result);
                    });
                    break;
                case 'Character':
                    Characters.query().$promise.then(function(result) {
                        $scope.stepConfig.listGen.items = result;
                        $scope.stepConfig.listGen.typeDisplay = 'name';
                        $scope.stepConfig.listGen.tags = CharacterService.buildCharacterTags(result);
                        $scope.stepConfig.listGen.series = CharacterService.buildSeriesList(result);
                    });
                    break;
            }
            console.log('type set: ', $scope.stepConfig.listGen);
        }
        
        //Processing on step submits.
        function process(number, direction, callback) {
            console.log(number, direction);
            switch(number) {
                case 1: 
                    if ($scope.topten.type !== '' && $scope.isCreate) {
                        typeSetItemPopulate();
                        callback();
                    } else if ($scope.topten.type !== '' && !$scope.isCreate) {
                        if ($scope.stepConfig.listGen.displayList.length < 1) {
                            angular.forEach($scope.topten[$scope.topten.type + 'List'], function(item) {
                                var index = ListService.findWithAttr($scope.stepConfig.listGen.items, '_id', item._id);
                                $scope.stepConfig.listGen.displayList.push($scope.stepConfig.listGen.items[index]);
                            });
                            $scope.stepConfig.limitMin = $scope.stepConfig.listGen.displayList.length;
                        }
                        callback();
                    } else if ($scope.topten.type === '') {
                        NotificationFactory.popup('Invalid form', 'You MUST select a type to continue.', 'error');
                    }
                    break;
                    
                case 2:
                    angular.copy($scope.stepConfig.listGen.items, $scope.stepConfig.listGen.itemsCached);
                    console.log($scope.stepConfig.listGen.items, $scope.stepConfig.listGen.cachedItems);
                    if($scope.topten.conditions.series.length > 0) {
                        var i = $scope.stepConfig.listGen.items.length;
                        while(i--) {
                            var remove = true;
                            if($scope.stepConfig.listGen.items[i].anime !== null) {
                                angular.forEach($scope.topten.conditions.series, function(series) {
                                    console.log($scope.stepConfig.listGen.items[i].anime.title,
                                                series.name,
                                                $scope.stepConfig.listGen.items[i].anime.title.indexOf(series.name));
                                    if($scope.stepConfig.listGen.items[i].anime.title.indexOf(series.name) > -1) {
                                        remove = false;
                                    }
                                });
                                if(remove) {
                                    $scope.stepConfig.listGen.items.splice(i, 1);
                                }
                            } else if($scope.stepConfig.listGen.items[i].manga !== null) {
                                angular.forEach($scope.topten.conditions.series, function(series) {
                                    console.log($scope.stepConfig.listGen.items[i].manga.title,
                                                series.name,
                                                $scope.stepConfig.listGen.items[i].manga.title.indexOf(series.name));
                                    if($scope.stepConfig.listGen.items[i].manga.title.indexOf(series.name) > -1) {
                                        remove = false;
                                    }
                                });
                                if(remove) {
                                    $scope.stepConfig.listGen.items.splice(i, 1);
                                }
                            } else {
                                $scope.stepConfig.listGen.items.splice(i, 1);
                            }
                        }
                    }
                    
                    if($scope.topten.conditions.tags.length > 0) {
                        var i = $scope.stepConfig.listGen.items.length;
                        while(i--) {
                            var remove = 0;
                            angular.forEach($scope.topten.conditions.tags, function(tag) {
                                console.log($scope.stepConfig.listGen.items[i].tags, 
                                            tag.tag, 
                                            ListService.findWithAttr($scope.stepConfig.listGen.items[i].tags, 'text', tag.tag));
                                if(ListService.findWithAttr($scope.stepConfig.listGen.items[i].tags, 'text', tag.tag) > -1) {
                                    remove++;
                                }
                            });
                            if(remove !== $scope.topten.conditions.tags.length) {
                                $scope.stepConfig.listGen.items.splice(i, 1);
                            }
                        }
                    }
                    callback();
                    break;
                    
                case 3:
                    if(!direction) {
                        $scope.stepConfig.listGen.items = $scope.stepConfig.listGen.itemsCached;
                    }
                    callback();
                    break;
            }
        }
        
        $scope.pushItem = function(item) {
            if($scope.topten.conditions.limit === null || $scope.topten.conditions.limit === 0 || $scope.topten.conditions.limit > $scope.stepConfig.listGen.displayList.length) {
                var index = $scope.topten[$scope.topten.type+'List'].indexOf(item._id);
                if (!$scope.isCreate && index === -1) {
                    index = ListService.findWithAttr($scope.topten[$scope.topten.type+'List'], '_id', item._id);    
                }
                if (index === -1) {
                    $scope.topten[$scope.topten.type + 'List'].push(item._id);
                    $scope.stepConfig.listGen.displayList.push(item);
                } else {
                    NotificationFactory.warning('Duplicate!', 'Item has already been added to list.');
                }
            } else {
                NotificationFactory.error('Full!', 'Item list has reached the defined capacity.');
            }
            $scope.stepConfig.listGen.toptenItem = '';
        };
        
        $scope.removeItem = function(item) {
            //For display array.
            var index = $scope.stepConfig.listGen.displayList.indexOf(item);
            $scope.stepConfig.listGen.displayList.splice(index, 1);
            
            //For topten list.
            index = $scope.topten[$scope.topten.type + 'List'].indexOf(item._id);
            if (!$scope.isCreate && index === -1) {
                index = ListService.findWithAttr($scope.topten[$scope.topten.type+'List'], '_id', item._id);    
            }
            $scope.topten[$scope.topten.type + 'List'].splice(index, 1);
            NotificationFactory.warning('Removed!', 'Item has been removed from list.');
        };
        
        $scope.pushCondition = function(type, item) {
            var index, indexTwo;
            switch(type) {
                case 'series':
                    index = ListService.findWithAttr($scope.topten.conditions.series, 'name', item.name);
                    indexTwo = $scope.topten.conditions.series.indexOf(item);
                    if(index === -1 && indexTwo === -1) {
                        $scope.topten.conditions.series.push(item);
                        $scope.stepConfig.listGen.seriesList.push(item);
                    } else {
                        NotificationFactory.warning('Duplicate!', 'Series has already been added to list.');
                    }
                    $scope.stepConfig.listGen.seriesLimit = '';
                    break;
                    
                case 'tag':
                    index = ListService.findWithAttr($scope.topten.conditions.tags, 'tag', item.tag);
                    if(index === -1) {
                        $scope.topten.conditions.tags.push(item);
                    } else {
                        NotificationFactory.warning('Duplicate!', 'Tag has already been added to list.');
                    }
                    $scope.stepConfig.listGen.tagLimit = '';
                    break;
            }
        };
        
        $scope.removeCondition = function(type, item) {
            var index, indexTwo;
            switch(type) {
                case 'series':
                    index = ListService.findWithAttr($scope.topten.conditions.series, 'name', item.name);
                    if(index === -1) {
                        index = $scope.topten.conditions.series.indexOf(item);
                        $scope.topten.conditions.series.splice(index, 1);
                    } else {
                        $scope.topten.conditions.series.splice(index, 1);
                    }
                    indexTwo = $scope.stepConfig.listGen.seriesList.indexOf(item);
                    $scope.stepConfig.listGen.seriesList.splice(indexTwo, 1);
                    NotificationFactory.warning('Removed!', 'Series has been removed from list.');
                    break;
                    
                case 'tag':
                    index = $scope.topten.conditions.tags.indexOf(item);
                    $scope.topten.conditions.tags.splice(index, 1);
                    NotificationFactory.warning('Removed!', 'Tag has been removed from list.');
                    break;
            }
        };
        
        //Step related functions:
        $scope.takeStep = function(number, direction) {
            process(number, direction, function() {
                $scope.stepConfig.currentStep = (direction) ? number + 1 : number - 1;
            });
            console.log('step: ', $scope.stepConfig, $scope.topten);
        };
        $scope.cancel = function() {
            $location.path('toptens');
        };
        
        function inital() {
            console.log('state params: ', $stateParams);
            if ($stateParams.toptenId !== undefined) {
                $scope.isCreate = false;
                Toptens.get({ toptenId: $stateParams.toptenId }).$promise.then(function(result) {
                    $scope.topten = result;
                    typeSetItemPopulate();
                });
                console.log('topten: ', $scope.topten);
            }
        }
        inital();
	}
]);
'use strict';

// Toptens controller
angular.module('toptens').controller('CreateToptenController', ['$scope', '$stateParams', '$location', 'Authentication', 'Toptens', 'ListService', 'Animeitems', 'Mangaitems', 'Characters', 'NotificationFactory', 'CharacterService', 'ItemService', '$filter',
	function($scope, $stateParams, $location, Authentication, Toptens, ListService, Animeitems, Mangaitems, Characters, NotificationFactory, CharacterService, ItemService, $filter) {
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
            limitMin: 0,
						swapping: {
							one: '',
							two: ''
						}
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
                tags: [],
								season: null,
								year: null
            }
        };
        $scope.topten = {};
        angular.copy(toptenCopy, $scope.topten);
        $scope.commonArrays = ListService.getCommonArrays();
				$scope.years = [];
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
                    tags: this.topten.conditions.tags,
										season: this.topten.conditions.season,
										year: this.topten.conditions.year,
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
												$scope.years = ItemService.endingYears(result);
												console.log('years: ', $scope.years);
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
										if(direction) {
											var i = 0, j = 0, length;
	                    angular.copy($scope.stepConfig.listGen.items, $scope.stepConfig.listGen.itemsCached);
	                    // console.log('pre conditions: ', $scope.stepConfig.listGen.items.length, $scope.stepConfig.listGen.itemsCached.length);

											if($scope.topten.type === 'anime') {
												if($scope.topten.conditions.season) {
													if($scope.topten.conditions.year) {
														$scope.stepConfig.listGen.items = $filter('season')($scope.stepConfig.listGen.items, $scope.topten.conditions.year, $scope.topten.conditions.season);
													} else {
														NotificationFactory.popup('Invalid form', 'A year MUST be selected when selecting a season.', 'error');
														break;
													}
												} else {
													if($scope.topten.conditions.year) {
														$scope.stepConfig.listGen.items = $filter('filter')($scope.stepConfig.listGen.items, { season: { year: $scope.topten.conditions.year } });
													}
												}
											} else if($scope.topten.type === 'character') {
												if($scope.topten.conditions.season) {
													if($scope.topten.conditions.year) {
														$scope.stepConfig.listGen.items = $filter('seasonForCharacterAnime')($scope.stepConfig.listGen.items, $scope.topten.conditions.year, $scope.topten.conditions.season);
													} else {
														NotificationFactory.popup('Invalid form', 'A year MUST be selected when selecting a season.', 'error');
														break;
													}
												} else {
													if($scope.topten.conditions.year) {
														$scope.stepConfig.listGen.items = $filter('filter')($scope.stepConfig.listGen.items, { anime: { season: { year: $scope.topten.conditions.year } } });
													}
												}
											}

	                    if($scope.topten.conditions.series.length > 0) {
	                        i = $scope.stepConfig.listGen.items.length;
	                        while(i--) {
	                            var remove = true,
																	attr = ($scope.stepConfig.listGen.items[i].anime !== null) ? 'anime' :
																				 ($scope.stepConfig.listGen.items[i].anime !== null) ? 'manga' :
																				 																											 null;
															length = $scope.topten.conditions.series.length;
														//  console.log('tag while: ', i, length, attr);
	                            if(attr !== null) {
																// console.log('tag item: ', $scope.stepConfig.listGen.items[i]);
																for(j = 0; j < length; j++) {
																	var series = $scope.topten.conditions.series[j];
																	// console.log($scope.stepConfig.listGen.items[i][attr].title, series.name, $scope.stepConfig.listGen.items[i][attr].title.indexOf(series.name));
	                                if($scope.stepConfig.listGen.items[i][attr].title.indexOf(series.name) > -1) {
	                                    remove = false;
	                                }
																}
	                              if(remove) {
																	// console.log('remove as remove: ' + remove);
	                                  $scope.stepConfig.listGen.items.splice(i, 1);
	                              }
	                            } else {
																// console.log('straight remove');
																$scope.stepConfig.listGen.items.splice(i, 1);
	                            }
	                        }
	                    }

	                    if($scope.topten.conditions.tags.length > 0) {
	                        i = $scope.stepConfig.listGen.items.length;
	                        while(i--) {
	                            var count = 0;
															length = $scope.topten.conditions.tags.length;
																	// console.log('tag while: ', i, length);
															if($scope.stepConfig.listGen.items[i].tags.length > 0) {
																// console.log('tag item: ', $scope.stepConfig.listGen.items[i].tags);
																for(j = 0; j < length; j++) {
																	var tag = $scope.topten.conditions.tags[j];
																	// console.log('tag round: ' + i + '-' + j, $scope.stepConfig.listGen.items[i].tags, tag.tag, ListService.findWithAttr($scope.stepConfig.listGen.items[i].tags, 'text', tag.tag));
			                                if(ListService.findWithAttr($scope.stepConfig.listGen.items[i].tags, 'text', tag.tag) > -1) {
			                                    count++;
			                                }
																}
		                            if(count !== length) {
																	// console.log('remove as count: ' + count + ' > length: ' + length);
																	$scope.stepConfig.listGen.items.splice(i, 1);
		                            }
															} else {
																// console.log('straight remove');
																$scope.stepConfig.listGen.items.splice(i, 1);
															}
	                        }
	                    }
											// console.log('post conditions: ', $scope.stepConfig.listGen.items.length, $scope.stepConfig.listGen.itemsCached.length);
										}
                    callback();
                    break;

                case 3:
                    if(!direction) {
                        $scope.stepConfig.listGen.items = angular.copy($scope.stepConfig.listGen.itemsCached);
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
                    if(index === -1) {
                        $scope.topten.conditions.series.push(item);
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
										$scope.topten.conditions.series.splice(index, 1);
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
										console.log('topten: ', result);
                    typeSetItemPopulate();
                });
            }
        }
        inital();

				$scope.swappingItems = function(index) {
					console.log('item selected: ', index);
					if($scope.stepConfig.swapping.one === '') {
						$scope.stepConfig.swapping.one = index;
					} else if($scope.stepConfig.swapping.one === index) {
						$scope.stepConfig.swapping.one = '';
					} else {
						$scope.stepConfig.swapping.two = index;
						//Re-order display list.
						var temp = $scope.stepConfig.listGen.displayList[$scope.stepConfig.swapping.one];
						$scope.stepConfig.listGen.displayList[$scope.stepConfig.swapping.one] = $scope.stepConfig.listGen.displayList[$scope.stepConfig.swapping.two];
						$scope.stepConfig.listGen.displayList[$scope.stepConfig.swapping.two] = temp;
						//Re-order topten item list.
						temp = $scope.topten[$scope.topten.type + 'List'][$scope.stepConfig.swapping.one];
						$scope.topten[$scope.topten.type + 'List'][$scope.stepConfig.swapping.one] = $scope.topten[$scope.topten.type + 'List'][$scope.stepConfig.swapping.two];
						$scope.topten[$scope.topten.type + 'List'][$scope.stepConfig.swapping.two] = temp;
						//Clear.
						$scope.stepConfig.swapping.one = '';
						$scope.stepConfig.swapping.two = '';
					}
				};

	}
]);

(function() {
	'use strict';
	angular.module('toptens').controller('CreateToptenController', CreateToptenController);
	CreateToptenController.$inject = ['$scope', '$stateParams', '$location', 'Authentication', 'Toptens', 'ListService', 'Animeitems', 'Mangaitems', 'Characters', 'NotificationFactory', 'CharacterService', 'ItemService', '$filter'];

	function CreateToptenController($scope, $stateParams, $location, Authentication, Toptens, ListService, Animeitems, Mangaitems, Characters, NotificationFactory, CharacterService, ItemService, $filter) {
		var ctrl = this,
				toptenCopy = {
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

		ctrl.authentication = Authentication;
		ctrl.cancel = cancel;
		ctrl.create = create;
		ctrl.commonArrays = ListService.getCommonArrays();
		ctrl.imgSize = {
				height: '50px',
				width: '100px'
		};
		ctrl.isCreate = true;
		ctrl.pushCondition = pushCondition;
		ctrl.pushItem = pushItem;
		ctrl.removeCondition = removeCondition;
		ctrl.removeItem = removeItem;
    ctrl.stepConfig = {
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
		ctrl.swappingItems = swappingItems;
		ctrl.takeStep = takeStep;
    ctrl.topten = {};
    angular.copy(toptenCopy, ctrl.topten);
		ctrl.update = update;
		ctrl.years = [];
		// Create new Topten
		function create() {
            // console.log(ctrl.topten, ctrl.topten);
			// Create new Topten object
			var topten = new Toptens();
			topten = new Toptens ({
				name: ctrl.topten.name,
                description: ctrl.topten.description,
                type: ctrl.topten.type,
                isFavourite: ctrl.topten.isFavourite,
                isRanked: ctrl.topten.isRanked,
                animeList: ctrl.topten.animeList.length > 0 ? ctrl.topten.animeList : null,
                characterList: ctrl.topten.characterList.length > 0 ? ctrl.topten.characterList : null,
                mangaList: ctrl.topten.mangaList.length > 0 ? ctrl.topten.mangaList : null,
                conditions: {
                    limit: ctrl.topten.conditions.limit,
                    series: ctrl.topten.conditions.series,
                    tags: ctrl.topten.conditions.tags,
										season: ctrl.topten.conditions.season,
										year: ctrl.topten.conditions.year,
                }
			});

			// Redirect after save
			topten.$save(function(response) {
				$location.path('toptens/' + response._id);
				NotificationFactory.success('Saved!', 'New List was successfully saved!');
				// Clear form fields
				angular.copy(toptenCopy, ctrl.topten);
			}, function(errorResponse) {
				ctrl.error = errorResponse.data.message;
				NotificationFactory.error('Error!', 'Something went wrong!');
			});
		}

		// Update existing Topten
		function update() {
			var topten = ctrl.topten;

			topten.$update(function() {
				$location.path('toptens/' + topten._id);
                NotificationFactory.success('Updated!', 'List update was successful!');
			}, function(errorResponse) {
				ctrl.error = errorResponse.data.message;
                NotificationFactory.error('Error!', 'Something went wrong!');
			});
		}

    function typeSetItemPopulate() {
        var type = ListService.manipulateString(ctrl.topten.type, 'upper', true);
        switch(type) {
            case 'Anime':
                Animeitems.query().$promise.then(function(result) {
                    ctrl.stepConfig.listGen.items = result;
                    ctrl.stepConfig.listGen.typeDisplay = 'title';
                    ctrl.stepConfig.listGen.tags = CharacterService.buildCharacterTags(result);
										ctrl.years = ItemService.endingYears(result);
                });
                break;
            case 'Manga':
                Mangaitems.query().$promise.then(function(result) {
                    ctrl.stepConfig.listGen.items = result;
                    ctrl.stepConfig.listGen.typeDisplay = 'title';
                    ctrl.stepConfig.listGen.tags = CharacterService.buildCharacterTags(result);
                });
                break;
            case 'Character':
                Characters.query().$promise.then(function(result) {
                    ctrl.stepConfig.listGen.items = result;
                    ctrl.stepConfig.listGen.typeDisplay = 'name';
                    ctrl.stepConfig.listGen.tags = CharacterService.buildCharacterTags(result);
                    ctrl.stepConfig.listGen.series = CharacterService.buildSeriesList(result);
										var getYears = [];
										angular.forEach(result, function (item) {
											if(item.anime) {
												getYears.push(item.anime);
											}
										});
										ctrl.years = ItemService.endingYears(getYears);
                });
                break;
        }
        // console.log('type set: ', ctrl.stepConfig.listGen);
			}

    //Processing on step submits.
    function process(number, direction, callback) {
        // console.log(number, direction);
        switch(number) {
            case 1:
                if (ctrl.topten.type !== '' && ctrl.isCreate) {
                    typeSetItemPopulate();
                    callback();
                } else if (ctrl.topten.type !== '' && !ctrl.isCreate) {
                    if (ctrl.stepConfig.listGen.displayList.length < 1) {
                        angular.forEach(ctrl.topten[ctrl.topten.type + 'List'], function(item) {
                            var index = ListService.findWithAttr(ctrl.stepConfig.listGen.items, '_id', item._id);
                            ctrl.stepConfig.listGen.displayList.push(ctrl.stepConfig.listGen.items[index]);
                        });
                        ctrl.stepConfig.limitMin = ctrl.stepConfig.listGen.displayList.length;
                    }
                    callback();
                } else if (ctrl.topten.type === '') {
                    NotificationFactory.popup('Invalid form', 'You MUST select a type to continue.', 'error');
                }
                break;

            case 2:
								if(direction) {
									var i = 0, j = 0, length;
                  angular.copy(ctrl.stepConfig.listGen.items, ctrl.stepConfig.listGen.itemsCached);
                  // console.log('pre conditions: ', ctrl.stepConfig.listGen.items.length, ctrl.stepConfig.listGen.itemsCached.length);

									if(ctrl.topten.type === 'anime') {
										if(ctrl.topten.conditions.season) {
											if(ctrl.topten.conditions.year) {
												ctrl.stepConfig.listGen.items = $filter('season')(ctrl.stepConfig.listGen.items, ctrl.topten.conditions.year, ctrl.topten.conditions.season);
											} else {
												NotificationFactory.popup('Invalid form', 'A year MUST be selected when selecting a season.', 'error');
												break;
											}
										} else {
											if(ctrl.topten.conditions.year) {
												ctrl.stepConfig.listGen.items = $filter('filter')(ctrl.stepConfig.listGen.items, { season: { year: ctrl.topten.conditions.year } });
											}
										}
									} else if(ctrl.topten.type === 'character') {
										if(ctrl.topten.conditions.season) {
											if(ctrl.topten.conditions.year) {
												ctrl.stepConfig.listGen.items = $filter('seasonForCharacterAnime')(ctrl.stepConfig.listGen.items, ctrl.topten.conditions.year, ctrl.topten.conditions.season);
											} else {
												NotificationFactory.popup('Invalid form', 'A year MUST be selected when selecting a season.', 'error');
												break;
											}
										} else {
											if(ctrl.topten.conditions.year) {
												ctrl.stepConfig.listGen.items = $filter('filter')(ctrl.stepConfig.listGen.items, { anime: { season: { year: ctrl.topten.conditions.year } } });
											}
										}
									}

                  if(ctrl.topten.conditions.series.length > 0) {
                      i = ctrl.stepConfig.listGen.items.length;
                      while(i--) {
                          var remove = true,
															attr = (ctrl.stepConfig.listGen.items[i].anime !== null) ? 'anime' :
																		 (ctrl.stepConfig.listGen.items[i].anime !== null) ? 'manga' :
																		 																											 null;
													length = ctrl.topten.conditions.series.length;
												//  console.log('tag while: ', i, length, attr);
                          if(attr !== null) {
														// console.log('tag item: ', ctrl.stepConfig.listGen.items[i]);
														for(j = 0; j < length; j++) {
															var series = ctrl.topten.conditions.series[j];
															// console.log(ctrl.stepConfig.listGen.items[i][attr].title, series.name, ctrl.stepConfig.listGen.items[i][attr].title.indexOf(series.name));
                              if(ctrl.stepConfig.listGen.items[i][attr].title.indexOf(series.name) > -1) {
                                  remove = false;
                              }
														}
                            if(remove) {
															// console.log('remove as remove: ' + remove);
                                ctrl.stepConfig.listGen.items.splice(i, 1);
                            }
                          } else {
														// console.log('straight remove');
														ctrl.stepConfig.listGen.items.splice(i, 1);
                          }
                      }
                  }

                  if(ctrl.topten.conditions.tags.length > 0) {
                      i = ctrl.stepConfig.listGen.items.length;
                      while(i--) {
                          var count = 0;
													length = ctrl.topten.conditions.tags.length;
															// console.log('tag while: ', i, length);
													if(ctrl.stepConfig.listGen.items[i].tags.length > 0) {
														// console.log('tag item: ', ctrl.stepConfig.listGen.items[i].tags);
														for(j = 0; j < length; j++) {
															var tag = ctrl.topten.conditions.tags[j];
															// console.log('tag round: ' + i + '-' + j, ctrl.stepConfig.listGen.items[i].tags, tag.tag, ListService.findWithAttr(ctrl.stepConfig.listGen.items[i].tags, 'text', tag.tag));
	                                if(ListService.findWithAttr(ctrl.stepConfig.listGen.items[i].tags, 'text', tag.tag) > -1) {
	                                    count++;
	                                }
														}
                            if(count !== length) {
															// console.log('remove as count: ' + count + ' > length: ' + length);
															ctrl.stepConfig.listGen.items.splice(i, 1);
                            }
													} else {
														// console.log('straight remove');
														ctrl.stepConfig.listGen.items.splice(i, 1);
													}
                      }
                  }
									// console.log('post conditions: ', ctrl.stepConfig.listGen.items.length, ctrl.stepConfig.listGen.itemsCached.length);
								}
                callback();
                break;

            case 3:
                if(!direction) {
                    ctrl.stepConfig.listGen.items = angular.copy(ctrl.stepConfig.listGen.itemsCached);
                }
                callback();
                break;
        }
    }

    function pushItem(item) {
        if(ctrl.topten.conditions.limit === null || ctrl.topten.conditions.limit === 0 || ctrl.topten.conditions.limit > ctrl.stepConfig.listGen.displayList.length) {
            var index = ctrl.topten[ctrl.topten.type+'List'].indexOf(item._id);
            if (!ctrl.isCreate && index === -1) {
                index = ListService.findWithAttr(ctrl.topten[ctrl.topten.type+'List'], '_id', item._id);
            }
            if (index === -1) {
                ctrl.topten[ctrl.topten.type + 'List'].push(item._id);
                ctrl.stepConfig.listGen.displayList.push(item);
            } else {
                NotificationFactory.warning('Duplicate!', 'Item has already been added to list.');
            }
        } else {
            NotificationFactory.error('Full!', 'Item list has reached the defined capacity.');
        }
        ctrl.stepConfig.listGen.toptenItem = '';
    }

    function removeItem(item) {
        //For display array.
        var index = ctrl.stepConfig.listGen.displayList.indexOf(item);
        ctrl.stepConfig.listGen.displayList.splice(index, 1);

        //For topten list.
        index = ctrl.topten[ctrl.topten.type + 'List'].indexOf(item._id);
        if (!ctrl.isCreate && index === -1) {
            index = ListService.findWithAttr(ctrl.topten[ctrl.topten.type+'List'], '_id', item._id);
        }
        ctrl.topten[ctrl.topten.type + 'List'].splice(index, 1);
        NotificationFactory.warning('Removed!', 'Item has been removed from list.');
    }

    function pushCondition(type, item) {
        var index, indexTwo;
        switch(type) {
            case 'series':
                index = ListService.findWithAttr(ctrl.topten.conditions.series, 'name', item.name);
                if(index === -1) {
                    ctrl.topten.conditions.series.push(item);
                } else {
                    NotificationFactory.warning('Duplicate!', 'Series has already been added to list.');
                }
                ctrl.stepConfig.listGen.seriesLimit = '';
                break;

            case 'tag':
                index = ListService.findWithAttr(ctrl.topten.conditions.tags, 'tag', item.tag);
                if(index === -1) {
                    ctrl.topten.conditions.tags.push(item);
                } else {
                    NotificationFactory.warning('Duplicate!', 'Tag has already been added to list.');
                }
                ctrl.stepConfig.listGen.tagLimit = '';
                break;
        }
    }

    function removeCondition(type, item) {
        var index, indexTwo;
        switch(type) {
            case 'series':
                index = ListService.findWithAttr(ctrl.topten.conditions.series, 'name', item.name);
								ctrl.topten.conditions.series.splice(index, 1);
                NotificationFactory.warning('Removed!', 'Series has been removed from list.');
                break;

            case 'tag':
                index = ctrl.topten.conditions.tags.indexOf(item);
                ctrl.topten.conditions.tags.splice(index, 1);
                NotificationFactory.warning('Removed!', 'Tag has been removed from list.');
                break;
        }
    }

    //Step related functions:
    function takeStep(number, direction) {
        process(number, direction, function() {
            ctrl.stepConfig.currentStep = (direction) ? number + 1 : number - 1;
        });
        // console.log('step: ', ctrl.stepConfig, ctrl.topten);
    }
    function cancel() {
        $location.path('toptens');
    }

    function inital() {
        // console.log('state params: ', $stateParams);
        if ($stateParams.toptenId !== undefined) {
            ctrl.isCreate = false;
            Toptens.get({ toptenId: $stateParams.toptenId }).$promise.then(function(result) {
                ctrl.topten = result;
								// console.log('topten: ', result);
                typeSetItemPopulate();
            });
        }
    }
    inital();

		function swappingItems(index) {
			// console.log('item selected: ', index);
			if(ctrl.stepConfig.swapping.one === '') {
				ctrl.stepConfig.swapping.one = index;
			} else if(ctrl.stepConfig.swapping.one === index) {
				ctrl.stepConfig.swapping.one = '';
			} else {
				ctrl.stepConfig.swapping.two = index;
				//Re-order display list.
				var temp = ctrl.stepConfig.listGen.displayList[ctrl.stepConfig.swapping.one];
				ctrl.stepConfig.listGen.displayList[ctrl.stepConfig.swapping.one] = ctrl.stepConfig.listGen.displayList[ctrl.stepConfig.swapping.two];
				ctrl.stepConfig.listGen.displayList[ctrl.stepConfig.swapping.two] = temp;
				//Re-order topten item list.
				temp = ctrl.topten[ctrl.topten.type + 'List'][ctrl.stepConfig.swapping.one];
				ctrl.topten[ctrl.topten.type + 'List'][ctrl.stepConfig.swapping.one] = ctrl.topten[ctrl.topten.type + 'List'][ctrl.stepConfig.swapping.two];
				ctrl.topten[ctrl.topten.type + 'List'][ctrl.stepConfig.swapping.two] = temp;
				//Clear.
				ctrl.stepConfig.swapping.one = '';
				ctrl.stepConfig.swapping.two = '';
			}
		}

	}
})();

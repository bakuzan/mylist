'use strict';

// Statistics controller
angular.module('statistics').controller('StatisticsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Animeitems', 'Mangaitems', 'Characters', 'Toptens', 'ListService', 'ItemService', 'CharacterService', 'StatisticsService', '$filter', 'spinnerService',
	function($scope, $stateParams, $location, Authentication, Animeitems, Mangaitems, Characters, Toptens, ListService, ItemService, CharacterService, StatisticsService, $filter, spinnerService) {
		var ctrl = this,
				filter = $filter('filter');
		ctrl.authentication = Authentication;
		ctrl.dataStore = { anime: [], manga: [], character: [], toptens: { anime: {}, manga: {}, character: {} } };

        $scope.view = 'Anime';
        $scope.detail = {
            isVisible: false,
            year: '',
            division: '',
            divisionText: '',
            history: 'months',
            summary: {
                type: '',
                isVisible: false
            },
            isEpisodeRatings: false
        };
        $scope.commonArrays = ListService.getCommonArrays('statistics');
        $scope.filterConfig = {
            show: {
                tag: false,
                series: false,
                voice: false
            },
            sort: {
								episodeRating: {
									type: 'title',
									reverse: false
								},
                tag: {
                    type: 'ratingWeighted',
                    reverse: true
                },
                tagDetail: {
                    type: 'count',
                    reverse: true
                },
                series: {
                    type: 'count',
                    reverse: true
                },
                voice: {
                    type: 'count',
                    reverse: true
                },
								topten: {
									type: 'count',
									reverse: true
								}
            },
            search: {
                tag: '',
                tagDetail: '',
                series: '',
                voice: '',
								topten: ''
            },
						topten: {
							isRanked: false,
							isFavourite: false
						}
        };
        $scope.overview = {}; //holds summary/overview details.
        $scope.gender = {}; //holds gender summary details.
        $scope.statTags = []; //for tag statistics;
        $scope.ratingsDistribution = []; //counts for each rating.
        $scope.statSeries = []; //for series statistics;
        $scope.voiceActors = []; //for voice actor list;
        $scope.historyDetails = {};
        $scope.areTagless = false; //are any items tagless
        $scope.taglessItem = false; //filter variable for showing tagless items.
        $scope.toptens = {
					type: 'anime',
					anime: { listCount: 0, items: [] }, manga:  { listCount: 0, items: [] }, character:  { listCount: 0, items: [] }, detail: { items: [] }
				 };
        $scope.colours = { red: '#c9302c', green: '#449d44', blue: '#31b0d5' }; //'red'; '#d9534f'; ////'green';'#5cb85c'; ////'blue';'#5bc0de'; //

				function getItemStatistics(view, items) {
					if(view === 'Anime' || view === 'Manga') {
						$scope.overview = ItemService.buildOverview(items);
						$scope.historyDetails.months = ItemService.completeByMonth(items);
						if (view === 'Anime') $scope.historyDetails.seasons = ItemService.completeBySeason(items);
						$scope.ratingValues = ItemService.getRatingValues(items);
						$scope.ratingsDistribution = ItemService.buildRatingsDistribution(items);
						$scope.statTags = ItemService.buildStatTags(items, $scope.ratingValues.averageRating);
					} else if (view === 'Character') {
						$scope.statTags = CharacterService.buildCharacterTags(items);
						$scope.statSeries = CharacterService.buildSeriesList(items);
						$scope.voiceActors = CharacterService.buildVoiceActors(items);
						CharacterService.buildGenderDistribution($scope.statTags, items.length).then(function(result) {
								$scope.gender = result;
								$scope.gender[0].colour = $scope.colours.red;
								$scope.gender[1].colour = $scope.colours.green;
								$scope.gender[2].colour = $scope.colours.blue;
						});
					} else if (view ==='Topten') {
						StatisticsService.buildToptenModeList(items, $scope.toptens.type).then(function(result) {
							$scope.toptens.detail.items = result.sort(function(a, b) {
								if(a.count < b.count) return 1;
								if(a.count > b.count) return -1;
																			return 0;
							});
						});
						console.log('topten stat process: ', items, $scope.toptens);
					}
				}

				//handle getting view items and setting view specific defaults.
        function getItems(view) {
            //reset defaults that are shared between views.
            $scope.detail.history = 'months';
            $scope.filterConfig.search.tag = '';
            $scope.detail.isVisible = false;
            $scope.detail.isEpisodeRatings = false;
            $scope.statTags = []; //clear to stop multiple views tags appearing.
            $scope.ratingsDistribution = [];
            if (view === 'Anime') {
                $scope.filterConfig.sort.tag.type = 'ratingWeighted'; //stat tag sort
								if (ctrl.dataStore.anime.length === 0) {
	                spinnerService.loading('items', Animeitems.query().$promise.then(function(result) {
										ctrl.dataStore.anime = result;
										$scope.items = result;
		                getItemStatistics(view, result);
									}));
								} else {
									$scope.items = ctrl.dataStore.anime;
									getItemStatistics(view, ctrl.dataStore.anime);
									console.log('from cache - anime');
								}
            } else if (view === 'Manga') {
                $scope.filterConfig.sort.tag.type = 'ratingWeighted'; //stat tag sort
								if (ctrl.dataStore.manga.length === 0) {
                	spinnerService.loading('items',	Mangaitems.query().$promise.then(function(result) {
										ctrl.dataStore.manga = result;
										$scope.items = result;
										getItemStatistics(view, result);
	              	}));
								} else {
									$scope.items = ctrl.dataStore.manga;
									getItemStatistics(view, ctrl.dataStore.manga);
									console.log('from cache - anime');
								}
            } else if (view === 'Character') {
                $scope.filterConfig.sort.tag.type = 'count'; //stat tag sort
								if (ctrl.dataStore.character.length === 0) {
									spinnerService.loading('character', Characters.query().$promise.then(function(result) {
										ctrl.dataStore.character = result;
										$scope.items = result;
										getItemStatistics(view, result);
	                }));
								} else {
									$scope.items = ctrl.dataStore.character;
									getItemStatistics(view, ctrl.dataStore.character);
									console.log('from cache - character');
								}
            } else if (view === 'Topten') {
							if (ctrl.dataStore.toptens.anime.totalListCount === undefined) {
	              spinnerService.loading('topten', Toptens.query().$promise.then(function(result) {
	                return ListService.groupItemsByProperties(result, ['type']);
	              }).then(function(result) {
									for(var i = 0, type = ''; i < 3; i++) {
										type = result[i][0].type;
										ctrl.dataStore.toptens[type].items = result[i];
										ctrl.dataStore.toptens[type].totalListCount = result[i].length;
									}
									return StatisticsService.buildToptenDataStructure($scope.toptens, result);
	              }).then(function(result) {
									$scope.toptens = result;
									getItemStatistics(view, result[$scope.toptens.type].items);
									console.log('topten arrays: ', $scope.toptens);
								}));
							} else {
								getItemStatistics(view, $scope.toptens[$scope.toptens.type].items);
								console.log('from cache - topten');
							}
            }
						console.log('dataStore check: ', ctrl.dataStore);
        }
        ctrl.find = function(view) {
            getItems(view);
        };
				ctrl.getToptenItemStatistics = function(view, toptenType) {
					console.log('get topten stats: ', toptenType);
					var filteredItems = ctrl.dataStore.toptens[toptenType].items;
					if($scope.filterConfig.topten.isRanked) filteredItems = filter(filteredItems, { isRanked: true });
					if($scope.filterConfig.topten.isFavourite) filteredItems = filter(filteredItems, { isFavourite: true });
					console.log('post filtering: ', filteredItems);
					if(filteredItems.length > 0) {
						$scope.toptens[toptenType].items = []; //clear items so you won't get repeats.
						StatisticsService.buildToptenDataStructure($scope.toptens, [filteredItems]).then(function(result) {
							$scope.toptens = result;
							console.log('topten data structure - result: ', result, $scope.toptens);
							getItemStatistics(view, result[toptenType].items);
						});
					} else {
						$scope.toptens[toptenType].listCount = 0;
						$scope.toptens.detail.items = filteredItems;
					}
				};

        //Builds ratings aggregates.
        function getSummaryFunctions(array) {
            //Check whether to do ratings or episode ratings.
            if (!$scope.detail.isEpisodeRatings) {
                spinnerService.loading('detail', StatisticsService.buildSummaryFunctions(array).then(function(result) {
                    $scope.historyDetails.summaryFunctions = result;
                }));
                if ($scope.detail.summary.isVisible === true) {
                    spinnerService.loading('detail',
                        StatisticsService.buildYearSummary(array, $scope.detail.year, $scope.detail.summary.type).then(function(result) {
                            $scope.historyDetails.yearSummary = result;
                        })
                    );
                }
            } else {
							if(array[0].meta.episodeSummaryFunctions === undefined) { //If the first item has it already, they all do and this is pointless.
                spinnerService.loading('detail', StatisticsService.buildEpisodeSummaries(array).then(function(result) {
                        console.log(array);
                }));
							}
            }
//            console.log(array, $scope.historyDetails);
        }
        $scope.$watchGroup(['detail.history', 'detail.year', 'detail.division', 'detail.isEpisodeRatings'], function(newValues, oldValues) {
            if (newValues !== undefined) {
                var filtered = $filter('statisticsDetailFilter')($scope.items, newValues[0], newValues[1], newValues[2]);
                getSummaryFunctions(filtered);
            }
        });

        ctrl.historyDetail = function(year, division, divisionText, summaryType) {
            if ($scope.detail.year === year && $scope.detail.divisionText === divisionText) {
                $scope.detail.isVisible = !$scope.detail.isVisible;
            } else {
                $scope.detail.isVisible = true;
                $scope.detail.year = year;
                $scope.detail.division = division;
                $scope.detail.divisionText = divisionText;
                $scope.detail.summary.type = summaryType;
                $scope.detail.summary.isVisible = (summaryType === undefined) ? false : true;
            }
        };

        ctrl.tableDetail = function(type, name) {
            if ($scope.tableDetail[type] === name) {
                $scope.filterConfig.search[type] = '';
                $scope.filterConfig.show[type] = false;
                $scope.tableDetail[type] = '';
                if (type === 'tag') $scope.tableDetail.isEqual = false;
            } else {
                $scope.filterConfig.search[type] = name;
                $scope.tableDetail[type] = name;
                $scope.filterConfig.show[type] = true;
                if (type === 'tag') {
                    $scope.tagDetailResult = CharacterService.buildRelatedCharacterTags($scope.items, name);
                    $scope.tableDetail.isEqual = true;
                }
            }
        };

        /** Using the start date of confirmed 'in-season' shows
         *  to populate the new season attrs. that will work with the new
         *  filters in the hopes accuracy and speed will increase.
         */
        ctrl.generateSeasons = function() {
            if ($scope.view === 'Anime') {
                var array = ItemService.setSeason($scope.items, $scope.detailSeasonYear, $scope.detailSeason);
                angular.forEach(array, function(item) {
                    item.$update(function() {
                        console.log(item);
                    }, function(errorResponse) {
                        $scope.error = errorResponse.data.message;
                    });
                });
            }
        };

    }
]);

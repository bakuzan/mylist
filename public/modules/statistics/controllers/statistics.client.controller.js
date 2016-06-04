(function() {
	'use strict';

	angular.module('statistics').controller('StatisticsController', StatisticsController);
	StatisticsController.$inject = ['$scope', '$stateParams', '$location', 'Authentication', 'Animeitems', 'Mangaitems', 'Characters', 'Toptens', 'ListService', 'ItemService', 'CharacterService', 'StatisticsService', '$filter', 'spinnerService'];

		function StatisticsController($scope, $stateParams, $location, Authentication, Animeitems, Mangaitems, Characters, Toptens, ListService, ItemService, CharacterService, StatisticsService, $filter, spinnerService) {
			var ctrl = this,
					filter = $filter('filter');
			ctrl.authentication = Authentication;
			ctrl.colours = { red: '#c9302c', green: '#449d44', blue: '#31b0d5' }; //'red'; '#d9534f'; ////'green';'#5cb85c'; ////'blue';'#5bc0de'; //
			ctrl.commonArrays = ListService.getCommonArrays('statistics');
			ctrl.dataStore = { anime: [], manga: [], character: [], toptens: { anime: {}, manga: {}, character: {} } };
			ctrl.detail = {
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
			ctrl.filterConfig = {
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
			ctrl.find = find;
			ctrl.gender = {}; //holds gender summary details.
			ctrl.generateSeasons = generateSeasons;
			ctrl.getFilteredItems = getFilteredItems;
			ctrl.getToptenItemStatistics = getToptenItemStatistics;
			ctrl.historyDetail = historyDetail;
      ctrl.historyDetails = {};
      ctrl.overview = {}; //holds summary/overview details.
      ctrl.ratingsDistribution = []; //counts for each rating.
      ctrl.statSeries = []; //for series statistics;
      ctrl.statTags = []; //for tag statistics;
			ctrl.tableDetail = tableDetail;
			ctrl.tableDetails = {};
      ctrl.taglessItem = false; //filter variable for showing tagless items.
      ctrl.toptens = {
				type: 'anime',
				anime: { listCount: 0, items: [] }, manga:  { listCount: 0, items: [] }, character:  { listCount: 0, items: [] }, detail: { items: [] }
			 };
      ctrl.view = 'Anime';
      ctrl.voiceActors = []; //for voice actor list;

			function getItemStatistics(view, items) {
				if(view === 'Anime' || view === 'Manga') {
					ctrl.overview = ItemService.buildOverview(items);
					ctrl.historyDetails.months = ItemService.completeByMonth(items);
					if (view === 'Anime') ctrl.historyDetails.seasons = ItemService.completeBySeason(items);
					ctrl.ratingValues = ItemService.getRatingValues(items);
					ctrl.ratingsDistribution = ItemService.buildRatingsDistribution(items);
					ctrl.statTags = ItemService.buildStatTags(items, ctrl.ratingValues.averageRating);
				} else if (view === 'Character') {
					ctrl.statTags = CharacterService.buildCharacterTags(items);
					ctrl.statSeries = CharacterService.buildSeriesList(items);
					ctrl.voiceActors = CharacterService.buildVoiceActors(items);
					CharacterService.buildGenderDistribution(ctrl.statTags, items.length).then(function(result) {
							ctrl.gender = result;
							ctrl.gender[0].colour = ctrl.colours.red;
							ctrl.gender[1].colour = ctrl.colours.green;
							ctrl.gender[2].colour = ctrl.colours.blue;
					});
				} else if (view ==='Topten') {
					StatisticsService.buildToptenModeList(items, ctrl.toptens.type).then(function(result) {
						ctrl.toptens.detail.items = result.sort(function(a, b) {
							if(a.count < b.count) return 1;
							if(a.count > b.count) return -1;
																		return 0;
						});
					});
					console.log('topten stat process: ', items, ctrl.toptens);
				}
			}

			//handle getting view items and setting view specific defaults.
      function getItems(view) {
          //reset defaults that are shared between views.
          ctrl.detail.history = 'months';
          ctrl.filterConfig.search.tag = '';
          ctrl.detail.isVisible = false;
          ctrl.detail.isEpisodeRatings = false;
          ctrl.statTags = []; //clear to stop multiple views tags appearing.
          ctrl.ratingsDistribution = [];
          if (view === 'Anime') {
              ctrl.filterConfig.sort.tag.type = 'ratingWeighted'; //stat tag sort
							if (ctrl.dataStore.anime.length === 0) {
                spinnerService.loading('items', Animeitems.query().$promise.then(function(result) {
									ctrl.dataStore.anime = result;
									ctrl.items = result;
	                getItemStatistics(view, result);
								}));
							} else {
								ctrl.items = ctrl.dataStore.anime;
								getItemStatistics(view, ctrl.dataStore.anime);
								console.log('from cache - anime');
							}
          } else if (view === 'Manga') {
              ctrl.filterConfig.sort.tag.type = 'ratingWeighted'; //stat tag sort
							if (ctrl.dataStore.manga.length === 0) {
              	spinnerService.loading('items',	Mangaitems.query().$promise.then(function(result) {
									ctrl.dataStore.manga = result;
									ctrl.items = result;
									getItemStatistics(view, result);
              	}));
							} else {
								ctrl.items = ctrl.dataStore.manga;
								getItemStatistics(view, ctrl.dataStore.manga);
								console.log('from cache - anime');
							}
          } else if (view === 'Character') {
              ctrl.filterConfig.sort.tag.type = 'count'; //stat tag sort
							if (ctrl.dataStore.character.length === 0) {
								spinnerService.loading('character', Characters.query().$promise.then(function(result) {
									ctrl.dataStore.character = result;
									ctrl.items = result;
									getItemStatistics(view, result);
                }));
							} else {
								ctrl.items = ctrl.dataStore.character;
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
								return StatisticsService.buildToptenDataStructure(ctrl.toptens, result);
              }).then(function(result) {
								ctrl.toptens = result;
								getItemStatistics(view, result[ctrl.toptens.type].items);
								console.log('topten arrays: ', ctrl.toptens);
							}));
						} else {
							getItemStatistics(view, ctrl.toptens[ctrl.toptens.type].items);
							console.log('from cache - topten');
						}
          }
					console.log('dataStore check: ', ctrl.dataStore);
      }
      function find(view) {
          getItems(view);
      }

			function getToptenItemStatistics(view, toptenType) {
				console.log('get topten stats: ', toptenType);
				var filteredItems = ctrl.dataStore.toptens[toptenType].items;
				if(ctrl.filterConfig.topten.isRanked) filteredItems = filter(filteredItems, { isRanked: true });
				if(ctrl.filterConfig.topten.isFavourite) filteredItems = filter(filteredItems, { isFavourite: true });
				console.log('post filtering: ', filteredItems);
				if(filteredItems.length > 0) {
					ctrl.toptens[toptenType].items = []; //clear items so you won't get repeats.
					StatisticsService.buildToptenDataStructure(ctrl.toptens, [filteredItems]).then(function(result) {
						ctrl.toptens = result;
						console.log('topten data structure - result: ', result, ctrl.toptens);
						getItemStatistics(view, result[toptenType].items);
					});
				} else {
					ctrl.toptens[toptenType].listCount = 0;
					ctrl.toptens.detail.items = filteredItems;
				}
			}

      //Builds ratings aggregates.
      function getSummaryFunctions(array) {
      	spinnerService.loading('detail', StatisticsService.buildSummaryFunctions(array).then(function(result) {
        	ctrl.historyDetails.summaryFunctions = result;
					console.log('got summary functions: ', ctrl.detail, ctrl.historyDetails);
        }));
        if (ctrl.detail.summary.isVisible === true) {
	        spinnerService.loading('detail',
	            StatisticsService.buildYearSummary(array, ctrl.detail.year, ctrl.detail.summary.type).then(function(result) {
	                ctrl.historyDetails.yearSummary = result;
									console.log('got year summary: ', ctrl.detail, ctrl.historyDetails);
	            })
	        );
        }
				if(ctrl.detail.isEpisodeRatings && array[0].meta.episodeSummaryFunctions === undefined) { //If the first item has it already, they all do and this is pointless.
          spinnerService.loading('detail', StatisticsService.buildEpisodeSummaries(array).then(function(result) {
                  console.log(array);
          }));
				}
//            console.log(array, $scope.historyDetails);
      }

      function historyDetail(year, division, divisionText, summaryType) {
	      ctrl.detail.isVisible = true;
	      ctrl.detail.year = year;
	      ctrl.detail.division = division;
	      ctrl.detail.divisionText = divisionText;
				ctrl.detail.summary.type = summaryType;
	      ctrl.detail.summary.isVisible = (summaryType === undefined) ? false : true;
				ctrl.getFilteredItems();
      }

      function tableDetail(type, name) {
          if (ctrl.tableDetails[type] === name) {
              ctrl.filterConfig.search[type] = '';
              ctrl.filterConfig.show[type] = false;
              ctrl.tableDetails[type] = '';
              if (type === 'tag') ctrl.tableDetails.isEqual = false;
          } else {
              ctrl.filterConfig.search[type] = name;
              ctrl.tableDetails[type] = name;
              ctrl.filterConfig.show[type] = true;
              if (type === 'tag') {
                  ctrl.tagDetailResult = CharacterService.buildRelatedCharacterTags(ctrl.items, name);
                  ctrl.tableDetails.isEqual = true;
              }
          }
      }

			function getFilteredItems(historyChange) {
				if(historyChange) {
					ctrl.detail.isVisible = false;
					ctrl.detail.summary.isVisible = false;
					if(ctrl.detail.history === 'months') ctrl.detail.isEpisodeRatings = false;
				}
				var filtered = $filter('statisticsDetailFilter')(ctrl.items, ctrl.detail.history, ctrl.detail.year, ctrl.detail.division);
				getSummaryFunctions(filtered);
			}

      /** Using the start date of confirmed 'in-season' shows
       *  to populate the new season attrs. that will work with the new
       *  filters in the hopes accuracy and speed will increase.
       */
      function generateSeasons() {
          if (ctrl.view === 'Anime') {
              var array = ItemService.setSeason(ctrl.items, ctrl.detailSeasonYear, ctrl.detailSeason);
              angular.forEach(array, function(item) {
                  item.$update(function() {
                      console.log(item);
                  }, function(errorResponse) {
                      ctrl.error = errorResponse.data.message;
                  });
              });
          }
      }
		}

})();

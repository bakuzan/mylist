'use strict';

// Statistics controller
angular.module('statistics').controller('StatisticsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Animeitems', 'Mangaitems', 'Characters', 'ListService', 'ItemService', 'CharacterService', 'StatisticsService', '$filter', 'spinnerService',
	function($scope, $stateParams, $location, Authentication, Animeitems, Mangaitems, Characters, ListService, ItemService, CharacterService, StatisticsService, $filter, spinnerService) {
		$scope.authentication = Authentication;
        
        // If user is not signed in then redirect back to signin.
		if (!$scope.authentication.user) $location.path('/signin');
        
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
            },
            search: {
                tag: '',
                tagDetail: '',
                series: '',
                voice: ''
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
        //handle getting view items and setting view specific defaults.
        function getItems(view) {
            if (view === 'Anime') {
                $scope.filterConfig.sort.tag.type = 'ratingWeighted'; //stat tag sort
                spinnerService.loading('items', Animeitems.query().$promise.then(function(result) {
                    $scope.items = result;
                }));
            } else if (view === 'Manga') {
                $scope.filterConfig.sort.tag.type = 'ratingWeighted'; //stat tag sort
                spinnerService.loading('items', Mangaitems.query().$promise.then(function(result) {
                    $scope.items = result;
                }));
            } else if (view === 'Character') {
                $scope.filterConfig.sort.tag.type = 'count'; //stat tag sort
                spinnerService.loading('character', Characters.query().$promise.then(function(result) {
                    $scope.items = result;
                }));
            }
        }
        $scope.find = function(view) {
            getItems(view);
        };
        //required for ctrl+v clicks.
        $scope.$watch('view', function(newValue) {
            if ($scope.view !== undefined) {
                getItems(newValue);
                //reset defaults that are shared between views.
                $scope.detail.history = 'months';
                $scope.filterConfig.search.tag = '';
                $scope.detail.isVisible = false;
                $scope.statTags = [];
                $scope.ratingsDistribution = [];
            }
        });
        //watch for items changes...occurs on view change.
        $scope.$watchCollection('items', function() {
            if ($scope.items !== undefined) {
                $scope.statTags = []; //clear to stop multiple views tags appearing.
                if ($scope.view !== 'Character') {
                    $scope.overview = ItemService.buildOverview($scope.items);
                    $scope.historyDetails.months = ItemService.completeByMonth($scope.items);
                    if ($scope.view === 'Anime') { 
                        $scope.historyDetails.seasons = ItemService.completeBySeason($scope.items);
                    }
                    $scope.ratingValues = ItemService.getRatingValues($scope.items);
                    $scope.ratingsDistribution = ItemService.buildRatingsDistribution($scope.items);
                    $scope.statTags = ItemService.buildStatTags($scope.items, $scope.ratingValues.averageRating);
                } else if ($scope.view === 'Character') {
                    $scope.statTags = CharacterService.buildCharacterTags($scope.items);
                    $scope.statSeries = CharacterService.buildSeriesList($scope.items);
                    $scope.voiceActors = CharacterService.buildVoiceActors($scope.items);
                    CharacterService.buildGenderDistribution($scope.statTags, $scope.items.length).then(function(result) {
                        $scope.gender = result;
                        $scope.gender[0].colour = '#c9302c'; //'red'; '#d9534f'; //
                        $scope.gender[1].colour = '#449d44'; //'green';'#5cb85c'; //
                        $scope.gender[2].colour = '#31b0d5'; //'blue';'#5bc0de'; //
                    });
                }
            }
        });
        
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
                spinnerService.loading('detail', StatisticsService.buildEpisodeSummaries(array).then(function(result) {
                        console.log(array);
                }));
            }
//            console.log(array, $scope.historyDetails);
        }
        $scope.$watchGroup(['detail.history', 'detail.year', 'detail.division'], function(newValues) {
            if (newValues !== undefined) {
                var filtered = $filter('statisticsDetailFilter')($scope.items, newValues[0], newValues[1], newValues[2]);
                getSummaryFunctions(filtered);
            }
        });
        
        $scope.toggleEpisodeRatings = function(items) {
            getSummaryFunctions(items);
        };
        
        $scope.historyDetail = function(year, division, divisionText, summaryType) {
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
        
        $scope.tableDetail = function(type, name) {
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
        $scope.generateSeasons = function() {
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
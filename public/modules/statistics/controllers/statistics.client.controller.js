'use strict';

// Statistics controller
angular.module('statistics').controller('StatisticsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Animeitems', 'Mangaitems', 'Characters', 'ListService', 'ItemService', 'CharacterService',
	function($scope, $stateParams, $location, Authentication, Animeitems, Mangaitems, Characters, ListService, ItemService, CharacterService) {
		$scope.authentication = Authentication;
        
        // If user is not signed in then redirect back to signin.
		if (!$scope.authentication.user) $location.path('/signin');
        
        $scope.view = 'Anime';
        $scope.historicalView = 'month'; //default historical view in stats.
        $scope.maxCount = 0; //number of items.
        $scope.maxRatedCount = 0; //number of items with a rating i.e not 0.
        $scope.averageRating = 0; //average rating for items.
        $scope.maxCompleteMonth = 0; //used to find the max number of ends in 1 month.
        $scope.maxCompleteSeason = 0;
        var commonArrays = ListService.getCommonArrays('statistics');
        $scope.months = commonArrays.months;
        $scope.seasons = commonArrays.seasons;
        $scope.showDetail = false; //show month detail.
        $scope.statTagSortType = 'ratingWeighted'; //stat tag sort
        $scope.statTagSortReverse = true; //stat tag sort direction.
        $scope.statTagDetailSortType = 'count'; //stat tag detail sort
        $scope.statTagDetailSortReverse = true; //stat tag detail sort direction.
        $scope.statSeriesSortType = 'count'; //stat series sort
        $scope.statSeriesSortReverse = true; //stat series sort direction.
        $scope.statVoiceSortType = 'count'; //stat voice sort
        $scope.statVoiceSortReverse = true; //stat voice sort direction.
        $scope.overview = {}; //holds summary/overview details.
        $scope.gender = {}; //holds gender summary details.
        $scope.statTags = []; //for tag statistics;
        $scope.showTagDetail = false; //visibility of detail for tags.
        $scope.ratingsDistribution = []; //counts for each rating.
        $scope.statSearch = ''; //filter value for tag detail.
        $scope.statSeries = []; //for series statistics;
        $scope.voiceActors = []; //for voice actor list;
        $scope.showSeriesDetail = false; //visibility of series drilldown.
        $scope.seriesSearch = ''; //for filtering series values.
        $scope.voiceSearch = ''; //for filtering voice values.
        $scope.areTagless = false; //are any items tagless
        $scope.taglessItem = false; //filter variable for showing tagless items.
        $scope.male = 0; //gender count for pb.
        $scope.female = 0; //gender count for pb.
        $scope.nosex = 0; //no gender count for pb.
        $scope.isLoading = true;
        $scope.loading = function(value) {
            $scope.isLoading = ListService.loader(value);
        };
        //handle getting view items and setting view specific defaults.
        function getItems(view) {
            if (view === 'Anime') {
                $scope.statTagSortType = 'ratingWeighted'; //stat tag sort
                $scope.items = Animeitems.query();
            } else if (view === 'Manga') {
                $scope.statTagSortType = 'ratingWeighted'; //stat tag sort
                $scope.items = Mangaitems.query();
            } else if (view === 'Character') {
                $scope.statTagSortType = 'count'; //stat tag sort
                $scope.items = Characters.query();
            }
        }
        $scope.find = function(view) {
            getItems(view);
        };
        //required for ctrl+v clicks.
        $scope.$watch('view', function(newValue) {
            if ($scope.view !== undefined) {
                $scope.isLoading = true;
                getItems(newValue);
                //reset defaults that are shared between views.
                $scope.historicalView = 'month';
                $scope.statSearch = '';
                $scope.showDetail = false;
                $scope.statTags = [];
                $scope.ratingsDistribution = [];
            }
        });
        //watch for items changes...occurs on view change.
        $scope.$watchCollection('items', function() {
            if ($scope.view !== 'Character') {
                if ($scope.items!==undefined) {
                    $scope.statTags = []; //clear to stop multiple views tags appearing.
                    $scope.overview = ItemService.buildOverview($scope.items);
                    $scope.maxCompleteMonth = ItemService.maxCompleteMonth($scope.items);
                    $scope.completeByMonth = ItemService.completeByMonth($scope.items);
                    if ($scope.view === 'Anime') { 
                        var seasonDetails = ItemService.completeBySeason($scope.items);
                        $scope.completeBySeason = seasonDetails.completeBySeason;
                        $scope.maxCompleteSeason = seasonDetails.maxCompleteSeason;
                    }
                    $scope.maxCount = $scope.items.length;
                    var ratingValues = ItemService.getRatingValues($scope.items);
                    $scope.maxRatedCount = ratingValues.maxRatedCount;
                    $scope.averageRating = ratingValues.averageRating;
                    $scope.ratingsDistribution = ItemService.buildRatingsDistribution($scope.items, $scope.maxCount);
                    $scope.statTags = ItemService.buildStatTags($scope.items, $scope.averageRating);
                }
            } else if ($scope.view === 'Character') {
                if ($scope.items!==undefined) {
                    $scope.statTags = []; //clear previous views tags.
                    $scope.maxCount = $scope.items.length;
                    $scope.statTags = CharacterService.buildCharacterTags($scope.items);
                    $scope.statSeries = CharacterService.buildSeriesList($scope.items);
                    $scope.voiceActors = CharacterService.buildVoiceActors($scope.items);
                    $scope.gender = CharacterService.buildGenderDistribution($scope.statTags, $scope.maxCount);
                }
            }
        });
        //show season detail.
        $scope.seasonDetail = function(year, month, monthText) {
//            console.log(year+'-'+month, monthText);
            //if the one already selected is clicked, hide the detail.
            if ($scope.detailSeasonYear===year && $scope.detailSeason===month) {
                $scope.showSeasonDetail = !$scope.showSeasonDetail;
                $scope.showDetail = false;
            } else {
                $scope.detailSeasonYear = year;
                $scope.detailSeason = month;
                $scope.detailSeasonName = monthText;
                $scope.showSeasonDetail = true;
                $scope.showDetail = false;
            }
        };
        //show month detail.
        $scope.monthDetail = function(year, month, monthText) {
//            console.log(year+'-'+month, monthText);
            //if the one already selected is clicked, hide the detail.
            if ($scope.detailYear===year && $scope.detailMonth===month) {
                $scope.showDetail = !$scope.showDetail;
                $scope.showSeasonDetail = false;
            } else {
                $scope.detailYear = year;
                $scope.detailMonth = month;
                $scope.detailMonthName = monthText;
                $scope.showDetail = true;
                $scope.showSeasonDetail = false;
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
                $scope.tagDetailResult = CharacterService.buildRelatedCharacterTags($scope.items, name);
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
        //show voice actor detail
        $scope.voiceDetail = function(name) {
            if ($scope.detailVoiceName === name) {
                $scope.voiceSearch = '';
                $scope.showVoiceDetail = false;
                $scope.detailVoiceName = '';
            } else {
                $scope.voiceSearch = name;
                $scope.detailVoiceName = name;
                $scope.showVoiceDetail = true;
            }
        };
        
    }
]);
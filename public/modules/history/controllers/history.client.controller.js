'use strict';

// History controller
angular.module('history').controller('HistoryController', ['$scope', '$stateParams', '$location', 'Authentication', 'AnimeHistory', 'MangaHistory', 'HistoryService', 'ListService', 'spinnerService',
	function($scope, $stateParams, $location, Authentication, AnimeHistory, MangaHistory, HistoryService, ListService, spinnerService) {
		$scope.authentication = Authentication;
        
        // If user is not signed in then redirect back to signin.
		if (!$scope.authentication.user) $location.path('/signin');
        
        $scope.view = 'Anime';
        $scope.filterConfig = {
            historyFilter: 'Today'
        };
        $scope.isLoading = true;
        $scope.historyGroups = [
            { name: 'Today' },
            { name: 'Yesterday' },
            { name: 'This week' },
            { name: 'Last week' },
            { name: 'Two weeks ago' },
            { name: 'Three weeks ago' },
            { name: 'Four weeks ago' },
        ];
        var latestDate = new Date().setDate(new Date().getDate() - 29);
        
        function getAnimeitems() {
             // Find list of mangaitems.
            $scope.animeitems = AnimeHistory.query({
                latest: latestDate
            });
        }
        
        function getMangaitems() {
             // Find list of mangaitems.
            $scope.mangaitems = MangaHistory.query({
                latest: latestDate
            });
        }
        
        $scope.buildHistory = function() {
            spinnerService.show('history');
            getAnimeitems();
            getMangaitems();
        };
        //Needed to catch 'Character' setting and skip it.
        $scope.$watch('view', function(newValue) {
            if ($scope.view !== undefined) {
                if (newValue !== 'Anime' && newValue !== 'Manga') {
                    $scope.view = 'Anime';
                }
            }
        });
        
        $scope.$watchCollection('animeitems', function() {
            if ($scope.animeitems!==undefined) {
                HistoryService.buildHistoryList($scope.animeitems).then(function(result) {
//                    console.log('build anime history: ', result);
                    $scope.animeHistory = result;
                });
            }
        });
        
        $scope.$watchCollection('mangaitems', function() {
            if ($scope.mangaitems!==undefined) {
                HistoryService.buildHistoryList($scope.mangaitems).then(function(result) {
//                    console.log('build manga history: ', result);
                    $scope.mangaHistory = result;
                });
            }
        });
        
        $scope.loading = function(value) {
            $scope.isLoading = ListService.loader(value);
        };
        
        $scope.happenedWhen = function(when) {
            return HistoryService.happenedWhen(when);
        };
        
    }
]);
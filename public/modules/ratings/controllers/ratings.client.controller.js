'use strict';

// History controller
angular.module('ratings').controller('RatingsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Animeitems', 'Mangaitems', 'ListService',
	function($scope, $stateParams, $location, Authentication, Animeitems, Mangaitems, ListService) {
		$scope.authentication = Authentication;
        
        // If user is not signed in then redirect back to signin.
		if (!$scope.authentication.user) $location.path('/signin');
        
        $scope.view = 'Anime';
        $scope.sortType = 'rating';
        $scope.sortReverse = true;
        //rating 'tooltip' function
        $scope.maxRating = 10;
        $scope.hoveringOver = function(value) {
            $scope.overStar = value;
            $scope.percent = 100 * (value / $scope.maxRating);
        };
        $scope.isLoading = true;
        $scope.loading = function(value) {
            $scope.isLoading = ListService.loader(value);
        };
        
        function getItems(view) {
            if (view === 'Anime') {
                $scope.items = Animeitems.query();
            } else if (view === 'Manga') {
                $scope.items = Mangaitems.query();
            }
            console.log(view, $scope.items);
        }
        $scope.find = function(view) {
            getItems(view);
        };
        //Needed to catch 'Character' setting and skip it.
        $scope.$watch('view', function(newValue) {
            if ($scope.view !== undefined) {
                if (newValue !== 'Anime' && newValue !== 'Manga') {
                    $scope.view = 'Anime';
                } else {
                    getItems($scope.view);
                }
            }
        });
        
        
    }
]);



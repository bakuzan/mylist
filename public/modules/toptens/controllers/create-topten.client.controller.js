'use strict';

// Toptens controller
angular.module('toptens').controller('CreateToptenController', ['$scope', '$stateParams', '$location', 'Authentication', 'Toptens', 'ListService', 'Animeitems', 'Mangaitems', 'Characters', 'NotificationFactory',
	function($scope, $stateParams, $location, Authentication, Toptens, ListService, Animeitems, Mangaitems, Characters, NotificationFactory) {
		$scope.authentication = Authentication;
        
        $scope.stepConfig = {
            steps: [1,2,3,4,5,6,7,8,9,10],
            stepHeaders: [
                { text: 'Select attributes' },
                { text: 'Populate list' }
            ],
            currentStep: 1,
            stepCount: 2,
            listGen: {
                items: [],
                typeDisplay: '',
                toptenItem: ''
            }
        };
        var toptenCopy = {
            name: '',
            description: '',
            type: '',
            isFavourite: false,
            animeList: [],
            mangaList: [],
            characterList: []
        };
        $scope.topten = {};
        angular.copy(toptenCopy, $scope.topten);
        $scope.commonArrays = ListService.getCommonArrays();

		// Create new Topten
		$scope.create = function() {
            console.log($scope.topten, this.topten);
			// Create new Topten object
			var topten = new Toptens ({
				name: $scope.topten.name,
                description: $scope.topten.description,
                type: $scope.topten.type,
                isFavourite: $scope.topten.isFavourite,
                animeList: $scope.topten.animeList,
                characterList: $scope.topten.characterList,
                mangaList: $scope.topten.mangaList
			});

			// Redirect after save
			topten.$save(function(response) {
				$location.path('toptens/');

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};
        
        //Processing on step submits.
        function process(number, direction) {
            switch(number) {
                case 1: 
                    var type = ListService.manipulateString($scope.topten.type, 'upper', true);
                    switch(type) {
                        case 'Anime':
                            $scope.stepConfig.listGen.items = Animeitems.query();
                            $scope.stepConfig.listGen.typeDisplay = 'title';
                            break;
                        case 'Manga':
                            $scope.stepConfig.listGen.items = Mangaitems.query();
                            $scope.stepConfig.listGen.typeDisplay = 'title';
                            break;
                        case 'Character':
                            $scope.stepConfig.listGen.items = Characters.query();
                            $scope.stepConfig.listGen.typeDisplay = 'name';
                            break;
                    }
                    break;
            }
        }
        
        $scope.pushItem = function(item) {
            console.log(item, $scope.topten);
            var index = ListService.findWithAttr($scope.topten[$scope.topten.type + 'List'], $scope.stepConfig.listGen.typeDisplay, item[$scope.stepConfig.listGen.typeDisplay]);
            if (index === -1) {
                $scope.topten[$scope.topten.type + 'List'].push(item);
            } else {
                NotificationFactory.warning('Duplicate!', 'Item has already been added to list.');
            }
            $scope.stepConfig.listGen.toptenItem = '';
        };
        
        //Step related functions:
        $scope.takeStep = function(number, direction) {
            $scope.stepConfig.currentStep = (direction) ? number + 1 : number - 1;
            process(number, direction);
            console.log($scope.stepConfig, $scope.topten);
        };
        $scope.cancel = function() {
            $location.path('toptens');
        };

	}
]);
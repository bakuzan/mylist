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
                displayList: [],
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
        $scope.isCreate = true;
        $scope.imgSize = {
            height: '50px',
            width: '100px'
        };
        
        $scope.saveChanges = function() {
            if ($scope.isCreate) create();
            if (!$scope.isCreate) update();
        };

		// Create new Topten
		function create() {
            console.log($scope.topten, this.topten);
			// Create new Topten object
            var topten = new Toptens();
			topten = new Toptens ({
				name: this.topten.name,
                description: this.topten.description,
                type: this.topten.type,
                isFavourite: this.topten.isFavourite,
                animeList: this.topten.animeList.length > 0 ? this.topten.animeList : null,
                characterList: this.topten.characterList.length > 0 ? this.topten.characterList : null,
                mangaList: this.topten.mangaList.length > 0 ? this.topten.mangaList : null
			});
//            topten = $scope.topten;

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
		function update() {
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
            console.log('type set: ', $scope.stepConfig.listGen.items, $scope.stepConfig.listGen.typeDisplay);
        }
        
        //Processing on step submits.
        function process(number, direction, callback) {
            switch(number) {
                case 1: 
                    if ($scope.topten.type !== '' && $scope.isCreate) {
                        typeSetItemPopulate();
                        callback();
                    } else if ($scope.topten.type !== '' && !$scope.isCreate) {
                        angular.forEach($scope.topten[$scope.topten.type + 'List'], function(item) {
                            item = item._id;
                            console.log(item);
                            var index = ListService.findWithAttr($scope.stepConfig.listGen.items, '_id', item);
                            $scope.stepConfig.listGen.displayList.push($scope.stepConfig.listGen.items[index]);
                        });
                        callback();
                    } else if ($scope.topten.type === '') {
                        NotificationFactory.popup('Invalid form', 'You MUST select a type to continue.', 'error');
                    }
                    break;
                    
                case 2:
                    callback();
                    break;
            }
        }
        
        $scope.pushItem = function(item) {
            console.log('push: ', item, $scope.topten);
            var index = $scope.topten[$scope.topten.type+'List'].indexOf(item._id);
            console.log('push index? ', index);
            if (index === -1) {
                $scope.topten[$scope.topten.type + 'List'].push(item._id);
                $scope.stepConfig.listGen.displayList.push(item);
            } else {
                NotificationFactory.warning('Duplicate!', 'Item has already been added to list.');
            }
            $scope.stepConfig.listGen.toptenItem = '';
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
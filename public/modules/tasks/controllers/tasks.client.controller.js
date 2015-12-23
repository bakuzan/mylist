'use strict';

// Tasks controller
angular.module('tasks').controller('TasksController', ['$scope', '$stateParams', '$location', 'Authentication', 'Tasks', 'ListService', 'NotificationFactory',
	function($scope, $stateParams, $location, Authentication, Tasks, ListService, NotificationFactory) {
		$scope.authentication = Authentication;
        
        // If user is not signed in then redirect back to signin.
		if (!$scope.authentication.user) $location.path('/signin');
        
        $scope.whichController = 'task';
        $scope.isLoading = true;
        //paging variables.
        $scope.pageConfig = {
            currentPage: 0,
            pageSize: 10
        };
        $scope.filterConfig = {
            showingCount: 0,
            sortType: '',
            sortReverse: true,
            search: {},
        };
        
        $scope.loading = function(value) {
            $scope.isLoading = ListService.loader(value);
        };

		// Create new Task
		$scope.create = function() {
			// Create new Task object
			var task = new Tasks ({
				description: this.description,
                link: {
                    linked: this.linked,
                    type: this.linkType,
                    id: this.linkItem
                },
                day: this.day,
                repeat: this.repeat,
                completeTimes: this.completeTimes,
                updateCheck: this.updateCheck,
                complete: false,
                category: this.category,
                daily: this.daily,
                dailyRefresh: new Date(),
                checklist: this.checklist,
                checklistItems: this.checklistArray
			});

			// Redirect after save
			task.$save(function(response) {
				$location.path('tasks/' + response._id);
                NotificationFactory.success('Saved!', 'New Task was successfully saved!');
				// Clear form fields?
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Task
		$scope.remove = function(task) {
            NotificationFactory.confirmation(function() {
                if ( task ) { 
                    task.$remove();

                    for (var i in $scope.tasks) {
                        if ($scope.tasks [i] === task) {
                            $scope.tasks.splice(i, 1);
                        }
                    }
                } else {
                    $scope.task.$remove(function() {
                        $location.path('tasks');
                    });
                }
                NotificationFactory.warning('Deleted!', 'Task was successfully deleted.');
            });
		};

		// Update existing Task
		$scope.update = function() {
			var task = $scope.task;

			task.$update(function() {
				$location.path('tasks/' + task._id);
                NotificationFactory.success('Saved!', 'Task was successfully saved!');
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Tasks
		$scope.find = function() {
			$scope.tasks = Tasks.query();
		};

		// Find existing Task
		$scope.findOne = function() {
			$scope.task = Tasks.get({ 
				taskId: $stateParams.taskId
			});
		};
	}
]);
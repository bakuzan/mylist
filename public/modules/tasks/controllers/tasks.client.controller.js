'use strict';

// Tasks controller
angular.module('tasks').controller('TasksController', ['$scope', '$stateParams', '$location', 'Authentication', 'Tasks', 'ListService', 'NotificationFactory', 'DiscoveryFactory',
	function($scope, $stateParams, $location, Authentication, Tasks, ListService, NotificationFactory, DiscoveryFactory) {
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
            search: { day: '' }
        };
        $scope.commonArrays = ListService.getCommonArrays();
        
        $scope.loading = function(value) {
            $scope.isLoading = ListService.loader(value);
        };
        
        $scope.tabFilter = function(tabName) {
            $scope.filterConfig.search.day = tabName;
        };
        
        $scope.weekBeginning = function() {
            return DiscoveryFactory.getWeekBeginning();
        };

		// Create new Task
		$scope.create = function() {
			// Create new Task object
			var task = new Tasks ({
				description: this.newTask.description,
                link: {
                    linked: this.newTask.linked,
                    type: this.newTask.linkType,
                    id: this.newTask.linkItem
                },
                day: this.newTask.day,
                repeat: this.newTask.repeat,
                completeTimes: this.newTask.completeTimes,
                updateCheck: this.newTask.updateCheck,
                complete: false,
                category: this.newTask.category,
                daily: this.newTask.daily,
                dailyRefresh: new Date(),
                checklist: this.newTask.checklist,
                checklistItems: this.newTask.checklistArray
			});
            console.log($scope.newTask, task, this.newTask);
			// Redirect after save
			task.$save(function(response) {
				$location.path('tasks/');
                NotificationFactory.success('Saved!', 'New Task was successfully saved!');
				// Clear form fields?
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
                NotificationFactory.error('Error!', 'New Task failed to save!');
			});
		};
        
        function remove(task) {
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
        }

		// Remove existing Task
		$scope.deleteTask = function(task) {
            NotificationFactory.confirmation(remove(task));
		};

		// Update existing Task
		function update() {
            console.log('update');
			var task = $scope.task;

			task.$update(function() {
				$location.path('tasks');
                NotificationFactory.success('Saved!', 'Task was successfully updated!');
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
                NotificationFactory.error('Error!', 'Task failed to save!');
			});
		}
        
        //Tick off a task.
        $scope.tickOff = function(task) {
            task.completeTimes += 1;
            $scope.task = task;
            update();
        };
        
        //Tick of a checklist item.
        $scope.tickOffChecklist = function(task) {
            //update the option for the task.
            var length = task.checklistItems.length,
                completeCount = 0;
            angular.forEach(task.checklistItems, function (item) {
                if (item.complete === true) {
                    completeCount += 1;
                }
            });
            //if all options complete, complete the task.
            if (length === completeCount) {
                task.completeTimes += 1;
                task.complete = true;
            }
            $scope.task = task;
            update();                                           
        };
        
        //Add new checklist item.
        $scope.insertChecklistItem = function (task, newChecklistItem) {
            if (newChecklistItem!=='' && newChecklistItem!==undefined) {
                var alreadyAdded = false;
                //find the item and insert the option.
                angular.forEach(task.checklistItems, function (item) {
                    if (item === newChecklistItem) {
                        alreadyAdded = true;
                    }
                });
                
                //if not in array add it.
                if (alreadyAdded === false) {
                    task.checklistItems.push({ text: newChecklistItem, complete: false });
                } else if (alreadyAdded === true) {
                    NotificationFactory.popup('Option already exists.', 'Please re-name and try again.', 'error');
                }
            }
            $scope.task = task;
            update();
        };
         
         //check things
        function checkStatus() {
            var today = new Date(),
                day = today.getDay();
            if (day === 1) {
                console.log('monday', day);
                angular.forEach($scope.tasks, function (task) {
                    //has it been updated today?
                    if(task.updateCheck === false) {
                        console.log('update', task.description);
                        //has it reached the necessary number of repeats?
                        if(task.completeTimes !== task.repeat) {
                            console.log('not complete', task.description);
                            task.complete = false;
                            task.updateCheck = true;
                            $scope.task = task;
                            update();
                        } else if (task.completeTimes === task.repeat) {
                            console.log('complete - delete', task.description);
                            remove(task);
                        }
                    }
                });
            } else {
                console.log('not monday', day);
                angular.forEach($scope.tasks, function (task) {
                    var change = task.updateCheck === false ? false : true;
                    task.updateCheck = false;
                    //is it a daily task?
                    if (task.daily === true) {
                        console.log('daily', task.description);
                        //has it reached the necessary number of repeats?
                        if(task.completeTimes !== task.repeat) {
                            console.log('not complete', task.description);
                            var refresh = today.toISOString().slice(0,10);
                            //has it been refreshed today?
                            if (task.dailyRefresh.slice(0,10) !== refresh) {
                                console.log('not complete - update', task.description);
                                task.complete = false;
                                task.dailyRefresh = refresh;
                                $scope.task = task;
                                update();
                            }
                        } else if (task.completeTimes === task.repeat) {
                            console.log('complete - delete', task.description);
                            remove(task);
                        }
                    } else if (task.daily === false && change) {
                        $scope.task = task;
                        update();
                    }
                });
            }
        }

		// Find a list of Tasks
		function find() {
			Tasks.query(function(result) {
                $scope.tasks = result;
                checkStatus();
            });
		}
        find();
        
        $scope.$watchCollection('tasks', function(newValue) {
            if ($scope.tasks !== undefined) {
                console.log(newValue, new Date().toISOString());
            }
        });

		// Find existing Task
		$scope.findOne = function() {
			$scope.task = Tasks.get({ 
				taskId: $stateParams.taskId
			});
		};

	}
]);
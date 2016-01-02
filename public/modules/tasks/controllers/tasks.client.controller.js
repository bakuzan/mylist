'use strict';

// Tasks controller
angular.module('tasks').controller('TasksController', ['$scope', '$stateParams', '$location', 'Authentication', 'Tasks', 'ListService', 'NotificationFactory', 'TaskFactory',
	function($scope, $stateParams, $location, Authentication, Tasks, ListService, NotificationFactory, TaskFactory) {
		$scope.authentication = Authentication;
        
        // If user is not signed in then redirect back to signin.
		if (!$scope.authentication.user) $location.path('/signin');
        
        $scope.whichController = 'task';
        $scope.isLoading = false;
        //paging variables.
        $scope.pageConfig = {
            currentPage: 0,
            pageSize: 10
        };
        $scope.filterConfig = {
            showingCount: 0,
            sortType: '',
            sortReverse: true,
            search: {
                description: '',
                day: ''
            },
            datesSelected: false
        };
        $scope.commonArrays = ListService.getCommonArrays();
        
        $scope.loading = function(value) {
            $scope.isLoading = ListService.loader(value);
        };
        
        $scope.tabFilter = function(tabName) {
            $scope.filterConfig.search.day = tabName;
        };
        
        $scope.weekBeginning = function() {
            return TaskFactory.getWeekBeginning();
        };
        
        function setNewTask() {
            $scope.newTask = {
                description: '',
                link: {
                    linked: false,
                    type: '',
                    anime: undefined,
                    manga: undefined
                },
                day: '',
                date: '',
                repeat: 0,
                category: '',
                daily: false,
                checklist: false,
                checklistItems: [],
                isAddTask: false
            };
        }
        setNewTask();
        
		// Create new Task
		$scope.create = function() {
			// Create new Task object
			var task = new Tasks ({
				description: this.newTask.description,
                link: {
                    linked: this.newTask.link.linked,
                    type: (this.newTask.link.linked === false) ? ''      : 
                          (this.newTask.category === 'Watch')  ? 'anime' : 
                                                                 'manga' ,
                    anime: (this.newTask.link.anime === undefined) ? undefined : this.newTask.link.anime._id ,
                    manga: (this.newTask.link.manga === undefined) ? undefined : this.newTask.link.manga._id 
                },
                day: this.newTask.daily === true ? 'Any' : this.newTask.day,
                date: this.newTask.date === '' ? new Date() : this.newTask.date,
                repeat: (this.newTask.link.linked === false) ? this.newTask.repeat                     : 
                        (this.newTask.category === 'Watch')  ? this.newTask.link.anime.finalEpisode    :
                                                               this.newTask.link.manga.finalChapter    ,
                completeTimes: (this.newTask.link.linked === false) ? 0                                     :
                               (this.newTask.category === 'Watch')  ? this.newTask.link.anime.episodes      :
                                                                      this.newTask.link.manga.chapters      ,
                updateCheck: new Date().getDay() === 1 ? true : false,
                complete: false,
                category: this.newTask.category === '' ? 'Other' : this.newTask.category,
                daily: this.newTask.checklist === true ? false   : this.newTask.daily,
                checklist: this.newTask.checklist,
                checklistItems: this.newTask.checklistItems
			});
//            console.log(task, this.newTask);
//			// Redirect after save
			task.$save(function(response) {
				$location.path('tasks');
                NotificationFactory.success('Saved!', 'New Task was successfully saved!');
                find();
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
                console.log(errorResponse);
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
            NotificationFactory.confirmation(function() { 
                remove(task);
            });
		};

		// Update existing Task
		function update() {
            console.log('update');
			var task = $scope.task;
            if (task.link.anime) {
                task.link.anime = task.link.anime._id;
            } else if (task.link.manga) {
                task.link.manga = task.link.manga._id;
            }
            
			task.$update(function() {
				$location.path('tasks');
                NotificationFactory.success('Saved!', 'Task was successfully updated!');
                find();
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
                console.log(errorResponse);
                NotificationFactory.error('Error!', 'Task failed to save!');
			});
		}
        
        //Tick off a task.
        $scope.tickOff = function(task) {
            //Is it linked?
            if (task.link.linked === false) {
                task.completeTimes += 1;
            } else if (task.link.linked === true) {
                /** Anime or manga?
                 *   Update the item value AND the complete/repeat values.
                 */
                if (task.link.type === 'anime') {
                    task.completeTimes = task.link.anime.episodes + 1;
                    task.repeat = task.link.anime.finalEpisode;
                    TaskFactory.updateAnimeitem(task);
                } else if (task.link.type === 'manga') {
                    task.completeTimes = task.link.manga.chapters + 1;
                    task.repeat = task.link.manga.finalChapter;
                    TaskFactory.updateMangaitem(task);
                }
            }
            $scope.task = task;
            console.log($scope.task);
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
                        console.log('updating - ', task.description);
                        if (task.link.linked === false) {
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
                        } else if (task.link.linked === true) {
                            console.log('linked');
                            var type = task.link.type,
                                parts = (type === 'anime') ? { single: 'episodes', all: 'finalEpisode' } :
                                                             { single: 'chapters', all: 'finalChapter' } ; 
                            if (task.link[type][parts.single] !== task.link[type][parts.all]) {
                                console.log('linked not complete', task.description);
                                task.complete = false;
                                task.updateCheck = true;
                                $scope.task = task;
                                update();
                            } else if (task.link[type][parts.single] === task.link[type][parts.all]) {
                                console.log('linked complete - delete', task.description);
                                remove(task);
                            }
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
                    } else if ((task.daily === false) && change) {
                        console.log('weekly update: ', task.description);
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
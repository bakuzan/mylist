'use strict';

// Tasks controller
angular.module('tasks').controller('TasksController', ['$scope', '$rootScope', '$stateParams', '$location', 'Authentication', 'Tasks', 'ListService', 'NotificationFactory', 'TaskFactory', 'spinnerService', '$uibModal', 'moment',
	function($scope, $rootScope, $stateParams, $location, Authentication, Tasks, ListService, NotificationFactory, TaskFactory, spinnerService, $uibModal, moment) {
		var ctrl = this;
		$scope.authentication = Authentication;
		$rootScope.commonArrays = ListService.getCommonArrays();
    $scope.whichController = 'task';
    var today = new Date(),
        day = today.getDay();

    //paging variables.
    $scope.pageConfig = {
        currentPage: 0,
        pageSize: 10
    };
    $scope.filterConfig = {
			view: 'list',
      showingCount: 0,
      sortType: '',
      sortReverse: true,
      search: {
          description: '',
          day: ''
      },
      datesSelected: false
    };
    $scope.mangaUpdate = {
        isPopup: ''
    };

    ctrl.tabFilter = function(tabName) {
        $scope.filterConfig.search.day = tabName;
    };

    ctrl.weekBeginning = function() {
        return TaskFactory.getWeekBeginning();
    };

		// Create new Task
		$scope.create = function() {
//            console.log(this.newTask);
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
                                                                   1    ,
                    completeTimes: (this.newTask.link.linked === false) ? 0                                     :
                                   (this.newTask.category === 'Watch')  ? this.newTask.link.anime.episodes      :
                                                                          0      ,
                    updateCheck: new Date().getDay() === 1 ? true : false,
                    complete: false,
                    category: this.newTask.category === '' ? 'Other' : this.newTask.category,
                    daily: this.newTask.daily,
                    checklist: this.newTask.checklist,
                    checklistItems: this.newTask.checklistItems
                });
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

		// Remove existing Task
		ctrl.removeTask = function(task) {
			TaskFactory.removeTask(task, $scope.tasks);
		};
		//Update task.
		ctrl.updateTask = function(task) {
				TaskFactory.updateTask(task);
		};
    //Add new checklist item.
    ctrl.insertChecklistItem = function (task, newChecklistItem) {
        TaskFactory.insertChecklistItem(task, newChecklistItem);
    };
		//Tick off a task.
		ctrl.tickOff = function(task) {
		    TaskFactory.tickOff(task);
		};
    //Tick of a checklist item.
    ctrl.tickOffChecklist = function(task, index) {
        TaskFactory.tickOffChecklist(task, index);
    };

    //Defaults the tab filter to the current day of the week.
    function setTabFilterDay(day) {
        var index = day === 0 ? 7 : day; //Adjust for Sunday.
        $scope.filterConfig.search.day = $scope.commonArrays.days[index].name;
        console.log(day, $scope.filterConfig.search.day);
    }
    setTabFilterDay(day);

    //check things
    function checkStatus() {
        if (day === 1) {
            console.log('monday', day);
            angular.forEach($scope.tasks, function (task) {
                //has it been updated today?
                if(task.updateCheck === false) {
                    console.log('updating - ', task.description);
                    var type = task.link.type;
                    if ((task.link.linked === false) || (type === 'manga')) {
                        //has it reached the necessary number of repeats?
                        if(task.completeTimes !== task.repeat) {
                            console.log('not complete', task.description);
                            task.complete = false;
                            task.updateCheck = true;
                            TaskFactory.updateTask(task);
                        } else if (task.completeTimes === task.repeat) {
                            console.log('complete - delete', task.description);
                            TaskFactory.removeTask(task, $scope.tasks);
                        }
                    } else if (task.link.type === 'anime') {
                        console.log('linked');
                            var parts = { single: 'episodes', all: 'finalEpisode' };
                        if (task.link[type][parts.single] !== task.link[type][parts.all]) {
                            console.log('linked not complete', task.description);
                            task.complete = false;
                            task.updateCheck = true;
                            TaskFactory.updateTask(task);
                        } else if (task.link[type][parts.single] === task.link[type][parts.all]) {
                            console.log('linked complete - delete', task.description);
                            TaskFactory.removeTask(task, $scope.tasks);
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
                            TaskFactory.updateTask(task);
                        }
                    } else if (task.completeTimes === task.repeat) {
                        console.log('complete - delete', task.description);
                        TaskFactory.removeTask(task, $scope.tasks);
                    }
                } else if ((task.daily === false) && change) {
                    console.log('weekly update: ', task.description);
                    TaskFactory.updateTask(task);
                }
            });
        }
        find();
    }

		// Find a list of Tasks
		function find(check) {
	    spinnerService.loading('tasks', Tasks.query().$promise.then(function(result) {
	        $scope.tasks = result;
	        if (check === true) checkStatus();
	    }));
		}
		find(true);

		ctrl.refreshItems = function() {
			find();
      NotificationFactory.warning('Refreshed!', 'Task list refreshed!');
		};

	}
]);

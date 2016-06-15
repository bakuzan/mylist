(function() {
'use strict';

	// Tasks controller
	angular.module('tasks').controller('TasksController', TasksController);
	TasksController.$inject =  ['$scope', '$timeout', '$stateParams', '$location', 'Authentication', 'Tasks', 'ListService', 'NotificationFactory', 'TaskFactory', 'spinnerService', '$mdDialog', 'moment'];

	function TasksController($scope, $timeout, $stateParams, $location, Authentication, Tasks, ListService, NotificationFactory, TaskFactory, spinnerService, $mdDialog, moment) {
		var ctrl = this,
				today = new Date(),
				day = today.getDay();
		ctrl.authentication = Authentication;
		ctrl.commonArrays = ListService.getCommonArrays();
		ctrl.createTask = createTask;
		ctrl.dateOptions = {
			dateDisabled: false,
			formatYear: 'yy',
			maxDate: new Date(2020, 5, 22),
			minDate: new Date(),
			startingDay: 1
		};
		ctrl.filterConfig = {
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
		ctrl.insertChecklistItem = insertChecklistItem;
    ctrl.pageConfig = {
        currentPage: 0,
        pageSize: 10
    };
		ctrl.refreshItems = refreshItems;
		ctrl.removeTask = removeTask;
		ctrl.setTabFilterDay = setTabFilterDay;
		ctrl.tabFilter = tabFilter;
		ctrl.tickOff = tickOff;
		ctrl.tickOffChecklist = tickOffChecklist;
		ctrl.updateTask = updateTask;
		ctrl.weekBeginning = weekBeginning;
		ctrl.whichController = 'task';

    function tabFilter(tabName) {
        ctrl.filterConfig.search.day = tabName;
    }

    function weekBeginning() {
        return TaskFactory.getWeekBeginning();
    }

		function createTask(ev) {
			$mdDialog.show({
				bindToController: true,
	      controller: 'CreateTaskController',
				controllerAs: 'taskCreate',
	      templateUrl: '/modules/tasks/views/create-task.client.view.html',
	      parent: angular.element(document.body),
	      targetEvent: ev,
	      clickOutsideToClose: true,
				fullscreen: true,
				locals: {
					commonArrays: ctrl.commonArrays
				}
	    }).then(function(result) {
				console.log('closed create task: ', result);
				find();
			});
		}

		// Remove existing Task
		function removeTask(task) {
			TaskFactory.removeTask(task, ctrl.tasks, true);
		}
		//Update task.
		function updateTask(task) {
				TaskFactory.updateTask(task);
		}
    //Add new checklist item.
    function insertChecklistItem(task, newChecklistItem) {
        TaskFactory.insertChecklistItem(task, newChecklistItem);
    }
		//Tick off a task.
		function tickOff(task) {
		    TaskFactory.tickOff(task).then(function(result) {
					// console.log('update task res - tickOff: ', result);
					if(result.refresh) find();
				});
		}
    //Tick of a checklist item.
		function tickOffChecklist(task, index) {
        TaskFactory.tickOffChecklist(task, index).then(function(result) {
					// console.log('update task res - tickOffChecklist: ', result);
					if(result.refresh) find();
				});
    }

    //Defaults the tab filter to the current day of the week.
    function setTabFilterDay(day) {
        var index = day === 0 ? 7 : day; //Adjust for Sunday.
        ctrl.filterConfig.search.day = ctrl.commonArrays.days[index].name;
        console.log(day, ctrl.filterConfig.search.day);
    }
    ctrl.setTabFilterDay(day);

    //check things
    function checkStatus() {
        if (day === 1) {
            console.log('monday', day);
            angular.forEach(ctrl.tasks, function (task) {
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
                            TaskFactory.removeTask(task, ctrl.tasks);
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
                            TaskFactory.removeTask(task, ctrl.tasks);
                        }
                    }
                }
            });
        } else {
            console.log('not monday', day);
            angular.forEach(ctrl.tasks, function (task) {
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
                        TaskFactory.removeTask(task, ctrl.tasks);
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
			$timeout(function () {
		    spinnerService.loading('tasks', Tasks.query().$promise.then(function(result) {
					console.log('found! : ', result);
		        ctrl.tasks = result;
		        if (check === true) checkStatus();
		    }));
			}, 250);
		}
		find(true);

		function refreshItems() {
			find();
      NotificationFactory.warning('Refreshed!', 'Task list refreshed!');
		}

	}

})();

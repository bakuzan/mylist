(function() {
	'use strict';
	angular.module('tasks').controller('ScheduleCalendarTaskController', ScheduleCalendarTaskController);
	ScheduleCalendarTaskController.$inject = ['$scope', '$mdDialog', 'moment', 'ListService', 'TaskFactory'];

	function ScheduleCalendarTaskController($scope, $mdDialog, moment, ListService, TaskFactory) {
    var ctrl = this,
				refresh = false,
				timeDiff = Math.abs(new Date(ctrl.date).getTime() - new Date().getTime());

		ctrl.cancel = cancel;
    ctrl.date = new Date(ctrl.date);
		ctrl.day = ctrl.date.getDay() > 0 ? ctrl.date.getDay() - 1 : 6;
		ctrl.daysFromToday = Math.ceil(timeDiff / (1000 * 3600 * 24));
		ctrl.init = init;
		ctrl.insertChecklistItem = insertChecklistItem;
		ctrl.removeTask = removeTask;
		ctrl.tickOff = tickOff;
		ctrl.tickOffChecklist = tickOffChecklist;
		ctrl.today = new Date();
		ctrl.updateTask = updateTask;
		console.log('days: ', ctrl.days, ctrl.day, ctrl.date);

		function init() {
			var weekEnds = new Date(ListService.weekEndingForDate(ctrl.date)),
					temp = ctrl.events;
			ctrl.events = [];
			angular.forEach(temp, function(event) {
				if(new Date(event.date) < weekEnds && ((event.day.substring(0, 3) === ctrl.days[ctrl.day].text) || (event.day === 'Any'))) {
					// console.log('daysFromToday: ', ctrl.daysFromToday);
					if(!event.daily) {
						//in weeks
						// console.log('weeks: ', event.completeTimes, Math.floor(ctrl.daysFromToday / 7), event.repeat);
						if((event.completeTimes + Math.floor(ctrl.daysFromToday / 7) <= event.repeat) || event.repeat === 0) {
							ctrl.events.push(event);
						}
					} else if(event.daily) {
						//in days
						// console.log('days: ', event.completeTimes, ctrl.daysFromToday, event.repeat);
						if(((event.completeTimes + ctrl.daysFromToday) <= event.repeat) || event.repeat === 0) {
							ctrl.events.push(event);
						}
					}
				}
			});
			ctrl.events.sort(function(a, b) {
				var aDate = a.date, bDate = b.date;
				return aDate < bDate ? 1 :
							 aDate > bDate ? -1 : 0;
			});
		}
		ctrl.init();

		function removeTask(task) {
			TaskFactory.removeTask(task, ctrl.events, true);
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
					refresh = result.refresh;
				});
		}
    //Tick of a checklist item.
    function tickOffChecklist(task, index) {
        TaskFactory.tickOffChecklist(task, index).then(function(result) {
					// console.log('update task res - tickOffChecklist: ', result);
					refresh = result.refresh;
				});
    }

    function cancel() {
      $mdDialog.hide(refresh);
    }
	}
})();

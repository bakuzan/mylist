'use strict';

// Tasks controller
angular.module('tasks').controller('ScheduleCalendarTaskController', ['$scope', '$uibModalInstance', 'moment', 'data', 'ListService',
	function($scope, $uibModalInstance, moment, data, ListService) {
    var ctrl = this;
		ctrl.today = new Date();
    ctrl.date = new Date(data.date);
		var timeDiff = Math.abs(ctrl.date.getTime() - ctrl.today.getTime());
		ctrl.daysFromToday = Math.ceil(timeDiff / (1000 * 3600 * 24));
		ctrl.day = ctrl.date.getDay() - 1;
		ctrl.days = data.days;
    ctrl.events = [];
		// console.log('data: ', data, '$scope', $scope);

		ctrl.init = function() {
			var weekEnds = new Date(ListService.weekEndingForDate(ctrl.date));
			angular.forEach(data.events, function(event) {
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
		};
		ctrl.init();

    ctrl.submit = function () {
      $uibModalInstance.close(ctrl.item);
    };

    ctrl.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
	}]);

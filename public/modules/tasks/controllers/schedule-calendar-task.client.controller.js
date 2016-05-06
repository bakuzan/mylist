'use strict';

// Tasks controller
angular.module('tasks').controller('ScheduleCalendarTaskController', ['$scope', '$uibModalInstance', 'moment', 'data', 'ListService',
	function($scope, $uibModalInstance, moment, data, ListService) {
    var ctrl = this;
    ctrl.date = new Date(data.date);
		ctrl.day = ctrl.date.getDay() - 1;
		ctrl.days = data.days;
    ctrl.events = [];
		console.log('data: ', data);

		ctrl.init = function() {
			var weekEnds = new Date(ListService.weekEndingForDate(ctrl.date));
			angular.forEach(data.events, function(event) {
				if(new Date(event.date) < weekEnds && ((event.day.substring(0, 3) === ctrl.days[ctrl.day].text) || (event.day === 'Any'))) {
					ctrl.events.push(event);
				}
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

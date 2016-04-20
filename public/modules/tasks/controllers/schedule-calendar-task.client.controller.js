'use strict';

// Tasks controller
angular.module('tasks').controller('ScheduleCalendarTaskController', ['$scope', '$uibModalInstance', 'moment', 'data',
	function($scope, $uibModalInstance, moment, data) {
    var ctrl = this;
    ctrl.date = new Date(data.date);
    ctrl.events = data.events;
		console.log('data: ', data);

    ctrl.submit = function () {
      $uibModalInstance.close(ctrl.item);
    };

    ctrl.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
	}
]);

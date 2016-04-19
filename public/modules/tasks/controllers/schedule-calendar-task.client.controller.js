'use strict';

// Tasks controller
angular.module('tasks').controller('ScheduleCalendarTaskController', ['$scope', '$uibModalInstance', 'data',
	function($scope, $uibModalInstance, data) {
    var ctrl = this;
    ctrl.date = data.date;
    ctrl.events = data.events;

    ctrl.submit = function () {
      $uibModalInstance.close(ctrl.item);
    };

    ctrl.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
	}
]);

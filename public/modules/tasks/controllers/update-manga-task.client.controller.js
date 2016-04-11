'use strict';

// Tasks controller
angular.module('tasks').controller('UpdateMangaTaskController', ['$scope', '$uibModalInstance', 'data',
	function($scope, $uibModalInstance, data) {
    var ctrl = this;
    ctrl.item = data.item;
    ctrl.stepConfig = {
        currentStep: 1,
        stepCount: 1
    };
    console.log('update linked manga item: ', ctrl.item);

    ctrl.submit = function () {
      $uibModalInstance.close(ctrl.item);
    };

    ctrl.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
	}
]);

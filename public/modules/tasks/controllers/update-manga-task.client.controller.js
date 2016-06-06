(function() {
	'use strict';

	angular.module('tasks').controller('UpdateMangaTaskController', UpdateMangaTaskController);
	UpdateMangaTaskController.$inject = ['$scope', '$uibModalInstance', 'data'];

	function UpdateMangaTaskController($scope, $uibModalInstance, data) {
    var ctrl = this;
		ctrl.cancel = cancel;
    ctrl.item = data.item;
    ctrl.stepConfig = {
        currentStep: 1,
        stepCount: 1
    };
		ctrl.submit = submit;
    console.log('update linked manga item: ', ctrl.item);

    function submit() {
      $uibModalInstance.close(ctrl.item);
    }

    function cancel() {
      $uibModalInstance.dismiss('cancel');
    }
	}

})();

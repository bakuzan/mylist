(function() {
	'use strict';

	angular.module('tasks').controller('UpdateMangaTaskController', UpdateMangaTaskController);
	UpdateMangaTaskController.$inject = ['$scope', '$mdDialog'];

	function UpdateMangaTaskController($scope, $mdDialog) {
    var ctrl = this;
		ctrl.cancel = cancel;
    ctrl.stepConfig = {
        currentStep: 1,
				cancel: cancel,
	      submit: submit
    };
		ctrl.submit = submit;
    console.log('update linked manga item: ', ctrl.item);

    function submit() {
      $mdDialog.hide(ctrl.item);
    }

    function cancel() {
      $mdDialog.cancel();
    }
	}

})();

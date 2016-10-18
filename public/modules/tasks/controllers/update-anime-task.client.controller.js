(function() {
	'use strict';

	angular.module('tasks').controller('UpdateAnimeTaskController', UpdateAnimeTaskController);
	UpdateAnimeTaskController.$inject = ['$scope', '$uibModalInstance', 'data', 'FunctionService'];

	function UpdateAnimeTaskController($scope, $uibModalInstance, data, FunctionService) {
    var ctrl = this;
		ctrl.cancel = cancel;
		ctrl.episodeCompleted = data.item.link.anime.episodes + 1;
    ctrl.episodeNumber = FunctionService.pad(ctrl.episodeCompleted, 3);
    ctrl.episodeRating = 0;
    ctrl.item = data.item;
    ctrl.isComplete = ctrl.episodeCompleted === ctrl.item.link.anime.finalEpisode && ctrl.item.link.anime.finalEpisode !== 0;
    ctrl.ratingLimit = 10;
    ctrl.stepConfig = {
        currentStep: 1,
        stepCount: 1
    };
		ctrl.submit = submit;
    console.log(`update anime task : `, data.item);
    function submit() {
      $uibModalInstance.close({ task: ctrl.item, episodeRating: ctrl.episodeRating });
    }

    function cancel() {
      $uibModalInstance.dismiss('cancel');
    }
	}

})();

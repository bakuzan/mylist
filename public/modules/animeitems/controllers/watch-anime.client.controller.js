(function() {
	'use strict';
	angular.module('animeitems')
	.controller('WatchAnimeController', WatchAnimeController);
	WatchAnimeController.$inject = ['$scope', 'Authentication', '$stateParams', '$timeout', 'Animeitems', '$sce', 'ListService'];

	function WatchAnimeController($scope, Authentication, $stateParams, $timeout, Animeitems, $sce, ListService) {
				var ctrl = this,
						saved = localStorage.getItem('watched');

        ctrl.authentication = Authentication;
				ctrl.findOne = findOne;
				ctrl.playVideo = playVideo;
				ctrl.startRewatch = startRewatch;
        ctrl.videoFile = {
  				processed: '',
  				file: '',
					number: '',
  				message: 'Please select an episode.'
        };
				ctrl.watchedList = (localStorage.getItem('watched') !== null) ? JSON.parse(saved) : {};

				function updateWatchedList() {
					localStorage.setItem('watched', JSON.stringify(ctrl.watchedList));
					ctrl.watchedList = JSON.parse(localStorage.getItem('watched'));
				}

				function playVideo() {
					ctrl.watchedList[ctrl.videoFile.file] = true;
					updateWatchedList();
				}

				function startRewatch() {
					console.log('startRewatch: ');
					var i = ctrl.animeitem.video.files.length;
					while(i--) {
						ctrl.watchedList[ctrl.animeitem.video.files[i].file] = false;
					}
					updateWatchedList();
				}

        $scope.$watch('fileGrab', function(nVal, oVal) {
          if(nVal) {
						ctrl.videoFile.message = ''; //clear any error.
            ctrl.videoFile.file = nVal.name;
						ctrl.videoFile.number = ctrl.animeitem.video.files[ListService.findWithAttr(ctrl.animeitem.video.files, 'file', nVal.name)].number;
            ctrl.videoFile.processed = $sce.trustAsResourceUrl(window.URL.createObjectURL(nVal));
          }
        });

        // Find existing Animeitem
    		function findOne() {
    	    Animeitems.get({ animeitemId: $stateParams.animeitemId }).$promise.then(function(result) {
    	        ctrl.animeitem = result;
    	   			console.log(ctrl.animeitem);
    	    });
    		}
        ctrl.findOne();

	}

})();

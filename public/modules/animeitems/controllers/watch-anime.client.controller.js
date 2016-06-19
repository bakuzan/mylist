(function() {
	'use strict';
	angular.module('animeitems')
	.controller('WatchAnimeController', WatchAnimeController);
	WatchAnimeController.$inject = ['$scope', 'Authentication', '$stateParams', '$timeout', 'Animeitems', '$sce', 'ListService', 'AnimeFactory'];

	function WatchAnimeController($scope, Authentication, $stateParams, $timeout, Animeitems, $sce, ListService, AnimeFactory) {
				var ctrl = this,
						saved = localStorage.getItem('watched');

        ctrl.authentication = Authentication;
				ctrl.findOne = findOne;
				ctrl.playVideo = playVideo;
				ctrl.startRewatch = startRewatch;
				ctrl.update = update;
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

        $scope.$watch('fileGrab', function(nVal, oVal) {
          if(nVal) {
						ctrl.videoFile.message = ''; //clear any error.
            ctrl.videoFile.file = nVal.name;
						ctrl.videoFile.number = ctrl.animeitem.video.files[ListService.findWithAttr(ctrl.animeitem.video.files, 'file', nVal.name)].number;
            ctrl.videoFile.processed = $sce.trustAsResourceUrl(window.URL.createObjectURL(nVal));
          }
        });

				function playVideo() {
					ctrl.watchedList[ctrl.videoFile.file] = true;
					updateWatchedList();
					if(ctrl.animeitem.reWatching && (ListService.findWithAttr(ctrl.animeitem.video.files, 'file', ctrl.videoFile.file) > -1)) {
						ctrl.animeitem.episodes = parseInt(ctrl.videoFile.number, 10);
						ctrl.update();
					}
				}

				function startRewatch() {
					console.log('startRewatch: ');
					var i = ctrl.animeitem.video.files.length;
					while(i--) {
						ctrl.watchedList[ctrl.animeitem.video.files[i].file] = false;
					}
					updateWatchedList();
					ctrl.animeitem.episodes = 0;
					ctrl.update();
				}

				// Update existing Animeitem
				function update() {
					ctrl.animeitem.latest = new Date();
		      AnimeFactory.update(ctrl.animeitem, undefined, false, '');
				}

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

'use strict';

// Animeitems controller
angular.module('animeitems').controller('WatchAnimeController', ['$scope', 'Authentication', '$stateParams', '$timeout', 'Animeitems', '$sce', 'ListService',
	function($scope, Authentication, $stateParams, $timeout, Animeitems, $sce, ListService) {
				var ctrl = this, stream = document.getElementById('stream'),
						saved = localStorage.getItem('watched');
				stream.onplay = function() {
					console.log('video playing');
					ctrl.watchedList[ctrl.videoFile.file] = true;
					localStorage.setItem('watched', JSON.stringify(ctrl.watchedList));
					ctrl.watchedList = JSON.parse(localStorage.getItem('watched'));
				};
        ctrl.authentication = Authentication;
				ctrl.watchedList = (localStorage.getItem('watched') !== null) ? JSON.parse(saved) : {};
        ctrl.videoFile = {
  				processed: '',
  				file: '',
					number: '',
  				message: 'Please select an episode.'
        };

				//select video for playback
				ctrl.chooseVideo = function(event, file) {
					ctrl.videoFile.file = file;
          ctrl.videoFile.message = ''; //clear any error.
				};

        $scope.$watch('fileGrab', function(nVal, oVal) {
          if(nVal) {
            ctrl.videoFile.file = nVal.name;
						ctrl.videoFile.number = ctrl.animeitem.video.files[ListService.findWithAttr(ctrl.animeitem.video.files, 'file', nVal.name)].number;
            ctrl.videoFile.processed = $sce.trustAsResourceUrl(window.URL.createObjectURL(nVal));
          }
        });

        // Find existing Animeitem
    		ctrl.findOne = function() {
    	    Animeitems.get({ animeitemId: $stateParams.animeitemId }).$promise.then(function(result) {
    	        ctrl.animeitem = result;
    	   			console.log(ctrl.animeitem);
    	    });
    		};
        ctrl.findOne();

	}
]);

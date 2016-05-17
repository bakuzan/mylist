'use strict';

// Animeitems controller
angular.module('animeitems').controller('WatchAnimeController', ['$scope', 'Authentication', '$stateParams', '$timeout', 'Animeitems', '$sce',
	function($scope, Authentication, $stateParams, $timeout, Animeitems, $sce) {
				var ctrl = this;
        ctrl.authentication = Authentication;
        ctrl.videoFile = {
  				processed: '',
  				file: '',
  				message: 'Please select an episode.'
        };

				//select video for playback
				ctrl.chooseVideo = function(event, file) {
					ctrl.videoFile.file = file;
          ctrl.videoFile.message = ''; //clear any error.
						// var videoUrl = $scope.animeitem.video.location + $scope.filterConfig.videoFile.file,
						// 		blob = new Blob([videoUrl], { type: 'video/mp4' }),
						// 		fileUrl = window.URL.createObjectURL(blob);
						// $scope.filterConfig.videoFile.processed = $scope.trustAsResourceUrl(fileUrl);
						console.log('video file - event: ', event, 'details: ', ctrl.videoFile);
				};

        ctrl.fileGrabbed = function() {
          console.log('grabber: ', $scope.fileGrab);
        };

        $scope.$watch('fileGrab', function(nVal, oVal) {
          if(nVal) {
            ctrl.videoFile.file = nVal.name;
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

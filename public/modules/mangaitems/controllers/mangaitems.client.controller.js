'use strict';

// Mangaitems controller
angular.module('mangaitems').controller('MangaitemsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Mangaitems', '$upload',
	function($scope, $stateParams, $location, Authentication, Mangaitems, $upload) {
		$scope.authentication = Authentication;
        
        $scope.sortType = 'latest'; //default sort type
	    $scope.sortReverse = true; // default sort order
        $scope.finalNumbers = false; //default show status of final number fields in edit view.
        $scope.maxRating = 10; //maximum rating
        //$scope.capacity = '1000'; //set chapter/volume limit number
        
        //rating 'tooltip' function
        $scope.hoveringOver = function(value) {
            $scope.overStar = value;
            $scope.percent = 100 * (value / $scope.maxRating);
        };
        
        $scope.$watch('files', function () {
            $scope.onFileSelect($scope.image);
        });
        
        //image upload function
        $scope.onFileSelect = function(image) {
            if (angular.isArray(image)) {
                image = image[0];
            }
            
            //client-side file type handling.
            if (image.type !== 'image/png' && image.type !== 'image/jpeg') {
                alert('Only PNG and JPEG are accepted.');
            }
            
            $scope.uploadInProgress = true;
            $scope.uploadProgress = 0;
            
            $scope.upload = $upload.upload({
                url: '/upload/image',
                method: 'POST',
                file: image
            }).progress(function(event) {
                $scope.uploadProgress = Math.floor(event.loaded / event.total);
                $scope.$apply();
            }).success(function(data, status, headers, config) {
                console.log('file ' + config.file.name + ' uploaded. Response: ' + data);
                $scope.uploadInProgress = false;
                //get file immediately.
                $scope.uploadedImage = JSON.parse(data);
            }).error(function(err) {
                $scope.uploadInProgress = false;
                console.log('Error during upload: ' + err.message || err);
            });
        };

		// Create new Mangaitem
		$scope.create = function() {
			// Create new Mangaitem object
			var mangaitem = new Mangaitems ({
				title: this.title,
                chapters: this.chapters,
                volumes: this.volumes,
                start: this.start,
                latest: this.latest,
                finalChapter: this.finalChapter,
                finalVolume: this.finalVolume,
                hardcopy: this.hardcopy,
                user: this.user
			});

			// Redirect after save
			mangaitem.$save(function(response) {
				$location.path('/mangaitems/' + response._id);

				// Clear form fields
				$scope.title = '';
                $scope.chapters = '';
                $scope.volumes = '';
                $scope.start = '';
                $scope.latest = '';
                $scope.status = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Mangaitem
		$scope.remove = function(mangaitem) {
			if ( mangaitem ) { 
				mangaitem.$remove();

				for (var i in $scope.mangaitems) {
					if ($scope.mangaitems [i] === mangaitem) {
						$scope.mangaitems.splice(i, 1);
					}
				}
			} else {
				$scope.mangaitem.$remove(function() {
					$location.path('/mangaitems');
				});
			}
		};

		// Update existing Mangaitem
		$scope.update = function() {
			var mangaitem = $scope.mangaitem;
            console.log(mangaitem.end);
            
            //handle status: completed.
            if(mangaitem.end!==undefined) {
                mangaitem.status = true;
            } else {
                mangaitem.status = false;
            }
            
            //handle re-reading, re-read count.
            if (mangaitem.reReading===true && mangaitem.chapters===mangaitem.finalChapter && mangaitem.volumes===mangaitem.finalVolume) {
                mangaitem.reReadCount += 1;
                mangaitem.reReading = false;
            }

			mangaitem.$update(function() {
				$location.path('/mangaitems/' + mangaitem._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Mangaitems
		$scope.find = function() {
			$scope.mangaitems = Mangaitems.query();
            console.log($scope.mangaitems);
		};

		// Find existing Mangaitem
		$scope.findOne = function() {
			$scope.mangaitem = Mangaitems.get({ 
				mangaitemId: $stateParams.mangaitemId
			});
            console.log($scope.mangaitem);
		};
	}
]);
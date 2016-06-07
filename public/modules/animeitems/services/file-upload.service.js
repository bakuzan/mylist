(function() {
	'use strict';
	angular.module('animeitems')
	.service('fileUpload', fileUpload);
	fileUpload.$inject = ['$http', 'NotificationFactory'];

	function fileUpload($http, NotificationFactory) {
		return {
			uploadFileToUrl: uploadFileToUrl
		};

	    function uploadFileToUrl(file, uploadUrl){
	        var fd = new FormData();
	        fd.append('file', file);
	        $http.post(uploadUrl, fd, {
	            transformRequest: angular.identity,
	            headers: {'Content-Type': undefined}
	        })
	        .success(function(response){
	            NotificationFactory.success('Uploaded!', 'Image was saved successfully');
	        })
	        .error(function(err){
	            NotificationFactory.popup('Woops!', 'Something went wrong! \n' + err, 'error');
	        });
	    }
			
	}

})();

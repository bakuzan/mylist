(function() {
	'use strict';
	angular.module('characters')
	.service('TagService', TagService);
	TagService.$inject = ['$rootScope', 'NotificationFactory'];

	 function TagService($rootScope, NotificationFactory) {
			var service = {};

			//Add newTag to tagArray
			service.addTag = function(tagArray, newTag) {
			    if (newTag!=='' && newTag!==undefined) {
			        var i = 0, alreadyAdded = false;
			        if (tagArray.length > 0) {
			            while(i < tagArray.length) {
			                if (tagArray[i].text === newTag) {
			                    alreadyAdded = true;
			                }
			                i++;
			            }
			            //if not in array add it.
			            if (alreadyAdded === false) {
			                tagArray.push({ text: newTag });
			            }
			        } else {
			            tagArray.push({ text: newTag });
			        }
			    }
			};

			//Drop tag with text = text, from tagArray
			service.dropTag = function(tagArray, text) {
				 //are you sure option...
				NotificationFactory.confirmation(function() {
					$rootScope.$apply(function() {
						var i = tagArray.length;
						while(i--) {
							if(tagArray[i].text === text) {
								tagArray.splice(i, 1);
								NotificationFactory.warning('Dropped!', 'Tag was successfully dropped');
								break;
							}
						}
					});
				});
			};

			return service;
	}

})();

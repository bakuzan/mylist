(function() {
	'use strict';
	angular.module('core')
	.service('Enums', Enums);

	function Enums() {
		var obj = {
			malStatus: {
        anime: {
          ongoing: 'Currently Airing',
          complete: 'Finished Airing'
        },
        manga: {
          ongoing: 'Publishing',
          complete: 'Finished'
        }
      }
		};
		return obj;
	}

})();

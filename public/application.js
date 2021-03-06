'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
	function($locationProvider) {
		$locationProvider.hashPrefix('!');
	}
]);

angular.module(ApplicationConfiguration.applicationModuleName)
     .run(['$rootScope', '$state', 'Authentication', function ($rootScope, $state, Authentication) {
        $rootScope.$on('$stateChangeStart', function (event, toState) {
					if(toState.name === 'signin') {
						if(Authentication.user._id) {
							event.preventDefault();
							$state.go('listTasks');
						} else {
							return;
						}
					}
	        if (!Authentication.user) {
						event.preventDefault();
						$state.go('signin');
	        }
				});
}]);

//Then define the init function for starting up the application
angular.element(document).ready(function() {
	//Fixing facebook bug with redirect
	if (window.location.hash === '#_=_') window.location.hash = '#!';

	//Then init the app
	angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});

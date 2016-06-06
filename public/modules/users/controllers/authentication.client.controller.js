(function() {
	'use strict';
	angular.module('users').controller('AuthenticationController', AuthenticationController);
	AuthenticationController.$inject = ['$scope', '$http', '$location', 'Authentication'];

	function AuthenticationController($scope, $http, $location, Authentication) {
		var ctrl = this;

		ctrl.authentication = Authentication;
		ctrl.signin = signin;
		ctrl.signup = signup;

		function signup() {
			$http.post('/auth/signup', ctrl.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				ctrl.authentication.user = response;

				// And redirect to the index page
				$location.path('/signin');
			}).error(function(response) {
				ctrl.error = response.message;
			});
		}

		function signin() {
			ctrl.credentials.username = 'username';
			$http.post('/auth/signin', ctrl.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				ctrl.authentication.user = response;
				ctrl.loginBody = true;

				// And redirect to the index page
				$location.path('/tasks');
			}).error(function(response) {
				ctrl.error = response.message;
			});
		}

	}
})();

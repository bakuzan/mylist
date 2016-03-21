'use strict';

// Orders controller
angular.module('orders').controller('OrdersController', ['$scope', '$stateParams', '$location', 'Authentication', 'Orders',
	function($scope, $stateParams, $location, Authentication, Orders) {
		$scope.authentication = Authentication;
		var self = this;

		// Remove existing Order
		self.remove = function(order) {
			if ( order ) {
				order.$remove();

				for (var i in $scope.orders) {
					if ($scope.orders [i] === order) {
						$scope.orders.splice(i, 1);
					}
				}
			} else {
				$scope.order.$remove(function() {
					$location.path('orders');
				});
			}
		};

		// Find a list of Orders
		self.find = function() {
			$scope.orders = Orders.query();
		};

		// Find existing Order
		self.findOne = function() {
			$scope.order = Orders.get({
				orderId: $stateParams.orderId
			});
		};
		
	}
]);

'use strict';

// Orders controller
angular.module('orders').controller('CreateOrdersController', ['$scope', '$stateParams', '$location', 'Authentication', 'Orders',
	function($scope, $stateParams, $location, Authentication, Orders) {
		$scope.authentication = Authentication;
		var self = this,
    orderCopy = {
      series: '',
      nextVolume: {
        volume: 0,
        rrp: 0,
        prices: []
      },
      rrp: 0,
      orderHistory: []
    };
    self.order = {};
    angular.copy(orderCopy, self.order);

		// Create new Order
		self.create = function() {
			// Create new Order object
			var order = new Orders ({
        series: this.order.series,
        nextVolume: {
          volume: this.order.nextVolume.volume,
          rrp: this.order.nextVolume.rrp,
          prices: this.order.nextVolume.prices
        },
        rrp: this.order.rrp,
        orderHistory: this.order.orderHistory
			});

			// Redirect after save
			order.$save(function(response) {
				$location.path('orders/' + response._id);

				// Clear form fields
        angular.copy(orderCopy, self.order);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Update existing Order
		self.update = function() {
			var order = $scope.order;

			order.$update(function() {
				$location.path('orders/' + order._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find existing Order
		self.findOne = function() {
			$scope.order = Orders.get({
				orderId: $stateParams.orderId
			});
		};

	}
]);

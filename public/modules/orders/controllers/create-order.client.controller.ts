'use strict';

interface ICreateOrdersController {
	order: Orders;
	orderCopy: Orders;
	stepConfig: any;
	authentication: any;
	create: () => void;
	update: () => void;
}
// Orders controller
class CreateOrdersController implements ICreateOrdersController {
	static controllerId = 'CreateOrdersController';
	static self = this;
	order: Orders = {};
	orderCopy: Orders = {
		series: '',
		nextVolume: {
			volume: 0,
			rrp: 0,
			prices: []
		},
		rrp: 0,
		orderHistory: []
	};
	authentication: any = this.Authentication;
	angular.copy(orderCopy, order);
	stepConfig: any = {
		stepHeaders: [
			{ text: '' },
			{ text: '' }
		],
		currentStep: 1,
		stepCount: 1,
		items: []
	};

	static $inject = ['$scope', '$stateParams', '$location', 'Authentication', 'Orders', 'Mangaitems'];

	constructor(private $scope, private $stateParams, private $location, private Authentication, private Orders, private Mangaitems) {
		this.init();
		this.findOne();
	}

	private init() {
		if(this.$stateParams.orderId !== undefined) {
			console.log('edit mode');
			this.findOne();
		} else {
			console.log('create mode');
			this.Mangaitems.query().$promise.then(function(result) {
				self.stepConfig.items = result;
				console.log('items: ', result);
			});
		}
		console.log('init done.');
	}

		// Create new Order
		create(): void {
			// Create new Order object
			var order = new this.Orders ({
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
				this.$location.path('orders/' + response._id);

				// Clear form fields
        angular.copy(this.orderCopy, this.order);
			}, function(errorResponse) {
				this.error = errorResponse.data.message;
			});
		}

		// Update existing Order
		update(): void {
			var order = this.order;

			order.$update(function() {
				this.$location.path('orders/' + order._id);
			}, function(errorResponse) {
				this.error = errorResponse.data.message;
			});
		}

		// Find existing Order
		private findOne() {
			this.Orders.get({ orderId: this.$stateParams.orderId }).$promise.then(function(result) {
				this.order = result;
				console.log('found one: ', result);
			});
		}
	}
//Register controller.
angular.module('orders').controller(CreateOrdersController.controllerId, CreateOrdersController);

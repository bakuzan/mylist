'use strict';

interface ICreateOrdersController {
	isCreateMode: boolean;
	order: Orders;
	orderCopy: Orders;
	stepConfig: any;
	authentication: any;
	create: () => void;
	update: () => void;
	takeStep: (step: number, direction: boolean) => void;
}
// Orders controller
class CreateOrdersController implements ICreateOrdersController {
	static controllerId = 'CreateOrdersController';
	isCreateMode: boolean = this.$stateParams.orderId === undefined;
	order: Orders = {};
	orderCopy: Orders = {
		series: '',
		nextVolume: {
			volume: 1,
			rrp: 0.00,
			prices: []
		},
		rrp: 0.00,
		orderHistory: []
	};
	authentication: any = this.Authentication;
	stepConfig: any = {
		stepHeaders: [
			{ text: 'Set next order' },
			{ text: 'Set prices' }
		],
		currentStep: 1,
		stepCount: 2,
		items: []
	};

	static $inject = ['$scope', '$stateParams', '$location', 'Authentication', 'Orders', 'Mangaitems'];

	constructor(private $scope, private $stateParams, private $location, private Authentication, private Orders, private Mangaitems) {
		this.init();
		this.findOne();
	}

	private init() {
		angular.copy(this.orderCopy, this.order);
		if(this.isCreateMode) {
			console.log('create mode');
			this.Mangaitems.query().$promise.then((result) => {
				this.stepConfig.items = result;
				console.log('items: ', result);
			});
		} else {
			console.log('edit mode');
			this.findOne();
		}
		console.log('init done: ');
	}

	takeStep(step: number, direction: boolean): void {
		console.log('stepping: ', step, direction);
		this.stepConfig.currentStep = (direction) ? step + 1 : step - 1;
	}

		// Create new Order
		create(): void {
			// Create new Order object
			var order = new this.Orders ({
        series: this.order.series._id,
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

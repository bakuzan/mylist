'use strict';

interface ICreateOrdersController {
	isCreateMode: boolean;
	order: OrderSchema;
	orderCopy: OrderSchema;
	stepConfig: any;
	authentication: any;
	create: () => void;
	update: () => void;
	takeStep: (step: number, direction: boolean) => void;
	cancel: () => void;
	processOrder: () => void;
	openBoughtDialog: () => void;
}
// CU Orders controller
class CreateOrdersController implements ICreateOrdersController {
	static controllerId = 'CreateOrdersController';
	isCreateMode: boolean = this.$stateParams.orderId === undefined;
	order: OrderSchema = {};
	orderCopy: OrderSchema = {
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

	static $inject = ['$scope', '$stateParams', '$location', 'Authentication', '$q', 'Orders', 'Mangaitems', '$uibModal'];

	constructor(private $scope, private $stateParams, private $location, private Authentication, private $q, private Orders, private Mangaitems, private $uibModal) {
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

	processOrder(): void {
		if(this.order.nextVolume.volume > 0) {
			var temp = angular.copy(this.order.nextVolume);
			this.order.orderHistory.push(this.order.nextVolume);
			this.order.nextVolume = {
				volume: temp.volume + 1,
				rrp: this.order.rrp,
				prices: []
			};
		}
	}

	cancel(): void {
		this.$location.path('orders');
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

		//Open dialog
		openBoughtDialog(): void {
			var modalInstance = this.$uibModal.open({
				animation: true,
      	templateUrl: '/modules/toptens/views/complete-order.client.view.html',
      	controller: 'completeOrder',
      	size: 'lg',
      	resolve: {
        	order: function () {
          	return this.order;
					}
				}
			});
		}

		// Find existing Order
		private findOne() {
			this.order = this.Orders.get({ orderId: this.$stateParams.orderId });
			console.log('found one: ', this.order);
		}
	}
//Register controller.
angular.module('orders').controller(CreateOrdersController.controllerId, CreateOrdersController);

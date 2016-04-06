'use strict';

import Order = require('../../../../app/models/order.server.model'); //Find out how to use this properly.

interface ICreateOrdersController {
	isCreateMode: boolean;
	order: Order.IOrder;
	orderCopy: Order.IOrder;
	stepConfig: any;
	authentication: any;
	create: () => void;
	update: () => void;
	takeStep: (step: number, direction: boolean) => void;
	cancel: () => void;
	findOne: () => void;
	processOrder: () => void;
	openBoughtDialog: () => void;
}
// CU Orders controller
class CreateOrdersController implements ICreateOrdersController {
	static controllerId = 'CreateOrdersController';
	isCreateMode: boolean = this.$stateParams.orderId === undefined;
	order: any = {};
	orderCopy: any = {
		series: '',
		nextVolume: {
			volume: 1,
			date: Date.now(),
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

	static $inject = ['$scope', '$stateParams', '$location', 'Authentication', '$q', 'Orders', 'Mangaitems', '$uibModal', 'NotificationFactory'];

	constructor(private $scope, private $stateParams, private $location, private Authentication, private $q, private Orders, private Mangaitems, private $uibModal, private NotificationFactory) {
		this.init();
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
				date: null,
				rrp: this.order.rrp,
				prices: []
			};
			this.update();
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
					date:  this.order.nextVolume.date,
          volume: this.order.nextVolume.volume,
          rrp: this.order.nextVolume.rrp,
          prices: this.order.nextVolume.prices
        },
        rrp: this.order.rrp,
        orderHistory: this.order.orderHistory
			});

			// Redirect after save
			order.$save((response) => {
				this.$location.path('orders/' + response._id);
				this.NotificationFactory.success('Saved!', 'New Order was successfully saved!');
				// Clear form fields
        angular.copy(this.orderCopy, this.order);
			}, function(errorResponse) {
				this.error = errorResponse.data.message;
				this.NotificationFactory.error('Error!', 'Order failed to save!');
			});
		}

		// Update existing Order
		update(): void {
			var order = this.order;

			order.$update(() => {
				this.$location.path('orders/' + order._id);
				this.NotificationFactory.success('Saved!', 'Order was successfully saved!');
			}, function(errorResponse) {
				this.error = errorResponse.data.message;
				this.NotificationFactory.error('Error!', 'Order failed to save!');
			});
		}

		//Open dialog
		openBoughtDialog(): void {
			var modalInstance = this.$uibModal.open({
				animation: true,
      	templateUrl: '/modules/orders/views/complete-order.client.view.html',
      	controller: 'CompleteOrdersController as modal',
      	size: 'md',
      	resolve: {
        	order: () => {
          	return this.order;
					}
				}
			});
			modalInstance.result.then((result) => {
				console.log(result);
				this.order = result;
				this.processOrder();
			});
		}

		// Find existing Order
		findOne(): void {
			this.order = this.Orders.get({ orderId: this.$stateParams.orderId });
			console.log('found one: ', this.order);
		}
	}
//Register controller.
angular.module('orders').controller(CreateOrdersController.controllerId, CreateOrdersController);

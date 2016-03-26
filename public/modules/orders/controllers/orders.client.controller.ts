'use strict';

interface IOrdersController {
	authentication: any;
	order: OrderSchema;
	orders: Array<OrderSchema>;
	remove: (order: OrderSchema) => void;
	find: () => void;
	findOne: () => void;
	openOrderHistoryDialog: () => void;
}
// Orders controller
class OrdersController implements IOrdersController {
	static controllerId = 'OrdersController';
	authentication: any = this.Authentication;
	order: OrderSchema = undefined;
	orders: Array<OrderSchema> = [];
	pageConfig: any = {
			currentPage: 0,
			pageSize: 10
	};

	static $inject = ['$scope', '$stateParams', '$location', 'Authentication', 'Orders', 'spinnerService', '$uibModal'];
	constructor(private $scope, private $stateParams, private $location, private Authentication, private Orders, private spinnerService, private $uibModal) {
		this.init();
	}

	private init() {
		console.log('init: ', this.$stateParams);
		if(this.$stateParams.orderId) {
			console.log('find one');
			this.findOne();
		} else {
			console.log('find all');
			this.find();
		}
	}

	// Remove existing Order
	remove(order: OrderSchema) : void {
		if ( order ) {
			order.$remove();
			for (var i = 0, length = this.order.length; i < length; i++) {
				if (this.orders [i] === order) {
					this.orders.splice(i, 1);
					return;
				}
			}
		} else {
			this.order.$remove(function() {
				this.$location.path('orders');
			});
		}
	}

	// Find a list of Orders
	find(): void {
		this.spinnerService.loading('orders', this.Orders.query().$promise.then((result) => {
			this.orders = result;
		}));
	}

	// Find existing Order
	findOne(): void {
		this.spinnerService.loading('orders', this.Orders.get({	orderId: this.$stateParams.orderId }).$promise.then((result) => {
			this.order = result;
		}));
	}

	//Open dialog
	openOrderHistoryDialog(): void {
		var modalInstance = this.$uibModal.open({
			animation: true,
			templateUrl: '/modules/orders/views/order-history.client.view.html',
			controller: 'OrderHistoryController as modal',
			size: 'md',
			resolve: {
				order: () => {
					return this.order;
				}
			}
		});
	}

	}
	//Register controller.
	angular.module('orders').controller(OrdersController.controllerId, OrdersController);

'use strict';

interface IOrdersController {
	authentication: any;
	order: OrderSchema;
	orders: Array<OrderSchema>;
	remove: (order: OrderSchema) => void;
	find: () => void;
	findOne: () => void;
}
// Orders controller
class OrdersController implements IOrdersController {
	static controllerId = 'OrdersController';
	authentication: any = this.Authentication;
	order: OrderSchema = undefined;
	orders: Array<OrderSchema> = [];

	static $inject = ['$scope', '$stateParams', '$location', 'Authentication', 'Orders'];
	constructor(private $scope, private $stateParams, private $location, private Authentication, private Orders) {
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
		this.orders = this.Orders.query();
	}

	// Find existing Order
	findOne(): void {
		this.order = this.Orders.get({
			orderId: this.$stateParams.orderId
		});
	}

	}
	//Register controller.
	angular.module('orders').controller(OrdersController.controllerId, OrdersController);

'use strict';
var OrdersController = (function () {
    function OrdersController($scope, $stateParams, $location, Authentication, Orders) {
        this.$scope = $scope;
        this.$stateParams = $stateParams;
        this.$location = $location;
        this.Authentication = Authentication;
        this.Orders = Orders;
        this.authentication = this.Authentication;
        this.order = undefined;
        this.orders = [];
        this.init();
    }
    OrdersController.prototype.init = function () {
        console.log('init: ', this.$stateParams);
        if (this.$stateParams.orderId) {
            console.log('find one');
            this.findOne();
        }
        else {
            console.log('find all');
            this.find();
        }
    };
    OrdersController.prototype.remove = function (order) {
        if (order) {
            order.$remove();
            for (var i = 0, length = this.order.length; i < length; i++) {
                if (this.orders[i] === order) {
                    this.orders.splice(i, 1);
                    return;
                }
            }
        }
        else {
            this.order.$remove(function () {
                this.$location.path('orders');
            });
        }
    };
    OrdersController.prototype.find = function () {
        this.orders = this.Orders.query();
    };
    OrdersController.prototype.findOne = function () {
        this.order = this.Orders.get({
            orderId: this.$stateParams.orderId
        });
    };
    OrdersController.controllerId = 'OrdersController';
    OrdersController.$inject = ['$scope', '$stateParams', '$location', 'Authentication', 'Orders'];
    return OrdersController;
}());
angular.module('orders').controller(OrdersController.controllerId, OrdersController);

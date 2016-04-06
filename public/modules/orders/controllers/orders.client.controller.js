'use strict';
var OrdersController = (function () {
    function OrdersController($scope, $stateParams, $location, Authentication, Orders, spinnerService, $uibModal) {
        this.$scope = $scope;
        this.$stateParams = $stateParams;
        this.$location = $location;
        this.Authentication = Authentication;
        this.Orders = Orders;
        this.spinnerService = spinnerService;
        this.$uibModal = $uibModal;
        this.authentication = this.Authentication;
        this.order = undefined;
        this.orders = [];
        this.pageConfig = {
            currentPage: 0,
            pageSize: 10
        };
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
        var _this = this;
        this.spinnerService.loading('orders', this.Orders.query().$promise.then(function (result) {
            _this.orders = result;
        }));
    };
    OrdersController.prototype.findOne = function () {
        var _this = this;
        this.spinnerService.loading('orders', this.Orders.get({ orderId: this.$stateParams.orderId }).$promise.then(function (result) {
            _this.order = result;
        }));
    };
    OrdersController.prototype.openOrderHistoryDialog = function () {
        var _this = this;
        var modalInstance = this.$uibModal.open({
            animation: true,
            templateUrl: '/modules/orders/views/order-history.client.view.html',
            controller: 'OrderHistoryController as modal',
            size: 'md',
            resolve: {
                order: function () {
                    return _this.order;
                }
            }
        });
    };
    OrdersController.controllerId = 'OrdersController';
    OrdersController.$inject = ['$scope', '$stateParams', '$location', 'Authentication', 'Orders', 'spinnerService', '$uibModal'];
    return OrdersController;
}());
angular.module('orders').controller(OrdersController.controllerId, OrdersController);

'use strict';
var CreateOrdersController = (function () {
    function CreateOrdersController($scope, $stateParams, $location, Authentication, Orders, Mangaitems) {
        this.$scope = $scope;
        this.$stateParams = $stateParams;
        this.$location = $location;
        this.Authentication = Authentication;
        this.Orders = Orders;
        this.Mangaitems = Mangaitems;
        this.order = {};
        this.orderCopy = {
            series: '',
            nextVolume: {
                volume: 0,
                rrp: 0,
                prices: []
            },
            rrp: 0,
            orderHistory: []
        };
        this.authentication = this.Authentication;
        this.stepConfig = {
            stepHeaders: [
                { text: '' },
                { text: '' }
            ],
            currentStep: 1,
            stepCount: 1,
            items: []
        };
        this.init();
        this.findOne();
    }
    CreateOrdersController.prototype.init = function () {
        if (this.$stateParams.orderId !== undefined) {
            console.log('edit mode');
            this.findOne();
        }
        else {
            console.log('create mode');
            this.Mangaitems.query().$promise.then(function (result) {
                self.stepConfig.items = result;
                console.log('items: ', result);
            });
        }
        console.log('init done.');
    };
    CreateOrdersController.prototype.create = function () {
        var order = new this.Orders({
            series: this.order.series,
            nextVolume: {
                volume: this.order.nextVolume.volume,
                rrp: this.order.nextVolume.rrp,
                prices: this.order.nextVolume.prices
            },
            rrp: this.order.rrp,
            orderHistory: this.order.orderHistory
        });
        order.$save(function (response) {
            this.$location.path('orders/' + response._id);
            angular.copy(this.orderCopy, this.order);
        }, function (errorResponse) {
            this.error = errorResponse.data.message;
        });
    };
    CreateOrdersController.prototype.update = function () {
        var order = this.order;
        order.$update(function () {
            this.$location.path('orders/' + order._id);
        }, function (errorResponse) {
            this.error = errorResponse.data.message;
        });
    };
    CreateOrdersController.prototype.findOne = function () {
        this.Orders.get({ orderId: this.$stateParams.orderId }).$promise.then(function (result) {
            this.order = result;
            console.log('found one: ', result);
        });
    };
    CreateOrdersController.controllerId = 'CreateOrdersController';
    CreateOrdersController.self = this;
    CreateOrdersController.$inject = ['$scope', '$stateParams', '$location', 'Authentication', 'Orders', 'Mangaitems'];
    return CreateOrdersController;
}());
angular.module('orders').controller(CreateOrdersController.controllerId, CreateOrdersController);

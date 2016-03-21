'use strict';
var CreateOrdersController = (function () {
    function CreateOrdersController($scope, $stateParams, $location, Authentication, Orders, Mangaitems) {
        this.$scope = $scope;
        this.$stateParams = $stateParams;
        this.$location = $location;
        this.Authentication = Authentication;
        this.Orders = Orders;
        this.Mangaitems = Mangaitems;
        this.isCreateMode = this.$stateParams.orderId === undefined;
        this.order = {};
        this.orderCopy = {
            series: '',
            nextVolume: {
                volume: 1,
                rrp: 0.00,
                prices: []
            },
            rrp: 0.00,
            orderHistory: []
        };
        this.authentication = this.Authentication;
        this.stepConfig = {
            stepHeaders: [
                { text: 'Set next order' },
                { text: 'Set prices' }
            ],
            currentStep: 1,
            stepCount: 2,
            items: []
        };
        this.init();
        this.findOne();
    }
    CreateOrdersController.prototype.init = function () {
        var _this = this;
        angular.copy(this.orderCopy, this.order);
        if (this.isCreateMode) {
            console.log('create mode');
            this.Mangaitems.query().$promise.then(function (result) {
                _this.stepConfig.items = result;
                console.log('items: ', result);
            });
        }
        else {
            console.log('edit mode');
            this.findOne();
        }
        console.log('init done: ');
    };
    CreateOrdersController.prototype.takeStep = function (step, direction) {
        console.log('stepping: ', step, direction);
        this.stepConfig.currentStep = (direction) ? step + 1 : step - 1;
    };
    CreateOrdersController.prototype.create = function () {
        var order = new this.Orders({
            series: this.order.series._id,
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
    CreateOrdersController.$inject = ['$scope', '$stateParams', '$location', 'Authentication', 'Orders', 'Mangaitems'];
    return CreateOrdersController;
}());
angular.module('orders').controller(CreateOrdersController.controllerId, CreateOrdersController);

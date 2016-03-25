'use strict';
var CompleteOrdersController = (function () {
    function CompleteOrdersController($scope, $uibModalInstance, order) {
        this.$scope = $scope;
        this.$uibModalInstance = $uibModalInstance;
        this.order = order;
        this.newPrice = {
            company: '',
            price: null
        };
    }
    CompleteOrdersController.prototype.editOrder = function (index) {
        var item = this.order.nextVolume.prices[index];
        this.newPrice.company = item.company;
        this.newPrice.price = item.price;
        this.order.nextVolume.prices.splice(index, 1);
    };
    CompleteOrdersController.prototype.completeOrder = function () {
        this.order.nextVolume.prices.push({ company: this.newPrice.company, price: this.newPrice.price, rrp: this.order.rrp, paid: true });
        this.$uibModalInstance.close(this.order);
    };
    CompleteOrdersController.prototype.cancel = function () {
        this.$uibModalInstance.dismiss('cancel');
    };
    CompleteOrdersController.controllerId = 'CompleteOrdersController';
    CompleteOrdersController.$inject = ['$scope', '$uibModalInstance', 'order'];
    return CompleteOrdersController;
}());
angular.module('orders').controller(CompleteOrdersController.controllerId, CompleteOrdersController);

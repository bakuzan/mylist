'use strict';
var OrderHistoryController = (function () {
    function OrderHistoryController($scope, $uibModalInstance, order, $filter) {
        this.$scope = $scope;
        this.$uibModalInstance = $uibModalInstance;
        this.order = order;
        this.$filter = $filter;
    }
    OrderHistoryController.prototype.amountPaid = function (prices) {
        var _this = this;
        angular.forEach(prices, function (price) {
            console.log(price, price.paid);
            if (price.paid) {
                var cost = _this.$filter('number')(price.price, 2);
                cost = _this.$filter('currency')(price.price, '£');
                return cost;
            }
        });
    };
    OrderHistoryController.prototype.cancel = function () {
        this.$uibModalInstance.dismiss('cancel');
    };
    OrderHistoryController.controllerId = 'OrderHistoryController';
    OrderHistoryController.$inject = ['$scope', '$uibModalInstance', 'order', '$filter'];
    return OrderHistoryController;
}());
angular.module('orders').controller(OrderHistoryController.controllerId, OrderHistoryController);

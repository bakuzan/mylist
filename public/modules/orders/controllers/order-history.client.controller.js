'use strict';
var OrderHistoryController = (function () {
    function OrderHistoryController($scope, $uibModalInstance, order, $filter) {
        this.$scope = $scope;
        this.$uibModalInstance = $uibModalInstance;
        this.order = order;
        this.$filter = $filter;
        this.processHistory();
    }
    OrderHistoryController.prototype.processHistory = function () {
        var _this = this;
        angular.forEach(this.order.orderHistory, function (item) {
            console.log('order history: ', item);
            var len = item.prices.length;
            for (var i = 0; i < len; i++) {
                if (item.prices[i].paid) {
                    var cost = _this.$filter('number')(item.prices[i].price, 2), rrp = _this.$filter('number')(item.prices[i].rrp, 2);
                    item.purchaseDate = item.prices[i].date;
                    item.paid = cost;
                    item.rrpInstance = rrp;
                    item.saving = ((cost / rrp) * 100).toFixed(2);
                }
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

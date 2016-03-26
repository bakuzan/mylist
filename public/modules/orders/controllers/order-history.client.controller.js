'use strict';
var OrderHistoryController = (function () {
    function OrderHistoryController($scope, $uibModalInstance, order) {
        this.$scope = $scope;
        this.$uibModalInstance = $uibModalInstance;
        this.order = order;
    }
    OrderHistoryController.prototype.cancel = function () {
        this.$uibModalInstance.dismiss('cancel');
    };
    OrderHistoryController.controllerId = 'OrderHistoryController';
    OrderHistoryController.$inject = ['$scope', '$uibModalInstance', 'order'];
    return OrderHistoryController;
}());
angular.module('orders').controller(OrderHistoryController.controllerId, OrderHistoryController);

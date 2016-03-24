'use strict';
var CompleteOrdersController = (function () {
    function CompleteOrdersController($scope, $uibModalInstance, order) {
        this.$scope = $scope;
        this.$uibModalInstance = $uibModalInstance;
        this.order = order;
        this.init();
    }
    CompleteOrdersController.prototype.init = function () {
        console.log('init: ');
    };
    CompleteOrdersController.prototype.cancel = function () {
        this.$uibModalInstance.dismiss('cancel');
    };
    CompleteOrdersController.controllerId = 'CompleteOrdersController';
    CompleteOrdersController.$inject = ['$scope', '$uibModalInstance', 'order'];
    return CompleteOrdersController;
}());
angular.module('orders').controller(CompleteOrdersController.controllerId, CompleteOrdersController);

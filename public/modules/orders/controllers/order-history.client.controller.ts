'use strict';

interface IOrderHistoryController {
	cancel: () => void;
}
// Order history controller
class OrderHistoryController implements IOrderHistoryController {
  static controllerId = 'OrderHistoryController';

  static $inject = ['$scope','$uibModalInstance','order'];

  constructor(private $scope, private $uibModalInstance, private order) {
  }

  cancel(): void {
    this.$uibModalInstance.dismiss('cancel');
  }
	
}
//Register controller.
angular.module('orders').controller(OrderHistoryController.controllerId, OrderHistoryController);

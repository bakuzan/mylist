'use strict';

interface ICompleteOrdersController {
	cancel: () => void;
}
// CU Orders controller
class CompleteOrdersController implements ICompleteOrdersController {
  static controllerId = 'CompleteOrdersController';
  static $inject = ['$scope','$uibModalInstance','order'];

  constructor(private $scope, private $uibModalInstance, private order) {
    this.init();
  }

  init(): void {
    console.log('init: ');
  }

  cancel(): void {
    this.$uibModalInstance.dismiss('cancel');
  }
}
//Register controller.
angular.module('orders').controller(CompleteOrdersController.controllerId, CompleteOrdersController);

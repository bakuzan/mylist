'use strict';

interface IOrderHistoryController {
	amountPaid: (prices: Array<any>) => void;
	cancel: () => void;
}
// Order history controller
class OrderHistoryController implements IOrderHistoryController {
  static controllerId = 'OrderHistoryController';

  static $inject = ['$scope','$uibModalInstance','order', '$filter'];

  constructor(private $scope, private $uibModalInstance, private order, private $filter) {
  }

	amountPaid(prices: Array<any>): void {
		angular.forEach(prices, (price) => {
			console.log(price, price.paid);
			if(price.paid) {
				var cost = this.$filter('number')(price.price, 2);
				cost = this.$filter('currency')(price.price, '£');
				return cost;
			}
		});
	}

  cancel(): void {
    this.$uibModalInstance.dismiss('cancel');
  }

}
//Register controller.
angular.module('orders').controller(OrderHistoryController.controllerId, OrderHistoryController);

'use strict';

interface IOrderHistoryController {
	cancel: () => void;
}
// Order history controller
class OrderHistoryController implements IOrderHistoryController {
  static controllerId = 'OrderHistoryController';

  static $inject = ['$scope','$uibModalInstance','order', '$filter'];

  constructor(private $scope, private $uibModalInstance, private order, private $filter) {
		this.processHistory();
  }

	processHistory(): void {
		angular.forEach(this.order.orderHistory, (item) => {
			console.log('order history: ', item);
			var len = item.prices.length;
			for(var i = 0; i < len; i++) {
				if(item.prices[i].paid) {
					var cost = this.$filter('number')(item.prices[i].price, 2),
							rrp = this.$filter('number')(item.prices[i].rrp, 2);
					item.purchaseDate = item.prices[i].date;
					item.paid = cost;
					item.rrpInstance = rrp;
					item.saving = ((cost / rrp) * 100).toFixed(2);
				}
			}
		});
	}

  cancel(): void {
    this.$uibModalInstance.dismiss('cancel');
  }

}
//Register controller.
angular.module('orders').controller(OrderHistoryController.controllerId, OrderHistoryController);

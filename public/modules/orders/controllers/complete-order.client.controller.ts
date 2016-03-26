'use strict';

interface ICompleteOrdersController {
	editOrder: (index: number) => void;
	completeOrder: () => void;
	cancel: () => void;
}
// CU Orders controller
class CompleteOrdersController implements ICompleteOrdersController {
  static controllerId = 'CompleteOrdersController';
	newPrice: any = {
		company: '',
		price: null
	};

  static $inject = ['$scope','$uibModalInstance','order'];

  constructor(private $scope, private $uibModalInstance, private order) {
  }

	editOrder(index: number): void {
		var item: OrderSchema = this.order.nextVolume.prices[index];
		this.newPrice.company = item.company;
		this.newPrice.price = item.price;
		this.order.nextVolume.prices.splice(index, 1);
	}

	completeOrder(): void {
		this.order.nextVolume.prices.push({ company: this.newPrice.company, date: Date.now(), price: this.newPrice.price, rrp: this.order.rrp, paid: true });
		this.$uibModalInstance.close(this.order);
	}

  cancel(): void {
    this.$uibModalInstance.dismiss('cancel');
  }
}
//Register controller.
angular.module('orders').controller(CompleteOrdersController.controllerId, CompleteOrdersController);

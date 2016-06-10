(function() {
  'use strict';

  angular.module('tasks').controller('ViewHistoryController', ViewHistoryController);
  ViewHistoryController.$inject =  ['$scope', 'data', '$stateParams', 'Authentication', 'ItemService', 'NotificationFactory', 'spinnerService', '$uibModalInstance'];

function ViewHistoryController($scope, data, $stateParams, Authentication, ItemService, NotificationFactory, spinnerService, $uibModalInstance) {
  var ctrl = this;

  ctrl.cancel = cancel;
  ctrl.deleteHistory = deleteHistory;
  ctrl.updated = false;
  ctrl.viewItem = data.viewItem;


  function deleteHistory(item, history) {
      //are you sure option...
      NotificationFactory.confirmation(function() {
          ctrl.viewItem = ItemService.deleteHistory(item, history);
          ctrl.updated = true;
      });
  }

  function cancel() {
    $uibModalInstance.close(ctrl.updated);
  }

}

})();

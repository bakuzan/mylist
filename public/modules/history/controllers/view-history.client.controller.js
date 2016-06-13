(function() {
  'use strict';

  angular.module('tasks').controller('ViewHistoryController', ViewHistoryController);
  ViewHistoryController.$inject =  ['$scope', 'data', '$stateParams', 'Authentication', 'ItemService', 'NotificationFactory', 'spinnerService', '$uibModalInstance'];

function ViewHistoryController($scope, data, $stateParams, Authentication, ItemService, NotificationFactory, spinnerService, $uibModalInstance) {
  var ctrl = this,
      historyStore = [];

  ctrl.cancel = cancel;
  ctrl.deleteHistory = deleteHistory;
  ctrl.submit = submit;
  ctrl.updated = false;
  ctrl.viewItem = data.viewItem;

  function deleteHistory(item, history) {
      //are you sure option...
      NotificationFactory.confirmation(function() {
        if(historyStore.length === 0) {
          historyStore = ctrl.viewItem.meta.history;
        }
        ctrl.viewItem = ItemService.deleteHistory(item, history);
        ctrl.updated = true;
      });
  }

  function submit() {
    $uibModalInstance.close(ctrl.updated);
  }

  function cancel() {
    if(ctrl.updated) {
      ctrl.viewItem.meta.history = historyStore;
    }
    $uibModalInstance.dismiss();
  }

}

})();

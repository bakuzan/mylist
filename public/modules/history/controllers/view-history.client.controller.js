(function() {
  'use strict';

  angular.module('tasks').controller('ViewHistoryController', ViewHistoryController);
  ViewHistoryController.$inject =  ['$scope', '$stateParams', 'Authentication', 'ItemService', 'NotificationFactory', 'spinnerService', '$mdDialog'];

function ViewHistoryController($scope, $stateParams, Authentication, ItemService, NotificationFactory, spinnerService, $mdDialog) {
  var ctrl = this,
      historyStore = [];

  ctrl.cancel = cancel;
  ctrl.deleteHistory = deleteHistory;
  ctrl.submit = submit;
  ctrl.updated = false;

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
    $mdDialog.hide(ctrl.updated);
  }

  function cancel() {
    if(ctrl.updated) {
      ctrl.viewItem.meta.history = historyStore;
    }
    $mdDialog.cancel();
  }

}

})();

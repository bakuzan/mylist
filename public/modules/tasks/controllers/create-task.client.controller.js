(function() {
  'use strict';

  angular.module('tasks').controller('CreateTaskController', CreateTaskController);
  CreateTaskController.$inject =  ['$scope', 'data', '$stateParams', '$location', 'Authentication', 'Tasks', 'ListService', 'NotificationFactory', 'TaskFactory', 'spinnerService', '$uibModalInstance', 'Animeitems', 'Mangaitems'];

function CreateTaskController($scope, data, $stateParams, $location, Authentication, Tasks, ListService, NotificationFactory, TaskFactory, spinnerService, $uibModalInstance, Animeitems, Mangaitems) {
  var ctrl = this,
      newTaskModel = {};
  ctrl.commonArrays = data.commonArrays;
  
  function setNewTask() {
      ctrl.newTask = {
          description: '',
          link: {
              linked: false,
              type: '',
              anime: undefined,
              manga: undefined
          },
          day: '',
          date: new Date(),
          repeat: 0,
          category: '',
          daily: false,
          checklist: false,
          checklistItems: [],
          isAddTask: false
      };
  }
  setNewTask();
  angular.copy(ctrl.newTask, newTaskModel);
  ctrl.stepConfig = {
      currentStep: 1,
      stepCount: 2
  };

  //for adding/removing options.
  ctrl.addChecklistItem = function () {
          if (ctrl.newTask.checklistItem!=='' && ctrl.newTask.checklistItem!==undefined) {
              var i = 0;
              var alreadyAdded = false;
              if (ctrl.newTask.checklistItems.length > 0) {
                  while(i < ctrl.newTask.checklistItems.length) {
                      if (ctrl.newTask.checklistItems[i].text === ctrl.newTask.checklistItem) {
                          alreadyAdded = true;
                      }
                      i++;
                  }
                  //if not in array add it.
                  if (alreadyAdded === false) {
                      ctrl.newTask.checklistItems.push({ text: ctrl.newTask.checklistItem, complete: false });
                  }
              } else {
                  ctrl.newTask.checklistItems.push({ text: ctrl.newTask.checklistItem, complete: false });
              }
          }
          ctrl.newTask.checklistItem = '';
  };
  ctrl.dropChecklistItem = function(text) {
      var deletingItem = ctrl.newTask.checklistItems;
      ctrl.newTask.checklistItems = [];
      //update the task.
      angular.forEach(deletingItem, function(item) {
          if (item.text !== text) {
              ctrl.newTask.checklistItems.push(item);
          }
      });
  };

  ctrl.backStep = function(step) {
      ctrl.stepConfig.currentStep -= 1;
  };
  ctrl.takeStep = function(step) {
      var check = process(step);
      if (check.valid) {
          ctrl.stepConfig.currentStep += 1;
      } else {
          NotificationFactory.popup('Attention!', check.message, 'warning');
      }
  };
  ctrl.submit = function() {
    $uibModalInstance.close(ctrl.newTask);
  };
  ctrl.cancel = function() {
    $uibModalInstance.dismiss();
  };

  function process(step) {
      switch(step) {
          case 1:
              if (ctrl.newTask.link.linked === true) {
                  var category = ctrl.newTask.category;
                  if (category === 'Watch') {
                      ctrl.linkItems = Animeitems.query({
                          status: 0
                      });
                      ctrl.linkType = 'anime';
                      ctrl.newTask.checklistItems = [];
                      ctrl.newTask.checklist = false;
                  } else if (category === 'Read') {
                      ctrl.linkItems = Mangaitems.query({
                          status: 0
                      });
                      ctrl.linkType = 'manga';
                  } else {
                      return { valid: false, message: 'Category must be either Watch or Read for linked items!' };
                  }
              } else {
                  //Ensure that stuff is cleared when not linked.
                  ctrl.linkType = '';
                  ctrl.newTask.link.anime = undefined;
                  ctrl.newTask.link.manga = undefined;
              }
              return { valid: true };
      }
  }
}

})();

(function() {
  'use strict';

  angular.module('tasks').controller('CreateTaskController', CreateTaskController);
  CreateTaskController.$inject =  ['$scope', '$stateParams', '$location', 'Authentication', 'Tasks', 'ListService', 'NotificationFactory', 'TaskFactory', 'spinnerService', '$mdDialog', 'Animeitems', 'Mangaitems'];

function CreateTaskController($scope, $stateParams, $location, Authentication, Tasks, ListService, NotificationFactory, TaskFactory, spinnerService, $mdDialog, Animeitems, Mangaitems) {
  var ctrl = this,
      newTaskModel = {};
      console.log('create task: ', ctrl.commonArrays);
  ctrl.addChecklistItem = addChecklistItem;
  ctrl.backStep = backStep;
  ctrl.cancel = cancel;
  ctrl.create = create;
  ctrl.dropChecklistItem = dropChecklistItem;
  ctrl.stepConfig = {
      currentStep: 1,
      cancel: cancel,
      submit: submit,
      takeStep: takeStep,
      backStep: backStep
  };
  ctrl.submit = submit;
  ctrl.takeStep = takeStep;

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


  //for adding/removing options.
  function addChecklistItem() {
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
  }
  function dropChecklistItem(text) {
      var deletingItem = ctrl.newTask.checklistItems;
      ctrl.newTask.checklistItems = [];
      //update the task.
      angular.forEach(deletingItem, function(item) {
          if (item.text !== text) {
              ctrl.newTask.checklistItems.push(item);
          }
      });
  }

  // Create new Task
  function create() {
//            console.log(this.newTask);
    // Create new Task object
    var task = new Tasks ({
        description: ctrl.newTask.description,
        link: {
            linked: ctrl.newTask.link.linked,
            type: (ctrl.newTask.link.linked === false) ? ''      :
                  (ctrl.newTask.category === 'Watch')  ? 'anime' :
                                                         'manga' ,
            anime: ctrl.newTask.link.anime,
            manga: ctrl.newTask.link.manga
        },
        day: ctrl.newTask.daily === true ? 'Any' : ctrl.newTask.day,
        date: ctrl.newTask.date === '' ? new Date() : ctrl.newTask.date,
        repeat: (ctrl.newTask.link.linked === false) ? ctrl.newTask.repeat                     :
                (ctrl.newTask.category === 'Watch')  ? ctrl.newTask.link.anime.finalEpisode    :
                                                       1    ,
        completeTimes: (ctrl.newTask.link.linked === false) ? 0                                     :
                       (ctrl.newTask.category === 'Watch')  ? ctrl.newTask.link.anime.episodes      :
                                                              0      ,
        updateCheck: new Date().getDay() === 1 ? true : false,
        complete: false,
        category: ctrl.newTask.category === '' ? 'Other' : ctrl.newTask.category,
        daily: ctrl.newTask.daily,
        checklist: ctrl.newTask.checklist,
        checklistItems: ctrl.newTask.checklistItems
    });
//			// Redirect after save
    task.$save(function(response) {
      $location.path('tasks');
      NotificationFactory.success('Saved!', 'New Task was successfully saved!');
    }, function(errorResponse) {
      ctrl.error = errorResponse.data.message;
      console.log(errorResponse);
      NotificationFactory.error('Error!', 'New Task failed to save!');
    });
  }

  function backStep(step) {
      ctrl.stepConfig.currentStep -= 1;
  }
  function takeStep(step) {
      var check = process(step);
      if (check.valid) {
          ctrl.stepConfig.currentStep += 1;
      } else {
          NotificationFactory.popup('Attention!', check.message, 'warning');
      }
  }
  function submit() {
    ctrl.create();
    $mdDialog.hide('created');
  }
  function cancel() {
    $mdDialog.cancel();
  }

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

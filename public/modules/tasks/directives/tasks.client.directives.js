'use strict';

angular.module('tasks')
.directive('taskCreate', ['ListService', function (ListService) {
    return {
        restrict: 'A',
        replace: true,
        scope: {
            create: '='
        },
        templateUrl: '/modules/tasks/views/create-task.client.view.html',
        link: function (scope, element, attrs) {
            scope.newTask = scope.create;
            scope.commonArrays = ListService.getCommonArrays();
            
            scope.newTask.checklistArray = [];
            //for adding/removing options.
            scope.addChecklistItem = function () {
                    if (scope.newTask.checklistItem!=='' && scope.newTask.checklistItem!==undefined) {
                        var i = 0;
                        var alreadyAdded = false;
                        if (scope.newTask.checklistArray.length > 0) {
                            while(i < scope.newTask.checklistArray.length) {
                                if (scope.newTask.checklistArray[i].text === scope.newTask.checklistItem) {
                                    alreadyAdded = true;
                                }
                                i++;
                            }
                            //if not in array add it.
                            if (alreadyAdded === false) {
                                scope.newTask.checklistArray.push({ text: scope.newTask.checklistItem, complete: false });
                            }
                        } else {
                            scope.newTask.checklistArray.push({ text: scope.newTask.checklistItem, complete: false });
                        }
                    }
                    scope.newTask.checklistItem = '';
            };
            scope.dropChecklistItem = function(text) {
                var deletingItem = scope.newTask.checklistArray;
                scope.newTask.checklistArray = [];
                //update the task.
                angular.forEach(deletingItem, function(item) {
                    if (item.text !== text) {
                        scope.newTask.checklistArray.push(item);
                    }
                });
            };

            
        }
    };
}]);
'use strict';

angular.module('tasks')
.directive('taskCreate', ['ListService', 'NotificationFactory', 'Animeitems', 'Mangaitems', function (ListService, NotificationFactory, Animeitems, Mangaitems) {
    return {
        restrict: 'A',
        replace: true,
        scope: {
            create: '='
        },
        templateUrl: '/modules/tasks/views/create-task.client.view.html',
        link: function (scope, element, attrs) {
            var newTaskModel = {};
            scope.newTask = scope.create;
            angular.copy(scope.newTask, newTaskModel);
            scope.stepConfig = {
                currentStep: 1,
                stepCount: 2
            };
            
            //for adding/removing options.
            scope.addChecklistItem = function () {
                    if (scope.newTask.checklistItem!=='' && scope.newTask.checklistItem!==undefined) {
                        var i = 0;
                        var alreadyAdded = false;
                        if (scope.newTask.checklistItems.length > 0) {
                            while(i < scope.newTask.checklistItems.length) {
                                if (scope.newTask.checklistItems[i].text === scope.newTask.checklistItem) {
                                    alreadyAdded = true;
                                }
                                i++;
                            }
                            //if not in array add it.
                            if (alreadyAdded === false) {
                                scope.newTask.checklistItems.push({ text: scope.newTask.checklistItem, complete: false });
                            }
                        } else {
                            scope.newTask.checklistItems.push({ text: scope.newTask.checklistItem, complete: false });
                        }
                    }
                    scope.newTask.checklistItem = '';
            };
            scope.dropChecklistItem = function(text) {
                var deletingItem = scope.newTask.checklistItems;
                scope.newTask.checklistItems = [];
                //update the task.
                angular.forEach(deletingItem, function(item) {
                    if (item.text !== text) {
                        scope.newTask.checklistItems.push(item);
                    }
                });
            };
            
            scope.backStep = function(step) {
                scope.stepConfig.currentStep -= 1;
            };
            scope.takeStep = function(step) {
                var check = process(step);
                if (check.valid) {
                    scope.stepConfig.currentStep += 1;
                } else {
                    NotificationFactory.popup('Attention!', check.message, 'warning');
                }
            };
            scope.cancel = function() {
                scope.stepConfig.currentStep = 1;
                angular.copy(newTaskModel, scope.newTask);
                scope.scheduleForm.$setPristine();
            };
            
            function process(step) {
                switch(step) {
                    case 1:
                        if (scope.newTask.link.linked === true) {
                            var category = scope.newTask.category;
                            if (category === 'Watch') {
                                scope.linkItems = Animeitems.query({
                                    status: 0
                                });
                                scope.linkType = 'anime';
                                scope.newTask.checklistItems = [];
                                scope.newTask.checklist = false;
                            } else if (category === 'Read') {
                                scope.linkItems = Mangaitems.query({
                                    status: 0
                                });
                                scope.linkType = 'manga';
                            } else {
                                return { valid: false, message: 'Category must be either Watch or Read for linked items!' };
                            }
                        } else {
                            //Ensure that stuff is cleared when not linked.
                            scope.linkType = '';
                            scope.newTask.link.anime = undefined;
                            scope.newTask.link.manga = undefined;
                        }
                        return { valid: true };
                }
            }
            
        }
    };
}])
.directive('taskMangaUpdate', function() {
    return {
        restrict: 'A',
        replace: true,
        scope: {
            item: '=',
            mangaUpdate: '='
        },
        templateUrl: '/modules/tasks/views/update-manga-task.client.view.html',
        link: function (scope, element, attrs) {
            var mangaUpdateFunction = (scope.item.link.linked);
            scope.stepConfig = {
                currentStep: 1,
                stepCount: 1
            };
            
            scope.updateManga = function(item) {
                if (mangaUpdateFunction) {
                    scope.$parent.tickOffChecklist(item);
                } else {
                    scope.$parent.tickOff(item);
                }
            };
            
            scope.cancel = function() {
                scope.mangaForm.$setPristine();
                scope.mangaUpdate.isPopup = '';
            };
            
        }
    };
})
.directive('loseInterest', function ($document, $window) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.data('interesting', true);
            /** On click, check what you clicked and whether you can ignore it.
             *    Based on checks false the ng-show of the anywhere-but-here element.
             */
            angular.element($document[0].body).on('click', function (e) {
                var interesting = angular.element(e.target).inheritedData('interesting'),
                    elm = angular.element(e.target)[0].tagName,
                    alsoInteresting = (elm === 'A') || (elm === 'I');
//console.log(elm);
                if (!interesting && !alsoInteresting) {
                    scope.$apply(function () {
                        scope.collapseFilters();
                    });
                }
            });
        }
    };
});
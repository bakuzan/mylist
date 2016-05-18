'use strict';

angular.module('tasks')
.directive('taskCreate', ['ListService', 'NotificationFactory', 'Animeitems', 'Mangaitems', function (ListService, NotificationFactory, Animeitems, Mangaitems) {
    return {
        restrict: 'A',
        replace: true,
        templateUrl: '/modules/tasks/views/create-task.client.view.html',
        link: function (scope, element, attrs) {
            var newTaskModel = {};
            function setNewTask() {
                scope.newTask = {
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
.directive('shadowModel', function() {
  return {
    scope: true,
    link: function(scope, el, att) {
      console.log('shadow: ', scope);
      scope[att.shadow] = angular.copy(scope[att.shadow]);
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
})
.directive('scheduleCalendar', ['$uibModal', 'moment', 'ListService', function($uibModal, moment, ListService) {

  function _removeTime(date) {
    return date.day(1).hour(12).minute(0).second(0).millisecond(0);
  }

  function _buildMonth(scope, start, month) {
       scope.weeks = [];
       var done = false, date = moment(start), monthIndex = date.month(), count = 0;
       while (!done) {
         var days = _buildWeek(moment(date), month);
         if(ListService.findWithAttr(days, 'isCurrentMonth', true) > -1) {
           scope.weeks.push({ days: days });
         }
           date.add(1, 'w');
           done = count++ > 2 && monthIndex !== date.month();
           monthIndex = date.month();
       }
   }

   function _buildWeek(date, month) {
       var days = [];
       for (var i = 0; i < 7; i++) {
           days.push({
               name: date.format('dd').substring(0, 1),
               number: date.date(),
               isCurrentMonth: date.month() === month.month(),
               isToday: date.isSame(new Date(), 'day'),
               date: date
           });
           date = moment(date);
           date.add(1, 'd');
       }
       return days;
   }

   function _displayEvents(events, date, days) {
     var modalInstance = $uibModal.open({
       animation: true,
       templateUrl: '/modules/tasks/views/schedule-calendar-task.client.view.html',
       controller: 'ScheduleCalendarTaskController as ctrl',
       size: 'lg',
       resolve: {
         data: function () {
           return { events: events, date: date, days: days };
         }
       }
     }).result.then(function(result) {
       console.log('closed: ', result);
     });
   }

  return {
       restrict: 'A',
       templateUrl: 'modules/tasks/templates/schedule-calendar.html',
       scope: {
         events: '='
       },
       link: function(scope) {
           scope.days = [{ text: 'Mon' }, { text: 'Tue' }, { text: 'Wed' }, { text: 'Thu' }, { text: 'Fri' }, { text: 'Sat' }, { text: 'Sun' }];
           scope.selected = moment(new Date());
           scope.month = moment(scope.selected);

           var start = moment(_removeTime(angular.copy(scope.selected)));
           start.date(-6);
           _removeTime(start.day(0));

           _buildMonth(scope, start, scope.month);

           scope.select = function(day) {
             if(scope.selected === day.date){
               _displayEvents(scope.events, day.date, scope.days);
             }
             scope.selected = day.date;
           };

           scope.next = function() {
               var next = moment(scope.month);
               _removeTime(next.month(next.month()+1).date(0));
               scope.month.month(scope.month.month()+1);
               _buildMonth(scope, next, scope.month);
           };

           scope.previous = function() {
               var previous = moment(scope.month);
               _removeTime(previous.month(previous.month()-1).date(0));
               scope.month.month(scope.month.month()-1);
               _buildMonth(scope, previous, scope.month);
           };
       }
   };
}])
.directive('taskItemModel', function() {
  return {
    restrict: 'A',
    replace: true,
    templateUrl: 'modules/tasks/templates/task-item.html'
  };
});

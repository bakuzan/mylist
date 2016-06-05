'use strict';

angular.module('tasks')
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
       console.log('closed - require refresh: ', result);
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
})
.directive('passClick', function() {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      element.bind('click', function(event) {
        var passTo = document.getElementById(attrs.passClick);
        passTo.focus();
        passTo.click();
      });
    }
  };
});

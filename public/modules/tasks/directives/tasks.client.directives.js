'use strict';

angular.module('task')
.directive('taskCreate', function () {
    return {
        restrict: 'A',
        replace: true,
        scope: {
        },
        templateUrl: '/modules/tasks/views/create-task.client.view.html',
        link: function (scope, element, attrs) {
            
        }
    };
});
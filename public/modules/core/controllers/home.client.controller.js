'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication', '$window',
	function($scope, Authentication, $window) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
        
    $scope.today = new Date();
    $scope.datesSelected = 'current';
    $scope.saved = localStorage.getItem('taskItems');
    $scope.taskItem = (localStorage.getItem('taskItems')!==null) ? 
    JSON.parse($scope.saved) : [ {description: 'Why not add a task?', date: $scope.today, complete: false}];
    localStorage.setItem('taskItems', JSON.stringify($scope.taskItem));
    
    $scope.newTask = null;
    $scope.newTaskDate = null;
    $scope.categories = [
        {name: 'Watch'},
        {name: 'Read'},
        {name: 'Play'},
        {name: 'Other'}
    ];
    $scope.newTaskCategory = $scope.categories;
    $scope.days = [
        {name: 'Any'},
        {name: 'Monday'},
        {name: 'Tuesday'},
        {name: 'Wednesday'},
        {name: 'Thursday'},
        {name: 'Friday'},
        {name: 'Saturday'},
        {name: 'Sunday'}
    ];
    $scope.newTaskDay = $scope.days;
    
    //special day filter
    $scope.dayFilter = function(item) {
        var ds = $scope.daySelected;
        if (ds==='1' && item.day==='Monday') {
                return item;
        } else if (ds==='2' && item.day==='Tuesday') {
                return item;
        } else if (ds==='3' && item.day==='Wednesday') {
                return item;
        } else if (ds==='4' && item.day==='Thursday') {
                return item;
        } else if (ds==='5' && item.day==='Friday') {
                return item;
        } else if (ds==='6' && item.day==='Saturday') {
                return item;
        } else if (ds==='0' && item.day==='Sunday') {
                return item;
        } else if (ds==='' || ds===null || ds===undefined) {
                return item;
        } else if (item.day==='Any') {
                return item;
        }
    };
        
    //date filter
    $scope.dateFilter = function(item) {
        if (item.date!==null || item.date!==undefined) {
            if ($scope.datesSelected==='current') {
                return item;
            }
            return false;
        }
            var day = item.date.getDay(),
            diff = item.date.getDate() - day + (day === 0 ? -6:1);
            var temp = new Date();
            var wkBeg = new Date(temp.setDate(diff));
        
        if ($scope.datesSelected==='current') {
            if (wkBeg <= $scope.weekBeginning || item.date===null || item.date===undefined) {
                return item;
            }
        } else if ($scope.datesSelected==='future') {
            if (wkBeg > $scope.weekBeginning) {
                return item;
            }
        }
    };
    
    //get monday!
    $scope.weekBeginning = function() {
        var day = $scope.today.getDay(),
        diff = $scope.today.getDate() - day + (day === 0 ? -6:1); // adjust when day is sunday
        var wkBeg = new Date();
        return new Date(wkBeg.setDate(diff));
    };
        
    //check things
    $scope.checkStatus = function() {
        //var day = new Date('2015-05-04').getDay();
        var day = $scope.today.getDay();
        console.log(day);
        console.log($scope.taskItem);
        //Is it monday?
        if (day===1) {
            var refreshItems = $scope.taskItem;
            $scope.taskItem = [];
            angular.forEach(refreshItems, function (taskItem) {
                    //has it been updated today?
                    if(taskItem.updated===false) {
                        //has it reached the necessary number of repeats?
                        if(taskItem.completeTimes!==taskItem.repeat) {
                            taskItem.complete = false;
                            taskItem.updated = true;
                            $scope.taskItem.push(taskItem);
                            console.log('updated set to true');
                        }
                    } else {
                        $scope.taskItem.push(taskItem);
                        console.log('updated already true');
                    }
            });
            localStorage.setItem('taskItems', JSON.stringify($scope.taskItem)); 
        
        } else {
            var updated = $scope.taskItem;
            $scope.taskItem = [];
            angular.forEach(updated, function (taskItem) {
                    taskItem.updated = false;
                    //is it a daily task?
                    if (taskItem.daily===true) {
                        //has it reached the necessary number of repeats?
                        if(taskItem.completeTimes!==taskItem.repeat) {
                            var today = $scope.today.getDate();
                            //has it been refreshed today?
                            if (taskItem.dailyRefresh!==today) {
                                taskItem.complete = false;
                                taskItem.dailyRefresh = today;
                                $scope.taskItem.push(taskItem);
                            } else { 
                                //already refreshed today.
                                $scope.taskItem.push(taskItem);
                            }
                        } else {
                            //daily task completed, keep pushing - monday will kill it.
                            $scope.taskItem.push(taskItem);
                        }
                    } else {
                        //not daily task, so push.
                        $scope.taskItem.push(taskItem);
                    }
                });
            console.log('updated set to false');
            localStorage.setItem('taskItems', JSON.stringify($scope.taskItem));
        }
        
    };
        
    $scope.addNew = function () {
        //console.log($scope.newTaskDay.name);
        if ($scope.newTaskDay.name === null || $scope.newTaskDay.name === '' || $scope.newTaskDay.name === undefined) {
            $scope.newTaskDay.name = 'Any';
        }
        if ($scope.newTaskCategory.name === null || $scope.newTaskCategory.name === '' || $scope.newTaskCategory.name === undefined) {
            $scope.newTaskCategory.name = 'Other';
        }
        if ($scope.newTaskDate === null || $scope.newTaskDate === '' || $scope.newTaskDate === undefined) {
            $scope.newTaskDate = new Date($scope.today);
        }
        
        //if created on a monday set updated=true - without this task could be deleted/un-completed by the check status method.
        var day = $scope.today.getDay(); //new Date('2015-05-04').getDay();
        if (day===1) {
            $scope.taskItem.push({
                description: $scope.newTask,
                day: $scope.newTaskDay.name,
                date: $scope.newTaskDate,
                repeat: $scope.newTaskRepeat,
                completeTimes: 0,
                updated: true,
                complete: false,
                category: $scope.newTaskCategory.name,
                daily: $scope.newTaskDaily,
                dailyRefresh: $scope.today.getDate()
            });
        } else {
            $scope.taskItem.push({
                description: $scope.newTask,
                day: $scope.newTaskDay.name,
                date: $scope.newTaskDate,
                repeat: $scope.newTaskRepeat,
                completeTimes: 0,
                updated: false,
                complete: false,
                category: $scope.newTaskCategory.name,
                daily: $scope.newTaskDaily,
                dailyRefresh: $scope.today.getDate()
            });
        }
        $scope.newTask = '';
        $scope.newTaskDay = $scope.days;
        $scope.newTaskDate = $scope.today.getDate();
        $scope.newTaskCategory = $scope.categories;
        $scope.newTaskRepeat = '';
        $scope.newTaskDaily = false;
        localStorage.setItem('taskItems', JSON.stringify($scope.taskItem));
    };
    $scope.deleteTask = function  (description) {
        //are you sure option...
        var removal = $window.confirm('Are you sure you want to delete this task?');
        var deletingItem = $scope.taskItem;
        $scope.taskItem = [];
        if (removal) {
            //update the complete task.
            angular.forEach(deletingItem, function (taskItem) {
                if (taskItem.description !== description) {
                    $scope.taskItem.push(taskItem);
                }
            });
            localStorage.setItem('taskItems', JSON.stringify($scope.taskItem));
        }
    };
    
    $scope.save = function (description) {
        //update the complete task.
        angular.forEach($scope.taskItem, function (taskItem) {
            if (taskItem.description === description && taskItem.complete === true) {
                taskItem.completeTimes += 1;
            }
        });
        localStorage.setItem('taskItems', JSON.stringify($scope.taskItem));
    };
        
    $scope.remaining = function() {
        var count = 0;
        angular.forEach($scope.taskItem, function(taskItem) {
            count += taskItem.complete ? 0 : 1;
        });
        return count;
  };
        
        
	}
]);
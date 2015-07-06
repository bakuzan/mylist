'use strict';


angular.module('core').controller('HomeController', ['$scope', '$rootScope', 'Authentication', '$window', '$location', 'Animeitems', 'Mangaitems', '$filter',
	function($scope, $rootScope, Authentication, $window, $location, Animeitems, Mangaitems, $filter) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
        
        //forces page to scroll top on load.
        $rootScope.$on('$viewContentLoaded', function(){ window.scrollTo(0, 0); });
        
        // If user is not signed in then redirect back to signin.
		if (!$scope.authentication.user) $location.path('/signin');
    
    $scope.isAddTask = false;
        
    $scope.today = new Date();
    $scope.datesSelected = 'current';
    $scope.saved = localStorage.getItem('taskItems');
    $scope.taskItem = (localStorage.getItem('taskItems')!==null) ? 
    JSON.parse($scope.saved) : [ {description: 'Why not add a task?', date: $scope.today.toISOString().substring(0,10), complete: false}];
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
        //console.log(day);
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
//                            console.log('updated set to true');
                        }
                    } else {
                        $scope.taskItem.push(taskItem);
//                        console.log('updated already true');
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
//            console.log('updated set to false');
            localStorage.setItem('taskItems', JSON.stringify($scope.taskItem));
        }
    };
    $scope.optionArray = [];
    //for adding/removing options.
    $scope.addOption = function () {
            if ($scope.newOption!=='' && $scope.newOption!==undefined) {
                var i = 0;
                var alreadyAdded = false;
                if ($scope.optionArray.length > 0) {
                    while(i < $scope.optionArray.length) {
                        if ($scope.optionArray[i].text === $scope.newOption) {
                            alreadyAdded = true;
                        }
                        i++;
                    }
                    //if not in array add it.
                    if (alreadyAdded === false) {
                        $scope.optionArray.push({ text: $scope.newOption, complete: false });
                    }
                } else {
                    $scope.optionArray.push({ text: $scope.newOption, complete: false });
                }
            }
            $scope.newOption = '';
    };
    
    $scope.dropOption = function(text) {
        var removal = $window.confirm('Are you sure you don\'t want to add this option?');
        if (removal) {
            var deletingItem = $scope.optionArray;
            $scope.optionArray = [];
            //update the task.
            angular.forEach(deletingItem, function(item) {
                if (item.text !== text) {
                    $scope.optionArray.push(item);
                }
            });
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
            $scope.newTaskDate = $scope.today.toISOString().substring(0,10); // 'yyyy-MM-dd'
        }
        //not allowed to be tied to a day if a daily task -- daily takes precedence.
        if ($scope.newTaskDaily === true) {
            $scope.newTaskDay.name = 'Any';
        }
        //if is a checklist, cannot be daily and only repeats once.
        if ($scope.newTaskChecklist === true) {
            $scope.newTaskDaily = false;
            $scope.newTaskRepeat = 1;
        }
        
        //if created on a monday set updated=true - without this task could be deleted/un-completed by the check status method.
        var day = $scope.today.getDay(); //new Date('2015-05-04').getDay();
        $scope.taskItem.push({
            description: $scope.newTask,
            day: $scope.newTaskDay.name,
            date: $scope.newTaskDate,
            repeat: $scope.newTaskRepeat,
            completeTimes: 0,
            updated: day === 1 ? true : false,
            complete: false,
            category: $scope.newTaskCategory.name,
            daily: $scope.newTaskDaily,
            dailyRefresh: $scope.today.getDate(),
            checklist: $scope.newTaskChecklist,
            checklistOptions: $scope.optionArray
        });
        $scope.newTask = '';
        $scope.newTaskDay = $scope.days;
        $scope.newTaskDate = '';
        $scope.newTaskCategory = $scope.categories;
        $scope.newTaskRepeat = '';
        $scope.newTaskDaily = false;
        $scope.newTaskChecklist = false;
        $scope.optionArray = [];
        localStorage.setItem('taskItems', JSON.stringify($scope.taskItem));
    };
    $scope.deleteTask = function (description) {
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
        
    $scope.tickOff = function(itemText, optionText) {
        //update the option for the task.
        angular.forEach($scope.taskItem, function (taskItem) {
            if (taskItem.description === itemText) {
                var i = 0;
                var optionsCompleted = 0;
                while(i < taskItem.checklistOptions.length) {
                    if (taskItem.checklistOptions[i].text === optionText) {
                        taskItem.checklistOptions[i].complete = true;
                    }
                    if (taskItem.checklistOptions[i].complete === true) {
                        optionsCompleted += 1;
                    }
                    i++;
                }
                //if all options complete, complete the task.
                if (taskItem.checklistOptions.length === optionsCompleted) {
                    taskItem.completeTimes += 1;
                    taskItem.complete = true;
                }
            }
        });
        localStorage.setItem('taskItems', JSON.stringify($scope.taskItem));
    };

	}
]);
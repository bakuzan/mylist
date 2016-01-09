'use strict';

// Tasks controller
angular.module('tasks').controller('TasksController', ['$scope', '$stateParams', '$location', 'Authentication', 'Tasks', 'ListService', 'NotificationFactory', 'TaskFactory',
	function($scope, $stateParams, $location, Authentication, Tasks, ListService, NotificationFactory, TaskFactory) {
		$scope.authentication = Authentication;
        
        // If user is not signed in then redirect back to signin.
		if (!$scope.authentication.user) $location.path('/signin');
        
        var today = new Date(),
            day = today.getDay();
        
        $scope.whichController = 'task';
        $scope.isLoading = false;
        //paging variables.
        $scope.pageConfig = {
            currentPage: 0,
            pageSize: 10
        };
        $scope.filterConfig = {
            showingCount: 0,
            sortType: '',
            sortReverse: true,
            search: {
                description: '',
                day: ''
            },
            datesSelected: false
        };
        $scope.mangaUpdate = {
            isPopup: false
        };
        $scope.commonArrays = ListService.getCommonArrays();
        
        $scope.loading = function(value) {
            $scope.isLoading = ListService.loader(value);
        };
        
        $scope.tabFilter = function(tabName) {
            $scope.filterConfig.search.day = tabName;
        };
        
        $scope.weekBeginning = function() {
            return TaskFactory.getWeekBeginning();
        };
        
        function setNewTask() {
            $scope.newTask = {
                description: '',
                link: {
                    linked: false,
                    type: '',
                    anime: undefined,
                    manga: undefined
                },
                day: '',
                date: '',
                repeat: 0,
                category: '',
                daily: false,
                checklist: false,
                checklistItems: [],
                isAddTask: false
            };
        }
        setNewTask();
        
		// Create new Task
		$scope.create = function() {
			// Create new Task object
			var task = new Tasks ({
				description: this.newTask.description,
                link: {
                    linked: this.newTask.link.linked,
                    type: (this.newTask.link.linked === false) ? ''      : 
                          (this.newTask.category === 'Watch')  ? 'anime' : 
                                                                 'manga' ,
                    anime: (this.newTask.link.anime === undefined) ? undefined : this.newTask.link.anime._id ,
                    manga: (this.newTask.link.manga === undefined) ? undefined : this.newTask.link.manga._id 
                },
                day: this.newTask.daily === true ? 'Any' : this.newTask.day,
                date: this.newTask.date === '' ? new Date() : this.newTask.date,
                repeat: (this.newTask.link.linked === false) ? this.newTask.repeat                     : 
                        (this.newTask.category === 'Watch')  ? this.newTask.link.anime.finalEpisode    :
                                                               this.newTask.link.manga.finalChapter    ,
                completeTimes: (this.newTask.link.linked === false) ? 0                                     :
                               (this.newTask.category === 'Watch')  ? this.newTask.link.anime.episodes      :
                                                                      this.newTask.link.manga.chapters      ,
                updateCheck: new Date().getDay() === 1 ? true : false,
                complete: false,
                category: this.newTask.category === '' ? 'Other' : this.newTask.category,
                daily: this.newTask.daily,
                checklist: this.newTask.checklist,
                checklistItems: this.newTask.checklistItems
			});
//            console.log(task, this.newTask);
//			// Redirect after save
			task.$save(function(response) {
				$location.path('tasks');
                NotificationFactory.success('Saved!', 'New Task was successfully saved!');
                find();
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
                console.log(errorResponse);
                NotificationFactory.error('Error!', 'New Task failed to save!');
			});
		};
        
        function remove(task) {
            if ( task ) { 
                task.$remove();

                for (var i in $scope.tasks) {
                    if ($scope.tasks [i] === task) {
                        $scope.tasks.splice(i, 1);
                    }
                }
            } else {
                $scope.task.$remove(function() {
                    $location.path('tasks');
                });
            }
            NotificationFactory.warning('Deleted!', 'Task was successfully deleted.');
        }

		// Remove existing Task
		$scope.deleteTask = function(task) {
            NotificationFactory.confirmation(function() { 
                remove(task);
            });
		};

		// Update existing Task
		function update(refresh) {
            console.log('update');
			var task = $scope.task;
            if (task.link.anime) {
                task.link.anime = task.link.anime._id;
            } else if (task.link.manga) {
                task.link.manga = task.link.manga._id;
            }
            
			task.$update(function() {
				$location.path('tasks');
                NotificationFactory.success('Saved!', 'Task was successfully updated!');
                //Refresh items if the callee wasn't checkStatus.
                if (refresh === true) {
                    console.log('update + refresh items');
                    find();
                }
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
                console.log(errorResponse);
                NotificationFactory.error('Error!', 'Task failed to save!');
			});
		}
        
        //Tick off a task.
        $scope.tickOff = function(task) {
            var isLinked = false;
            //Is it linked?
            if (task.link.linked === false) {
                task.completeTimes += 1;
            } else if (task.link.linked === true) {
                isLinked = true;
                /** Anime or manga?
                 *   Update the item value AND the complete/repeat values.
                 */
                if (task.link.type === 'anime') {
                    task.completeTimes = task.link.anime.episodes + 1;
                    task.repeat = task.link.anime.finalEpisode;
                    TaskFactory.updateAnimeitem(task);
                } else if (task.link.type === 'manga') {
                    if ($scope.mangaUpdate.isPopup === true) {
                        $scope.mangaUpdate.isPopup = false;
                        task.complete = true;
                        task.completeTimes = task.link.manga.chapters;
                        task.repeat = task.link.manga.finalChapter;
                        TaskFactory.updateMangaitem(task, task.link.manga.chapters, task.link.manga.volumes);
                    } else if ($scope.mangaUpdate.isPopup === false) {
                        $scope.mangaUpdate.isPopup = true;
                        task.complete = false;
                        return;
                    }
                }
            }
            $scope.task = task;
            console.log($scope.task);
            update(isLinked);
        };
        
        //Tick of a checklist item.
        $scope.tickOffChecklist = function(task) {
            //update the option for the task.
            var length = task.checklistItems.length,
                completeCount = 0;
            angular.forEach(task.checklistItems, function (item) {
                if (item.complete === true) {
                    completeCount += 1;
                }
            });
            //if all options complete, complete the task.
            if (length === completeCount) {
                task.completeTimes += 1;
                task.complete = true;
            }
            $scope.task = task;
            update();                                           
        };
        
        //Add new checklist item.
        $scope.insertChecklistItem = function (task, newChecklistItem) {
            if (newChecklistItem!=='' && newChecklistItem!==undefined) {
                var alreadyAdded = false;
                //find the item and insert the option.
                angular.forEach(task.checklistItems, function (item) {
                    if (item === newChecklistItem) {
                        alreadyAdded = true;
                    }
                });
                
                //if not in array add it.
                if (alreadyAdded === false) {
                    task.checklistItems.push({ text: newChecklistItem, complete: false });
                } else if (alreadyAdded === true) {
                    NotificationFactory.popup('Option already exists.', 'Please re-name and try again.', 'error');
                }
            }
            $scope.task = task;
            update();
        };
        
        //Defaults the tab filter to the current day of the week.
        function setTabFilterDay(day) {
            var index = day === 0 ? 7 : day; //Adjust for Sunday.
            $scope.filterConfig.search.day = $scope.commonArrays.days[index].name;
            console.log(day, $scope.filterConfig.search.day);
        }
        setTabFilterDay(day);
         
         //check things
        function checkStatus() {
            if (day === 1) {
                console.log('monday', day);
                angular.forEach($scope.tasks, function (task) {
                    //has it been updated today?
                    if(task.updateCheck === false) {
                        console.log('updating - ', task.description);
                        if (task.link.linked === false) {
                            //has it reached the necessary number of repeats?
                            if(task.completeTimes !== task.repeat) {
                                console.log('not complete', task.description);
                                task.complete = false;
                                task.updateCheck = true;
                                $scope.task = task;
                                update();
                            } else if (task.completeTimes === task.repeat) {
                                console.log('complete - delete', task.description);
                                remove(task);
                            }
                        } else if (task.link.linked === true) {
                            console.log('linked');
                            var type = task.link.type,
                                parts = (type === 'anime') ? { single: 'episodes', all: 'finalEpisode' } :
                                                             { single: 'chapters', all: 'finalChapter' } ; 
                            if (task.link[type][parts.single] !== task.link[type][parts.all]) {
                                console.log('linked not complete', task.description);
                                task.complete = false;
                                task.updateCheck = true;
                                $scope.task = task;
                                update();
                            } else if (task.link[type][parts.single] === task.link[type][parts.all]) {
                                console.log('linked complete - delete', task.description);
                                remove(task);
                            }
                        }
                    }
                });
            } else {
                console.log('not monday', day);
                angular.forEach($scope.tasks, function (task) {
                    var change = task.updateCheck === false ? false : true;
                    task.updateCheck = false;
                    //is it a daily task?
                    if (task.daily === true) {
                        console.log('daily', task.description);
                        //has it reached the necessary number of repeats?
                        if(task.completeTimes !== task.repeat) {
                            console.log('not complete', task.description);
                            var refresh = today.toISOString().slice(0,10);
                            //has it been refreshed today?
                            if (task.dailyRefresh.slice(0,10) !== refresh) {
                                console.log('not complete - update', task.description);
                                task.complete = false;
                                task.dailyRefresh = refresh;
                                $scope.task = task;
                                update();
                            }
                        } else if (task.completeTimes === task.repeat) {
                            console.log('complete - delete', task.description);
                            remove(task);
                        }
                    } else if ((task.daily === false) && change) {
                        console.log('weekly update: ', task.description);
                        $scope.task = task;
                        update();
                    }
                });
            }
            find();
        }

		// Find a list of Tasks
		function find(check) {
			Tasks.query(function(result) {
                $scope.tasks = result;
                if (check === true) checkStatus();
            });
		}
        find(true);
        
        $scope.$watchCollection('tasks', function(newValue) {
            if ($scope.tasks !== undefined) {
                console.log(newValue, new Date().toISOString());
            }
        });

		// Find existing Task
		$scope.findOne = function() {
			$scope.task = Tasks.get({ 
				taskId: $stateParams.taskId
			});
		};
        
        window.addEventListener('scroll', function (evt) {
              var scrollTop = document.body.scrollTop,
                  div = document.getElementById('task-tab-filter-container'),
                  innerDiv = document.getElementById('task-tab-filter-inner-container'),
                  viewportOffset = div.getBoundingClientRect(),
                  distance_from_top = viewportOffset.top; // This value is your scroll distance from the top

              // The user has scrolled to the tippy top of the page. Set appropriate style.
              if (distance_from_top < 56) {
//                  console.log('top hit : ', distance_from_top);
                  div.classList.add('task-tab-filter-scroll-top');
                  div.classList.remove('margin-top-40');
                  innerDiv.classList.add('task-tab-filter-inner-container');
              }

              // The user has scrolled down the page.
              if(distance_from_top > 55 || scrollTop < 10) {
//                  console.log('we are at: ', distance_from_top);
                  div.classList.remove('task-tab-filter-scroll-top');
                  div.classList.add('margin-top-40');
                  innerDiv.classList.remove('task-tab-filter-inner-container');
              }

          });
        

	}
]);
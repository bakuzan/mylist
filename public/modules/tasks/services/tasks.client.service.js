'use strict';

//Tasks service used to communicate Tasks REST endpoints
angular.module('tasks').factory('Tasks', ['$resource',
	function($resource) {
		return $resource('tasks/:taskId', { taskId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
])
.factory('TaskFactory', ['$q', 'Animeitems', 'Mangaitems', 'AnimeFactory', 'MangaFactory', 'NotificationFactory', 'ListService', '$uibModal',
	function($q, Animeitems, Mangaitems, AnimeFactory, MangaFactory, NotificationFactory, ListService, $uibModal) {
    var obj = {};

        obj.getWeekBeginning = function() {
            var newDate = new Date(),
                day = newDate.getDay(),
                diff = newDate.getDate() - day + (day === 0 ? -6:1); // adjust when day is sunday
            var wkBeg = new Date();
            return new Date(wkBeg.setDate(diff));
        };

        obj.updateAnimeitem = function(task) {
            var query = Animeitems.get({
							animeitemId: task.link.anime._id
						});
            query.$promise.then(function(data) {
                //console.log(data);
                data.episodes += 1;
                data.latest = new Date();
                AnimeFactory.update(data, undefined, true, undefined);
            });
        };

        obj.updateMangaitem = function(task, chapters, volumes) {
					return $q(function(resolve, reject) {
            var query = Mangaitems.get({
							mangaitemId: task.link.manga._id
						});
            query.$promise.then(function(data) {
                //console.log(data);
                data.chapters = chapters;
                data.volumes = volumes;
                data.latest = new Date();
                MangaFactory.update(data, undefined, true, undefined);
								resolve(data);
            });
					});
        };

				/** Task Update,Edit,Delete and other functions below here.
				 */

			 // Update existing Task
			 obj.updateTask = function(task, refresh) {
				 return $q(function(resolve, reject) {
					 //console.log('update');
					 if (task.link.anime) {
						 task.link.anime = task.link.anime._id;
					 } else if (task.link.manga) {
						 task.link.manga = task.link.manga._id;
					 }

						task.$update(function() {
							NotificationFactory.success('Saved!', 'Task was successfully updated!');
						  //Refresh items if the callee wasn't checkStatus.
						  console.log('update, refresh items ? ', refresh);
						  resolve({ refresh: refresh });
						}, function(errorResponse) {
							var errorMessage = errorResponse.data.message;
							reject(errorMessage);
						  //console.log(errorResponse);
						  NotificationFactory.error('Error!', 'Task failed to save!');
						});
					});
			 };

			 //Remove a task.
				obj.removeTask = function(task, tasks, userCheck) {
					if(userCheck) {
						//console.log('launch');
						NotificationFactory.confirmation(function remove() {
		          removeTaskProcess(task, tasks);
						});
					} else {
						removeTaskProcess(task, tasks);
					}
				};

				function removeTaskProcess(task, tasks) {
					if ( task ) {
							task.$remove();
							for (var i in tasks) {
									if (tasks[i] === task) {
											tasks.splice(i, 1);
									}
							}
							NotificationFactory.warning('Deleted!', 'Task was successfully deleted.');
					}
				}

				//Linked manga need special options dialog.
				function launchMangaUpdateDialog(task, checklistIndex) {
					var modalInstance = $uibModal.open({
						animation: true,
		      	templateUrl: '/modules/tasks/views/update-manga-task.client.view.html',
		      	controller: 'UpdateMangaTaskController as ctrl',
		      	size: 'lg',
		      	resolve: {
		        	data: function () {
		          	return { item: angular.copy(task), itemOriginal: task };
							}
						}
					});
					return modalInstance;
				}

				//Completes a task.
				obj.tickOff = function(task) {
					return $q(function(resolve, reject) {
						var isLinked = task.link.linked;
				    //Is it linked?
				    if (!isLinked) {
				        task.completeTimes += 1;
				    } else if (isLinked) {
				        /** Anime or manga?
				         *   Update the item value AND the complete/repeat values.
				         */
				        if (task.link.type === 'anime') {
				            task.completeTimes = task.link.anime.episodes + 1;
				            task.repeat = task.link.anime.finalEpisode;
				            obj.updateAnimeitem(task);
				        } else if (task.link.type === 'manga') {
									  task.complete = false;
				            var dialog = launchMangaUpdateDialog(task);
										dialog.result.then(function(result) {
											task = result;
											task.completeTimes += 1;
											task.complete = true;
											obj.updateMangaitem(task, task.link.manga.chapters, task.link.manga.volumes).then(function(result) {
												console.log('updated manga: ', result);
												return obj.updateTask(task, true);
											}).then(function(result) {
												console.log('update manga into update task: ', result);
												resolve(result);
											});
										});
				        }
				    }
						if(!isLinked || (isLinked && task.link.type === 'anime')) {
					    //console.log('tickoff: ', task);
					    obj.updateTask(task, isLinked).then(function(result) {
								console.log('update task resolve: ', result);
								resolve(result);
							});
						}
					});
				};

				//Completes a checklist item.
				obj.tickOffChecklist = function(task, index) {
					return $q(function(resolve, reject) {
						//update the option for the task.
						var isLinked = task.link.linked;
						if (isLinked && task.link.type === 'manga') {
								task.checklistItems[index].complete = false;
								var dialog = launchMangaUpdateDialog(task, index);
								dialog.result.then(function(result) {
									task = result;
									task.checklistItems[index].complete = true;
									if(ListService.findWithAttr(task.checklistItems, 'complete', false) === -1) {
										task.completeTimes += 1;
			              task.complete = true;
									}
									obj.updateMangaitem(task, task.link.manga.chapters, task.link.manga.volumes).then(function(result) {
										console.log('updated manga: ', result);
										return obj.updateTask(task, true);
									}).then(function(result) {
										console.log('update manga into update task: ', result);
										resolve(result);
									});
								});
						} else if(!isLinked) {
							if(ListService.findWithAttr(task.checklistItems, 'complete', false) === -1) {
								task.completeTimes += 1;
								task.complete = true;
							}
							//console.log('tickoff checklist: ', task);
					    obj.updateTask(task, isLinked).then(function(result) {
								console.log('update task resolve: ', result);
								resolve(result);
							});
						}
					});
				};

				//Add additional items to a checklist.
				obj.insertChecklistItem = function(task, newChecklistItem) {
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
					this.updateTask(task);
				};

    return obj;
}]);

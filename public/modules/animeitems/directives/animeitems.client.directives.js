'use strict';

angular.module('animeitems').directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}])
.directive('listBack', function(){
    return function(scope, element, attrs){
        var url = attrs.listBack;
        element.css({
            'background-image': 'url(' + url +')',
            'background-size' : '50%',
            'background-repeat': 'no-repeat',
            'background-position': 'right'
        });
    };
})
.directive('keycuts', function() {
    return {
        restrict: 'A',
        link: function postLink(scope, element, attrs) {
            //keydown catch - alt+v for view, ctrl+left/right for list page.
            scope.$on('my:keydown', function(event, e) {
//                console.log(event, e);
                if (e.ctrlKey && e.keyCode===39 && scope.currentPage < scope.pageCount) {
                    scope.currentPage = scope.currentPage + 1;
                } else if (e.ctrlKey && e.keyCode===37 && scope.currentPage > 0) {
                    scope.currentPage = scope.currentPage - 1;
                } else if (e.altKey && e.keyCode===86) {
                    if (scope.isList===true) {
                        scope.isList = false;
                    } else if (scope.isList===false) {
                        scope.isList = true;
                    } else {
                        if (scope.isList==='list') {
                            scope.isList = 'carousel';
                        } else if (scope.isList==='carousel') {
                            scope.isList = 'statistics';
                        } else if (scope.isList==='statistics') {
                            scope.isList = 'list';
                        }
                    }
                }
            });
        }
    };
})
.service('ItemService', ['moment', function(moment) {
    
        this.latestDate = function(latest, updated) {
            //latest date display format.
//          console.log(latest, updated);
            var today = moment(new Date());
            var latestDate, diff;
            if (latest.substring(0,10)===updated.substring(0,10)) {
                 latestDate = moment(updated);
                 diff = latestDate.fromNow();
                
                if (diff==='a day ago') {
                    return 'Yesterday';
                } else {
                    return diff;
                }
            } else {
                 latestDate = moment(latest);
                 diff = today.diff(latestDate, 'days');
                
                //for 0 and 1 day(s) ago use the special term.
                if (diff===0) {
                    return 'Today';
                } else if (diff===1) {
                    return 'Yesterday';
                } else {
                    return diff + ' days ago.';
                }
            }
        };
        
}]);
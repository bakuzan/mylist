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
                    if (scope.currentPage > scope.pageCount - 1) {
                        scope.currentPage = scope.currentPage -1;
                    }
                } else if (e.ctrlKey && e.keyCode===37 && scope.currentPage > 0) {
                    scope.currentPage = scope.currentPage - 1;
                } else if (e.altKey && e.keyCode===86) {
                    if (scope.isList===true) {
                        scope.isList = false;
                        scope.view = 'statistics';
                        scope.includeView = '/modules/animeitems/views/stats-animeitems.client.view.html';
                    } else if (scope.isList===false) {
                        scope.isList = true;
                        scope.view = 'list';
                        scope.includeView = '';
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
});
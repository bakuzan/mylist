'use strict';

angular.module('characters').directive('fileModel', ['$parse', function ($parse) {
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
.directive('characterBack', function(){
    return function(scope, element, attrs){
        var url = attrs.characterBack;
        element.css({
            'background-image': 'url(' + url +')',
            'background-size' : '100%',
            'background-repeat': 'no-repeat',
            'background-position': 'center'
        });
    };
})
.directive('disableNgAnimate', ['$animate', function($animate) {
  return {
    restrict: 'A',
    link: function(scope, element) {
      $animate.enabled(false, element);
    }
  };
}])
.directive('enterTag', function () {
    return function (scope, element, attrs) {
        element.bind('keydown keypress', function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.enterTag);
                });
                event.preventDefault();
            }
        });
    };
})
.directive('clearTagValues', function() {
    return function (scope, element, attrs) {
        element.bind('click', function(event) {
            console.log('clear tags');
            scope.$apply(function() {
                scope.searchTags = '';
                scope.characterTags = '';
                scope.tagsForFilter = [];
            });
        });
    };
});
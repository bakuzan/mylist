'use strict';

angular.module('favourites').directive('favouriteBack', function(){
    return function(scope, element, attrs){
        var url = attrs.favouriteBack;
        element.css({
            'background-image': 'url(' + url +')',
            'background-size' : '100%',
            'background-repeat': 'no-repeat',
            'background-position': 'right'
        });
    };
});
'use strict';

angular.module('core').directive('myProgress', function() {
  return function(scope, element, attrs) {
      scope.$watch(attrs.myProgress, function(val) {
          var type = 'checklist-progress';
          element.html('<div class="' + type + '" style="width: ' + val + '%;height: 100%"></div>');
      });
  };
})
.directive('anywhereButHere', function ($document, $window) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.data('thing', true);

            /** On click, check what you clicked and whether you can ignore it.
             *    Based on checks false the ng-show of the anywhere-but-here element.
             */
            angular.element($document[0].body).on('click', function (e) {
                var inThing = angular.element(e.target).inheritedData('thing'),
                    ignore = angular.element(e.target).attr('ignore-here');
                if (!inThing && !ignore) {
                    scope.$apply(function () {
                        scope[attrs.ngShow] = false;
                    });
                }
            });
        }
    };
})
.directive('formatDate', function(){
  return {
   require: 'ngModel',
    link: function(scope, elem, attr, modelCtrl) {
      modelCtrl.$formatters.push(function(modelValue){
        return (modelValue === null) ? null : new Date(modelValue);
      });
    }
  };
})
.directive('pageLoading', ['LoaderControl', function(LoaderControl) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var el = element[0];
            
            scope.$watch(
                function() {
                    return {
                        loading: LoaderControl.loading
                    };
                }, function(loader) {
                    if(loader.loading) {
                        el.classList.add('page-loading');
                    } else {
                        el.classList.remove('page-loading');
                    }
                }, true
            );
            
        }
    };
}]);
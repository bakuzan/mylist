'use strict';

angular.module('toptens')
.directive('steps', function() {
    return {
        restrict: 'A',
        replace: true,
        transclude: true,
        template: '<div class="steps" ng-transclude>' +
                  '</div>'
    };
})
.directive('step', function() {
  return {
      restrict: 'A',
      replace: true,
      transclude: true,
      scope: {
          stepConfig: '='
      },
      templateUrl: '/modules/toptens/templates/step.html',
      link: function(scope, elm, attrs) {
          scope.stepNumber = elm.index() + 1;
          var element = elm[0],
              classList = element.classList,
              zIndex = element.style.zIndex;
          
          function classRemove(array) {
              angular.forEach(array, function(item) {
                  classList.remove(item);
              });
          }
          function classAdd(array) {
              angular.forEach(array, function(item) {
                  classList.add(item);
              });
          }
          
          scope.$watch('stepConfig.currentStep', function(newValue) {
              if (newValue !== undefined) {
                  if (scope.stepNumber === scope.stepConfig.currentStep) {
                      classRemove(['step-transition', 'step-out']);
                      zIndex = 2;
                      classAdd(['step-transition', 'step-in']);
                  } else {
                      classRemove(['step-transition', 'step-in']);
                      zIndex = 1;
                      classAdd(['step-transition', 'step-out']);
                  }
              }
          });
      }
  };  
})
.directive('stepControls', function() {
   return {
       restrict: 'A',
       replace: true,
       transclude: true,
       template: '<div class="step-controls form-group step-button-group padding-5" ng-transclude>' +
                  '</div>'
   };
})
.directive('sticky', function() {
    return {
        restrict: 'A',
        scope: {},
        link: function(scope, element, attrs) {
            
            window.addEventListener('scroll', function (evt) {
                var stickyClass = 'sticky-scroll-top', stickyInnerClass = 'sticky-inner-container',
                    scrollTop = document.body.scrollTop,
                    elm = element[0],
                    inner = elm.children[0],
                    viewportOffset = elm.getBoundingClientRect(),
                    distance_from_top = viewportOffset.top; // This value is your scroll distance from the top

                // The element has scrolled to the top of the page. Set appropriate style.
                if (distance_from_top < 56) {
//                    console.log('top hit : ', distance_from_top);
                    elm.classList.add(stickyClass);
                    inner.classList.add(stickyInnerClass);
                }

                // The element has not reached the top.
                if(distance_from_top > 55 || scrollTop < 10) {
//                    console.log('we are at: ', distance_from_top);
                    elm.classList.remove(stickyClass);
                    inner.classList.remove(stickyInnerClass);
                }
          });
            
        }
    };
});
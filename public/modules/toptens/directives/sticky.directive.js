(function() {
  'use strict';
  angular.module('toptens')
  .directive('sticky', sticky);

  function sticky() {
      return {
          restrict: 'A',
          scope: {},
          link: function(scope, element, attrs) {

              window.addEventListener('scroll', function (evt) {
                  var stickyClass = 'sticky-scroll-top',
                      stickyInnerClass = 'sticky-inner-container',
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
  }

})();

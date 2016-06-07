(function() {
  'use strict';
  angular.module('characters')
  .filter('tagFilter', tagFilter);

  function tagFilter() {
      return function(array, searchTags, taglessItem) {
          if (array !== undefined) {
              return array.filter(function(item) {
                  //special tag filter
                  var found = false;
                  var i = 0;
                  var tagsToSearch = [];
                  var tagsForFilter;

                  //if tagless is checked return tagless and nothing else.
                  if (taglessItem===true) {
                      if (item.tags.length===0) {
                          return item;
                      }
                  } else {
                      if (searchTags===undefined || searchTags==='') {
                          return true;
                      } else {
                          //get tags that are being looked for
                          tagsForFilter = searchTags.substring(0, searchTags.length - 1).split(',');
                          //console.log(tagsForFilter);

                          //get tags of items to filter
                          angular.forEach(item.tags, function(tag) {
                              tagsToSearch.push(tag.text);
                          });

                          //filter: check in 'query' is in tags.
                          for(i = 0; i < tagsForFilter.length; i++) {
                              if (tagsToSearch.indexOf(tagsForFilter[i]) !== -1) {
                                  found = true;
                              } else {
                                  return false;
                              }
                          }
                          return found;
                      }
                  }
              });
          }
      };
  }

})();

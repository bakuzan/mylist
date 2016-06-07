(function() {
  'use strict';
  angular.module('animeitems')
  .filter('seasonForCharacterAnime', seasonForCharacterAnime);

  function seasonForCharacterAnime() {
      return function(array, year, month) {
          return array.filter(function(item) {
              if (item.anime && item.anime.season !== undefined && item.anime.season !== null) {
                  if (item.anime.season.year === year && item.anime.season.season === month) {
                      return item;
                  }
              }
          });
      };
  }

})();

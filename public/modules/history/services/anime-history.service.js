(function() {
  'use strict';
  //History service used to communicate Animeitems REST endpoints
  angular.module('history')
  .factory('AnimeHistory', AnimeHistory);
  AnimeHistory.$inject = ['$resource'];

    function AnimeHistory($resource) {
      return $resource('history/anime/:latest', { latest: '@_latest' }, { update: { method: 'PUT' } });
    }

})();

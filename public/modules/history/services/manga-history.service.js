(function() {
  'use strict';
  angular.module('history')
  .factory('MangaHistory', MangaHistory);
  MangaHistory.$inject = ['$resource'];

  function MangaHistory($resource) {
    return $resource('history/manga/:latest', { latest: '@_latest' }, { update: { method: 'PUT' } });
  }

})();

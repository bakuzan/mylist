'use strict';

angular.module('toptens').controller('statisticsTopten', ['$scope','$uibModalInstance','list', 'CharacterService',
 function ($scope, $uibModalInstance, list, CharacterService) {
   var self = this;
   $scope.list = list;
   $scope.toptenInfo = {
     tags: [],
     series: []
   };

   function process() {
     var listType = $scope.list.type + 'List';
     $scope.toptenInfo.tags = CharacterService.buildCharacterTags($scope.list[listType]);
     $scope.toptenInfo.series = CharacterService.buildSeriesList($scope.list[listType]);
     console.log('process: ', listType, $scope.toptenInfo, $scope.list);
   }
   process();

  $scope.ok = function () {
    $uibModalInstance.close();
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}]);

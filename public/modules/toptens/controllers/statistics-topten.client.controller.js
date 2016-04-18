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
     if($scope.list.type === 'character') {
       $scope.toptenInfo.series = CharacterService.buildSeriesList($scope.list[listType]);
     }
   }
   process();

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}]);

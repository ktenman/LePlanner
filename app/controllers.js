var leplannerControllers = angular.module('leplannerControllers', []);

leplannerControllers.controller('MainCtrl', [
  '$scope',
  '$http',
  function($scope, $http){
    // user auth
    $http.get('/api/me').
    success(function(data, status, headers, config){
      console.log('User logged in');
      $scope.user = data.displayName;
      $scope.provider = data.provider;
      console.log(data);
    }).
    error(function(data, status, headers, config){
      console.log(data);
    });
  }
]);

leplannerControllers.controller('homeCtrl', [
  '$scope',
  function($scope){
    $scope.message = 'Tere';
  }
]);

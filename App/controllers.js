var leplannerControllers = angular.module('leplannerControllers', []);

leplannerControllers.controller('homeCtrl',[
  '$scope',
  '$http',
  function($scope,$http){

  // user auth
  $http.get('/api/me').
  success(function(data,status,headers,config){
    console.log('user logged in');
  
    $scope.user = data.displayName;
  }).
  error(function(data,status,headers,config){
    console.log(data);
  });

  }
]);

leplannerControllers.controller('homeCtrl',[
  '$scope',
  function($scope){

    $scope.message = 'Tere';

  }
]);

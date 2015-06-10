var leplannerControllers = angular.module('leplannerControllers', []);

leplannerControllers.controller('MainCtrl', [
  '$scope',
  '$http',
  '$rootScope',
  'Auth',
  function($scope, $http, $rootScope, Auth){
    // user auth
    if(!$rootScope.user){
      $http.get('/api/me').
      success(function(data, status, headers, config){
        console.log('User logged in');
        Auth.setUser(data);
        $scope.user = $rootScope.user;
        console.log(data);
      }).
      error(function(data, status, headers, config){
        console.log(data);
      });
    }
  }
]);

leplannerControllers.controller('homeCtrl', [
  '$scope',
  '$rootScope',
  '$http',
  'Auth',
  '$location',
  function($scope, $rootScope, $http, Auth, $location){
    if(!$rootScope.user && $scope.$parent.user){
      $scope.$parent.user = null;
      console.log('user has been logged out');
    }
    $scope.logout = function(){
      console.log('logout');
      $http({url: '/api/logout', method: 'GET'})
        .success(function(data, status, headers, config){
          $scope.user = null;
          Auth.unsetUser();

          $location.path('/');
        });
    };
  }
]);

leplannerControllers.controller('loginCtrl', [
  '$scope',
  '$rootScope',
  '$location',
  function($scope, $rootScope, $location){
    if($rootScope.user){
      console.log('asd');
    }
  }
]);
leplannerControllers.controller('addCtrl', [
  '$scope',
  function($scope){

  }
]);

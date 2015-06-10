var leplannerControllers = angular.module('leplannerControllers', []);

leplannerControllers.controller('MainCtrl',[
    '$scope',
    '$rootScope',
    '$http',
    'Auth',
    function($scope,$rootScope,$http, Auth){

      // user auth
      if(!$rootScope.user){
        $http.get('/api/me').
        success(function(data,status,headers,config){
          console.log(data);
          Auth.setUser(data);
          $scope.user = $rootScope.user;
        }).
        error(function(data,status,headers,config){
          console.log(data);
        });
      }


    }
]);

leplannerControllers.controller('homeCtrl',[
    '$scope',
    '$rootScope',
    '$http',
    'Auth',
    '$location',
    function($scope,$rootScope, $http, Auth, $location){

      if(!$rootScope.user && $scope.$parent.user){
        $scope.$parent.user = null;
        console.log('user has been logged out');
      }

      //$scope.user = $rootScope.user;

      $scope.logout = function(){
        $http({url: '/api/logout', method: 'GET'}).
        success(function(data,status,headers,config){

          $scope.$parent.user = null;
          Auth.unsetUser();

          $location.path('/#/');

        }).
        error(function(data,status,headers,config){
          console.log(data);
        });
      };

    }
]);

leplannerControllers.controller('loginCtrl',[
    '$scope',
    '$rootScope',
    '$location',
    function($scope, $rootScope, $location){
      if($rootScope.user){
        $location.path('/');
      }
    }
]);

leplannerControllers.controller('addCtrl',[
    '$scope',
    '$http',
    function($scope, $http){

      $scope.saveScenario = function(){
        if($scope.scenario_name){
          var scenario = {
            name: $scope.scenario_name,
            category: $scope.scenario_category
          };

          $http.post('/api/savescenario', scenario).
          success(function(data,status,headers,config){
            console.log('saved');
          }).
          error(function(data,status,headers,config){
            console.log(data);
          });

        }
      };

    }
]);

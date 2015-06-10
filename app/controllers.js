var leplannerControllers = angular.module('leplannerControllers', []);

leplannerControllers.controller('MainCtrl', [
  '$scope',
  '$http',
  '$rootScope',
  '$location',
  'Auth',
  function($scope,$http,$rootScope,$location,Auth){

    // selle peaks nii tegema, et see on eraldi kontrollerim, mis laetakse iga kord
    if(!$rootScope.user){
      $http({url: '/api/me', method: 'GET'})
      .success(function (data, status, headers, config) {
        Auth.setUser(data);
        $scope.user = $rootScope.user;

      })
      .error(function (data, status, headers, config) {
        console.log(data);
      });

    }


    $scope.logout = function(){
      $http({url: '/api/logout', method: 'GET'})
      .success(function (data, status, headers, config) {
        console.log(data);
        $scope.user = null;
        Auth.unsetUser();
        $location.path('/');

      })
      .error(function (data, status, headers, config) {
        console.log(data);
      });
    };

  }
]);

leplannerControllers.controller('homeCtrl', [
  '$scope',
  '$rootScope',
  'Scenario',
  function($scope, $rootScope,Scenario){


    // kui vahepeal logib välja
    if(!$rootScope.user && $scope.$parent.user){
      $scope.$parent.user = null;
      console.log("disabled use");
    }

    //$scope.message = 'not logged in';
    $scope.alphabet = ['0-9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
      'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
      'Y', 'Z'];

    $scope.subjects = ['Math', 'History', 'English'];

    $scope.scenarios = Scenario.query();

    $scope.filterBySubject = function(subject) {
      $scope.scenarios = Scenario.query({ subject: subject });
    };
  }
]);

leplannerControllers.controller('loginCtrl', [
  '$scope',
  '$location',
  function($scope,$location){

    if($scope.$parent.user){

      $location.path('/');

    }
    //$scope.message = 'not logged in';
  }
]);

leplannerControllers.controller('AddCtrl', [
  '$scope',
  '$http',
  'Auth',
  '$rootScope',
  '$location',
  function($scope,$http, Auth, $rootScope,$location){
    // check if logged in

      // user loggedid continue
      $scope.user = $rootScope.user;
      $scope.submit = function() {
        if ($scope.name) {
            console.log($scope.name);
            var scenario = {
              name: $scope.name,
              subject: $scope.subject
            };

            $http.post('/api/savescenario', scenario)
            .success(function(data, status, headers, config) {
              console.log('saved');
            }).
            error(function(data, status, headers, config) {
              // called asynchronously if an error occurs
              // or server returns response with an error status.
            });
        }
      };
    }

]);

leplannerControllers.controller('DetailCtrl', function($scope, $rootScope, $routeParams, Scenario, Subscription) {
      Scenario.get({ _id: $routeParams.id }, function(scenario) {
        $scope.scenario = scenario;

        $scope.isSubscribed = function() {
          return $scope.scenario.subscribers.indexOf($scope.$parent.user._id) !== -1;
        };

        $scope.subscribe = function() {
          Subscription.subscribe(scenario).success(function() {
            $scope.scenario.subscribers.push($scope.$parent.user._id);

          }).error(function(data, status, headers, config) {
            alert('not logged in');
          });
        };

        $scope.unsubscribe = function() {
          Subscription.unsubscribe(scenario).success(function() {
            var index = $scope.scenario.subscribers.indexOf($scope.$parent.user._id);
            $scope.scenario.subscribers.splice(index, 1);
          }).error(function(data, status, headers, config) {
            alert('not logged in');
          });
        };

      });
    });

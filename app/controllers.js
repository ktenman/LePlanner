var leplannerControllers = angular.module('leplannerControllers', []);

leplannerControllers.controller('MainCtrl', [
  '$scope',
  '$http',
  '$rootScope',
  '$location',
  'Auth',
  function($scope,$http,$rootScope,$location,Auth){

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
  'Delete',
  '$location',
  function($scope, $rootScope,Scenario, Delete, $location){

    if(!$rootScope.user && $scope.$parent.user){
      $scope.$parent.user = null;
      console.log("disabled use");
    }

    $scope.user = $rootScope.user;

    $scope.subjects = ['Math', 'History', 'English'];

    $scope.scenarios = Scenario.query();

    $scope.filterBySubject = function(subject) {
      $scope.scenarios = Scenario.query({ subject: subject });
    };
    $scope.searchScenario = function(name) {
      $scope.scenarios = Scenario.query({ name: name });
    };
    $scope.delete = function(id){
      Delete.scenario(id).success(function() {
                 
          document.getElementById('scenarios_list').removeChild(document.getElementById(id));
          
        }).error(function(data, status, headers, config) {
          alert('not logged in');
        });
    };
  }
]);

leplannerControllers.controller('loginCtrl', [
  '$scope',
  '$location',
  '$rootScope',
  function($scope,$location,$rootScope){

    if($rootScope.user){

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

    // not neccesery, not logged in user wont get until here, will be redirected
    if(!$rootScope.user && $scope.$parent.user){
      $scope.$parent.user = null;
      console.log("disabled use");
    }

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

leplannerControllers.controller('DetailCtrl', [
  '$scope',
  '$rootScope',
  '$routeParams',
  'Scenario',
  'Subscription',
  function($scope, $rootScope, $routeParams, Scenario, Subscription) {

    if(!$rootScope.user && $scope.$parent.user){
      $scope.$parent.user = null;
      console.log("disabled use");
    }

    $scope.user = $rootScope.user;

    Scenario.get({ _id: $routeParams.id }, function(scenario) {
      $scope.scenario = scenario;

      $scope.isSubscribed = function() {
        return $scope.scenario.subscribers.indexOf($scope.user._id) !== -1;
      };

      $scope.subscribe = function() {
        Subscription.subscribe(scenario).success(function() {
          $scope.scenario.subscribers.push($scope.user._id);

        }).error(function(data, status, headers, config) {
          alert('not logged in');
        });
      };

      $scope.unsubscribe = function() {
        Subscription.unsubscribe(scenario).success(function() {
          var index = $scope.scenario.subscribers.indexOf($scope.user._id);
          $scope.scenario.subscribers.splice(index, 1);
        }).error(function(data, status, headers, config) {
          alert('not logged in');
        });
      };

    });
}]);

//  Scenario Editing controller
leplannerControllers.controller('EditCtrl', [
  '$scope',
  '$rootScope',
  '$routeParams',
  'Scenario',
  '$location',
  function($scope, $rootScope, $routeParams, Scenario, $location) {

    if(!$rootScope.user && $scope.$parent.user){
      $scope.$parent.user = null;
      console.log("disabled use");
    }

    $scope.user = $rootScope.user;

    Scenario.get({ _id: $routeParams.id }, function(scenario) {
      $scope.scenario = scenario;

      $scope.cancelEdit = function() {
        $location.path('/scenarios/'+$routeParams.id);
      };
      $scope.save = function() {
        if($scope.name){
          
        }
      };

    });
}]);

var leplannerControllers = angular.module('leplannerControllers', []);

leplannerControllers.controller('MainCtrl', [
  '$scope',
  '$http',
  '$rootScope',
  '$location',
  'Scenario',
  function($scope,$http,$rootScope,$location, Scenario){
    
    console.log('main '+$rootScope.user);
        
    $scope.setUser = function(){
      $scope.user = $rootScope.user;
    }
    
    $scope.logout = function(){
      $http({url: '/api/logout', method: 'GET'})
      .success(function (data, status, headers, config) {
        console.log(data);
        $scope.user = null;
        $rootScope.user = null;
        $location.path('/');

      })
      .error(function (data, status, headers, config) {
        console.log(data);
      });
    };
    
    $scope.searchScenario = function(name) {
      $scope.scenarios = Scenario.query({ name: name });
    };

  }
]);

leplannerControllers.controller('homeCtrl', [
  '$scope',
  '$rootScope',
  'Scenario',
  'Delete',
  '$location',
  '$http',
  function($scope, $rootScope,Scenario, Delete, $location, $http){
    
    console.log($rootScope.user);
    
    if(!$rootScope.user){
      $http({url: '/api/me', method: 'GET'})
      .success(function (data, status, headers, config) {
        $rootScope.user = data;
        $scope.user = $rootScope.user;
        $scope.$parent.setUser();
        console.log('user set homectrl');

      })
      .error(function (data, status, headers, config) {
        console.log(data);
      });

    }

    $scope.user = $rootScope.user;

    $scope.subjects = subjectList($scope);
    
    $scope.scenarios = Scenario.query();

    $scope.filterBySubject = function(subject) {
      $scope.scenarios = Scenario.query({ subject: subject });
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
  '$rootScope',
  '$location',
  function($scope,$http, $rootScope,$location){
    
    //  USER CONTROL SCRIPT NEED TO COPY TO EVERY CONTROLLER THAT USES USER DATA!!!
    if(!$rootScope.user){
      $http({url: '/api/me', method: 'GET'})
      .success(function (data, status, headers, config) {
        $rootScope.user = data;
        $scope.user = $rootScope.user;
        $scope.$parent.setUser();
        console.log('user set homectrl');

      })
      .error(function (data, status, headers, config) {
        console.log(data);
      });

    }
    //  ---------------------------------------------------------------------------
    
    console.log($scope.user);
    
    $scope.subjects = subjectList($scope);

    $scope.submit = function() {
      if ($scope.name) {
          console.log($scope.name);
          console.log($scope.subject);
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
  '$http',
  function($scope, $rootScope, $routeParams, Scenario, Subscription, $http) {
    
    
    //  USER CONTROL SCRIPT NEED TO COPY TO EVERY CONTROLLER THAT USES USER DATA!!!
    if(!$rootScope.user){
      $http({url: '/api/me', method: 'GET'})
      .success(function (data, status, headers, config) {
        $rootScope.user = data;
        $scope.user = $rootScope.user;
        $scope.$parent.setUser();
        console.log('user set Addctrl');

      }).error(function (data, status, headers, config) {console.log(data);});

    }
    //  ---------------------------------------------------------------------------

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
  '$http',
  '$rootScope',
  '$location',
  'Scenario',
  '$routeParams',
  function($scope,$http, $rootScope,$location, Scenario, $routeParams) {

    //  USER CONTROL SCRIPT NEED TO COPY TO EVERY CONTROLLER THAT USES USER DATA!!!
    if(!$rootScope.user){
      $http({url: '/api/me', method: 'GET'})
      .success(function (data, status, headers, config) {
        $rootScope.user = data;
        $scope.user = $rootScope.user;
        $scope.$parent.setUser();
        console.log('user set Addctrl');

      }).error(function (data, status, headers, config) {console.log(data);});

    }
    //  ---------------------------------------------------------------------------

    $scope.user = $rootScope.user;

    Scenario.get({ _id: $routeParams.id }, function(scenario) {
      $scope.scenario = scenario;

      $scope.cancelEdit = function() {
        $location.path('/scenarios/'+$routeParams.id);
      };
      $scope.saveEdit = function() {
        console.log($scope.scenario.name);
        console.log($scope.scenario.subject);
        if($scope.scenario.name){
          var scenario = {
            id: $routeParams.id,
            name: $scope.scenario.name,
            subject: $scope.scenario.subject
          };

          $http.post('/api/updatescenario', scenario)
          .success(function(data, status, headers, config) {
            console.log('Updated');
          }).
          error(function(data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
          });
          
        }
      };

    });
}]);

leplannerControllers.controller('SearchCtrl', [
  '$scope',
  '$rootScope',
  '$routeParams',
  'Scenario',
  'Subscription',
  '$http',
  function($scope, $rootScope, $routeParams, Scenario, Subscription, $http) {
    
    
    //  USER CONTROL SCRIPT NEED TO COPY TO EVERY CONTROLLER THAT USES USER DATA!!!
    if(!$rootScope.user){
      $http({url: '/api/me', method: 'GET'})
      .success(function (data, status, headers, config) {
        $rootScope.user = data;
        $scope.user = $rootScope.user;
        $scope.$parent.setUser();
        console.log('user set Addctrl');

      }).error(function (data, status, headers, config) {console.log(data);});

    }
    //  ---------------------------------------------------------------------------

    Scenario.get({ _id: $routeParams.id }, function(scenario) {
      $scope.scenario = scenario;

      $scope.isSubscribed = function() {
        return $scope.scenario.subscribers.indexOf($scope.user._id) !== -1;
      };
      
      $scope.searchScenario = function(name) {
        $scope.scenarios = Scenario.query({ name: name });
      };

    });
}]);

function subjectList($scope) {
  return $scope.subjects = ['Maths', 'History', 'English', 'Basic Education', 'Biology', 'Estonian (native language)', 'Estonian (foreign language)',
    'Speciality language', 'Special Education', 'Physics', 'Geography', 'Educational Technology', 'Informatics', 'Human Studies', 'Chemistry', 'Physical Education',
    'Literary', 'Home Economics', 'Arts', 'Crafts', 'Natural Science', 'Economics and Business', 'Media Studies', 'Music', 'French', 'Swedish', 'German', 'Finnish',
    'Handicraft and Home Economics', 'Russian (native language)', 'Russian (foreign language)', 'Social Education'].sort();
}
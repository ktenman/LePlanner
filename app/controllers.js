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
    };

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

    $scope.subjects = subjectList();

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
          console.log($scope.description);
          console.log($scope);
          var scenario = {  //  inserts values to the scenario object
            name: $scope.name,
            subject: $scope.subject,
            author: {
              id:$scope.user._id,
              name: $scope.user.first_name +' '+$scope.user.last_name //  both names in one place
                                                                      //  used to show who made the scenario
            },
            description: $scope.description
          };

          $http.post('/api/savescenario', scenario) //  sends object to /api/savescenario (index.js)
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

    //  Subject array used to change the subject in edit.html
    $scope.subjects = subjectList($scope);

    Scenario.get({ _id: $routeParams.id }, function(scenario) {
      $scope.scenario = scenario;
      console.log($scope.scenario);

      $scope.cancelEdit = function() {  //  Cancel button on the Edit page
        $location.path('/scenarios/'+$routeParams.id);
      };
      $scope.saveEdit = function() {
        //  prints out all three changes made
        console.log($scope.scenario.name);
        console.log($scope.scenario.subject);
        console.log($scope.scenario.description);

        if($scope.scenario.name){ //  if name is sent from the Edit form
          var scenario = {  //  creates new object scenario where the new values are stored
            id: $routeParams.id,
            name: $scope.scenario.name,
            subject: $scope.scenario.subject,
            description: $scope.scenario.description
          };

          $http.post('/api/updatescenario', scenario) //  sends the scenario object to /api/updatescenario
                                                      //  in index.js
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

//  Controller for the search page
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
        console.log('user set Searchctrl');

      }).error(function (data, status, headers, config) {console.log(data);});

    }
    //  ---------------------------------------------------------------------------

    //  default sets $scope.scenarios to ALL scenarios
    $scope.scenarios = Scenario.query();
    //  Get the subjects so we can search by them
    $scope.subjects = subjectJSONList();

    console.log($scope.scenarios);
    //  can be used later on to see on the Search page if User is subscribed to a scenario or not
    $scope.isSubscribed = function() {
      return $scope.scenario.subscribers.indexOf($scope.user._id) !== -1;
    };

    $scope.subject = [];
    $scope.searchSettings = {externalIdProp: '',scrollableHeight: '400px',
    scrollable: true, enableSearch: true};

    //  search function for the NEW search page
    //  sets $scope.scenarios array to all scenarios where name: name
    $scope.search = function() {
      console.log($scope.name);
      console.log($scope.subject);
      //console.log($scope.subject[0].label);
      var name = $scope.name;
      if($scope.subject.length === 0){
        console.log('Subject not selected');
        $scope.scenarios = Scenario.query({ name: name});
      }else{
        console.log('subject selected');
        var subjects = [];
        $scope.subject.forEach(function(element) {
          subjects.push(element.label);
        });
        console.log(subjects);
        $scope.scenarios = Scenario.query({ name: name, subject: subjects});
      }

    };
}]);

//  Function used to get subject array
//  as subjects are used in mutiple places, it is bette to have it in a single function
function subjectList() {
  return ['Maths', 'History', 'English', 'Basic Education', 'Biology', 'Estonian (native language)', 'Estonian (foreign language)',
    'Speciality language', 'Special Education', 'Physics', 'Geography', 'Educational Technology', 'Informatics', 'Human Studies', 'Chemistry', 'Physical Education',
    'Literary', 'Home Economics', 'Arts', 'Crafts', 'Natural Science', 'Economics and Business', 'Media Studies', 'Music', 'French', 'Swedish', 'German', 'Finnish',
    'Handicraft and Home Economics', 'Russian (native language)', 'Russian (foreign language)', 'Social Education'].sort();
}
function subjectJSONList() {
  return [{id: 1, label: 'Maths'}, {id: 2, label: 'History'}, {id: 3, label: 'English'}, {id: 4, label: 'Basic Education'}, {id:5, label: 'Biology'},
  {id:6, label: 'Estonian (native language)'},
  {id:7, label: 'Estonian (foreign language)'},
    {id:8, label: 'Speciality language'}, {id:9, label: 'Special Education'}, {id:10, label: 'Physics'}, {id:11, label: 'Geography'}, {id:12, label: 'Educational Technology'},
    {id:13, label: 'Informatics'}, {id:14, label: 'Human Studies'},
    {id:15, label: 'Chemistry'}, {id:16, label: 'Physical Education'},
    {id:17, label: 'Literary'}, {id:18, label: 'Home Economics'}, {id:19, label: 'Arts'}, {id:20, label: 'Crafts'}, {id:21, label: 'Natural Science'},
    {id:22, label: 'Economics and Business'},
    {id:23, label: 'Media Studies'}, {id:24, label: 'Music'},
    {id:25, label: 'French'}, {id:26, label: 'Swedish'}, {id:27, label: 'German'}, {id:28, label: 'Finnish'},
    {id:29, label: 'Handicraft and Home Economics'}, {id:30, label: 'Russian (native language)'}, {id:31, label: 'Russian (foreign language)'},
    {id:32, label: 'Social Education'}].sort();
}

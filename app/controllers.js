var leplannerControllers = angular.module('leplannerControllers', []);

//  Main controller for getting user data, logging user out
//  and scenario search on index.html
leplannerControllers.controller('MainCtrl', [
  '$scope',
  '$http',
  '$rootScope',
  '$location',
  'Scenario',
  function($scope,$http,$rootScope,$location, Scenario){

    console.log('main '+$rootScope.user);

    //  on user log in give $scope.user user data
    $scope.setUser = function(){
      $scope.user = $rootScope.user;
    };

    //  when user logs out sets the variables to null
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

    //  Search box on index.html
    $scope.searchScenario = function(name) {
      $scope.scenarios = Scenario.query({ name: name });
    };

  }
]);

//  Home controller for home page
//  show scenarios on home page
//  scenario delete function
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
        console.log(data);
        console.log(data.created);
        var ScenarioDate = moment(Scenario.created).format("DD.MM.YYYY");
        console.log(ScenarioDate);

        $scope.scenarioTime = ScenarioDate;



      })
      .error(function (data, status, headers, config) {
        console.log(data);
      });

    }

    $scope.user = $rootScope.user;

    //  subject list from array
    $scope.subjects = subjectList();

    //  default Scenario query to show all scenarios
    $scope.scenarios = Scenario.query();

    //  filter scenarios by subject on home page
    $scope.filterBySubject = function(subject) {
      $scope.scenarios = Scenario.query({ subject: subject });
    };

    //  function to delete scenarios by scenario id
    $scope.delete = function(id){
      Delete.scenario(id).success(function() {
          document.getElementById('scenarios_list').removeChild(document.getElementById(id));
        }).error(function(data, status, headers, config) {
          alert('not logged in');
        });
    };
  }
]);

//  user login controller
//  if user is logged in they will be redirected
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

//  Add controller to add scenarios
//  submit function to add scenarios with inserted criterions
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

    //  getting all needed criterions from their arrays
    $scope.subjects = subjectList();
    $scope.languages = languageList();
    $scope.licenses = licenseList();
    $scope.materials = materialList();
    $scope.methods = method2();
    $scope.stages = stageList2();

    $scope.submit = function() {
      if ($scope.name) {

          var scenario = {  //  inserts values to the scenario object
            name: $scope.name,
            subject: $scope.subject,
            author: {
              id:$scope.user._id,
              name: $scope.user.first_name +' '+$scope.user.last_name //  both names in one place
                                                                      //  used to show who made the scenario
            },
            language: $scope.language, // from ng-model
            license: $scope.license,
            materialType: $scope.materialType,
            method: $scope.method,
            stage: $scope.stage,
            description: $scope.description
          };

          //  sends the scenario object to server side - index.js
          $http.post('/api/savescenario', scenario) //  sends object to /api/savescenario (index.js)
          .success(function(data, status, headers, config) {
            console.log('saved');
            $scope.successMessage = "Scenario has been submitted successfully";
            $scope.errorMessage = null;
            //  resets the selected criterions
            $scope.name = null;
            $scope.subject = null;
            $scope.language = null;
            $scope.license = null;
            $scope.materialType = null;
            $scope.method = null;
            $scope.stage = null;
            $scope.description = null;
          }).
          error(function(data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            $scope.errorMessage = "There was an error while submitting scenario";
            $scope.successMessage = null;
          });
      }
    };
  }

]);

//  detail controller for scenario detail view
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
    //  get the scenario by its id from the URL
    Scenario.get({ _id: $routeParams.id }, function(scenario) {
      $scope.scenario = scenario;

      //  checks if the user is subscribed to the scenario
      $scope.isSubscribed = function() {
        return $scope.scenario.subscribers.indexOf($scope.user._id) !== -1;
      };
      //  subscribe to scenario
      $scope.subscribe = function() {
        Subscription.subscribe(scenario).success(function() {
          $scope.scenario.subscribers.push($scope.user._id);

        }).error(function(data, status, headers, config) {
          alert('not logged in');
        });
      };
      //  unsubscribe from scenario
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

//  Profile controller
leplannerControllers.controller('ProfileCtrl', [
  '$scope',
  '$rootScope',
  '$routeParams',
  'User',
  '$http',
  function($scope, $rootScope, $routeParams, User, $http) {


    //  USER CONTROL SCRIPT NEED TO COPY TO EVERY CONTROLLER THAT USES USER DATA!!!
    if(!$rootScope.user){
      $http({url: '/api/me', method: 'GET'})
      .success(function (data, status, headers, config) {
        $rootScope.user = data;
        $scope.user = $rootScope.user;
        $scope.$parent.setUser();
        console.log('user set Addctrl');

        //  formatted date to show on profile page
        var dates = data.created;
        var newDate = moment(User.created).format("MMMM YYYY");
        console.log(newDate);

        $scope.dateAndTime = newDate;

      }).error(function (data, status, headers, config) {console.log(data);});

    }
    //  ---------------------------------------------------------------------------
    //  get the user by its id from URL
    //   and return its data
    User.get({ _id: $routeParams.id }, function(user) {
      $scope.profile = user;
      console.log($scope.profile);


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

    //  get scenario data by its id from URL
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
            $scope.successEditing = "Scenario has been edited successfully";
            $scope.errorEditing = null;
          }).
          error(function(data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            $scope.errorEditing = "There was an error while editing scenario";
            $scope.successEditing = null;
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
  'Search',
  'Subscription',
  '$http',
  '$location',
  function($scope, $rootScope, $routeParams, Search, Subscription, $http, $location) {


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
    $scope.scenarios = Search.query();
    //  Get the subjects so we can search by them
    $scope.subjects = subjectJSONList();

    console.log($scope.scenarios);
    //  can be used later on to see on the Search page if User is subscribed to a scenario or not
    $scope.isSubscribed = function() {
      return $scope.scenario.subscribers.indexOf($scope.user._id) !== -1;
    };

    //  arrays to store selected multiple choices
    $scope.subject = [];
    $scope.method = [];
    $scope.stage = [];
    $scope.tech = [];

    //  settings for the dropdown menus
    $scope.searchSettings = {externalIdProp: '',scrollableHeight: '400px',
    scrollable: true, enableSearch: true,smartButtonMaxItems: 3,};
    $scope.methodSettings = {externalIdProp: '', selectionLimit: 1, smartButtonMaxItems: 1};
    $scope.methodText = {buttonDefaultText: 'Method'};
    $scope.stageText = {buttonDefaultText: 'Stage'};
    $scope.searchText = {buttonDefaultText: 'Subject'};

    //  get all the values from arrays to use in dropdown menus
    $scope.languages = languageList();
    $scope.licenses = licenseList();
    $scope.materials = materialList();
    $scope.methods = method();
    $scope.stages = stageList();
    $scope.techs = tech();


    //  search function for the NEW search page
    //  sets $scope.scenarios array to all scenarios where name: name
    $scope.search = function() {

      var subjects = [];
      $scope.subject.forEach(function(element) {
        subjects.push(element.label);
      });
      var method = $scope.method.label;
      var name = $scope.name;
      var stage = $scope.stage.label;
      //  empty object to include ONLY selected criterions
      var search = {

      };
      if($scope.name){search.name = name;}
      if($scope.subject.length > 0){
        search.subject = subjects;
      }
      if(method){search.method = method; console.log(method);}
      if(stage){search.stage = stage; console.log(stage);}

      //  searches all scenarios with the criterions in search object
      $scope.scenarios = Search.query(search);

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
    {id:32, label: 'Social Education'}];
}

//  license list
function licenseList() {
  return ['All rights reserved', 'Creative Commons', 'No license'];
}

//  license list
function materialList() {
  return ['Text', 'App', 'Sound', 'Test', 'Presentation'];
}

//  stage list
function stageList() {
  return [{id:1, label:'I_stage'}, {id:2, label:'II_stage'}, {id:3, label:'III_stage'}, {id:4, label:'IV_stage'}];
}
//  stage list
function stageList2() {
  return ['I_stage', 'II_stage', 'III_stage', 'IV_stage'];
}

// List of languages
function languageList() {
  return ['Estonian', 'English', 'Russian', 'Swedish', 'Latvian', 'Lithuanian', 'Finnish', 'Spanish', 'French', 'Norwegian', 'Chinese', 'Japanese'].sort();
}

function method() {
  return [{id:1, label:'Game-based'}, {id:2, label:'Project-based'}, {id:3, label:'Exploratory-based'}, {id:4, label:'Task-based'}, {id:5, label:'Inverted'}];
}
function method2() {
  return ['Game-based', 'Project-based', 'Exploratory-based', 'Task-based', 'Inverted'];
}

// Techical (database preferred)
function tech() {
  return ['VOSK', 'Arvutiklass'];
}

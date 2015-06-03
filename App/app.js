//angular
var leplannerApp = angular.module('leplannerApp', [
  'ngResource',
  'ngRoute'
  ]);

leplannerApp.config(['$routeProvider','$locationProvider','$resourseProvider',
  function($routeProvider, $locationProvider, $resourseProvider){

    $routeProvider
    .when('/', {
      templateUrl:'/views/home.html'
    })
    .when('/login',{
      templateUrl:'/views/login.html'
    })
    .otherwise({
      redirectTo:'/'
    });
  }
]);

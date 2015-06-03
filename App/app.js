//angular
var leplannerApp = angular.module('leplannerApp', [
  'ngResource',
  'ngRoute',
  'leplannerControllers'
  ]);

leplannerApp.config(['$routeProvider','$locationProvider','$resourceProvider',
  function($routeProvider, $locationProvider, $resourceProvider){

    $routeProvider
    .when('/', {
      templateUrl:'/views/home.html',
      controller: 'homeCtrl'
    })
    .when('/login', {
      templateUrl:'/views/login.html',
      controller: 'loginCtrl'
    })
    .otherwise({
      redirectTo:'/'
    });
  }
]);

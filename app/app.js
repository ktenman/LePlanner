// Angular

var leplannerApp = angular.module('leplannerApp', [
  'ngResource',
  'ngRoute'
]);

leplannerApp.config(['$routeProvider', '$locationProvider', '$resourceProvider',
  function($routeProvider, $locationProvider, $resourceProvider) {
    $routeProvider
      .when('/', {
        templateUrl: '/views/home.html'
      })
      .when('/login', {
        templateUrl: '/views/login.html'
      })
      .otherwise({
        redirectTo: '/'
      });
}]);

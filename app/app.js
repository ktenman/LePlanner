// angular
var leplannerApp = angular.module('leplannerApp', [
  'ngResource',
  'ngRoute',
  'leplannerControllers'
]);

leplannerApp.config(['$routeProvider', '$locationProvider', '$resourceProvider',
  function($routeProvider, $locationProvider, $resourceProvider){
    $routeProvider
      .when('/', {
        templateUrl: '/views/home.html',
        controller: 'homeCtrl'
      })
      .when('/login', {
        templateUrl: '/views/login.html',
        controller: 'loginCtrl'
      })
      .when('/add', {
        templateUrl: '/views/add.html',
        controller: 'addCtrl',
        resolve: {

          app: function($q, $rootScope, $location) {
              var defer = $q.defer();
              if (!$rootScope.user) {
                // only if user was not logged in
                $location.path('/login');
              }
              defer.resolve();
              return defer.promise;
          }
        }
      })
      .otherwise({
        redirectTo: '/'
      });
}]);

leplannerApp.factory('Auth', ['$window', '$http', '$rootScope', function($window, $http, $rootScope) {
  $rootScope.user = null;
  return{

      setUser : function(data){
          $rootScope.user = data;
          console.log('rootscope user saved');
      },
      unsetUser : function(){
          $rootScope.user = null;
          console.log('rootscope user unset');
      }
    };
}]);

leplannerApp.run(['$rootScope', '$location', '$http', 'Auth', function ($rootScope, $location, $http, Auth) {
    $rootScope.$on('$routeChangeStart', function (event) {

      $http({url: '/api/me', method: 'GET'})
      .success(function (data, status, headers, config) {
        if(!$rootScope.user){
          console.log('saved to rootscope');
          $rootScope.user = data;
        }
        console.log('routechange still logged in');
        console.log($rootScope.user);

      })
      .error(function (data, status, headers, config) {
        console.log(data);
        $rootScope.user = null;
      });
    });
}]);

var leplannerApp = angular.module('leplannerApp', [
  'ngResource',
  'ngRoute',
  'leplannerControllers'
]);

leplannerApp.config(['$routeProvider', '$locationProvider', '$resourceProvider',
  function($routeProvider,$locationProvider,$resourceProvider) {
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
        templateUrl: 'views/add.html',
        controller: 'AddCtrl',

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
      .when('/scenarios/:id', {
        templateUrl: 'views/detail.html',
        controller: 'DetailCtrl'
      })
      .when('/edit/:id', {
        templateUrl: 'views/edit.html',
        controller: 'EditCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });

      //$locationProvider.html5Mode(true);

  }]);

  leplannerApp.factory('Scenario', ['$resource', function($resource) {
    return $resource('/api/scenarios/:_id');
  }]);

  leplannerApp.factory('Delete', function($http){
    return {
      scenario: function(id){
        return $http.post('/api/deletescenario', { scenarioId: id});
      }
    };
  });

  leplannerApp.factory('Subscription', function($http) {
    return {
      subscribe: function(scenario) {
        return $http.post('/api/subscribe', { scenarioId: scenario._id });
      },
      unsubscribe: function(scenario) {
        return $http.post('/api/unsubscribe', { scenarioId: scenario._id });
      }
    };
  });

  leplannerApp.run(['$rootScope', '$location', '$http', function ($rootScope, $location, $http) {
      $rootScope.$on('$routeChangeStart', function (event) {
        
        console.log('onroutechange '+$rootScope.user);
        
        $http({url: '/api/me', method: 'GET'})
        .success(function (data, status, headers, config) {
         if(!$rootScope.user){
            console.log('rootscope null, saved to rootscope');
            $rootScope.user = data;
         }
          //console.log('routechange still logged in');
          //console.log($rootScope.user);

        })
        .error(function (data, status, headers, config) {
          console.log(data);
          $rootScope.user = null;
        });
      });
  }]);

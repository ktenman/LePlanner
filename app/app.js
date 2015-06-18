var leplannerApp = angular.module('leplannerApp', [
  'ngResource',
  'ngRoute',
  'leplannerControllers',
  'angularjs-dropdown-multiselect',
  'ngMessages'
]);

//  Used for tabs on the home.html
//  makes selected tab active visualy
leplannerApp.controller('TabController', function () {
      this.tab = 1;

      this.setTab = function (tabId) {
        this.tab = tabId;
      };

      this.isSet = function (tabId) {
        return this.tab === tabId;
      };
    });

//  Angular config that sets what controller is used on what page
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
      })
      .when('/scenarios/:id', {
        templateUrl: 'views/detail.html',
        controller: 'DetailCtrl'
      })
      .when('/edit/:id', {
        templateUrl: 'views/edit.html',
        controller: 'EditCtrl'
      })
      .when('/search', {
        templateUrl: 'views/search.html',
        controller: 'SearchCtrl'
      })
      .when('/profile/:id', {
        templateUrl: 'views/profile.html',
        controller: 'ProfileCtrl'
      })
      .when('/help', {
        templateUrl: 'views/help.html'
      })
      .otherwise({
        redirectTo: '/'
      });
  }]);

  //  Scenario factory that acts as a bridge between client side and server side
  leplannerApp.factory('Scenario', ['$resource', function($resource) {
    return $resource('/api/scenarios/:_id');
  }]);

  //  factory for User that acts as a bridge between client side and server side
  leplannerApp.factory('User', ['$resource', function($resource) {
    return $resource('/api/profile/:_id');
  }]);
  //  Seacrh factory that acts as a bridge between client side and server side
  leplannerApp.factory('Search', ['$resource', function($resource) {
    return $resource('/api/search/');
  }]);

  //  Delete factory that acts as a bridge between client side and server side
  //  has a function scenario that is used to delete scenarios
  leplannerApp.factory('Delete', function($http){
    return {
      scenario: function(id){
        return $http.post('/api/deletescenario', { scenarioId: id});
      }
    };
  });
  //  Subscription factory that acts as a bridge between client side and server side
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

/**
 * Created by stevenbarnhurst on 10/1/15.
 */

(function () {
  'use strict';
  var app = angular.module('catalog', ['ngRoute', 'ngCookies']);

  app.config(function($interpolateProvider){
    $interpolateProvider.startSymbol('[[').endSymbol(']]');
  });

  app.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.withCredentials = true;
  }]);

  app.run(['$rootScope', '$location', '$cookies', function ($rootScope, $location, $cookies) {
    var currentUser = $cookies.getAll();
    console.log('what');
    console.log(currentUser)
  }]);

  app.config(function($routeProvider, $locationProvider, $httpProvider) {

    //var access = routingConfig.accessLevels;

    $routeProvider
      .when('/', {
        templateUrl: 'static/partials/catalog.html',
        controller: 'CatalogCtrl'
      })
      .when('/landing', {
        templateUrl: 'static/partials/landing.html',
        controller: 'LandingCtrl'
      })
      .when('/login', {
        templateUrl: '/loginform',
        controller: 'LoginCtrl'
      })
      .when('/category', {
        templateUrl: 'static/partials/user-categories.html',
        controller: 'CategoryCtrl'
      })
      .when('create/:type/:id', {
        templateUrl: 'static/partials/user-categories-create.html',
        controller: 'CreateEditCtrl'
        //access: access.user
      })
      .when('edit/:type/:id', {
        templateUrl: 'static/partials/user-categories-create.html',
        controller: 'CreateEditCtrl'
      })
      .when('/items', {
        templateUrl: 'static/partials/categories-items.html',
        controller: 'ItemsCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
    $locationProvider.html5Mode(true);

    $httpProvider.interceptors.push(function($q, $location) {
        return {
            'responseError': function(response) {
                if(response.status === 401 || response.status === 403) {
                    $location.path('/login');
                }
                return $q.reject(response);
            }
        };
    });
  });

  app.constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
  });

  app.constant('USER_ROLES', {
    all: '*',
    registered: 'registered',
    guest: 'guest'
  });

  app.run(function ($rootScope, AUTH_EVENTS, AuthService) {
    $rootScope.$on('$stateChangeStart', function (event, next) {
      var authorizedRoles = next.data.authorizedRoles;
      if (!AuthService.isAuthorized(authorizedRoles)) {
        event.preventDefault();
        if (AuthService.isAuthenticated()) {
          // user is not allowed
          $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
        } else {
          // user is not logged in
          $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
        }
      }
    });
  });

}());
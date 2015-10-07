/**
 * Created by stevenbarnhurst on 10/1/15.
 */

(function () {
  'use strict';
  var app = angular.module('catalog', ['ngRoute']);

  app.config(function($interpolateProvider){
    $interpolateProvider.startSymbol('[[').endSymbol(']]');
  });

  //app.config(function ($httpProvider) {
  //  $httpProvider.interceptors.push([
  //    '$injector',
  //    function ($injector) {
  //      return $injector.get('AuthInterceptor');
  //    }
  //  ]);
  //});

  app.config(function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'static/partials/catalog.html',
        controller: 'CatalogCtrl'
      })
      .when('/landing', {
        templateUrl: 'static/partials/landing.html',
        controller: 'LandingCtrl'
      })
      .when('/loginpage', {
        templateUrl: '/loginform',
        controller: 'LoginCtrl'
      })
      .when('/category', {
        templateUrl: 'static/partials/user-categories.html',
        controller: 'CategoryCtrl'
      })
      .when('create/:type/:id', {
        templateUrl: 'static/partials/user-categories-create.html',
        controller: 'CreateEditCtrl',
      })
      .when('edit/:type/:id', {
        templateUrl: 'static/partials/user-categories-create.html',
        controller: 'CreateEditCtrl',
      })
      .when('/items', {
        templateUrl: 'static/partials/categories-items.html',
        controller: 'ItemsCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
    $locationProvider.html5Mode(true);
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
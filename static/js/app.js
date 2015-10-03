/**
 * Created by stevenbarnhurst on 10/1/15.
 */

(function () {

    'use strict';
var app = angular.module('catalog', ['ngRoute']);

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
      .when('/category', {
        templateUrl: 'static/partials/user-categories.html',
        controller: 'CategoryCtrl'
      })
      .when('/category/:cat_id/create', {
        templateUrl: 'static/partials/user-categories-create.html',
        controller: 'CreateEditCtrl'
      })
      .when('/category/:cat_id/edit/:item_id', {
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


}());
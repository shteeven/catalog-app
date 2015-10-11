/**
 * Created by stevenbarnhurst on 10/1/15.
 * Modal operations and functions courtesy of Ben Nadel (http://www.bennadel.com/blog/2806-creating-a-simple-modal-system-in-angularjs.htm)
 */

(function () {
  'use strict';
  var app = angular.module('catalog', ['ui.router', 'ui.bootstrap', 'ngResource', 'ngCookies', 'ngMessages']);

  app.config(function($interpolateProvider){
    $interpolateProvider.startSymbol('[[').endSymbol(']]');
  });

  app.run(['$rootScope', '$cookies', '$state', 'AuthService', function ($rootScope, $cookies, $state, AuthService) {

    var isLoggedin = $cookies.get('loggedin');
    if (isLoggedin != '') {
      AuthService.setUserData();
    }
    // direct on initial page load based on login status
    if ($state.current.name == '') {
      if (isLoggedin === '') {
        $state.go('landing')
      } else {
        $state.go('home')
      }
    }

  }]);

  app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {

    $stateProvider
      .state('home', {
        url: '/home',
        templateUrl: 'static/partials/catalog.html',
        controller: 'CatalogCtrl'
      })
      .state('landing', {
        url: '/landing',
        templateUrl: 'static/partials/landing.html',
        controller: 'LandingCtrl'
      })
      .state('login', {
        url: '/login',
        templateUrl: '/loginform',
        controller: 'LoginCtrl'
      })
      .state('categories', {
        url: '/categories',
        templateUrl: 'static/partials/categories.html',
        controller: 'CategoryCtrl'
      })
      .state('createCategory', {
        url: '/category/create',
        templateUrl: 'static/partials/categories-create.html',
        controller: 'CategoryCreateCtrl'
      })
      .state('editCategory', {
        url: '/category/:id/edit',
        templateUrl: 'static/partials/categories-edit.html',
        controller: 'CategoryEditCtrl'
      })
      .state('items', {
        url: '/items',
        templateUrl: 'static/partials/items.html',
        controller: 'ItemCtrl'
      })
      .state('createItem', {
        url: '/item/create',
        templateUrl: 'static/partials/items-create.html',
        controller: 'ItemCreateCtrl'
      })
      .state('editItem', {
        url: '/item/:id/edit',
        templateUrl: 'static/partials/items-edit.html',
        controller: 'ItemEditCtrl'
      })
      .state('test', {
        url: '/test',
        templateUrl: 'static/partials/test.html',
        controller: 'TestCtrl'
      });
    $urlRouterProvider.otherwise('/');

    $locationProvider.html5Mode(true);

    //$httpProvider.interceptors.push(function($q, $location) {
    //    return {
    //        'responseError': function(response) {
    //            if(response.status === 401 || response.status === 403) {
    //                $location.path('/login');
    //            }
    //            return $q.reject(response);
    //        }
    //    };
    //});
  });

  //app.constant('AUTH_EVENTS', {
  //  loginSuccess: 'auth-login-success',
  //  loginFailed: 'auth-login-failed',
  //  logoutSuccess: 'auth-logout-success',
  //  sessionTimeout: 'auth-session-timeout',
  //  notAuthenticated: 'auth-not-authenticated',
  //  notAuthorized: 'auth-not-authorized'
  //});
  //
  //app.constant('USER_ROLES', {
  //  all: '*',
  //  registered: 'registered',
  //  guest: 'guest'
  //});

  //app.run(function ($rootScope, AUTH_EVENTS, AuthService) {
  //  $rootScope.$on('$stateChangeStart', function (event, next) {
  //    var authorizedRoles = next.data.authorizedRoles;
  //    if (!AuthService.isAuthorized(authorizedRoles)) {
  //      event.preventDefault();
  //      if (AuthService.isAuthenticated()) {
  //        // user is not allowed
  //        $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
  //      } else {
  //        // user is not logged in
  //        $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
  //      }
  //    }
  //  });
  //});

}());
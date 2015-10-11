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

    ///////////////////////////////////
    // Handle display of error messages
    //////////////////////////////////
    $rootScope.serverRejects = [];

    $rootScope.removeServerReject = function(msg) {
      var index = $rootScope.serverRejects.indexOf(msg);
      $rootScope.serverRejects.splice(index, 1);
    };

    $rootScope.addServerReject = function (msg) {
      $rootScope.serverRejects.push(msg);
    };

    $rootScope.$on('$stateChangeSuccess', function(){
      $rootScope.serverRejects.splice(0,$rootScope.serverRejects.length)
    });

    ///////////////////////////////////
    // Handle login
    //////////////////////////////////
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

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
      if (toState.name === 'login' && isLoggedin != '') {
        event.preventDefault();
        $state.go('home')
      }
      var restricted = ['editCategory', 'createCategory', 'editItem', 'createItem'];
      if (restricted.indexOf(toState.name) != -1 && isLoggedin === '') {
        $rootScope.addServerReject('You must sign in to access this page.');
        event.preventDefault();
        $state.go('login')
      }
    });

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

  });

  app.config(function ($provide, $httpProvider) {
    $provide.factory('ErrorInterceptor', function ($q, $rootScope) {
      return {
        responseError: function(rejection) {

          $rootScope.serverRejects.push(rejection.data.message);
          console.log(rejection);

          return $q.reject(rejection);
        }
      };
    });

    $httpProvider.interceptors.push('ErrorInterceptor');
  });

}());
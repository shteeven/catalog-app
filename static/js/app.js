/**
 * Created by stevenbarnhurst on 10/1/15.
 */

(function () {
  'use strict';
  var app = angular.module('catalog', ['ui.router', 'ui.bootstrap', 'ngResource', 'ngCookies', 'ngMessages', 'ngAnimate']);

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
    $rootScope.isLoggedin = $cookies.get('loggedin') || '';

    if ($rootScope.isLoggedin != '') {
      AuthService.setUserData();
    }
    // direct on initial page load based on login status
    if ($state.current.name == '') {
      if ($rootScope.isLoggedin === '') {
        $state.go('landing')
      } else {
        $state.go('home')
      }
    }

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
      if (toState.name === 'login' && $rootScope.isLoggedin != '') {
        event.preventDefault();
        $state.go('home')
      }
      var restricted = ['editCategory', 'createCategory', 'editItem', 'createItem'];
      if (restricted.indexOf(toState.name) != -1 && $rootScope.isLoggedin === '') {
        event.preventDefault();
        $state.go('login');
        //$rootScope.addServerReject('You must sign in to access this page.');
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
        url: '/categories/:u_id',
        params: {
          u_id: {
            value: null,
            squash: false
          }
        },
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
        url: '/items/c/:c_id',
        params: {
          c_id: {
            value: null,
            squash: false
          }
        },
        templateUrl: 'static/partials/items.html',
        controller: 'ItemCtrl'
      })
      .state('u_items', {
        url: '/items/u/:u_id',
        params: {
          u_id: {
            value: null,
            squash: false
          }
        },
        templateUrl: 'static/partials/items.html',
        controller: 'ItemCtrl'
      })
      .state('createItem', {
        url: '/item/create',
        params: {
          c_id: {
            value: null,
            squash: false
          }
        },
        templateUrl: 'static/partials/items-create.html',
        controller: 'ItemCreateCtrl'
      })
      .state('editItem', {
        url: '/item/:id/edit',
        templateUrl: 'static/partials/items-edit.html',
        controller: 'ItemEditCtrl'
      });

    $urlRouterProvider.otherwise('/');

    $locationProvider.html5Mode(true);

  });

  app.config(function ($provide, $httpProvider) {
    $provide.factory('ErrorInterceptor', function ($q, $rootScope) {
      return {
        responseError: function(rejection) {
          if (rejection.data.message) {
            $rootScope.serverRejects.push(rejection.data.message);
          } else {
            $rootScope.serverRejects.push(rejection.data);
          }
          return $q.reject(rejection);
        }
      };
    });

    $httpProvider.interceptors.push('ErrorInterceptor');
  });

}());
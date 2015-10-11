/**
 * Created by stevenbarnhurst on 10/3/15.
 * Login services courtesy of Gert Hengeveld at
 * https://medium.com/opinionated-angularjs/techniques-for-authentication-in-angularjs-applications-7bbf0346acec
 */
(function () {

    'use strict';
  var app = angular.module('catalog');

  //////////////////
  //AUTHENTICATION//
  //////////////////
  app.factory('AuthService', function ($http, $cookies, $state) {
    var authService = {};

    authService.currentUser = {};

    // login user on server and return access token
    authService.login = function (credentials) {
      return $http({
        method: 'POST',
        url: '/api/login',
        data: $.param(credentials),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
        .success(function (data, status, headers, config) {
          $cookies.put('loggedin', 'true');
          authService.setUserData();
          $state.go('home');
        })
        .error(function (data, status, headers, config) {
          // Handle login errors here
          console.log(data);
        });
    };

    // register user and return access token
    authService.register = function (credentials) {
      return $http({
        method: 'POST',
        url: '/api/register',
        data: $.param(credentials),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded'}
        })
        .success(function (data, status, headers, config) {
          $cookies.put('loggedin', 'true');
          authService.setUserData();
          $state.go('home');
        })
        .error(function (data, status, headers, config) {
          // Handle login errors here
          console.log(data);
        });
    };

    // Authorize user with oauth
    authService.gSignin = function (authResult) {
      return $http({
        method: "POST",
        url: '/api/gconnect?state='+$cookies.get('XSRF-TOKEN'),
        headers: { 'Content-Type': 'application/octet-stream; charset=utf-8' },
        data: authResult['code'],
        transformRequest: []
        })
        .success(function () {
          $cookies.put('loggedin', 'true');
          authService.setUserData();
          $state.go('home');
        })
        .error(function (data, status, headers, config) {
          console.log(data); // Handle login errors here
        });
    };

    authService.logout = function () {
      return $http
        .get('/api/disconnect')
        .success(function () {
          $cookies.put('loggedin', '');
          $cookies.remove('user');
          $cookies.remove('userInfo');
          authService.currentUser = angular.copy({}, authService.currentUser);
          $state.go('landing');
        })
        .error(function (err) {
          console.log(err);
        });
    };

    // get current user from server
    authService.setUserData = function () {
      return $http
        .get('/api/userdata')
        .success(function (data, status, headers, config) {
          authService.currentUser = angular.copy(data, authService.currentUser);
        })
        .error(function (err) {
          $cookies.put('loggedin', '');
          console.log(err);
        });
    };

    authService.getUserData = function () {
      return authService.currentUser
    };

    return authService;
  });

  //////////////////
  ///RESOURCES//////
  //////////////////
  app.factory('Category', function($resource) {
    return $resource('/api/category/:id', {id: '@id'}, {
        update: {
          method: 'PUT' // this method issues a PUT request
        }
      }, {
        stripTrailingSlashes: false
      });
  });

  app.factory('Item', function ($resource) {
    return $resource('/api/category/:id', {id: '@id'}, {
      update: {
        method: 'PUT' // this method issues a PUT request
      }
    }, {
      stripTrailingSlashes: false
    });
  });


}());
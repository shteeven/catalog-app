/**
 * Created by stevenbarnhurst on 10/3/15.
 * Login services courtesy of Gert Hengeveld at
 * https://medium.com/opinionated-angularjs/techniques-for-authentication-in-angularjs-applications-7bbf0346acec
 */
(function () {

    'use strict';
  var app = angular.module('catalog');

  app.factory('AuthService', function ($http, $window, $cookies) {
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
          return data;
        })
        .error(function (data, status, headers, config) {
          // Erase the token if the user fails to log in
          delete $window.sessionStorage.token;

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
          return data;
        })
        .error(function (data, status, headers, config) {
          // Erase the token if the user fails to log in
          delete $window.sessionStorage.token;

          // Handle login errors here
          console.log(data);
        });
    };

    // Authorize user with oauth
    authService.gSignin = function (authResult) {
      return $http({
        method: "POST",
        url: '/gconnect?state='+$cookies.get('XSRF-TOKEN'),
        headers: {
          'Content-Type': 'application/octet-stream; charset=utf-8'
        },
        data: authResult['code'],
        transformRequest: [] })
        .success(function (data, status, headers, config) {
          $cookies.put('loggedin', 'true');
          return data;
        })
        .error(function (data, status, headers, config) {
          // Erase the token if the user fails to log in
          delete $window.sessionStorage.token;

          // Handle login errors here
          console.log(data);
        });
    };

    authService.logout = function () {
      return $http
        .get('/api/disconnect')
        .success(function (data, status, headers, config) {
          $cookies.put('loggedin', '');
          $cookies.remove('user');
          $cookies.remove('userInfo');
          return data;
        })
        .error(function (data, status, headers, config) {
          // Erase the token if the user fails to log in

          // Handle login errors here
          console.log(data);
        });
    };

    // get current user from server
    authService.setUserData = function () {
      return $http
        .get('/api/userdata')
        .success(function (data, status, headers, config) {
          authService.currentUser = angular.copy(data, authService.currentUser);
          return data;
        })
        .error(function (data, status, headers, config) {
          // Erase the token if the user fails to log in
          $cookies.put('loggedin', '');
          // Handle login errors here
          console.log(data);
        });
    };

    authService.getUserData = function () {
      return authService.currentUser
    };

    return authService;
  });

  app.factory('UserService', function ($http, $window) {
    var userService = {};

    userService.getData = function (token) {
      return $http
        .get('/api/userdata', token)
        .success(function (data, status, headers, config) {
          $window.sessionStorage.user = data;
        })
    };

    return userService;

    //userService.create = function (sessionId, userId, username, userEmail) {
    //  this.id = userId;
    //  this.userId = userId;
    //  this.username = username;
    //  this.userEmail = userEmail;
    //};
    //userService.destroy = function () {
    //  this.id = null;
    //  this.userId = null;
    //  this.username = null;
    //  this.userEmail = null;
    //};
  });


}());
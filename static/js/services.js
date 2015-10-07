/**
 * Created by stevenbarnhurst on 10/3/15.
 * Login services courtesy of Gert Hengeveld at
 * https://medium.com/opinionated-angularjs/techniques-for-authentication-in-angularjs-applications-7bbf0346acec
 */
(function () {

    'use strict';
  var app = angular.module('catalog');

  app.factory('AuthService', function ($http, $window) {
    var authService = {};

    // login user on server and return access token
    authService.login = function (credentials) {
      return $http
        .post('/login', credentials)
        .success(function (data, status, headers, config) {
          $window.sessionStorage.token = data.token;
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
      return $http
        .post('/register', credentials)
        .success(function (data, status, headers, config) {
          $window.sessionStorage.token = data.token;
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
    authService.gSignin = function (authResult, state) {
      return $http({
        method: "POST",
        url: '/gconnect?state='+state,
        headers: {
          'Content-Type': 'application/octet-stream; charset=utf-8'
        },
        data: authResult['code'],
        transformRequest: [] })
        .success(function (data, status, headers, config) {
          $window.sessionStorage.token = data.token;
          return data;
        })
        .error(function (data, status, headers, config) {
          // Erase the token if the user fails to log in
          delete $window.sessionStorage.token;

          // Handle login errors here
          console.log(data);
        });
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






  //THIS BELONGS IN THE AUTH SERVICE PROVIDER

  //authService.isAuthenticated = function () {
    //  return !!Session.userId;
    //};
    //
    //authService.isAuthorized = function (authorizedRoles) {
    //  if (!angular.isArray(authorizedRoles)) {
    //    authorizedRoles = [authorizedRoles];
    //  }
    //  return (authService.isAuthenticated() &&
    //    authorizedRoles.indexOf(Session.userRole) !== -1);
    //};






  //app.service('Session', function () {
  //  this.create = function (sessionId, userId, username, userEmail) {
  //    this.id = userId;
  //    this.userId = userId;
  //    this.username = username;
  //    this.userEmail = userEmail;
  //  };
  //  this.destroy = function () {
  //    this.id = null;
  //    this.userId = null;
  //    this.username = null;
  //    this.userEmail = null;
  //  };
  //});

  //app.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
  //  return {
  //    responseError: function (response) {
  //      $rootScope.$broadcast({
  //        401: AUTH_EVENTS.notAuthenticated,
  //        403: AUTH_EVENTS.notAuthorized,
  //        419: AUTH_EVENTS.sessionTimeout,
  //        440: AUTH_EVENTS.sessionTimeout
  //      }[response.status], response);
  //      return $q.reject(response);
  //    }
  //  };
  //});

  //app.factory('AuthResolver', function ($q, $rootScope, $route) {
  //  return {
  //    resolve: function () {
  //      var deferred = $q.defer();
  //      var unwatch = $rootScope.$watch('currentUser', function (currentUser) {
  //        if (angular.isDefined(currentUser)) {
  //          if (currentUser) {
  //            deferred.resolve(currentUser);
  //          } else {
  //            deferred.reject();
  //            $route.go('user-login');
  //          }
  //          unwatch();
  //        }
  //      });
  //      return deferred.promise;
  //    }
  //  };
  //});

}());
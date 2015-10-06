/**
 * Created by stevenbarnhurst on 10/3/15.
 * Login services courtesy of Gert Hengeveld at
 * https://medium.com/opinionated-angularjs/techniques-for-authentication-in-angularjs-applications-7bbf0346acec
 */
(function () {

    'use strict';
  var app = angular.module('catalog');

  app.factory('AuthService', function ($http, Session) {
    var authService = {};

    authService.login = function (credentials) {
      return $http
        .post('/login', credentials)
        .then(function (res) {
          Session.create(res.data.user_id, res.data.user_id,
                         res.data.username, res.email);
          return res.data;
        }, function(err) {
          console.log(err);
        });
    };

    authService.register = function (credentials) {
      return $http
        .post('/register', credentials)
        .then(function (res) {
          Session.create(res.data.user_id, res.data.user_id,
                         res.data.username, res.email);
          return res.data;
        }, function(err) {
          console.log(err);
        });
    };

    authService.isAuthenticated = function () {
      return !!Session.userId;
    };

    authService.isAuthorized = function (authorizedRoles) {
      if (!angular.isArray(authorizedRoles)) {
        authorizedRoles = [authorizedRoles];
      }
      return (authService.isAuthenticated() &&
        authorizedRoles.indexOf(Session.userRole) !== -1);
    };

    return authService;
  });

  app.service('Session', function () {
    this.create = function (sessionId, userId, username, userEmail) {
      this.id = userId;
      this.userId = userId;
      this.username = username;
      this.userEmail = userEmail;
    };
    this.destroy = function () {
      this.id = userId;
      this.userId = userId;
      this.username = username;
      this.userEmail = userEmail;
    };
  });

  app.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
    return {
      responseError: function (response) {
        $rootScope.$broadcast({
          401: AUTH_EVENTS.notAuthenticated,
          403: AUTH_EVENTS.notAuthorized,
          419: AUTH_EVENTS.sessionTimeout,
          440: AUTH_EVENTS.sessionTimeout
        }[response.status], response);
        return $q.reject(response);
      }
    };
  });

  app.factory('AuthResolver', function ($q, $rootScope, $route) {
    return {
      resolve: function () {
        var deferred = $q.defer();
        var unwatch = $rootScope.$watch('currentUser', function (currentUser) {
          if (angular.isDefined(currentUser)) {
            if (currentUser) {
              deferred.resolve(currentUser);
            } else {
              deferred.reject();
              $route.go('user-login');
            }
            unwatch();
          }
        });
        return deferred.promise;
      }
    };
  });

}());
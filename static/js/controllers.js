/**
 * Created by stevenbarnhurst on 10/1/15.
 */


(function () {

  'use strict';
var app = angular.module('catalog');

  app.controller('MainCtrl', ['$scope', 'USER_ROLES', 'AuthService', function($scope, USER_ROLES, AuthService) {

    $scope.currentUser = null;
    $scope.userRoles = USER_ROLES;
    $scope.isAuthorized = AuthService.isAuthorized;

    $scope.setCurrentUser = function (user) {
      $scope.currentUser = user;
    };

    $scope.menuToggle = function() {
      $scope.menu_toggled = !$scope.menu_toggled;
    };


  }]);

  app.controller('CreateEditCtrl', ['$scope', '$routeParams', function($scope, $routeParams) {}]);

  app.controller('LandingCtrl', ['$scope', '$log', '$http', function($scope, $log, $http) {}]);

  app.controller('CatalogCtrl', ['$scope', '$log', '$http', function($scope, $log, $http) {}]);

  app.controller('CategoryCtrl', ['$scope', '$log', '$http', function($scope, $log, $http) {}]);

  app.controller('ItemsCtrl', ['$scope', '$log', '$http', function($scope, $log, $http) {}]);

  app.controller('LoginController', function ($scope, $rootScope, AUTH_EVENTS, AuthService) {
    $scope.credentials = {
      username: '',
      password: ''
    };
    $scope.login = function (credentials) {
      AuthService.login(credentials).then(function (user) {
        $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
        $scope.setCurrentUser(user);
      }, function () {
        $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
      });
    };
  });

}());
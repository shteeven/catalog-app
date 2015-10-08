/**
 * Created by stevenbarnhurst on 10/1/15.
 */


(function () {

  'use strict';
var app = angular.module('catalog');

  app.controller('MainCtrl', ['$scope', '$window', 'AuthService', 'UserService', function($scope, $window, AuthService, UserService) {
    $scope.currentUser = {};

    $scope.setCurrentUser = function (token) {
      UserService.getData(token)
        .then(function (res) {
          $scope.currentUser = res.data;
        }, function (err) {
          console.log(err)
        });

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

  app.controller('LoginCtrl', ['$scope', '$window', '$location', 'AuthService', function ($scope, $window, $location, AuthService) {
    $scope.credentials = {
      email: '',
      username: '',
      password: ''
    };

    $scope.register = function (credentials) {
      AuthService.register(credentials).then(function (token) {
        $scope.setCurrentUser(token);
        $scope.credentials = {};
        $location.path('/')
      }, function (err) {
        console.log(err)
      });
    };

    $scope.login = function (credentials) {
      console.log(credentials);
      AuthService.login(credentials).then(function (token) {
        $scope.setCurrentUser(token);
        $scope.credentials = {};
        $location.path('/');
      }, function (err) {
        console.log(err)
      });
    };

    $window.signInCallback = function(authResult) {
      AuthService.gSignin(authResult, $scope.state).then(function (token) {
        $scope.setCurrentUser(token);
        $location.path('/');
      }, function (err) {
        console.log(err)
      });
    };
  }]);
}());
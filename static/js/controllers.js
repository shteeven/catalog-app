/**
 * Created by stevenbarnhurst on 10/1/15.
 */


(function () {

  'use strict';
var app = angular.module('catalog');

  app.controller('MainCtrl', ['$scope', '$window', 'AuthService', function($scope, $window, AuthService) {

    $scope.menu_toggled = false; // initialize toggle

    $scope.currentUser = AuthService.getUserData();

    $scope.$watch('currentUser', function(newValue) { $scope.currentUser = newValue; });

    $scope.menuToggle = function() { $scope.menu_toggled = !$scope.menu_toggled; };

    $scope.logout = function() { AuthService.logout(); }

  }]);

  app.controller('CreateEditCtrl', ['$scope', '$routeParams', function($scope, $routeParams) {}]);

  app.controller('LandingCtrl', ['$scope', '$log', '$http', function($scope, $log, $http) {}]);

  app.controller('CatalogCtrl', ['$scope', '$log', '$http', function($scope, $log, $http) {}]);

  app.controller('CategoryCtrl', ['$scope', '$log', '$http', function($scope, $log, $http) {}]);

  app.controller('ItemsCtrl', ['$scope', '$log', '$http', function($scope, $log, $http) {}]);

  app.controller('LoginCtrl', ['$scope', '$window', '$location', 'AuthService', function ($scope, $window, $location, AuthService) {

    $scope.credentials = { email: '', username: '', password: ''};

    $scope.register = function (credentials) { AuthService.register(credentials)
      .then(function () { $scope.credentials = {} }, function (err) { console.log(err) });};

    $scope.login = function (credentials) { AuthService.login(credentials)
      .then(function (data) { $scope.credentials = {}; }, function (err) { console.log(err) });};

    $window.signInCallback = function(authResult) { AuthService.gSignin(authResult);
    console.log('why');
    };

  }]);

}());
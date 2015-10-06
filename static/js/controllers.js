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

  app.controller('LandingCtrl', ['$scope', '$log', '$http', function($scope, $log, $http) {

    $scope.toggleLogin = function(){
      console.log('toggling')
      $scope.loginToggled = !$scope.loginToggled
    };
  }]);

  app.controller('CatalogCtrl', ['$scope', '$log', '$http', function($scope, $log, $http) {}]);

  app.controller('CategoryCtrl', ['$scope', '$log', '$http', function($scope, $log, $http) {}]);

  app.controller('ItemsCtrl', ['$scope', '$log', '$http', function($scope, $log, $http) {}]);

  app.controller('LoginController', function ($scope, $rootScope, $window, AUTH_EVENTS, AuthService) {
    $scope.credentials = {
      email: '',
      username: '',
      password: ''
    };

    $scope.register = function (credentials) {
      AuthService.register(credentials).then(function (user) {
        console.log(user);
        $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
        $scope.setCurrentUser(user);
      }, function () {
        $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
      });
    };

    $scope.login = function (credentials) {
      AuthService.login(credentials).then(function (user) {
        console.log(user);
        $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
        $scope.setCurrentUser(user);
      }, function () {
        $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
      });
    };

    $window.signInCallback = function(authResult) {
    if (authResult['code']) {
      // Hide the sign-in button now that the user is authorized
      $('#signinButton').attr('style', 'display: none');
      // Send the one-time-use code to the server, if the server responds, write a 'login successful' message to the web page and then redirect back to the main restaurants page
      $.ajax({
        type: 'POST',
        url: '/gconnect?state={{STATE}}',
        processData: false,
        data: authResult['code'],
        contentType: 'application/octet-stream; charset=utf-8',
        success: function(result) {
          // Handle or verify the server response if necessary.
          if (result) {
            console.log(result);
          } else if (authResult['error']) {
          console.log('There was an error: ' + authResult['error']);
          } else {
          $('#result').html('Failed to make a server-side call. Check your configuration and console.');
          }
        }

      }); } }

  });

}());
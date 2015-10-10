/**
 * Created by stevenbarnhurst on 10/1/15.
 */


(function () {

  'use strict';
var app = angular.module('catalog');

  app.controller('MainCtrl', ['$scope', '$window', 'AuthService', function($scope, $window, AuthService) {

    $scope.menu_toggled = false; // initialize toggle

    $scope.menuToggle = function() { $scope.menu_toggled = !$scope.menu_toggled; };

    // USER Authentication
    $scope.currentUser = AuthService.getUserData();

    $scope.$watch('currentUser', function(newValue) { $scope.currentUser = newValue; });

    $scope.logout = function() { AuthService.logout(); }

  }]);

  // Primary page for non-logged users
  app.controller('LandingCtrl', ['$scope', function($scope) {}]);

  // Primary page for logged in users
  app.controller('CatalogCtrl', ['$scope', function($scope) {}]);

  app.controller('CategoryCtrl', ['$scope', 'Catalog', function($scope, Catalog) {
    var entry = Catalog.get({ id: $scope.id }, function() {
      console.log(entry);
    }); // get() returns a single entry

    var entries = Catalog.query(function() {
      console.log(entries);
    }); //query() returns all the entries

    $scope.entry = new Catalog(); //You can instantiate resource class

    $scope.entry.data = 'some data';

    Catalog.save($scope.entry, function() {
      //data saved. do something here.
    }); //saves an entry. Assuming $scope.entry is the Entry object
  }]);

  app.controller('ItemsCtrl', ['$scope', function($scope) {}]);

  app.controller('LoginCtrl', ['$scope', '$window', '$location', 'AuthService', function ($scope, $window, $location, AuthService) {

    $scope.credentials = { email: '', username: '', password: ''};

    $scope.register = function (credentials) { AuthService.register(credentials)
      .then(function () { $scope.credentials = {} }, function (err) { console.log(err) });
    };

    $scope.login = function (credentials) { AuthService.login(credentials)
      .then(function (data) { $scope.credentials = {}; }, function (err) { console.log(err) });
    };

    $window.signInCallback = function(authResult) { AuthService.gSignin(authResult) };

  }]);

  app.controller('CreateEditCtrl', ['$scope', '$routeParams', function($scope, $routeParams) {}]);

  app.controller('TestCtrl', ['$scope', function($scope) {}]);


}());
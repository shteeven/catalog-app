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

  app.controller('CategoryCtrl', ['$scope', '$state', '$window', 'Category', function($scope, $state, $window, Category) {
    $scope.categories = Category.query(function () {
      console.log($scope.categories)
      console.log($scope.currentUser)
    }); //fetch all movies. Issues a GET to /api/movies

    // ADD DELETE FEATURE LATER
    //$scope.deleteMovie = function(movie) { // Delete a movie. Issues a DELETE to /api/movies/:id
    //  if (popupService.showPopup('Really delete this?')) {
    //    movie.$delete(function() {
    //      $window.location.href = ''; //redirect to home
    //    });
    //  }
    //};
  }]);

  app.controller('CategoryCreateCtrl', ['$scope', 'Category', '$state', function($scope, Category, $state) {
    $scope.category = new Category();  //create new Category instance. Properties will be set via ng-model on UI

    $scope.createCategory = function() { //create a new category. Issues a POST to /api/category
      $scope.category.$save(function() {
        $state.go('categories'); // on success go back to categories page
      }, function(err) {
        if (err.status === 401) {
          $state.go('login');
        } else {
          console.log('we should add messages on the rootscope to alert the user of the error.')
        }

      });
    };
  }]);

  app.controller('CategoryEditCtrl', ['$scope', 'Category', function($scope, Category) {
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

  app.controller('ItemCtrl', ['$scope', 'Item', function($scope, Item) {}]);

  app.controller('ItemCreateCtrl', ['$scope', 'Item', function($scope, Item) {}]);

  app.controller('ItemEditCtrl', ['$scope', 'Item', function($scope, Item) {}]);

  app.controller('LoginCtrl', ['$scope', '$window', 'AuthService', function ($scope, $window, AuthService) {

    $scope.credentials = { email: '', username: '', password: ''};

    $scope.register = function (credentials) { AuthService.register(credentials)
      .then(function () { $scope.credentials = {} }, function (err) { console.log(err) });
    };

    $scope.login = function (credentials) { AuthService.login(credentials)
      .then(function (data) { $scope.credentials = {}; }, function (err) { console.log(err) });
    };

    $window.signInCallback = function(authResult) { AuthService.gSignin(authResult) };

  }]);

}());
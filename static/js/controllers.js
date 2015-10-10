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
      console.log($scope.categories);
      console.log($scope.currentUser);
    }); //fetch all categories. Issues a GET to /api/categories

    // ADD DELETE FEATURE LATER
    $scope.deleteCategory = function(category) { // Delete a movie. Issues a DELETE to /api/movies/:id
      if (popupService.showPopup('Really delete this?')) {
        movie.$delete(function(resp) {
          console.log('resp');
        });
      }
    };
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

  app.controller('CategoryEditCtrl', ['$scope', 'Category', '$stateParams', '$state', function($scope, Category, $stateParams, $state) {
    $scope.updateCategory = function() { //Update the edited category. Issues a PUT to /api/category/:id
      $scope.category.$update(function() {
        $state.go('categories'); // on success go back to categories
      });
    };

    $scope.loadCategory = function() { //Issues a GET request to /api/categories/:id to get a category
      $scope.category = Category.get({ id: $stateParams.id });
    };

    $scope.loadCategory(); // Load a movie which can be edited on UI
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
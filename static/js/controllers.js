/**
 * Created by stevenbarnhurst on 10/1/15.
 */


(function () {

  'use strict';
var app = angular.module('catalog');

  app.controller('MainCtrl', ['$scope', '$window', '$rootScope', 'AuthService', function($scope, $window, $rootScope, AuthService) {

    $scope.menu_toggled = false; // initialize toggle

    $scope.menuToggle = function() { $scope.menu_toggled = !$scope.menu_toggled; };

    // USER Authentication
    $scope.currentUser = AuthService.getUserData();

    $scope.$watch('currentUser', function(newValue) { $scope.currentUser = newValue; });

    $scope.logout = function() { AuthService.logout(); };


  }]);


  // Primary page for non-logged users
  app.controller('LandingCtrl', ['$scope', function($scope) {}]);


  // Primary page for logged in users
  app.controller('CatalogCtrl', ['$scope', function($scope) {}]);


  app.controller('CategoryCtrl', ['$scope', 'Category', '$uibModal', function($scope, Category, $uibModal) {
    $scope.categories = Category.query(function () {}); //fetch all categories. Issues a GET to /api/categories

    $scope.deleteCategory = function(category) {
      category.$delete(function(resp) {
        $scope.categories = Category.query(function () {});
      })
    };

    $scope.open = function (category) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: '../static/partials/_confirm_delete.html',
        controller: 'ModalInstanceCtrl',
        size: 'sm',
        resolve: {
          header: function () { return 'Are you sure?' },
          body: function () {
            return 'If you delete this category, all items under it will also be deleted.'
          }
        }
      });

      modalInstance.result.then(function () {
        $scope.deleteCategory(category);
      }, function () {});
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


  app.controller('ItemCtrl', ['$scope', 'Item', function($scope, Item) {
    // I open a Confirm-type modal.
    $scope.confirmSomething = function() {
      // The .open() method returns a promise that will be either
      // resolved or rejected when the modal window is closed.
      var promise = modals.open("confirm", {
          message: "Are you sure you want to taste that?!"
        });
      promise.then(function handleResolve( response ) {
          console.log( "Confirm resolved." );
        },
        function handleReject( error ) {
          console.warn( "Confirm rejected!" );
        });
    };
  }]);


  app.controller('ItemCreateCtrl', ['$scope', 'Item', function($scope, Item) {}]);


  app.controller('ItemEditCtrl', ['$scope', 'Item', function($scope, Item) {}]);


  app.controller('LoginCtrl', ['$scope', '$window', 'AuthService', function ($scope, $window, AuthService) {

    $scope.credentials = { email: '', username: '', password: ''};

    $scope.show_signin = true;

    $scope.toggleSignin = function (val) {
      $scope.show_signin = val;
    };

    $scope.register = function (credentials) { AuthService.register(credentials)
      .then(function () { $scope.credentials = {} }, function (err) { console.log(err) });
    };

    $scope.login = function (credentials) { AuthService.login(credentials)
      .then(function (data) { $scope.credentials = {}; }, function (err) { console.log(err) });
    };

    $window.signInCallback = function(authResult) { AuthService.gSignin(authResult) };

  }]);


  app.controller('ModalInstanceCtrl', function ($scope, $modalInstance, header, body) {

    $scope.header = header;
    $scope.body = body;

    $scope.delete = function () { $modalInstance.close(); };

    $scope.cancel = function () { $modalInstance.dismiss(); };
  });


}());
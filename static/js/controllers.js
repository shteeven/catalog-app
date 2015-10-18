/**
 * Created by stevenbarnhurst on 10/1/15.
 */


(function () {

  'use strict';
var app = angular.module('catalog');

  app.controller('MainCtrl', ['$scope', '$window', '$rootScope', 'AuthService', '$state', function($scope, $window, $rootScope, AuthService, $state) {

    // make state available to the scope
    $scope.go= function (state) {
      console.log(state);
      $state.go(state);
    };

    $scope.menu_toggled = false; // initialize toggle

    $scope.menuToggle = function() { $scope.menu_toggled = !$scope.menu_toggled; };

    // USER Authentication
    $scope.currentUser = AuthService.getUserData();

    $scope.$watch('currentUser', function(newValue) { $scope.currentUser = newValue; });

    $scope.logout = function() { AuthService.logout(); };

    $scope.loginState = function () {
      $state.go('login', { clicked: true })
    }


  }]);


  // Primary page for non-logged users
  app.controller('LandingCtrl', ['$scope', function($scope) {}]);


  // Primary page for logged in users
  app.controller('CatalogCtrl', ['$scope', 'Category', 'Item', '$uibModal', function($scope, Category, Item, $uibModal) {
    $scope.categories = Category.query(); //fetch all categories. Issues a GET to /api/categories
    $scope.items = Item.query();

    $scope.sortTypesCategory = ['name', 'username', 'created'];
    $scope.sortReverseCategory = true;
    $scope.sortCategoryBy = 'created';

    $scope.sortTypesItem = ['name', 'username', 'created', 'category_name'];
    $scope.sortReverseItem = true;
    $scope.sortItemBy = 'created';

    $scope.deleteCategory = function(category) {
      category.$delete(function(resp) {
        $scope.categories = Category.query(function () {});
      })
    };

    $scope.deleteItem = function(item) {
      item.$delete(function(resp) {
        $scope.items = Item.query(function () {});
      })
    };


    $scope.openDeleteCategory = function (category) {
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

      modalInstance.result.then(function () { $scope.deleteCategory(category); });
    };

    $scope.openDeleteItem = function (item) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: '../static/partials/_confirm_delete.html',
        controller: 'ModalInstanceCtrl',
        size: 'sm',
        resolve: {
          header: function () { return 'Are you sure?' },
          body: function () {
            return 'This action cannot be undone.'
          }
        }
      });

      modalInstance.result.then(function () { $scope.deleteItem(item); });
    };

  }]);


  app.controller('CategoryCtrl', ['$scope', 'Category', '$uibModal', '$stateParams', function($scope, Category, $uibModal, $stateParams) {

    $scope.categories = Category.query({user_id: $stateParams.u_id});

    $scope.usersCategory = $stateParams.u_id;

    if ($stateParams.u_id) {
      $scope.sortTypesCategory = ['name', 'created'];
    } else {
      $scope.sortTypesCategory = ['name', 'username', 'created'];
    }
    $scope.sortReverseCategory = true;
    $scope.sortCategoryBy = 'created';

    $scope.deleteCategory = function(category) {
      category.$delete(function(resp) {
        $scope.categories = Category.query({user_id: $stateParams.u_id});
      })
    };

    $scope.openDeleteCategory = function (category) {
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
      $scope.category.$save(function(data) {
        console.log(data);
        $state.go('categories', {'u_id': $scope.currentUser.id}); // on success go back to categories page
      });
    };
  }]);


  app.controller('CategoryEditCtrl', ['$scope', 'Category', '$stateParams', '$state', function($scope, Category, $stateParams, $state) {
    $scope.updateCategory = function() { //Update the edited category. Issues a PUT to /api/category/:id
      $scope.category.$update(function(data) {
        $state.go('categories', {'u_id': $scope.currentUser.id}); // on success go back to categories
      });
    };

    $scope.loadCategory = function() { //Issues a GET request to /api/categories/:id to get a category
      $scope.category = Category.get({ id: $stateParams.id });
    };

    $scope.loadCategory(); // Load a movie which can be edited on UI
  }]);


  app.controller('ItemCtrl', ['$scope', 'Item', '$uibModal', '$stateParams', function($scope, Item, $uibModal, $stateParams) {
    $scope.items = Item.query({category_id: $stateParams.c_id, user_id: $stateParams.u_id});
    $scope.categoryItems = $stateParams.c_id;
    $scope.userItems = $stateParams.u_id;

    if ($stateParams.c_id) {
      $scope.sortTypesItem = ['name', 'created'];
    } else if ($stateParams.u_id) {
      $scope.sortTypesItem = ['name', 'created', 'category_name'];
    } else {
      $scope.sortTypesItem = ['name', 'username', 'created', 'category_name'];
    }
    $scope.sortReverseItem = true;
    $scope.sortItemBy = 'created';

    $scope.deleteItem = function(item) {
      item.$delete(function(resp) {
        $scope.items = Item.query({category_id: $stateParams.c_id, user_id: $stateParams.u_id});
      })
    };
    $scope.openDeleteItem = function (item) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: '../static/partials/_confirm_delete.html',
        controller: 'ModalInstanceCtrl',
        size: 'sm',
        resolve: {
          header: function () { return 'Are you sure?' },
          body: function () {
            return 'This action cannot be undone.'
          }
        }
      });

      modalInstance.result.then(function () { $scope.deleteItem(item); });
    };
  }]);


  app.controller('ItemCreateCtrl', ['$scope', 'Item', 'Category', '$state', '$stateParams', function($scope, Item, Category, $state, $stateParams) {
    $scope.item = new Item();  //create new Item instance. Properties will be set via ng-model on UI
    $scope.categories = Category.query({user_id: $scope.currentUser.id});

    $scope.createItem = function() { //create a new item. Issues a POST to /api/item
      $scope.item.$save(function(data) {
        console.log(data);
        $state.go('items', {'c_id': data.category_id}); // on success go back to items page
      }, function(err) {
        if (err.status === 401) {
          $state.go('login');
        } else if (err.status === 403) {
          $state.go('home')
        }
      });
    };
  }]);


  app.controller('ItemEditCtrl', ['$scope', 'Item', '$stateParams', 'Category', '$state', function($scope, Item, $stateParams, Category, $state) {
    $scope.updateItem = function() { //Update the edited category. Issues a PUT to /api/category/:id
      $scope.item.$update(function(data) {
        $state.go('items', {'c_id': data.category_id}); // on success go back to categories
      });
    };

    $scope.categories = Category.query({user_id: $scope.currentUser.id});

    $scope.loadItem = function() { //Issues a GET request to /api/categories/:id to get a category
      $scope.item = Item.get({ id: $stateParams.id });
    };

    $scope.loadItem(); // Load a movie which can be edited on UI
  }]);


  app.controller('LoginCtrl', ['$scope', '$window', 'AuthService', function ($scope, $window, AuthService) {

    var only_once = 0;

    $scope.credentials = { email: '', username: '', password: ''};

    $scope.show_signin = true;

    $scope.toggleSignin = function (val) {
      $scope.show_signin = val;
    };

    $scope.register = function (credentials) { AuthService.register(credentials)
      .then(function () { $scope.credentials = {} });
    };

    $scope.login = function (credentials) { AuthService.login(credentials)
      .then(function (data) { $scope.credentials = {}; }, function (err) { console.log(err) });
    };

    $window.signInCallback = function(authResult) {
      //hack to stop google from firing callback twice at once
      if (only_once === 0) {
        only_once = 1;
        AuthService.gSignin(authResult)
      }
    };

  }]);


  app.controller('ModalInstanceCtrl', function ($scope, $modalInstance, header, body) {

    $scope.header = header;
    $scope.body = body;

    $scope.delete = function () { $modalInstance.close(); };

    $scope.cancel = function () { $modalInstance.dismiss(); };
  });


}());
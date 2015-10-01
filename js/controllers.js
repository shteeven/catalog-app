/**
 * Created by stevenbarnhurst on 10/1/15.
 */


(function () {

    'use strict';

    angular.module('catalog')

        .controller('MainCtrl', ['$scope', '$log', '$http', function($scope, $log, $http) {

            function menuToggle() {
                $scope.menu_toggled = !$scope.menu_toggled;
            }
        }])

        .controller('MainCtrl', ['$scope', '$log', '$http', function($scope, $log, $http) {
        }])

        .controller('CatalogCtrl', ['$scope', '$log', '$http', function($scope, $log, $http) {
        }])

        .controller('CategoryCtrl', ['$scope', '$log', '$http', function($scope, $log, $http) {
        }])

        .controller('ItemsCtrl', ['$scope', '$log', '$http', function($scope, $log, $http) {
        }])

}());
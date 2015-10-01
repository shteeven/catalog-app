/**
 * Created by stevenbarnhurst on 10/1/15.
 */


(function () {

    'use strict';

    angular.module('catalog', ['ngroute'])

        .controller('CatalogCtrl', ['$scope', '$log', '$http', function($scope, $log, $http) {
            $scope.getResults = function() {
                $log.log("test");

                // get the URL from the input
                var userInput = $scope.input_url;
                // fire the API request
                $http.post('/test', {"url": userInput}).
                    success(function(results) {
                        $log.log(results);
                    }).
                    error(function(error) {
                        $log.log(error);
                    });
            };
            function menuToggle() {
                $scope.menu_toggled = !$scope.menu_toggled;
            }
        }])

        .controller('CategoryCtrl', ['$scope', '$log', '$http', function($scope, $log, $http) {
            $scope.getResults = function() {
                $log.log("test");

                // get the URL from the input
                var userInput = $scope.input_url;
                // fire the API request
                $http.post('/test', {"url": userInput}).
                    success(function(results) {
                        $log.log(results);
                    }).
                    error(function(error) {
                        $log.log(error);
                    });
            };
            function menuToggle() {
                $scope.menu_toggled = !$scope.menu_toggled;
            }
        }])

        .controller('ItemsCtrl', ['$scope', '$log', '$http', function($scope, $log, $http) {
            $scope.getResults = function() {
                $log.log("test");

                // get the URL from the input
                var userInput = $scope.input_url;
                // fire the API request
                $http.post('/test', {"url": userInput}).
                    success(function(results) {
                        $log.log(results);
                    }).
                    error(function(error) {
                        $log.log(error);
                    });
            };
            function menuToggle() {
                $scope.menu_toggled = !$scope.menu_toggled;
            }
        }])

}());
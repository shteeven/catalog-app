/**
 * Created by stevenbarnhurst on 10/1/15.
 */

(function () {

    'use strict';

    angular.module('catalog', ['ngRoute'])

        .config(function($routeProvider, $locationProvider) {
            $routeProvider
                .when('/', {
                    templateUrl: 'partials/user-categories.html',
                    controller: 'CatalogCtrl'
                })
                .when('/category/:userId', {
                    templateUrl: 'partials/user-categories.html',
                    controller: 'CategoryCtrl'
                })
                .when('/category/:userId/items/:catId', {
                    templateUrl: 'partials/category-items.html',
                    controller: 'ItemsCtrl'
                });
            $locationProvider.html5Mode(true);
        })
}());
/**
 * Created by stevenbarnhurst on 10/1/15.
 */

(function () {

    'use strict';

    angular.module('catalog', ['ngRoute'])

        .config(function($routeProvider, $locationProvider) {
            $routeProvider
                .when('/', {
                    templateUrl: 'partials/catalog.html',
                    controller: 'CatalogCtrl'
                })
                .when('/landing', {
                    templateUrl: 'partials/landing.html',
                    controller: 'LandingCtrl'
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
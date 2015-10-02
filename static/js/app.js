/**
 * Created by stevenbarnhurst on 10/1/15.
 */

(function () {

    'use strict';
var app = angular.module('catalog', ['ngRoute']);

    app.config(function($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'static/partials/catalog.html',
                controller: 'CatalogCtrl'
            })
            .when('/landing', {
                templateUrl: 'static/partials/landing.html',
                controller: 'LandingCtrl'
            })
            .when('/category', {
                templateUrl: 'static/partials/user-categories.html',
                controller: 'CategoryCtrl'
            })
            .when('/items', {
                templateUrl: 'static/partials/categories-items.html',
                controller: 'ItemsCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });
        $locationProvider.html5Mode(true);
    })
}());
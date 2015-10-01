/**
 * Created by stevenbarnhurst on 10/1/15.
 */

(function () {

    'use strict';

    angular.module('catalog', ['ngroute'])

        .config(function($routeProvider, $locationProvider) {
            $routeProvider
                .when('/', {
                    templateUrl: 'partials/catalog-items.html',
                    controller: 'CatalogCtrl'
                })
                .when('/category/:userId', {
                    templateUrl: 'category-items.html',
                    controller: 'CategoryCtrl'
                })
                .when('/category/:userId/items/:catId', {
                    templateUrl: 'partials/user-items.html',
                    controller: 'ItemsCtrl'
                });
            $locationProvider.html5Mode(true);
        })
}());
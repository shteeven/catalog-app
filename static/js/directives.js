/**
 * Created by stevenbarnhurst on 10/3/15.
 */


(function () {

    'use strict';
var app = angular.module('catalog');

  app.directive('loginDialog', function (AUTH_EVENTS) {
    return {
      restrict: 'A',
      template: '<div ng-if="visible" ng-include="\'login-form.html\'">',
      link: function (scope) {
        var showDialog = function () {
          scope.visible = true;
        };

        scope.visible = false;
        scope.$on(AUTH_EVENTS.notAuthenticated, showDialog);
        scope.$on(AUTH_EVENTS.sessionTimeout, showDialog)
      }
    };
  });


}());
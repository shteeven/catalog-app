/**
 * Created by stevenbarnhurst on 10/3/15.
 */


(function () {

    'use strict';
var app = angular.module('catalog');

  app.directive('loginDialog', function (AUTH_EVENTS) {
    return {
      restrict: 'A',
      templateUrl: '/api/loginform',
      link: function (scope) {

        //scope.visible = false;
        //scope.$on(AUTH_EVENTS.notAuthenticated, showDialog);
        //scope.$on(AUTH_EVENTS.sessionTimeout, showDialog)
      }
    };
  });

  app.directive('formAutofillFix', function ($timeout) {
    return function (scope, element, attrs) {
      element.prop('method', 'post');
      if (attrs.ngSubmit) {
        $timeout(function () {
          element
            .unbind('submit')
            .bind('submit', function (event) {
              event.preventDefault();
              element
                .find('input, textarea, select')
                .trigger('input')
                .trigger('change')
                .trigger('keydown');
              scope.$apply(attrs.ngSubmit);
            });
        });
      }
    };
  });


}());
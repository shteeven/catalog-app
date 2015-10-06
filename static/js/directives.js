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

//  app.directive('googleSignin', function() {
//  return {
//    restrict: 'A',
//    template: '<div><script src="//apis.google.com/js/platform.js?onload=start"> </script> ' +
//    '<link href="http://fonts.googleapis.com/css?family=Roboto:400,300,700" rel="stylesheet" type="text/css">' +
//    '<span id="signinButton"></span></div>',
//    replace: true,
//    scope: {
//      afterSignin: '&',
//      clientId: '@'
//    },
//    link: function(scope, ele, attrs) {
//
//      var callbackId = 'signinCallback',
//        directiveScope = scope;
//      window[callbackId] = function() {
//        var oauth = arguments[0];
//        directiveScope.afterSignin({oauth: oauth});
//        window[callbackId] = null;
//      };
//      attrs.$set('class', 'g-signin');
//      attrs.$set('data-scope', 'openid email');
//      attrs.$set('data-clientid', scope.clientId);
//      attrs.$set('data-redirecturi', 'postmessage');
//      attrs.$set('data-accesstype', 'offline');
//      attrs.$set('data-cookiepolicy', 'single_host_origin');
//      attrs.$set('data-callback', callbackId);
//      attrs.$set('data-approvalprompt', 'force');
//
//      //(function() {
//      //  var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
//      //  po.src = 'https://apis.google.com/js/client:plusone.js';
//      //  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
//      //})();
//    }
//  }
//});


}());
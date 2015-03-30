"use strict";
// var angularFieldDB = angular.module("FieldDB", []);
// for (var modelName in FieldDB) {
//   if (!FieldDB.hasOwnProperty(modelName)) {
//     continue;
//   }
//   angularFieldDB.factory("FieldDB" + modelName + "Factory",
//     function() {
//       return FieldDB[modelName];
//     });
// }
var fielddbAngulaModule = angular.module("fielddbAngularApp", [
  "ngAnimate",
  "ngCookies",
  "ngResource",
  "ngRoute",
  "ngSanitize",
  "ngTouch",
  "angularFileUpload",
  "contenteditable",
  "ang-drag-drop"
]).config(function($routeProvider, $sceDelegateProvider) {
  // console.log($routeProvider);

  $sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    "self",
    // Allow loading from outer domain.
    "https://youtube.com/**",
    "https://youtu.be/**",
    "https://soundcloud.com/**",
    "http://*.example.org/**",
    "https://*.example.org/**",
    "http://*.dyslexdisorth.ca/**",
    "https://*.dyslexdisorth.ca/**",
    "https://localhost:3184/**",
    "https://localhost/**"
  ]);
  var fieldDBApp;

  if (FieldDB && FieldDB.PsycholinguisticsApp && FieldDB.Contextualizer && FieldDB.User && !FieldDB.FieldDBObject.application) {
    fieldDBApp = new FieldDB.PsycholinguisticsApp({
      authentication: {
        user: new FieldDB.User({
          authenticated: false
        })
      },
      contextualizer: new FieldDB.Contextualizer().loadDefaults(),
      online: true,
      apiURL: "https://localhost:3183",
      offlineCouchURL: "https://localhost:6984",
      brand: "Example",
      brandLowerCase: "example",
      website: "http://example.org",
      faq: "http://app.example.org/#/faq",
      basePathname: window.location.origin + "/#",
    });
    if (window.location.pathname.indexOf("android_asset") > -1) {
      fieldDBApp.basePathname = window.location.pathname;
    }
  }
  // if (window.location.hash.indexOf("#") > -1) {
  //   fieldDBApp.basePathname = window.location.pathname + "#";
  // }

  // FieldDB.Database.prototype.BASE_DB_URL = "https://corpusdev.example.org";
  // FieldDB.Database.prototype.BASE_AUTH_URL = "https://authdev.example.org";
  // FieldDB.AudioVideo.prototype.BASE_SPEECH_URL = "https://speechdev.example.org";

});
console.log("Loaded fielddbAngulaModule", fielddbAngulaModule);
// fielddbAngulaModule.run(["$route", "$rootScope", "$location",
//   function($route, $rootScope, $location) {
//     var original = $location.path;
//     $location.path = function(path, reload) {
//       if (reload === false) {
//         var lastRoute = $route.current;
//         var un = $rootScope.$on("$locationChangeSuccess", function() {
//           $route.current = lastRoute;
//           un();
//         });
//       }
//       return original.apply($location, [path]);
//     };
//   }
// ]);

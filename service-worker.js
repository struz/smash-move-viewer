"use strict";function setOfCachedUrls(e){return e.keys().then(function(e){return e.map(function(e){return e.url})}).then(function(e){return new Set(e)})}var precacheConfig=[["/smash-move-viewer/index.html","02e43e06c1c337917c5ecbdb9ccc815d"],["/smash-move-viewer/static/css/main.d6ab8211.css","feced40af9f733b8dd72cc3fb681159d"],["/smash-move-viewer/static/js/main.f5fd1ed3.js","e21a97486c82d712ff261ed307bc2e9b"],["/smash-move-viewer/static/media/BowserSpin3.baa349c5.gif","baa349c566436dd174d361b51db89d66"],["/smash-move-viewer/static/media/MoveViewerInstructional.466a996e.jpg","466a996e52915134a2146c1d6384df27"],["/smash-move-viewer/static/media/Town10Display-Regular.042ceade.svg","042ceade33e756a30e404154b5e78c32"],["/smash-move-viewer/static/media/Town10Display-Regular.2b6fb14d.eot","2b6fb14d9d42e9e098b6679caf0fd7a8"],["/smash-move-viewer/static/media/Town10Display-Regular.4be8e361.ttf","4be8e361d632fdb76be22d5adb4bdb97"],["/smash-move-viewer/static/media/Town10Display-Regular.7adc7876.woff","7adc78762b76aa2e2b8b7e7697f24090"],["/smash-move-viewer/static/media/Town31Dim-BlackL.3b17e268.ttf","3b17e2686ee5e22c7e0c880720dc867f"],["/smash-move-viewer/static/media/Town31Dim-BlackL.4a1891d1.woff","4a1891d1360e5e41fc1b2ce52a49681a"],["/smash-move-viewer/static/media/Town31Dim-BlackL.c0244a9a.svg","c0244a9a911672fc4665989869d5a2c3"],["/smash-move-viewer/static/media/Town31Dim-BlackL.e65c9bbf.eot","e65c9bbf2efc34fabf61cefe5764ee55"],["/smash-move-viewer/static/media/Town31Dim-RegularL.7c8d3e58.svg","7c8d3e58dae5d8b0317050d90c6ce4e8"],["/smash-move-viewer/static/media/Town31Dim-RegularL.910fb370.ttf","910fb370444bb086b0f99a3193559cf8"],["/smash-move-viewer/static/media/Town31Dim-RegularL.a8cfd42d.woff","a8cfd42db9a0aeb02875184e687df7b0"],["/smash-move-viewer/static/media/Town31Dim-RegularL.d02c476e.eot","d02c476e52ff5f8cd5b883e7ee1adb06"],["/smash-move-viewer/static/media/background.17a5ef93.jpg","17a5ef9391bed4e50e090931511804e6"],["/smash-move-viewer/static/media/bwmodelica-bold-webfont.5aeee9b8.woff","5aeee9b8ce32f6928ba8ac6a19c8d7df"],["/smash-move-viewer/static/media/bwmodelica-bold-webfont.602420de.svg","602420de322269de03f046eb08ed5e8c"],["/smash-move-viewer/static/media/bwmodelica-bold-webfont.739f350f.eot","739f350ffe42378b89f079f05087f767"],["/smash-move-viewer/static/media/bwmodelica-bold-webfont.e018441d.ttf","e018441df7f823d044d65fe6288573c2"],["/smash-move-viewer/static/media/bwmodelica-medium-webfont.3c15e310.woff","3c15e310fc8518b61bd6fceb6c0a7e3d"],["/smash-move-viewer/static/media/bwmodelica-medium-webfont.4eb9ce2d.ttf","4eb9ce2dec19715c8a68f28568602b7d"],["/smash-move-viewer/static/media/bwmodelica-medium-webfont.55647c8e.svg","55647c8e271a75264bbde9ab7d230724"],["/smash-move-viewer/static/media/bwmodelica-medium-webfont.dc011a2e.eot","dc011a2e28916f303741ee777aa8a951"],["/smash-move-viewer/static/media/bwmodelica-regular-webfont.28a496ee.svg","28a496eea87439cc2381f83a090fb328"],["/smash-move-viewer/static/media/bwmodelica-regular-webfont.562bcd72.eot","562bcd7235154b31b30ea8be650d4f21"],["/smash-move-viewer/static/media/bwmodelica-regular-webfont.c18b37ab.woff","c18b37abaffcbfca949849286ec47ee5"],["/smash-move-viewer/static/media/bwmodelica-regular-webfont.deceeea8.ttf","deceeea8141e232faff6f40b75fff10f"],["/smash-move-viewer/static/media/cloud_uair1.5cd1ca42.png","5cd1ca42064573e7bca213b6743ceb0d"],["/smash-move-viewer/static/media/cloud_uair2.a3d8ff51.png","a3d8ff5192ad8ad1e8926deef245b76c"],["/smash-move-viewer/static/media/logo_transparent_lowfi.513450d2.png","513450d2dd57ab524b994381004e9edc"],["/smash-move-viewer/static/media/ryu_example.b9816e23.png","b9816e23724ce20156b410c1ade89ed4"],["/smash-move-viewer/static/media/share.da32ba67.svg","da32ba67f654c912eba2acdd22ca4147"]],cacheName="sw-precache-v3-sw-precache-webpack-plugin-"+(self.registration?self.registration.scope:""),ignoreUrlParametersMatching=[/^utm_/],addDirectoryIndex=function(e,a){var t=new URL(e);return"/"===t.pathname.slice(-1)&&(t.pathname+=a),t.toString()},cleanResponse=function(e){return e.redirected?("body"in e?Promise.resolve(e.body):e.blob()).then(function(a){return new Response(a,{headers:e.headers,status:e.status,statusText:e.statusText})}):Promise.resolve(e)},createCacheKey=function(e,a,t,s){var c=new URL(e);return s&&c.pathname.match(s)||(c.search+=(c.search?"&":"")+encodeURIComponent(a)+"="+encodeURIComponent(t)),c.toString()},isPathWhitelisted=function(e,a){if(0===e.length)return!0;var t=new URL(a).pathname;return e.some(function(e){return t.match(e)})},stripIgnoredUrlParameters=function(e,a){var t=new URL(e);return t.hash="",t.search=t.search.slice(1).split("&").map(function(e){return e.split("=")}).filter(function(e){return a.every(function(a){return!a.test(e[0])})}).map(function(e){return e.join("=")}).join("&"),t.toString()},hashParamName="_sw-precache",urlsToCacheKeys=new Map(precacheConfig.map(function(e){var a=e[0],t=e[1],s=new URL(a,self.location),c=createCacheKey(s,hashParamName,t,/\.\w{8}\./);return[s.toString(),c]}));self.addEventListener("install",function(e){e.waitUntil(caches.open(cacheName).then(function(e){return setOfCachedUrls(e).then(function(a){return Promise.all(Array.from(urlsToCacheKeys.values()).map(function(t){if(!a.has(t)){var s=new Request(t,{credentials:"same-origin"});return fetch(s).then(function(a){if(!a.ok)throw new Error("Request for "+t+" returned a response with status "+a.status);return cleanResponse(a).then(function(a){return e.put(t,a)})})}}))})}).then(function(){return self.skipWaiting()}))}),self.addEventListener("activate",function(e){var a=new Set(urlsToCacheKeys.values());e.waitUntil(caches.open(cacheName).then(function(e){return e.keys().then(function(t){return Promise.all(t.map(function(t){if(!a.has(t.url))return e.delete(t)}))})}).then(function(){return self.clients.claim()}))}),self.addEventListener("fetch",function(e){if("GET"===e.request.method){var a,t=stripIgnoredUrlParameters(e.request.url,ignoreUrlParametersMatching);(a=urlsToCacheKeys.has(t))||(t=addDirectoryIndex(t,"index.html"),a=urlsToCacheKeys.has(t));!a&&"navigate"===e.request.mode&&isPathWhitelisted(["^(?!\\/__).*"],e.request.url)&&(t=new URL("/smash-move-viewer/index.html",self.location).toString(),a=urlsToCacheKeys.has(t)),a&&e.respondWith(caches.open(cacheName).then(function(e){return e.match(urlsToCacheKeys.get(t)).then(function(e){if(e)return e;throw Error("The cached response that was expected is missing.")})}).catch(function(a){return console.warn('Couldn\'t serve response for "%s" from cache: %O',e.request.url,a),fetch(e.request)}))}});
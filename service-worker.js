"use strict";function setOfCachedUrls(e){return e.keys().then(function(e){return e.map(function(e){return e.url})}).then(function(e){return new Set(e)})}var precacheConfig=[["/smash-move-viewer/index.html","8e35d95c201715b7b1ec46a77e7b10ba"],["/smash-move-viewer/static/css/main.0e876d62.css","690a6e9fc0b54cd1ec63a167e2405ee2"],["/smash-move-viewer/static/js/main.7c04cc3d.js","ed2763870adfbb586b54e7e11a23b070"],["/smash-move-viewer/static/media/BowserSpin2.cabb1715.gif","cabb1715bc2a96bf717ebf3895b2b090"],["/smash-move-viewer/static/media/MoveViewerInstructional.55f65c46.png","55f65c46d367b8fc71613059c8639ba7"],["/smash-move-viewer/static/media/Town31Dim-BlackL.16ca80b5.svg","16ca80b5ef38b571a734f39bdb71e8a3"],["/smash-move-viewer/static/media/Town31Dim-BlackL.3b17e268.ttf","3b17e2686ee5e22c7e0c880720dc867f"],["/smash-move-viewer/static/media/Town31Dim-BlackL.4a1891d1.woff","4a1891d1360e5e41fc1b2ce52a49681a"],["/smash-move-viewer/static/media/Town31Dim-BlackL.e65c9bbf.eot","e65c9bbf2efc34fabf61cefe5764ee55"],["/smash-move-viewer/static/media/Town31Dim-RegularL.6db51506.svg","6db51506d344a1a368f47b04e765aaa3"],["/smash-move-viewer/static/media/Town31Dim-RegularL.910fb370.ttf","910fb370444bb086b0f99a3193559cf8"],["/smash-move-viewer/static/media/Town31Dim-RegularL.a8cfd42d.woff","a8cfd42db9a0aeb02875184e687df7b0"],["/smash-move-viewer/static/media/Town31Dim-RegularL.d02c476e.eot","d02c476e52ff5f8cd5b883e7ee1adb06"],["/smash-move-viewer/static/media/background.ff5060d9.gif","ff5060d9dac4406ca6daf60023594672"],["/smash-move-viewer/static/media/bwmodelica-bold-webfont.5aeee9b8.woff","5aeee9b8ce32f6928ba8ac6a19c8d7df"],["/smash-move-viewer/static/media/bwmodelica-bold-webfont.739f350f.eot","739f350ffe42378b89f079f05087f767"],["/smash-move-viewer/static/media/bwmodelica-bold-webfont.a672a879.svg","a672a879153b29a4f970f1b6030bbf3d"],["/smash-move-viewer/static/media/bwmodelica-bold-webfont.e018441d.ttf","e018441df7f823d044d65fe6288573c2"],["/smash-move-viewer/static/media/bwmodelica-regular-webfont.4a140be3.svg","4a140be32c5eddb0c50a3a185af9b474"],["/smash-move-viewer/static/media/bwmodelica-regular-webfont.562bcd72.eot","562bcd7235154b31b30ea8be650d4f21"],["/smash-move-viewer/static/media/bwmodelica-regular-webfont.c18b37ab.woff","c18b37abaffcbfca949849286ec47ee5"],["/smash-move-viewer/static/media/bwmodelica-regular-webfont.deceeea8.ttf","deceeea8141e232faff6f40b75fff10f"],["/smash-move-viewer/static/media/ryu_example.b9816e23.png","b9816e23724ce20156b410c1ade89ed4"]],cacheName="sw-precache-v3-sw-precache-webpack-plugin-"+(self.registration?self.registration.scope:""),ignoreUrlParametersMatching=[/^utm_/],addDirectoryIndex=function(e,a){var t=new URL(e);return"/"===t.pathname.slice(-1)&&(t.pathname+=a),t.toString()},cleanResponse=function(e){return e.redirected?("body"in e?Promise.resolve(e.body):e.blob()).then(function(a){return new Response(a,{headers:e.headers,status:e.status,statusText:e.statusText})}):Promise.resolve(e)},createCacheKey=function(e,a,t,r){var n=new URL(e);return r&&n.pathname.match(r)||(n.search+=(n.search?"&":"")+encodeURIComponent(a)+"="+encodeURIComponent(t)),n.toString()},isPathWhitelisted=function(e,a){if(0===e.length)return!0;var t=new URL(a).pathname;return e.some(function(e){return t.match(e)})},stripIgnoredUrlParameters=function(e,a){var t=new URL(e);return t.hash="",t.search=t.search.slice(1).split("&").map(function(e){return e.split("=")}).filter(function(e){return a.every(function(a){return!a.test(e[0])})}).map(function(e){return e.join("=")}).join("&"),t.toString()},hashParamName="_sw-precache",urlsToCacheKeys=new Map(precacheConfig.map(function(e){var a=e[0],t=e[1],r=new URL(a,self.location),n=createCacheKey(r,hashParamName,t,/\.\w{8}\./);return[r.toString(),n]}));self.addEventListener("install",function(e){e.waitUntil(caches.open(cacheName).then(function(e){return setOfCachedUrls(e).then(function(a){return Promise.all(Array.from(urlsToCacheKeys.values()).map(function(t){if(!a.has(t)){var r=new Request(t,{credentials:"same-origin"});return fetch(r).then(function(a){if(!a.ok)throw new Error("Request for "+t+" returned a response with status "+a.status);return cleanResponse(a).then(function(a){return e.put(t,a)})})}}))})}).then(function(){return self.skipWaiting()}))}),self.addEventListener("activate",function(e){var a=new Set(urlsToCacheKeys.values());e.waitUntil(caches.open(cacheName).then(function(e){return e.keys().then(function(t){return Promise.all(t.map(function(t){if(!a.has(t.url))return e.delete(t)}))})}).then(function(){return self.clients.claim()}))}),self.addEventListener("fetch",function(e){if("GET"===e.request.method){var a,t=stripIgnoredUrlParameters(e.request.url,ignoreUrlParametersMatching);(a=urlsToCacheKeys.has(t))||(t=addDirectoryIndex(t,"index.html"),a=urlsToCacheKeys.has(t));!a&&"navigate"===e.request.mode&&isPathWhitelisted(["^(?!\\/__).*"],e.request.url)&&(t=new URL("/smash-move-viewer/index.html",self.location).toString(),a=urlsToCacheKeys.has(t)),a&&e.respondWith(caches.open(cacheName).then(function(e){return e.match(urlsToCacheKeys.get(t)).then(function(e){if(e)return e;throw Error("The cached response that was expected is missing.")})}).catch(function(a){return console.warn('Couldn\'t serve response for "%s" from cache: %O',e.request.url,a),fetch(e.request)}))}});
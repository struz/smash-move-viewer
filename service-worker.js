"use strict";function setOfCachedUrls(e){return e.keys().then(function(e){return e.map(function(e){return e.url})}).then(function(e){return new Set(e)})}var precacheConfig=[["/smash-move-viewer/index.html","829a1bd0ac9d024afb1ac405e2027dc4"],["/smash-move-viewer/static/css/main.b8e213ee.css","866d61ee7c627dc2865ec5e4da2e275d"],["/smash-move-viewer/static/js/main.f1245865.js","856a627ce96b8f8b3bf3bddf387aacca"],["/smash-move-viewer/static/media/272-cross.fd9f422d.svg","fd9f422da971454b1a798c73b1f94c82"],["/smash-move-viewer/static/media/285-play3.156f73e6.svg","156f73e649db1964f8c0b41a77406db9"],["/smash-move-viewer/static/media/286-pause2.349a1561.svg","349a1561d1c5ef84ceaeb01b6ca3f418"],["/smash-move-viewer/static/media/288-backward2.590ac128.svg","590ac1282e8beb6d56c5acf215dba0b4"],["/smash-move-viewer/static/media/289-forward3.aec13f22.svg","aec13f22ca71d102f71e4c3fae94da31"],["/smash-move-viewer/static/media/290-first.b85d6b89.svg","b85d6b892c053d9f8f67df7ba0205e61"],["/smash-move-viewer/static/media/291-last.f3234b07.svg","f3234b07f469efe215cf8ef3a47a74d0"],["/smash-move-viewer/static/media/292-previous2.e0a0a6d6.svg","e0a0a6d6ac4097f116adae007de2832e"],["/smash-move-viewer/static/media/293-next2.d368246a.svg","d368246a56f19a619fc766652870cfdf"],["/smash-move-viewer/static/media/302-loop.e2e522f0.svg","e2e522f00c355a55709700fe1e529f84"],["/smash-move-viewer/static/media/logo.5d5d9eef.svg","5d5d9eefa31e5e13a6610d9fa7a283bb"]],cacheName="sw-precache-v3-sw-precache-webpack-plugin-"+(self.registration?self.registration.scope:""),ignoreUrlParametersMatching=[/^utm_/],addDirectoryIndex=function(e,t){var a=new URL(e);return"/"===a.pathname.slice(-1)&&(a.pathname+=t),a.toString()},cleanResponse=function(e){return e.redirected?("body"in e?Promise.resolve(e.body):e.blob()).then(function(t){return new Response(t,{headers:e.headers,status:e.status,statusText:e.statusText})}):Promise.resolve(e)},createCacheKey=function(e,t,a,r){var s=new URL(e);return r&&s.pathname.match(r)||(s.search+=(s.search?"&":"")+encodeURIComponent(t)+"="+encodeURIComponent(a)),s.toString()},isPathWhitelisted=function(e,t){if(0===e.length)return!0;var a=new URL(t).pathname;return e.some(function(e){return a.match(e)})},stripIgnoredUrlParameters=function(e,t){var a=new URL(e);return a.hash="",a.search=a.search.slice(1).split("&").map(function(e){return e.split("=")}).filter(function(e){return t.every(function(t){return!t.test(e[0])})}).map(function(e){return e.join("=")}).join("&"),a.toString()},hashParamName="_sw-precache",urlsToCacheKeys=new Map(precacheConfig.map(function(e){var t=e[0],a=e[1],r=new URL(t,self.location),s=createCacheKey(r,hashParamName,a,/\.\w{8}\./);return[r.toString(),s]}));self.addEventListener("install",function(e){e.waitUntil(caches.open(cacheName).then(function(e){return setOfCachedUrls(e).then(function(t){return Promise.all(Array.from(urlsToCacheKeys.values()).map(function(a){if(!t.has(a)){var r=new Request(a,{credentials:"same-origin"});return fetch(r).then(function(t){if(!t.ok)throw new Error("Request for "+a+" returned a response with status "+t.status);return cleanResponse(t).then(function(t){return e.put(a,t)})})}}))})}).then(function(){return self.skipWaiting()}))}),self.addEventListener("activate",function(e){var t=new Set(urlsToCacheKeys.values());e.waitUntil(caches.open(cacheName).then(function(e){return e.keys().then(function(a){return Promise.all(a.map(function(a){if(!t.has(a.url))return e.delete(a)}))})}).then(function(){return self.clients.claim()}))}),self.addEventListener("fetch",function(e){if("GET"===e.request.method){var t,a=stripIgnoredUrlParameters(e.request.url,ignoreUrlParametersMatching);(t=urlsToCacheKeys.has(a))||(a=addDirectoryIndex(a,"index.html"),t=urlsToCacheKeys.has(a));!t&&"navigate"===e.request.mode&&isPathWhitelisted(["^(?!\\/__).*"],e.request.url)&&(a=new URL("/smash-move-viewer/index.html",self.location).toString(),t=urlsToCacheKeys.has(a)),t&&e.respondWith(caches.open(cacheName).then(function(e){return e.match(urlsToCacheKeys.get(a)).then(function(e){if(e)return e;throw Error("The cached response that was expected is missing.")})}).catch(function(t){return console.warn('Couldn\'t serve response for "%s" from cache: %O',e.request.url,t),fetch(e.request)}))}});
"use strict";function setOfCachedUrls(e){return e.keys().then(function(e){return e.map(function(e){return e.url})}).then(function(e){return new Set(e)})}var precacheConfig=[["/smash-move-viewer/index.html","2f12b32c346fdc16ba806a3933f8b09d"],["/smash-move-viewer/static/css/main.f2fb9331.css","9d3306d6723e7cc0ed8291d8b4f00869"],["/smash-move-viewer/static/js/main.151eed55.js","88556408ead93d5fac6e7dc739ceca34"],["/smash-move-viewer/static/media/272-cross.49807d76.svg","49807d767189bc5b162e5fe5f313dcb9"],["/smash-move-viewer/static/media/285-play3.56dc70c2.svg","56dc70c2f10d49acb24fb790908cbd29"],["/smash-move-viewer/static/media/286-pause2.7ffb735f.svg","7ffb735f2d963c5531f4f7758955d215"],["/smash-move-viewer/static/media/288-backward2.984d96fc.svg","984d96fc044b63a62ff76a2a8df80391"],["/smash-move-viewer/static/media/289-forward3.69d29054.svg","69d2905472d6634282f94ddcaae04389"],["/smash-move-viewer/static/media/290-first.752ad60c.svg","752ad60cd2ba496a04340a1854fa059b"],["/smash-move-viewer/static/media/291-last.06bba1f2.svg","06bba1f228bc12a20e45b03cd0a81b7c"],["/smash-move-viewer/static/media/292-previous2.a7ca63b3.svg","a7ca63b3c8346b491d0a614e5a1a95bc"],["/smash-move-viewer/static/media/293-next2.ca943667.svg","ca94366773f610fbf908017c910dcda2"],["/smash-move-viewer/static/media/302-loop.dafc8fe6.svg","dafc8fe649a47e99181ebd24e126cea2"],["/smash-move-viewer/static/media/SmashBall.88703ae0.svg","88703ae0ad6de2bbe72869ad3466a171"],["/smash-move-viewer/static/media/twitter.44b08116.svg","44b08116ff98795da9e8d107cb734d1d"]],cacheName="sw-precache-v3-sw-precache-webpack-plugin-"+(self.registration?self.registration.scope:""),ignoreUrlParametersMatching=[/^utm_/],addDirectoryIndex=function(e,t){var a=new URL(e);return"/"===a.pathname.slice(-1)&&(a.pathname+=t),a.toString()},cleanResponse=function(e){return e.redirected?("body"in e?Promise.resolve(e.body):e.blob()).then(function(t){return new Response(t,{headers:e.headers,status:e.status,statusText:e.statusText})}):Promise.resolve(e)},createCacheKey=function(e,t,a,s){var r=new URL(e);return s&&r.pathname.match(s)||(r.search+=(r.search?"&":"")+encodeURIComponent(t)+"="+encodeURIComponent(a)),r.toString()},isPathWhitelisted=function(e,t){if(0===e.length)return!0;var a=new URL(t).pathname;return e.some(function(e){return a.match(e)})},stripIgnoredUrlParameters=function(e,t){var a=new URL(e);return a.hash="",a.search=a.search.slice(1).split("&").map(function(e){return e.split("=")}).filter(function(e){return t.every(function(t){return!t.test(e[0])})}).map(function(e){return e.join("=")}).join("&"),a.toString()},hashParamName="_sw-precache",urlsToCacheKeys=new Map(precacheConfig.map(function(e){var t=e[0],a=e[1],s=new URL(t,self.location),r=createCacheKey(s,hashParamName,a,/\.\w{8}\./);return[s.toString(),r]}));self.addEventListener("install",function(e){e.waitUntil(caches.open(cacheName).then(function(e){return setOfCachedUrls(e).then(function(t){return Promise.all(Array.from(urlsToCacheKeys.values()).map(function(a){if(!t.has(a)){var s=new Request(a,{credentials:"same-origin"});return fetch(s).then(function(t){if(!t.ok)throw new Error("Request for "+a+" returned a response with status "+t.status);return cleanResponse(t).then(function(t){return e.put(a,t)})})}}))})}).then(function(){return self.skipWaiting()}))}),self.addEventListener("activate",function(e){var t=new Set(urlsToCacheKeys.values());e.waitUntil(caches.open(cacheName).then(function(e){return e.keys().then(function(a){return Promise.all(a.map(function(a){if(!t.has(a.url))return e.delete(a)}))})}).then(function(){return self.clients.claim()}))}),self.addEventListener("fetch",function(e){if("GET"===e.request.method){var t,a=stripIgnoredUrlParameters(e.request.url,ignoreUrlParametersMatching);(t=urlsToCacheKeys.has(a))||(a=addDirectoryIndex(a,"index.html"),t=urlsToCacheKeys.has(a));!t&&"navigate"===e.request.mode&&isPathWhitelisted(["^(?!\\/__).*"],e.request.url)&&(a=new URL("/smash-move-viewer/index.html",self.location).toString(),t=urlsToCacheKeys.has(a)),t&&e.respondWith(caches.open(cacheName).then(function(e){return e.match(urlsToCacheKeys.get(a)).then(function(e){if(e)return e;throw Error("The cached response that was expected is missing.")})}).catch(function(t){return console.warn('Couldn\'t serve response for "%s" from cache: %O',e.request.url,t),fetch(e.request)}))}});
/* Offline support: network first, falling back to the last copy this device saw. */
var CACHE="cm-v4";
self.addEventListener("install",function(e){self.skipWaiting()});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(n){return n!==CACHE}).map(function(n){return caches.delete(n)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener("fetch",function(e){var r=e.request;if(r.method!=="GET"||new URL(r.url).origin!==location.origin)return;
 e.respondWith(fetch(r,{cache:"no-cache"}).then(function(res){if(res&&res.ok){var c=res.clone();caches.open(CACHE).then(function(ch){ch.put(r,c)})}return res}).catch(function(){return caches.match(r).then(function(m){return m||caches.match("index.html")})}))});

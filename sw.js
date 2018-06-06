 var cache_name='r-mws-1';
//install sw
 self.addEventListener('install', function(event){
   var urlsToCache=[
     '/',
    './index.html',
    './restaurant.html',
    './css/styles.css',
    './js/dbhelper.js',
    './js/main.js',
    './js/restaurant_info.js',
    './data/restaurants.json',
    './img/1.jpg',
    './img/2.jpg',
    './img/3.jpg',
    './img/4.jpg',
    './img/5.jpg',
    './img/6.jpg',
    './img/7.jpg',
    './img/8.jpg',
    './img/9.jpg',
    './img/10.jpg',
    './img_200/1.jpg',
    './img_200/2.jpg',
    './img_200/3.jpg',
    './img_200/4.jpg',
    './img_200/5.jpg',
    './img_200/6.jpg',
    './img_200/7.jpg',
    './img_200/8.jpg',
    './img_200/9.jpg',
    './img_200/10.jpg',
    './img_400/1.jpg',
    './img_400/2.jpg',
    './img_400/3.jpg',
    './img_400/4.jpg',
    './img_400/5.jpg',
    './img_400/6.jpg',
    './img_400/7.jpg',
    './img_400/8.jpg',
    './img_400/9.jpg',
    './img_400/10.jpg',
    './img_600/1.jpg',
    './img_600/2.jpg',
    './img_600/3.jpg',
    './img_600/4.jpg',
    './img_600/5.jpg',
    './img_600/6.jpg',
    './img_600/7.jpg',
    './img_600/8.jpg',
    './img_600/9.jpg',
    './img_600/10.jpg',
    './img_800/1.jpg',
    './img_800/2.jpg',
    './img_800/3.jpg',
    './img_800/4.jpg',
    './img_800/5.jpg',
    './img_800/6.jpg',
    './img_800/7.jpg',
    './img_800/8.jpg',
    './img_800/9.jpg',
    './img_800/10.jpg',
   ];
  event.waitUntil(
   caches.open(cache_name).then(function(cache){
     return cache.addAll(urlsToCache);
   })
  );
} );

  self.addEventListener('fetch', function(event){
	 event.respondWith(
		caches.match(event.request).then(function(response){
			if(response)return response;
			return fetch(event.request);
		})
	 );
 } );

 self.addEventListener('activate',function(event){
	 event.waitUntil(
	 caches.keys().then(function(cacheNames){
		 return Promise.all(
			cacheNames.filter(function(cacheName){
				 return cacheName.startsWith('r-mws-') && cacheName != cache_name;
			 }).map(function(cacheName){
				 return cache.delete(cacheName);
			 })
		 )
	 })
	 );
 });

let staticCacheName = 'restaurant-review-22-01-2019';

self.addEventListener('install', event => {
	event.waitUntil(
		caches.open(staticCacheName)
		.then(cache => cache.addAll([
			'/',
			'/index.html',
			'/css/styles.css',
			'/img/1.jpg',
			'/img/2.jpg',
			'/img/3.jpg',
			'/img/4.jpg',
			'/img/5.jpg',
			'/img/6.jpg',
			'/img/7.jpg',
			'/img/8.jpg',
			'/img/9.jpg',
			'/img/10.jpg',
			'/data/restaurants.json',
			'/js/dbhelper.js',
			'/js/main.js',
			'/js/restaurant_info.js',
			'/restaurant.html',
		]))
		.catch(err => console.log(err))
	);
});

self.addEventListener('activate', event => {
	event.waitUntil(
		caches.keys()
		.then(cacheNames => Promise.all(
			cacheNames
			.filter(cacheName => {
				return cacheName.startsWith('restaurant-review-') && cacheName != staticCacheName;
			})
			.map(cacheName => caches.delete(cacheName))
		))
		.catch(err => console.log(err))
	);
});

self.addEventListener('fetch', event => {
	event.respondWith(
		caches.match(event.request)
		.then(response => response || fetch(event.request))
		.catch(err => console.log(err))
	);
});

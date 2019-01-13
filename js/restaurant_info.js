let restaurant;
var newMap;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
	initMap();
});

/**
 * Initialize leaflet map
 */
initMap = () => {
	fetchRestaurantFromURL((error, restaurant) => {
		if (error) { // Got an error!
			console.error(error);
		} else {
			self.newMap = L.map('map', {
				center: [restaurant.latlng.lat, restaurant.latlng.lng],
				zoom: 16,
				scrollWheelZoom: false
			});

			L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
				mapboxToken: 'pk.eyJ1IjoiZG91Z2xhc2FtYXJlbG8iLCJhIjoiY2pxbDBnNDQ2MHVtZjQzbTAybnBrcnJodCJ9.7s9Fq-U7prLeEYtrAPOlrw',
				maxZoom: 18,
				attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
					'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
					'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
				id: 'mapbox.streets'
			}).addTo(newMap);

			fillBreadcrumb();

			DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
		}
	});
}

/* window.initMap = () => {
	fetchRestaurantFromURL((error, restaurant) => {
		if (error) { // Got an error!
			console.error(error);
		} else {
			self.map = new google.maps.Map(document.querySelector('map'), {
				zoom: 16,
				center: restaurant.latlng,
				scrollwheel: false
			});
			fillBreadcrumb();
			DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
		}
	});
} */

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
	if (self.restaurant) { // restaurant already fetched!
		callback(null, self.restaurant)
		return;
	}
	const id = getParameterByName('id');

	if (!id) { // no id found in URL
		error = 'No restaurant id in URL'
		callback(error, null);
	} else {
		DBHelper.fetchRestaurantById(id, (error, restaurant) => {
			self.restaurant = restaurant;

			if (!restaurant) {
				console.error(error);
				return;
			}

			fillRestaurantHTML();
			callback(null, restaurant)
		});
	}
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
	const restaurantContainer = document.querySelector('.restaurant-container');
	let { name, cuisine_type, address } = restaurant;

	let template = `
		<h1 class="restaurant-name">${name}</h1>
		<img class="restaurant-img" alt="${name}" src="${DBHelper.imageUrlForRestaurant(restaurant)}" />
		<p class="restaurant-cuisine">${cuisine_type}</p>
		<p class="restaurant-address">${address}</p>
		<table class="restaurant-hours"></table>
	`;

	restaurantContainer.insertAdjacentHTML('beforeend', template);

	// fill operating hours
	if (restaurant.operating_hours) {
		fillRestaurantHoursHTML();
	}

	// fill reviews
	fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
	const hours = document.querySelector('.restaurant-hours');

	for (let key in operatingHours) {
		let template = `
			<tr>
				<td>${key}</td>
				<td>${operatingHours[key]}</td>
			</tr>
		`;

		hours.insertAdjacentHTML('beforeend', template);
	}
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
	const container = document.querySelector('.reviews-container');
	const ul        = document.querySelector('.reviews-list');

	if (!reviews) {
		container.insertAdjacentHTML('beforeend', `<p>No reviews yet!</p>`);
		return;
	}

	reviews.forEach(review => {
		ul.insertAdjacentHTML('beforeend', createReviewHTML(review));
	});

	container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
	let {name, date, rating, comments} = review;
	let template = `
		<li class="reviews-list__item">
			<div class="reviews-list__head">
				<p class="reviews-list__name">${name}</p>
				<p class="reviews-list__date">${date}</p>
			</div>
			<p class="reviews-list__rating">Rating: ${rating}</p>
			<p class="reviews-list__comments">${comments}</p>
		</li>
	`;

	return template;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
	const breadcrumb = document.querySelector('.breadcrumb');
	const li         = document.createElement('li');

	li.classList.add('breadcrumb__item');
	li.innerHTML = restaurant.name;
	breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
	if (!url)
		url = window.location.href;
	name = name.replace(/[\[\]]/g, '\\$&');

	const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
		results = regex.exec(url);

	if (!results)
		return null;

	if (!results[2])
		return '';

	return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

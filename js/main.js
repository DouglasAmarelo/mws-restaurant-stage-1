let restaurants;
let neighborhoods;
let cuisines;
var newMap;
var markers = [];

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
	initMap(); // added
	fetchNeighborhoods();
	fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
	DBHelper.fetchNeighborhoods((error, neighborhoods) => {
		if (error) { // Got an error
			console.error(error);
		} else {
			self.neighborhoods = neighborhoods;
			fillNeighborhoodsHTML();
		}
	});
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
	const select = document.getElementById('neighborhoods-select');

	neighborhoods.forEach(neighborhood => {
		const option = document.createElement('option');
		option.innerHTML = neighborhood;
		option.value = neighborhood;
		select.append(option);
	});
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
	DBHelper.fetchCuisines((error, cuisines) => {
		if (error) { // Got an error!
			console.error(error);
		} else {
			self.cuisines = cuisines;
			fillCuisinesHTML();
		}
	});
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
	const select = document.getElementById('cuisines-select');

	cuisines.forEach(cuisine => {
		const option = document.createElement('option');
		option.innerHTML = cuisine;
		option.value = cuisine;
		select.append(option);
	});
}

/**
 * Initialize leaflet map, called from HTML.
 */
initMap = () => {
	self.newMap = L.map('map', {
		center: [40.722216, -73.987501],
		zoom: 12,
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

	updateRestaurants();
}
/* window.initMap = () => {
  let loc = {
	lat: 40.722216,
	lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
	zoom: 12,
	center: loc,
	scrollwheel: false
  });
  updateRestaurants();
} */

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
	const cSelect      = document.getElementById('cuisines-select');
	const nSelect      = document.getElementById('neighborhoods-select');
	const cIndex       = cSelect.selectedIndex;
	const nIndex       = nSelect.selectedIndex;
	const cuisine      = cSelect[cIndex].value;
	const neighborhood = nSelect[nIndex].value;

	DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
		if (error) { // Got an error!
			console.error(error);
		} else {
			resetRestaurants(restaurants);
			fillRestaurantsHTML();
		}
	})
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
	// Remove all restaurants
	self.restaurants = [];

	const ul = document.querySelector('.restaurants-list');
	ul.innerHTML = '';

	// Remove all map markers
	if (self.markers) {
		self.markers.forEach(marker => marker.remove());
	}

	self.markers = [];
	self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
	const ul = document.querySelector('.restaurants-list');

	restaurants.forEach(restaurant => {
		ul.insertAdjacentHTML('beforeend', createRestaurantHTML(restaurant));
	});

	addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
	let { name, neighborhood, address } = restaurant;
	let image = DBHelper.imageUrlForRestaurant(restaurant);
	let link = DBHelper.urlForRestaurant(restaurant);

	let template = `
		<li class="restaurants-list__item">
			<img class="restaurants-list__image restaurant-img" alt="${name}" src="${image}">
			<h1 class="restaurants-list__name">${name}</h1>
			<div class="restaurants-list__description">
				<p>${neighborhood}</p>
				<p>${address}</p>
			</div>
			<a class="restaurants-list__link" href="${link}">View Details</a>
		</li>
	`;

	return template;
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
	// Add marker to the map
	const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
	marker.on("click", onClick);
	function onClick() {
	  window.location.href = marker.options.url;
	}
	self.markers.push(marker);
  });

}
/* addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
	// Add marker to the map
	const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
	google.maps.event.addListener(marker, 'click', () => {
	  window.location.href = marker.url
	});
	self.markers.push(marker);
  });
} */


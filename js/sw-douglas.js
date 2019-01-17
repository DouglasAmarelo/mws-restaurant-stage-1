(function() {
	console.log('Starting...');

	if (!navigator.serviceWorker) return;

	var indexController = this;

	navigator.serviceWorker.register('/js/sw-douglas.js').then(function(reg) {
		if (!navigator.serviceWorker.controller) {
			return;
		}

		if (reg.waiting) {
			console.log('indexController._updateReady(reg.waiting)', reg.waiting);
			return;
		}

		if (reg.installing) {
			console.log('indexController._trackInstalling(reg.installing)', reg.installing);
			return;
		}

		reg.addEventListener('updatefound', function() {
			console.log('indexController._trackInstalling(reg.installing)', reg.installing);
		});
	});

	// Ensure refresh is only called once.
	// This works around a bug in "force update on reload".
	var refreshing;
	navigator.serviceWorker.addEventListener('controllerchange', function() {
		if (refreshing) return;
		window.location.reload();
		refreshing = true;
	});
})();

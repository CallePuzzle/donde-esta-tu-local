self.addEventListener('install', (event) => {
	console.log('Installed SW');
});

self.addEventListener('activate', (event) => {
	console.log('Activated SW');
});

self.addEventListener('fetch', (event) => {
	console.log('Fetch:', event.request);
});

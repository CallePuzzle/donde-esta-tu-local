<script lang="ts">
	import { onMount } from 'svelte';
	import { getMessaging, getToken, onMessage } from 'firebase/messaging';
	import { app as firebaseApp } from '$lib/firebase';
	import toast from 'svelte-french-toast';

	import type { Messaging } from 'firebase/messaging';

	// token will store the Firebase Cloud Messaging token
	let token: string | null = null;

	// messages will hold the array of messages received
	let messages: any;

	onMount(async () => {
		const messaging: Messaging = getMessaging(firebaseApp);

		// Listen for messages when the app is open
		onMessage(messaging, (payload) => {
			// Add the new message to the messages array
			messages.push(payload);

			// Display the message content as a toast notification
			toast.success(`${payload.notification?.title}: ${payload.notification?.body}`);
		});
		// Request permission for notifications
		Notification.requestPermission().then((permission) => {
			if (permission === 'granted') {
				// Permission granted: Get the token
				getToken(messaging, {
					vapidKey:
						'BEf4A6EthDRvAa6FPnqcewgaoP5cC6C4_BTIIvyD1FeIQxiwK4tuv4pAjQ4DkvIexwULHzxO4v0I0kWulYkCv4Y'
				})
					.then((fetchedToken) => {
						// Store the received token
						token = fetchedToken;
						console.log('Token:', token);
					})
					.catch((error) => {
						// Handle any errors in fetching the token
						console.error('Error fetching token:', error);
					});
			}
		});
	});
</script>

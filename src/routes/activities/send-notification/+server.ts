import { logger } from '$lib/logger';
import prisma from '$lib/server/db';
import webpush from '$lib/server/web-push';
import type { PushSubscription } from 'web-push';

export async function GET(): Promise<Response> {
	try {
		// Get current time and time in 1 hour
		const now = new Date();
		const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000); // Add 1 hour in milliseconds

		// Create a time window (e.g., 5 minutes) to account for slight variations
		const startWindow = now;
		const endWindow = oneHourFromNow;

		logger.info('Checking for activities starting around:', {
			startWindow: startWindow.toISOString(),
			endWindow: endWindow.toISOString()
		});

		// Find activities that start within the time window
		const upcomingActivities = await prisma.activity.findMany({
			where: {
				notificationDate: {
					lte: new Date()
				},
				hasBeenNotified: false
			},
			include: {
				placeGang: true // Include place information for the notification
			}
		});

		if (upcomingActivities.length === 0) {
			logger.info('No activities starting in approximately 1 hour');
			return new Response(
				JSON.stringify({
					message: 'No activities starting in approximately 1 hour',
					checked: true
				}),
				{
					status: 200,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		}

		logger.info(`Found ${upcomingActivities.length} activities starting soon`);

		// Find all users with push subscriptions
		const usersWithSubscriptions = await prisma.user.findMany({
			where: {
				subscription: {
					not: null
				}
			},
			select: {
				id: true,
				subscription: true,
				name: true
			}
		});

		if (usersWithSubscriptions.length === 0) {
			logger.info('No users with push subscriptions found');
			return new Response(
				JSON.stringify({
					message: 'No users with push subscriptions found',
					activitiesFound: upcomingActivities.length
				}),
				{
					status: 200,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		}

		logger.info(`Found ${usersWithSubscriptions.length} users with subscriptions`);

		// Send notifications for each activity to all subscribed users
		const notificationPromises: Promise<any>[] = [];
		let successCount = 0;
		let failCount = 0;

		for (const activity of upcomingActivities) {
			const notificationPayload = {
				title: '¡Actividad próxima!',
				body: `La actividad "${activity.name}" en ${activity.place?.name || 'ubicación no especificada'} comenzará en aproximadamente 1 hora.`,
				icon: '/icon-192x192.png',
				badge: '/icon-192x192.png',
				tag: `activity-reminder-${activity.id}`,
				data: {
					activityId: activity.id,
					activityName: activity.name,
					placeName: activity.place?.name,
					startTime: activity.date.toISOString(),
					url: `/activities/${activity.id}`
				}
			};

			for (const user of usersWithSubscriptions) {
				if (!user.subscription) continue;

				try {
					// Parse the subscription from JSON string if needed
					const subscription: PushSubscription =
						typeof user.subscription === 'string'
							? JSON.parse(user.subscription)
							: (user.subscription as any);

					const promise = webpush
						.sendNotification(subscription, JSON.stringify(notificationPayload))
						.then(() => {
							successCount++;
							logger.info(
								`Notification sent successfully to user ${user.id} for activity ${activity.id}`
							);
						})
						.catch((error) => {
							failCount++;
							logger.error(`Failed to send notification to user ${user.id}:`, error);

							// If subscription is invalid (410 Gone), remove it from the database
							if (error.statusCode === 410) {
								logger.info(`Removing invalid subscription for user ${user.id}`);
								return prisma.user.update({
									where: { id: user.id },
									data: { subscription: null }
								});
							}
						});

					notificationPromises.push(promise);
				} catch (error) {
					failCount++;
					logger.error(`Error processing subscription for user ${user.id}:`, error);
				}
			}
		}

		// Wait for all notifications to be sent
		await Promise.allSettled(notificationPromises);

		const response = {
			message: 'Notification process completed',
			activities: upcomingActivities.length,
			usersNotified: usersWithSubscriptions.length,
			notificationsSent: successCount,
			notificationsFailed: failCount,
			timestamp: now.toISOString()
		};

		logger.info('Notification process completed:', response);

		return new Response(JSON.stringify(response), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		logger.error('Error in send-notification endpoint:', error);

		return new Response(
			JSON.stringify({
				error: 'Internal server error',
				message: error instanceof Error ? error.message : 'Unknown error'
			}),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}
}

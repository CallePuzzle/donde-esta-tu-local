import { env } from '$env/dynamic/private';
import webpush from 'web-push';

webpush.setVapidDetails(env.VAPID_SUBJECT, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);

export { webpush };
export type { PushSubscription } from 'web-push';

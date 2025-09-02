import { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, SMPT_SENDER } from '$env/static/private';
import webpush from 'web-push';

webpush.setVapidDetails('mailto:' + SMPT_SENDER, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

export default webpush;

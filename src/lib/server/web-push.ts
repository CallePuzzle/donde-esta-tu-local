import { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY } from '$env/static/private';
import webpush from 'web-push';

webpush.setVapidDetails('mailto:app@montemayordepililla.cc', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

export default webpush;

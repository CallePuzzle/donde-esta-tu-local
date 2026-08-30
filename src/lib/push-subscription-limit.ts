// Compartido entre servidor (push-subscription.ts, que lo aplica) y cliente
// (NotificationToggle.svelte, que lo muestra en el modal de límite) para que
// no puedan desincronizarse.
export const MAX_PUSH_SUBSCRIPTIONS_PER_USER = 10;

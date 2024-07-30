import { writable } from 'svelte/store';

import type { Auth0Tokens as Auth0TokensType } from 'arctic';

export const Auth0Tokens = writable<Auth0TokensType>();

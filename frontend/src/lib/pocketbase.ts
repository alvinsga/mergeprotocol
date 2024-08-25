import PocketBase from 'pocketbase';
import { writable } from 'svelte/store';

interface AuthStore {
	isLoggedIn: boolean;
	userId: string;
}

export const pb = new PocketBase('https://apprehensive-bed.pockethost.io');
// create store for auth
export const authStore = writable<AuthStore>({ isLoggedIn: false, userId: '' });

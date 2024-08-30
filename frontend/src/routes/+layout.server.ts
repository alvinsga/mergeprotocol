import type { AuthModel } from 'pocketbase';
import type { LayoutServerLoad } from './$types';

export type OutputType = { user: AuthModel; isLoggedIn: boolean };

export const load: LayoutServerLoad<OutputType> = async ({ locals, url }) => {
	console.log(locals.user);
	return {
		user: locals.user,
		isLoggedIn: locals.pb?.authStore.isValid ? true : false,
		url: url.pathname
	};
};

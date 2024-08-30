import type { Handle } from '@sveltejs/kit';
import PocketBase from 'pocketbase';

export const handle: Handle = async ({ event, resolve }) => {
	const isProd = import.meta.env.PROD;
	event.locals.pb = new PocketBase('https://apprehensive-bed.pockethost.io');

	event.locals.pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');
	if (event.locals.pb.authStore.isValid) {
		try {
			// await event.locals.pb.collection('users').authRefresh();
			event.locals.user = structuredClone(event.locals.pb.authStore.model);
		} catch (error) {
			// event.locals.pb.authStore.clear();
			event.locals.user = null;
			throw error;
		}
	}
	// Anything we are doing on the server will happen here
	const response = await resolve(event);
	response.headers.set(
		'set-cookie',
		event.locals.pb.authStore.exportToCookie({ httpOnly: false, sameSite: 'Lax', secure: isProd })
	);

	return response;
};

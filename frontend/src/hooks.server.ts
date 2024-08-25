import { pb } from '$lib/pocketbase';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const isProd = import.meta.env.PROD;
	pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');
	if (pb.authStore.isValid) {
		try {
			await pb.collection('users').authRefresh();
		} catch (error) {
			pb.authStore.clear();
			throw error;
		}
	}
	event.locals.pb = pb;
	event.locals.user = structuredClone(event.locals.pb.authStore.model);
	// Anything we are doing on the server will happen here
	const response = await resolve(event);
	response.headers.set(
		'set-cookie',
		pb.authStore.exportToCookie({ httpOnly: false, sameSite: 'Lax', secure: isProd })
	);

	return response;
};

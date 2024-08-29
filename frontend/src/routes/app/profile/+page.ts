import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { isLoggedIn } = await parent();

	if (!isLoggedIn) {
		throw redirect(302, '/app');
	}

	return {};
};
